# IMMEDIATE FIX REQUIRED - Folder Creation Error

## The Issue

The RLS policy fix migration hasn't been applied to your Supabase database yet. You need to run the SQL directly.

## CRITICAL: Run This SQL NOW

Go to your Supabase Dashboard and run this SQL immediately:

### Step 1: Open SQL Editor

1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**

### Step 2: Copy and Run This SQL

```sql
-- DISABLE RLS TEMPORARILY TO FIX THE ISSUE
ALTER TABLE folders DISABLE ROW LEVEL SECURITY;
ALTER TABLE uploads DISABLE ROW LEVEL SECURITY;
ALTER TABLE images DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Couples can only access their own uploads" ON uploads;
DROP POLICY IF EXISTS "Couples can only access their own images" ON images;
DROP POLICY IF EXISTS "Couples can only access their own folders" ON folders;
DROP POLICY IF EXISTS "Enable uploads access for couple owners" ON uploads;
DROP POLICY IF EXISTS "Enable images access for couple owners" ON images;
DROP POLICY IF EXISTS "Enable folders access for couple owners" ON folders;

-- RE-ENABLE RLS
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Create NEW policies with proper WITH CHECK clause
CREATE POLICY "folders_access_policy" ON folders
  FOR ALL
  USING (couple_id IN (SELECT id FROM couples WHERE user_id = auth.uid()))
  WITH CHECK (couple_id IN (SELECT id FROM couples WHERE user_id = auth.uid()));

CREATE POLICY "uploads_access_policy" ON uploads
  FOR ALL
  USING (couple_id IN (SELECT id FROM couples WHERE user_id = auth.uid()))
  WITH CHECK (couple_id IN (SELECT id FROM couples WHERE user_id = auth.uid()));

CREATE POLICY "images_access_policy" ON images
  FOR ALL
  USING (couple_id IN (SELECT id FROM couples WHERE user_id = auth.uid()))
  WITH CHECK (couple_id IN (SELECT id FROM couples WHERE user_id = auth.uid()));
```

### Step 3: Click Run

Wait for the query to complete. You should see:

```
ALTER TABLE
ALTER TABLE
ALTER TABLE
DROP POLICY
DROP POLICY
DROP POLICY
DROP POLICY
DROP POLICY
DROP POLICY
ALTER TABLE
ALTER TABLE
ALTER TABLE
CREATE POLICY
CREATE POLICY
CREATE POLICY
```

### Step 4: Test Immediately

1. Refresh your app (Ctrl+R)
2. Go to Photos → Folder Management
3. Try creating a folder
4. Should work now! ✅

## If Still Not Working

Run this diagnostic query:

```sql
-- Check if policies exist
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename IN ('uploads', 'images', 'folders')
ORDER BY tablename, policyname;
```

You should see 3 rows with both `qual` and `with_check` populated.

## Alternative: Disable RLS Completely (Not Recommended)

If the above doesn't work, you can temporarily disable RLS:

```sql
ALTER TABLE folders DISABLE ROW LEVEL SECURITY;
ALTER TABLE uploads DISABLE ROW LEVEL SECURITY;
ALTER TABLE images DISABLE ROW LEVEL SECURITY;
```

Then test. If it works, the issue is definitely RLS. Then re-enable and apply the policies above.

## Why This Happens

- RLS policies need both `USING` (for SELECT/DELETE) and `WITH CHECK` (for INSERT/UPDATE)
- The original migration didn't include `WITH CHECK`
- This SQL fixes it by dropping and recreating with proper clauses

## Time Required

⏱️ **1 minute** - Just run the SQL

## Next Steps

1. ✅ Run the SQL above
2. ✅ Refresh your app
3. ✅ Test folder creation
4. ✅ Test image uploads
5. ✅ Test all features

---

**This is the definitive fix. Run it now!** 🚀
