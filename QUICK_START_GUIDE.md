# Quick Start Guide - Photo Upload Testing

## 5-Minute Setup

### Step 1: Clear Database (1 min)

```bash
# Option A: Using Supabase CLI
supabase db reset

# Option B: Using SQL directly
# Go to Supabase Dashboard → SQL Editor and run:
DELETE FROM images;
DELETE FROM uploads;
DELETE FROM folders;
DELETE FROM photo_collections;
```

### Step 2: Verify Schema (1 min)

```sql
-- Run in Supabase SQL Editor
SELECT COUNT(*) as uploads FROM uploads;
SELECT COUNT(*) as images FROM images;
SELECT COUNT(*) as folders FROM folders;
```

Expected: All return 0

### Step 3: Start Application (1 min)

```bash
npm run dev
```

### Step 4: Test Upload (2 min)

1. Log in to dashboard
2. Go to Photos section
3. Click "Connect Google Drive"
4. Select 2-3 test photos
5. Click "Upload"

## Verification Checklist

After upload, verify:

```sql
-- Check uploads created
SELECT COUNT(*) FROM uploads;  -- Should be 1

-- Check images created
SELECT COUNT(*) FROM images;   -- Should match number of uploaded files

-- Check data integrity
SELECT u.id, COUNT(i.id) as image_count
FROM uploads u
LEFT JOIN images i ON i.upload_id = u.id
GROUP BY u.id;
```

## Common Issues & Fixes

| Issue                                     | Fix                                                                                        |
| ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| "Connect Google Drive" button not working | Clear localStorage: `localStorage.clear()` then refresh                                    |
| Upload fails                              | Check `.env.local` has Google API credentials                                              |
| Images not showing in gallery             | Verify images in DB: `SELECT COUNT(*) FROM images;`                                        |
| Highlighted images not on public site     | Check if marked as highlighted: `SELECT COUNT(*) FROM images WHERE is_highlighted = true;` |

## Testing Flow

```
1. UPLOAD
   └─ Select photos → Choose category → Click Upload

2. VERIFY DATABASE
   └─ Check uploads table → Check images table

3. VIEW GALLERY
   └─ Go to Image Gallery → See all images

4. HIGHLIGHT IMAGES
   └─ Select images → Click "Mark as Highlighted"

5. VIEW PUBLIC SITE
   └─ Go to public wedding site → See highlighted photos

6. TEST FOLDERS
   └─ Create custom folder → Assign images → Verify
```

## Key SQL Queries

### See all uploads

```sql
SELECT * FROM uploads ORDER BY created_at DESC;
```

### See all images

```sql
SELECT * FROM images ORDER BY created_at DESC;
```

### See highlighted images

```sql
SELECT * FROM images WHERE is_highlighted = true;
```

### See images by category

```sql
SELECT category, COUNT(*) FROM images GROUP BY category;
```

### See images by folder

```sql
SELECT folder, COUNT(*) FROM images GROUP BY folder;
```

### See upload summary

```sql
SELECT
  u.id,
  u.uploader_name,
  u.upload_source,
  COUNT(i.id) as image_count
FROM uploads u
LEFT JOIN images i ON i.upload_id = u.id
GROUP BY u.id, u.uploader_name, u.upload_source;
```

## Environment Setup

### Required in `.env.local`

```
NEXT_PUBLIC_GOOGLE_API_KEY=your_key
NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID=your_client_id
```

### Get credentials from:

1. Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs
4. Copy credentials to `.env.local`

## Component Locations

| Component      | Path                |
| -------------- | ------------------- |
| Upload Manager | `/dashboard/photos` |
| Image Gallery  | `/dashboard/photos` |
| Upload History | `/dashboard/photos` |
| Folder Manager | `/dashboard/photos` |
| Public Upload  | `/[couple-slug]`    |
| Public Gallery | `/[couple-slug]`    |

## API Endpoints to Test

```bash
# List uploads
curl http://localhost:3000/api/photos/uploads

# List images
curl http://localhost:3000/api/photos/images

# List folders
curl http://localhost:3000/api/photos/folders

# Get highlighted images (public)
curl http://localhost:3000/api/public/[couple-slug]/photos/highlighted
```

## Database Tables

| Table             | Purpose                   |
| ----------------- | ------------------------- |
| uploads           | Track upload sessions     |
| images            | Store photo metadata      |
| folders           | Manage folder categories  |
| photo_collections | Legacy (being phased out) |

## Key Features to Test

- [ ] Upload single photo
- [ ] Upload multiple photos
- [ ] Upload ZIP file
- [ ] Select category
- [ ] View in gallery
- [ ] Filter by category
- [ ] Filter by folder
- [ ] Mark as highlighted
- [ ] Create custom folder
- [ ] Assign to folder
- [ ] View upload history
- [ ] View public gallery
- [ ] Guest upload
- [ ] Delete image
- [ ] Delete folder

## Performance Baseline

| Operation                 | Expected Time |
| ------------------------- | ------------- |
| Upload 1 image            | < 5 seconds   |
| Upload 10 images          | < 30 seconds  |
| Load gallery (100 images) | < 1 second    |
| Filter images             | < 500ms       |
| Mark as highlighted       | < 1 second    |

## Troubleshooting Commands

```bash
# Clear browser storage
localStorage.clear()

# Check API response
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/photos/images

# View application logs
npm run dev  # Check terminal output

# Check database connection
# Go to Supabase Dashboard → SQL Editor → Run any query
```

## Next Steps After Testing

1. ✅ Verify all components work
2. ✅ Check database integrity
3. ✅ Test public site
4. ✅ Review error handling
5. ✅ Check performance
6. ✅ Deploy to staging
7. ✅ User acceptance testing
8. ✅ Deploy to production

## Documentation Links

- Full Testing Guide: `PHOTO_UPLOAD_TESTING_GUIDE.md`
- Testing Checklist: `PHOTO_UPLOAD_TESTING_CHECKLIST.md`
- Architecture Diagrams: `PHOTO_UPLOAD_FLOW_DIAGRAM.md`
- System Summary: `PHOTO_SYSTEM_SUMMARY.md`
- Migration Guide: `PHOTO_MIGRATION_GUIDE.md`

## Support

**Issue?** Check:

1. Browser console for errors
2. Application logs
3. Database queries
4. `.env.local` configuration
5. Google Drive API credentials

**Still stuck?** Review the full testing guide or check the troubleshooting section.

---

**Ready to test?** Start with Step 1 above! 🚀
