# Engineering Findings — Phase 2

## Resumen

El repositorio está organizado como dos servicios distintos: frontend y backend. La evidencia más relevante del código muestra tres patrones concretos: la API genera datos mock en memoria, la UI recalcula métricas del cliente y la documentación de arranque se duplica entre archivos diferentes.

## Arquitectura

### 1. El proyecto está separado en frontend y backend
**Tipo:** Convención

**Evidencia:**
`docker-compose.yml`, `backend/app/main.py`, `frontend/src/App.tsx`

**Hallazgo:**
`docker-compose.yml` define los servicios `frontend` y `backend`; `backend/app/main.py` crea la aplicación FastAPI y `frontend/src/App.tsx` renderiza la pantalla principal del dashboard.

**Impacto:**
La separación de responsabilidades queda clara para futuros contributors.

**Regla propuesta:**
Mantener el frontend como capa de presentación y el backend como capa de API.

---

### 2. La API genera datos mock en memoria en cada respuesta
**Tipo:** Riesgo

**Evidencia:**
`backend/app/routes.py` (`generate_mock_movements(seed=42)` y `@router.get("/api/metrics")`)

**Hallazgo:**
Los endpoints llaman a `generate_mock_movements(seed=42)` directamente. No hay persistencia, ni conexión a base de datos, ni almacenamiento externo.

**Impacto:**
La API no representa un estado compartido ni una fuente de verdad real, solo datos simulados creados al consultar cada ruta.

**Regla propuesta:**
Documentar explícitamente que la API es una demo y no una capa de persistencia.

---

### 3. La UI vuelve a calcular KPI del cliente aunque el backend ya expone métricas
**Tipo:** Inconsistencia

**Evidencia:**
`frontend/src/App.tsx`, `frontend/src/lib/financial-utils.ts`, `backend/app/routes.py`

**Hallazgo:**
`frontend/src/App.tsx` hace `fetch('/api/metrics')` y luego llama a `computeKPIs()` y `computeMonthlyData()`. El backend, en cambio, también define `get_metrics_summary()` y `get_metrics_comparison()` en `backend/app/routes.py`.

**Impacto:**
La lógica financiera está duplicada entre backend y frontend; cualquier cambio futuro puede generar resultados divergentes en cada capa.

**Regla propuesta:**
Definir explícitamente qué cálculos son responsabilidad del backend y cuáles del cliente.

---

## Naming

### 4. El dominio usa nombres consistentes en inglés
**Tipo:** Convención

**Evidencia:**
`backend/app/routes.py`, `frontend/src/lib/financial-types.ts`

**Hallazgo:**
Los tipos del dominio usan nombres como `FinancialMovement`, `MetricsSummaryItem`, `TopCategoryItem`, `OperationType`, `BusinessType` y `Category`.

**Impacto:**
La convención del dominio es clara y reutilizable.

**Regla propuesta:**
Mantener el vocabulario del dominio en inglés y no introducir nombres ambiguos.

---

### 5. La UI y la documentación mezclan inglés y español
**Tipo:** Inconsistencia

**Evidencia:**
`frontend/src/App.tsx`, `frontend/src/components/dashboard/kpi-row.tsx`, `README.md`, `README.es.md`

**Hallazgo:**
La interfaz muestra textos como `Financial Overview` y `Total Income`, pero `App.tsx` incluye el mensaje `No se pudo cargar la informacion financiera...`; además el repo tiene `README.md` y `README.es.md`.

**Impacto:**
La mezcla de idiomas requiere decidir manualmente cuál usar en nuevas contribuciones.

**Regla propuesta:**
Definir un idioma base para UI y documentación principal.

---

## Frontend

### 6. El flujo de la UI es fetch + estado + utilidades puras
**Tipo:** Convención

**Evidencia:**
`frontend/src/App.tsx`, `frontend/src/lib/financial-utils.ts`, `frontend/src/lib/financial-utils.test.ts`

**Hallazgo:**
`App` usa `useEffect` para cargar datos, guarda `metrics`, `monthlyData`, `loading` y `error` en estado, y deriva el resultado con `computeKPIs()` y `computeMonthlyData()`.

**Impacto:**
Es un patrón claro, pequeño y testeable.

**Regla propuesta:**
Mantener la lógica derivada en funciones puras y el estado local mínimo.

---

### 7. El manejo de errores del frontend es genérico
**Tipo:** Riesgo

**Evidencia:**
`frontend/src/App.tsx`

**Hallazgo:**
`fetchFinancialData()` lanza un error si `response.ok` es falso; el `catch` siempre muestra `No se pudo cargar la informacion financiera. Revisa la API de backend.`

**Impacto:**
No se distinguen fallos de red, 500 de backend o problema con el proxy.

**Regla propuesta:**
Separar mensajes de error para red, API y proxy.

---

## Backend / API

### 8. El backend usa validación fuerte por tipos literales y query params
**Tipo:** Convención

**Evidencia:**
`backend/app/routes.py`

**Hallazgo:**
Los tipos literales definen valores permitidos: `OperationType = Literal["income", "outcome"]`, `BusinessType = Literal["B2B", "B2C"]` y `GroupBy = Literal["day", "week", "month"]`. También se usan validaciones como `limit: int = Query(default=5, ge=1, le=20)`.

**Impacto:**
El contrato API es más claro y se reducen entradas inválidas.

**Regla propuesta:**
Mantener validación explícita para todos los campos con conjunto finito de valores.

---

### 9. La lógica HTTP, negocio y datos están concentradas en `routes.py`
**Tipo:** Riesgo

**Evidencia:**
`backend/app/routes.py`

**Hallazgo:**
Ese archivo contiene modelos Pydantic, utilidades, filtros, generador mock y todas las rutas endpoint.

**Impacto:**
Funciona para un módulo pequeño, pero el archivo crece con varias responsabilidades a la vez.

**Regla propuesta:**
Cuando el backend crezca, separar rutas, servicios y modelos en módulos distintos.

---

## Testing

### 10. Hay tests de backend y utilidades puras del frontend
**Tipo:** Convención

**Evidencia:**
`backend/tests/test_routes.py`, `frontend/src/lib/financial-utils.test.ts`

**Hallazgo:**
El backend prueba `generate_mock_movements`, filtros por fecha y endpoints de salud; el frontend prueba `computeKPIs()` y `computeMonthlyData()`.

**Impacto:**
La lógica central del dominio está validada y es más segura frente a regresiones.

**Regla propuesta:**
Mantener tests para funciones puras y endpoints críticos.

---

### 11. No hay tests de integración entre frontend y backend
**Tipo:** Riesgo

**Evidencia:**
`frontend/src/App.tsx`, `backend/tests/test_routes.py`, `docker-compose.yml`

**Hallazgo:**
No hay pruebas que validen el flujo real `frontend -> proxy Vite -> backend`, solo tests unitarios en cada capa.

**Impacto:**
Si falla el proxy o la conexión entre servicios, la suite actual no lo detecta de forma directa.

**Regla propuesta:**
Añadir un smoke test mínimo para el flujo de integración.

---

## Documentación

### 12. La documentación de arranque está duplicada
**Tipo:** Inconsistencia

**Evidencia:**
`README.md`, `README.es.md`, `start.md`

**Hallazgo:**
Las instrucciones de levantamiento y validación aparecen repetidas en varios archivos.

**Impacto:**
Se corre el riesgo de que una guía quede desactualizada y se siga otra distinta.

**Regla propuesta:**
Definir un solo documento principal para arranque y verificación.

---

## Configuración y DX

### 13. El proyecto usa Docker Compose como base del desarrollo
**Tipo:** Convención

**Evidencia:**
`docker-compose.yml`, `start.md`

**Hallazgo:**
`docker-compose.yml` levanta frontend y backend, y `start.md` describe `docker compose ps`, `curl` y logs como validación habitual.

**Impacto:**
El flujo de desarrollo es reproducible y útil para verificar el estado de la app.

**Regla propuesta:**
Mantener Docker Compose como arranque base y usar healthcheck/logs como validación estándar.

---

### 14. No hay un comando único de validación end-to-end
**Tipo:** Riesgo

**Evidencia:**
`frontend/package.json`, `backend/requirements.txt`, `docker-compose.yml`

**Hallazgo:**
Hay scripts separados (`build`, `lint`, `test`) pero no un comando único para validar el flujo completo de la aplicación.

**Impacto:**
La validación integrada queda a criterio del contributor y puede omitirse.

**Regla propuesta:**
Agregar un smoke check para frontend + proxy + backend.

---

## Reglas propuestas

### Regla: Mantener la separación frontend/backend
**Basada en:**
`docker-compose.yml`, `backend/app/main.py`, `frontend/src/App.tsx`

**Regla:**
Mantener frontend para render y backend para API y dominio.

**Justificación:**
La estructura del repositorio ya lo define claramente.

---

### Regla: Documentar que la API es mockeada en memoria
**Basada en:**
`backend/app/routes.py` (`generate_mock_movements(seed=42)`)

**Regla:**
Tratar la API como demo y no como persistencia real.

**Justificación:**
Los datos se generan cada vez que la ruta responde.

---

### Regla: Mantener naming del dominio en inglés
**Basada en:**
`backend/app/routes.py`, `frontend/src/lib/financial-types.ts`

**Regla:**
Usar nombres del dominio en inglés y evitar mezcla de términos.

**Justificación:**
La convención ya está establecida en el código.

---

### Regla: Unificar la documentación de arranque
**Basada en:**
`README.md`, `README.es.md`, `start.md`

**Regla:**
Mantener un único documento principal para levantar y verificar el proyecto.

**Justificación:**
La documentación se repite en varios archivos.

---

### Regla: Mantener cálculos derivados en funciones puras
**Basada en:**
`frontend/src/lib/financial-utils.ts`, `frontend/src/lib/financial-utils.test.ts`

**Regla:**
Mantener la lógica de cálculo en funciones puras y probarlas antes de ampliarlas.

**Justificación:**
La app ya usa ese patrón de forma consistente.

---

### Regla: Añadir smoke test de integración mínima
**Basada en:**
`docker-compose.yml`, `frontend/src/App.tsx`, `backend/tests/test_routes.py`

**Regla:**
Validar el flujo `frontend -> proxy -> backend` además de pruebas unitarias aisladas.

**Justificación:**
El repositorio no cubre esa integración con una prueba automatizada.
