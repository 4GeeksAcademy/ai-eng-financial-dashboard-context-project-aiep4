import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KPIRow } from "@/components/dashboard/kpi-row";
import { IncomeOutcomeChart } from "@/components/dashboard/income-outcome-chart";
import { ProfitPercentChart } from "@/components/dashboard/profit-percent-chart";
import {
  type FinancialMovement,
  type MetricsFacets,
  type KPIMetrics,
  type MonthlyDataPoint,
} from "@/lib/financial-types";
import { computeKPIs, computeMonthlyData } from "@/lib/financial-utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function fetchFinancialData(signal: AbortSignal): Promise<{
  movements: FinancialMovement[];
  facets: MetricsFacets;
}> {
  const [metricsResponse, facetsResponse] = await Promise.all([
    fetch(`${API_BASE_URL}/api/metrics`, { signal }),
    fetch(`${API_BASE_URL}/api/metrics/facets`, { signal }),
  ]);

  if (!metricsResponse.ok || !facetsResponse.ok) {
    throw new Error("The financial API returned an error.");
  }

  return {
    movements: await metricsResponse.json(),
    facets: await facetsResponse.json(),
  };
}

function App() {
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([]);
  const [facets, setFacets] = useState<MetricsFacets | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchFinancialData(controller.signal)
      .then(({ movements, facets: loadedFacets }) => {
        setMetrics(computeKPIs(movements));
        setMonthlyData(computeMonthlyData(movements));
        setFacets(loadedFacets);
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError(
          cause instanceof Error
            ? `${cause.message} Please try again.`
            : "Unable to load financial information. Please try again.",
        );
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const period = facets
    ? `${facets.min_date.slice(0, 4)} – ${facets.max_date.slice(0, 4)}`
    : "Loading period…";

  return (
    <main className="dark min-h-screen bg-background text-foreground" aria-busy={loading}>
      <a className="skip-link" href="#dashboard-content">Skip to dashboard content</a>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <DashboardHeader period={period} />

          {error ? (
            <div
              className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          <section id="dashboard-content" aria-labelledby="kpi-heading">
            <h2 id="kpi-heading" className="sr-only">Key performance indicators</h2>
            <KPIRow metrics={metrics} loading={loading} />
          </section>

          <section
            aria-label="Financial charts"
            className="grid grid-cols-1 gap-4 xl:grid-cols-2"
          >
            <IncomeOutcomeChart data={monthlyData} loading={loading} />
            <ProfitPercentChart data={monthlyData} loading={loading} />
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
