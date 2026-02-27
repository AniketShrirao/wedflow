# Folder Categories - Quick Guide

## What Changed

Upload manager now loads folders from database and uses them as categories.

## How to Use

### 1. Create a Custom Folder

1. Go to Photos → Folder Management
2. Enter folder name (e.g., "Engagement")
3. Click Create
4. Folder appears in the list

### 2. Upload with Custom Folder

1. Go to Photos → Upload Manager
2. Click "Connect Google Drive" (if needed)
3. Select photos
4. In "Photo Category" dropdown, select your custom folder
5. Click Upload
6. Images are tagged with that folder

### 3. View in Gallery

1. Go to Photos → Image Gallery
2. Filter by folder/category
3. See all images from that folder
4. Can highlight and manage them

## Features

- ✅ Custom folders appear automatically in dropdown
- ✅ Default folders (Haldi, Sangeet, Wedding, Reception) always available
- ✅ Images tagged with folder name
- ✅ Gallery filters by folder
- ✅ Fallback to defaults if no folders exist

## Example

```
Create Folder "Engagement"
    ↓
Upload Manager shows "Engagement" in dropdown
    ↓
Upload photos to "Engagement"
    ↓
Gallery shows images with "Engagement" category
    ↓
Can filter gallery by "Engagement"
```

## Technical Details

- Folders loaded from `folders` table
- `folder_name` used as category
- `folder_type` distinguishes default vs custom
- Works with existing upload flow
- No breaking changes

## Testing Checklist

- [ ] Create custom folder
- [ ] See it in upload dropdown
- [ ] Upload images to custom folder
- [ ] Images appear in gallery with correct category
- [ ] Can filter gallery by custom folder
- [ ] Default folders still work
- [ ] Multiple custom folders work

---

**Ready to use!** Create a folder and start uploading! 🚀
