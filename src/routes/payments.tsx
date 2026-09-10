import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Landmark,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Page, PageHero } from "@/components/site/Page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { SITE, getMailtoLink, getWhatsAppLink } from "@/lib/site";

type PaymentType = "subscription" | "promotion";
type PaymentMethod = "mobile-money" | "bank-transfer" | "card";

type PaymentSearch = {
  type?: PaymentType;
  item?: string;
  amount?: number;
  period?: string;
  listingId?: string;
  listingRef?: string;
};

export const Route = createFileRoute("/payments")({
  beforeLoad: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw redirect({ to: "/signin" });
    }
  },
  validateSearch: (search: Record<string, unknown>): PaymentSearch => {
    const result: PaymentSearch = {};
    const rawType = search["type"];

    if (rawType === "subscription" || rawType === "promotion") {
      result.type = rawType;
    }

    if (typeof search["item"] === "string" && search["item"].trim()) {
      result.item = search["item"].trim();
    }

    const rawAmount = search["amount"];
    const amount =
      typeof rawAmount === "number"
        ? rawAmount
        : typeof rawAmount === "string"
          ? Number(rawAmount)
          : undefined;

    if (typeof amount === "number" && Number.isFinite(amount) && amount > 0) {
      result.amount = amount;
    }

    if (typeof search["period"] === "string" && search["period"].trim()) {
      result.period = search["period"].trim();
    }

    if (typeof search["listingId"] === "string" && search["listingId"].trim()) {
      result.listingId = search["listingId"].trim();
    }

    if (typeof search["listingRef"] === "string" && search["listingRef"].trim()) {
      result.listingRef = search["listingRef"].trim();
    }

    return result;
  },
  head: () => ({
    meta: [
      { title: "Payment — Amdern Properties SMC Limited" },
      {
        name: "description",
        content:
          "Review your subscription or promotion and complete payment with AMDERN PROPERTIES SMC LTD.",
      },
      { property: "og:title", content: "Payment — Amdern Properties SMC Limited" },
      {
        property: "og:description",
        content: "Complete your AMDERN PROPERTIES SMC LTD subscription or promotion payment.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://amdernpropertiessmclimited.com/payments" }],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [method, setMethod] = useState<PaymentMethod>("mobile-money");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setEmail(session.user.email);
      }
      if (session?.user?.phone) {
        setPhone(session.user.phone);
      }
    });
  }, []);

  const handleSubmitPayment = async () => {
    if (!search.item || !search.amount) return;

    const requestMethod = method === "card" ? "card" : "mobile-money";

    setPaymentError(null);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("Please sign in again to complete payment.");
      }

      const payer =
        requestMethod === "mobile-money"
          ? phone.trim()
          : (email.trim() || session.user?.email || "");

      if (requestMethod === "mobile-money" && !payer) {
        setPaymentError("Enter the mobile money number to continue.");
        return;
      }

      if (requestMethod === "card" && (!payer || !payer.includes("@"))) {
        setPaymentError("Please enter a valid billing email address for card payment.");
        return;
      }

      setIsSubmitting(true);

      const payload = {
        type: search.type,
        item: search.item,
        amount: search.amount,
        method: requestMethod,
        payer,
        payerName:
          session.user?.user_metadata?.full_name ||
          session.user?.email?.split("@")[0] ||
          "Customer",
        period: search.period,
        listingId: search.listingId,
        listingRef: search.listingRef,
      };

      const response = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch {
        // Payload wasn't JSON
      }

      if (!response.ok) {
        const fallbackMsg =
          response.status === 502 || response.status === 504
            ? "Payment service is currently unavailable. Please make sure the backend server is running."
            : `Unable to initiate payment (HTTP ${response.status}).`;
        throw new Error(data?.error || fallbackMsg);
      }


      const payment = data?.payment;
      const redirectUrl = payment?.cardRedirectUrl || payment?.redirectUrl;

      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      const createdId = payment?.id || null;
      setPaymentId(createdId);

      if (createdId) {
        localStorage.setItem("amdern_last_payment_id", createdId);
        localStorage.setItem("amdern_payment_id", createdId);
        void navigate({
          to: "/payments/result",
          search: { paymentId: createdId },
        });
        return;
      }

      setPaymentError("Payment request created successfully. We will confirm it as soon as it is processed.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to initiate payment.";
      setPaymentError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!search.item || !search.amount) {
    return (
      <Page>
        <PageHero
          eyebrow="Billing"
          title="Payment details unavailable"
          subtitle="Return to your subscription page and select a plan or promotion again."
        />
        <div className="container-page py-10">
          <Card className="mx-auto max-w-xl p-8 text-center">
            <Link to="/dashboard/subscription" className="btn-base btn-primary inline-flex">
              <ArrowLeft className="h-4 w-4" /> Back to Subscription
            </Link>
          </Card>
        </div>
      </Page>
    );
  }

  const isPromotion = search.type === "promotion";
  const formattedAmount = search.amount.toLocaleString("en-US");
  const period = search.period?.replace(/^\/+/, "");

  const buildPaymentMessage = (mobilePhone?: string) => {
    const lines = [
      "Hello AMDERN PROPERTIES SMC LTD,",
      "I would like to complete a payment from your website.",
      "",
      `Payment type: ${isPromotion ? "Listing promotion" : "Subscription"}`,
      `Item: ${search.item}`,
      `Amount: UGX ${formattedAmount}`,
    ];

    if (period) {
      lines.push(`Period: ${period}`);
    }

    if (search.listingRef) {
      lines.push(`Listing reference: ${search.listingRef}`);
    }

    if (mobilePhone) {
      lines.push(`Mobile Money number: ${mobilePhone}`);
    }

    return lines.join("\n");
  };

  const mobileMoneyHref = getWhatsAppLink(SITE.whatsapp, buildPaymentMessage(phone.trim()));
  const cardHref = getWhatsAppLink(SITE.whatsapp, buildPaymentMessage());
  const bankHref = getMailtoLink(`Payment request: ${search.item}`, buildPaymentMessage());

  return (
    <Page>
      <PageHero
        eyebrow="Billing"
        title="Complete your payment"
        subtitle="Review the amount below and choose a payment method. Your plan or promotion remains pending until payment is confirmed."
      />

      <div className="container-page grid gap-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {isPromotion ? "Promotion" : "Subscription"}
                </p>
                <h2 className="mt-1 text-2xl font-extrabold text-foreground-strong">
                  {search.item}
                </h2>
                {search.listingRef && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Listing reference: <strong>{search.listingRef}</strong>
                  </p>
                )}
              </div>
              <Badge className="bg-warning/10 text-warning border-warning/30 shrink-0">
                Pending payment
              </Badge>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-secondary p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Amount due
                </p>
                <p className="mt-1 text-xl font-extrabold text-foreground-strong">
                  UGX {formattedAmount}
                </p>
              </div>
              <div className="rounded-lg bg-secondary p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Duration
                </p>
                <p className="mt-1 text-lg font-bold text-foreground-strong">
                  {period || "One-time"}
                </p>
              </div>
              <div className="rounded-lg bg-secondary p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Status
                </p>
                <p className="mt-1 text-lg font-bold text-foreground-strong">Awaiting payment</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <div>
                <h3 className="text-base font-bold text-foreground-strong">Payment safety</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Confirm payment details with the AMDERN team before sending money. Do not pay an
                  unofficial account.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-foreground-strong">Payment method</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose how you want to complete this payment.
            </p>

            <div className="mt-5 grid gap-3">
              <button
                type="button"
                onClick={() => setMethod("mobile-money")}
                className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                  method === "mobile-money"
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:bg-secondary"
                }`}
              >
                <Smartphone className="h-5 w-5 text-primary" />
                <span>
                  <span className="block text-sm font-bold text-foreground-strong">
                    Mobile Money
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    MTN MoMo or Airtel Money
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMethod("bank-transfer")}
                className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                  method === "bank-transfer"
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:bg-secondary"
                }`}
              >
                <Landmark className="h-5 w-5 text-primary" />
                <span>
                  <span className="block text-sm font-bold text-foreground-strong">
                    Bank transfer
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Request official account details
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMethod("card")}
                className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                  method === "card"
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:bg-secondary"
                }`}
              >
                <CreditCard className="h-5 w-5 text-primary" />
                <span>
                  <span className="block text-sm font-bold text-foreground-strong">
                    Card payment
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Request a secure payment link
                  </span>
                </span>
              </button>
            </div>

            <div className="mt-5">
              {method === "mobile-money" && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleSubmitPayment();
                  }}
                  className="space-y-3"
                >
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Mobile Money number
                    </span>
                    <input
                      required
                      inputMode="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="e.g. +256 700 000 000"
                      className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                    />
                  </label>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Processing payment..." : "Pay with Mobile Money"} 
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              )}

              {method === "bank-transfer" && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Our billing team will send the official bank account details and payment
                    reference.
                  </p>
                  <Button asChild className="w-full">
                    <a href={bankHref}>
                      Request Bank Details <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              )}

              {method === "card" && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleSubmitPayment();
                  }}
                  className="space-y-3"
                >
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Billing Email Address
                    </span>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="e.g. yourname@example.com"
                      className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                    />
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Secure card checkout is handled through ioTec Pay. You will be redirected to complete your card payment.
                  </p>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Processing payment..." : "Pay with Card"}{" "}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              )}

              {(paymentError || paymentId) && (
                <div className="mt-4 rounded-lg border border-border bg-secondary/60 p-3 text-sm text-foreground-strong">
                  {paymentError ? (
                    <p className="text-red-600">{paymentError}</p>
                  ) : (
                    <p>
                      Payment reference: <strong>{paymentId}</strong>
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-success shrink-0" />
              <p className="text-sm text-muted-foreground">
                After payment, the AMDERN team will verify receipt and activate your subscription or
                promotion.
              </p>
            </div>
          </Card>

          <Link to="/dashboard/subscription" className="btn-base btn-outline w-full justify-center">
            <ArrowLeft className="h-4 w-4" /> Return to Subscription
          </Link>
        </div>
      </div>
    </Page>
  );
}
