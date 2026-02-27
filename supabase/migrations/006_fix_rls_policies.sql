-- Fix RLS policies to allow server-side operations
-- The issue is that server-side API calls don't have auth.uid() context
-- We need to allow operations when the authenticated user owns the couple

-- Drop existing policies
DROP POLICY IF EXISTS "Couples can only access their own uploads" ON uploads;
DROP POLICY IF EXISTS "Couples can only access their own images" ON images;
DROP POLICY IF EXISTS "Couples can only access their own folders" ON folders;

-- Create improved RLS policies for uploads table
-- Allow SELECT, INSERT, UPDATE, DELETE for users who own the couple
CREATE POLICY "Enable uploads access for couple owners" ON uploads
  FOR ALL USING (
    couple_id IN (
      SELECT id FROM couples WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    couple_id IN (
      SELECT id FROM couples WHERE user_id = auth.uid()
    )
  );

-- Create improved RLS policies for images table
-- Allow SELECT, INSERT, UPDATE, DELETE for users who own the couple
CREATE POLICY "Enable images access for couple owners" ON images
  FOR ALL USING (
    couple_id IN (
      SELECT id FROM couples WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    couple_id IN (
      SELECT id FROM couples WHERE user_id = auth.uid()
    )
  );

-- Create improved RLS policies for folders table
-- Allow SELECT, INSERT, UPDATE, DELETE for users who own the couple
CREATE POLICY "Enable folders access for couple owners" ON folders
  FOR ALL USING (
    couple_id IN (
      SELECT id FROM couples WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    couple_id IN (
      SELECT id FROM couples WHERE user_id = auth.uid()
    )
  );

-- Verify policies are in place
-- SELECT * FROM pg_policies WHERE tablename IN ('uploads', 'images', 'folders');
