-- Drop the legacy photo_collections table
-- All photo data has been migrated to the images table
-- This table is no longer needed

DROP TABLE IF EXISTS photo_collections CASCADE;
