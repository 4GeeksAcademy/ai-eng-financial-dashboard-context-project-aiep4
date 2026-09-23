# Architecture

## Scope

Applies to:
- `docker-compose.yml`
- `backend/app/**`
- `frontend/src/**`

This rule does not apply to documentation-only or test-only files.

## Why

The repository explicitly splits the project into two services in `docker-compose.yml`: `frontend` and `backend`. The FastAPI app is created in `backend/app/main.py`, while the UI entry point is `frontend/src/App.tsx`. That split is part of the repository's actual structure and should be preserved.

## Rules

- Keep UI render logic under `frontend/src` and keep API acquisition inside the app boundary.
- Keep backend route definitions and business logic under `backend/app` instead of spreading them into frontend components.
- When adding calculations, choose a single home for them:
  - backend/HTTP contract logic belongs in `backend/app/routes.py`
  - pure UI-derived calculations belong in `frontend/src/lib/financial-utils.ts`
- Do not move `generate_mock_movements` or similar backend/domain logic into a React component.

## Examples

Correct:
- `App` fetches `GET /api/metrics` and then calls `computeKPIs()` from `frontend/src/lib/financial-utils.ts`.

Incorrect:
- A component in `frontend/src/App.tsx` builds mock financial records or re-implements route logic from `backend/app/routes.py`.
