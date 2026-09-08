import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown, TrendingUp, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/subscription")({
  component: DashboardSubscription,
});

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  priceNumeric: number;
  credit: number;
}

const PLANS: Plan[] = [
  {
    name: "Free Starter",
    price: "UGX 0",
    period: "/mo",
    description: "Perfect for getting started",
    features: [
      "Post up to 3 listings",
      "Basic agent profile",
      "Email enquiries",
      "Standard listing placement",
    ],
    cta: "Current Plan",
    highlighted: false,
    priceNumeric: 0,
    credit: 0,
  },
  {
    name: "Premium",
    price: "UGX 150,000",
    period: "/mo",
    description: "For serious agents",
    features: [
      "Post up to 20 listings",
      "Featured placement",
      "Priority support",
      "Analytics dashboard",
      "Verified badge eligible",
    ],
    cta: "Upgrade to Premium",
    highlighted: true,
    priceNumeric: 150000,
    credit: 20,
  },
  {
    name: "Premium Plus",
    price: "UGX 450,000",
    period: "/mo",
    description: "Maximum exposure",
    features: [
      "Unlimited listings",
      "Top featured placement",
      "Dedicated account manager",
      "Advanced analytics",
      "Verified badge",
      "Banner adverts",
    ],
    cta: "Upgrade to Premium Plus",
    highlighted: false,
    priceNumeric: 450000,
    credit: 100,
  },
];

const ADDONS = [
  {
    name: "Featured",
    price: "UGX 75,000",
    priceNumeric: 75000,
    description: "Top of search results for 30 days",
    badge: null,
  },
  {
    name: "Premium Plus",
    price: "UGX 250,000",
    priceNumeric: 250000,
    description: "Maximum visibility for 30 days",
    badge: "Popular",
  },
  {
    name: "Bump Up",
    price: "UGX 25,000",
    priceNumeric: 25000,
    description: "Refresh listing to top of results",
    badge: null,
  },
];

interface MyListing {
  id: string;
  ref: string;
  title: string;
}

type CheckoutType =
  | { mode: "plan"; plan: Plan }
  | { mode: "addon"; addon: (typeof ADDONS)[number]; listing: MyListing | null }
  | null;

function DashboardSubscription() {
  const navigate = useNavigate();
  const [listingCount, setListingCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [myListings, setMyListings] = useState<MyListing[]>([]);
  const [currentPlanName, setCurrentPlanName] = useState("Free Starter");
  const [checkout, setCheckout] = useState<CheckoutType>(null);

  useEffect(() => {
    const saved = localStorage.getItem("amdern_subscription_plan");
    if (saved) setCurrentPlanName(saved);

    let cancelled = false;
    async function load() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || cancelled) return;

        const { count, error } = await supabase
          .from("listings")
          .select("*", { count: "exact", head: true })
          .eq("agent_id", user.id);
        if (!cancelled && !error) {
          setListingCount(count ?? 0);
        }

        const { data: userListing, error: userListingErr } = await supabase
          .from("listings")
          .select("id, ref, title")
          .eq("agent_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);
        if (!cancelled && !userListingErr && userListing) {
          setMyListings(userListing as MyListing[]);
        }
      } catch (e) {
        console.error("Subscription load error:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const remainingCredits = listingCount !== null ? Math.max(0, 100 - listingCount) : null;
  const currentPlan = PLANS.find((p) => p.name === currentPlanName) ?? PLANS[0]!;

  const handlePlanSelect = (plan: Plan) => {
    setCheckout({ mode: "plan", plan });
  };

  const handleAddonSelect = (addon: (typeof ADDONS)[number]) => {
    setCheckout({ mode: "addon", addon, listing: myListings[0] ?? null });
  };

  const handleCheckout = () => {
    if (!checkout) return;

    if (checkout.mode === "plan") {
      void navigate({
        to: "/payments",
        search: {
          type: "subscription",
          item: checkout.plan.name,
          amount: checkout.plan.priceNumeric,
          period: checkout.plan.period,
        } as never,
      });
      return;
    }

    const search = {
      type: "promotion",
      item: `${checkout.addon.name} Promotion`,
      amount: checkout.addon.priceNumeric,
      listingId: checkout.listing?.id,
      listingRef: checkout.listing?.ref,
    } as never;

    void navigate({ to: "/payments", search });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground-strong">
          Subscription & Ad Promotion
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Upgrade your plan to get more visibility and reach more buyers.
        </p>
      </div>

      {/* Checkout Modal */}
      {checkout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground-strong">
                {checkout.mode === "plan"
                  ? `Checkout — ${checkout.plan.name}`
                  : `Checkout — ${checkout.addon.name} Promotion`}
              </h2>
              <button
                onClick={() => setCheckout(null)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {checkout.mode === "plan" ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Plan</span>
                    <span className="font-semibold text-foreground-strong">
                      {checkout.plan.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Price</span>
                    <span className="font-semibold text-foreground-strong">
                      {checkout.plan.price}
                      <span className="text-xs text-foreground-muted"> {checkout.plan.period}</span>
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Listings limit</span>
                    <span className="font-semibold text-foreground-strong">
                      {checkout.plan.credit === 100 ? "Unlimited" : checkout.plan.credit}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Promotion</span>
                    <span className="font-semibold text-foreground-strong">
                      {checkout.addon.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Price</span>
                    <span className="font-semibold text-foreground-strong">
                      {checkout.addon.price}
                    </span>
                  </div>
                  {checkout.mode === "addon" && checkout.addon.name && (
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground-muted">Listing</span>
                      <span className="font-semibold text-foreground-strong max-w-[180px] truncate">
                        {checkout.listing?.ref ?? "—"} —{" "}
                        {checkout.listing?.title ?? "No listing selected"}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setCheckout(null)}>
                Cancel
              </Button>
              <Button className="flex-1 btn-primary" onClick={handleCheckout}>
                Continue to Payment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Current Plan */}
      <Card className="p-5 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground-muted">Current Plan</p>
              {loading ? (
                <p className="text-xl font-bold text-foreground-strong">Loading...</p>
              ) : (
                <>
                  <p className="text-xl font-bold text-foreground-strong">{currentPlanName}</p>
                  <p className="text-xs text-foreground-muted">
                    {remainingCredits !== null
                      ? `${remainingCredits} listings remaining this month`
                      : "Contact us to upgrade"}
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-2xl font-extrabold tabular-nums">
                {loading ? "-" : (listingCount ?? 0)}
              </p>
              <p className="text-xs text-foreground-muted">listings used</p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
        </div>
      </Card>

      {/* Plans */}
      <div className="grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = currentPlanName === plan.name;
          return (
            <Card
              key={plan.name}
              className={`relative overflow-hidden ${plan.highlighted ? "border-primary shadow-lg" : ""}`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-bl-lg rounded-tr-none bg-primary text-primary-foreground border-0">
                    <Star className="h-3 w-3 mr-1" /> Popular
                  </Badge>
                </div>
              )}
              <div className="p-6">
                <h3 className="text-lg font-bold text-foreground-strong">{plan.name}</h3>
                <p className="text-xs text-foreground-muted mt-1">{plan.description}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold tabular-nums">{plan.price}</span>
                  <span className="text-sm text-foreground-muted">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success shrink-0" />
                      <span className="text-foreground-muted">{feature}</span>
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <Badge className="w-full mt-6 justify-center bg-success/10 text-success border-success/30">
                    Current Plan
                  </Badge>
                ) : (
                  <Button
                    className={`w-full mt-6 ${plan.highlighted ? "btn-primary" : "btn-outline"}`}
                    onClick={() => handlePlanSelect(plan)}
                    disabled={plan.priceNumeric === 0}
                  >
                    {plan.cta}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Promote Your Listing */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground-strong">Promote Your Listing</h3>
            <p className="text-xs text-foreground-muted">
              Boost visibility with featured placement and premium upgrades.
            </p>
            {myListings.length === 0 && !loading && (
              <p className="text-xs text-foreground-muted mt-1">
                <Link to="/dashboard/listings/new" className="text-primary underline">
                  Add a listing
                </Link>{" "}
                to promote it.
              </p>
            )}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {ADDONS.map((addon) => (
            <div key={addon.name} className="rounded-xl border border-border p-4 text-center">
              {addon.badge && (
                <Badge className="mb-2 bg-primary text-primary-foreground border-0 text-[10px]">
                  {addon.badge}
                </Badge>
              )}
              <p className="text-sm font-bold text-foreground-strong">{addon.name}</p>
              <p className="text-xl font-extrabold tabular-nums mt-1">{addon.price}</p>
              <p className="text-xs text-foreground-muted mt-1">{addon.description}</p>
              <Button
                size="sm"
                className="mt-3 w-full"
                variant={addon.badge === "Popular" ? "default" : "outline"}
                onClick={() => handleAddonSelect(addon)}
                disabled={myListings.length === 0}
              >
                Promote
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
