import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Page } from "@/components/site/Page";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Eye, Edit, Trash2, PlusCircle, MapPin, Loader2 } from "lucide-react";
import { formatUGX } from "@/lib/listings";
import type { Listing } from "@/lib/listings";
import { getMyListings } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/listings")({
  component: DashboardListings,
});

type ListingStatus = "active" | "pending" | "expired" | "drafts";

function DashboardListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ListingStatus>("active");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const data = await getMyListings(user.id);
        if (!cancelled) setListings(data);
      } catch (e) {
        console.error("Failed to load listings:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const statuses: ListingStatus[] = ["active", "pending", "expired", "drafts"];
  const grouped: Record<ListingStatus, Listing[]> = {
    active: listings.filter((l) => (l.status || "active") === "active"),
    pending: listings.filter((l) => (l.status || "active") === "pending"),
    expired: listings.filter(
      (l) =>
        (l.status || "active") === "expired" || (l.moderationStatus || "approved") === "rejected",
    ),
    drafts: listings.filter(
      (l) => (l.status || "active") === "draft" || (l.moderationStatus || "approved") === "draft",
    ),
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase.from("listings").delete().eq("id", id);
      if (error) throw error;
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (e) {
      console.error("Delete failed:", e);
    } finally {
      setDeletingId(null);
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
          <h1 className="text-2xl font-extrabold text-foreground-strong">My Listings</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Manage your property adverts and listings.
          </p>
        </div>
        <Link to="/dashboard/listings/new" className="btn-base btn-primary hover:btn-primary-hover">
          <PlusCircle className="h-4 w-4" /> Add New Property
        </Link>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as ListingStatus)}>
        <TabsList>
          {statuses.map((s) => (
            <TabsTrigger key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)} ({grouped[s].length})
            </TabsTrigger>
          ))}
        </TabsList>

        {statuses.map((status) => (
          <TabsContent key={status} value={status}>
            <Card className="overflow-hidden">
              {grouped[status].length === 0 ? (
                <div className="p-8 text-center text-sm text-foreground-muted">
                  No {status} listings yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surface-1/50">
                        <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-foreground-muted">
                          Property
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-foreground-muted">
                          Location
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-foreground-muted">
                          Price
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-foreground-muted">
                          Status
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-foreground-muted">
                          Views
                        </th>
                        <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-foreground-muted">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {grouped[status].map((listing) => (
                        <tr key={listing.id} className="hover:bg-surface-1/30 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={listing.images?.[0] || "/placeholder.png"}
                                alt={listing.title}
                                className="h-10 w-14 rounded-md object-cover"
                              />
                              <div>
                                <p className="font-medium text-foreground-strong line-clamp-1">
                                  {listing.title}
                                </p>
                                <p className="text-xs text-foreground-muted">Ref: {listing.ref}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1 text-xs text-foreground-muted">
                              <MapPin className="h-3 w-3" />
                              {listing.area}, {listing.district}
                            </div>
                          </td>
                          <td className="px-5 py-3 font-medium text-foreground-strong">
                            {formatUGX(listing.price)}
                          </td>
                          <td className="px-5 py-3">
                            <Badge
                              className={`${status === "active" ? "bg-success-bg text-success" : status === "pending" ? "bg-yellow-50 text-yellow-700" : status === "expired" ? "bg-destructive/10 text-destructive" : "bg-secondary text-foreground-muted"} border-0`}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Badge>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1 text-xs text-foreground-muted">
                              <Eye className="h-3 w-3" />
                              {listing.viewCount ?? 0}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/property/${listing.slug || listing.id}`}
                                className="inline-flex size-8 items-center justify-center rounded-md hover:bg-surface-1 text-foreground-muted"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <button className="inline-flex size-8 items-center justify-center rounded-md hover:bg-surface-1 text-foreground-muted">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(listing.id)}
                                disabled={deletingId === listing.id}
                                className="inline-flex size-8 items-center justify-center rounded-md hover:bg-destructive/10 text-destructive disabled:opacity-50"
                              >
                                {deletingId === listing.id ? (
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
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
