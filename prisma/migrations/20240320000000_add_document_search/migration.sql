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
    IF TG_TABLE_NAME = 'Document' THEN
        SELECT string_agg(content, ' ')
        INTO artifact_text
        FROM "DocumentArtifact"
        WHERE "documentId" = NEW.id;

        NEW."search_vector" = to_tsvector('english', 
            CONCAT_WS(' ',
                COALESCE(NEW.title, ''),
                COALESCE(NEW.signer, ''),
                COALESCE(NEW."shortSummary", ''),
                COALESCE(NEW.type::text, ''),
                COALESCE(artifact_text, '')
            ));
    ELSE
        SELECT string_agg(content, ' ')
        INTO artifact_text
        FROM "DocumentArtifact"
        WHERE "documentId" = NEW."documentId";

        UPDATE "Document"
        SET "search_vector" = to_tsvector('english', 
            CONCAT_WS(' ',
                title,
                signer,
                "shortSummary",
                type::text,
                COALESCE(artifact_text, '')
            ))
        WHERE id = NEW."documentId";
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- CreateTrigger
DROP TRIGGER IF EXISTS update_doc_search_tsv ON "Document";
CREATE TRIGGER update_doc_search_tsv
    BEFORE INSERT OR UPDATE
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
        title,
        signer,
        "shortSummary",
        type::text,
        COALESCE((
            SELECT string_agg(content, ' ')
            FROM "DocumentArtifact"
            WHERE "documentId" = "Document".id
        ), '')
    )); 