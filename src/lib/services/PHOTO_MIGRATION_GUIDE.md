# Photo Migration Guide

This guide explains how to migrate existing photo data from the legacy `photo_collections.categories` JSONB column to the new normalized `uploads` and `images` tables.

## Overview

The photo management refactor introduces a proper relational schema with dedicated tables for tracking upload sessions and individual image metadata. This migration script safely moves all existing photo data while maintaining referential integrity and data consistency.

## Migration Components

### 1. SQL Migration Script

**File:** `supabase/migrations/004_migrate_photo_data.sql`

This SQL script performs the following operations:

- **Step 1:** Creates upload sessions for each couple with legacy photos
  - Sets `upload_source` to `'legacy'` for tracking
  - Uses the `drive_folder_url` as the `google_drive_folder_path`
  - Sets status to `'completed'` since these are historical uploads

- **Step 2:** Extracts photos from JSONB categories
  - Processes each photo in the `categories` array
  - Creates individual `images` records with proper metadata
  - Handles missing fields with sensible defaults

- **Step 3:** Verifies referential integrity
  - Ensures all images have valid `upload_id` references
  - Validates foreign key relationships

- **Step 4:** Creates default folders
  - Initializes Haldi, Sangeet, Wedding, and Reception folders
  - Ensures couples have the standard folder structure

- **Step 5:** Migrates highlight photos
  - Marks images as highlighted based on `highlight_photos` array
  - Preserves the couple's curated photo selections

### 2. TypeScript Migration Service

**File:** `src/lib/services/photo-migration.ts`

The `PhotoMigrationService` class provides programmatic access to migration operations:

#### Key Methods

- **`getLegacyPhotoCollections()`**
  - Retrieves all photo collections with legacy data
  - Returns: `PhotoCollection[]`

- **`createLegacyUploadSession(coupleId, googleDriveFolderPath?)`**
  - Creates an upload session for legacy photos
  - Returns: `Upload`

- **`migratePhotoCollection(photoCollection)`**
  - Migrates photos from a single photo collection
  - Handles existing upload sessions
  - Returns: `Image[]`

- **`initializeDefaultFolders(coupleId)`**
  - Creates default category folders for a couple
  - Skips folders that already exist
  - Returns: `Promise<void>`

- **`getMigrationStats(coupleId)`**
  - Retrieves migration statistics for a couple
  - Returns: `MigrationStats | null`

- **`verifyMigrationIntegrity(coupleId)`**
  - Verifies migration integrity for a couple
  - Checks photo counts, folder existence, and referential integrity
  - Returns: `{ isValid: boolean; issues: string[] }`

- **`executeMigration()`**
  - Executes full migration for all couples with legacy photos
  - Handles errors gracefully
  - Returns: `MigrationResult`

- **`rollbackMigration()`**
  - Rolls back migration by deleting legacy uploads and images
  - **WARNING:** This is destructive and should only be used if migration failed
  - Returns: `Promise<void>`

### 3. Comprehensive Test Suite

**File:** `src/lib/services/__tests__/photo-migration.test.ts`

The test suite covers:

- Photo extraction and transformation logic
- Migration statistics calculation
- Default folder initialization
- Migration integrity verification
- Upload session creation
- Image record creation
- Migration result structure
- Service instantiation and method availability
- Category validation
- Upload source tracking

**Test Results:** 27 tests, all passing ✓

## Migration Process

### Step 1: Backup Database

Before running the migration, create a backup of your database:

```bash
# Using Supabase CLI
supabase db pull
```

### Step 2: Run SQL Migration

Apply the SQL migration to your Supabase database:

```bash
# Using Supabase CLI
supabase migration up
```

Or manually execute the SQL in the Supabase SQL editor.

### Step 3: Verify Migration (Optional)

Use the TypeScript service to verify the migration:

```typescript
import { photoMigrationService } from "@/lib/services/photo-migration";

// Get migration statistics
const stats = await photoMigrationService.getMigrationStats("couple-id");
console.log("Migration stats:", stats);

// Verify integrity
const integrity =
  await photoMigrationService.verifyMigrationIntegrity("couple-id");
console.log("Integrity check:", integrity);
```

### Step 4: Execute Full Migration (Programmatic)

If you prefer to run the migration programmatically:

```typescript
import { photoMigrationService } from "@/lib/services/photo-migration";

const result = await photoMigrationService.executeMigration();

if (result.success) {
  console.log(`Successfully migrated ${result.totalCouples} couples`);
  console.log(`Total photos migrated: ${result.totalMigratedImages}`);
} else {
  console.error("Migration failed:", result.errors);
}
```

## Data Mapping

### Photo Collection → Upload Session

| Old Field          | New Field                  | Notes                      |
| ------------------ | -------------------------- | -------------------------- |
| `couple_id`        | `couple_id`                | Direct mapping             |
| `drive_folder_url` | `google_drive_folder_path` | Renamed field              |
| N/A                | `uploader_name`            | Set to "Legacy Import"     |
| N/A                | `uploader_email`           | Set to NULL                |
| N/A                | `upload_source`            | Set to "legacy"            |
| N/A                | `status`                   | Set to "completed"         |
| `updated_at`       | `created_at`               | Use collection update time |

### Photo (in categories array) → Image Record

| Old Field              | New Field              | Notes                             |
| ---------------------- | ---------------------- | --------------------------------- |
| `filename`             | `filename`             | Generated if missing              |
| `google_drive_file_id` | `google_drive_file_id` | Direct mapping                    |
| `public_url`           | `public_url`           | Direct mapping                    |
| `category`             | `category`             | Defaults to "Wedding" if missing  |
| `folder`               | `folder`               | Defaults to category or "Wedding" |
| `is_highlighted`       | `is_highlighted`       | Defaults to false                 |
| N/A                    | `upload_id`            | References created upload session |
| N/A                    | `couple_id`            | From photo collection             |

## Verification Queries

After migration, you can verify the data using these queries:

### Check migration statistics

```sql
SELECT
  COUNT(DISTINCT u.couple_id) as couples_with_legacy_uploads,
  COUNT(DISTINCT u.id) as total_legacy_uploads,
  COUNT(DISTINCT i.id) as total_migrated_images,
  COUNT(DISTINCT CASE WHEN i.is_highlighted THEN i.id END) as highlighted_images
FROM uploads u
LEFT JOIN images i ON i.upload_id = u.id
WHERE u.upload_source = 'legacy';
```

### Check for orphaned images

```sql
SELECT COUNT(*) as orphaned_images
FROM images
WHERE upload_id NOT IN (SELECT id FROM uploads);
```

### Check default folders

```sql
SELECT couple_id, COUNT(*) as folder_count
FROM folders
WHERE folder_type = 'default'
GROUP BY couple_id
HAVING COUNT(*) = 4;
```

### Check for data integrity issues

```sql
SELECT
  pc.couple_id,
  COUNT(DISTINCT pc.id) as photo_collection_count,
  COALESCE(jsonb_array_length(pc.categories), 0) as legacy_photo_count,
  COUNT(DISTINCT i.id) as migrated_image_count
FROM photo_collections pc
LEFT JOIN uploads u ON u.couple_id = pc.couple_id AND u.upload_source = 'legacy'
LEFT JOIN images i ON i.upload_id = u.id
WHERE pc.categories IS NOT NULL AND pc.categories != '[]'::jsonb
GROUP BY pc.couple_id, pc.categories
HAVING COALESCE(jsonb_array_length(pc.categories), 0) != COUNT(DISTINCT i.id);
```

## Rollback Procedure

If the migration fails or needs to be rolled back:

```typescript
import { photoMigrationService } from "@/lib/services/photo-migration";

// Rollback the migration
await photoMigrationService.rollbackMigration();

console.log("Migration rolled back successfully");
```

Or manually using SQL:

```sql
-- Delete migrated images
DELETE FROM images
WHERE upload_id IN (
  SELECT id FROM uploads WHERE upload_source = 'legacy'
);

-- Delete legacy uploads
DELETE FROM uploads
WHERE upload_source = 'legacy';

-- Delete default folders created during migration
DELETE FROM folders
WHERE folder_type = 'default'
AND folder_name IN ('Haldi', 'Sangeet', 'Wedding', 'Reception');
```

## Important Notes

1. **Backup First:** Always backup your database before running migrations
2. **Test in Staging:** Test the migration in a staging environment first
3. **Verify Data:** Use the verification queries to ensure data integrity
4. **Monitor Performance:** The migration may take time for large datasets
5. **Preserve Highlights:** The migration preserves highlighted photo selections
6. **Default Folders:** Default folders are created automatically for all couples
7. **Upload Tracking:** All migrated photos are tracked with source "legacy"

## Troubleshooting

### Migration fails with foreign key constraint error

- Ensure the `couples` table exists and has the expected data
- Check that `couple_id` values in `photo_collections` are valid

### Photo count mismatch after migration

- Run the verification query to identify missing images
- Check the database logs for any errors during insertion
- Verify that the JSONB categories array is properly formatted

### Highlighted photos not migrated

- Ensure the `highlight_photos` array is properly formatted
- Check that the filenames or file IDs match between categories and highlight_photos
- Manually update `is_highlighted` if needed

### Default folders not created

- Check that the `folders` table exists
- Verify that the couple_id is valid
- Check for any constraint violations

## Performance Considerations

- The migration processes one couple at a time
- Large photo collections may take several seconds to migrate
- Consider running the migration during off-peak hours
- Monitor database performance during migration

## Next Steps

After successful migration:

1. Update the application to use the new `uploads` and `images` tables
2. Remove references to `photo_collections.categories` JSONB column
3. Update API endpoints to use the new schema
4. Test all photo-related features thoroughly
5. Consider archiving or removing the old `photo_collections` table after verification

## Support

For issues or questions about the migration:

1. Check the verification queries to identify data integrity issues
2. Review the migration logs for error messages
3. Consult the rollback procedure if needed
4. Contact the development team for assistance
