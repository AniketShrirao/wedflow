-- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('predefined', 'custom')),
  event_type TEXT,
  tracks JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_playlists_couple_id ON playlists(couple_id);
CREATE INDEX idx_playlists_type ON playlists(type);
CREATE INDEX idx_playlists_created_at ON playlists(created_at DESC);

-- Enable RLS
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow couples to view their own playlists
CREATE POLICY "Couples can view their playlists"
  ON playlists FOR SELECT
  USING (
    couple_id IN (
      SELECT id FROM couples WHERE user_id = auth.uid()
    )
  );

-- Allow couples to create playlists
CREATE POLICY "Couples can create playlists"
  ON playlists FOR INSERT
  WITH CHECK (
    couple_id IN (
      SELECT id FROM couples WHERE user_id = auth.uid()
    )
  );

-- Allow couples to update their playlists
CREATE POLICY "Couples can update their playlists"
  ON playlists FOR UPDATE
  USING (
    couple_id IN (
      SELECT id FROM couples WHERE user_id = auth.uid()
    )
  );

-- Allow couples to delete their playlists
CREATE POLICY "Couples can delete their playlists"
  ON playlists FOR DELETE
  USING (
    couple_id IN (
      SELECT id FROM couples WHERE user_id = auth.uid()
    )
  );

-- Allow public read access to playlists for public wedding sites
CREATE POLICY "Public can view couple playlists"
  ON playlists FOR SELECT
  USING (true);
