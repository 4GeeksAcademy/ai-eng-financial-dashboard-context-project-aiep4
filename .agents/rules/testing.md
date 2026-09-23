# Testing

## Scope

Applies to:
- `backend/tests/test_routes.py`
- `frontend/src/lib/financial-utils.test.ts`
- any new API route or pure data transform introduced in the repo

## Why

The repository already validates two kinds of behavior: backend endpoint behavior and pure frontend calculations. This is explicit in `backend/tests/test_routes.py` and `frontend/src/lib/financial-utils.test.ts` and should remain the default pattern.

## Rules

- Keep pure data transformation logic in `frontend/src/lib/financial-utils.ts` and test it directly.
- For each new backend endpoint or parameter filter, add or update a test in `backend/tests/test_routes.py`.
- Before claiming a new rule is valid, run the relevant frontend or backend tests rather than relying on assumptions.
- Do not validate a new route only by UI inspection when a backend request assertion is possible.

## Examples

Correct:
- Testing `computeKPIs()` and `computeMonthlyData()` in `frontend/src/lib/financial-utils.test.ts`.
- Adding a route assertion in `backend/tests/test_routes.py` for a new query filter.

Incorrect:
- Adding a new API parameter without a route or unit test proving the value is accepted and filtered correctly.
