# Airdrop Radar Server

Next.js backend server for Airdrop Radar MVP.

## Features

- 🔍 **Automated Crawlers**: Collect airdrops from Binance, Bybit, Upbit, Bithumb
- 📊 **Admin Dashboard**: Manage and verify airdrops
- 🔔 **Push Notifications**: Send alerts via Firebase Cloud Messaging
- 🛡️ **Risk Scoring**: Automatic scam detection
- 📱 **RESTful API**: For mobile app integration

## Setup

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anon/public key
- `SUPABASE_SERVICE_KEY`: Supabase service role key
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `FIREBASE_CLIENT_EMAIL`: Firebase service account email
- `FIREBASE_PRIVATE_KEY`: Firebase service account private key
- `CRON_SECRET`: Secret key for securing cron endpoints

### 3. Setup Supabase Database

Run the SQL schema in your Supabase SQL editor:

```bash
cat supabase/schema.sql
```

Copy and execute the SQL in Supabase Dashboard > SQL Editor.

### 4. Run Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3001`.

## API Endpoints

### Airdrops

- `GET /api/airdrops` - List all airdrops (with filters)
  - Query params: `exchange`, `verified`, `maxRisk`, `page`, `limit`
- `GET /api/airdrops/[id]` - Get single airdrop
- `PATCH /api/airdrops/[id]` - Update airdrop (admin)

### User Preferences

- `GET /api/preferences?userId=XXX` - Get user preferences
- `POST /api/preferences` - Create/update preferences

### Reports

- `GET /api/reports?airdropId=XXX` - Get scam reports for airdrop
- `POST /api/reports` - Submit scam report

### Notifications

- `POST /api/notifications/send` - Send push notification (requires auth)

### Crawler

- `POST /api/crawler/run` - Run crawler manually (requires auth)

## Running the Crawler

### Manual

```bash
npm run crawler
```

### Automated (Cron)

Set up a cron job on Vercel or use a service like cron-job.org to call:

```
POST https://your-domain.vercel.app/api/crawler/run
Authorization: Bearer YOUR_CRON_SECRET
```

Recommended frequency: Every 1-3 hours

## Admin Dashboard

Access at: `http://localhost:3001/admin`

Features:
- View all airdrops
- Filter by exchange and verification status
- Verify airdrops
- Run crawler manually
- View statistics

## Deployment

### Vercel (Recommended)

```bash
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

### Environment Variables

Make sure to set all environment variables in your Vercel project settings.

## Project Structure

```
server/
├── app/
│   ├── api/              # API routes
│   │   ├── airdrops/
│   │   ├── preferences/
│   │   ├── reports/
│   │   ├── notifications/
│   │   └── crawler/
│   ├── admin/            # Admin dashboard
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/
│   ├── crawlers/         # Exchange crawlers
│   │   ├── binance.ts
│   │   ├── bybit.ts
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   └── index.ts
│   ├── supabase.ts       # Supabase client
│   └── firebase.ts       # Firebase admin
├── scripts/
│   └── crawler.js        # Crawler script
├── supabase/
│   └── schema.sql        # Database schema
├── package.json
├── tsconfig.json
└── next.config.js
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth & Storage**: Supabase
- **Notifications**: Firebase Cloud Messaging
- **Crawling**: Axios, Cheerio
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## License

MIT

