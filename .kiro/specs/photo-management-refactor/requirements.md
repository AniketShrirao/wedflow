# Requirements Document

## Introduction

The Photo Management Refactor feature redesigns the photo storage and organization system to properly track photo uploads by different users, maintain detailed image metadata, and establish correct relationships between uploads and images. Currently, photos are incorrectly stored in the `photo_collections.categories` JSONB column. This refactor introduces dedicated `uploads` and `images` tables with proper foreign key relationships, enabling better tracking, organization, and management of wedding photos.

## Glossary

- **Upload_Session**: A single upload event initiated by a user containing one or more photos
- **Upload_User**: A user (guest or photographer) who uploads photos to the system
- **Image_Record**: An individual photo file with associated metadata
- **Image_Category**: A classification for photos (Haldi, Sangeet, Wedding, Reception)
- **Image_Folder**: A logical grouping of images within Google Drive
- **Highlight_Image**: A photo selected by the couple for public display
- **Photo_Management_System**: The complete system for tracking uploads, images, and their relationships
- **Couple_Account**: The wedding couple who owns the photo collection
- **Google_Drive_Integration**: The system's connection to Google Drive for photo storage

## Requirements

### Requirement 1

**User Story:** As a couple, I want to track which users uploaded photos and when, so that I can acknowledge contributors and manage photo submissions.

#### Acceptance Criteria

1. THE Photo_Management_System SHALL create an Upload_Session record for each upload event
2. WHEN a user uploads photos, THE Photo_Management_System SHALL record the Upload_User identifier, upload timestamp, and upload source (guest or photographer)
3. THE Photo_Management_System SHALL store the Google Drive folder path where photos were uploaded
4. THE Photo_Management_System SHALL maintain upload status (pending, completed, failed)
5. THE Photo_Management_System SHALL enable querying uploads by Upload_User and date range

### Requirement 2

**User Story:** As a couple, I want detailed metadata for each photo, so that I can organize, search, and manage my photo collection effectively.

#### Acceptance Criteria

1. THE Photo_Management_System SHALL create an Image_Record for each uploaded photo
2. WHEN an Image_Record is created, THE Photo_Management_System SHALL store the photo filename, Google Drive file ID, and public URL
3. THE Photo_Management_System SHALL store Image_Category classification (Haldi, Sangeet, Wedding, Reception)
4. THE Photo_Management_System SHALL track whether an Image_Record is marked as highlighted for public display
5. THE Photo_Management_System SHALL store the Image_Folder path indicating the logical grouping within Google Drive

### Requirement 3

**User Story:** As a couple, I want proper relationships between uploads and images, so that I can trace which user uploaded which photos.

#### Acceptance Criteria

1. THE Photo_Management_System SHALL establish a foreign key relationship between Image_Record and Upload_Session
2. WHEN querying images, THE Photo_Management_System SHALL enable filtering by Upload_Session to see all photos from a specific upload
3. THE Photo_Management_System SHALL enable querying all Image_Records for a specific Upload_User through the Upload_Session relationship
4. THE Photo_Management_System SHALL maintain referential integrity when deleting Upload_Session records
5. THE Photo_Management_System SHALL support cascading operations for related Image_Records

### Requirement 4

**User Story:** As a couple, I want to organize photos by event category and folder, so that my photo collection is well-structured and easy to navigate.

#### Acceptance Criteria

1. THE Photo_Management_System SHALL allow filtering Image_Records by Image_Category
2. THE Photo_Management_System SHALL allow filtering Image_Records by Image_Folder
3. THE Photo_Management_System SHALL support querying images by both category and folder simultaneously
4. THE Photo_Management_System SHALL enable updating Image_Category and Image_Folder for existing Image_Records
5. THE Photo_Management_System SHALL maintain consistency between Image_Folder and actual Google Drive folder structure

### Requirement 5

**User Story:** As a couple, I want to select and manage highlight photos for public display, so that I can curate the best moments for my wedding site.

#### Acceptance Criteria

1. THE Photo_Management_System SHALL allow marking Image_Records as highlighted
2. THE Photo_Management_System SHALL enable unmarking highlighted Image_Records
3. THE Photo_Management_System SHALL support querying all highlighted Image_Records for a Couple_Account
4. THE Photo_Management_System SHALL maintain a list of highlighted images separate from the full photo collection
5. THE Photo_Management_System SHALL enable bulk operations for marking multiple images as highlighted

### Requirement 6

**User Story:** As a developer, I want the database schema to properly support photo management, so that the system is scalable and maintainable.

#### Acceptance Criteria

1. THE Photo_Management_System SHALL create an uploads table with proper structure and indexes
2. THE Photo_Management_System SHALL create an images table with proper structure and indexes
3. THE Photo_Management_System SHALL establish foreign key constraints between uploads and images tables
4. THE Photo_Management_System SHALL establish foreign key constraints between uploads and couples tables
5. THE Photo_Management_System SHALL enable Row Level Security policies for both tables to ensure data privacy

### Requirement 7

**User Story:** As a guest on the public wedding site, I want to upload photos using the same upload system as the dashboard, so that all photos are tracked consistently regardless of upload source.

#### Acceptance Criteria

1. THE Photo_Management_System SHALL provide a unified upload interface accessible from both the dashboard and public wedding site
2. WHEN a guest uploads photos from the public site, THE Photo_Management_System SHALL create an Upload_Session with guest identifier
3. THE Photo_Management_System SHALL track uploads from public site with the same metadata as dashboard uploads
4. THE Photo_Management_System SHALL organize public site uploads into the same Image_Category and Image_Folder structure
5. THE Photo_Management_System SHALL ensure public site uploads are associated with the correct Couple_Account

### Requirement 8

**User Story:** As a guest viewing the public wedding site, I want to see the couple's curated highlight photos in the photo gallery section, so that I can view the best moments from the wedding.

#### Acceptance Criteria

1. THE Photo_Management_System SHALL query all Image_Records marked as highlighted for the Couple_Account
2. THE Photo_Management_System SHALL provide an API endpoint that returns highlighted images for public access
3. WHEN the public wedding site loads the photo gallery section, THE Photo_Management_System SHALL display only highlighted Image_Records
4. THE Photo_Management_System SHALL organize highlighted images by Image_Category for display
5. THE Photo_Management_System SHALL load highlighted images efficiently using public Google Drive URLs

### Requirement 9

**User Story:** As a couple managing my photo collection, I want to create custom folder categories beyond the default ones, so that I can organize photos according to my specific needs.

#### Acceptance Criteria

1. THE Photo_Management_System SHALL allow couples to create custom Image_Folder categories in the dashboard
2. WHEN a couple creates a custom folder, THE Photo_Management_System SHALL create the corresponding folder in Google Drive
3. THE Photo_Management_System SHALL enable assigning images to custom folders
4. THE Photo_Management_System SHALL support querying images by custom folders
5. THE Photo_Management_System SHALL maintain a list of available folders for the Couple_Account
