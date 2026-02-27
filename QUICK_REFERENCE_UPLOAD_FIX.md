# Quick Reference - Upload System Fix

## What Was Fixed

### 1. Google Drive Client Error ✅

- **Error**: `Cannot read properties of undefined (reading 'client')`
- **Fix**: Added null checks and access token validation
- **File**: `src/lib/google-drive.ts`

### 2. Category Validation Error ✅

- **Error**: `violates check constraint "images_category_check"`
- **Fix**: Implemented smart category mapping
- **File**: `src/components/photos/upload-manager.tsx`

## How to Test

### Quick Test (5 minutes)

```
1. Go to Dashboard → Photos → Upload
2. Click "Connect Google Drive"
3. Select "Wedding" category
4. Upload 1-2 photos
5. Check database:
   SELECT category, folder FROM images ORDER BY created_at DESC LIMIT 1;
   Expected: category='Wedding', folder='Wedding'
```

### Full Test (15 minutes)

```
1. Create custom folder "Engagement"
2. Upload photos to "Engagement"
3. Check database:
   SELECT category, folder FROM images WHERE folder='Engagement' LIMIT 1;
   Expected: category='Wedding', folder='Engagement'
4. Go to Gallery
5. Verify images appear
6. Test highlighting
7. Check public site
```

## Database Queries

### Check All Images

```sql
SELECT id, filename, category, folder, is_highlighted
FROM images
ORDER BY created_at DESC
LIMIT 10;
```

### Verify No Constraint Violations

```sql
SELECT COUNT(*) as invalid_count
FROM images
WHERE category NOT IN ('Haldi', 'Sangeet', 'Wedding', 'Reception');
-- Should return: 0
```

### Check Custom Folders

```sql
SELECT DISTINCT folder
FROM images
WHERE folder NOT IN ('Haldi', 'Sangeet', 'Wedding', 'Reception')
ORDER BY folder;
```

### Count Images by Category

```sql
SELECT category, COUNT(*) as count
FROM images
GROUP BY category
ORDER BY count DESC;
```

## Key Concepts

### Category (Fixed)

- Haldi, Sangeet, Wedding, Reception
- Database constraint
- Used for filtering
- Cannot be custom

### Folder (Flexible)

- Can be default or custom
- User-created
- Used for organization
- Stored separately from category

### Mapping Logic

```
If selected folder is valid category → use it
Else if selected folder matches category (case-insensitive) → use matched category
Else → default to "Wedding"
```

## Common Scenarios

### Scenario 1: Upload to "Wedding"

```
Selected: "Wedding"
→ category: "Wedding"
→ folder: "Wedding"
```

### Scenario 2: Upload to "Engagement" (custom)

```
Selected: "Engagement"
→ category: "Wedding" (default)
→ folder: "Engagement"
```

### Scenario 3: Upload to "haldi" (custom, matches default)

```
Selected: "haldi"
→ category: "Haldi" (matched)
→ folder: "haldi"
```

## Troubleshooting

| Issue                         | Solution                                  |
| ----------------------------- | ----------------------------------------- |
| gapi.client undefined         | Refresh page, re-authenticate             |
| Category constraint error     | Clear cache, verify mapping logic         |
| Custom folder not in dropdown | Create folder first, refresh page         |
| Images not appearing          | Check couple_id, verify category is valid |
| Upload stuck                  | Check network tab, verify Google auth     |

## Files Changed

1. `src/lib/google-drive.ts` (1 change)
   - Added validation in `uploadFile()` method

2. `src/components/photos/upload-manager.tsx` (1 change)
   - Added category mapping in `uploadFiles()` function

## Verification Checklist

- [ ] Can authenticate with Google Drive
- [ ] Can upload to default category
- [ ] Can upload to custom folder
- [ ] No database constraint errors
- [ ] Images appear in gallery
- [ ] Can highlight images
- [ ] Public site shows highlighted images
- [ ] Folder filtering works

## Next Steps

1. Test the upload flow
2. Verify database entries
3. Check gallery display
4. Test public site
5. Deploy to production

## Support

If issues persist:

1. Check browser console for errors
2. Verify `.env.local` has Google credentials
3. Check database for constraint violations
4. Review error logs in Supabase dashboard
5. Clear browser cache and try again

---

**Status**: ✅ Ready for Testing
**Last Updated**: 2025-11-23
