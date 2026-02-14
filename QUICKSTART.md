# Quick Start Guide

## 1. Database Setup (2 minutes)

1. Go to your Supabase project: https://supabase.com/dashboard/project/iqzbeizobylkypagafkl
2. Click "SQL Editor" in left sidebar
3. Click "New Query"
4. Copy entire contents of `supabase/migrations/001_initial_schema.sql`
5. Paste and click "Run"
6. You should see "Success. No rows returned"

## 2. Install & Run (1 minute)

```bash
cd kickstart-app
npm install
npm run dev
```

Open http://localhost:3000

## 3. Test the App

1. Click "Get Started Free"
2. Sign up with any email/password
3. You'll be redirected to dashboard
4. Click "Add First Task"
5. Fill in:
   - Title: "Test task"
   - Done criteria: "Task completed successfully"
   - Time: 30m
   - Deadline: Tomorrow
6. Click "Add to Queue"
7. Click "Start Task"
8. Click "Mark as Done"
9. Check all 4 boxes in the checklist
10. Click "Ship It!"

## Troubleshooting

**"Failed to fetch"** → Check .env.local has correct Supabase URL/key

**"relation does not exist"** → Run the SQL migration in Supabase

**"Invalid login credentials"** → Make sure you signed up first

## What's Working

✅ Landing page with pricing
✅ Sign up / Sign in
✅ Add tasks (3 required fields only)
✅ Single-priority queue (one task visible)
✅ Start task timer tracking
✅ Pre-ship checklist (forced on every task)
✅ Task completion with error logging
✅ Basic stats (queue count, completed today)

## Next Build (Week 2)

- Task breakdown protocol (when stuck >24hrs)
- Blocked task micro-actions
- Weekly summary view
- Error pattern tracking
