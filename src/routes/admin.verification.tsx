import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Phone,
  MapPin,
  Building2,
  Star,
  MoreHorizontal,
  Eye,
} from "lucide-react";

export const Route = createFileRoute("/admin/verification")({
  component: AdminVerification,
});

interface AdminAgent {
  id: string;
  name: string;
  kind: string;
  email: string | null;
  phone: string;
  about: string | null;
  listings_count: number;
  verified: boolean;
  verified_at: string | null;
  area_id: string | null;
}

function AdminVerification() {
  const [agents, setAgents] = useState<AdminAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "verified" | "unverified">("all");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("agents")
          .select("*")
          .order("listings_count", { ascending: false });

        if (cancelled) return;

        if (error) {
          console.error("Error fetching agents:", error);
          setAgents([]);
        } else {
          setAgents((data || []) as AdminAgent[]);
        }
      } catch (e) {
        console.error("Load error:", e);
        setAgents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = agents.filter((a) => {
    if (filter === "verified" && !a.verified) return false;
    if (filter === "unverified" && a.verified) return false;
    if (search) {
      const s = search.toLowerCase();
      return a.name.toLowerCase().includes(s) || (a.email || "").toLowerCase().includes(s);
    }
    return true;
  });

  const toggleVerification = async (id: string, verified: boolean) => {
    const { error } = await supabase
      .from("agents")
      .update({
        verified,
        verified_at: verified ? new Date().toISOString() : null,
      })
      .eq("id", id);

    if (error) {
      console.error("Update failed:", error);
      return;
    }

    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, verified, verified_at: verified ? new Date().toISOString() : null } : a)),
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-500">Loading verification data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Verification Center</h1>
          <p className="mt-1 text-sm text-slate-600">
            Review and verify estate agencies and independent brokers.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search agencies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Total Agencies</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{agents.length}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Verified</p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {agents.filter((a) => a.verified).length}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Pending Review</p>
              <p className="mt-2 text-2xl font-bold text-amber-600">
                {agents.filter((a) => !a.verified).length}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "verified" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("verified")}
            >
              Verified
            </Button>
            <Button
              variant={filter === "unverified" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("unverified")}
            >
              Unverified
            </Button>
          </div>
          <p className="text-xs text-slate-500">{filtered.length} results</p>
        </div>
        <div className="divide-y divide-slate-100">
          {filtered.map((agent) => (
            <div
              key={agent.id}
              className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-slate-600">
                  {agent.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{agent.name}</p>
                    {agent.verified && (
                      <Badge className="bg-emerald-100 text-emerald-700">
                        <ShieldCheck className="mr-1 h-3 w-3" /> Verified
                      </Badge>
                    )}
                    {!agent.verified && (
                      <Badge className="bg-amber-100 text-amber-700">Unverified</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 capitalize">{agent.kind}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    {agent.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {agent.email}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {agent.phone}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right text-xs">
                  <p className="font-semibold text-slate-900">{agent.listings_count} listings</p>
                  {agent.verified_at && (
                    <p className="text-slate-500">
                      Verified: {new Date(agent.verified_at).toLocaleDateString("en-UG")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {!agent.verified ? (
                    <button
                      onClick={() => toggleVerification(agent.id, true)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50"
                      title="Verify"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleVerification(agent.id, false)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                      title="Revoke verification"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  )}
                  <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-900">No agencies found</p>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your search or filter.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
