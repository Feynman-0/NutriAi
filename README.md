# NutriAI — AI-Based Diet and Nutrition Planner

An AI-powered diet planning web application that generates personalized 7-day meal plans based on user goals, body metrics, and dietary preferences.

## Project Structure

```
NutriAI/
├── nutriai-your-smart-planner/   # Frontend — TanStack Start (React 19 + Tailwind CSS v4)
└── backend/                      # Backend  — Node.js + Express + Prisma + Supabase
```

## Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | TanStack Start v1, React 19, Tailwind CSS v4, Framer Motion |
| Backend   | Node.js, Express, Prisma ORM |
| Database  | PostgreSQL via Supabase |
| AI        | OpenRouter API (multi-model fallback) |
| Auth      | JWT + bcrypt |
| Deploy    | Vercel (frontend) · Railway (backend) |

## Running Locally

**Backend**
```bash
cd backend
npm install
npm run dev        # http://localhost:5000
```

**Frontend**
```bash
cd nutriai-your-smart-planner
npm install
npm run dev        # http://localhost:5173
```

## Environment Variables

**backend/.env**
```
DATABASE_URL=...
JWT_SECRET=...
OPENROUTER_KEY=...
PORT=5000
FRONTEND_URL=https://your-vercel-url.vercel.app
```

**nutriai-your-smart-planner/.env**
```
VITE_API_URL=https://your-railway-url.railway.app
```
