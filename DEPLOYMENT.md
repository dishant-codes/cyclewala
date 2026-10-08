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
- **On Vercel** — [Vercel Blob](https://vercel.com/docs/vercel-blob), when
  `BLOB_READ_WRITE_TOKEN` is set.
- **Everywhere else** (a VPS, Render, Railway, or your own machine) — plain
  JSON files on disk, under `DATA_DIR`, exactly as before.
- **MongoDB, on any of them** — as soon as `MONGODB_URI` is set, *everything*
  (customer accounts, wishlists, orders, bookings, the catalogue, uploaded
  photos) is stored in MongoDB instead, and it wins over all of the above.

## 1. Environment variables

Copy `.env.example` and set these in the host's environment settings:

| Variable | Required | What it is |
|---|---|---|
| `ADMIN_EMAIL` | yes | Email used to sign in at `/admin` |
| `ADMIN_PASSWORD` | yes | 10+ characters. Without it the admin refuses every login in production |
| `NEXT_PUBLIC_SITE_URL` | yes | Public address, e.g. `https://cyclewala.in`. **Set before building** — it is baked into the sitemap and link previews |
| `DATA_DIR` | only without a database | Folder on the persistent disk, outside the code. Not needed once `MONGODB_URI` is set — everything is in MongoDB then |
| `ADMIN_SESSION_SECRET` | optional | Long random string that signs admin session cookies |
| `MONGODB_URI` | only to use MongoDB | The connection string of the MongoDB database that holds everything: accounts, wishlists, orders, bookings, the catalogue and uploaded photos. From MongoDB Atlas: *Connect -> Drivers*, e.g. `mongodb+srv://user:password@cluster0.abcde.mongodb.net/`. Leave it out and the shop uses Vercel Blob / Netlify Blobs / files as before |
| `MONGODB_DB` | optional | Database name inside the cluster (default `cyclewala`) |
| `USE_DATABASE` | optional | Set to `false` to switch MongoDB off while keeping `MONGODB_URI` in place |
| `CUSTOMER_SESSION_SECRET` | yes, for customer accounts | Long random string (`openssl rand -hex 32`) that signs customer sign-in cookies. Without any secret in production, customers cannot sign in. Needed on Vercel too |

On Vercel, add `ADMIN_EMAIL`, `ADMIN_PASSWORD` (at least 10 characters), and
optionally `ADMIN_SESSION_SECRET` under **Project Settings → Environment
Variables** for the **Production** environment. Create a Vercel Blob store
under **Storage**, connect it to this project, and make sure
`BLOB_READ_WRITE_TOKEN` is enabled for Production. Orders, bookings, catalogue
edits and uploads use that store because Vercel serverless filesystems are not
writable between requests. Redeploy after changing environment variables;
they are only available to a new deployment.

> **MongoDB is off until `MONGODB_URI` is set.** Without it the shop uses Vercel Blob / Netlify Blobs /
> files exactly as before. On Atlas, open *Network Access* and allow `0.0.0.0/0` (Vercel's addresses change
> on every request), otherwise the connection times out.

## Which storage is used where

The same code runs everywhere; the environment decides where data goes:

| Where it runs | Settings | Orders, bookings, catalogue, photos and customer accounts live in |
|---|---|---|
| **Vercel** | `MONGODB_URI` (and optionally `MONGODB_DB`) | MongoDB |
| **Vercel** without MongoDB | `BLOB_READ_WRITE_TOKEN` (from the connected Blob store) | Vercel Blob |
| **Hostinger** | `MONGODB_URI` | MongoDB |
| Netlify | nothing extra (or `MONGODB_URI`) | Netlify Blobs (or MongoDB) |
| Your own machine | nothing, or `MONGODB_URI` | files in `./data`, or MongoDB |

On Vercel also set `CUSTOMER_SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `NEXT_PUBLIC_SITE_URL`.
MongoDB Atlas works from every host, so the same database can serve Vercel today and Hostinger later — no
data copy is needed when you move. To bring existing data (from `./data` or from the live Vercel Blob store)
into MongoDB once, see "Moving existing data into MongoDB" below.

## Deploying on Hostinger (Business web hosting)

Business web hosting can run Node.js apps. Hostinger does not host MongoDB itself, so use a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or any MongoDB server) — the app talks to it over
the internet.

1. **Create the database.** Atlas -> create a free *M0* cluster -> *Database Access*: add a user with a
   strong password -> *Network Access*: allow your hosting's address (or `0.0.0.0/0`) -> *Connect* ->
   *Drivers* and copy the connection string. Put the user's password in it.
2. **Create the app.** hPanel -> *Websites* -> *Add website* -> *Node.js Apps*, then import this GitHub
   repository (branch `main`). Pick Node 20 or newer. Build command `npm run build`, start command
   `npm start` (Hostinger usually detects Next.js and fills these in).
3. **Add the environment variables** in the app's settings: `MONGODB_URI`, `CUSTOMER_SESSION_SECRET`,
   `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `NEXT_PUBLIC_SITE_URL` (your real https address). `DATA_DIR` is not
   needed: with MongoDB configured, everything lives in the database, so a redeploy can never wipe it.
4. **Deploy.** The collections and indexes are created automatically the first time the site talks to the
   database — nothing to import.
5. **Copy your existing data across (once, optional).** See the next section. If you only have test data,
   skip it.
6. **Check it:** create an account on the live site, then open Atlas -> *Browse Collections* ->
   `cyclewala` -> `customers`. Your document should be there. Sign out and in again, and refresh the page —
   you should stay signed in.
7. **HTTPS:** turn on the free SSL certificate for the domain; sign-in cookies are marked Secure over https.

Atlas keeps automatic backups on paid tiers; on the free tier export now and then (*Database tools*, or
`mongodump`).

## Moving existing data into MongoDB

Put `MONGODB_URI` in `.env.local` on your own computer, then run **once**:

```bash
npm run db:migrate                      # copies ./data (orders, bookings, catalogue, accounts, photos)
npm run db:migrate -- --from ./backup   # ...or from another folder
npm run db:migrate -- --blob            # ...or straight from the live Vercel Blob store
                                        #    (also put its BLOB_READ_WRITE_TOKEN in .env.local)
npm run db:migrate -- --force           # also replace the catalogue already in MongoDB with the copy found
```

It only reads the source (nothing is deleted or changed there), and running it twice is safe: orders,
bookings, accounts and photos already in MongoDB are skipped. Customer accounts get new ids in MongoDB and
their orders are re-linked, so "My orders" keeps working; passwords still work because only the hash moves.
If the site was started against an empty database *before* you migrated, it will have seeded the built-in
catalogue; run it once with `--force` to bring your edited catalogue in.

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

With MongoDB configured, none of this is read any more. Everything lives in the database
(collections `customers`, `orders`, `bookings`, `products`, `uploads`, `collections`). Back up the
**database**.

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
