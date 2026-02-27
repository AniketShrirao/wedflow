# Google Drive Folder Creation Integration Guide

This guide explains how to use the Google Drive folder creation functionality for the photo management system.

## Overview

The folder creation system provides three main capabilities:

1. **Category Folder Initialization** - Create default folders (Haldi, Sangeet, Wedding, Reception) on first upload
2. **Custom Folder Creation** - Allow couples to create custom folder categories
3. **Error Handling** - Graceful error handling with fallback behavior

## Components

### GoogleDriveService Methods

#### `createCategoryFolders(mainFolderId: string): Promise<Record<string, string>>`

Creates the four default category folders in Google Drive.

**Parameters:**

- `mainFolderId` - The Google Drive folder ID where category folders will be created

**Returns:**

- Record mapping category names to their Google Drive folder IDs
- Example: `{ 'Haldi': 'drive-id-1', 'Sangeet': 'drive-id-2', ... }`

**Error Handling:**

- Logs individual folder creation failures but continues with others
- Throws error only if all folders fail to create
- Logs warnings for partial failures

**Example:**

```typescript
const driveService = getDriveService();
const folderIds = await driveService.createCategoryFolders("main-folder-id");
// folderIds = { 'Haldi': 'id1', 'Sangeet': 'id2', 'Wedding': 'id3', 'Reception': 'id4' }
```

#### `createCustomFolder(parentFolderId: string, folderName: string): Promise<string>`

Creates a single custom folder in Google Drive.

**Parameters:**

- `parentFolderId` - The parent folder ID
- `folderName` - Name of the folder to create

**Returns:**

- Google Drive folder ID of the created folder

**Error Handling:**

- Throws descriptive error if folder creation fails
- Logs error details for debugging

**Example:**

```typescript
const driveService = getDriveService();
const folderId = await driveService.createCustomFolder(
  "main-folder-id",
  "Engagement"
);
```

### PhotoService Methods

#### `initializeDefaultFolders(coupleId: string): Promise<Folder[]>`

Creates default folders in the database for a couple.

**Parameters:**

- `coupleId` - The couple's ID

**Returns:**

- Array of created Folder records

**Behavior:**

- Checks if default folders already exist
- Only creates missing folders
- Continues even if some folder creation fails

**Example:**

```typescript
const photoService = new PhotoService();
const folders = await photoService.initializeDefaultFolders("couple-123");
```

#### `updateFolderGoogleDriveIds(coupleId: string, folderMapping: Record<string, string>): Promise<void>`

Updates folder records with Google Drive folder IDs.

**Parameters:**

- `coupleId` - The couple's ID
- `folderMapping` - Record mapping folder names to Google Drive IDs

**Example:**

```typescript
const photoService = new PhotoService();
await photoService.updateFolderGoogleDriveIds("couple-123", {
  Haldi: "drive-id-1",
  Wedding: "drive-id-2",
});
```

#### `getFolderByName(coupleId: string, folderName: string): Promise<Folder | null>`

Retrieves a specific folder by name.

**Parameters:**

- `coupleId` - The couple's ID
- `folderName` - Name of the folder

**Returns:**

- Folder record or null if not found

**Example:**

```typescript
const folder = await photoService.getFolderByName("couple-123", "Haldi");
```

#### `getDefaultFolders(coupleId: string): Promise<Folder[]>`

Retrieves all default folders for a couple.

**Parameters:**

- `coupleId` - The couple's ID

**Returns:**

- Array of default Folder records

**Example:**

```typescript
const defaultFolders = await photoService.getDefaultFolders("couple-123");
```

#### `getCustomFolders(coupleId: string): Promise<Folder[]>`

Retrieves all custom folders for a couple.

**Parameters:**

- `coupleId` - The couple's ID

**Returns:**

- Array of custom Folder records

**Example:**

```typescript
const customFolders = await photoService.getCustomFolders("couple-123");
```

### Folder Initialization Utilities

#### `initializeCategoryFolders(coupleId, mainGoogleDriveFolderId, driveService, photoService)`

High-level function that orchestrates the complete folder initialization process.

**Parameters:**

- `coupleId` - The couple's ID
- `mainGoogleDriveFolderId` - Main Google Drive folder ID
- `driveService` - GoogleDriveService instance
- `photoService` - PhotoService instance

**Returns:**

```typescript
{
  folders: Folder[],
  googleDriveFolderIds: Record<string, string>
}
```

**Behavior:**

1. Checks if default folders already exist
2. Creates category folders in Google Drive if needed
3. Initializes folders in database
4. Updates folder records with Google Drive IDs

**Error Handling:**

- Throws descriptive error if initialization fails
- Logs all steps for debugging

**Example:**

```typescript
import { initializeCategoryFolders } from "@/lib/services/folder-initialization";
import { getDriveService } from "@/lib/google-drive";
import { photoService } from "@/lib/services/photo-service";

const result = await initializeCategoryFolders(
  "couple-123",
  "main-folder-id",
  getDriveService(),
  photoService
);

console.log("Created folders:", result.folders);
console.log("Google Drive IDs:", result.googleDriveFolderIds);
```

#### `createCustomFolderWithGoogleDrive(coupleId, folderName, mainGoogleDriveFolderId, driveService, photoService)`

Creates a custom folder in both Google Drive and database.

**Parameters:**

- `coupleId` - The couple's ID
- `folderName` - Name of the custom folder
- `mainGoogleDriveFolderId` - Main Google Drive folder ID
- `driveService` - GoogleDriveService instance
- `photoService` - PhotoService instance

**Returns:**

```typescript
{
  folder: Folder,
  googleDriveFolderId: string
}
```

**Behavior:**

1. Checks if folder already exists
2. Creates folder in Google Drive
3. Creates folder record in database
4. Returns both folder record and Google Drive ID

**Example:**

```typescript
import { createCustomFolderWithGoogleDrive } from "@/lib/services/folder-initialization";

const result = await createCustomFolderWithGoogleDrive(
  "couple-123",
  "Engagement",
  "main-folder-id",
  getDriveService(),
  photoService
);

console.log("Created folder:", result.folder);
console.log("Google Drive ID:", result.googleDriveFolderId);
```

#### `getOrCreateCategoryFolder(coupleId, category, mainGoogleDriveFolderId, driveService, photoService)`

Gets an existing category folder or creates it if it doesn't exist.

**Parameters:**

- `coupleId` - The couple's ID
- `category` - Category name
- `mainGoogleDriveFolderId` - Main Google Drive folder ID
- `driveService` - GoogleDriveService instance
- `photoService` - PhotoService instance

**Returns:**

- Google Drive folder ID

**Behavior:**

1. Checks if folder exists in database with Google Drive ID
2. Returns existing ID if found
3. Creates folder if it doesn't exist
4. Updates database with Google Drive ID

**Example:**

```typescript
import { getOrCreateCategoryFolder } from "@/lib/services/folder-initialization";

const folderId = await getOrCreateCategoryFolder(
  "couple-123",
  "Wedding",
  "main-folder-id",
  getDriveService(),
  photoService
);

// Use folderId for uploading photos
```

#### `handleFolderCreationError(error, context)`

Handles and logs folder creation errors gracefully.

**Parameters:**

- `error` - The error object or message
- `context` - Context string describing where the error occurred

**Behavior:**

- Logs error message and stack trace
- Can be extended to send to error tracking services (e.g., Sentry)

**Example:**

```typescript
import { handleFolderCreationError } from '@/lib/services/folder-initialization';

try {
  await initializeCategoryFolders(...);
} catch (error) {
  handleFolderCreationError(error, 'upload-initialization');
}
```

## Usage Patterns

### Pattern 1: Initialize Folders on First Upload

```typescript
import { initializeCategoryFolders } from "@/lib/services/folder-initialization";
import { getDriveService } from "@/lib/google-drive";
import { photoService } from "@/lib/services/photo-service";

async function handleFirstUpload(coupleId: string, mainFolderId: string) {
  try {
    const { folders, googleDriveFolderIds } = await initializeCategoryFolders(
      coupleId,
      mainFolderId,
      getDriveService(),
      photoService
    );

    console.log("Folders initialized:", folders);
    return googleDriveFolderIds;
  } catch (error) {
    console.error("Failed to initialize folders:", error);
    throw error;
  }
}
```

### Pattern 2: Create Custom Folder

```typescript
import { createCustomFolderWithGoogleDrive } from "@/lib/services/folder-initialization";

async function createCustomFolder(coupleId: string, folderName: string) {
  try {
    const { folder, googleDriveFolderId } =
      await createCustomFolderWithGoogleDrive(
        coupleId,
        folderName,
        mainFolderId,
        getDriveService(),
        photoService
      );

    return { folder, googleDriveFolderId };
  } catch (error) {
    console.error(`Failed to create folder "${folderName}":`, error);
    throw error;
  }
}
```

### Pattern 3: Get Folder for Upload

```typescript
import { getOrCreateCategoryFolder } from "@/lib/services/folder-initialization";

async function getFolderForUpload(coupleId: string, category: string) {
  try {
    const folderId = await getOrCreateCategoryFolder(
      coupleId,
      category,
      mainFolderId,
      getDriveService(),
      photoService
    );

    return folderId;
  } catch (error) {
    console.error(`Failed to get folder for category "${category}":`, error);
    throw error;
  }
}
```

## Database Schema

The `folders` table stores folder information:

```sql
CREATE TABLE folders (
  id UUID PRIMARY KEY,
  couple_id UUID NOT NULL REFERENCES couples(id),
  folder_name VARCHAR NOT NULL,
  folder_type 'default' | 'custom' NOT NULL,
  google_drive_folder_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Error Handling

The system handles errors gracefully:

1. **Partial Failures** - If some folders fail to create, others continue
2. **Logging** - All errors are logged with context for debugging
3. **Fallback Behavior** - System continues with available folders
4. **User Feedback** - Errors are wrapped with descriptive messages

## Testing

All folder creation functionality is covered by unit tests:

```bash
npm run test -- src/lib/services/__tests__/folder-initialization.test.ts
```

Tests cover:

- Successful folder creation
- Handling existing folders
- Error scenarios
- Partial failures
- Database updates

## Requirements Mapping

This implementation satisfies the following requirements:

- **Requirement 1.3**: Store Google Drive folder path where photos were uploaded
- **Requirement 4.5**: Maintain consistency between Image_Folder and actual Google Drive folder structure
- **Requirement 9.1**: Allow couples to create custom Image_Folder categories
- **Requirement 9.2**: Create corresponding folder in Google Drive when custom folder is created

## Performance Considerations

1. **Caching** - Folder information is cached in the database to avoid repeated API calls
2. **Batch Operations** - Multiple folders are created in sequence, not parallel
3. **Error Recovery** - Failed operations don't block other folder creation
4. **Database Indexing** - Folders table should be indexed on `couple_id` and `folder_name`

## Future Enhancements

1. Parallel folder creation for better performance
2. Folder deletion with cascading image updates
3. Folder renaming support
4. Folder sharing and permissions management
5. Folder analytics and usage tracking
