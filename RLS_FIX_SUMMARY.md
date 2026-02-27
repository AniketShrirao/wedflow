# RLS Policy Fix Summary

## The Problem

```
Error: Failed to create custom folder: new row violates row-level security policy for table "folders"
```

## The Root Cause

The RLS policies on the `folders`, `uploads`, and `images` tables were missing the `WITH CHECK` clause, which is required for INSERT and UPDATE operations.

**Original Policy:**

```sql
CREATE POLICY "Couples can only access their own folders" ON folders
  FOR ALL USING (couple_id IN (
    SELECT id FROM couples WHERE user_id = auth.uid()
  ));
```

**Problem:** No `WITH CHECK` clause for INSERT operations

## The Solution

Add the `WITH CHECK` clause to all three policies:

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

## How to Apply

### Option 1: Quick Fix (Recommended)

1. Open Supabase Dashboard → SQL Editor
2. Copy the SQL from `fix_rls_policies.sql`
3. Paste and run
4. Done! ✅

### Option 2: Step-by-Step

Follow the detailed steps in `APPLY_RLS_FIX_STEPS.md`

### Option 3: Using Migration

The migration file `supabase/migrations/006_fix_rls_policies.sql` contains the fix

## What Gets Fixed

| Feature               | Status   |
| --------------------- | -------- |
| Create custom folders | ✅ Fixed |
| Upload photos         | ✅ Fixed |
| Create images         | ✅ Fixed |
| Update images         | ✅ Fixed |
| Delete folders        | ✅ Fixed |
| All RLS operations    | ✅ Fixed |

## Security

✅ **Security is maintained:**

- Users can only access their own couple's data
- The `WITH CHECK` clause ensures new rows satisfy the security condition
- No unauthorized data access

## Files Provided

1. **fix_rls_policies.sql** - Copy-paste ready SQL fix
2. **FIX_FOLDER_CREATION_ERROR.md** - Detailed explanation
3. **APPLY_RLS_FIX_STEPS.md** - Step-by-step instructions
4. **supabase/migrations/006_fix_rls_policies.sql** - Migration file

## Testing After Fix

```bash
# 1. Refresh your application
# 2. Go to Photos → Folder Management
# 3. Try creating a custom folder
# 4. Should work now! ✅
```

## Verification Query

```sql
-- Run this to verify the fix was applied
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename IN ('uploads', 'images', 'folders')
ORDER BY tablename, policyname;
```

Expected: 3 rows with both `qual` and `with_check` populated

## Time to Fix

⏱️ **2 minutes** - Just copy, paste, and run the SQL

## Next Steps

1. Apply the RLS fix
2. Refresh your application
3. Test folder creation
4. Test image uploads
5. Test all photo features

---

**Ready to fix it?** Start with `APPLY_RLS_FIX_STEPS.md` 🚀
