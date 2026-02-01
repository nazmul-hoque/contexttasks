# Context Tasks

**The right task, at the right moment.**

Context Tasks is an intelligent todo list that uses your physical location to rank and suggest tasks. It helps you focus on what you can actually do *right now*, filtering out the noise.

![App Screenshot](public/screenshot.png)

## ✨ Features

*   **📍 Context Intelligence:** Automatically detects if you are at **Home**, **Work**, or the **Gym**.
*   **🧠 Smart Ranking:** Tasks are sorted by priority and context relevance.
*   **⚡️ Quick Actions:** Swipe right to complete, tap to edit.
*   **📱 Native Feel:** Smooth animations, haptic feedback (planned), and gesture-driven UI.
*   **☁️ Cloud Sync:** Powered by **Supabase** for real-time sync across devices.
*   **🔐 Magic Auth:** Passwordless login via Email Magic Links.

## 🛠 Tech Stack

*   **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand)
*   **Animations:** [Framer Motion](https://www.framer.com/motion/)
*   **Database & Auth:** [Supabase](https://supabase.com/)
*   **Icons:** [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/context-tasks.git
cd context-tasks
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup (Supabase)
Run the following SQL in your Supabase SQL Editor to create the necessary tables:

```sql
-- Tasks
create table tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  context text not null,
  duration integer not null,
  priority text default 'MEDIUM',
  status text default 'TODO',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User Locations
create table user_locations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  lat double precision not null,
  lng double precision not null,
  radius double precision not null,
  icon text not null
);

-- Enable RLS
alter table tasks enable row level security;
alter table user_locations enable row level security;

-- Policies
create policy "Users can crud their own tasks" on tasks for all using (auth.uid() = user_id);
create policy "Users can crud their own locations" on user_locations for all using (auth.uid() = user_id);
```

### 4. Run Locally
```bash
npm run dev
```
Visit `http://localhost:3000`.

## 📦 Deployment

The app is ready for [Vercel](https://vercel.com).
1.  Push to GitHub.
2.  Import project in Vercel.
3.  Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel Environment Variables.
4.  Deploy!
