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

## Decisión: agregar la skill de testing

Se incorpora `.agents/skills/testing/SKILL.md` como guía operativa para las
pruebas del frontend y la validación de regresiones.

### Justificación

En proyectos del sector financiero, la detección de riesgos y la validación de
procesos son innegociables. Agregar una skill de testing actúa como una red de
seguridad automatizada: asegura que las refactorizaciones de la IA no
introduzcan regresiones en los datos críticos del dashboard antes de llegar a
producción.

La decisión está respaldada por el estado actual del repositorio:

- El frontend calcula KPIs y agregaciones financieras en
   `frontend/src/lib/financial-utils.ts`.
- El backend expone filtros, resúmenes, comparaciones y alertas en
   `backend/app/routes.py`.
- Ya existen pruebas con Vitest y pytest que deben mantenerse como contratos de
   comportamiento.
- Todavía no existe una prueba end-to-end que valide el flujo completo entre
   navegador, proxy de Vite y API FastAPI.

### Alcance esperado

- Ejecutar pruebas Vitest específicas, evitando suites globales innecesarias.
- Preferir pruebas de comportamiento y contratos observables frente a detalles
   internos de implementación.
- Añadir una prueba de regresión para cada corrección funcional relevante.
- Mantener tests de API para nuevos endpoints o filtros.
- Tratar la cobertura frontend/backend y el smoke test de integración como
   prioridades antes de considerar el dashboard listo para producción.

## Skill obligatoria antes de commit

Se agrega `.agents/skills/pre-commit-regression/SKILL.md` para ejecutar una
regresión y un checklist de calidad antes de crear cualquier commit.

La skill verifica el diff, pruebas frontend, lint, build, pruebas backend,
compilación alternativa cuando pytest no está disponible, configuración Docker,
contratos de API, accesibilidad, secretos y artefactos generados. El commit se
considera listo únicamente cuando el informe termina con `Commit readiness:
READY`; cualquier bloqueo debe quedar documentado antes de continuar.

La regresión también está conectada a un hook Git versionado en `.githooks/`.
El hook delega en `scripts/pre-commit-regression.sh`, de modo que el mismo
checklist se ejecuta automáticamente antes de cada commit después de activar
`git config core.hooksPath .githooks`.
