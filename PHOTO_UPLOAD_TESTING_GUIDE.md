# Photo Upload Testing Guide

This guide walks you through clearing the database and testing the complete photo upload flow with the new photo management system.

## Prerequisites

- Supabase project set up and running
- Google Drive API credentials configured
- Application running locally or deployed

## Step 1: Clear the Database

### Option A: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the following SQL to clear all photo-related data:

```sql
-- Clear all photo-related tables
DELETE FROM images;
DELETE FROM uploads;
DELETE FROM folders;
DELETE FROM photo_collections;

-- Reset sequences if needed
ALTER SEQUENCE IF EXISTS images_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS uploads_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS folders_id_seq RESTART WITH 1;
```

### Option B: Using Supabase CLI

```bash
# Reset the database to initial state
supabase db reset

# Or manually run migrations
supabase migration up
```

## Step 2: Verify Database Schema

After clearing, verify the new schema is in place:

```sql
-- Check uploads table exists
SELECT * FROM uploads LIMIT 0;

-- Check images table exists
SELECT * FROM images LIMIT 0;

-- Check folders table exists
SELECT * FROM folders LIMIT 0;

-- Verify RLS policies are enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('uploads', 'images', 'folders');
```

## Step 3: Initialize Default Folders (Optional)

You can pre-populate default folders for your couple:

```sql
-- Insert default folders for a couple
INSERT INTO folders (couple_id, folder_name, folder_type, created_at, updated_at)
VALUES
  ('YOUR_COUPLE_ID', 'Haldi', 'default', NOW(), NOW()),
  ('YOUR_COUPLE_ID', 'Sangeet', 'default', NOW(), NOW()),
  ('YOUR_COUPLE_ID', 'Wedding', 'default', NOW(), NOW()),
  ('YOUR_COUPLE_ID', 'Reception', 'default', NOW(), NOW())
ON CONFLICT DO NOTHING;
```

## Step 4: Test the Upload Flow

### 4.1 Access the Dashboard

1. Log in to your application
2. Navigate to the Photos section in the dashboard
3. You should see the **Upload Manager** component

### 4.2 Connect Google Drive

1. Click **"Connect Google Drive"** button
2. Authenticate with your Google account
3. Grant permissions to access Google Drive
4. You should see **"Connected to Google Drive"** status

### 4.3 Select Photos

1. Choose a **Photo Category** (Haldi, Sangeet, Wedding, or Reception)
2. Click **"Select Images"** or drag and drop photos
3. You can select multiple images or a ZIP file
4. Selected files appear in the **"Selected Files"** section

### 4.4 Upload Photos

1. Click **"Upload X file(s)"** button
2. Monitor the **Upload Progress** section
3. Each file shows:
   - Filename
   - Progress percentage
   - Status (uploading, completed, error)
4. Successful uploads show a ✓ checkmark

### 4.5 Verify Upload in Database

After upload completes, verify the data:

```sql
-- Check uploads table
SELECT id, couple_id, uploader_name, upload_source, status, created_at
FROM uploads
ORDER BY created_at DESC
LIMIT 5;

-- Check images table
SELECT id, upload_id, filename, category, folder, is_highlighted, created_at
FROM images
ORDER BY created_at DESC
LIMIT 10;

-- Count images by category
SELECT category, COUNT(*) as count
FROM images
GROUP BY category;

-- Check highlighted images
SELECT COUNT(*) as highlighted_count
FROM images
WHERE is_highlighted = true;
```

## Step 5: Test Image Gallery

### 5.1 View All Images

1. Navigate to the **Image Gallery** component
2. You should see all uploaded images
3. Filter by **Category** to see images from specific events
4. Filter by **Folder** to see images from specific folders

### 5.2 Mark Images as Highlighted

1. In the Image Gallery, select images to highlight
2. Click **"Mark as Highlighted"** button
3. Selected images should show a highlight indicator
4. Verify in database:

```sql
SELECT COUNT(*) as highlighted_count
FROM images
WHERE is_highlighted = true;
```

### 5.3 View Highlighted Images

1. Navigate to the **Photo Gallery Section** (public site preview)
2. You should see only highlighted images
3. Images should be organized by category
4. Verify with query:

```sql
SELECT category, COUNT(*) as count
FROM images
WHERE is_highlighted = true
GROUP BY category;
```

## Step 6: Test Folder Management

### 6.1 View Default Folders

1. Navigate to the **Folder Manager** component
2. You should see default folders:
   - Haldi
   - Sangeet
   - Wedding
   - Reception

### 6.2 Create Custom Folder

1. Click **"Create Custom Folder"** button
2. Enter a folder name (e.g., "Engagement", "Mehendi")
3. Click **"Create"**
4. New folder should appear in the list
5. Verify in database:

```sql
SELECT folder_name, folder_type
FROM folders
WHERE couple_id = 'YOUR_COUPLE_ID'
ORDER BY folder_type DESC, folder_name;
```

### 6.3 Assign Images to Folders

1. In Image Gallery, select images
2. Choose a folder from the dropdown
3. Click **"Assign to Folder"**
4. Images should be updated with new folder
5. Verify with query:

```sql
SELECT folder, COUNT(*) as count
FROM images
GROUP BY folder;
```

## Step 7: Test Upload History

### 7.1 View Upload Sessions

1. Navigate to the **Upload History** component
2. You should see all upload sessions with:
   - Uploader name
   - Upload date
   - Number of images
   - Upload source (dashboard, public_site, legacy)

### 7.2 View Images from Specific Upload

1. Click on an upload session
2. You should see all images from that upload
3. Verify with query:

```sql
SELECT u.id, u.uploader_name, u.upload_source, COUNT(i.id) as image_count
FROM uploads u
LEFT JOIN images i ON i.upload_id = u.id
GROUP BY u.id, u.uploader_name, u.upload_source
ORDER BY u.created_at DESC;
```

## Step 8: Test Public Site Upload

### 8.1 Access Public Wedding Site

1. Navigate to the public wedding site (e.g., `/[couple-slug]`)
2. Scroll to the **Photo Upload Section**
3. You should see the upload interface

### 8.2 Upload as Guest

1. Enter your name and email
2. Select photos
3. Click **"Upload"**
4. Verify upload source is set to `'public_site'`:

```sql
SELECT uploader_name, uploader_email, upload_source, COUNT(*) as count
FROM uploads
WHERE upload_source = 'public_site'
GROUP BY uploader_name, uploader_email, upload_source;
```

## Step 9: Test Public Photo Gallery

### 9.1 View Highlighted Photos

1. On the public wedding site, scroll to **Photo Gallery Section**
2. You should see only highlighted images
3. Images should be organized by category
4. Verify with API call:

```bash
curl "http://localhost:3000/api/public/[couple-slug]/photos/highlighted"
```

Expected response:

```json
{
  "success": true,
  "images": [
    {
      "id": "...",
      "filename": "...",
      "category": "Wedding",
      "public_url": "...",
      "is_highlighted": true
    }
  ]
}
```

## Step 10: Verify Data Integrity

Run these queries to ensure data integrity:

### Check for orphaned images

```sql
SELECT COUNT(*) as orphaned_images
FROM images
WHERE upload_id NOT IN (SELECT id FROM uploads);
```

Expected: 0

### Check for missing couples

```sql
SELECT COUNT(*) as invalid_images
FROM images
WHERE couple_id NOT IN (SELECT id FROM couples);
```

Expected: 0

### Check upload status

```sql
SELECT status, COUNT(*) as count
FROM uploads
GROUP BY status;
```

### Check category distribution

```sql
SELECT category, COUNT(*) as count
FROM images
GROUP BY category
ORDER BY count DESC;
```

### Check folder distribution

```sql
SELECT folder, COUNT(*) as count
FROM images
GROUP BY folder
ORDER BY count DESC;
```

## Troubleshooting

### Issue: Upload fails with "Google Drive not connected"

**Solution:**

1. Clear browser localStorage: `localStorage.clear()`
2. Refresh the page
3. Click "Connect Google Drive" again
4. Ensure Google API credentials are configured in `.env.local`

### Issue: Images not appearing in gallery

**Solution:**

1. Verify images were inserted in database:
   ```sql
   SELECT COUNT(*) FROM images;
   ```
2. Check if images have correct `couple_id`:
   ```sql
   SELECT DISTINCT couple_id FROM images;
   ```
3. Verify RLS policies allow access:
   ```sql
   SELECT * FROM images LIMIT 1;
   ```

### Issue: Highlighted images not showing on public site

**Solution:**

1. Verify images are marked as highlighted:
   ```sql
   SELECT COUNT(*) FROM images WHERE is_highlighted = true;
   ```
2. Check API endpoint response:
   ```bash
   curl "http://localhost:3000/api/public/[couple-slug]/photos/highlighted"
   ```
3. Verify couple slug is correct

### Issue: Folder creation fails

**Solution:**

1. Check Google Drive API permissions
2. Verify parent folder ID is correct
3. Check for duplicate folder names
4. Review browser console for error messages

## Performance Testing

### Test with large number of images

```sql
-- Insert test images (adjust count as needed)
INSERT INTO images (upload_id, couple_id, filename, google_drive_file_id, public_url, category, folder, is_highlighted)
SELECT
  u.id,
  u.couple_id,
  'test_image_' || generate_series(1, 100) || '.jpg',
  'file_' || generate_series(1, 100),
  'https://example.com/image_' || generate_series(1, 100) || '.jpg',
  CASE (generate_series(1, 100) % 4)
    WHEN 0 THEN 'Haldi'
    WHEN 1 THEN 'Sangeet'
    WHEN 2 THEN 'Wedding'
    ELSE 'Reception'
  END,
  CASE (generate_series(1, 100) % 4)
    WHEN 0 THEN 'Haldi'
    WHEN 1 THEN 'Sangeet'
    WHEN 2 THEN 'Wedding'
    ELSE 'Reception'
  END,
  (generate_series(1, 100) % 3) = 0
FROM uploads u
LIMIT 1;

-- Verify insertion
SELECT COUNT(*) FROM images;
```

## Next Steps

After successful testing:

1. **Update Upload Endpoint** - Modify `/api/photos/upload` to use new schema
2. **Update Components** - Ensure all components use PhotoService
3. **Run Full Test Suite** - Execute all tests to verify functionality
4. **Deploy to Staging** - Test in staging environment
5. **Monitor Performance** - Track query performance and optimize as needed

## Useful Queries

### Get complete upload summary

```sql
SELECT
  u.id as upload_id,
  u.couple_id,
  u.uploader_name,
  u.uploader_email,
  u.upload_source,
  u.status,
  u.created_at,
  COUNT(i.id) as image_count,
  COUNT(CASE WHEN i.is_highlighted THEN 1 END) as highlighted_count
FROM uploads u
LEFT JOIN images i ON i.upload_id = u.id
GROUP BY u.id, u.couple_id, u.uploader_name, u.uploader_email, u.upload_source, u.status, u.created_at
ORDER BY u.created_at DESC;
```

### Get images by couple with all details

```sql
SELECT
  i.id,
  i.filename,
  i.category,
  i.folder,
  i.is_highlighted,
  u.uploader_name,
  u.upload_source,
  i.created_at
FROM images i
JOIN uploads u ON i.upload_id = u.id
WHERE i.couple_id = 'YOUR_COUPLE_ID'
ORDER BY i.created_at DESC;
```

### Get folder statistics

```sql
SELECT
  f.folder_name,
  f.folder_type,
  COUNT(i.id) as image_count
FROM folders f
LEFT JOIN images i ON i.folder = f.folder_name AND i.couple_id = f.couple_id
WHERE f.couple_id = 'YOUR_COUPLE_ID'
GROUP BY f.id, f.folder_name, f.folder_type
ORDER BY f.folder_type DESC, f.folder_name;
```

## Support

For issues or questions:

1. Check the browser console for error messages
2. Review the database queries above
3. Check the application logs
4. Verify Google Drive API credentials
5. Ensure RLS policies are correctly configured
