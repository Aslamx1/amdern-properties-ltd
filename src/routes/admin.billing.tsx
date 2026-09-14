import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  DollarSign,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  apiAdminGetPayments,
  apiAdminApprovePayment,
  type AdminPaymentTransaction,
} from "@/lib/api-admin";

export const Route = createFileRoute("/admin/billing")({
  component: AdminBilling,
});

function AdminBilling() {
  const [payments, setPayments] = useState<AdminPaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiAdminGetPayments();
      setPayments(data.payments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPayments();
  }, []);

  const handleApprove = async (id: string) => {
    if (!confirm("Are you sure you want to approve this payment and activate the service?")) {
      return;
    }
    setApprovingId(id);
    try {
      await apiAdminApprovePayment(id);
      await loadPayments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve payment");
    } finally {
      setApprovingId(null);
    }
  };

  const filtered = payments.filter((p) => {
    const term = search.toLowerCase();
    return (
      (p.externalId && p.externalId.toLowerCase().includes(term)) ||
      (p.item && p.item.toLowerCase().includes(term)) ||
      (p.payer && p.payer.toLowerCase().includes(term)) ||
      (p.payerName && p.payerName.toLowerCase().includes(term)) ||
      (p.userEmail && p.userEmail.toLowerCase().includes(term))
    );
  });

  const totalRevenue = payments
    .filter((p) => p.status === "Success" || p.status === "Fulfilled")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const pendingCount = payments.filter(
    (p) => p.status === "Pending" || p.status === "SentToVendor"
  ).length;

  const totalCount = payments.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Billing & Revenue</h1>
          <p className="mt-1 text-sm text-slate-600">
            Track transactions, verify Mobile Money & Bank payments, and manage premium subscriptions.
          </p>
        </div>
        <Button
          onClick={() => void loadPayments()}
          variant="outline"
          size="sm"
          disabled={loading}
          className="gap-2 self-start"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Total Collected</p>
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">
            UGX {totalRevenue.toLocaleString("en-US")}
          </p>
          <p className="mt-1 text-xs text-slate-500">Confirmed completed payments</p>
        </Card>

        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Pending Verification</p>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{pendingCount}</p>
          <p className="mt-1 text-xs text-slate-500">Awaiting MoMo receipt verification</p>
        </Card>

        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Total Invoices</p>
            <Receipt className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{totalCount}</p>
          <p className="mt-1 text-xs text-slate-500">All registered payment requests</p>
        </Card>
      </div>

      <Card className="p-6 border-slate-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">Payment Transactions</h2>
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference, customer, or plan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-slate-200 pl-9 pr-4 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading transactions...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-600">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <CreditCard className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="font-semibold">No payment transactions found</p>
            <p className="text-xs text-slate-400 mt-1">
              New subscription and promotion payments will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Item / Service</th>
                  <th className="px-4 py-3">Payer / User</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((tx) => {
                  const isSuccess = tx.status === "Success";
                  const isPending = tx.status === "Pending" || tx.status === "SentToVendor";

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-900">
                        {tx.externalId || tx.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900">{tx.item}</span>
                        {tx.type && (
                          <span className="ml-1.5 text-xs text-slate-400 capitalize">
                            ({tx.type})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{tx.payerName || tx.payer}</p>
                        {tx.userEmail && (
                          <p className="text-xs text-slate-400">{tx.userEmail}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {tx.currency} {tx.amount.toLocaleString("en-US")}
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-600">
                        {tx.method.replace("-", " ")}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            isSuccess
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : isPending
                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                : "bg-red-100 text-red-800 border-red-200"
                          }
                        >
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isPending && (
                          <Button
                            size="sm"
                            onClick={() => void handleApprove(tx.id)}
                            disabled={approvingId === tx.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3"
                          >
                            {approvingId === tx.id ? "Approving..." : "Approve & Activate"}
                          </Button>
                        )}
                        {isSuccess && (
                          <span className="inline-flex items-center text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="h-4 w-4 mr-1 text-emerald-600" /> Fulfilled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
