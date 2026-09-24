/**
 * TypeScript representations of the API responses used by the dashboard specs.
 * These names and properties mirror the FastAPI/OpenAPI contract.
 */

export type OperationType = "income" | "outcome";
export type BusinessType = "B2B" | "B2C";
export type Category =
  | "suppliers"
  | "sales"
  | "operational"
  | "administrative"
  | "others";

/** Response from GET /api/metrics/facets. */
export interface FacetsResponse {
  operation_types: OperationType[];
  business_types: BusinessType[];
  categories: Category[];
  min_date: string;
  max_date: string;
}

/** One anomaly row returned by GET /api/metrics/alerts. */
export interface AlertEntry {
  period: string;
  outcome_total: number;
  baseline_average: number;
  increase_ratio: number;
}

/** Complete response from GET /api/metrics/alerts. */
export type AlertsResponse = AlertEntry[];

/** One category row returned by GET /api/metrics/categories/top. */
export interface CategoryEntry {
  category: Category;
  operation_type: OperationType;
  total_amount: number;
}

/** Complete response from GET /api/metrics/categories/top. */
export type TopCategoriesResponse = CategoryEntry[];
