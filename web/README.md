# Study Companion — Frontend

This folder contains a Vite + React + TypeScript frontend for the Study Companion project.

Environment
- Copy `.env.example` to `.env` (or `.env.local`) and set:
  - VITE_API_BASE_URL — base URL of backend API (default: http://localhost:5001)

Install

```bash
cd web
npm install
npm run dev
```

What this app implements
- Onboarding (timezone, pomodoro preferences, connect calendar)
- Dashboard with three columns: events, sessions, notifications
- Exams list and exam detail with a planning wizard
- Session Runner to start/check-in/complete study sessions
- Notifications view
- Diagnostics page at `/debug` to check backend

API contract (required endpoints)
- POST /api/calendar/sync — triggers calendar sync, returns summary { scanned, inserted, updated, unchanged }
- GET /api/events/upcoming — returns { items: Event[] }
- GET /api/exams — returns Exam[]
- GET /api/exams/:id — returns Exam object
- POST /api/exams/:id/plan — body { type, topics } => returns { sessions }
- POST /api/sessions/:id/start — returns Session
- POST /api/sessions/:id/checkin — body { completedTaskIds, note } => returns Session
- POST /api/sessions/:id/complete — returns Session
- GET /api/notifications — returns notifications list

Notes
- Uses React Query (@tanstack/react-query) for fetching and cache invalidation.
- Uses Tailwind CSS for styles.
- Auth is a lightweight local stub; if backend exposes auth endpoints, replace the login flow.
- Remember to enable CORS in the backend (Access-Control-Allow-Origin) if serving frontend from a different origin.
