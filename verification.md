# Verificación y resumen técnico del proyecto

## 1. Resumen ejecutivo

**Financial Metrics Dashboard** es una aplicación web full stack para visualizar métricas financieras. Presenta un dashboard React con indicadores clave y gráficos de ingresos, egresos y porcentaje de rentabilidad.

La solución está formada por:

- Un **frontend** en React + TypeScript, servido por Vite.
- Un **backend** en Python con FastAPI.
- Docker Compose como mecanismo de ejecución local y comunicación entre servicios.
- Datos mock generados por el backend de forma determinista usando `seed=42`; no hay una base de datos persistente configurada en el repositorio.

## 2. Qué hace la aplicación

El backend genera movimientos financieros con los siguientes atributos:

- Fecha de creación.
- Importe.
- Tipo de operación: `income` o `outcome`.
- Categoría.
- Tipo de negocio: `B2B` o `B2C`.

El frontend solicita los movimientos financieros y calcula en el navegador:

- Ingresos totales.
- Egresos totales.
- Beneficio neto.
- Porcentaje de beneficio.
- Evolución mensual de ingresos y egresos.
- Porcentaje de beneficio por mes.

La interfaz está compuesta principalmente por:

- Cabecera del dashboard.
- Fila de KPIs.
- Gráfico de ingresos frente a egresos.
- Gráfico de porcentaje de beneficio.
- Estados de carga y error.

## 3. Arquitectura y conexión entre componentes

```text
Navegador
   │
   │ HTTP :5173
   ▼
Frontend React + Vite
   │
   │ /api/* mediante proxy de Vite
   │ target: http://backend:8000
   ▼
Backend FastAPI + Uvicorn
   │
   └── Generación de datos mock en memoria
```

### Frontend

El frontend se encuentra en `frontend/`.

`src/App.tsx` obtiene los datos mediante:

```text
GET /api/metrics
```

La URL base se construye con `VITE_API_BASE_URL`. Si no está definida, se utiliza una cadena vacía y la petición se hace contra el mismo origen:

```text
/api/metrics
```

En desarrollo, Vite redirige esa ruta al servicio Docker `backend:8000`, según `frontend/vite.config.ts`:

```text
/api -> http://backend:8000
```

Después de recibir los movimientos, `financial-utils.ts` calcula los KPIs y agrupa los datos por mes antes de entregarlos a los componentes visuales.

### Backend

El backend se encuentra en `backend/` y expone una aplicación FastAPI desde `app.main:app`.

`app.main`:

- Crea la instancia de FastAPI.
- Configura CORS.
- Registra las rutas de `app.routes`.

Los datos se generan en memoria con `generate_mock_movements(seed=42)`. Cada petición genera el mismo conjunto lógico de datos para facilitar la repetibilidad durante el desarrollo y las pruebas.

No se configura una base de datos, migraciones, autenticación ni almacenamiento persistente.

## 4. API disponible

### Salud del servicio

```http
GET /health
```

Respuesta esperada:

```json
{"status":"ok"}
```

### Movimientos financieros

```http
GET /api/metrics
```

Admite filtros opcionales por:

- `start_date`
- `end_date`
- `category`
- `operation_type`

### Facetas

```http
GET /api/metrics/facets
```

Devuelve tipos de operación, tipos de negocio, categorías y rango de fechas disponible.

### Resumen agrupado

```http
GET /api/metrics/summary
```

Admite agrupación por:

- `day`
- `week`
- `month`

También permite filtrar por fechas, categoría, operación y tipo de negocio.

### Categorías principales

```http
GET /api/metrics/categories/top
```

Devuelve las categorías con mayor importe para un tipo de operación determinado.

### Comparación de periodos

```http
GET /api/metrics/comparison?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
```

Compara el valor neto del periodo actual con el periodo inmediatamente anterior de igual duración.

### Alertas de egresos

```http
GET /api/metrics/alerts
```

Detecta periodos cuyo total de egresos supera el promedio histórico en el umbral indicado.

### Métricas por tipo de negocio

```http
GET /api/metrics/b2b
GET /api/metrics/b2c
```

Ambos endpoints admiten filtros de fecha, categoría y tipo de operación.

La documentación interactiva completa está disponible en:

```text
http://localhost:8000/docs
```

## 5. Cómo se ejecuta

### Opción recomendada: Docker Compose

Desde la raíz del repositorio:

```bash
docker compose up --build
```

Para ejecutarlo en segundo plano:

```bash
docker compose up --build -d
```

### Servicios y puertos

| Servicio | Contenedor | Puerto local | Función |
|---|---|---:|---|
| Frontend | `frontend` | `5173` | Aplicación React/Vite |
| Backend | `backend` | `8000` | API FastAPI |
| Debug backend | `backend` | `5678` | Debugpy |

El frontend depende del backend mediante `depends_on`. Esta directiva controla el orden de inicio, pero no constituye por sí sola un health check funcional.

### Comandos de estado y logs

```bash
docker compose ps
docker compose logs --tail=100 backend
docker compose logs --tail=100 frontend
docker compose logs -f backend frontend
```

## 6. Procedimiento de verificación

### Verificación de infraestructura

```bash
docker compose ps
```

Los servicios `frontend` y `backend` deben estar activos.

### Verificación funcional del backend

```bash
curl -f http://localhost:8000/health
curl -f http://localhost:8000/api/metrics
curl -I http://localhost:8000/docs
```

Se espera código HTTP `200` en las tres comprobaciones. El endpoint `/health` debe devolver `{"status":"ok"}`.

### Verificación funcional del frontend

```bash
curl -f http://localhost:5173/
curl -f http://localhost:5173/api/metrics
```

La primera petición verifica que Vite sirve la aplicación. La segunda valida el recorrido completo navegador/frontend-proxy/backend.

Después, abrir:

```text
http://localhost:5173
```

Debe mostrarse el dashboard con los KPIs y los gráficos, sin mensaje de error de conexión.

### Validaciones automatizadas del frontend

Los scripts definidos en `frontend/package.json` son:

```bash
npm run build
npm run lint
npm test
```

Dentro de Docker pueden ejecutarse así:

```bash
docker compose exec frontend npm run build
docker compose exec frontend npm run lint
docker compose exec frontend npm test
```

## 7. Ejecución alternativa sin Docker

### Backend

Desde `backend/`, instalar las dependencias de `requirements.txt` y ejecutar:

```bash
python -m debugpy \
  --listen 0.0.0.0:5678 \
  -m uvicorn app.main:app \
  --host 0.0.0.0 \
  --port 8000 \
  --reload
```

### Frontend

Desde `frontend/`:

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

En esta modalidad, debe revisarse que el proxy de Vite pueda resolver el host `backend`. Cuando frontend y backend se ejecutan directamente en el host, puede ser necesario configurar `VITE_API_BASE_URL` o adaptar temporalmente el destino del proxy a `http://localhost:8000`.

## 8. Criterios de aceptación

La ejecución puede considerarse correcta cuando se cumplen todos estos puntos:

- `docker compose ps` muestra `frontend` y `backend` activos.
- `GET http://localhost:8000/health` devuelve `{"status":"ok"}`.
- `GET http://localhost:8000/api/metrics` devuelve una lista JSON de movimientos.
- `GET http://localhost:5173/` devuelve el documento HTML del frontend.
- `GET http://localhost:5173/api/metrics` devuelve datos a través del proxy de Vite.
- El dashboard carga los KPIs y gráficos sin mostrar error de API.
- `npm run build`, `npm run lint` y `npm test` terminan correctamente cuando se ejecutan.

## 9. Checklist de servicios y evidencia de ejecución

### Checklist operativo

- [x] **Imagen del backend construida**: Docker completó correctamente el build de `python:3.13-slim` y la instalación de `backend/requirements.txt`.
- [x] **Imagen del frontend construida**: Docker completó correctamente el build de `node:24-alpine` y la instalación de las dependencias de `frontend/package.json`.
- [x] **Red de Compose creada**: se creó la red del proyecto.
- [x] **Servicio backend en funcionamiento**: `docker compose ps` mostró el contenedor como `Up` y el log confirmó `Uvicorn running on http://0.0.0.0:8000`.
- [x] **API inicializada**: el log del backend confirmó `Application startup complete`.
- [x] **Puerto HTTP del backend publicado**: `8000 -> 8000`.
- [x] **Puerto de debug del backend publicado**: `5678 -> 5678`.
- [x] **Servicio frontend en funcionamiento**: `docker compose ps` mostró el contenedor como `Up` y Vite confirmó que está listo.
- [x] **Frontend publicado**: `5173 -> 5173`.
- [x] **Vite escuchando correctamente**: el log mostró `Local: http://localhost:5173/` y una URL de red.
- [x] **Build de producción del frontend**: `docker compose exec frontend npm run build` terminó correctamente.
- [x] **Lint del frontend**: `docker compose exec frontend npm run lint` terminó sin errores.
- [x] **Tests del frontend**: `docker compose exec frontend npm test` terminó con `1` archivo, `5` tests y todos aprobados.
- [x] **Health check HTTP del backend**: `curl -fsS http://localhost:8000/health` respondió `{"status":"ok"}`.
- [x] **Health check HTTP del endpoint backend**: `curl -fsS http://localhost:8000/api/metrics` respondió HTTP `200`.
- [x] **Health check HTTP del frontend**: `curl -fsS http://localhost:5173/` respondió HTTP `200`.
- [ ] **Prueba del proxy `/api`**: `curl -fsS http://localhost:5173/api/metrics` respondió HTTP `502`.

### Diagnóstico de lo observado

#### Correcto

La evidencia confirma que la aplicación se construye y arranca correctamente con Docker Compose:

- Los dos Dockerfiles se construyeron sin errores.
- Los dos contenedores quedaron en estado `Up`/`Running`.
- FastAPI/Uvicorn completó el startup.
- Vite quedó disponible en el puerto `5173`.
- El backend expuso los puertos `8000` y `5678`.
- El frontend pasó build, lint y tests: `5/5` tests aprobados.
- La validación directa del backend pasó: `/health` devolvió `{"status":"ok"}` y `/api/metrics` devolvió HTTP `200`.
- La validación directa del frontend pasó: `/` devolvió HTTP `200`.

Los avisos de debugpy sobre `frozen modules` son advertencias, no fallos de ejecución. El backend continuó arrancando después de dichos avisos.

El aviso de Vite sobre un bundle superior a `500 kB` también es una advertencia de optimización, no un error de build. El build terminó con éxito.

#### Incorrecto o incompleto

1. **Se intentó arrancar el backend manualmente mientras ya estaba corriendo en Docker.**

   El comando manual falló con:

   ```text
   RuntimeError: Can't listen for client connections: [Errno 98] Address already in use
   ```

   La causa es que el contenedor ya tenía ocupado el puerto `5678`, tal como confirma `docker compose ps`. No indica que el backend Docker esté caído; indica que se intentó iniciar una segunda instancia en el mismo puerto.

   Solución: usar el backend gestionado por Compose o detener primero los contenedores con `docker compose down` antes de ejecutarlo manualmente.

2. **`npm run build` se ejecutó desde la raíz equivocada.**

   El comando falló porque la raíz del repositorio no contiene `package.json`:

   ```text
   npm error enoent Could not read package.json
   ```

   La validación correcta ya se ejecutó dentro del contenedor frontend y terminó bien. Si se ejecuta directamente en el host, hay que entrar en `frontend/`:

   ```bash
   cd frontend
   npm install
   npm run build
   ```

3. **El proxy frontend/backend continúa fallando.**

   La prueba:

   ```bash
   curl -fsS http://localhost:5173/api/metrics
   ```

   devolvió HTTP `502`. Los logs de Vite registraron:

   ```text
   Error: connect ETIMEDOUT 172.18.0.2:8000
   ```

   Desde el contenedor frontend, el nombre `backend` resuelve correctamente a `172.18.0.2`, pero la conexión a `backend:8000` termina en timeout. Por tanto, el problema no es DNS ni el endpoint público del backend: es la conectividad TCP entre los contenedores o el estado de red del entorno Docker.

   El reinicio de `backend` y `frontend` no corrigió el `502`; la prueba posterior siguió fallando.

4. **No hay un `healthcheck` declarado en Compose.**

   El estado `Up` no sustituye a una comprobación HTTP. La salud debe validarse explícitamente con `/health` y con una petición al proxy del frontend.

### Comprobación pendiente recomendada

Con los contenedores en ejecución, ejecutar cada comando por separado:

```bash
curl -fsS http://localhost:8000/health
curl -fsS http://localhost:8000/api/metrics > /dev/null
curl -fsS http://localhost:5173/ > /dev/null
curl -fsS http://localhost:5173/api/metrics > /dev/null
```

Resultado esperado:

```text
HTTP 200 en todas las comprobaciones
{"status":"ok"} en /health
```

Actualmente las tres primeras comprobaciones pasan, pero la cuarta continúa devolviendo `502`. El criterio de aceptación de integración frontend-proxy-backend permanece pendiente.

No ejecutar el comando manual de `debugpy` mientras Compose ya esté exponiendo el puerto `5678`.

## 10. Checklist de verificación posterior a la corrección

Esta sección conserva la evidencia de la segunda ronda de pruebas, posterior a la corrección de la conectividad del proxy. No reemplaza ni elimina el checklist anterior.

### Cambios aplicados

- [x] Se añadió un `healthcheck` al servicio `backend` usando `GET /health`.
- [x] Se configuró `frontend.depends_on.backend` con `condition: service_healthy`.
- [x] Se añadió `host.docker.internal:host-gateway` al frontend.
- [x] Se actualizó el proxy de Vite para usar `http://host.docker.internal:8000`.
- [x] Se detuvieron y recrearon los servicios con `docker compose down --remove-orphans` y `docker compose up --build -d`.

### Validaciones posteriores

- [x] **Backend saludable en Compose**: `docker compose ps` mostró `Up (healthy)`.
- [x] **Health check del backend**: `GET http://localhost:8000/health` devolvió `{"status":"ok"}`.
- [x] **API directa**: `GET http://localhost:8000/api/metrics` devolvió HTTP `200`.
- [x] **Frontend**: `GET http://localhost:5173/` devolvió HTTP `200`.
- [x] **Proxy frontend → backend**: `GET http://localhost:5173/api/metrics` devolvió HTTP `200`.
- [x] **Conectividad desde el contenedor frontend**: `http://host.docker.internal:8000/health` devolvió `{"status":"ok"}`.
- [x] **Build frontend**: `docker compose exec frontend npm run build` terminó correctamente.
- [x] **Lint frontend**: `docker compose exec frontend npm run lint` terminó correctamente.
- [x] **Tests frontend**: `docker compose exec frontend npm test` terminó con `5/5` tests aprobados.

### Resultado de la solución

La integración completa queda **RESUELTA** en el entorno validado:

```text
host -> frontend:5173 -> host.docker.internal:8000 -> backend
```

El error anterior `HTTP 502 / ETIMEDOUT backend:8000` quedó solventado cambiando la ruta del proxy al host Docker publicado. El backend continúa escuchando en `0.0.0.0:8000` y el puerto publicado `8000` permite que el frontend acceda mediante `host.docker.internal`.

Los siguientes mensajes permanecen como advertencias no bloqueantes:

- `debugpy`: advertencia sobre `frozen modules`.
- Vite: advertencia de bundle superior a `500 kB`.

Ninguno impidió el arranque, el proxy, el build, el lint ni los tests.

## 11. Detener la aplicación

```bash
docker compose down
```

Para eliminar también los volúmenes anónimos creados por Compose:

```bash
docker compose down -v
```

## 12. Limitaciones técnicas actuales

- Los datos son mock y se generan en memoria; no representan información persistente de negocio.
- No existe una base de datos ni una capa de repositorio.
- No hay autenticación ni autorización configuradas.
- CORS está abierto a todos los orígenes mediante `allow_origins=["*"]`, apropiado para desarrollo, pero debe restringirse en producción.
- El `healthcheck` actual valida la salud del backend; la salud del frontend y del proxy se valida mediante llamadas HTTP.
- El backend utiliza `--reload`, `debugpy` y puertos de desarrollo, por lo que la configuración actual está orientada a desarrollo local y Codespaces, no a producción.
