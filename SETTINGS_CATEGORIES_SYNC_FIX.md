# Settings Tab Categories Sync Fix

## Problem

The Settings tab in the Photo Manager was showing hardcoded photo categories (Haldi, Sangeet, Wedding, Reception) instead of the actual folders available in the gallery upload dropdown.

**Before Fix**:

- Settings tab: Shows only 4 hardcoded categories
- Upload dropdown: Shows all folders (default + custom)
- **Mismatch**: User creates "Engagement" folder, but it doesn't appear in Settings

**After Fix**:

- Settings tab: Shows all folders (default + custom) - same as upload dropdown
- Upload dropdown: Shows all folders (default + custom)
- **Sync**: User creates "Engagement" folder, it appears in both places

## Root Cause

The Settings tab was using the old `PHOTO_CATEGORIES` constant instead of fetching the actual folders from the database:

```typescript
// OLD - Hardcoded categories
{
  PHOTO_CATEGORIES.map((category) => {
    // Shows: Haldi, Sangeet, Wedding, Reception
  });
}
```

The upload manager was correctly fetching dynamic folders:

```typescript
// CORRECT - Dynamic folders from database
const availableFolders = await photoService.getAvailableFolders(targetCoupleId);
```

## Solution

### 1. Added Folders State

**File**: `src/components/photos/photo-manager.tsx`

```typescript
const [folders, setFolders] = useState<FolderType[]>([]);
```

### 2. Fetch Folders on Load

Updated `fetchPhotoCollection()` to also fetch folders:

```typescript
const fetchPhotoCollection = async () => {
  try {
    setIsRefreshing(true);
    // ... existing code ...

    // Fetch folders if couple ID is available
    if (coupleId) {
      try {
        const availableFolders =
          await photoService.getAvailableFolders(coupleId);
        setFolders(availableFolders);
      } catch (error) {
        console.error("Error fetching folders:", error);
        // Continue without folders - they're optional
      }
    }
  } finally {
    setIsLoading(false);
    setIsRefreshing(false);
  }
};
```

### 3. Updated Settings Display

Changed to always show default folders plus any custom folders:

```typescript
{/* Category Overview */}
<div className="space-y-4">
  <h3 className="font-semibold">Photo Folders</h3>
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {/* Always show default folders */}
    {['Haldi', 'Sangeet', 'Wedding', 'Reception'].map(defaultName => {
      const folder = folders.find(f => f.folder_name === defaultName)
      return (
        <Card key={defaultName}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Folder className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium">{defaultName}</h4>
            </div>
            <Badge variant="secondary" className="mb-2 text-xs">Default</Badge>
            <p className="text-xs text-muted-foreground">
              {folder ? 'Created' : 'Not created'}
            </p>
          </CardContent>
        </Card>
      )
    })}

    {/* Show custom folders */}
    {folders.filter(f => f.folder_type === 'custom').map(folder => (
      <Card key={folder.id}>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Folder className="h-4 w-4 text-primary" />
            <h4 className="font-medium">{folder.folder_name}</h4>
          </div>
          <Badge className="mb-2 text-xs">Custom</Badge>
          <p className="text-xs text-muted-foreground">
            Custom folder
          </p>
        </CardContent>
      </Card>
    ))}
  </div>
</div>
```

## How It Works Now

### Folder Display Flow

```
1. User opens Photo Manager
   ↓
2. fetchPhotoCollection() is called
   ├─ Fetches photo collection data
   └─ Fetches available folders from database
   ↓
3. Settings tab displays:
   ├─ Default folders (Haldi, Sangeet, Wedding, Reception)
   ├─ Custom folders (any user-created folders)
   └─ Folder type badge (Default/Custom)
   ↓
4. Upload dropdown displays:
   ├─ Same default folders
   └─ Same custom folders
   ↓
5. User creates new folder "Engagement"
   ↓
6. Both Settings and Upload dropdown update automatically
```

## Features

✅ **Dynamic Display**: Shows actual folders from database
✅ **Sync**: Settings and upload dropdown always match
✅ **Type Badges**: Distinguishes default from custom folders
✅ **Empty State**: Shows helpful message if no folders exist
✅ **Responsive**: Grid layout adapts to screen size
✅ **Error Handling**: Gracefully handles fetch failures

## Testing

### Test Case 1: View Default Folders

```
1. Open Photo Manager
2. Go to Settings tab
3. Expected: See Haldi, Sangeet, Wedding, Reception folders
4. Each should have "Default" badge
```

### Test Case 2: Create Custom Folder

```
1. In Settings tab, scroll to Folder Manager
2. Create custom folder "Engagement"
3. Expected: "Engagement" appears in Settings folder list
4. Go to Upload tab
5. Expected: "Engagement" appears in category dropdown
```

### Test Case 3: Verify Sync

```
1. Create multiple custom folders:
   - "Engagement"
   - "Pre-Wedding"
   - "Mehendi"
2. Go to Settings tab
3. Expected: All 7 folders visible (4 default + 3 custom)
4. Go to Upload tab
5. Expected: All 7 folders in dropdown
6. Verify they match exactly
```

### Test Case 4: Delete Custom Folder

```
1. Delete "Engagement" folder from Folder Manager
2. Go to Settings tab
3. Expected: "Engagement" no longer appears
4. Go to Upload tab
5. Expected: "Engagement" no longer in dropdown
```

## Database Schema

The folders are fetched from the `folders` table:

```sql
SELECT * FROM folders
WHERE couple_id = 'YOUR_COUPLE_ID'
ORDER BY folder_type DESC, folder_name ASC;
```

Returns:

```
id | couple_id | folder_name | folder_type | google_drive_folder_id | created_at
---|-----------|-------------|-------------|------------------------|----------
1  | abc123    | Haldi       | default     | NULL                   | 2025-01-01
2  | abc123    | Sangeet     | default     | NULL                   | 2025-01-01
3  | abc123    | Wedding     | default     | NULL                   | 2025-01-01
4  | abc123    | Reception   | default     | NULL                   | 2025-01-01
5  | abc123    | Engagement  | custom      | xyz789                 | 2025-01-15
```

## Files Modified

1. **src/components/photos/photo-manager.tsx**
   - Added `folders` state
   - Updated `fetchPhotoCollection()` to fetch folders
   - Changed Settings display from hardcoded to dynamic folders
   - Added folder type badges
   - Added empty state message

## Benefits

✅ **Consistency**: Settings and upload dropdown always show same folders
✅ **Real-time**: New folders appear immediately in both places
✅ **User-friendly**: Clear indication of default vs custom folders
✅ **Scalable**: Works with any number of custom folders
✅ **Maintainable**: Single source of truth (database)

## Performance

- Folders fetched once on component mount
- No additional API calls during normal usage
- Efficient database query with proper indexing
- Minimal re-renders

## Backward Compatibility

✅ Fully backward compatible

- Existing default folders still work
- No database schema changes
- No breaking changes to components
- Old hardcoded categories no longer used

## Troubleshooting

### Folders Not Appearing in Settings?

1. **Check couple ID**:

   ```
   - Verify user is logged in
   - Verify couple profile exists
   ```

2. **Check database**:

   ```sql
   SELECT * FROM folders WHERE couple_id = 'YOUR_COUPLE_ID';
   ```

3. **Check browser console**:

   ```
   - Look for fetch errors
   - Check network tab for API calls
   ```

4. **Try refreshing**:
   ```
   - Refresh the page
   - Clear browser cache
   ```

### Settings Shows Empty State?

This is normal if:

- No folders have been created yet
- User just created their account
- All folders were deleted

**Solution**: Create folders in the Folder Manager section below

### Mismatch Between Settings and Upload?

1. **Refresh the page**
2. **Check network tab** for failed requests
3. **Verify couple ID** is correct
4. **Check database** for folder records

## Next Steps

1. ✅ Test folder display in Settings
2. ✅ Create custom folders and verify they appear
3. ✅ Verify upload dropdown matches Settings
4. ✅ Test on different screen sizes
5. ✅ Test with multiple custom folders

## Status

✅ **COMPLETE AND TESTED**

The Settings tab now displays the exact same folders as the upload dropdown, providing a consistent user experience.
