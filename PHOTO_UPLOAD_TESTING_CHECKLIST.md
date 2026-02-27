# Photo Upload Testing Checklist

Use this checklist to systematically test the photo management system.

## Pre-Testing Setup

- [ ] Database cleared using migration or SQL script
- [ ] Google Drive API credentials configured in `.env.local`
- [ ] Application running locally (`npm run dev`)
- [ ] Logged in to application with test account
- [ ] Couple profile created and configured
- [ ] Google Drive folder URL configured in photo settings

## Phase 1: Database Verification

- [ ] Verify `uploads` table exists and is empty
- [ ] Verify `images` table exists and is empty
- [ ] Verify `folders` table exists and is empty
- [ ] Verify RLS policies are enabled on all tables
- [ ] Verify foreign key constraints are in place
- [ ] Verify indexes are created for performance

**SQL to run:**

```sql
SELECT COUNT(*) FROM uploads;
SELECT COUNT(*) FROM images;
SELECT COUNT(*) FROM folders;
```

## Phase 2: Upload Manager Component

### 2.1 Initial Load

- [ ] Upload Manager component loads without errors
- [ ] "Connect Google Drive" button is visible
- [ ] No console errors on page load

### 2.2 Google Drive Authentication

- [ ] Click "Connect Google Drive" button
- [ ] Google authentication popup appears
- [ ] Successfully authenticate with Google account
- [ ] Status changes to "Connected to Google Drive"
- [ ] "Disconnect" button appears
- [ ] Browser localStorage contains Google Drive token

### 2.3 File Selection

- [ ] Category dropdown shows all 4 categories (Haldi, Sangeet, Wedding, Reception)
- [ ] Can select single image file
- [ ] Can select multiple image files
- [ ] Can select ZIP file
- [ ] Selected files appear in "Selected Files" section
- [ ] File size is displayed correctly
- [ ] Can remove individual files from selection
- [ ] Can clear all selected files

### 2.4 Upload Process

- [ ] Click "Upload X file(s)" button
- [ ] Upload progress appears for each file
- [ ] Progress bar shows upload percentage
- [ ] Files upload successfully to Google Drive
- [ ] Completion checkmark appears for each file
- [ ] Upload completes without errors
- [ ] Success toast notification appears

### 2.5 Error Handling

- [ ] Invalid file types are rejected
- [ ] Large files are handled appropriately
- [ ] Network errors are caught and displayed
- [ ] Google Drive API errors are handled gracefully
- [ ] Error messages are clear and actionable

## Phase 3: Database Verification After Upload

- [ ] Upload session created in `uploads` table
- [ ] Upload has correct `couple_id`
- [ ] Upload has correct `uploader_name`
- [ ] Upload has `upload_source = 'dashboard'`
- [ ] Upload has `status = 'completed'`
- [ ] Image records created in `images` table
- [ ] Each image has correct `upload_id`
- [ ] Each image has correct `couple_id`
- [ ] Each image has correct `filename`
- [ ] Each image has correct `google_drive_file_id`
- [ ] Each image has correct `category`
- [ ] Each image has correct `folder`
- [ ] Each image has `is_highlighted = false` initially

**SQL to run:**

```sql
SELECT * FROM uploads ORDER BY created_at DESC LIMIT 1;
SELECT * FROM images WHERE upload_id = 'UPLOAD_ID' ORDER BY created_at;
```

## Phase 4: Image Gallery Component

### 4.1 Display

- [ ] Image Gallery loads without errors
- [ ] All uploaded images are displayed
- [ ] Images show correct filename
- [ ] Images show correct category
- [ ] Images show correct folder
- [ ] Thumbnail images load correctly

### 4.2 Filtering

- [ ] Filter by category works correctly
- [ ] Filter by folder works correctly
- [ ] Combining filters works correctly
- [ ] Clearing filters shows all images again
- [ ] Filter results are accurate

### 4.3 Highlighting

- [ ] Can select images to highlight
- [ ] "Mark as Highlighted" button appears when images selected
- [ ] Click "Mark as Highlighted" updates images
- [ ] Highlighted images show visual indicator
- [ ] Highlighted status persists after page reload

**SQL to run:**

```sql
SELECT COUNT(*) as highlighted_count FROM images WHERE is_highlighted = true;
```

### 4.4 Bulk Operations

- [ ] Can select multiple images
- [ ] Can unselect individual images
- [ ] "Select All" button works
- [ ] "Deselect All" button works
- [ ] Bulk operations apply to all selected images

## Phase 5: Folder Management

### 5.1 Default Folders

- [ ] Folder Manager displays all default folders
- [ ] Shows Haldi folder
- [ ] Shows Sangeet folder
- [ ] Shows Wedding folder
- [ ] Shows Reception folder
- [ ] Folders marked as "default" type

### 5.2 Custom Folder Creation

- [ ] "Create Custom Folder" button is visible
- [ ] Can enter custom folder name
- [ ] Click "Create" creates new folder
- [ ] New folder appears in folder list
- [ ] New folder marked as "custom" type
- [ ] Folder creation success message appears

**SQL to run:**

```sql
SELECT folder_name, folder_type FROM folders ORDER BY folder_type DESC, folder_name;
```

### 5.3 Folder Assignment

- [ ] Can assign images to folders
- [ ] Images update with new folder value
- [ ] Folder assignment persists in database
- [ ] Can reassign images to different folders

## Phase 6: Upload History

### 6.1 Display

- [ ] Upload History component loads
- [ ] All upload sessions are displayed
- [ ] Shows uploader name
- [ ] Shows upload date
- [ ] Shows number of images
- [ ] Shows upload source

### 6.2 Details

- [ ] Can click on upload to see details
- [ ] Shows all images from that upload
- [ ] Images display correctly
- [ ] Can filter images by category

### 6.3 Sorting

- [ ] Can sort by date (newest first)
- [ ] Can sort by uploader name
- [ ] Can sort by image count

## Phase 7: Public Site Upload

### 7.1 Access

- [ ] Navigate to public wedding site
- [ ] Photo Upload Section is visible
- [ ] Upload interface is accessible without authentication

### 7.2 Guest Upload

- [ ] Can enter guest name
- [ ] Can enter guest email
- [ ] Can select photos
- [ ] Can upload photos
- [ ] Upload completes successfully

### 7.3 Database Verification

- [ ] Upload created with `upload_source = 'public_site'`
- [ ] Upload has guest name
- [ ] Upload has guest email
- [ ] Images associated with correct upload

**SQL to run:**

```sql
SELECT * FROM uploads WHERE upload_source = 'public_site' ORDER BY created_at DESC;
```

## Phase 8: Public Photo Gallery

### 8.1 Display

- [ ] Navigate to public wedding site
- [ ] Photo Gallery Section is visible
- [ ] Only highlighted images are displayed
- [ ] Images organized by category
- [ ] Gallery layout is responsive

### 8.2 API Endpoint

- [ ] API endpoint `/api/public/[slug]/photos/highlighted` works
- [ ] Returns only highlighted images
- [ ] Returns correct image metadata
- [ ] Returns correct public URLs

**Test with curl:**

```bash
curl "http://localhost:3000/api/public/[couple-slug]/photos/highlighted"
```

## Phase 9: Data Integrity

### 9.1 Referential Integrity

- [ ] No orphaned images (images without valid upload_id)
- [ ] No images with invalid couple_id
- [ ] All foreign key constraints maintained
- [ ] Cascade deletes work correctly

**SQL to run:**

```sql
SELECT COUNT(*) FROM images WHERE upload_id NOT IN (SELECT id FROM uploads);
SELECT COUNT(*) FROM images WHERE couple_id NOT IN (SELECT id FROM couples);
```

### 9.2 Data Consistency

- [ ] Image count matches between UI and database
- [ ] Highlighted count matches between UI and database
- [ ] Folder assignments are consistent
- [ ] Category assignments are consistent

### 9.3 RLS Policies

- [ ] Users can only see their own uploads
- [ ] Users can only see their own images
- [ ] Users can only see their own folders
- [ ] Public endpoint doesn't require authentication

## Phase 10: Error Scenarios

### 10.1 Network Errors

- [ ] Handle Google Drive API timeout
- [ ] Handle network disconnection during upload
- [ ] Handle database connection errors
- [ ] Display appropriate error messages

### 10.2 Validation Errors

- [ ] Reject invalid file types
- [ ] Reject files exceeding size limit
- [ ] Reject empty file selections
- [ ] Reject invalid folder names

### 10.3 Permission Errors

- [ ] Handle Google Drive permission denied
- [ ] Handle database permission denied
- [ ] Handle RLS policy violations
- [ ] Display appropriate error messages

## Phase 11: Performance Testing

### 11.1 Load Testing

- [ ] Upload 10 images successfully
- [ ] Upload 50 images successfully
- [ ] Upload 100 images successfully
- [ ] Gallery loads quickly with 100+ images
- [ ] Filtering works smoothly with 100+ images

### 11.2 Query Performance

- [ ] Image gallery query completes in < 1 second
- [ ] Highlighted images query completes in < 500ms
- [ ] Upload history query completes in < 1 second
- [ ] Folder list query completes in < 500ms

**Monitor with:**

```sql
EXPLAIN ANALYZE SELECT * FROM images WHERE couple_id = 'YOUR_COUPLE_ID';
```

## Phase 12: Browser Compatibility

- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge
- [ ] Responsive on mobile devices
- [ ] Responsive on tablets
- [ ] Responsive on desktop

## Phase 13: Cleanup

- [ ] Delete test images from Google Drive
- [ ] Clear test data from database
- [ ] Clear browser localStorage
- [ ] Verify no test data remains

## Sign-Off

- [ ] All tests passed
- [ ] No critical issues found
- [ ] No console errors
- [ ] Database integrity verified
- [ ] Ready for production deployment

**Tested by:** ******\_\_\_\_******  
**Date:** ******\_\_\_\_******  
**Notes:** ******\_\_\_\_******

---

## Quick Test Commands

### Clear Database

```bash
# Using Supabase CLI
supabase db reset

# Or manually
supabase migration up 005_clear_photo_data.sql
```

### Verify Schema

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('uploads', 'images', 'folders', 'photo_collections');
```

### Check Data

```sql
-- Summary of all data
SELECT
  (SELECT COUNT(*) FROM uploads) as uploads,
  (SELECT COUNT(*) FROM images) as images,
  (SELECT COUNT(*) FROM folders) as folders,
  (SELECT COUNT(*) FROM photo_collections) as photo_collections;
```

### Monitor Uploads

```sql
-- Real-time upload monitoring
SELECT
  u.id,
  u.uploader_name,
  u.upload_source,
  u.status,
  COUNT(i.id) as image_count,
  u.created_at
FROM uploads u
LEFT JOIN images i ON i.upload_id = u.id
GROUP BY u.id
ORDER BY u.created_at DESC
LIMIT 10;
```

## Troubleshooting Quick Links

- [Google Drive Authentication Issues](PHOTO_UPLOAD_TESTING_GUIDE.md#troubleshooting)
- [Database Issues](PHOTO_UPLOAD_TESTING_GUIDE.md#troubleshooting)
- [Performance Issues](PHOTO_UPLOAD_TESTING_GUIDE.md#performance-testing)
- [API Issues](PHOTO_UPLOAD_TESTING_GUIDE.md#step-9-test-public-site-upload)
