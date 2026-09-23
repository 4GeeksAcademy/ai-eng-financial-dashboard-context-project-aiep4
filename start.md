# Inicio del proyecto

## Levantar los servicios

Desde la raíz del repositorio, ejecuta:

```bash
docker compose up --build
```

Para iniciar los servicios en segundo plano:

```bash
docker compose up --build -d
```

El proyecto está compuesto por dos servicios definidos en `docker-compose.yml`:

- **Frontend**: puerto `5173`.
- **Backend**: puerto `8000`.
- **Debug del backend**: puerto `5678`.

URLs disponibles:

- Frontend: <http://localhost:5173>
- Backend: <http://localhost:8000>
- Documentación de la API: <http://localhost:8000/docs>

El frontend usa el proxy de Vite para las rutas `/api`, que se redirigen al servicio `backend:8000`. No se necesitan variables de entorno adicionales para el desarrollo local o Codespaces.

> La API del backend genera datos en memoria dentro de `backend/app/routes.py` y está pensada para demostración. No representa una base de datos persistente ni un origen de verdad de producción.

## Confirmar que los servicios están levantados

Consulta el estado de los contenedores:

```bash
docker compose ps
```

Los servicios `frontend` y `backend` deberían aparecer como activos (`Up` o equivalente).

Para revisar los logs:

```bash
docker compose logs --tail=100 backend
docker compose logs --tail=100 frontend
```

Para seguir los logs en tiempo real:

```bash
docker compose logs -f backend frontend
```

## Confirmar que el backend está sano

El backend expone el endpoint de salud `GET /health`:

```bash
curl -f http://localhost:8000/health
```

Respuesta esperada:

```json
{"status":"ok"}
```

También se puede comprobar la API y su documentación:

```bash
curl -f http://localhost:8000/api/metrics
curl -I http://localhost:8000/docs
```

Las respuestas deberían tener código HTTP `200`.

> `docker-compose.yml` no define un `healthcheck` explícito. Por eso, `docker compose ps` confirma que el proceso está levantado, mientras que `GET /health` confirma funcionalmente que el backend responde.

## Confirmar que el frontend está sano

Comprueba que Vite está sirviendo la aplicación:

```bash
curl -f http://localhost:5173/
```

La respuesta debería contener el HTML de la aplicación React.

Comprueba también el proxy del frontend hacia el backend:

```bash
curl -f http://localhost:5173/api/metrics
```

Este comando valida que:

1. El frontend está escuchando en el puerto `5173`.
2. El proxy `/api` de Vite está configurado.
3. El frontend puede alcanzar el servicio `backend:8000`.
4. El backend responde a través del proxy.

Finalmente, abre <http://localhost:5173> en el navegador y verifica que se muestra el dashboard financiero.

## Validaciones opcionales del frontend

Los scripts están definidos en `frontend/package.json`. Se pueden ejecutar dentro del contenedor:

```bash
docker compose exec frontend npm run build
docker compose exec frontend npm run lint
docker compose exec frontend npm test
```

La compilación ejecuta TypeScript y después el build de Vite:

```bash
npm run build
```

## Secuencia mínima de verificación

```bash
docker compose up --build -d
docker compose ps
curl -f http://localhost:8000/health
curl -f http://localhost:5173/
curl -f http://localhost:5173/api/metrics
```

## Detener los servicios

```bash
docker compose down
```

Para detener los servicios y eliminar también los volúmenes anónimos:

```bash
docker compose down -v
```
