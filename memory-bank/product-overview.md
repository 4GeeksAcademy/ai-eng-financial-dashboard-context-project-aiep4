# Product Overview

## Purpose

This repository contains a financial metrics dashboard that displays a compact executive overview of income, outcomes, profit, and business performance. The current implementation is a demo-style dashboard with a React + TypeScript frontend and a FastAPI backend that exposes generated financial movement data.

Evidence:
- `README.md`
- `backend/app/main.py`
- `backend/app/routes.py`
- `frontend/src/App.tsx`

## Actors and users

The codebase does not define authentication or separate user roles. The likely direct user of the current system is a viewer of financial summary data via the browser UI.

Evidence:
- `frontend/src/App.tsx` renders the dashboard to the browser
- there are no auth or role files in the repo structure

## Implemented functionality

### ✅ Implemented and verifiable

- Dashboard UI renders KPI cards and charts for financial data.
  - Evidence: `frontend/src/App.tsx`, `frontend/src/components/dashboard/kpi-row.tsx`, `frontend/src/components/dashboard/income-outcome-chart.tsx`, `frontend/src/components/dashboard/profit-percent-chart.tsx`
- Frontend fetches data from `/api/metrics`.
  - Evidence: `frontend/src/App.tsx`
- Backend exposes health and metrics endpoints.
  - Evidence: `backend/app/routes.py`
- API returns financial movement data with filters for date, category, and operation type.
  - Evidence: `backend/app/routes.py` (`get_metrics`, `get_metrics_summary`, `get_metrics_facets`, `get_top_categories`, `get_metrics_comparison`, `get_metrics_alerts`)
- KPI and monthly aggregation calculations are implemented in pure helper functions.
  - Evidence: `frontend/src/lib/financial-utils.ts`
- Backend and frontend tests validate core behavior.
  - Evidence: `backend/tests/test_routes.py`, `frontend/src/lib/financial-utils.test.ts`

### ⚠️ Partially implemented

- The backend is a mock-data API, not a production stateful service.
  - Evidence: `generate_mock_movements(seed=42)` in `backend/app/routes.py`
- The app appears built around a demo dataset rather than persistent data storage.
  - Evidence: no database configuration or persistence layer is present in the repo structure

### ❓ Not enough evidence

- Product-specific user personas beyond a general dashboard viewer
- Multitenancy, authentication, or admin workflows
- Export, reporting, or persistence features beyond the current demo dataset

## Main user flow

1. The browser loads the React app from `frontend/src/App.tsx`.
2. The app calls the backend `/api/metrics` endpoint.
3. The backend generates mock movement records in memory and returns them.
4. The frontend derives KPI and monthly summary values from those records.
5. The dashboard renders KPI cards and charts.

Evidence:
- `frontend/src/App.tsx`
- `backend/app/routes.py`
- `frontend/src/lib/financial-utils.ts`

## Main modules and components

- Frontend entry: `frontend/src/App.tsx`
- Frontend dashboard UI: `frontend/src/components/dashboard/`
- Shared frontend types: `frontend/src/lib/financial-types.ts`
- Shared frontend transforms: `frontend/src/lib/financial-utils.ts`
- Backend entry: `backend/app/main.py`
- Backend API routes: `backend/app/routes.py`
- Backend tests: `backend/tests/test_routes.py`

## Verified integrations

- Docker Compose runs both services together.
  - Evidence: `docker-compose.yml`
- FastAPI backend serves the metrics API.
  - Evidence: `backend/app/main.py`, `backend/app/routes.py`
- Vite dev server proxies `/api` to the backend service.
  - Evidence: `README.md`, `start.md`, `docker-compose.yml`

## Current status

This project is a working frontend/backend demo for viewing financial metrics from generated data. It is not a production data system and should be treated as a project scaffold for dashboard and API experimentation.
