    # Implementation Plan

- [x] 1. Create database schema for uploads, images, and folders tables
  - Create migration file with uploads, images, and folders table definitions
  - Add foreign key constraints between uploads, images, folders, and couples tables
  - Create indexes on couple_id, upload_id, category, folder, and is_highlighted columns
  - Enable Row Level Security policies for all tables
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 2. Implement photo service layer
  - Create PhotoService class with methods for upload session management
  - Implement createUploadSession() to initialize uploads with user info
  - Implement addImagesToUpload() to link images to upload sessions
  - Implement updateImageMetadata() for category, folder, and highlight updates
  - Implement getHighlightedImages() for public display queries
  - Implement getUploadsByUser() for upload history queries
  - Implement createCustomFolder() for custom folder creation
  - Implement getAvailableFolders() to retrieve all folders
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 3. Create API endpoints for upload management
  - Implement POST /api/photos/upload endpoint to create upload sessions
  - Implement GET /api/photos/uploads endpoint to list uploads for authenticated couple
  - Implement GET /api/photos/uploads/:id endpoint to get specific upload details
  - Add authentication and authorization checks
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 4. Create API endpoints for image management
  - Implement GET /api/photos/images endpoint with filtering by category and folder
  - Implement PATCH /api/photos/images/:id endpoint to update image metadata
  - Implement DELETE /api/photos/images/:id endpoint to delete images
  - Add proper error handling and validation
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 5. Create API endpoints for folder management
  - Implement GET /api/photos/folders endpoint to list all available folders
  - Implement POST /api/photos/folders endpoint to create custom folders
  - Implement DELETE /api/photos/folders/:id endpoint to delete custom folders
  - Add authentication and validation
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 6. Create public API endpoint for highlighted photos
  - Implement GET /api/public/[slug]/photos/highlighted endpoint
  - Return only highlighted images organized by category
  - Ensure no authentication required for public access
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 7. Implement unified upload component for dashboard
  - Create UploadManager component with file input and progress tracking
  - Implement single file, multiple file, and zip file upload support
  - Integrate with PhotoService for upload session creation
  - Display upload status and history
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 8. Implement image gallery component for dashboard
  - Create ImageGallery component to display all images
  - Implement filtering by category and folder
  - Implement toggle for marking images as highlighted
  - Support bulk operations for multiple images
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 9. Implement upload history component for dashboard
  - Create UploadHistory component to display all uploads
  - Show uploader name, email, upload date, and source
  - Enable filtering and sorting by date and uploader
  - Display images from specific upload
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 10. Implement folder management UI component
  - Create FolderManager component in dashboard
  - Display default and custom folders
  - Implement form to create new custom folders
  - Show folder creation status and errors
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 11. Implement photo upload section for public wedding site
  - Create PhotoUploadSection component for guest uploads
  - Reuse unified upload component from dashboard
  - Capture guest name and email for upload tracking
  - Set upload_source to 'public_site' for tracking
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

-

- [x] 12. Implement photo gallery section for public wedding site
  - Create PhotoGallerySection component to display highlighted photos
  - Query highlighted images using public API endpoint
  - Organize photos by category for display
  - Implement responsive gallery layout
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 13. Integrate Google Drive folder creation
  - Implement createCategoryFolder() in GoogleDriveService
  - Create Haldi, Sangeet, Wedding, and Reception folders on first upload
  - Implement createCustomFolder() for custom folder creation in Google Drive
  - Store folder paths and IDs in database
  - Handle folder creation errors gracefully
  - _Requirements: 1.3, 4.5, 9.1, 9.2_

- [x] 14. Migrate existing photo data
  - Create migration script to move photos from photo_collections.categories to images table
  - Create upload sessions for migrated photos with source 'legacy'
  - Maintain referential integrity during migration
  - Verify data integrity after migration
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]\* 15. Write tests for photo management system
  - Write unit tests for PhotoService methods
  - Write integration tests for upload flow (dashboard and public site)
  - Write tests for image filtering and querying
  - Write tests for highlight status operations
  - Write tests for Google Drive integration
  - Write tests for custom folder management
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 9.1, 9.2, 9.3, 9.4, 9.5_
