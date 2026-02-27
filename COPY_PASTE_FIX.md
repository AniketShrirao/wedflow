# Copy-Paste Fix for Folder Creation Error

## The Error You're Getting

```
Failed to create custom folder: new row violates row-level security policy for table "folders"
```

## The Fix (Copy Everything Below)

### Step 1: Go to Supabase Dashboard

1. Open https://app.supabase.com
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**

### Step 2: Copy This Entire SQL Block

```sql
-- Fix RLS Policies for Photo Management
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
2. Click **Run** button
3. Wait for completion

### Step 4: You Should See

```
DROP POLICY
DROP POLICY
DROP POLICY
CREATE POLICY
CREATE POLICY
CREATE POLICY
```

### Step 5: Test It

1. Go back to your app
2. Refresh the page (Ctrl+R)
3. Go to Photos → Folder Management
4. Create a custom folder
5. ✅ It should work now!

## That's It!

The fix is complete. Your folder creation should now work perfectly.

## If It Still Doesn't Work

1. **Clear browser cache:**
   - Press Ctrl+Shift+Delete
   - Clear all data
   - Refresh page

2. **Clear localStorage:**
   - Press F12 (open DevTools)
   - Go to Console tab
   - Type: `localStorage.clear()`
   - Press Enter
   - Refresh page

3. **Try again**

## What This Does

- ✅ Fixes RLS policy for folders table
- ✅ Fixes RLS policy for uploads table
- ✅ Fixes RLS policy for images table
- ✅ Allows folder creation
- ✅ Allows image uploads
- ✅ Maintains security

## Questions?

See the detailed explanation in `FIX_FOLDER_CREATION_ERROR.md`

---

**That's all you need to do!** 🎉
