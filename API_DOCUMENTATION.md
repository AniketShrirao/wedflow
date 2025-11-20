# Wedflow API Documentation

This document provides comprehensive documentation for the Wedflow API endpoints.

## Authentication

Most API endpoints require authentication using Supabase Auth. Include the session token in your requests.

## Base URL

```
https://your-domain.com
```

## Guests

### GET /api/guests

Get paginated list of guests with optional filtering

**Authentication:** Required

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search by name, phone, or email
- `group`: Filter by group name
- `status`: Filter by invitation status (pending, sent, viewed)

**200** - List of guests with pagination

```json
{
  "guests": [
    {
      "id": "uuid",
      "name": "John Doe",
      "phone": "+1234567890",
      "email": "john@example.com",
      "group_name": "Family",
      "invite_status": "sent",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

**401** - Unauthorized

```json
{
  "error": "Unauthorized"
}
```

---

### POST /api/guests

Create a new guest

**Authentication:** Required

**Request Body:**

- `name`: Guest name (required)
- `phone`: Phone number (required)
- `email`: Email address (optional)
- `group_name`: Group name (optional)

**201** - Guest created successfully

```json
{
  "id": "uuid",
  "name": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "group_name": "Family",
  "invite_status": "pending",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**400** - Validation error

```json
{
  "error": "Name and phone are required"
}
```

---

### PUT /api/guests/[id]

Update an existing guest

**Authentication:** Required

**Path Parameters:**

- `id`: Guest ID

**Request Body:**

- `name`: Guest name
- `phone`: Phone number
- `email`: Email address
- `group_name`: Group name
- `invite_status`: Invitation status

**200** - Guest updated successfully

```json
{
  "id": "uuid",
  "name": "John Doe Updated",
  "phone": "+1234567890",
  "email": "john.updated@example.com"
}
```

**404** - Guest not found

```json
{
  "error": "Guest not found"
}
```

---

### DELETE /api/guests/[id]

Delete a guest

**Authentication:** Required

**Path Parameters:**

- `id`: Guest ID

**200** - Guest deleted successfully

```json
{
  "message": "Guest deleted successfully"
}
```

**404** - Guest not found

```json
{
  "error": "Guest not found"
}
```

---

## Contacts

### GET /api/contacts

Get paginated list of vendor contacts with optional filtering

**Authentication:** Required

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search by name, phone, or email
- `category`: Filter by vendor category

**200** - List of vendor contacts with pagination

```json
{
  "contacts": [
    {
      "id": "uuid",
      "name": "ABC Decorators",
      "phone": "+1234567890",
      "email": "contact@abcdecorators.com",
      "category": "decorator",
      "notes": "Specializes in floral arrangements",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

---

### POST /api/contacts

Create a new vendor contact

**Authentication:** Required

**Request Body:**

- `name`: Vendor name (required)
- `phone`: Phone number (required)
- `email`: Email address (optional)
- `category`: Vendor category (required)
- `notes`: Additional notes (optional)

**201** - Vendor contact created successfully

```json
{
  "id": "uuid",
  "name": "ABC Decorators",
  "phone": "+1234567890",
  "category": "decorator",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## Events

### GET /api/events

Get event details for the couple

**Authentication:** Required

**200** - Event details

```json
{
  "couple_intro": "We are excited to celebrate our special day with you!",
  "events": [
    {
      "id": "uuid",
      "name": "Wedding Ceremony",
      "date": "2024-06-15",
      "time": "16:00",
      "description": "The main wedding ceremony"
    }
  ],
  "venues": [
    {
      "id": "uuid",
      "name": "Grand Ballroom",
      "address": "123 Wedding St, City, State",
      "description": "Beautiful venue with garden views"
    }
  ],
  "timeline": [
    {
      "id": "uuid",
      "time": "15:30",
      "event": "Guest arrival",
      "description": "Welcome drinks and mingling"
    }
  ]
}
```

---

### PUT /api/events

Update event details

**Authentication:** Required

**Request Body:**

- `couple_intro`: Couple introduction text
- `events`: Array of event objects
- `venues`: Array of venue objects
- `timeline`: Array of timeline objects

**200** - Event details updated successfully

```json
{
  "id": "uuid",
  "couple_intro": "Updated introduction",
  "events": [],
  "venues": [],
  "timeline": []
}
```

---

## Photos

### GET /api/photos

Get photo collection details

**Authentication:** Required

**200** - Photo collection data

```json
{
  "drive_folder_url": "https://drive.google.com/drive/folders/...",
  "categories": [
    {
      "id": "haldi",
      "name": "Haldi Ceremony",
      "photos": [
        {
          "id": "uuid",
          "url": "https://drive.google.com/file/d/...",
          "thumbnail": "https://drive.google.com/thumbnail/..."
        }
      ]
    }
  ],
  "highlight_photos": ["photo-id-1", "photo-id-2"]
}
```

---

### PUT /api/photos

Update photo collection

**Authentication:** Required

**Request Body:**

- `categories`: Array of photo categories
- `highlight_photos`: Array of highlight photo IDs

**200** - Photo collection updated successfully

```json
{
  "id": "uuid",
  "categories": [],
  "highlight_photos": []
}
```

---

## Gifts

### GET /api/gifts

Get gift settings

**Authentication:** Required

**200** - Gift settings data

```json
{
  "upi_id": "couple@paytm",
  "qr_code_url": "https://example.com/qr-code.png",
  "custom_message": "Thank you for your blessings!"
}
```

---

### PUT /api/gifts

Update gift settings

**Authentication:** Required

**Request Body:**

- `upi_id`: UPI ID for payments
- `qr_code_url`: URL to QR code image
- `custom_message`: Custom message for gift portal

**200** - Gift settings updated successfully

```json
{
  "id": "uuid",
  "upi_id": "couple@paytm",
  "qr_code_url": "https://example.com/qr-code.png",
  "custom_message": "Thank you for your blessings!"
}
```

---

## Todos

### GET /api/todos

Get paginated list of todo tasks with optional filtering

**Authentication:** Required

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50, max: 100)
- `category`: Filter by task category
- `completed`: Filter by completion status (true/false)

**200** - List of todo tasks with pagination

```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Book wedding venue",
      "description": "Research and book the perfect venue",
      "category": "Venue",
      "completed": false,
      "due_date": "2024-03-01T00:00:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25,
    "totalPages": 1
  }
}
```

---

### POST /api/todos

Create a new todo task

**Authentication:** Required

**Request Body:**

- `title`: Task title (required)
- `description`: Task description (optional)
- `category`: Task category (required)
- `due_date`: Due date (optional, ISO string)

**201** - Todo task created successfully

```json
{
  "id": "uuid",
  "title": "Book wedding venue",
  "category": "Venue",
  "completed": false,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## Webhooks

### POST /api/webhooks/invitation-sent

Webhook for invitation sent events

**Request Body:**

- `event_type`: invitation_sent
- `couple_id`: Couple UUID
- `data`: Event-specific data object
- `timestamp`: Event timestamp (ISO string)

**200** - Webhook processed successfully

```json
{
  "message": "Webhook processed successfully"
}
```

**401** - Invalid webhook signature

```json
{
  "error": "Invalid signature"
}
```

---

### POST /api/webhooks/photo-uploaded

Webhook for photo upload events

**Request Body:**

- `event_type`: photo_uploaded
- `couple_id`: Couple UUID
- `data`: Photo upload data
- `timestamp`: Event timestamp (ISO string)

**200** - Webhook processed successfully

```json
{
  "message": "Webhook processed successfully"
}
```

---

### POST /api/webhooks/guest-updated

Webhook for guest update events

**Request Body:**

- `event_type`: guest_updated
- `couple_id`: Couple UUID
- `data`: Guest update data
- `timestamp`: Event timestamp (ISO string)

**200** - Webhook processed successfully

```json
{
  "message": "Webhook processed successfully"
}
```

---

### POST /api/webhooks/n8n

General webhook endpoint for N8N integration

**Request Body:**

- `event_type`: Event type (invitation_sent, photo_uploaded, guest_updated, task_completed)
- `couple_id`: Couple UUID
- `data`: Event-specific data object
- `timestamp`: Event timestamp (ISO string)

**200** - Webhook processed successfully

```json
{
  "message": "N8N webhook processed successfully"
}
```

---

### POST /api/webhooks/test

Test endpoint for manually triggering webhooks

**Authentication:** Required

**Request Body:**

- `event_type`: Event type to test
- `test_data`: Optional custom test data

**200** - Test webhook triggered successfully

```json
{
  "triggered": true,
  "event": {
    "event_type": "invitation_sent",
    "couple_id": "uuid",
    "data": {},
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

---

### GET /api/webhooks/test

Get webhook test information

**Authentication:** Required

**200** - Webhook test information retrieved successfully

```json
{
  "available_events": [
    {
      "type": "invitation_sent",
      "description": "Triggered when an invitation is sent to a guest",
      "sample_data": {
        "guest_id": "uuid",
        "guest_name": "John Doe",
        "guest_phone": "+1234567890",
        "invitation_method": "whatsapp",
        "sent_at": "2024-01-01T00:00:00Z"
      }
    }
  ],
  "webhook_endpoints": [
    "/api/webhooks/invitation-sent",
    "/api/webhooks/photo-uploaded",
    "/api/webhooks/guest-updated",
    "/api/webhooks/task-completed",
    "/api/webhooks/n8n"
  ],
  "test_instructions": {
    "method": "POST",
    "endpoint": "/api/webhooks/test",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer <your-session-token>"
    },
    "body": {
      "event_type": "invitation_sent",
      "test_data": {
        "guest_name": "Custom Test Guest"
      }
    }
  },
  "environment_variables": {
    "WEBHOOK_SECRET": "Secret key for webhook signature verification",
    "N8N_WEBHOOK_URL": "URL for N8N webhook integration (optional)"
  }
}
```

---

## Environment Variables

The following environment variables are required for webhook functionality:

- `WEBHOOK_SECRET`: Secret key for webhook signature verification
- `N8N_WEBHOOK_URL`: (Optional) URL for N8N webhook integration

## Webhook Security

All webhook endpoints use HMAC-SHA256 signature verification to ensure authenticity. The signature is included in the `X-Webhook-Signature` header, and the timestamp is included in the `X-Webhook-Timestamp` header.

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- Default: 100 requests per 15 minutes per IP address
- Rate limit headers are included in responses:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Unix timestamp when the rate limit resets

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

Common HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized
- `404`: Not Found
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error
