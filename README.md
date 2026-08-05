# Learning App

An interactive learning app: learners log in, work through courses made of **text, video, and quiz** content, and every interaction — page views, clicks, video playback, quiz attempts — is captured as **clickstream data** and stored in Postgres.

## Stack

- **Frontend:** React + Vite
- **Backend:** Flask (Python)
- **Database:** PostgreSQL, hosted on [Neon](https://neon.tech)
- **Auth:** session-based login (Flask-Login), passwords hashed with Werkzeug

## Features

- Email/password login and registration
- Courses → lessons → content blocks (text, embedded YouTube video, quiz)
- Auto-scored single-choice quizzes
- Every learner interaction tracked as a clickstream event:
  - `page_view`, `click`
  - `video_play`, `video_pause`, `video_seek`, `video_complete`
  - `quiz_started`, `quiz_answer_submitted`, `quiz_completed`
- An `/admin` page to see the captured events live (counts by type + a recent-events table)

## Architecture

```
React (Vite, :5173) ──/api──▶ Flask (:5000) ──▶ PostgreSQL (Neon)
```

In development, Vite proxies `/api/*` to Flask so the two behave as one origin (no CORS, session cookies just work). The frontend never talks to Postgres directly — everything goes through the Flask API.

## Data model

| Table | Purpose |
|---|---|
| `users` | learner accounts |
| `courses` → `lessons` | course structure |
| `content_blocks` | one row per piece of lesson content; a `block_type` column (`text`/`video`/`quiz`) picks which columns are used. One table instead of three, so text/video/quiz can be freely ordered and interleaved within a lesson. |
| `quizzes` / `quiz_questions` / `quiz_options` | single-choice quizzes |
| `quiz_attempts` | one row per quiz submission (score, total) |
| `events` | **the clickstream log** — every tracked interaction, one generic table |

**Why `events` is one generic table:** a typed table per event kind (e.g. separate `video_events`, `quiz_events` tables) would need a schema migration every time a new event type is added, and "show me everything this user did" would mean unioning many tables. Instead, `events` has a fixed envelope (`user_id`, `event_type`, `session_id`, `course_id`/`lesson_id`/`content_block_id` for context, timestamps) plus a `payload` JSON column for event-specific detail. This is the same shape real clickstream/analytics systems (Segment, Mixpanel, Snowplow) use.

## Clickstream capture

- The frontend has a single `trackEvent()` utility (`frontend/src/hooks/useTracking.js`) that every component calls.
- Events are queued client-side and sent in **batches** — every 5 seconds or every 10 events, whichever comes first — plus a flush when the tab closes.
- Video tracking uses the real **YouTube IFrame API** (not a static embed) so play/pause/complete come from actual player state changes; a seek is inferred when playback resumes at a position more than 2 seconds from where it paused.
- The backend (`POST /api/events`) validates `event_type` against an allow-list, stamps `user_id` and `server_timestamp` itself (never trusts the client for those), and bulk-inserts.

## Running locally

**Backend:**

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # or source venv/bin/activate on macOS/Linux
pip install -r requirements.txt
# create .env from .env.example with your own DATABASE_URL
flask db upgrade
python seed.py               # loads demo courses + demo accounts
python wsgi.py                # runs on :5000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev                   # runs on :5173
```

Open `http://localhost:5173` and log in with:

```
demo1@example.com / password123
```

## Known limitations

- No password reset / email verification — out of scope for the assignment
- Video seek detection is a heuristic (position jump on resume), not exact
- Dropped clickstream events (e.g. a failed network request) aren't retried — acceptable for a demo, would need local persistence + retry for production use
- No deployment — the assignment doesn't require a live URL, so this runs as local dev servers against a hosted Neon database
