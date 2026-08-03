# Wells Fargo: Online Access — Standalone Deployment Guide

This is a **100% client-side React SPA**. No backend, no database, no env vars.
All state (users, accounts, transactions, theme) lives in the browser's
`localStorage`. You can host the built output on any static host.

---

## 1. Local development

Requires Node.js 20+ (or Bun). Then:

```bash
npm install          # or: bun install / pnpm install / yarn
npm run dev          # starts http://localhost:5173
```

Build a production bundle:

```bash
npm run build        # outputs static files into ./dist
npm run preview      # serves ./dist locally for a final check
```

---

## 2. Deploy to Vercel (manual upload — no GitHub, no Lovable link required)

You have two equally valid paths. Pick one.

### Option A — Vercel CLI (recommended)

```bash
npm install -g vercel
npm run build
vercel deploy --prebuilt --prod
```

The included `vercel.json` already declares:
- `framework: vite`
- `outputDirectory: dist`
- SPA fallback rewrite so deep links (e.g. `/dashboard`, `/transfers`) resolve
  to `index.html` instead of returning 404.

On the first run Vercel asks a couple of setup questions (project name, scope).
Accept the defaults — no environment variables are needed.

### Option B — Drag-and-drop the `dist` folder

1. Run `npm run build` locally.
2. Go to <https://vercel.com/new> → **"Deploy without Git"** (or use the
   Vercel dashboard's "Import" → "Upload" flow).
3. Drag the `dist/` folder into the upload area.
4. Done — Vercel serves it as a static site. The SPA rewrite is already in
   `vercel.json`, which Vercel reads when you upload the full project; if you
   upload only `dist/`, add this `vercel.json` next to it:

   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

---

## 3. Deploy to other static hosts

The same `dist/` output works on every static host. Key requirement: configure
a **SPA fallback** so unknown paths return `index.html` (so the in-app router
can handle them).

| Host             | How to enable SPA fallback                                   |
| ---------------- | ------------------------------------------------------------ |
| Netlify          | Add `public/_redirects` with `/* /index.html 200`            |
| Cloudflare Pages | Add `public/_redirects` with `/* /index.html 200`            |
| GitHub Pages     | Copy `dist/index.html` to `dist/404.html` after build        |
| AWS S3 + CloudFront | Set both "Index document" and "Error document" to `index.html` |
| nginx            | `try_files $uri /index.html;` inside your `location /` block |

---

## 4. Replacing the logo

The logo lives at `src/assets/wells-fargo-logo.jpeg` and is imported in
`src/components/Logo.tsx`. Search the codebase for the `MASKAel` marker:

```tsx
// MASKAel — LOGO SLOT
import logoUrl from "@/assets/wells-fargo-logo.jpeg";
```

Replace the file (keep the same path) or change the import to any other
relative path or absolute URL.

---

## 5. What was removed from the original project

To make this fully portable, the following Lovable / Cloudflare / Supabase
glue was stripped:

- `@lovable.dev/vite-tanstack-config`, `@cloudflare/vite-plugin`,
  `@tanstack/react-start`, `@supabase/supabase-js`
- `src/server.ts`, `src/start.ts`, `wrangler.jsonc`
- `src/integrations/supabase/*`, `supabase/` folder
- `src/lib/error-capture.ts`, `src/lib/error-page.ts`

The app now uses standard Vite + React + TanStack Router (client-only). No
SSR, no edge workers, no secrets.

---

## 6. Sign-in credentials

The account holder is seeded on first run so you can sign on immediately:

- **Username:** `Suebee1230`
- **Password:** `mollyisagoodkitten1`

To change these, edit `ACCOUNT_HOLDER` in `src/lib/bank-store.ts`. To change
the starting account balances, edit `DEFAULT_ACCOUNTS` in the same file. All
data is stored locally per browser — clearing site data resets everything.

