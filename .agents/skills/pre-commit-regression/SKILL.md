---
name: pre-commit-regression
description: Ejecuta una regresión y un checklist de calidad antes de cualquier commit en este repositorio.
user-invocable: true
---

# Pre-commit Regression

Usa esta skill antes de crear cualquier commit. Su objetivo es detectar regresiones
funcionales, contractuales y de despliegue antes de que los cambios entren en la
historia de Git.

## Flujo obligatorio

1. Inspecciona el estado del repositorio:
   - `git status --short`
   - `git diff --check`
   - `git diff --stat`
2. Revisa el diff y confirma que cada archivo modificado pertenece a la tarea.
3. Ejecuta la regresión frontend desde `frontend/`:
   - `npm test -- --run`
   - `npm run lint`
   - `npm run build`
4. Ejecuta la regresión backend desde `backend/`:
   - `python -m pytest -q`
   - Si `pytest` no está disponible, informa el bloqueo explícitamente y ejecuta
     al menos `python -m compileall -q app tests`.
5. Si se modificó la integración o Docker, valida también:
   - `docker compose config`
   - `docker compose build`
   - endpoints `/health` y `/api/metrics` cuando los servicios estén levantados.
6. Revisa que no se hayan añadido secretos, archivos generados o artefactos de
   build de forma accidental.
7. Solo después del checklist, informa si el commit está listo.

## Checklist de regresión

### Alcance y seguridad

- [ ] El diff contiene únicamente cambios relacionados con la tarea.
- [ ] No hay claves, tokens, contraseñas ni `.env` reales.
- [ ] No se han incluido `dist/`, logs, caches o dependencias instaladas por error.
- [ ] Los cambios respetan las reglas de arquitectura y API del repositorio.

### Frontend

- [ ] Las pruebas Vitest pasan.
- [ ] ESLint pasa sin errores.
- [ ] TypeScript y Vite build pasan.
- [ ] Los cambios no rompen estados de carga, error o datos vacíos.
- [ ] Las rutas críticas mantienen nombres accesibles y navegación por teclado.
- [ ] El bundle no introduce una advertencia nueva injustificada.

### Backend

- [ ] Los tests de pytest pasan.
- [ ] Las respuestas mantienen sus modelos y contratos.
- [ ] Los filtros y rangos de fechas tienen pruebas de regresión.
- [ ] La API continúa validando entradas inválidas correctamente.

### Despliegue

- [ ] La configuración de Docker Compose es válida si fue modificada.
- [ ] El proxy frontend/backend sigue siendo coherente.
- [ ] Las variables de entorno nuevas están documentadas.
- [ ] La documentación de ejecución refleja los comandos actuales.

## Formato del informe

Termina siempre con este resumen:

```text
Pre-commit regression: PASS | BLOCKED | FAIL
Frontend: PASS | BLOCKED | FAIL
Backend: PASS | BLOCKED | FAIL
Deploy/config: PASS | NOT RUN | BLOCKED | FAIL
Commit readiness: READY | NOT READY
Blockers: <none o lista concreta>
```

No crees ni hagas push del commit si `Commit readiness` es `NOT READY`, salvo
que el usuario autorice explícitamente aceptar los bloqueos documentados.
