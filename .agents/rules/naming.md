# Naming

## Scope

Applies to:
- `backend/app/routes.py`
- `frontend/src/lib/financial-types.ts`
- `frontend/src/components/dashboard/**`
- `frontend/src/App.tsx`

## Why

The repo already uses a clear domain vocabulary in English: `FinancialMovement`, `MetricsSummaryItem`, `BusinessType`, and `OperationType`. The same convention is repeated in `frontend/src/lib/financial-types.ts` and should be kept stable.

## Rules

- Use English names for domain entities and business concepts.
- Keep enum values like `income`, `outcome`, `B2B`, and `B2C` in the same style already used in the repo.
- Keep UI labels in English unless the product explicitly requires a localization strategy.
- Do not mix Spanish and English labels in the same UI surface when the rest of the app uses English.

## Examples

Correct:
- `FinancialMovement`, `Total Income`, `Profit Margin`, `BusinessType`

Incorrect:
- A new component or error message using mixed-language copy such as `No se pudo cargar la informacion financiera...` while the rest of the dashboard is in English.
