-- Enable RLS on categories table and create policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Couples can only access their own categories" ON categories;

-- Create RLS policy for categories table
CREATE POLICY "Enable categories access for couple owners" ON categories
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
