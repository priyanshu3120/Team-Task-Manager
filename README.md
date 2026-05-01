# Team Task Manager

A full-stack project I built to manage team work — you can create projects, assign tasks to people, and track what's getting done. It has a proper login system and role-based access so admins and members have different permissions.

## What it does

- Sign up and log in with JWT auth
- Create projects and invite team members by email
- Create tasks inside a project, assign them to someone, set a due date and priority
- Kanban board (To Do / In Progress / Done) inside each project
- Dashboard that shows your task counts, overdue items, and recent activity
- Admins can do everything, members can view and update task status only

## Stack

- **Frontend** — React 18 + Vite, React Router, Axios, plain CSS
- **Backend** — Node.js, Express
- **Database** — MongoDB Atlas with Mongoose
- **Auth** — JWT tokens + bcrypt for password hashing
- **Validation** — express-validator

## Folder structure

Team Task Manager/
├── backend/
│   ├── config/db.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── role.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── dashboard.js
│   ├── .env
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── api/axios.js
    │   ├── components/
    │   ├── context/AuthContext.jsx
    │   ├── pages/
    │   ├── App.jsx
    │   └── index.css
    └── vite.config.js

## Running it locally

You need Node.js and a MongoDB Atlas connection string (or local MongoDB).

## Step 1 — set up the env file

Create `backend/.env`:

MONGO_URI=your_connection_string_here
JWT_SECRET=pick_any_long_random_string
PORT=5000

## Step 2 — install packages

bash
cd backend && npm install
cd ../frontend && npm install

## Step 3 — start both servers

bash
# backend
cd backend
npm run dev

# frontend (new terminal)
cd frontend
npm run dev

Then open `http://localhost:5173`.

## API reference

## Auth

POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me

## Projects

GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id          (admin only)
DELETE /api/projects/:id          (admin only)
POST   /api/projects/:id/members  (admin only)
DELETE /api/projects/:id/members/:userId  (admin only)

## Tasks

GET    /api/tasks                  supports ?projectId, ?status, ?priority
POST   /api/tasks                  (admin only)
PUT    /api/tasks/:id              (admin or assignee)
PATCH  /api/tasks/:id/status       (any member)
DELETE /api/tasks/:id              (admin only)

## Dashboard

GET /api/dashboard

## Roles

Role is per-project, not global. The person who creates a project becomes its admin. Everyone else added is a member.

Admins can create/edit/delete projects and tasks, manage members.  
Members can view everything and update task status.

## Notes

- Passwords are hashed with bcrypt before saving
- JWT tokens expire after 30 days
- If a project is deleted, all its tasks are deleted too
- The frontend proxies `/api` requests to the backend on port 5000 via Vite config
