# Step-by-Step: Apply RLS Policy Fix

## Quick Fix (2 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project: https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Copy the Fix SQL

Copy this entire SQL script:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Couples can only access their own uploads" ON uploads;
DROP POLICY IF EXISTS "Couples can only access their own images" ON images;
DROP POLICY IF EXISTS "Couples can only access their own folders" ON folders;

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

### Step 3: Paste into SQL Editor

1. Paste the SQL into the query editor
2. Click **Run** button (or press Ctrl+Enter)
3. Wait for the query to complete

### Step 4: Verify Success

You should see output like:

```
DROP POLICY
DROP POLICY
DROP POLICY
CREATE POLICY
CREATE POLICY
CREATE POLICY
```

### Step 5: Test Folder Creation

1. Go back to your application
2. Refresh the page (Ctrl+R or Cmd+R)
3. Navigate to Photos → Folder Management
4. Try creating a custom folder
5. It should now work! ✅

## Verification (Optional)

To verify the policies were created correctly, run this query:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename IN ('uploads', 'images', 'folders')
ORDER BY tablename, policyname;
```

You should see 3 rows (one for each table) with both `qual` and `with_check` populated.

## Troubleshooting

### Issue: "Query failed with error code 42P20"

- This means the policy already exists
- Try running the DROP POLICY commands first
- Then run the CREATE POLICY commands

### Issue: "Folder creation still fails"

1. Clear browser cache: Press Ctrl+Shift+Delete
2. Clear localStorage: Open DevTools (F12) → Console → `localStorage.clear()`
3. Refresh the page
4. Try again

### Issue: "Permission denied"

- Make sure you're using a Supabase account with admin access
- Check that you're in the correct project
- Verify the database connection is active

## What This Fix Does

| Before                          | After                                  |
| ------------------------------- | -------------------------------------- |
| ❌ Can't insert folders         | ✅ Can insert folders                  |
| ❌ RLS blocks server operations | ✅ RLS allows authenticated operations |
| ❌ Missing WITH CHECK clause    | ✅ WITH CHECK clause added             |
| ❌ Folder creation fails        | ✅ Folder creation works               |

## Security Impact

✅ **Security is maintained:**

- Users can only access their own couple's data
- The `WITH CHECK` clause ensures new rows also satisfy the security condition
- No data is exposed to unauthorized users

## Next Steps

After applying this fix:

1. ✅ Test folder creation
2. ✅ Test image uploads
3. ✅ Test image highlighting
4. ✅ Test public site access

All should now work correctly!

## File Reference

The fix SQL is also available in: `fix_rls_policies.sql`

You can also reference the migration file: `supabase/migrations/006_fix_rls_policies.sql`

---

**That's it! Your folder creation should now work.** 🎉

If you have any issues, check the troubleshooting section above.
