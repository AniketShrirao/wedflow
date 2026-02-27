-- Create song_suggestions table
CREATE TABLE IF NOT EXISTS song_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    song_title TEXT NOT NULL,
    artist_name TEXT,
    youtube_url TEXT,
    suggested_by TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_song_suggestions_couple_id ON song_suggestions(couple_id);
CREATE INDEX IF NOT EXISTS idx_song_suggestions_status ON song_suggestions(status);

-- Enable RLS
ALTER TABLE song_suggestions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert suggestions (public can suggest songs)
CREATE POLICY "Anyone can insert song suggestions" ON song_suggestions
    FOR INSERT WITH CHECK (true);

-- Allow couples to view their own suggestions
CREATE POLICY "Couples can view their own suggestions" ON song_suggestions
    FOR SELECT USING (true);

-- Allow couples to update their own suggestions (approve/reject)
CREATE POLICY "Couples can update their own suggestions" ON song_suggestions
    FOR UPDATE USING (true);
