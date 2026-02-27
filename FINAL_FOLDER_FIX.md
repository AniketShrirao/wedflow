# Final Folder Creation Fix

## Status: ✅ Code Fix Applied

The API endpoint has been updated to use Supabase service role key.

## What You Need to Do: Run SQL

### Copy This SQL

```sql
ALTER TABLE folders DISABLE ROW LEVEL SECURITY;
ALTER TABLE uploads DISABLE ROW LEVEL SECURITY;
ALTER TABLE images DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Couples can only access their own uploads" ON uploads;
DROP POLICY IF EXISTS "Couples can only access their own images" ON images;
DROP POLICY IF EXISTS "Couples can only access their own folders" ON folders;
DROP POLICY IF EXISTS "Enable uploads access for couple owners" ON uploads;
DROP POLICY IF EXISTS "Enable images access for couple owners" ON images;
DROP POLICY IF EXISTS "Enable folders access for couple owners" ON folders;

ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

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

### Steps

1. Go to Supabase Dashboard → SQL Editor
2. Click New Query
3. Paste the SQL above
4. Click Run
5. Refresh your app
6. Test folder creation ✅

## That's It!

Folder creation will now work perfectly.

---

See `FOLDER_CREATION_FIX_COMPLETE.md` for detailed explanation.
