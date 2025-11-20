# Requirements Document

## Introduction

Wedflow is a modern, Gen-Z friendly web application that enables couples to manage their wedding events digitally. The platform provides comprehensive tools for guest management, digital invitations, photo collection and sharing, gift coordination, and event planning. The system is designed to be simple enough for non-technical users while being scalable for SaaS deployment.

## Glossary

- **Wedflow**: The complete web application system for wedding management
- **Couple_Account**: A registered user account representing an engaged couple
- **Guest_Record**: A stored contact entry containing guest information
- **Digital_Invitation**: An electronic wedding invitation sent via messaging platforms
- **Event_Page**: A public webpage displaying wedding event information
- **Photo_Gallery**: A collection of wedding photos organized by event categories
- **Gift_Portal**: A digital interface for receiving monetary gifts via UPI
- **Todo_Planner**: A task management system for wedding preparation
- **Workspace**: A private area containing all data for a specific couple
- **Public_Wedding_Site**: The publicly accessible wedding information page
- **Vendor_Contact**: A stored contact entry for wedding service providers
- **Contacts_Directory**: A categorized list of wedding vendor contacts

## Requirements

### Requirement 1

**User Story:** As a couple planning our wedding, I want to create and manage a guest list, so that I can organize invitations and track attendees.

#### Acceptance Criteria

1. THE Wedflow SHALL provide a form interface for manual guest entry
2. WHEN a couple enters guest information, THE Wedflow SHALL store the guest name, phone number, and optional group designation
3. THE Wedflow SHALL support bulk guest import via text paste or Excel file upload
4. THE Wedflow SHALL generate WhatsApp deep links for each guest invitation
5. THE Wedflow SHALL provide SMS-compatible invitation links for manual distribution

### Requirement 2

**User Story:** As a couple, I want a secure dashboard to control all aspects of my wedding platform, so that I can manage my event privately and efficiently.

#### Acceptance Criteria

1. THE Wedflow SHALL provide email/password or OTP-based authentication
2. WHEN a couple logs in, THE Wedflow SHALL display a dashboard with access to guest list, event details, photo collections, invite links, and gift portal
3. THE Wedflow SHALL ensure each Couple_Account has an isolated Workspace
4. THE Wedflow SHALL generate unique public URLs for each couple's wedding site
5. WHILE a couple is logged in, THE Wedflow SHALL maintain session security and data privacy

### Requirement 3

**User Story:** As a couple, I want to create beautiful public event pages, so that our guests can easily find wedding information and venue details.

#### Acceptance Criteria

1. THE Wedflow SHALL generate a Public_Wedding_Site with couple introduction, wedding dates, and event sections
2. THE Wedflow SHALL display venue details with Google Maps location embeds
3. THE Wedflow SHALL present a timeline and schedule of wedding events
4. THE Wedflow SHALL ensure the Public_Wedding_Site is accessible without authentication
5. THE Wedflow SHALL make the Public_Wedding_Site responsive for mobile and desktop viewing

### Requirement 4

**User Story:** As a couple, I want guests and photographers to easily upload photos to our Google Drive, so that we can collect all wedding memories in one place.

#### Acceptance Criteria

1. THE Wedflow SHALL integrate with Google Drive using the couple's provided folder link
2. WHEN guests access the photo upload interface, THE Wedflow SHALL allow individual photo uploads, multiple file uploads, and zip file uploads
3. THE Wedflow SHALL upload photos directly to the couple's Google Drive folder
4. THE Wedflow SHALL organize uploaded photos into categorized folders (Haldi, Sangeet, Wedding, Reception)
5. THE Wedflow SHALL display the Photo_Gallery using public-share Google Drive URLs

### Requirement 5

**User Story:** As a couple, I want to showcase selected wedding photos on our public site, so that guests can view and enjoy our special moments.

#### Acceptance Criteria

1. THE Wedflow SHALL display photos organized by event categories in the Photo_Gallery
2. THE Wedflow SHALL allow couples to select highlight photos for public display
3. THE Wedflow SHALL render the Photo_Gallery on the Public_Wedding_Site
4. THE Wedflow SHALL load photos efficiently from Google Drive public URLs
5. THE Wedflow SHALL provide a responsive gallery interface for all device types

### Requirement 6

**User Story:** As a couple, I want to receive digital gifts through UPI, so that guests can easily send monetary blessings.

#### Acceptance Criteria

1. THE Wedflow SHALL display a Gift_Portal with UPI QR code and UPI ID
2. THE Wedflow SHALL allow couples to upload their UPI QR image
3. THE Wedflow SHALL provide a clear call-to-action for guests to send gifts
4. THE Wedflow SHALL make the Gift_Portal accessible from the Public_Wedding_Site
5. THE Wedflow SHALL present gift information in a user-friendly format

### Requirement 7

**User Story:** As a couple, I want a wedding planning checklist, so that I can track preparation tasks and stay organized.

#### Acceptance Criteria

1. THE Wedflow SHALL provide a Todo_Planner with preloaded wedding tasks
2. THE Wedflow SHALL allow couples to add custom tasks to their checklist
3. THE Wedflow SHALL enable task completion tracking with tick/untick functionality
4. THE Wedflow SHALL organize tasks into simple categories
5. THE Wedflow SHALL save task progress persistently for each Couple_Account

### Requirement 8

**User Story:** As a couple planning our wedding, I want to manage vendor contacts like decorators, event coordinators, hall managers, and transport providers, so that I can easily access important contact information during wedding planning.

#### Acceptance Criteria

1. THE Wedflow SHALL provide a Contacts_Directory organized by vendor categories (decorators, event coordinators, hall managers, transport providers, photographers, caterers)
2. THE Wedflow SHALL allow couples to add Vendor_Contact entries with name, phone number, email, service category, and notes
3. THE Wedflow SHALL enable couples to edit and delete vendor contact information
4. THE Wedflow SHALL provide search and filter functionality within the Contacts_Directory
5. THE Wedflow SHALL display vendor contacts in an organized, easily accessible format

### Requirement 9

**User Story:** As a couple using automation tools, I want webhook integration, so that I can connect my wedding platform with external systems.

#### Acceptance Criteria

1. THE Wedflow SHALL provide webhook endpoints for invitation triggers
2. THE Wedflow SHALL send webhook notifications for photo upload events
3. THE Wedflow SHALL support webhook integration for guest management updates
4. THE Wedflow SHALL ensure webhook endpoints are secure and authenticated
5. THE Wedflow SHALL maintain webhook reliability for external system integration
