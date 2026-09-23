# Current State

## What Works

### Frontend dashboard

The React app renders a financial overview with KPI cards and chart panels.

Evidence:
- `frontend/src/App.tsx`
- `frontend/src/components/dashboard/dashboard-header.tsx`
- `frontend/src/components/dashboard/kpi-row.tsx`
- `frontend/src/components/dashboard/income-outcome-chart.tsx`
- `frontend/src/components/dashboard/profit-percent-chart.tsx`

### KPI calculation logic

The app computes total income, total outcome, profit, and profit percentage from the fetched movement records.

Evidence:
- `frontend/src/lib/financial-utils.ts`
- `frontend/src/lib/financial-utils.test.ts`

### API health and metrics endpoints

The backend exposes `GET /health`, `GET /api/metrics`, `GET /api/metrics/summary`, `GET /api/metrics/facets`, `GET /api/metrics/categories/top`, `GET /api/metrics/comparison`, and `GET /api/metrics/alerts`.

Evidence:
- `backend/app/routes.py`

### Query filtering and typed API contracts

The API validates date, category, business type, and operation type filters and defines strongly typed response models.

Evidence:
- `backend/app/routes.py`
- `backend/tests/test_routes.py`

### Local dev orchestration

Docker Compose configures the backend and frontend services and exposes them on ports `8000` and `5173`.

Evidence:
- `docker-compose.yml`
- `start.md`

## Known Gaps

### 1. No persistent data layer

The backend generates mock movements in memory on each endpoint call.

Evidence:
- `backend/app/routes.py` (`generate_mock_movements(seed=42)`)

### 2. No real integration test for frontend-to-backend flow

The tests cover backend route behavior and frontend utility logic, but not browser-to-proxy-to-backend integration.

Evidence:
- `backend/tests/test_routes.py`
- `frontend/src/lib/financial-utils.test.ts`
- `docker-compose.yml`

### 3. Startup documentation is duplicated

The setup instructions exist in multiple files with overlapping content.

Evidence:
- `README.md`
- `README.es.md`
- `start.md`

### 4. UI error handling is generic

The frontend catches all fetch failures and shows one generic message without distinguishing network, proxy, or backend errors.

Evidence:
- `frontend/src/App.tsx`

## Current Risks

- The backend is a mock data source, not a real data system.
  - Evidence: `backend/app/routes.py`
- The same financial logic is partially duplicated between frontend and backend.
  - Evidence: `frontend/src/lib/financial-utils.ts` and `backend/app/routes.py`
- There is no single end-to-end verification script for the full application lifecycle.
  - Evidence: `frontend/package.json`, `docker-compose.yml`, `start.md`

## Next Priorities

The following are the only priorities that can be reasonably derived from the repo and its current state:

1. Decide which calculations are backend-owned and which are frontend-owned to avoid duplicated logic.
   - Basis: `backend/app/routes.py` and `frontend/src/lib/financial-utils.ts`
2. Document one canonical startup/verification source.
   - Basis: `README.md`, `README.es.md`, `start.md`
3. Add an end-to-end smoke check for the frontend/proxy/backend flow.
   - Basis: `docker-compose.yml`, `backend/tests/test_routes.py`, `frontend/src/App.tsx`
4. Replace mock-only backend assumptions with a real persistence layer only if the project later requires it.
   - Basis: current API implementation in `backend/app/routes.py`

## Evidence status summary

- ✅ Implemented: dashboard UI, KPI calculations, health and metrics routes, Docker-based local workflow
- ⚠️ Partially implemented: API contract around demo data and some duplicated logic between frontend and backend
- ❓ Not sufficiently verified: auth, persistence, any real business data source, end-to-end app tests
