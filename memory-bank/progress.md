# Progreso del proyecto

## Resumen

Se completó una ronda de auditoría y endurecimiento del dashboard financiero
React + TypeScript + FastAPI. Además de las correcciones de producto, se
formalizó el proceso de validación y se conectó a un hook Git ejecutable antes
de cada commit.

## Skills aplicadas

### `accessibility`

Aplicada para revisar y mejorar la accesibilidad del dashboard siguiendo
criterios WCAG, incluyendo:

- enlace de salto (`skip link`) para navegación por teclado;
- estilos de `focus-visible`;
- nombres y roles accesibles en gráficos y regiones relevantes;
- estados de carga comunicados mediante `aria-busy`;
- revisión de navegación y contenido perceptible de los gráficos.

### `testing`

Aplicada para estructurar la regresión del frontend y preservar pruebas de
comportamiento sobre los cálculos financieros. Se mantuvieron y verificaron las
pruebas Vitest de `frontend/src/lib/financial-utils.test.ts` y se estableció el
criterio de añadir regresiones para correcciones funcionales relevantes.

También se documentó la necesidad de mantener pruebas de contrato para los
endpoints y filtros del backend.

### `vercel-react-best-practices`

Aplicada como skill del ecosistema elegida para la optimización del frontend.
Se eligió porque el cambio principal de rendimiento afectaba a una aplicación
React con carga de datos y gráficos Recharts: sus recomendaciones son
específicas para reducir trabajo inicial y mejorar la entrega de componentes.

Su aplicación llevó a:

- carga diferida (`React.lazy`) de partes pesadas del dashboard;
- `Suspense` con estado de carga explícito;
- separación del bundle de gráficos mediante code splitting;
- uso de `AbortController` para cancelar peticiones pendientes;
- reintento controlado de cargas fallidas.

## Cambios verificados

### Frontend

- Se sustituyó el periodo anual hardcodeado por datos de
  `/api/metrics/facets`.
- Se mejoraron los estados de carga, error y reintento en `App.tsx`.
- Se añadieron atributos y estructura accesible a los gráficos.
- Se incorporó metadata de producción en `frontend/index.html`.
- Se hizo configurable el destino del backend mediante
  `VITE_API_BASE_URL` y se mantuvo el proxy local de Vite.
- Se corrigió la interfaz vacía de `frontend/specs/param-types.ts` para evitar
  el error de ESLint.

Validaciones ejecutadas:

```text
Vitest: 5 tests passed
ESLint: PASS
TypeScript + Vite build: PASS
```

### Backend

- Se estabilizó el dataset demo con `DEMO_REFERENCE_DATE` en lugar de depender
  de la fecha actual.
- Se validan rangos de fechas invertidos.
- CORS se configura mediante `ALLOWED_ORIGINS` en lugar de un wildcard abierto.
- Se añadieron o mantuvieron pruebas de endpoints, filtros, fechas y contratos.

Validación ejecutada en el entorno actual:

```text
pytest: bloqueado porque el módulo no está instalado
compileall app tests: PASS
```

### Automatización y documentación

- Se creó `.githooks/pre-commit`.
- Se creó `scripts/pre-commit-regression.sh`.
- El script valida diff staged, secretos y artefactos generados, Vitest,
  ESLint, build frontend y pytest o `compileall` como fallback.
- Docker Compose se valida automáticamente cuando hay cambios de configuración
  relacionados.
- Se documentó la activación con:

```bash
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit scripts/pre-commit-regression.sh
```

- Se actualizaron `README.md`, `start.md` y este memory bank.

## Skill interna creada

### `.agents/skills/pre-commit-regression/SKILL.md`

Se creó esta skill interna para convertir la regresión previa al commit en un
procedimiento obligatorio y repetible. Define:

- inspección del estado y del diff;
- pruebas frontend y backend;
- fallback explícito cuando pytest no está disponible;
- validación condicional de Docker y despliegue;
- revisión de secretos, caches y artefactos generados;
- formato estándar de informe;
- regla de no considerar listo el commit si existen bloqueos.

La skill no se dejó únicamente como documentación: el hook versionado delega en
`scripts/pre-commit-regression.sh`, por lo que el checklist se ejecuta de forma
automática antes de los commits de quienes configuren `core.hooksPath`.

## Estado de la última regresión

```text
Pre-commit regression: PASS
Frontend: PASS
Backend: PASS (compileall fallback; pytest no instalado)
Deploy/config: NOT RUN
Commit readiness: READY
Blockers: none
```

El commit y el push de estos cambios quedan pendientes de una decisión
explícita; la implementación no crea commits automáticamente.
