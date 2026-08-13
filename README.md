# Smart AI Credit Management & Utilization Advisor

> An AI-powered full-stack web application to track, analyze, predict, and optimize your AI platform credit usage.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | FastAPI + Python |
| Database | PostgreSQL |
| ORM | SQLAlchemy 2.x + Alembic |
| Auth | JWT (access + refresh tokens) |
| Deployment | Docker + Docker Compose |

## How to Run the Project

### Option 1: Using Docker Compose (Recommended)

This is the easiest way to run the entire stack (Database, Backend, and Frontend).

```bash
# 1. Ensure you are in the project root directory
# cd SGP

# 2. Start all services using Docker Compose
docker-compose up --build
```

**Services running:**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **PostgreSQL Database**: localhost:5432

---

### Option 2: Running Locally (Without Docker)

If you prefer to run the services directly on your machine, follow these steps. You will need your own PostgreSQL instance running.

#### 1. Backend

Open a terminal in the root directory:

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv .venv

# Activate the virtual environment
# On Windows:
.venv\Scripts\activate
# On Mac/Linux:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations (Ensure PostgreSQL is running and DATABASE_URL is set in .env)
alembic upgrade head

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```
*The backend API will be available at http://localhost:8000*

#### 2. Frontend

Open a **new** terminal window from the root directory:

```bash
# Navigate to the frontend directory
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server (use npx vite if npm run dev fails silently)
npx vite
```
*The frontend application will be available at http://localhost:5173 (or 5174/5175 if 5173 is in use)*
