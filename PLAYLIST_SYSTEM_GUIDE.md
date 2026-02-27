# Playlist System Guide

## Overview

The playlist system allows couples to manage music for their wedding with two types of playlists:

- **Predefined Playlists**: Managed through the couples dashboard (Ceremony, Reception, etc.)
- **Custom Playlists**: User-created playlists with full CRUD functionality

## Architecture

### Database Schema

Playlists are stored in Supabase with the following structure:

```sql
playlists {
  id: UUID (primary key)
  couple_id: UUID (foreign key to couples)
  name: TEXT
  description: TEXT
  type: TEXT ('predefined' | 'custom')
  event_type: TEXT (e.g., 'ceremony', 'reception')
  tracks: JSONB (array of track objects)
  created_by: UUID (user who created it)
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

### Track Structure

Each track in a playlist contains:

```typescript
{
  id: string
  title: string
  artist: string
  youtubeUrl: string
  duration: string
  addedAt: string (ISO timestamp)
}
```

## API Endpoints

### Playlists

#### GET `/api/playlists`

Fetch all playlists for a couple

**Query Parameters:**

- `coupleId` (required): UUID of the couple
- `type` (optional): 'predefined' or 'custom'

**Response:**

```json
[
  {
    "id": "uuid",
    "name": "Ceremony",
    "type": "predefined",
    "tracks": [...],
    ...
  }
]
```

#### POST `/api/playlists`

Create a new playlist

**Request Body:**

```json
{
  "coupleId": "uuid",
  "name": "My Playlist",
  "description": "Optional description",
  "type": "custom",
  "eventType": "optional",
  "tracks": [],
  "createdBy": "user-id"
}
```

#### PUT `/api/playlists/[id]`

Update a playlist

**Request Body:**

```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "tracks": [...]
}
```

#### DELETE `/api/playlists/[id]`

Delete a playlist

### Tracks

#### POST `/api/playlists/[id]/tracks`

Add a track to a playlist

**Request Body:**

```json
{
  "title": "Song Title",
  "artist": "Artist Name",
  "youtubeUrl": "https://youtube.com/watch?v=...",
  "duration": "3:45"
}
```

#### DELETE `/api/playlists/[id]/tracks?trackId=[trackId]`

Remove a track from a playlist

## Frontend Components

### Featured Playlist Section

Location: `src/components/public/featured-playlist-section.tsx`

Displays featured playlists on the public wedding site with:

- Tab-based navigation by event type
- First 5 tracks preview
- "View All Tracks" button

### Playlist Page

Location: `src/app/public/[slug]/playlist/page.tsx`

Full playlist view showing:

- All playlists for the couple
- All tracks organized by playlist
- YouTube Music play buttons
- Track information (title, artist, duration)

### Playlist Manager (Dashboard)

Location: `src/components/dashboard/playlist-manager.tsx`

Dashboard component for couples to:

- Create new playlists
- Edit playlist details
- Add/remove tracks
- Delete playlists
- View all playlists and tracks

## Usage

### For Couples (Dashboard)

**Access:** Dashboard → Playlist Manager (or `/dashboard/playlists`)

1. **Create a Playlist:**
   - Click "Create Playlist" button
   - Fill in name, description, and type
   - Select "predefined" for event-based playlists (Ceremony, Reception, etc.)
   - Select "custom" for user-created playlists
   - Submit to create

2. **Expand Playlist:**
   - Click on playlist name to expand/collapse
   - View all tracks in the playlist
   - See track count and playlist type

3. **Add Tracks:**
   - Click "Add Track" button in expanded playlist
   - Enter track details:
     - Song Title (required)
     - Artist Name (required)
     - YouTube URL (required)
     - Duration (optional, e.g., 3:45)
   - Click "Add Track" to save
   - Track appears in the playlist immediately

4. **Delete Tracks:**
   - Click trash icon next to any track
   - Track is removed immediately

5. **Delete Playlist:**
   - Click trash icon on playlist card
   - Confirm deletion
   - All tracks in the playlist are deleted

### For Guests (Public Site)

1. **View Featured Playlists:**
   - Navigate to the wedding site
   - Scroll to "Featured Playlist" section
   - Click tabs to switch between event types
   - Click play button to open YouTube Music

2. **View All Playlists:**
   - Click "View All Tracks" button
   - See complete playlist page
   - All tracks organized by playlist
   - Click play buttons to listen on YouTube Music

## Integration with Wedding Site

The playlist system is integrated into the public wedding site:

1. **Featured Playlist Section** appears between Timeline and Photo Gallery
2. Requires `playlists` data in the wedding site data object
3. Automatically fetches from Supabase based on couple ID

### Data Structure

```typescript
{
  playlists: {
    playlists: Playlist[]
  }
}
```

## YouTube Music Integration

All tracks link directly to YouTube Music:

- Play buttons open YouTube in a new tab
- URLs should be valid YouTube Music links
- Format: `https://www.youtube.com/watch?v=VIDEO_ID`

## Security

### Row Level Security (RLS)

- Couples can only view/edit their own playlists
- Public can view playlists for public wedding sites
- Tracks are stored as JSONB for flexibility

### Authentication

- Dashboard access requires couple authentication
- Public playlist page is accessible to anyone with the couple slug
- API endpoints validate couple ownership

## Database Setup

Run the migration to create the playlists table:

```bash
supabase migration up
```

Or manually execute the SQL in `supabase/migrations/create_playlists_table.sql`

## Future Enhancements

- Playlist sharing with guests
- Collaborative playlist editing
- Spotify integration
- Playlist analytics (most played tracks)
- Playlist templates
- Drag-and-drop track reordering
- Bulk track import from YouTube playlists
