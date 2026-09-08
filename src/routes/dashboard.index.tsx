import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { loadProfileForUser } from "@/lib/user-profile";
import { Card } from "@/components/ui/card";
import {
  Heart,
  MessageSquare,
  Eye,
  Plus,
  MapPin,
  Clock,
  Trash2,
  AlertCircle,
  FileText,
  X,
  Search,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardOverview,
});

interface SavedProperty {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string;
  isSaved?: boolean;
}

interface PropertyRequest {
  id: string;
  location: string;
  budget: number;
  propertyType: string;
  createdAt: string;
}

interface RecentSearch {
  id: string;
  query: string;
  createdAt: string;
}

interface RecentlyViewed {
  id: string;
  title: string;
  type: string;
  price: number;
  image: string;
  viewedAt: string;
}

function DashboardOverview() {
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [activeRequests, setActiveRequests] = useState<PropertyRequest[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewed[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [loading, setLoading] = useState(true);

  const [showBrowseModal, setShowBrowseModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({ location: "", budget: "", propertyType: "" });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        if (!cancelled) {
          const profile = await loadProfileForUser(user);
          setUserEmail(user.email || "");
          setUserName(profile?.full_name || user.email?.split("@")[0] || "User");
        }

        const { data: saved } = await supabase
          .from("saved_properties")
          .select("listing_id")
          .eq("user_id", user.id);

        if (!cancelled && saved && saved.length > 0) {
          const listingIds = saved.map((s: { listing_id: string }) => s.listing_id);
          const { data: listings } = await supabase
            .from("listings")
            .select("id, title, price, images, district, region")
            .in("id", listingIds);

          if (!cancelled && listings) {
            const savedProps: SavedProperty[] = listings.map(
              (l: {
                id: string;
                title: string;
                price: number;
                images: string[];
                district: string;
                region: string;
              }) => ({
                id: l.id,
                title: l.title,
                location: `${l.district}, ${l.region}`,
                price: Number(l.price),
                image: (l.images && l.images[0]) || "/placeholder.png",
                isSaved: true,
              }),
            );
            setSavedProperties(savedProps);
          }
        }

        const { data: enquiries } = await supabase
          .from("enquiries")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (!cancelled && enquiries) {
          const requests: PropertyRequest[] = enquiries.map(
            (e: { id: string; message?: string | null; created_at?: string }) => ({
              id: e.id,
              location:
                e.message
                  ?.split("\n")
                  .find((line: string) => line.includes("Location:"))
                  ?.replace("Location:", "")
                  .trim() || "Unknown",
              budget: 0,
              propertyType:
                e.message
                  ?.split("\n")
                  .find((line: string) => line.includes("Property:"))
                  ?.replace("Property:", "")
                  .trim() || "Property Enquiry",
              createdAt: e.created_at || "",
            }),
          );
          setActiveRequests(requests);
        }

        const { data: recentListings } = await supabase
          .from("listings")
          .select("id, title, price, images, category, district")
          .order("created_at", { ascending: false })
          .limit(6);

        if (!cancelled && recentListings) {
          const viewed: RecentlyViewed[] = recentListings.map(
            (l: {
              id: string;
              title: string;
              category: string;
              price: number;
              images: string[];
              created_at?: string;
            }) => ({
              id: l.id,
              title: l.title,
              type: l.category,
              price: Number(l.price),
              image: (l.images && l.images[0]) || "/placeholder.png",
              viewedAt: l.created_at ? new Date(l.created_at).toLocaleDateString() : "Recently",
            }),
          );
          setRecentlyViewed(viewed);
        }

        if (!cancelled) {
          try {
            const raw = localStorage.getItem("recent_searches");
            if (raw) setRecentSearches(JSON.parse(raw));
          } catch {
            // ignore
          }
        }
      } catch (e) {
        console.error("Dashboard load error:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddRequest = async () => {
    if (requestForm.location && requestForm.budget && requestForm.propertyType) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("enquiries").insert({
            listing_id: null as unknown as string,
            user_id: user.id,
            name: userName,
            email: userEmail,
            phone: "",
            message: `Property Request\nLocation: ${requestForm.location}\nBudget: ${requestForm.budget}\nProperty Type: ${requestForm.propertyType}`,
            status: "new",
          });
        }
      } catch (e) {
        console.error("Request error:", e);
      }

      const newRequest: PropertyRequest = {
        id: Date.now().toString(),
        location: requestForm.location,
        budget: parseInt(requestForm.budget) || 0,
        propertyType: requestForm.propertyType,
        createdAt: new Date().toISOString().split("T")[0] || "",
      };
      setActiveRequests([newRequest, ...activeRequests]);
      setRequestForm({ location: "", budget: "", propertyType: "" });
      setShowRequestModal(false);
    }
  };

  const toggleSaveProperty = (id: string) => {
    setSavedProperties(
      savedProperties.map((p) => (p.id === id ? { ...p, isSaved: !p.isSaved } : p)),
    );
  };

  const deleteRequest = async (id: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("enquiries").delete().eq("id", id).eq("user_id", user.id);
      }
    } catch (e) {
      console.error("Delete error:", e);
    }
    setActiveRequests(activeRequests.filter((r) => r.id !== id));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-foreground-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome, {userName}</h1>
          <p className="mt-1 text-sm text-slate-600">Property Seeker · AMDERN PROPERTIES SMC LTD</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBrowseModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
          >
            <Search className="h-4 w-4" />
            Browse properties
          </button>
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Post a request
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="SAVED PROPERTIES"
          value={savedProperties.length.toString()}
          icon={Heart}
        />
        <MetricCard
          title="ACTIVE REQUESTS"
          value={activeRequests.length.toString()}
          icon={MessageSquare}
        />
        <MetricCard title="RECENTLY VIEWED" value={recentlyViewed.length.toString()} icon={Eye} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <h2 className="text-lg font-bold text-slate-900">Saved Properties</h2>
          </div>
          <div className="p-6">
            {savedProperties.length > 0 ? (
              <div className="space-y-4">
                {savedProperties.map((prop) => (
                  <div
                    key={prop.id}
                    className="flex gap-4 rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition-colors"
                  >
                    <img
                      src={prop.image}
                      alt={prop.title}
                      className="h-24 w-32 rounded-lg object-cover bg-slate-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect fill='%23e2e8f0' width='200' height='150'/%3E%3C/svg%3E";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900">{prop.title}</h3>
                      <div className="flex items-center gap-1 text-slate-600 text-sm mt-1">
                        <MapPin className="h-4 w-4" />
                        {prop.location}
                      </div>
                      <p className="text-red-600 font-bold mt-2">{formatPrice(prop.price)}</p>
                    </div>
                    <button
                      onClick={() => toggleSaveProperty(prop.id)}
                      className={`shrink-0 p-2 rounded-lg transition-colors ${
                        prop.isSaved
                          ? "bg-red-50 text-red-600"
                          : "bg-slate-100 text-slate-400 hover:text-red-600"
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${prop.isSaved ? "fill-current" : ""}`} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Heart className="h-12 w-12 text-slate-300 mb-3" />
                <h3 className="font-bold text-slate-900 mb-1">No saved properties</h3>
                <p className="text-sm text-slate-600">Properties you save will appear here</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <h2 className="text-lg font-bold text-slate-900">Latest Properties</h2>
          </div>
          <div className="p-6">
            {recentlyViewed.length > 0 ? (
              <div className="space-y-3 overflow-x-auto">
                {recentlyViewed.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-lg border border-slate-200 p-3 hover:border-slate-300 transition-colors"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-20 w-28 rounded-lg object-cover bg-slate-100 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect fill='%23e2e8f0' width='200' height='150'/%3E%3C/svg%3E";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 text-sm truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">{item.type}</p>
                      <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                        <Clock className="h-3 w-3" />
                        {item.viewedAt}
                      </div>
                      <p className="text-red-600 font-semibold text-sm mt-2">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Eye className="h-12 w-12 text-slate-300 mb-3" />
                <h3 className="font-bold text-slate-900 mb-1">No listings yet</h3>
                <p className="text-sm text-slate-600">Latest properties will appear here</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">My property requests</h2>
        </div>
        <div className="p-6">
          {activeRequests.length > 0 ? (
            <div className="space-y-3">
              {activeRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">{req.propertyType}</h3>
                    <div className="flex flex-col gap-1 text-sm text-slate-600 mt-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {req.location}
                      </div>
                      <div>Budget: {formatPrice(req.budget)}</div>
                      <div className="text-xs text-slate-500">Posted on {req.createdAt}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteRequest(req.id)}
                    className="ml-4 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-slate-300 mb-3" />
              <h3 className="font-bold text-slate-900 mb-1">No property requests</h3>
              <p className="text-sm text-slate-600">
                Post a request and let agents bring matching properties to you
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent searches</h2>
          {recentSearches.length > 0 && (
            <button
              onClick={() => setRecentSearches([])}
              className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="p-6">
          {recentSearches.length > 0 ? (
            <div className="space-y-2">
              {recentSearches.map((search) => (
                <div
                  key={search.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-900 font-medium">{search.query}</span>
                  </div>
                  <span className="text-xs text-slate-500">{search.createdAt}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-slate-300 mb-3" />
              <h3 className="font-bold text-slate-900 mb-1">No recent searches</h3>
              <p className="text-sm text-slate-600">
                Your latest property searches will appear here so you can run them again
              </p>
            </div>
          )}
        </div>
      </Card>

      {showBrowseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
          <Card className="w-full max-w-md mx-4">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">Browse properties</h2>
              <button
                onClick={() => setShowBrowseModal(false)}
                className="p-1 text-slate-500 hover:bg-slate-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                This will open the property search interface.
              </p>
              <Link to="/search" className="w-full">
                <button
                  onClick={() => setShowBrowseModal(false)}
                  className="w-full px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                >
                  Open Search
                </button>
              </Link>
            </div>
          </Card>
        </div>
      )}

      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
          <Card className="w-full max-w-md mx-4">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">Post a request</h2>
              <button
                onClick={() => setShowRequestModal(false)}
                className="p-1 text-slate-500 hover:bg-slate-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g., Bwaise, Kampala"
                  value={requestForm.location}
                  onChange={(e) => setRequestForm({ ...requestForm, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-red-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Budget (UGX)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 500000000"
                  value={requestForm.budget}
                  onChange={(e) => setRequestForm({ ...requestForm, budget: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-red-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Property Type
                </label>
                <select
                  value={requestForm.propertyType}
                  onChange={(e) => setRequestForm({ ...requestForm, propertyType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-red-600"
                >
                  <option value="">Select property type</option>
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Land">Land</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddRequest}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

function MetricCard({ title, value, icon: Icon }: MetricCardProps) {
  return (
    <Card className="p-5 bg-white border border-slate-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-600">{title}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
