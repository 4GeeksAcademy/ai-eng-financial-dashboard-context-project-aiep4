# Contrato de datos del dashboard

Este documento describe el contrato real que debe usar el frontend para las tres funcionalidades de esta carpeta: **Facets**, **Alerts** y **Top Categories**. Los endpoints, parámetros, restricciones y modelos se verificaron contra la documentación OpenAPI disponible en `/docs` (`/openapi.json`) y la implementación de `backend/app/routes.py`.

Los tipos TypeScript correspondientes están definidos en:

- `frontend/specs/api-types.ts`: tipos de respuesta y uniones de dominio.
- `frontend/specs/param-types.ts`: tipos de parámetros de consulta.

El backend genera datos mock deterministas en memoria con `seed=42`; no es una fuente de datos persistente.

## 1. Facets

### Endpoint

- **Método:** `GET`
- **Ruta:** `/api/metrics/facets`
- **Propósito:** obtiene los valores disponibles para filtros y la referencia del rango de fechas. La respuesta incluye los tipos de negocio disponibles para distinguir B2B y B2C.
- **Parámetros de query:** ninguno.

### Query parameters

Este endpoint no requiere ni acepta parámetros de query documentados. La petición debe hacerse como `GET /api/metrics/facets`.

### Request TypeScript

`FacetsParams` representa los parámetros de esta petición. Está vacío porque el endpoint no tiene parámetros:

```ts
export interface FacetsParams {}
```

No debe enviarse un filtro `business_type` ni un rango de fechas a este endpoint; esos filtros pertenecen a otros endpoints.

### Response TypeScript

La respuesta usa `FacetsResponse` y es un objeto, no un array:

- `operation_types: OperationType[]`: valores disponibles, actualmente `income` y `outcome`.
- `business_types: BusinessType[]`: tipos de negocio disponibles, con valores permitidos `B2B` y `B2C`.
- `categories: Category[]`: categorías disponibles (`suppliers`, `sales`, `operational`, `administrative`, `others`).
- `min_date: string`: fecha mínima disponible en formato ISO `YYYY-MM-DD`.
- `max_date: string`: fecha máxima disponible en formato ISO `YYYY-MM-DD`.

Todos esos campos son obligatorios en una respuesta válida. No hay campos `null` en `MetricsFacets`.

### Comportamiento esperado de UI

La UI debe usar `min_date` y `max_date` como límites visibles o valores iniciales del selector de fechas. Debe usar `business_types` para construir las opciones B2B/B2C y `categories`/`operation_types` para opciones de filtros, sin crear opciones que no estén en la respuesta.

Casos límite:

1. **Un tipo de negocio no está disponible:** `business_types` puede no contener uno de los valores permitidos (`B2B` o `B2C`), porque el backend calcula la lista desde los movimientos disponibles. La UI debe mostrar únicamente los tipos presentes y no ofrecer el tipo ausente como opción seleccionable.
2. **El rango contiene una sola fecha:** `min_date` y `max_date` pueden ser iguales si los datos disponibles cubren un único día. La UI debe aceptar ese rango como válido y configurar el selector para permitir la fecha única, sin exigir un rango de más de un día.

## 2. Alerts

### Endpoint

- **Método:** `GET`
- **Ruta:** `/api/metrics/alerts`
- **Propósito:** devuelve los períodos cuyo total de outcomes supera el promedio histórico acumulado por encima del umbral indicado.
- **Respuesta exitosa:** array directo de entradas `MetricsAlert`.

### Query parameters

Todos son opcionales:

| Nombre | Tipo TypeScript | Obligatorio | Valores/formato | Restricciones y default |
|---|---|---:|---|---|
| `threshold` | `number` | No | Número | Mínimo `0`; default `0.3`. Es una proporción, no un porcentaje entero: `0.3` representa un 30% de incremento. |
| `group_by` | `GroupBy` | No | `"day" \| "week" \| "month"` | Default `"month"`. Determina el formato de agrupación del período. |
| `start_date` | `string` | No | Fecha ISO `YYYY-MM-DD` | FastAPI valida el formato como fecha; default omitido. |
| `end_date` | `string` | No | Fecha ISO `YYYY-MM-DD` | FastAPI valida el formato como fecha; default omitido. |
| `business_type` | `BusinessType` | No | `"B2B" \| "B2C"` | Default omitido; filtra los movimientos por tipo de negocio. |

Si un parámetro enviado no cumple su tipo, enum, formato o restricción, la API puede responder `422 Validation Error`.

### Request TypeScript

Usar `AlertsParams` de `frontend/specs/param-types.ts`:

```ts
interface AlertsParams {
  threshold?: number;
  group_by?: GroupBy;
  start_date?: string;
  end_date?: string;
  business_type?: BusinessType;
}
```

Los parámetros con valor `undefined` deben omitirse de la URL. Las fechas se envían como strings `YYYY-MM-DD`.

### Response TypeScript

`AlertsResponse` es un array directo de `AlertEntry`; no existe un objeto envolvente:

- `period: string`: período agrupado; su forma depende de `group_by` y no debe interpretarse siempre como fecha completa.
- `outcome_total: number`: total de outcomes del período.
- `baseline_average: number`: promedio de outcomes de los períodos históricos anteriores usados por el backend.
- `increase_ratio: number`: incremento relativo respecto del baseline. Es una proporción; por ejemplo, `0.7353` equivale a 73.53%.

Ninguna propiedad de `AlertEntry` es nullable u opcional en una respuesta válida.

### Comportamiento esperado de UI

La UI debe construir la tabla a partir de cada `AlertEntry`, mostrando al menos el período, el total de outcomes, el baseline y el incremento. Debe enviar `threshold` como proporción decimal y conservar el `group_by` elegido al interpretar `period`.

Casos límite:

1. **No existen anomalías:** la API devuelve `[]` con HTTP `200`; no devuelve `null` ni un mensaje especial. La UI debe mostrar un estado vacío explícito, por ejemplo `No anomalies found`, y no intentar renderizar una fila.
2. **No hay baseline utilizable:** durante los primeros períodos no existe historial anterior, o el baseline es `0`; el backend no crea una alerta para ese período. La UI debe aceptar una respuesta vacía o sin ese período y no fabricar una alerta ni calcular un porcentaje por su cuenta.
3. **Filtro sin movimientos:** un rango de fechas o `business_type` puede dejar la colección sin movimientos; la respuesta válida sigue siendo `[]`. La UI debe mostrar el estado vacío y conservar visibles los filtros seleccionados.

## 3. Top Categories

### Endpoint

- **Método:** `GET`
- **Ruta:** `/api/metrics/categories/top`
- **Propósito:** devuelve las categorías con mayor importe total para el `operation_type` seleccionado, con filtros opcionales de fechas y tipo de negocio.
- **Respuesta exitosa:** array directo de entradas `TopCategoryItem`.

La API no devuelve una comparación B2B/B2C agrupada en una única respuesta. Para comparar ambos tipos, el frontend debe realizar una petición con `business_type=B2B` y otra con `business_type=B2C`, o usar los endpoints específicos `/api/metrics/b2b` y `/api/metrics/b2c` según el caso de uso. Cada petición a `/api/metrics/categories/top` filtra por un solo `business_type`.

### Query parameters

Todos son opcionales:

| Nombre | Tipo TypeScript | Obligatorio | Valores/formato | Restricciones y default |
|---|---|---:|---|---|
| `operation_type` | `OperationType` | No | `"income" \| "outcome"` | Default `"outcome"`. |
| `limit` | `number` | No | Entero | Mínimo `1`, máximo `20`, default `5`. |
| `start_date` | `string` | No | Fecha ISO `YYYY-MM-DD` | FastAPI valida el formato como fecha; default omitido. |
| `end_date` | `string` | No | Fecha ISO `YYYY-MM-DD` | FastAPI valida el formato como fecha; default omitido. |
| `business_type` | `BusinessType` | No | `"B2B" \| "B2C"` | Default omitido; permite obtener un solo segmento. |

Un `limit` fuera de `1..20`, un enum desconocido o una fecha con formato inválido puede producir `422 Validation Error`.

### Request TypeScript

Usar `TopCategoriesParams` de `frontend/specs/param-types.ts`:

```ts
interface TopCategoriesParams {
  operation_type?: OperationType;
  limit?: number;
  start_date?: string;
  end_date?: string;
  business_type?: BusinessType;
}
```

Para una tabla comparativa B2B/B2C, ejecutar la misma consulta dos veces cambiando únicamente `business_type`, siempre que ambos valores estén disponibles en `FacetsResponse.business_types`.

### Response TypeScript

`TopCategoriesResponse` es un array directo de `CategoryEntry`:

- `category: Category`: categoría (`suppliers`, `sales`, `operational`, `administrative` u `others`).
- `operation_type: OperationType`: operación agregada (`income` u `outcome`).
- `total_amount: number`: importe total de la categoría dentro de los filtros aplicados.

No hay propiedades opcionales o `null` en `CategoryEntry`. El array puede contener menos elementos que `limit` si existen menos categorías con datos.

### Comportamiento esperado de UI

La UI debe mostrar las filas en el orden recibido, porque el backend las ordena por `total_amount` descendente. Debe indicar claramente el segmento (`B2B` o `B2C`) usado para cada petición. Para una comparación, debe mantener separadas las respuestas de ambos segmentos y no mezclar importes sin identificar su `business_type`.

Casos límite:

1. **No hay categorías para los filtros:** la API devuelve `[]` con HTTP `200`. La UI debe mostrar un estado vacío para ese segmento y no crear filas con importes `0`.
2. **Hay menos categorías que `limit`:** la respuesta puede tener menos filas que el límite solicitado porque solo hay categorías con datos. La UI debe renderizar las filas devueltas sin exigir exactamente `limit` elementos.
3. **Un segmento B2B/B2C no está disponible:** `business_type` solo admite `B2B` o `B2C`, pero `FacetsResponse.business_types` puede no contener ambos. La UI debe deshabilitar u ocultar el segmento ausente y no tratar una respuesta vacía como evidencia de que el otro segmento tiene los mismos datos.

## Tabla resumen

| Funcionalidad | Método | Endpoint | Params Type | Response Type |
|---|---|---|---|---|
| Facets | `GET` | `/api/metrics/facets` | `FacetsParams` | `FacetsResponse` |
| Alerts | `GET` | `/api/metrics/alerts` | `AlertsParams` | `AlertsResponse` |
| Top Categories | `GET` | `/api/metrics/categories/top` | `TopCategoriesParams` | `TopCategoriesResponse` |

## Handoff para implementación

1. Solicitar primero `GET /api/metrics/facets` para conocer el rango, categorías, operaciones y tipos de negocio disponibles.
2. Para Alerts, usar `GET /api/metrics/alerts` y enviar solo parámetros definidos en `AlertsParams`; usar `threshold` como proporción decimal.
3. Para Top Categories, usar `GET /api/metrics/categories/top`; para B2B vs B2C, ejecutar una consulta separada por cada `business_type` disponible.
4. Tratar `[]` como respuesta válida sin resultados en Alerts y Top Categories.
5. No asumir que las respuestas son objetos con una propiedad `data`; ambas respuestas de listas son arrays directos.
6. Mantener los nombres snake_case tal como llegan de la API (`start_date`, `business_type`, `total_amount`, etc.) al tipar o mapear el contrato.
