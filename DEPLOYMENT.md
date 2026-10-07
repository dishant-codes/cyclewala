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
| `DATA_DIR` | only without a database | Folder on the persistent disk, outside the code. Not needed once `DB_*` is set — everything is in MySQL then |
| `ADMIN_SESSION_SECRET` | optional | Long random string that signs admin session cookies |
| `USE_DATABASE`, `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | only to use MySQL (set `USE_DATABASE=true`) | The MySQL database that holds everything: accounts, wishlists, orders, bookings, the catalogue and uploaded photos (`DB_PORT` defaults to 3306). **Leave them out on Vercel** — the shop then uses Vercel Blob, exactly as before. If they are set they win over Blob |
| `CUSTOMER_SESSION_SECRET` | yes, for customer accounts | Long random string (`openssl rand -hex 32`) that signs customer sign-in cookies. Without any secret in production, customers cannot sign in. Needed on Vercel too |

On Vercel, add `ADMIN_EMAIL`, `ADMIN_PASSWORD` (at least 10 characters), and
optionally `ADMIN_SESSION_SECRET` under **Project Settings → Environment
Variables** for the **Production** environment. Create a Vercel Blob store
under **Storage**, connect it to this project, and make sure
`BLOB_READ_WRITE_TOKEN` is enabled for Production. Orders, bookings, catalogue
edits and uploads use that store because Vercel serverless filesystems are not
writable between requests. Redeploy after changing environment variables;
they are only available to a new deployment.

> **The MySQL database is switched off by default.** It only turns on when `USE_DATABASE=true` is set
> (together with the `DB_*` values). Until then everything below that mentions MySQL does not apply, and
> the shop uses Vercel Blob / Netlify Blobs / files exactly as before.

## Which storage is used where

The same code runs everywhere; the environment decides where data goes:

| Where it runs | Settings | Orders, bookings, catalogue, photos and customer accounts live in |
|---|---|---|
| **Vercel** (testing now) | `BLOB_READ_WRITE_TOKEN` (from the connected Blob store), **no** `DB_*` | Vercel Blob |
| **Hostinger** (later) | `USE_DATABASE=true` plus `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | MySQL |
| Netlify | nothing extra | Netlify Blobs |
| Your own machine | nothing, or `DB_*` for Laragon's MySQL | files in `./data`, or MySQL |

On Vercel also set `CUSTOMER_SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `NEXT_PUBLIC_SITE_URL`.
A Hostinger MySQL database can't be used from Vercel (Hostinger only lets listed IP addresses connect, and
Vercel's change constantly), so while you test on Vercel, accounts and orders live in Blob. Moving to
Hostinger later means starting the app there with the `DB_*` settings and copying the data across — see
"Moving file data into MySQL" below; Blob data can be exported from the admin (orders) and re-entered, or you
simply start fresh once real customers arrive.

## Deploying on Hostinger (Business web hosting)

Business web hosting can run Node.js apps and includes MySQL, so the whole site — and its database —
live in one place.

1. **Create the database.** hPanel -> *Websites* -> your site -> *Databases* -> *Management*. Create a
   MySQL database, a database user and a strong password (you'll see names like `u123456789_cyclewala`).
   The host is `localhost`. Write the four values down.
2. **Create the app.** hPanel -> *Websites* -> *Add website* -> *Node.js Apps*, then import this GitHub
   repository (branch `main`). Pick Node 20 or newer. Build command `npm run build`, start command
   `npm start` (Hostinger usually detects Next.js and fills these in).
3. **Add the environment variables** in the app's settings: everything in the table below, including
   `DB_HOST=localhost`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `CUSTOMER_SESSION_SECRET`,
   `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_SITE_URL` (your real https address) and `DATA_DIR`.
   `DATA_DIR` is not needed: with the database configured, orders, bookings, the catalogue and uploaded
   photos all live in MySQL, so a redeploy can never wipe them.
4. **Deploy.** The two customer tables are created automatically the first time the site talks to the
   database — nothing to import. (`db/schema.sql` shows the structure if you'd rather run it yourself in
   phpMyAdmin.)
5. **Copy your existing data across (once).** On your own computer, with your `.env` pointing at the local
   `CW` database, run `npm run db:migrate` — it copies `data/orders.json`, `bookings.json`, `products.json` and
   any uploaded photos into MySQL (see "Moving file data into MySQL" below). Then in local phpMyAdmin choose
   the `CW` database -> *Export* -> *Quick* -> *SQL*, and in Hostinger's phpMyAdmin choose your database ->
   *Import* and upload that file. (Or, if you add your computer's address under hPanel -> Databases ->
   *Remote MySQL*, you can run `npm run db:migrate` straight into Hostinger by setting `DB_HOST` to the
   MySQL host shown there.) If you only have test data, skip this step.
6. **Check it:** create an account on the live site, then open phpMyAdmin -> your database -> `customers`.
   Your row should be there. Sign out and in again, and refresh the page — you should stay signed in.
7. **HTTPS:** turn on the free SSL certificate for the domain; sign-in cookies are marked Secure over https.

Back up the database from hPanel (*Backups*, or phpMyAdmin -> Export) as well as `DATA_DIR`.

## Moving file data into MySQL

Until now orders, bookings and catalogue edits were kept in JSON files under `data/`. With the `DB_*`
settings present the shop reads and writes MySQL instead, so copy the files in **once**, before (or
straight after) the first start with a database:

```bash
npm run db:migrate                      # copies data/*.json and data/uploads into the database
npm run db:migrate -- --from ./backup   # ...or from another folder, e.g. a backup of your live DATA_DIR
npm run db:migrate -- --force           # also replace the catalogue already in the database with the file's copy
```

It only reads your files (nothing is deleted), and running it twice is safe: orders, bookings and photos
that are already in the database are skipped. If the site was started against an empty database *before*
you migrated, it will have seeded the built-in catalogue; run it once with `--force` to bring your
edited catalogue in.

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

With the database configured, none of this is read any more. Everything lives in MySQL (tables
`customers`, `wishlist_items`, `orders`, `bookings`, `products`, `uploads`, `collections` — see
`db/schema.sql`). Back up the **database** (hPanel -> Backups, or phpMyAdmin -> Export).

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
