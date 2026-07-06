# Story to Script POC

Monorepo with a React frontend and FastAPI backend.

## Project structure

```
story-to-script-poc/
├── frontend/          # React + Vite + TypeScript
└── ai-backend/        # FastAPI
```

## Quick start

### Backend

```bash
cd ai-backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

- Frontend: http://localhost:5173
- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/api/health

## Environment

Copy `.env.example` to `.env` in each project before running locally. Never commit `.env` files.
