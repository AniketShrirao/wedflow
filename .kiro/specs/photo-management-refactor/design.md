# Design Document: Photo Management Refactor

## Overview

This design refactors the photo management system from storing photos in a JSONB column to a properly normalized relational schema with dedicated `uploads` and `images` tables. The new system tracks upload sessions by user, maintains detailed image metadata, and establishes clear relationships between uploads and images. This enables better tracking, organization, and management of wedding photos across both the dashboard and public website.

## Architecture

### Current State Issues

- Photos stored in `photo_collections.categories` as JSONB
- No tracking of who uploaded photos or when
- No individual image metadata
- Folders not being created properly
- No distinction between upload source (dashboard vs public site)

### New Architecture

```
couples (existing)
    ├─ uploads (new)
    │   ├─ id (UUID)
    │   ├─ couple_id (FK to couples)
    │   ├─ uploader_name (VARCHAR) - guest/photographer name
    │   ├─ uploader_email (VARCHAR) - optional email
    │   ├─ upload_source (VARCHAR) - 'dashboard' or 'public_site'
    │   ├─ status (VARCHAR) - 'pending', 'completed', 'failed'
    │   ├─ google_drive_folder_path (TEXT)
    │   ├─ created_at (TIMESTAMP)
    │   └─ updated_at (TIMESTAMP)
    │       ↓
    │   images (new)
    │       ├─ id (UUID)
    │       ├─ upload_id (FK to uploads)
    │       ├─ couple_id (FK to couples)
    │       ├─ filename (VARCHAR)
    │       ├─ google_drive_file_id (VARCHAR)
    │       ├─ public_url (TEXT)
    │       ├─ category (VARCHAR) - 'Haldi', 'Sangeet', 'Wedding', 'Reception'
    │       ├─ folder (VARCHAR) - logical folder grouping
    │       ├─ is_highlighted (BOOLEAN)
    │       ├─ created_at (TIMESTAMP)
    │       └─ updated_at (TIMESTAMP)
    │
    └─ folders (new)
        ├─ id (UUID)
        ├─ couple_id (FK to couples)
        ├─ folder_name (VARCHAR) - custom folder name
        ├─ folder_type (VARCHAR) - 'default' or 'custom'
        ├─ google_drive_folder_id (VARCHAR)
        ├─ created_at (TIMESTAMP)
        └─ updated_at (TIMESTAMP)
```

## Components and Interfaces

### 1. Database Layer

#### Uploads Table

- Tracks each upload session with user information
- Stores upload source (dashboard or public site)
- Maintains upload status for async processing
- Enables querying uploads by user and date range

#### Images Table

- Stores individual photo metadata
- Links to upload session via `upload_id`
- Maintains category and folder organization
- Tracks highlight status for public display
- Includes Google Drive integration details

#### Folders Table

- Stores default folders (Haldi, Sangeet, Wedding, Reception)
- Stores custom folders created by couples
- Links to Google Drive folder IDs for integration
- Enables querying available folders for a couple

### 2. API Layer

#### Upload Endpoints

- `POST /api/photos/upload` - Create upload session and upload photos
- `GET /api/photos/uploads` - List uploads for authenticated couple
- `GET /api/photos/uploads/:id` - Get specific upload details

#### Image Endpoints

- `GET /api/photos/images` - List images with filtering by category/folder
- `PATCH /api/photos/images/:id` - Update image metadata (category, folder, highlight status)
- `GET /api/photos/images/highlighted` - Get highlighted images for public display
- `DELETE /api/photos/images/:id` - Delete image record

#### Folder Endpoints

- `GET /api/photos/folders` - List all available folders (default and custom)
- `POST /api/photos/folders` - Create custom folder
- `DELETE /api/photos/folders/:id` - Delete custom folder

#### Public Endpoints

- `GET /api/public/[slug]/photos/highlighted` - Get highlighted photos for public site (no auth required)

### 3. Frontend Components

#### Dashboard Components

- **UploadManager**: Unified upload interface for dashboard
  - Accepts single/multiple files and zip uploads
  - Displays upload progress and status
  - Shows upload history with uploader information
- **ImageGallery**: Browse and manage all images
  - Filter by category and folder
  - Mark/unmark as highlighted
  - Bulk operations support
- **UploadHistory**: View all uploads with user details
  - Sort by date and uploader
  - View images from specific upload
- **FolderManager**: Manage custom folders
  - Display default and custom folders
  - Create new custom folders
  - Delete custom folders
  - Show folder creation status

#### Public Site Components

- **PhotoUploadSection**: Guest upload interface
  - Same upload functionality as dashboard
  - Tracks guest name/email
  - Marks upload source as 'public_site'
- **PhotoGallerySection**: Display highlighted photos
  - Shows only highlighted images
  - Organized by category
  - Responsive gallery layout

### 4. Service Layer

#### PhotoService

- `createUploadSession()` - Initialize upload with user info
- `addImagesToUpload()` - Link images to upload session
- `updateImageMetadata()` - Update category, folder, highlight status
- `getHighlightedImages()` - Query for public display
- `getUploadsByUser()` - Query uploads by uploader
- `createCustomFolder()` - Create custom folder for couple
- `getAvailableFolders()` - Get all folders (default and custom) for couple
- `deleteCustomFolder()` - Delete custom folder

#### GoogleDriveService

- `createCategoryFolder()` - Create Haldi/Sangeet/Wedding/Reception folders
- `createCustomFolder()` - Create custom folder in Google Drive
- `uploadPhotoToFolder()` - Upload file to appropriate folder
- `getPublicUrl()` - Generate public share URL for image

## Data Models

### Upload Model

```typescript
interface Upload {
  id: string;
  couple_id: string;
  uploader_name: string;
  uploader_email?: string;
  upload_source: "dashboard" | "public_site";
  status: "pending" | "completed" | "failed";
  google_drive_folder_path: string;
  created_at: Date;
  updated_at: Date;
}
```

### Image Model

```typescript
interface Image {
  id: string;
  upload_id: string;
  couple_id: string;
  filename: string;
  google_drive_file_id: string;
  public_url: string;
  category: "Haldi" | "Sangeet" | "Wedding" | "Reception";
  folder: string;
  is_highlighted: boolean;
  created_at: Date;
  updated_at: Date;
}
```

### Folder Model

```typescript
interface Folder {
  id: string;
  couple_id: string;
  folder_name: string;
  folder_type: "default" | "custom";
  google_drive_folder_id: string;
  created_at: Date;
  updated_at: Date;
}
```

## Error Handling

### Upload Failures

- Validate file types before upload
- Handle Google Drive API errors gracefully
- Retry failed uploads with exponential backoff
- Store error details in upload status

### Data Validation

- Validate category values against allowed list
- Validate folder paths for Google Drive structure
- Ensure couple_id matches authenticated user
- Validate uploader information

### Cascading Operations

- When upload is deleted, cascade delete related images
- Maintain referential integrity through foreign keys
- Implement soft deletes if audit trail needed

## Testing Strategy

### Unit Tests

- Image metadata validation
- Category and folder filtering logic
- Highlight status toggling
- Upload session creation

### Integration Tests

- End-to-end upload flow (dashboard and public site)
- Image retrieval with various filters
- Highlight image queries for public display
- Google Drive integration

### Database Tests

- Foreign key constraints
- RLS policies for data isolation
- Cascade delete operations
- Index performance

## Migration Strategy

### Phase 1: Schema Creation

- Create new `uploads` and `images` tables
- Set up indexes and constraints
- Enable RLS policies

### Phase 2: Data Migration

- Migrate existing photos from `photo_collections.categories` to `images` table
- Create upload sessions for migrated photos
- Maintain referential integrity

### Phase 3: API Implementation

- Implement new endpoints
- Update frontend components
- Test with real data

### Phase 4: Cleanup

- Deprecate old `photo_collections` table usage
- Remove JSONB photo storage
- Archive old data if needed

## Key Design Decisions

1. **Separate Tables**: Using dedicated `uploads` and `images` tables instead of JSONB provides better queryability, indexing, and data integrity.

2. **Upload Tracking**: Recording uploader name/email and upload source enables accountability and distinguishes between dashboard and public site uploads.

3. **Unified Interface**: Same upload component used in both dashboard and public site ensures consistent behavior and data structure.

4. **Highlight Status**: Boolean flag on images table allows efficient querying of public display photos without complex filtering.

5. **Google Drive Integration**: Storing file IDs and public URLs enables efficient retrieval without repeated API calls.

6. **Cascading Deletes**: Foreign key constraints with cascade ensure data consistency when uploads are deleted.

7. **Custom Folders**: Dedicated folders table allows couples to create custom folder categories beyond defaults, with each folder linked to Google Drive for proper organization.
