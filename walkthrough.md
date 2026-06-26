# CertCompass - AI Certification Recommendation System

CertCompass is a vendor-neutral AI certification discovery and recommendation system designed to guide developers and professionals along structured cloud, data, and AI pathways. The system features a responsive React frontend, a FastAPI Python backend, and is integrated with Supabase for user authentication and path persistence.

---

## Features Implemented

### 1. Dynamic Path Recommendation Engine (FastAPI Backend)
- Matches career goals and existing skills against a database of certifications.
- Accounts for user skill levels (Beginner, Intermediate, Advanced) and structures the recommended path sequentially to facilitate structured progression.
- Robust and resilient: gracefully falls back to in-memory storage if the database is not fully configured.

### 2. Live Discovery & Search (React Frontend)
- Explore certifications interactively with filters for pricing (e.g., Free vs. Paid), difficulty level, and search keywords.
- Styled using a premium, modern design language featuring dark mode, sleek cards, and subtle glassmorphic effects.

### 3. User Authentication & Profile Persistence
- Supabase-backed account sign-up and sign-in.
- User session state managed globally using **Zustand**.
- Authenticated users can save their customized recommendations to their account and view past paths on the "My Paths" dashboard.

---

## Visual Walkthrough

### Home Page
The landing page introduces CertCompass with a hero layout, offering quick access to explore certifications and start building learning paths.

![Home Page - Hero View](file:///C:/Users/janha/.gemini/antigravity-ide/brain/d45d9d70-ecbb-441b-8142-1da64eb03f99/home_page_loaded_1782138343186.png)

### Explore Certifications Page
Users can search, filter by skill or difficulty, and browse the database of curated certifications with real-time feedback.

![Explore Page - All Certifications](file:///C:/Users/janha/.gemini/antigravity-ide/brain/d45d9d70-ecbb-441b-8142-1da64eb03f99/explore_page_loaded_1782138998897.png)

### Real-Time Filtering
Search queries such as "TensorFlow" instantly filter down the list to relevant certifications.

![Explore Page - Filtering results](file:///C:/Users/janha/.gemini/antigravity-ide/brain/d45d9d70-ecbb-441b-8142-1da64eb03f99/explore_page_tensorflow_search_1782139033551.png)

### Authenticated Sign Up
Accounts are securely registered through Supabase, unlocking the ability to save custom generated tracks.

![Sign Up Page](file:///C:/Users/janha/.gemini/antigravity-ide/brain/d45d9d70-ecbb-441b-8142-1da64eb03f99/signup_page_loaded_1782140848083.png)

---

## Local Execution Instructions

To run the full stack locally, follow these steps:

### Prerequisite Environment Variables

Create a `backend/.env` file with your credentials:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

And update your frontend Supabase service file at [supabase.js](file:///C:/Users/janha/.gemini/antigravity-ide/scratch/certcompass-react/src/services/supabase.js) with the corresponding credentials.

### 1. Run the Python Backend
Activate the virtual environment and launch Uvicorn:
```powershell
# Navigate to project root
cd C:\Users\janha\.gemini\antigravity-ide\scratch\certcompass-react

# Run Uvicorn using the virtual environment interpreter
.venv\Scripts\python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
The API documentation will be available at `http://127.0.0.1:8000/docs` and the health endpoint is at `http://127.0.0.1:8000/health`.

### 2. Run the React Frontend
Open a new terminal session, prepend the Node.js path, and launch Vite:
```powershell
# Prepend NodeJS path and run Vite
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
npm.cmd run dev
```
The application will launch locally at `http://localhost:5173`.

---

## Supabase Schema Migrations

To enable path persistence, execute this schema inside your **Supabase SQL Editor**:

```sql
-- Create user profiles table
create table public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  saved_certs text[] default '{}',
  career_goal text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user paths table to store saved paths
create table public.user_paths (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  cert_ids text[] default '{}' not null,
  searched_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.user_profiles enable row level security;
alter table public.user_paths enable row level security;

-- Create policies for user_profiles
create policy "Users can view and edit their own profile." on public.user_profiles
  for all using (auth.uid() = id);

-- Create policies for user_paths
create policy "Users can view and edit their own paths." on public.user_paths
  for all using (auth.uid() = user_id);
```

---

## Cloud Deployment Guides

### Backend (Railway)
1. Link your Github repository or directory to Railway.
2. Railway detects `backend/requirements.txt` and `railway.toml`.
3. Add your environment variables `SUPABASE_URL` and `SUPABASE_KEY` in the Railway environment variables dashboard.
4. Railway will automatically deploy using Uvicorn.

### Frontend (Vercel)
1. Import your project into Vercel.
2. In Project Settings, set:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add environment variables if needed or customize `vercel.json` rewrite settings (which are already bundled in the repo structure to handle client routing).
