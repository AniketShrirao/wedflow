# Implementation Plan

- [x] 1. Project Setup and Core Infrastructure

  - Initialize Next.js 14 project with App Router and configure TailwindCSS with ShadCN UI components
  - Set up Supabase project with database, authentication, and environment configuration
  - Configure Sanity CMS project with studio setup and schema definitions
  - _Requirements: 2.1, 2.3_

- [x] 1.1 Database Schema and Security Setup

  - Create PostgreSQL tables for couples, guests, vendor_contacts, event_details, photo_collections, gift_settings, and todo_tasks
  - Implement Row Level Security (RLS) policies for multi-tenant data isolation
  - Set up database migrations and seed data for development
  - _Requirements: 2.3, 1.1, 8.1_

- [x] 1.2 Authentication System Implementation

  - Implement Supabase Auth integration with email/password and OTP authentication
  - Create authentication middleware for protected routes and API endpoints
  - Build login, register, and logout components with form validation
  - _Requirements: 2.1, 2.5_

- [ ]\* 1.3 Basic Testing Setup

  - Configure Jest and React Testing Library for component testing
  - Set up Playwright for end-to-end testing
  - Create basic test utilities and mock data generators
  - _Requirements: 2.1, 2.3_

- [x] 2. Dashboard Layout and Navigation

  - Create responsive dashboard layout with sidebar navigation and header components
  - Implement dynamic content area with route-based component rendering
  - Build notification center component for system alerts and updates
  - _Requirements: 2.2, 2.5_

- [x] 2.1 Couple Workspace and Profile Management

  - Create couple profile setup form with partner names, wedding date, and unique slug generation
  - Implement workspace isolation logic and couple-specific data access patterns
  - Build profile editing interface with validation and update functionality
  - _Requirements: 2.3, 2.4_

- [x] 3. Guest Management Module

  - Create guest list display component with search, filter, and pagination functionality
  - Implement guest entry form with name, phone, email, and group fields
  - Build bulk import functionality for text paste and Excel file upload
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 3.1 Digital Invitation System

  - Generate WhatsApp deep links and SMS-compatible invitation URLs for each guest
  - Create invitation preview component showing personalized message content
  - Implement invitation status tracking (pending, sent, viewed) with database updates
  - _Requirements: 1.4, 1.5_

- [x] 3.2 Twilio Integration for Messaging

  - Set up Twilio API client with SMS and WhatsApp messaging capabilities
  - Create invitation sending service with personalized message generation
  - Implement delivery status webhooks and guest notification tracking
  - _Requirements: 1.4, 1.5_

- [ ]\* 3.3 Guest Management Testing

  - Write unit tests for guest CRUD operations and validation logic
  - Create integration tests for bulk import functionality
  - Test invitation generation and Twilio messaging integration
  - _Requirements: 1.1, 1.4_

- [x] 4. Vendor Contacts Directory

  - Create vendor contacts list with category-based organization and search functionality
  - Implement contact entry form with name, phone, email, category, and notes fields
  - Build category filter component with predefined vendor types (decorator, event coordinator, hall manager, transport, photographer, caterer)
  - _Requirements: 8.1, 8.2, 8.4_

- [x] 4.1 Contact Management Features

  - Implement contact editing and deletion functionality with confirmation dialogs
  - Create contact search component with name and category filtering
  - Build contact export functionality for external use
  - _Requirements: 8.3, 8.4, 8.5_

- [ ]\* 4.2 Vendor Contacts Testing

  - Write unit tests for contact CRUD operations and category filtering
  - Test search functionality and data validation
  - Create integration tests for contact management workflows
  - _Requirements: 8.1, 8.3_

- [x] 5. Event Pages and Public Wedding Site

  - Create event details editor with couple introduction, wedding dates, and event sections
  - Implement venue details component with address, description, and Google Maps integration
  - Build event timeline editor with customizable schedule and event descriptions
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 5.1 Public Wedding Site Implementation

  - Create responsive public wedding site layout with hero section, events, venue, and timeline
  - Implement unique URL routing for each couple's public site (wedflow.com/couple-slug)
  - Build SEO optimization with meta tags, structured data, and social media previews
  - _Requirements: 3.4, 3.5, 2.4_

- [x] 5.2 Google Maps Integration

  - Integrate Google Maps API for venue location display and directions
  - Create interactive map component with custom markers and venue information
  - Implement location search and address validation for venue setup
  - _Requirements: 3.2_

- [ ]\* 5.3 Public Site Testing

  - Write tests for public site rendering and responsive design
  - Test Google Maps integration and venue display functionality
  - Create end-to-end tests for public site user journeys
  - _Requirements: 3.1, 3.5_

- [x] 6. Photo Management System

  - Create Google Drive integration service for folder connection and photo uploads
  - Implement photo upload interface supporting individual files, multiple uploads, and zip files
  - Build photo categorization system with event-based folders (Haldi, Sangeet, Wedding, Reception)
  - _Requirements: 4.1, 4.2, 4.4_

- [x] 6.1 Photo Gallery Display

  - Create responsive photo gallery component with category-based organization
  - Implement highlight photo selection interface for couples to choose featured images
  - Build public gallery display for wedding site with optimized loading and responsive design
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 6.2 Google Drive API Integration

  - Set up Google Drive API authentication and folder access permissions
  - Implement photo upload service with progress tracking and error handling
  - Create public URL generation for gallery display and image optimization
  - _Requirements: 4.3, 5.4_

- [ ]\* 6.3 Photo System Testing

  - Write unit tests for Google Drive integration and upload functionality
  - Test photo categorization and highlight selection features
  - Create integration tests for gallery display and public site integration
  - _Requirements: 4.1, 5.1_

- [x] 7. Gift Portal Implementation

  - Create gift settings management with UPI ID input and QR code upload functionality
  - Implement gift display component for public wedding site with clear call-to-action
  - Build gift portal interface with UPI QR code display and custom blessing message
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 7.1 UPI Integration and Display

  - Create UPI QR code upload and validation system with image processing
  - Implement gift portal public interface with responsive design and user-friendly layout
  - Build gift settings editor with preview functionality and validation
  - _Requirements: 6.4, 6.5_

- [ ]\* 7.2 Gift Portal Testing

  - Write unit tests for UPI settings management and validation
  - Test gift portal display and public interface functionality
  - Create integration tests for gift portal user workflows
  - _Requirements: 6.1, 6.4_

- [x] 8. Wedding Todo Planner

  - Create todo task list component with category organization and completion tracking
  - Implement task creation form with title, description, category, and due date fields
  - Build preloaded task templates integration with Sanity CMS for customizable checklists
  - _Requirements: 7.1, 7.2, 7.4_

- [x] 8.1 Task Management Features

  - Implement task editing, deletion, and completion toggle functionality
  - Create task category management with custom category creation
  - Build task progress tracking with completion statistics and visual indicators
  - _Requirements: 7.3, 7.5_

- [ ]\* 8.2 Todo Planner Testing

  - Write unit tests for task CRUD operations and completion tracking
  - Test task category management and progress calculation
  - Create integration tests for todo planner workflows
  - _Requirements: 7.1, 7.3_

- [x] 9. Sanity CMS Integration

  - Set up Sanity schemas for wedding templates, theme configurations, and todo templates
  - Create Sanity Studio configuration with custom input components and preview functionality
  - Implement Sanity client integration for fetching configurable content and themes
  - _Requirements: 3.1, 7.1_

- [x] 9.1 Theme and Template System

  - Create wedding site theme selector with Sanity-powered template options
  - Implement dynamic theme application with color schemes, fonts, and layout configurations
  - Build template preview system for couples to visualize different wedding site designs
  - _Requirements: 3.1, 3.5_

- [ ]\* 9.2 CMS Integration Testing

  - Write unit tests for Sanity client integration and content fetching
  - Test theme application and template rendering functionality
  - Create integration tests for CMS-powered features
  - _Requirements: 3.1, 7.1_

- [x] 10. Webhook System and API Integration

  - Create webhook endpoints for invitation triggers, photo uploads, and guest updates
  - Implement webhook authentication and signature verification for security
  - Build webhook notification system for external automation tools (N8N integration)
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 10.1 API Routes and Data Management

  - Implement REST API endpoints for all CRUD operations (guests, contacts, events, photos, gifts, todos)
  - Create API middleware for authentication, validation, and error handling
  - Build API documentation and testing utilities for development
  - _Requirements: 1.1, 8.1, 3.1_

- [ ]\* 10.2 API and Webhook Testing

  - Write integration tests for all API endpoints and webhook functionality
  - Test webhook security and authentication mechanisms
  - Create end-to-end tests for external system integration
  - _Requirements: 9.4, 9.5_

- [x] 11. Performance Optimization and Security

  - Implement image optimization for photo galleries and public site performance
  - Create caching strategies for Sanity content and Google Drive API responses
  - Build security measures including input validation, XSS protection, and rate limiting
  - _Requirements: 2.5, 3.5, 5.5_

- [x] 11.1 Production Deployment Setup

  - Configure Vercel deployment with environment variables and domain setup
  - Set up monitoring and error tracking for production environment
  - Implement backup strategies for database and critical data
  - _Requirements: 2.1, 2.3_

- [ ]\* 11.2 Security and Performance Testing
  - Conduct security testing for authentication, data isolation, and input validation
  - Perform performance testing for page load times and API response times
  - Test mobile responsiveness and cross-browser compatibility
  - _Requirements: 2.5, 3.5_
