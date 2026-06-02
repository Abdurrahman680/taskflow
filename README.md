# TaskFlow

TaskFlow is a comprehensive team task management platform. It allows users to create teams, manage tasks, and track team progress efficiently.

## Architecture

- **Frontend**: React (Vite), Tailwind CSS, Axios, React Router.
- **Backend**: Node.js, Express, Passport.js (Local), Prisma, PostgreSQL.
- **Security**: bcrypt password hashing, HTTP-only cookie sessions.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database (e.g., Neon Postgres or local)
- Docker (optional)

### Backend
1. `cd backend`
2. `npm install`
3. Update `.env` with your `DATABASE_URL` and `SESSION_SECRET`.
4. `npx prisma migrate dev`
5. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Deployment to Google Cloud Run

1. Build containers:
   - Backend: `docker build -t gcr.io/[PROJECT_ID]/taskflow-backend ./backend`
   - Frontend: `docker build -t gcr.io/[PROJECT_ID]/taskflow-frontend ./frontend`
2. Push to Google Container Registry:
   - `docker push gcr.io/[PROJECT_ID]/taskflow-backend`
   - `docker push gcr.io/[PROJECT_ID]/taskflow-frontend`
3. Deploy to Cloud Run:
   - Go to Google Cloud Console > Cloud Run
   - Create Service, select your container.
   - For backend, make sure to add `DATABASE_URL` and `SESSION_SECRET` as environment variables.
   - For frontend, set it to allow unauthenticated traffic.

## API Documentation

- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Login user.
- `POST /api/auth/logout`: Logout user.
- `GET /api/auth/me`: Get current user.

- `GET /api/teams`: Get all teams for the user.
- `POST /api/teams`: Create a team.

- `GET /api/tasks`: Get tasks.
- `POST /api/tasks`: Create a task.
