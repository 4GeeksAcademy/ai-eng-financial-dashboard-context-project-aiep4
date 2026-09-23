# Tech Stack

## Languages

- Python
  - Evidence: `backend/requirements.txt`
- TypeScript
  - Evidence: `frontend/package.json`
- HTML/CSS
  - Evidence: `frontend/index.html`, `frontend/src/index.css`

## Frontend

- React 19
  - Evidence: `frontend/package.json`
- TypeScript
  - Evidence: `frontend/tsconfig.json`, `frontend/tsconfig.app.json`
- Vite
  - Evidence: `frontend/package.json`, `frontend/vite.config.ts`
- Recharts
  - Evidence: `frontend/package.json`
- Tailwind CSS via Vite plugin
  - Evidence: `frontend/package.json`, `frontend/src/index.css`
- lucide-react
  - Evidence: `frontend/package.json`

## Backend

- FastAPI
  - Evidence: `backend/app/main.py`, `backend/requirements.txt`
- Uvicorn
  - Evidence: `backend/requirements.txt`
- Python runtime for API service
  - Evidence: `backend/Dockerfile`, `backend/requirements.txt`

## Data

- No persistent database is configured in the repository.
- The backend generates in-memory movement data via `generate_mock_movements(seed=42)`.
  - Evidence: `backend/app/routes.py`

## Testing

- pytest for backend tests
  - Evidence: `backend/requirements.txt`
- Vitest for frontend tests
  - Evidence: `frontend/package.json`
- Testing libraries in frontend:
  - `vitest`, `@vitest/coverage-v8`
  - Evidence: `frontend/package.json`

## Tooling

- Docker Compose for orchestrating the app
  - Evidence: `docker-compose.yml`
- npm for frontend scripts
  - Evidence: `frontend/package.json`
- Python package management through `requirements.txt`
  - Evidence: `backend/requirements.txt`
- ESLint for frontend linting
  - Evidence: `frontend/package.json`, `frontend/eslint.config.js`

## Infrastructure

- Docker services for `frontend` and `backend`
  - Evidence: `docker-compose.yml`
- Local dev/test setup via Docker and Vite proxy
  - Evidence: `README.md`, `start.md`, `docker-compose.yml`

## Key dependencies

- `fastapi`
- `uvicorn[standard]`
- `pytest`
- `httpx`
- `react`
- `react-dom`
- `recharts`
- `vite`
- `vitest`
- `tailwindcss`
- `lucide-react`

Evidence:
- `backend/requirements.txt`
- `frontend/package.json`
