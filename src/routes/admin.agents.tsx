import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Users, Building2, UserCheck, Settings } from "lucide-react";

export const Route = createFileRoute("/admin/agents")({
  component: AdminAgents,
});

function AdminAgents() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Agencies & Agents</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage registered agencies, independent brokers, and developer accounts.
        </p>
      </div>
      <Card className="p-12 text-center">
        <Users className="mx-auto h-16 w-16 text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-900">Agency Management</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
          Review business registration documents, assign or revoke verified agent badges, and
          manage listing quotas.
        </p>
      </Card>
    </div>
  );
}
