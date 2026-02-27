# Photo Upload System - Complete Fix Summary

## Issues Fixed

### 1. Google Drive Client Error

**Error**: `TypeError: Cannot read properties of undefined (reading 'client')`

**Root Cause**:

- The `gapi.client` was undefined when trying to fetch file metadata after upload
- Missing null check before accessing `window.gapi.client.drive`
- Missing authentication token validation before upload

**Solution Applied**:

- Added null check: `if (!window.gapi?.client?.drive)` before accessing the API
- Added access token validation at the start of `uploadFile()` method
- Improved error handling with fallback to basic file info if metadata fetch fails

**File Modified**: `src/lib/google-drive.ts`

### 2. Category Validation Error

**Error**: `new row for relation "images" violates check constraint "images_category_check"`

**Root Cause**:

- Custom folder names (e.g., "Engagement") were being saved as image categories
- Database only accepts 4 valid categories: `Haldi`, `Sangeet`, `Wedding`, `Reception`
- The system was trying to insert custom folder names directly into the category field

**Solution Applied**:

- Implemented category mapping logic in upload manager
- Custom folders are now stored in the `folder` field (for organization)
- Images are categorized using valid categories in the `category` field
- Smart mapping: if custom folder name matches a default category, it uses that
- Otherwise defaults to `Wedding` category

**File Modified**: `src/components/photos/upload-manager.tsx`

## How It Works Now

### Upload Flow

```
1. User selects category/folder (can be default or custom)
2. Files uploaded to Google Drive in that folder
3. Images stored in database with:
   - category: Valid category (Haldi, Sangeet, Wedding, Reception)
   - folder: Selected folder name (can be custom)
4. Gallery filters by category, displays folder info
```

### Category vs Folder

- **Category**: Fixed set of 4 values for database constraints
- **Folder**: Custom or default folder names for organization

### Example

- User creates custom folder "Engagement"
- Uploads photos to "Engagement" folder
- Photos stored with:
  - `category: 'Wedding'` (default mapping)
  - `folder: 'Engagement'` (custom folder)
- Gallery shows images organized by "Engagement" folder
- Can filter by category if needed

## Testing the Fix

### Step 1: Clear Database

```sql
-- Clear all photo data
DELETE FROM images;
DELETE FROM uploads;
DELETE FROM folders WHERE folder_type = 'custom';
```

### Step 2: Test Upload Flow

1. Go to Dashboard → Photos → Upload
2. Click "Connect Google Drive"
3. Authenticate with Google
4. Create a custom folder (e.g., "Engagement")
5. Select the custom folder from dropdown
6. Upload photos
7. Check database:
   ```sql
   SELECT id, filename, category, folder FROM images LIMIT 5;
   ```

### Step 3: Verify Results

- Images should have valid category values
- Custom folder name should appear in `folder` column
- No constraint violations
- Photos appear in gallery

## Database Schema

### Images Table

```sql
CREATE TABLE images (
  id UUID PRIMARY KEY,
  upload_id UUID REFERENCES uploads(id),
  couple_id UUID REFERENCES couples(id),
  filename TEXT NOT NULL,
  google_drive_file_id TEXT NOT NULL,
  public_url TEXT,
  category VARCHAR(50) CHECK (category IN ('Haldi', 'Sangeet', 'Wedding', 'Reception')),
  folder TEXT,  -- Can be any custom folder name
  is_highlighted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Key Changes

### google-drive.ts

```typescript
// Added access token validation
if (!this.accessToken) {
  throw new Error(
    "Not authenticated with Google Drive. Please authenticate first."
  );
}

// Added null check for gapi.client
if (!window.gapi?.client?.drive) {
  throw new Error("Google Drive API client not available");
}
```

### upload-manager.tsx

```typescript
// Smart category mapping
const validCategories: ImageCategory[] = [
  "Haldi",
  "Sangeet",
  "Wedding",
  "Reception",
];
let categoryToUse: ImageCategory = "Wedding"; // Default

if (validCategories.includes(selectedCategory as ImageCategory)) {
  categoryToUse = selectedCategory as ImageCategory;
} else {
  // Try to find matching default category
  const matched = validCategories.find(
    (cat) => cat.toLowerCase() === selectedCategory.toLowerCase()
  );
  if (matched) {
    categoryToUse = matched as ImageCategory;
  }
}
```

## Troubleshooting

### Still Getting "gapi.client undefined"?

1. Ensure Google Drive authentication completed
2. Check browser console for API initialization errors
3. Verify Google API credentials in `.env.local`
4. Try refreshing the page and re-authenticating

### Still Getting Category Validation Error?

1. Check that category is one of: Haldi, Sangeet, Wedding, Reception
2. Verify database schema has the check constraint
3. Clear browser cache and try again
4. Check upload manager is using the new mapping logic

### Custom Folders Not Appearing?

1. Ensure folders are created in database first
2. Check that `getAvailableFolders()` is being called
3. Verify folders have correct `couple_id`
4. Check browser console for fetch errors

## Next Steps

1. ✅ Test upload with default categories
2. ✅ Test upload with custom folders
3. ✅ Verify images appear in gallery
4. ✅ Test highlighting functionality
5. ✅ Test public site photo display
6. ✅ Test folder filtering

## Files Modified

- `src/lib/google-drive.ts` - Added validation and error handling
- `src/components/photos/upload-manager.tsx` - Added category mapping logic

## Status

✅ **COMPLETE** - Ready for testing
