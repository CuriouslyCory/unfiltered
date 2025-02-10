-- Create function to update parent document's timestamp
CREATE OR REPLACE FUNCTION update_document_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "Document"
    SET "updatedAt" = NOW()
    WHERE id = NEW."documentId";
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for insert/update on DocumentArtifact
DROP TRIGGER IF EXISTS update_document_timestamp ON "DocumentArtifact";
CREATE TRIGGER update_document_timestamp
    AFTER INSERT OR UPDATE
    ON "DocumentArtifact"
    FOR EACH ROW
    EXECUTE FUNCTION update_document_timestamp(); 