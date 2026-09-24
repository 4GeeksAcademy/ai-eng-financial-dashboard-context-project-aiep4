/**
 * Query parameter types for the API endpoints used by the dashboard specs.
 * Optional parameters map to omitted query parameters when undefined.
 */

import type { BusinessType, Category, OperationType } from "./api-types";

export type GroupBy = "day" | "week" | "month";

/** Query parameters for GET /api/metrics/facets. */
export type FacetsParams = Record<string, never>;

/** Query parameters for GET /api/metrics/alerts. */
export interface AlertsParams {
  threshold?: number;
  group_by?: GroupBy;
  start_date?: string;
  end_date?: string;
  business_type?: BusinessType;
}

/** Query parameters for GET /api/metrics/categories/top. */
export interface TopCategoriesParams {
  operation_type?: OperationType;
  limit?: number;
  start_date?: string;
  end_date?: string;
  business_type?: BusinessType;
}

/** Query parameters for GET /api/metrics/b2b and GET /api/metrics/b2c. */
export interface BusinessMetricsParams {
  start_date?: string;
  end_date?: string;
  category?: Category;
  operation_type?: OperationType;
}
