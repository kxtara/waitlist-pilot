import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { apiFetch, getByPath } from "@/lib/api";
import { TrendingUp, Users, UserPlus, UserMinus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  component: OverviewPage,
});

function OverviewPage() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "metrics"],
    queryFn: () => apiFetch<any>("/admin/users/metrics"),
    refetchInterval: 30_000,
  });

  const root = data?.data ?? data ?? {};
  const total = getByPath(root, "summary.totalSubscribers") ?? 0;
  const growth = getByPath(root, "summary.growthRate24h");

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Waitlist Analytics & Growth</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time activity across your waitlist.
          </p>
        </div>
        {isFetching && (
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Loader2 className="h-3 w-3 animate-spin" />
            Refreshing
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 text-destructive px-4 py-3 text-sm flex items-center justify-between">
          <span>Failed to load metrics: {(error as Error).message}</span>
          <button onClick={() => refetch()} className="underline text-xs">Retry</button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          label="Total Active Subscribers"
          value={isLoading ? "—" : total.toLocaleString()}
          icon={Users}
        />
        <MetricCard
          label="24h Growth Momentum"
          value={isLoading ? "—" : formatGrowth(growth)}
          icon={TrendingUp}
          highlight
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Activity Lifespans
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <LifespanCard
            heading="New Subscriptions"
            icon={UserPlus}
            tone="success"
            rows={[
              ["Last 24 Hours", getByPath(root, "subscribeMetrics.last24Hours")],
              ["Last 7 Days", getByPath(root, "subscribeMetrics.last7Days")],
              ["Last 30 Days", getByPath(root, "subscribeMetrics.last30Days")],
            ]}
            loading={isLoading}
          />
          <LifespanCard
            heading="Unsubscriptions"
            icon={UserMinus}
            tone="destructive"
            rows={[
              ["Last 24 Hours", getByPath(root, "unsubscribeMetrics.last24Hours")],
              ["Last 7 Days", getByPath(root, "unsubscribeMetrics.last7Days")],
              ["Last 30 Days", getByPath(root, "unsubscribeMetrics.last30Days")],
            ]}
            loading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

function formatGrowth(v: any) {
  if (v == null) return "—";
  const num = typeof v === "number" ? v : parseFloat(v);
  if (Number.isNaN(num)) return String(v);
  const sign = num > 0 ? "+" : "";
  return `${sign}${num.toFixed(2)}%`;
}

function MetricCard({
  label,
  value,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: string;
  icon: any;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-6 shadow-elegant transition-all",
        highlight && "border-primary/30 bg-gradient-to-br from-card to-accent/40",
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-3xl font-bold tracking-tight mt-2 tabular-nums">{value}</p>
        </div>
        <div
          className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center",
            highlight ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function LifespanCard({
  heading,
  icon: Icon,
  tone,
  rows,
  loading,
}: {
  heading: string;
  icon: any;
  tone: "success" | "destructive";
  rows: [string, any][];
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-elegant">
      <div className="flex items-center gap-2 mb-4">
        <div
          className={cn(
            "h-8 w-8 rounded-md flex items-center justify-center",
            tone === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <h4 className="font-semibold">{heading}</h4>
      </div>
      <dl className="divide-y">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between py-2.5">
            <dt className="text-sm text-muted-foreground">{k}</dt>
            <dd className="text-lg font-semibold tabular-nums">
              {loading ? "—" : (v ?? 0).toLocaleString?.() ?? v ?? 0}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
