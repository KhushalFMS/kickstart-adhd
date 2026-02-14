# QUICK START - V2 WITH ADHD FEATURES

## 🚀 Installation (Fresh Install)

```bash
cd ~/Downloads
tar -xzf kickstart-v2-with-adhd-features.tar.gz
cd kickstart-app
npm install
npm run dev
```

Open http://localhost:3000

## 🔄 Upgrading from V1

If you already have the app running:

```bash
cd ~/Downloads/kickstart-app
# Backup your current version (optional)
cp -r . ../kickstart-app-backup

# Extract new version
cd ~/Downloads
tar -xzf kickstart-v2-with-adhd-features.tar.gz
cd kickstart-app

# Reinstall dependencies (versions changed)
rm -rf node_modules package-lock.json
npm install

# Restart dev server
npm run dev
```

**Database**: No migration needed. Same schema works.

## ✨ New Features to Test

### 1. Focus Sprint Timer
1. Add a task
2. Click "Start Task"
3. Timer appears above task card
4. Click "Pomodoro" (25min)
5. Timer starts with circular progress
6. Try Pause/Resume/Reset

### 2. Distraction Capture
1. While working, press **Cmd+D** (or Ctrl+D on Windows)
2. Modal opens
3. Type a thought → Press Enter
4. Thought captured in list
5. Press Esc to close and return to focus

### 3. Calm Mode
1. Look at top-right header
2. Click 🌙 moon icon
3. App switches to dark, low-contrast theme
4. Click ☀️ sun icon to toggle back

### 4. Enhanced Micro-Actions
1. Let a task sit for 24 hours (or click "Stuck?" manually)
2. Button turns orange
3. Select blocking reason
4. Micro-action generated
5. Now shows prominently on task card

## 🧪 Quick Validation Tests

Run these to make sure everything works:

**Test 1: Timer**
- Start task → Start Pomodoro → Wait 1 minute → Pause → Resume → Reset

**Test 2: Distraction**
- Press Cmd+D → Type "buy milk" → Enter → Press Cmd+D → Type "call mom" → Enter → Esc

**Test 3: Calm Mode**
- Toggle dark mode → Refresh page → Should still be dark → Toggle back

**Test 4: Complete Flow**
- Add task → Start → Complete → Checklist → Ship → Verify queue advances

All should work perfectly.

## 🐛 Known Issues

None critical. 1 minor:
- Calm mode won't persist if browser blocks localStorage (rare)

## 📦 What's Upgraded

- Next.js 14 → 15
- Supabase 2.45 → 2.48
- Zustand 4 → 5
- date-fns 3 → 4

All tested and working.

## ⚙️ Supabase Setup (If First Time)

Before signing up:
1. Go to https://supabase.com/dashboard/project/iqzbeizobylkypagafkl/auth/providers
2. Enable "Email" provider
3. Disable "Confirm email"
4. Save

Then you can sign up instantly with no email confirmation.

## 🎯 That's It

Everything is stress-tested and ready. Full test report in `V2-STRESS-TEST-COMPLETE.md`.

**Zero blocking bugs. Ship immediately.**
