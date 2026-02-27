# Photo Collections Table Removal

## Overview

The legacy `photo_collections` table has been removed and replaced with a normalized schema using `images`, `uploads`, and `categories` tables.

## Changes Made

### Database Migrations

- **008_enable_categories_rls.sql**: Enables RLS on the categories table
- **009_drop_photo_collections.sql**: Drops the legacy photo_collections table

### Updated Files

#### API Routes

- **src/app/api/public/[slug]/photos/route.ts**: Now queries from `images` table instead of `photo_collections`
- **src/app/api/public/[slug]/route.ts**: Updated to fetch highlighted images from `images` table

#### Components

- **src/components/public/photo-gallery-section.tsx**: Updated to fetch and display highlighted photos from the new API

#### Services

- **src/lib/sync/data-sync-monitor.ts**: Updated to query `images` table for highlighted photos
- **src/lib/backup/database-backup.ts**: Updated to backup `images`, `uploads`, and `categories` instead of `photo_collections`

#### Types

- **src/lib/types/database.ts**:
  - Removed `photo_collections` table definition
  - Added `categories` table definition
  - Removed `PhotoCollection`, `InsertPhotoCollection`, `UpdatePhotoCollection` types

### Dashboard API Routes (Still Using Legacy Table)

The following routes still reference `photo_collections` and need to be updated or deprecated:

- `src/app/api/photos/route.ts`
- `src/app/api/photos/upload/route.ts`
- `src/app/api/photos/highlights/route.ts`
- `src/app/api/photos/delete/route.ts`

These routes are used by the dashboard and should be updated to use the new `images`/`uploads`/`categories` tables.

### Migration Service

- **src/lib/services/photo-migration.ts**: Kept as-is for legacy data migration purposes

## Data Structure

### Old Structure (Removed)

```
photo_collections
├── id
├── couple_id
├── drive_folder_url
├── categories (JSONB array)
├── highlight_photos (JSONB array)
└── updated_at
```

### New Structure (Active)

```
uploads
├── id
├── couple_id
├── uploader_name
├── uploader_email
├── upload_source
├── status
├── google_drive_folder_path
├── created_at
└── updated_at

images
├── id
├── upload_id
├── couple_id
├── filename
├── google_drive_file_id
├── public_url
├── category
├── folder
├── is_highlighted
├── created_at
└── updated_at

categories
├── id
├── couple_id
├── category_name
├── category_type (default|custom)
├── google_drive_folder_id
├── created_at
└── updated_at
```

## Public API Behavior

### GET /api/public/[slug]/photos

Returns highlighted photos organized by
