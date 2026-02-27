-- Clear all photo-related data for fresh testing
-- This migration removes all data from the new photo management tables
-- while preserving the schema

-- Disable foreign key constraints temporarily
ALTER TABLE images DISABLE TRIGGER ALL;
ALTER TABLE uploads DISABLE TRIGGER ALL;
ALTER TABLE folders DISABLE TRIGGER ALL;

-- Clear all data
DELETE FROM images;
DELETE FROM uploads;
DELETE FROM folders;
DELETE FROM photo_collections;

-- Re-enable triggers
ALTER TABLE images ENABLE TRIGGER ALL;
ALTER TABLE uploads ENABLE TRIGGER ALL;
ALTER TABLE folders ENABLE TRIGGER ALL;

-- Reset auto-increment sequences if using them
-- Note: UUID sequences don't need resetting, but if you have serial columns:
-- ALTER SEQUENCE images_id_seq RESTART WITH 1;
-- ALTER SEQUENCE uploads_id_seq RESTART WITH 1;
-- ALTER SEQUENCE folders_id_seq RESTART WITH 1;

-- Verify tables are empty
-- SELECT COUNT(*) as images_count FROM images;
-- SELECT COUNT(*) as uploads_count FROM uploads;
-- SELECT COUNT(*) as folders_count FROM folders;
-- SELECT COUNT(*) as photo_collections_count FROM photo_collections;
