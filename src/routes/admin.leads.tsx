import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2, Filter, RefreshCw } from "lucide-react";
import {
  apiAdminEnquiries,
  apiAdminUpdateEnquiryStatus,
  apiAdminMetrics,
  type EnquiryItem,
  type EnquiryStatus,
} from "@/lib/api-admin";

export const Route = createFileRoute("/admin/leads")({
  component: AdminLeads,
  pendingComponent: () => (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
    </div>
  ),
});

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "replied", label: "Replied" },
  { value: "in_progress", label: "In Progress" },
  { value: "closed", label: "Closed" },
];

function AdminLeads() {
  const [statusFilter, setStatusFilter] = useState("all");

  const metricsQuery = useQuery({
    queryKey: ["adminMetrics"],
    queryFn: () => apiAdminMetrics(),
    staleTime: 60_000,
  });

  const {
    data: enquiriesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["adminEnquiries", statusFilter],
    queryFn: () => apiAdminEnquiries({ limit: 50, status: statusFilter }),
    staleTime: 60_000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiAdminUpdateEnquiryStatus(id, status as EnquiryStatus),
    onSuccess: () => refetch(),
  });

  const enquiries = enquiriesData?.enquiries ?? [];
  const metrics = metricsQuery.data;

  const handleStatusChange = (id: string, status: string) => {
    updateMutation.mutate({ id, status });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-UG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Leads & Enquiries</h1>
        <p className="mt-1 text-sm text-slate-600">
          Real enquiries from property seekers across the platform.
        </p>
      </div>

      {metrics && (
        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Total Enquiries
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{metrics.totalEnquiries}</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              {metrics.monthEnquiries} this month
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              WhatsApp Clicks
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{metrics.whatsappClicks}</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              {metrics.monthWhatsappClicks} this month
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Active Requests
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{metrics.activeRequests}</p>
            <p className="text-xs text-slate-500 mt-1">
              {metrics.monthEnquiries - metrics.activeRequests} closed this month
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Page Views</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{metrics.monthViews}</p>
            <p className="text-xs text-slate-500 mt-1">this month</p>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-600">Filter by status:</span>
          <div className="flex flex-wrap gap-1">
            {STATUS_FILTERS.map((f) => (
              <Button
                key={f.value}
                size="sm"
                variant={statusFilter === f.value ? "default" : "outline"}
                onClick={() => setStatusFilter(f.value)}
                className={
                  statusFilter === f.value
                    ? "bg-slate-900 text-white"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading enquiries...</div>
        ) : enquiries.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-900">No enquiries found</p>
            <p className="text-xs text-slate-500 mt-1">
              {statusFilter !== "all"
                ? `No enquiries with status "${statusFilter}".`
                : "Enquiries from property seekers will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Name
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Contact
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Property
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Message
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Channel
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enquiries.map((enq: EnquiryItem) => (
                  <tr key={enq.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">{enq.name}</td>
                    <td className="px-5 py-4">
                      <div className="text-xs text-slate-600">{enq.email}</div>
                      <div className="text-xs text-slate-500">{enq.phone}</div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600">
                      {enq.propertyTitle ? (
                        <span className="font-medium">{enq.propertyTitle}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600 line-clamp-2 max-w-xs">
                      {enq.message}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="outline" className="capitalize text-xs">
                        {enq.channel}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={enq.status}
                        onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                        className="text-xs rounded border border-slate-200 bg-white px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      >
                        {STATUS_FILTERS.filter((f) => f.value !== "all").map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {formatDate(enq.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
