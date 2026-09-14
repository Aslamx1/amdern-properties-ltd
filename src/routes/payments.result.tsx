import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle, ArrowLeft, Copy, Check, MessageCircle, PhoneCall } from "lucide-react";
import { Page, PageHero } from "@/components/site/Page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getMe, getAuthHeaders } from "@/lib/api-auth";
import { API_BASE_URL } from "@/lib/api-backend";
import { SITE, getWhatsAppLink } from "@/lib/site";

type PaymentStatusRecord = {
  id: string;
  type?: string;
  item?: string;
  amount?: number;
  currency?: string;
  status?: string;
  statusCode?: string | null;
  statusMessage?: string | null;
  externalId?: string | null;
  createdAt?: string;
  paidAt?: string | null;
};

export const Route = createFileRoute("/payments/result")({
  validateSearch: (search: Record<string, unknown>) => ({
    paymentId:
      typeof search["paymentId"] === "string" && search["paymentId"].trim() ? search["paymentId"] : undefined,
  }),
  component: PaymentResultPage,
});

function PaymentResultPage() {
  const search = Route.useSearch();
  const [payment, setPayment] = useState<PaymentStatusRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const paymentId =
          search.paymentId || localStorage.getItem("amdern_last_payment_id") || localStorage.getItem("amdern_payment_id");

        if (!paymentId) {
          throw new Error("No payment reference was found.");
        }

        try {
          await getMe();
        } catch {
          // Proceed with stored token
        }

        const response = await fetch(`${API_BASE_URL}/api/payments/status/${encodeURIComponent(paymentId)}`, {
          credentials: "include",
          headers: getAuthHeaders({
            Accept: "application/json",
          }),
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload?.error || "Unable to load payment status.");
        }

        if (!cancelled) {
          setPayment(payload.payment || null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load payment status.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [search.paymentId]);

  const status = payment?.status || "Pending";
  const isSuccess = status.toLowerCase() === "success";
  const isPending = status.toLowerCase() === "pending" || status.toLowerCase() === "senttovendor";

  return (
    <Page>
      <PageHero
        eyebrow="Billing"
        title={isSuccess ? "Payment confirmed" : isPending ? "Payment in progress" : "Payment needs attention"}
        subtitle={
          isSuccess
            ? "Your subscription or promotion has been captured and is being finalized."
            : isPending
              ? "We’ve received the payment request and are waiting for the provider to confirm the transaction."
              : "The payment has not completed successfully yet. Please review the status or contact support."
        }
      />

      <div className="container-page py-10">
        <Card className="mx-auto max-w-2xl p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Checking your payment status...</p>
            </div>
          ) : error ? (
            <div className="space-y-4 text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
              <div>
                <h3 className="text-xl font-bold text-foreground-strong">Payment status unavailable</h3>
                <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              </div>
              <Link to="/dashboard/subscription" className="btn-base btn-primary inline-flex">
                <ArrowLeft className="h-4 w-4" /> Back to subscriptions
              </Link>
            </div>
          ) : payment ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Payment reference
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-foreground-strong">{payment.id}</p>
                </div>
                <Badge
                  className={
                    isSuccess
                      ? "border-success/30 bg-success/10 text-success"
                      : isPending
                        ? "border-warning/30 bg-warning/10 text-warning"
                        : "border-destructive/30 bg-destructive/10 text-destructive"
                  }
                >
                  {status}
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-secondary p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Item</p>
                  <p className="mt-2 text-base font-bold text-foreground-strong">{payment.item || "Subscription"}</p>
                </div>
                <div className="rounded-lg bg-secondary p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Amount</p>
                  <p className="mt-2 text-base font-bold text-foreground-strong">
                    {payment.amount ? `${payment.currency || "UGX"} ${payment.amount.toLocaleString("en-US")}` : "—"}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  {isSuccess ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : isPending ? (
                    <LoaderCircle className="h-5 w-5 animate-spin text-warning" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  <span>
                    {isSuccess
                      ? "Your transaction was successful. The subscription or promotion will be activated shortly."
                      : isPending
                        ? payment.statusMessage || "The payment is still being processed by the provider."
                        : payment.statusMessage || "This payment did not complete successfully."}
                  </span>
                </div>
              </div>

              {payment.externalId && (
                <div className="flex items-center justify-between rounded-lg bg-secondary/80 p-3 text-xs">
                  <span>
                    Transaction Reference: <strong className="font-mono text-sm">{payment.externalId}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (payment.externalId) {
                        void navigator.clipboard.writeText(payment.externalId);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded bg-background px-2.5 py-1 text-xs font-semibold shadow-sm hover:bg-secondary"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy Reference"}
                  </button>
                </div>
              )}

              {isPending && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4">
                  <div className="flex items-center gap-2 font-bold text-foreground-strong">
                    <PhoneCall className="h-5 w-5 text-primary" />
                    <h4>Direct Mobile Money Payment Details</h4>
                  </div>
                  <div className="grid gap-2 text-sm text-foreground-muted sm:grid-cols-2">
                    <div className="rounded-lg bg-background p-3 border border-border">
                      <p className="font-bold text-foreground-strong">MTN Mobile Money</p>
                      <p className="font-mono text-base font-bold text-primary mt-1">+256 702 104 499</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Alt: +256 786 793 139</p>
                    </div>
                    <div className="rounded-lg bg-background p-3 border border-border">
                      <p className="font-bold text-foreground-strong">Airtel Money</p>
                      <p className="font-mono text-base font-bold text-primary mt-1">+256 702 104 499</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Name: AMDERN PROPERTIES SMC LTD</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Please use reference <strong>{payment.externalId || payment.id}</strong> in your payment reason. After sending, click below to notify our team for instant confirmation.
                  </p>
                  <Button asChild className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white">
                    <a
                      href={getWhatsAppLink(
                        SITE.whatsapp,
                        `Hello AMDERN PROPERTIES SMC LTD,\nI have submitted payment for: ${payment.item || "Subscription"}\nAmount: ${payment.currency || "UGX"} ${(payment.amount || 0).toLocaleString("en-US")}\nReference: ${payment.externalId || payment.id}\n\nPlease confirm and activate my account.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" /> Confirm via WhatsApp with AMDERN Team
                    </a>
                  </Button>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Link to="/dashboard/subscription" className="btn-base btn-primary flex-1 justify-center">
                  <ArrowLeft className="h-4 w-4" /> Go to subscriptions
                </Link>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setLoading(true);
                    window.location.reload();
                  }}
                >
                  Refresh Status
                </Button>
                <Button asChild className="flex-1" variant="ghost">
                  <a href="/dashboard">Open dashboard</a>
                </Button>
              </div>
            </div>
          ) : null}
        </Card>
      </div>
    </Page>
  );
}
