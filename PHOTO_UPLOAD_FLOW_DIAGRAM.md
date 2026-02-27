# Photo Upload Flow Diagram & Architecture

## Complete Upload Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PHOTO UPLOAD SYSTEM FLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

1. USER INITIATES UPLOAD
   ├─ Dashboard Upload Manager
   │  ├─ Select photos or ZIP file
   │  ├─ Choose category (Haldi, Sangeet, Wedding, Reception)
   │  └─ Click "Upload"
   │
   └─ Public Site Upload Section
      ├─ Enter name and email
      ├─ Select photos
      └─ Click "Upload"

2. GOOGLE DRIVE AUTHENTICATION
   ├─ Check for existing session
   ├─ If no session: Show "Connect Google Drive" button
   ├─ User authenticates with Google
   ├─ Token saved to localStorage
   └─ Status: "Connected to Google Drive"

3. FILE PROCESSING
   ├─ Validate file types (images only)
   ├─ Check file sizes
   ├─ Extract ZIP files if needed
   ├─ Process each file
   └─ Display selected files

4. UPLOAD SESSION CREATION
   ├─ Call PhotoService.createUploadSession()
   ├─ Create record in uploads table:
   │  ├─ couple_id
   │  ├─ uploader_name
   │  ├─ uploader_email
   │  ├─ upload_source (dashboard or public_site)
   │  ├─ status = 'pending'
   │  └─ google_drive_folder_path
   └─ Return upload_id

5. CATEGORY FOLDER CREATION
   ├─ Check if category folder exists in Google Drive
   ├─ If not: Create subfolder (Haldi, Sangeet, Wedding, Reception)
   ├─ Get or create folder ID
   └─ Use for file uploads

6. FILE UPLOAD TO GOOGLE DRIVE
   ├─ For each selected file:
   │  ├─ Upload to Google Drive category folder
   │  ├─ Track upload progress
   │  ├─ Get file ID and public URL
   │  └─ Store metadata
   └─ All files uploaded

7. IMAGE RECORD CREATION
   ├─ Call PhotoService.addImagesToUpload()
   ├─ For each uploaded file, create image record:
   │  ├─ upload_id (from step 4)
   │  ├─ couple_id
   │  ├─ filename
   │  ├─ google_drive_file_id
   │  ├─ public_url
   │  ├─ category
   │  ├─ folder
   │  └─ is_highlighted = false
   └─ Update upload status = 'completed'

8. DATABASE STORAGE
   ├─ uploads table:
   │  └─ One record per upload session
   │
   └─ images table:
      └─ One record per image file

9. USER FEEDBACK
   ├─ Show success message
   ├─ Display upload summary
   ├─ Clear file selection
   └─ Trigger onUploadComplete callback

10. IMAGE MANAGEMENT
    ├─ View in Image Gallery
    ├─ Filter by category or folder
    ├─ Mark as highlighted
    ├─ Assign to folders
    └─ Delete if needed

11. PUBLIC DISPLAY
    ├─ Highlighted images shown on public site
    ├─ Organized by category
    ├─ Responsive gallery layout
    └─ No authentication required
```

## Database Schema Relationships

```
┌──────────────────────────────────────────────────────────────────┐
│                      DATABASE SCHEMA                              │
└──────────────────────────────────────────────────────────────────┘

couples (existing)
  ├─ id (UUID)
  ├─ user_id (FK to auth.users)
  ├─ couple_slug
  ├─ partner1_name
  ├─ partner2_name
  └─ wedding_date

  ↓ (one-to-many)

uploads (new)
  ├─ id (UUID) ← PRIMARY KEY
  ├─ couple_id (FK to couples)
  ├─ uploader_name
  ├─ uploader_email
  ├─ upload_source (dashboard | public_site | legacy)
  ├─ status (pending | completed | failed)
  ├─ google_drive_folder_path
  ├─ created_at
  └─ updated_at

  ↓ (one-to-many)

images (new)
  ├─ id (UUID) ← PRIMARY KEY
  ├─ upload_id (FK to uploads) ← FOREIGN KEY
  ├─ couple_id (FK to couples) ← FOREIGN KEY
  ├─ filename
  ├─ google_drive_file_id
  ├─ public_url
  ├─ category (Haldi | Sangeet | Wedding | Reception)
  ├─ folder
  ├─ is_highlighted (boolean)
  ├─ created_at
  └─ updated_at

folders (new)
  ├─ id (UUID) ← PRIMARY KEY
  ├─ couple_id (FK to couples) ← FOREIGN KEY
  ├─ folder_name
  ├─ folder_type (default | custom)
  ├─ google_drive_folder_id
  ├─ created_at
  └─ updated_at

photo_collections (legacy - being phased out)
  ├─ id (UUID)
  ├─ couple_id (FK to couples)
  ├─ drive_folder_url
  ├─ categories (JSONB) ← BEING MIGRATED
  ├─ highlight_photos (JSONB) ← BEING MIGRATED
  └─ updated_at
```

## API Endpoints

```
┌──────────────────────────────────────────────────────────────────┐
│                      API ENDPOINTS                                │
└──────────────────────────────────────────────────────────────────┘

UPLOAD MANAGEMENT
├─ POST /api/photos/upload
│  └─ Create upload session and upload files
│
├─ GET /api/photos/uploads
│  └─ List all uploads for authenticated couple
│
└─ GET /api/photos/uploads/:id
   └─ Get specific upload details with images

IMAGE MANAGEMENT
├─ GET /api/photos/images
│  └─ List images with optional filtering
│     ├─ ?category=Wedding
│     ├─ ?folder=Haldi
│     └─ ?highlighted=true
│
├─ PATCH /api/photos/images/:id
│  └─ Update image metadata
│     ├─ category
│     ├─ folder
│     └─ is_highlighted
│
└─ DELETE /api/photos/images/:id
   └─ Delete image

FOLDER MANAGEMENT
├─ GET /api/photos/folders
│  └─ List all folders (default and custom)
│
├─ POST /api/photos/folders
│  └─ Create custom folder
│
└─ DELETE /api/photos/folders/:id
   └─ Delete custom folder

PUBLIC ENDPOINTS
└─ GET /api/public/[slug]/photos/highlighted
   └─ Get highlighted images for public site
      └─ No authentication required
```

## Component Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    COMPONENT HIERARCHY                            │
└──────────────────────────────────────────────────────────────────┘

Dashboard
├─ UploadManager
│  ├─ Google Drive Authentication
│  ├─ File Selection
│  ├─ Category Selection
│  ├─ Upload Progress
│  └─ Delete Options
│
├─ ImageGallery
│  ├─ Image Display
│  ├─ Category Filter
│  ├─ Folder Filter
│  ├─ Highlight Toggle
│  └─ Bulk Operations
│
├─ UploadHistory
│  ├─ Upload List
│  ├─ Uploader Info
│  ├─ Image Count
│  └─ Upload Details
│
└─ FolderManager
   ├─ Default Folders
   ├─ Custom Folders
   ├─ Create Folder
   └─ Delete Folder

Public Site
├─ PhotoUploadSection
│  ├─ Guest Name Input
│  ├─ Guest Email Input
│  ├─ File Selection
│  └─ Upload Progress
│
└─ PhotoGallerySection
   ├─ Highlighted Images
   ├─ Category Organization
   └─ Responsive Layout
```

## Service Layer

```
┌──────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                                  │
└──────────────────────────────────────────────────────────────────┘

PhotoService
├─ createUploadSession()
│  └─ Creates upload record in database
│
├─ addImagesToUpload()
│  └─ Creates image records and links to upload
│
├─ updateImageMetadata()
│  └─ Updates category, folder, highlight status
│
├─ getHighlightedImages()
│  └─ Retrieves highlighted images for public display
│
├─ getUploadsByUser()
│  └─ Retrieves uploads by uploader
│
├─ createCustomFolder()
│  └─ Creates custom folder in database
│
├─ getAvailableFolders()
│  └─ Retrieves all folders for couple
│
└─ [Additional utility methods]

GoogleDriveService
├─ authenticate()
│  └─ Authenticates with Google Drive
│
├─ uploadFile()
│  └─ Uploads file to Google Drive
│
├─ createSubfolder()
│  └─ Creates category folder
│
├─ createCategoryFolders()
│  └─ Creates all default category folders
│
├─ deleteFile()
│  └─ Deletes file from Google Drive
│
└─ [Additional utility methods]

PhotoMigrationService
├─ getLegacyPhotoCollections()
│  └─ Retrieves legacy photo data
│
├─ migratePhotoCollection()
│  └─ Migrates photos to new schema
│
├─ executeMigration()
│  └─ Runs full migration
│
└─ verifyMigrationIntegrity()
   └─ Verifies data integrity
```

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                      DATA FLOW                                    │
└──────────────────────────────────────────────────────────────────┘

USER SELECTS FILES
        ↓
   FILE VALIDATION
        ↓
   GOOGLE DRIVE AUTH
        ↓
   CREATE UPLOAD SESSION
        ↓
   CREATE CATEGORY FOLDER (if needed)
        ↓
   UPLOAD FILES TO GOOGLE DRIVE
        ↓
   GET FILE IDs & PUBLIC URLs
        ↓
   CREATE IMAGE RECORDS
        ↓
   UPDATE UPLOAD STATUS
        ↓
   DISPLAY SUCCESS MESSAGE
        ↓
   IMAGES AVAILABLE IN GALLERY
        ↓
   USER CAN HIGHLIGHT IMAGES
        ↓
   HIGHLIGHTED IMAGES SHOWN ON PUBLIC SITE
```

## State Management

```
┌──────────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                               │
└──────────────────────────────────────────────────────────────────┘

UploadManager State
├─ selectedFiles: File[]
├─ selectedCategory: ImageCategory
├─ uploadProgress: UploadProgress[]
├─ isUploading: boolean
├─ driveAuthenticated: boolean
├─ driveFolderUrl: string | null
└─ isLoadingFolder: boolean

ImageGallery State
├─ images: Image[]
├─ selectedImages: string[]
├─ categoryFilter: ImageCategory | null
├─ folderFilter: string | null
├─ isLoading: boolean
└─ error: string | null

UploadHistory State
├─ uploads: Upload[]
├─ selectedUpload: Upload | null
├─ sortBy: 'date' | 'uploader' | 'count'
├─ isLoading: boolean
└─ error: string | null

FolderManager State
├─ folders: Folder[]
├─ isCreating: boolean
├─ newFolderName: string
├─ isLoading: boolean
└─ error: string | null
```

## Error Handling Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING                                 │
└──────────────────────────────────────────────────────────────────┘

ERROR OCCURS
    ↓
CATCH ERROR
    ↓
DETERMINE ERROR TYPE
    ├─ Network Error
    │  └─ Show: "Connection failed. Please try again."
    │
    ├─ Google Drive Error
    │  └─ Show: "Google Drive error: [error message]"
    │
    ├─ Validation Error
    │  └─ Show: "Invalid file: [reason]"
    │
    ├─ Database Error
    │  └─ Show: "Failed to save data. Please try again."
    │
    └─ Unknown Error
       └─ Show: "An unexpected error occurred."
    ↓
LOG ERROR
    ├─ Console log
    ├─ Error tracking service
    └─ User notification
    ↓
ALLOW USER TO RETRY
    └─ Show retry button or option
```

## Security & RLS

```
┌──────────────────────────────────────────────────────────────────┐
│                    SECURITY & RLS POLICIES                        │
└──────────────────────────────────────────────────────────────────┘

uploads Table RLS
├─ SELECT: Users can only see their own couple's uploads
├─ INSERT: Only authenticated users can create uploads
├─ UPDATE: Only couple can update their uploads
└─ DELETE: Only couple can delete their uploads

images Table RLS
├─ SELECT: Users can only see their own couple's images
├─ INSERT: Only authenticated users can create images
├─ UPDATE: Only couple can update their images
└─ DELETE: Only couple can delete their images

folders Table RLS
├─ SELECT: Users can only see their own couple's folders
├─ INSERT: Only authenticated users can create folders
├─ UPDATE: Only couple can update their folders
└─ DELETE: Only couple can delete their folders

Public Endpoints
├─ /api/public/[slug]/photos/highlighted
│  └─ No authentication required
│  └─ Returns only highlighted images
│  └─ Validates couple slug
└─ No sensitive data exposed
```

## Performance Optimization

```
┌──────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE OPTIMIZATION                       │
└──────────────────────────────────────────────────────────────────┘

Database Indexes
├─ idx_uploads_couple_id
├─ idx_uploads_upload_source
├─ idx_uploads_status
├─ idx_images_couple_id
├─ idx_images_upload_id
├─ idx_images_category
├─ idx_images_folder
├─ idx_images_is_highlighted
├─ idx_images_couple_category
├─ idx_images_couple_highlighted
├─ idx_folders_couple_id
└─ idx_folders_couple_type

Query Optimization
├─ Use indexed columns in WHERE clauses
├─ Limit result sets with pagination
├─ Use SELECT specific columns (not *)
├─ Batch operations when possible
└─ Cache frequently accessed data

Frontend Optimization
├─ Lazy load images
├─ Paginate large image lists
├─ Debounce filter operations
├─ Cache API responses
└─ Optimize component re-renders
```

## Testing Strategy

```
┌──────────────────────────────────────────────────────────────────┐
│                    TESTING STRATEGY                               │
└──────────────────────────────────────────────────────────────────┘

Unit Tests
├─ PhotoService methods
├─ GoogleDriveService methods
├─ Component rendering
└─ Utility functions

Integration Tests
├─ Upload flow end-to-end
├─ Database operations
├─ API endpoints
└─ Google Drive integration

E2E Tests
├─ User upload flow
├─ Image gallery interaction
├─ Folder management
└─ Public site display

Property-Based Tests
├─ Data consistency
├─ Referential integrity
├─ State transitions
└─ Error handling
```

## Deployment Checklist

```
┌──────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT CHECKLIST                           │
└──────────────────────────────────────────────────────────────────┘

Pre-Deployment
├─ [ ] All tests passing
├─ [ ] Code review completed
├─ [ ] Database migrations tested
├─ [ ] Environment variables configured
├─ [ ] Google Drive API credentials set
└─ [ ] Backup created

Deployment
├─ [ ] Run database migrations
├─ [ ] Deploy application code
├─ [ ] Verify API endpoints
├─ [ ] Test upload flow
├─ [ ] Monitor error logs
└─ [ ] Verify public site

Post-Deployment
├─ [ ] Monitor performance
├─ [ ] Check error tracking
├─ [ ] Verify user uploads
├─ [ ] Test public gallery
├─ [ ] Gather user feedback
└─ [ ] Document any issues
```
