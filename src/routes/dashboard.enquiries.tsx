import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Page } from "@/components/site/Page";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageSquare, Eye, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { getMyEnquiries } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/enquiries")({
  component: DashboardEnquiries,
});

type Enquiry = {
  id: string;
  listing: string;
  listingTitle: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  channel: string;
  status: string;
  message: string;
};

function DashboardEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const data = await getMyEnquiries(user.id);
        if (!cancelled) setEnquiries(data);
      } catch (e) {
        console.error("Failed to load enquiries:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setBusyId(id);
    try {
      const { error } = await supabase.from("enquiries").update({ status }).eq("id", id);
      if (!error) {
        setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
      }
    } catch (e) {
      console.error("Status update failed:", e);
    } finally {
      setBusyId(null);
    }
  };

  const deleteEnquiry = async (id: string) => {
    setBusyId(id);
    try {
      const { error } = await supabase.from("enquiries").delete().eq("id", id);
      if (!error) {
        setEnquiries((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (e) {
      console.error("Delete failed:", e);
    } finally {
      setBusyId(null);
    }
  };

  const newCount = enquiries.filter((e) => e.status === "new").length;
  const contactedCount = enquiries.filter((e) => e.status === "contacted").length;
  const closedCount = enquiries.filter((e) => e.status === "closed").length;

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "whatsapp":
        return <MessageSquare className="h-4 w-4" />;
      case "call":
        return <Phone className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-50 text-blue-700 border-0">New</Badge>;
      case "contacted":
        return <Badge className="bg-yellow-50 text-yellow-700 border-0">Contacted</Badge>;
      case "closed":
        return <Badge className="bg-emerald-50 text-emerald-700 border-0">Closed</Badge>;
      default:
        return <Badge className="bg-secondary text-foreground-muted border-0">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-foreground-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground-strong">Enquiries & Leads</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Manage messages, phone calls, and WhatsApp enquiries from potential clients.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground-muted">New Enquiries</p>
              <p className="text-xl font-bold tabular-nums">{newCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground-muted">WhatsApp Clicks</p>
              <p className="text-xl font-bold tabular-nums">{contactedCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground-muted">Total Leads</p>
              <p className="text-xl font-bold tabular-nums">{enquiries.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        {enquiries.length === 0 ? (
          <div className="p-8 text-center text-sm text-foreground-muted">No enquiries yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-1/50">
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-foreground-muted">
                    Listing
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-foreground-muted">
                    Contact
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-foreground-muted">
                    Channel
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-foreground-muted">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-foreground-muted">
                    Date
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-foreground-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="hover:bg-surface-1/30 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground-strong">
                        {enquiry.listingTitle || enquiry.listing}
                      </p>
                      <p className="text-xs text-foreground-muted line-clamp-1 mt-0.5">
                        {enquiry.message}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground-strong">{enquiry.name}</p>
                      <p className="text-xs text-foreground-muted">{enquiry.email}</p>
                      <p className="text-xs text-foreground-muted">{enquiry.phone}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold capitalize">
                        {getChannelIcon(enquiry.channel)}
                        {enquiry.channel}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={enquiry.status}
                        onChange={(e) => updateStatus(enquiry.id, e.target.value)}
                        className="text-xs rounded-md border border-input bg-background px-2 py-1"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-5 py-3 text-xs text-foreground-muted">{enquiry.date}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`mailto:${enquiry.email}`}
                          className="inline-flex size-8 items-center justify-center rounded-md hover:bg-surface-1 text-foreground-muted"
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                        <a
                          href={`https://wa.me/${enquiry.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex size-8 items-center justify-center rounded-md hover:bg-surface-1 text-foreground-muted"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </a>
                        <a
                          href={`tel:${enquiry.phone}`}
                          className="inline-flex size-8 items-center justify-center rounded-md hover:bg-surface-1 text-foreground-muted"
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => deleteEnquiry(enquiry.id)}
                          disabled={busyId === enquiry.id}
                          className="inline-flex size-8 items-center justify-center rounded-md hover:bg-destructive/10 text-destructive disabled:opacity-50"
                        >
                          {busyId === enquiry.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
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
