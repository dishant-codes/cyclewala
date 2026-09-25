# Deploying Cycle Wala

The site stores orders, bookings, catalogue edits and uploaded photos through
`lib/storage.ts`, which picks a backend automatically:

- **On Netlify** — [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/),
  Netlify's own persistent key-value store. Detected via the `SITE_ID`
  environment variable Netlify sets inside deployed Functions but never
  locally, so this needs **no configuration** — just deploy. (This is why an
  earlier version of this site returned a 400 on "Place Order" once hosted on
  Netlify: it was still writing to local JSON files, and Netlify Functions
  have a read-only filesystem outside `/tmp`. Fixed — see `lib/storage.ts`.)
- **Everywhere else** (a VPS, Render, Railway, or your own machine) — plain
  JSON files on disk, under `DATA_DIR`, exactly as before.

A platform with an ephemeral/read-only filesystem that ISN'T Netlify (e.g.
Vercel's default functions) still isn't supported — `lib/storage.ts` would
need a third backend added for that host's own persistence option.

## 1. Environment variables

Copy `.env.example` and set these in the host's environment settings:

| Variable | Required | What it is |
|---|---|---|
| `ADMIN_EMAIL` | yes | Email used to sign in at `/admin` |
| `ADMIN_PASSWORD` | yes | 10+ characters. Without it the admin refuses every login in production |
| `NEXT_PUBLIC_SITE_URL` | yes | Public address, e.g. `https://cyclewala.in`. **Set before building** — it is baked into the sitemap and link previews |
| `DATA_DIR` | yes | Folder on the persistent disk, outside the code (e.g. `/var/lib/cyclewala`) |
| `ADMIN_SESSION_SECRET` | optional | Long random string that signs admin session cookies |

## 2. Build and run

```bash
npm ci
npm run build
npm start          # listens on port 3000; use PORT=... to change
```

Put it behind a reverse proxy that terminates **HTTPS** and forwards
`X-Forwarded-For` / `X-Forwarded-Proto` (nginx, Caddy, or the host's own
router). The rate limiter and the cookie's `Secure` flag rely on those.

## 3. Where the data actually lives

**On Netlify:** in Netlify Blobs, under two stores — `cyclewala-data`
(products/orders/bookings, one JSON blob each) and `cyclewala-uploads`
(admin-uploaded photos). View or clear it from the site's **Blobs** tab in
the Netlify dashboard. `DATA_DIR` is not used here.

**Everywhere else:** on the first run with a new `DATA_DIR`, the catalogue
seeds itself from `data/products-seed.ts` (or copies `data/products.json`
if it's already there). From then on the files in `DATA_DIR` are the live
data — redeploying the code never touches them.

```
DATA_DIR/products.json   catalogue + prices (admin edits)
DATA_DIR/orders.json     customer orders   (names, phones, addresses)
DATA_DIR/bookings.json   service bookings  (names, phones, addresses)
DATA_DIR/uploads/        photos uploaded in the admin
```

## 4. Backups

**On Netlify:** Blobs isn't covered by Netlify's own backup tooling — export
the orders/bookings blobs yourself on a schedule if you want backups (e.g. a
small script that calls the admin API and saves the JSON).

**Everywhere else:** `DATA_DIR` is the only thing worth backing up. Copy it
somewhere safe daily (e.g. `cp -r /var/lib/cyclewala /backups/cyclewala-$(date +%F)`).

Either way, the orders and bookings data contains customers' personal
details — keep backups private.

## 5. Before going live

- [ ] Real admin email + strong password set; the old development login is
      ignored in production.
- [ ] `NEXT_PUBLIC_SITE_URL` set and the site rebuilt.
- [ ] Add the shop's real Instagram / Facebook links and email in
      `lib/site.ts` (`instagram`, `facebook`, `email`) — they stay hidden until
      filled in.
- [ ] Confirm the service list and prices in `data/services.ts`, including
      whether Home Service is really offered.
- [ ] Confirm the star ratings shown in the shop. They are illustrative
      values, not real reviews; showing invented ratings to customers can
      breach consumer-protection rules. Hide them or replace them with real
      reviews before launch.
- [ ] Place a test order and a test booking, check them in `/admin`, then
      delete the test entries from `DATA_DIR`.
