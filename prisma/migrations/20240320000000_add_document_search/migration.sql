-- CreateExtension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- AlterTable
ALTER TABLE "Document" ADD COLUMN "search_vector" tsvector;

-- CreateFunction
CREATE OR REPLACE FUNCTION update_document_search_vector() 
RETURNS TRIGGER AS $$
DECLARE
    artifact_text TEXT;
BEGIN
    -- Get concatenated text from all artifacts for this document
    SELECT string_agg(content, ' ')
    INTO artifact_text
    FROM "DocumentArtifact"
    WHERE "documentId" = 
        CASE 
            WHEN TG_TABLE_NAME = 'Document' THEN NEW.id
            WHEN TG_TABLE_NAME = 'DocumentArtifact' THEN NEW."documentId"
        END;

    -- Update the document's search vector
    UPDATE "Document"
    SET "search_vector" = to_tsvector('english', 
        CONCAT_WS(' ',
            COALESCE(
                CASE 
                    WHEN TG_TABLE_NAME = 'Document' THEN NEW.title
                    ELSE (SELECT title FROM "Document" WHERE id = NEW."documentId")
                END, 
            ''),
            COALESCE(
                CASE 
                    WHEN TG_TABLE_NAME = 'Document' THEN NEW.signer
                    ELSE (SELECT signer FROM "Document" WHERE id = NEW."documentId")
                END, 
            ''),
            COALESCE(
                CASE 
                    WHEN TG_TABLE_NAME = 'Document' THEN NEW."shortSummary"
                    ELSE (SELECT "shortSummary" FROM "Document" WHERE id = NEW."documentId")
                END, 
            ''),
            COALESCE(artifact_text, '')
        ))
    WHERE id = 
        CASE 
            WHEN TG_TABLE_NAME = 'Document' THEN NEW.id
            WHEN TG_TABLE_NAME = 'DocumentArtifact' THEN NEW."documentId"
        END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- CreateTrigger
DROP TRIGGER IF EXISTS update_doc_search_tsv ON "Document";
CREATE TRIGGER update_doc_search_tsv
    AFTER INSERT OR UPDATE OF title, signer, "shortSummary"
    ON "Document"
    FOR EACH ROW
    EXECUTE FUNCTION update_document_search_vector();

DROP TRIGGER IF EXISTS update_doc_search_tsv_artifact ON "DocumentArtifact";
CREATE TRIGGER update_doc_search_tsv_artifact
    AFTER INSERT OR UPDATE OF content
    ON "DocumentArtifact"
    FOR EACH ROW
    EXECUTE FUNCTION update_document_search_vector();

-- CreateIndex
CREATE INDEX "Document_search_idx" ON "Document" USING GIN ("search_vector");

-- Populate existing data
UPDATE "Document" SET "search_vector" = to_tsvector('english', 
    CONCAT_WS(' ',
        COALESCE(title, ''),
        COALESCE(signer, ''),
        COALESCE("shortSummary", ''),
        COALESCE((
            SELECT string_agg(content, ' ')
            FROM "DocumentArtifact"
            WHERE "documentId" = "Document".id
        ), '')
    )); 