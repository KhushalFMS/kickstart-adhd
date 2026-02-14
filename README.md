# Kickstart - ADHD Task Manager

The only task manager built for ADHD brains. Focus on one thing at a time.

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **State Management**: Zustand
- **Deployment**: Vercel + Supabase Cloud

## Features (MVP)

- ✅ Single-priority task queue (one task visible at a time)
- ✅ Forced task entry (3 mandatory fields: done criteria, time block, deadline)
- ✅ Start protocol (break down stuck tasks into 30-sec micro-actions)
- ✅ Pre-ship QC checklist (catch errors before completing tasks)
- ✅ Basic memory (task templates, error pattern tracking)

## Setup Instructions

### 1. Clone and Install

```bash
# Install dependencies
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Run migrations in order (SQL Editor):
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_add_skipped_qc_to_tasks.sql`
   - `supabase/migrations/003_ai_usage_logs.sql`
   - `supabase/migrations/004_task_state_invariants.sql`
   - `supabase/migrations/005_atomic_ai_rate_limit.sql`
   - `supabase/migrations/006_analytics_events.sql`

### 3. Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
kickstart-app/
├── app/
│   ├── page.tsx              # Landing page
│   ├── dashboard/            # Main app (to be built)
│   ├── login/                # Auth pages (to be built)
│   └── globals.css           # Global styles
├── components/               # Reusable UI components (to be built)
├── contexts/
│   └── AuthContext.tsx       # Auth state management
├── lib/
│   └── supabase.ts          # Supabase client
├── store/
│   └── taskStore.ts         # Zustand state management
├── types/
│   └── supabase.ts          # TypeScript types for DB
└── supabase/
    └── migrations/          # Database schema
```

## Publish Checklist

- [ ] Set production env vars in Vercel (`NEXT_PUBLIC_*`, `ANTHROPIC_API_KEY`)
- [ ] Apply all Supabase migrations in order
- [ ] Configure Supabase email templates/redirects to `${NEXT_PUBLIC_APP_URL}/auth/callback`
- [ ] Run `npm run lint`
- [ ] Run `npm run test`
- [ ] Run `npm run build`
- [ ] Deploy and smoke test:
  - Signup + email verification
  - Login + forgot/reset password
  - Add/start/complete/blocked task flows
  - AI breakdown rate limiting

## Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel deploy
```

## License

MIT
