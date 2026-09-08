import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Shield, Zap, AlertTriangle } from "lucide-react";
import { apiAdminMetrics } from "@/lib/api-admin";

export const Route = createFileRoute("/admin/security")({
  component: AdminSecurity,
  pendingComponent: () => (
    <div className="flex items-center justify-center py-20">
      <p className="text-sm text-slate-500">Loading security data...</p>
    </div>
  ),
});

function AdminSecurity() {
  const { data: metrics } = useQuery({
    queryKey: ["adminSecurityMetrics"],
    queryFn: () => apiAdminMetrics(),
    staleTime: 60_000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Security & IP Controls</h1>
        <p className="mt-1 text-sm text-slate-600">
          IP blocking, rate-limiting rules, anti-spam, and bot protection.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Blocked IPs</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{metrics ? "Configured" : "—"}</p>
          <p className="text-xs text-slate-500 mt-1">IP allow/deny rules</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Rate Limit Hits
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {metrics ? `${metrics.monthTotalEvents} total events` : "—"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Monthly platform events</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Spam Blocked</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {metrics ? `${metrics.whatsappClicks} tracked clicks` : "—"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Interaction tracking active</p>
        </Card>
      </div>

      <Card className="p-12 text-center">
        <Shield className="mx-auto h-16 w-16 text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-900">Security Controls</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
          IP blocking controls, rate-limiting rules, anti-spam submission prevention, and bot
          protection configuration. All metrics above are pulled from the live database.
        </p>
      </Card>
    </div>
  );
}
