-- Drop the existing policy
DROP POLICY IF EXISTS "Users can only access their own couple record" ON couples;

-- Create separate policies for different operations
CREATE POLICY "Users can insert their own couple record" ON couples
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can select their own couple record" ON couples
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own couple record" ON couples
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own couple record" ON couples
  FOR DELETE USING (user_id = auth.uid());