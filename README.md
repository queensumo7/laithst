# LaithST Photography — Full Stack Website

A complete Next.js + Supabase website for LaithST Photography, featuring a public site with 7 pages, fully functional backend APIs, and an admin panel.

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage (for portfolio images)
- **Email**: Resend
- **Deployment**: Vercel (recommended)

---

## Project Structure

```
src/
├── app/
│   ├── admin/                    # Admin panel (auth-protected)
│   │   ├── login/page.tsx        # Admin login
│   │   ├── page.tsx              # Dashboard with stats
│   │   ├── competitions/page.tsx # Manage competition schedule
│   │   ├── bookings/page.tsx     # View & manage bookings
│   │   ├── enquiries/page.tsx    # Shoots, brands, contact messages
│   │   └── portfolio/page.tsx    # Upload & manage portfolio
│   ├── api/                      # Backend API routes
│   │   ├── competitions/         # GET, POST, PATCH, DELETE
│   │   ├── bookings/             # GET, POST, PATCH, DELETE
│   │   ├── enquiries/            # GET, POST, PATCH
│   │   ├── contact/              # GET, POST
│   │   └── portfolio/            # GET, POST, PUT (upload), PATCH, DELETE
│   ├── layout.tsx                # Root layout with fonts
│   └── globals.css               # Global styles
├── lib/
│   ├── supabase.ts               # Supabase client helpers
│   └── email.ts                  # Resend email templates
├── types/
│   └── index.ts                  # TypeScript types
└── middleware.ts                 # Admin auth protection
supabase/
└── schema.sql                    # Full database schema + seed data
```

---

## Setup Guide

### Step 1 — Clone and install

```bash
git clone <your-repo>
cd laithst
npm install
```

### Step 2 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL editor, paste and run the contents of `supabase/schema.sql`
3. Go to **Storage** → Create a bucket called `portfolio` → Set it to **Public**
4. Go to **Settings → API** and copy your Project URL and anon key

### Step 3 — Set up Resend (email)

1. Go to [resend.com](https://resend.com) and create an account
2. Add and verify your domain (laithstphotography.com)
3. Create an API key

### Step 4 — Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_your_api_key
NOTIFICATION_EMAIL=laith@laithstphotography.com
FROM_EMAIL=noreply@laithstphotography.com
NEXT_PUBLIC_SITE_URL=https://laithstphotography.com
```

### Step 5 — Create admin user

1. In Supabase Dashboard → **Authentication → Users**
2. Click **Invite user** or **Add user**
3. Enter Laith's email and set a password
4. This account will have access to `/admin`

### Step 6 — Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — site is live.
Open [http://localhost:3000/admin](http://localhost:3000/admin) — admin panel.

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo to Vercel and it will deploy automatically on every push.

Add all environment variables in **Vercel → Settings → Environment Variables**.

---

## API Reference

### Competitions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/competitions` | List all competitions |
| POST | `/api/competitions` | Create new competition |
| PATCH | `/api/competitions/:id` | Update competition |
| DELETE | `/api/competitions/:id` | Delete competition |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | List all bookings |
| POST | `/api/bookings` | Submit new booking |
| PATCH | `/api/bookings/:id` | Update booking status |
| DELETE | `/api/bookings/:id` | Delete booking |

### Enquiries
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/enquiries?type=shoot\|brand` | List enquiries |
| POST | `/api/enquiries` | Submit enquiry (shoot or brand) |
| PATCH | `/api/enquiries/:id` | Update enquiry status |

### Contact
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contact` | List contact messages |
| POST | `/api/contact` | Submit contact message |

### Portfolio
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/portfolio` | List portfolio items |
| POST | `/api/portfolio` | Create portfolio item |
| PUT | `/api/portfolio` | Upload file to Supabase Storage |
| PATCH | `/api/portfolio/:id` | Update portfolio item |
| DELETE | `/api/portfolio/:id` | Delete item + file from storage |

---

## Admin Panel Features

- **Dashboard** — Live stats: pending bookings, new enquiries, unread messages, open competitions
- **Competitions** — Add/edit/delete events, set status (open/soon/closed/past), set region
- **Bookings** — View all booking requests with client details, update status (pending/confirmed/completed/cancelled), reply by email directly
- **Enquiries** — Three tabs: Private Shoots, Brand Enquiries, Contact Messages. Click any item to see full details and update status
- **Portfolio** — Drag & drop upload to Supabase Storage, or paste URL. Mark items as featured (shown on homepage). Edit title, category, sort order. Delete removes from storage too.

---

## Adding the Public Site Pages

The frontend pages (Home, Portfolio, Competitions, Private Shoots, Brands, About, Contact) use the design built in the prototype. To wire them up:

1. Copy the HTML/CSS from the prototype into Next.js page components
2. Replace hardcoded data with API fetches:
   - `fetch('/api/competitions')` for the competition schedule
   - `fetch('/api/portfolio')` for the gallery
3. Wire forms to POST to the relevant API routes
4. All forms include validation, database storage, and dual emails (notification to Laith + confirmation to client)

---

## Environment Variables Summary

| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `RESEND_API_KEY` | resend.com → API Keys |
| `NOTIFICATION_EMAIL` | Laith's email address |
| `FROM_EMAIL` | Your verified sending domain |
| `NEXT_PUBLIC_SITE_URL` | Your production URL |

---

Built for LaithST Photography © 2026
