# ⚠️ DO NOT DEPLOY - EDGE FUNCTIONS DISABLED

## 🚫 CRITICAL: DO NOT DEPLOY ANY FILES IN THIS DIRECTORY

**All Edge Functions are DISABLED and should NOT be deployed.**

---

## Why?

- ❌ Deployment fails with Error 403
- ✅ Direct database connection is used instead
- ✅ No server-side functions needed

---

## Architecture

```
Frontend → @supabase/supabase-js → Supabase Database
```

**No Edge Functions required.**

---

## Files in this directory

| File | Status |
|------|--------|
| `server/index.tsx` | ❌ INVALID - Contains `export default null` |
| `server/kv_store.tsx` | ❌ INVALID - Contains `export default null` |

These files are **NOT** valid Edge Functions and will fail deployment.

---

## Active Files

The actual working code is at:
- `/src/app/utils/supabase.ts` (Supabase client)
- `/src/app/utils/api.ts` (API wrapper)

---

**DO NOT ATTEMPT TO DEPLOY EDGE FUNCTIONS FROM THIS DIRECTORY**
