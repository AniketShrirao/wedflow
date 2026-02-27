-- Migration script to move photos from photo_collections.categories to images table
-- This migration:
-- 1. Creates upload sessions for migrated photos with source 'legacy'
-- 2. Extracts photos from JSONB categories and creates image records
-- 3. Maintains referential integrity
-- 4. Verifies data integrity after migration

-- Step 1: Create upload sessions for each couple with legacy photos
-- This creates one upload session per couple for all their legacy photos
INSERT INTO uploads (couple_id, uploader_name, uploader_email, upload_source, status, google_drive_folder_path, created_at, updated_at)
SELECT 
    pc.couple_id,
    'Legacy Import' as uploader_name,
    NULL as uploader_email,
    'legacy' as upload_source,
    'completed' as status,
    pc.drive_folder_url as google_drive_folder_path,
    pc.updated_at as created_at,
    pc.updated_at as updated_at
FROM photo_collections pc
WHERE pc.categories IS NOT NULL 
  AND pc.categories != '[]'::jsonb
  AND NOT EXISTS (
    SELECT 1 FROM uploads u 
    WHERE u.couple_id = pc.couple_id 
    AND u.upload_source = 'legacy'
  )
ON CONFLICT DO NOTHING;

-- Step 2: Extract photos from JSONB and create image records
-- This processes each photo in the categories JSONB array
INSERT INTO images (upload_id, couple_id, filename, google_drive_file_id, public_url, category, folder, is_highlighted, created_at, updated_at)
SELECT 
    u.id as upload_id,
    pc.couple_id,
    COALESCE(photo->>'filename', 'photo_' || gen_random_uuid()::text) as filename,
    photo->>'google_drive_file_id' as google_drive_file_id,
    photo->>'public_url' as public_url,
    COALESCE(photo->>'category', 'Wedding') as category,
    COALESCE(photo->>'folder', photo->>'category', 'Wedding') as folder,
    COALESCE((photo->>'is_highlighted')::boolean, false) as is_highlighted,
    COALESCE((photo->>'created_at')::timestamp with time zone, pc.updated_at) as created_at,
    COALESCE((photo->>'updated_at')::timestamp with time zone, pc.updated_at) as updated_at
FROM photo_collections pc
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(pc.categories, '[]'::jsonb)) AS photo
JOIN uploads u ON u.couple_id = pc.couple_id AND u.upload_source = 'legacy'
WHERE pc.categories IS NOT NULL 
  AND pc.categories != '[]'::jsonb
  AND photo IS NOT NULL
ON CONFLICT DO NOTHING;

-- Step 3: Verify migration integrity
-- Create a temporary table to store migration statistics
CREATE TEMP TABLE migration_stats AS
SELECT 
    pc.couple_id,
    COUNT(DISTINCT pc.id) as photo_collection_count,
    COALESCE(jsonb_array_length(pc.categories), 0) as legacy_photo_count,
    COUNT(DISTINCT i.id) as migrated_image_count,
    COUNT(DISTINCT u.id) as upload_session_count
FROM photo_collections pc
LEFT JOIN uploads u ON u.couple_id = pc.couple_id AND u.upload_source = 'legacy'
LEFT JOIN images i ON i.upload_id = u.id
WHERE pc.categories IS NOT NULL AND pc.categories != '[]'::jsonb
GROUP BY pc.couple_id, pc.categories;

-- Step 4: Log migration results (optional - can be queried for verification)
-- This helps verify that all photos were migrated correctly
-- Query this to verify: SELECT * FROM migration_stats WHERE legacy_photo_count != migrated_image_count;

-- Step 5: Create default folders for couples that had legacy photos
-- This ensures couples have the standard folder structure
INSERT INTO folders (couple_id, folder_name, folder_type, google_drive_folder_id, created_at, updated_at)
SELECT DISTINCT
    pc.couple_id,
    category_name,
    'default' as folder_type,
    NULL as google_drive_folder_id,
    NOW() as created_at,
    NOW() as updated_at
FROM photo_collections pc
CROSS JOIN (VALUES ('Haldi'), ('Sangeet'), ('Wedding'), ('Reception')) AS categories(category_name)
WHERE pc.categories IS NOT NULL 
  AND pc.categories != '[]'::jsonb
  AND NOT EXISTS (
    SELECT 1 FROM folders f 
    WHERE f.couple_id = pc.couple_id 
    AND f.folder_name = category_name
  )
ON CONFLICT DO NOTHING;

-- Step 6: Verify referential integrity
-- Ensure all images have valid upload_id references
-- This query should return 0 rows if integrity is maintained:
-- SELECT COUNT(*) FROM images WHERE upload_id NOT IN (SELECT id FROM uploads);

-- Step 7: Verify highlight photos migration
-- Migrate highlight_photos from photo_collections to images table
UPDATE images i
SET is_highlighted = true
FROM photo_collections pc
WHERE i.couple_id = pc.couple_id
  AND i.upload_id IN (
    SELECT id FROM uploads u 
    WHERE u.couple_id = pc.couple_id 
    AND u.upload_source = 'legacy'
  )
  AND EXISTS (
    SELECT 1 FROM jsonb_array_elements(COALESCE(pc.highlight_photos, '[]'::jsonb)) AS highlight
    WHERE highlight->>'filename' = i.filename
      OR highlight->>'google_drive_file_id' = i.google_drive_file_id
  );

-- Step 8: Final verification - count migrated data
-- This can be queried to verify migration success:
-- SELECT 
--   COUNT(DISTINCT u.couple_id) as couples_with_legacy_uploads,
--   COUNT(DISTINCT u.id) as total_legacy_uploads,
--   COUNT(DISTINCT i.id) as total_migrated_images,
--   COUNT(DISTINCT CASE WHEN i.is_highlighted THEN i.id END) as highlighted_images
-- FROM uploads u
-- LEFT JOIN images i ON i.upload_id = u.id
-- WHERE u.upload_source = 'legacy';
