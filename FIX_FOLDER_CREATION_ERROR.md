# Fix: Folder Creation RLS Policy Error

## Problem

When trying to create a custom folder, you get the error:

```
Failed to create custom folder: new row violates row-level security policy for table "folders"
```

## Root Cause

The RLS (Row Level Security) policies on the `folders`, `uploads`, and `images` tables are too restrictive. They only allow operations when `auth.uid()` matches the user_id in the couples table. However, the current policies don't have a `WITH CHECK` clause for INSERT operations, which is required for server-side operations.

## Solution

Run the following SQL in your Supabase SQL Editor to fix the RLS policies:

### Step 1: Drop Existing Policies

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Couples can only access their own uploads" ON uploads;
DROP POLICY IF EXISTS "Couples can only access their own images" ON images;
DROP POLICY IF EXISTS "Couples can only access their own folders" ON folders;
```

### Step 2: Create Fixed Policies

```sql
-- Create improved RLS policies for uploads table
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
```

### Step 3: Verify Policies

```sql
-- Verify policies are in place
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename IN ('uploads', 'images', 'folders')
ORDER BY tablename, policyname;
```

Expected output should show 3 policies (one for each table) with both `USING` and `WITH CHECK` clauses.

## How to Apply

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the SQL from Step 1 and Step 2 above
5. Click **Run**
6. Verify with the SQL from Step 3

### Option B: Using Supabase CLI

```bash
# Create a new migration
supabase migration new fix_rls_policies

# Edit the migration file and add the SQL from above
# Then run:
supabase migration up
```

### Option C: Using psql

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[password]@[host]:[port]/postgres"

# Run the SQL commands
```

## Testing After Fix

1. Go to the dashboard
2. Navigate to Photos → Folder Management
3. Try creating a custom folder
4. You should now see the folder created successfully

## Verification Queries

### Check if policies exist

```sql
SELECT * FROM pg_policies WHERE tablename IN ('uploads', 'images', 'folders');
```

### Check if you can insert into folders

```sql
-- This should work if you're authenticated
INSERT INTO folders (couple_id, folder_name, folder_type)
VALUES ('YOUR_COUPLE_ID', 'Test Folder', 'custom')
RETURNING *;
```

### Check all folders for your couple

```sql
SELECT * FROM folders WHERE couple_id = 'YOUR_COUPLE_ID';
```

## What Changed

The key difference is adding the `WITH CHECK` clause to the RLS policies:

**Before:**

```sql
CREATE POLICY "Couples can only access their own folders" ON folders
  FOR ALL USING (couple_id IN (
    SELECT id FROM couples WHERE user_id = auth.uid()
  ));
```

**After:**

```sql
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
```

The `WITH CHECK` clause is required for INSERT and UPDATE operations to work properly with RLS.

## Why This Happens

- RLS policies need both `USING` (for SELECT/DELETE) and `WITH CHECK` (for INSERT/UPDATE)
- Without `WITH CHECK`, INSERT operations are blocked
- The `WITH CHECK` clause ensures that new rows being inserted also satisfy the security condition

## Additional Notes

- This fix applies to all three tables: `uploads`, `images`, and `folders`
- The policies ensure users can only access data for couples they own
- Server-side API calls will now work correctly with these policies
- The fix maintains security while allowing proper operations

## Troubleshooting

### Still getting RLS error after applying fix?

1. **Clear browser cache**: `localStorage.clear()` then refresh
2. **Verify policies were created**: Run the verification query above
3. **Check authentication**: Make sure you're logged in
4. **Check couple_id**: Verify the couple_id exists in the couples table

### Policies not showing up?

1. Go to Supabase Dashboard → Authentication → Policies
2. Select the `folders` table
3. Verify the policy is listed
4. If not, run the CREATE POLICY SQL again

### Still getting "Internal server error"?

1. Check the browser console for detailed error messages
2. Check the application logs
3. Verify the API endpoint is being called correctly
4. Make sure the couple_id is valid

## Support

If you continue to have issues:

1. Verify all migrations have been applied: `supabase migration list`
2. Check the database logs in Supabase Dashboard
3. Ensure you're using the correct Supabase project
4. Verify environment variables are correct

---

**After applying this fix, folder creation should work correctly!** 🎉
