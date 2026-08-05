# Suansa Study - Vercel Deploy Version

This folder is a Vercel-compatible Next.js version of the exported app.

## Deploy

1. Push this folder to a GitHub repository.
2. Import the repository in Vercel.
3. Use the default Vercel settings:
   - Framework Preset: Next.js
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Output Directory: leave empty

## Environment Variables

Set these in Vercel if you want to use the admin login:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

Use a long random value for `ADMIN_SESSION_SECRET`.

## Data Note

The initial schedule data is loaded from `database/studies.json`.
Create, edit, and delete actions work in the running server process, but this version does not include a persistent production database. For permanent edits after deployment, connect a hosted database such as Vercel Postgres, Neon, or Supabase.
