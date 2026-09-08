import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Home,
  MessageSquare,
  Users,
  DollarSign,
  Eye,
  Phone,
  Clock,
  XCircle,
  CheckCircle2,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { formatUGX } from "@/lib/listings";
import {
  apiAdminMetrics,
  apiAdminModerateProperty,
  apiAdminModerationQueue,
  apiAdminEnquiries,
  type AdminMetrics,
  type ModerationItem,
  type EnquiryItem,
} from "@/lib/api-admin";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

interface ModerationQueueItem {
  id: string;
  title: string;
  agency: string;
  category: string;
  price: number;
  status: string;
  submittedAt: string;
  image: string;
}

function AdminOverview() {
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalProperties: 0,
    pendingModeration: 0,
    soldProperties: 0,
    rentedProperties: 0,
    verifiedAgencies: 0,
    activeRequests: 0,
    monthlyRevenue: 0,
    totalViews: 0,
    monthViews: 0,
    totalEnquiries: 0,
    monthEnquiries: 0,
    whatsappClicks: 0,
    monthWhatsappClicks: 0,
    monthTotalEvents: 0,
    totalUsers: 0,
    revenueGrowthPct: 0,
    viewsGrowthPct: 0,
  });
  const [moderationQueue, setModerationQueue] = useState<ModerationQueueItem[]>([]);
  const [recentEnquiries, setRecentEnquiries] = useState<EnquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real dashboard metrics from the backend API
  const metricsQuery = useQuery({
    queryKey: ["adminMetrics"],
    queryFn: () => apiAdminMetrics(),
    staleTime: 60_000,
  });

  // Fetch real moderation queue from the backend API
  const moderationQuery = useQuery({
    queryKey: ["adminModerationQueue"],
    queryFn: () => apiAdminModerationQueue({ limit: 8 }),
    staleTime: 60_000,
  });

  // Fetch real recent enquiries from the backend API
  const enquiriesQuery = useQuery({
    queryKey: ["adminEnquiries"],
    queryFn: () => apiAdminEnquiries({ limit: 5 }),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (metricsQuery.data) setMetrics(metricsQuery.data);
    if (moderationQuery.data) {
      setModerationQueue(
        moderationQuery.data.queue.map((item) => ({
          id: item.id,
          title: item.title,
          agency: "AMDERN Properties",
          category: item.category,
          price: item.price,
          status: item.moderationStatus,
          submittedAt: item.submittedAt,
          image: item.image ?? "/property-media/IMG-20260825-WA0018.jpg",
        })),
      );
    }
    if (enquiriesQuery.data) setRecentEnquiries(enquiriesQuery.data.enquiries);

    if (metricsQuery.isError || moderationQuery.isError || enquiriesQuery.isError) {
      setError("Failed to load dashboard data from the server.");
    }
  }, [
    metricsQuery.data,
    moderationQuery.data,
    enquiriesQuery.data,
    metricsQuery.isError,
    moderationQuery.isError,
    enquiriesQuery.isError,
  ]);

  useEffect(() => {
    setLoading(metricsQuery.isLoading || moderationQuery.isLoading || enquiriesQuery.isLoading);
  }, [metricsQuery.isLoading, moderationQuery.isLoading, enquiriesQuery.isLoading]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
      case "approved":
        return <Badge className="bg-emerald-100 text-emerald-700">Live</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>;
      case "flagged":
      case "rejected":
        return <Badge className="bg-red-100 text-red-700">Flagged</Badge>;
      case "draft":
        return <Badge className="bg-slate-100 text-slate-700">Draft</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700">{status}</Badge>;
    }
  };

  const handleModerate = async (id: string, status: "approved" | "flagged") => {
    try {
      await apiAdminModerateProperty(id, status);
      moderationQuery.refetch();
    } catch (e) {
      console.error("Failed to moderate property:", e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-500">Loading admin data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm font-semibold text-red-600">{error}</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Executive Overview</h1>
          <p className="mt-1 text-sm text-slate-600">
            Platform performance and moderation queue for AMDERN PROPERTIES SMC LTD
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/listings" className="btn-base btn-primary hover:btn-primary-hover">
            <Plus className="mr-2 h-4 w-4" /> New Listing
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Live Properties"
          value={metrics.totalProperties.toLocaleString()}
          change={metrics.totalProperties > 0 ? `${metrics.totalProperties} total` : "0 total"}
          trend="up"
          icon={Home}
        />
        <KPICard
          title="Pending Moderation"
          value={metrics.pendingModeration.toString()}
          change={
            metrics.pendingModeration > 0 ? `${metrics.pendingModeration} need review` : "All clear"
          }
          trend={metrics.pendingModeration > 0 ? "down" : "up"}
          icon={Clock}
        />
        <KPICard
          title="Verified Agencies"
          value={metrics.verifiedAgencies.toString()}
          change={`${metrics.verifiedAgencies} verified`}
          trend="up"
          icon={Users}
        />
        <KPICard
          title="Monthly Revenue"
          value={formatCurrency(metrics.monthlyRevenue)}
          change={
            metrics.revenueGrowthPct
              ? `${metrics.revenueGrowthPct > 0 ? "+" : ""}${metrics.revenueGrowthPct.toFixed(1)}% vs last month`
              : "No revenue last month"
          }
          trend={metrics.revenueGrowthPct >= 0 ? "up" : "down"}
          icon={DollarSign}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard
          title="Total Page Views"
          value={metrics.totalViews.toLocaleString()}
          change={
            metrics.viewsGrowthPct
              ? `${metrics.viewsGrowthPct > 0 ? "+" : ""}${metrics.viewsGrowthPct.toFixed(1)}% vs last month`
              : "0% vs last month"
          }
          trend={metrics.viewsGrowthPct >= 0 ? "up" : "down"}
          icon={Eye}
        />
        <KPICard
          title="Total Enquiries"
          value={metrics.totalEnquiries.toString()}
          change={`${metrics.monthEnquiries} this month`}
          trend="up"
          icon={MessageSquare}
        />
        <KPICard
          title="WhatsApp Clicks"
          value={metrics.whatsappClicks.toString()}
          change={`${metrics.monthWhatsappClicks} this month`}
          trend="up"
          icon={Phone}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Moderation Queue</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {metrics.pendingModeration} listings awaiting review
            </p>
          </div>
          <Link to="/admin/listings" className="text-xs font-bold text-red-600 hover:text-red-700">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Property
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Agency
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Category
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Price
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Submitted
                </th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {moderationQueue.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt=""
                        className="h-10 w-14 rounded-md object-cover bg-slate-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect fill='%23e2e8f0' width='200' height='150'/%3E%3C/svg%3E";
                        }}
                      />
                      <div>
                        <p className="font-semibold text-slate-900 line-clamp-1">{item.title}</p>
                        <p className="text-xs text-slate-500">Ref: {item.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-600">{item.agency}</td>
                  <td className="px-5 py-4">
                    <Badge variant="outline" className="capitalize text-xs">
                      {item.category}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold text-slate-900">
                    {formatUGX(item.price)}
                  </td>
                  <td className="px-5 py-4">{getStatusBadge(item.status)}</td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {new Date(item.submittedAt).toLocaleDateString("en-UG")}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {item.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleModerate(item.id, "approved")}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-emerald-600 hover:bg-emerald-50"
                            title="Approve"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleModerate(item.id, "flagged")}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-600 hover:bg-red-50"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {moderationQueue.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-300 mb-3" />
                    <p className="text-sm font-semibold text-slate-900">All caught up!</p>
                    <p className="text-xs text-slate-500 mt-1">No listings pending moderation.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Recent Enquiries</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {metrics.totalEnquiries} leads from property seekers
          </p>
        </div>
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
                  Message
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
              {recentEnquiries.map((enq) => (
                <tr key={enq.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 text-sm font-semibold text-slate-900">{enq.name}</td>
                  <td className="px-5 py-4">
                    <div className="text-xs text-slate-600">{enq.email}</div>
                    <div className="text-xs text-slate-500">{enq.phone}</div>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-600 line-clamp-2 max-w-xs">
                    {enq.message}
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      className={
                        enq.status === "new"
                          ? "bg-emerald-100 text-emerald-700"
                          : enq.status === "contacted"
                            ? "bg-blue-100 text-blue-700"
                            : enq.status === "in_progress"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                      }
                    >
                      {enq.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {new Date(enq.createdAt).toLocaleDateString("en-UG")}
                  </td>
                </tr>
              ))}
              {recentEnquiries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <MessageSquare className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-sm font-semibold text-slate-900">No enquiries yet</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Enquiries from property seekers will appear here.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
}

function KPICard({ title, value, change, trend, icon: Icon }: KPICardProps) {
  return (
    <Card className="p-5 bg-white border border-slate-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
          <div className="mt-2 flex items-center gap-1 text-xs font-semibold">
            {trend === "up" ? (
              <svg
                className="h-3.5 w-3.5 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m7 7l-7 7-7-7" />
              </svg>
            ) : (
              <svg
                className="h-3.5 w-3.5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7l-7 7-7-7" />
              </svg>
            )}
            <span className={trend === "up" ? "text-emerald-600" : "text-red-600"}>{change}</span>
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
