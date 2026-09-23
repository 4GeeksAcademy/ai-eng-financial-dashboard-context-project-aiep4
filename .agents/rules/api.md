# API

## Scope

Applies to:
- `backend/app/main.py`
- `backend/app/routes.py`
- `backend/tests/test_routes.py`

This rule concerns the public API contract exposed to the frontend and any tests that verify it.

## Why

The repository exposes endpoints like `GET /api/metrics`, `GET /api/metrics/summary`, and `GET /api/metrics/facets` in `backend/app/routes.py`. The same file also generates mock data with `generate_mock_movements(seed=42)`, which means the API is demo data, not persisted state.

## Rules

- Treat the backend data as generated in memory and not as a production persistence layer.
- Keep each response model explicit by using Pydantic models and `response_model` where the endpoint returns structured data.
- Keep typed validation for query parameters such as `date`, `category`, `operation_type`, and `business_type` instead of accepting raw free-form strings.
- If a route is changed, update `backend/tests/test_routes.py` to verify the real endpoint behavior.
- Do not add a new route without a corresponding test asserting the payload shape or filter behavior.

## Examples

Correct:
- `@router.get("/api/metrics", response_model=list[FinancialMovement])`
- `limit: int = Query(default=5, ge=1, le=20)`

Incorrect:
- A new route returning plain dictionaries without a clear model, or a route change without verifying the affected test file.
