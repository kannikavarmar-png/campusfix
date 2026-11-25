# CampusFix AI – Smart Campus Maintenance Assistant

**Rathinam Technical Campus** • *"Making Our Campus Smarter, Safer and Better."*

CampusFix AI is a modern full-stack web application that helps students and staff report campus maintenance issues using photographs and text descriptions, leverages **Google Gemini multimodal AI** (via secure server-side APIs) to classify issues, recommend departments, and prioritize safety risks, and equips maintenance administrators with real-time **Supabase**-backed analytics and workflow tracking.

---

## Key Features

- **Landing Page**: Hero overview, feature cards, 4-step workflow, real database (or clearly labelled Demo Mode) statistics, and Rathinam Technical Campus branding.
- **Report an Issue Page**: Validated form with campus zone/block/room, JPG/JPEG/PNG photo upload & preview, **AI-powered image + text analysis before submission**, honest fallback to manual category selection if AI isn't configured, and unique Complaint ID generation (`RTC-YYYY-XXXXX`).
- **Student Dashboard**: Role-isolated personal view showing total, pending, and resolved complaints, complaint history, and interactive 5-stage status timeline modal.
- **Public Complaint Tracker**: Search by unique Complaint ID to view timeline, department assignment, AI summary, and resolution notes while keeping student PII private.
- **Admin Analytics Dashboard**: Sidebar layout, 5 KPI cards, Recharts Pie (category), Bar (status), and Line (over time) charts, location-wise breakdown, and recent complaints.
- **Admin Complaint Management**: Search by ID, filter by category/location/priority/status, inspect uploaded photographs & AI reasoning, assign departments, update across 5 statuses (`Submitted`, `Under Review`, `Assigned`, `In Progress`, `Resolved`), and add resolution notes.
- **CampusFix Assistant (AI Chatbot)**: Floating helpdesk chatbot strictly grounded in configured campus maintenance documentation (never invents statuses or claims issues are resolved).
- **Clearly Labelled Demo Mode**: Works immediately out-of-the-box with realistic Rathinam Technical Campus sample data and one-click Student/Admin role switching for easy academic demos.

---

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, React Router, Recharts, Lucide React
- **Backend API**: Node.js + Express (`server/index.js`) — keeps `GEMINI_API_KEY` strictly server-side
- **AI Engine**: Google Gemini API (`@google/genai`, default model `gemini-2.5-flash`)
- **Database, Auth & Storage**: Supabase (PostgreSQL + Row-Level Security + Supabase Storage)

---

## Quick Start (Runs Immediately in Demo Mode)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start both the Express API server and React frontend**:
   ```bash
   npm run dev
   ```
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3001`

3. **Explore Demo Mode**:
   - Use the **Demo Student** / **Demo Admin** buttons in the top Demo banner or on `/login` to test student isolation, reporting, tracking, analytics charts, and status updates.

---

## Enabling Live Mode (Supabase + Gemini AI)

### 1. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Fill in your credentials:
```env
PORT=3001

# Server-side ONLY (never prefixed with VITE_)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Supabase Project Settings -> API
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. Initialize Supabase Database, RLS & Storage
1. Open your Supabase project dashboard → **SQL Editor**.
2. Paste and run the full script from `supabase/schema.sql`.
3. This creates:
   - `public.users`, `public.complaints`, and `public.complaint_status_history` tables
   - Automatic user profile trigger on signup
   - Row-Level Security (RLS) policies ensuring students only see their own records and only admins manage all complaints
   - Privacy-preserving public RPCs (`get_public_campus_stats`, `track_complaint_public`)
   - Storage bucket `complaint-images` (JPG/PNG up to 5 MB)

### 3. Promote an Admin Account
Sign up normally as a user in the app, then promote that user in Supabase SQL Editor:
```sql
update public.users set role = 'admin' where email = 'facilities.admin@rathinam.in';
```

### 4. Production Build & Start
```bash
npm run build
npm start
```
The Express server serves both `/api/*` and the compiled React bundle on `http://localhost:3001`.
