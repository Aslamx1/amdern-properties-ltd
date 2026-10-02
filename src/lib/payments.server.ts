/**
 * Server-side payment processing and resilient fallback handler for Amdern Properties.
 * Runs in both Cloudflare Workers and Node.js environments.
 */

export interface PaymentRecord {
  id: string;
  externalId: string;
  type: "subscription" | "promotion" | string;
  item: string;
  amount: number;
  currency: string;
  method: "mobile-money" | "card" | "bank-transfer" | string;
  payer: string;
  payerName?: string;
  period?: string;
  listingId?: string;
  listingRef?: string;
  status: "Pending" | "SentToVendor" | "Success" | "Failed";
  statusCode?: string;
  statusMessage?: string;
  cardRedirectUrl?: string | null;
  redirectUrl?: string | null;
  createdAt: string;
  paidAt?: string | null;
}

// In-memory transaction store for server instances
const paymentStore = new Map<string, PaymentRecord>();

const OFFICIAL_MERCHANT = {
  company: "AMDERN PROPERTIES SMC LIMITED",
  mtnMomo: "+256 702 104 499",
  airtelMoney: "+256 786 793 139",
  whatsapp: "+256 702 104 499",
  email: "amdernsmcpropertiesltd@gmail.com",
};

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("256") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `256${digits.slice(1)}`;
  if (digits.length === 9) return `256${digits}`;
  return digits;
}

function normalizeWalletId(walletId?: string | null): string {
  const raw = (walletId || "").trim();
  if (!raw) return "";
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(raw)) return raw;
  const clean = raw.replace(/[^0-9a-f]/gi, "");
  if (clean.length === 32) {
    return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20, 32)}`;
  }
  return raw;
}

function generatePaymentReference(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AMD-PAY-${ts}-${rand}`;
}

async function tryIotecPayCollection(input: {
  category: "MobileMoney" | "Card";
  amount: number;
  payer: string;
  payerName?: string;
  externalId: string;
  item: string;
  type: string;
  redirectUrl?: string;
}): Promise<{ success: boolean; redirectUrl?: string; cardRedirectUrl?: string; id?: string }> {
  const clientId = process.env.IOTEC_PAY_CLIENT_ID;
  const clientSecret = process.env.IOTEC_PAY_CLIENT_SECRET;
  const rawWalletId = process.env.IOTEC_PAY_WALLET_ID;
  const authUrl = process.env.IOTEC_PAY_AUTH_URL || "https://id.iotec.io/connect/token";
  const apiUrl = process.env.IOTEC_PAY_API_URL || "https://pay.iotec.io";

  if (!clientId || !clientSecret || !rawWalletId) {
    return { success: false };
  }

  const walletId = normalizeWalletId(rawWalletId);
  if (!walletId) {
    return { success: false };
  }

  try {
    const authParams = new URLSearchParams({
      client_id: clientId.trim(),
      client_secret: clientSecret.trim(),
      grant_type: "client_credentials",
    });

    const tokenRes = await fetch(authUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: authParams.toString(),
      signal: AbortSignal.timeout(6000),
    });

    if (!tokenRes.ok) {
      console.warn("[ioTec Pay Auth]: Status", tokenRes.status);
      return { success: false };
    }

    const tokenData = (await tokenRes.json()) as { access_token?: string };
    if (!tokenData?.access_token) {
      return { success: false };
    }

    const endpoint =
      input.category === "Card" ? "/api/collections/collect/card" : "/api/collections/collect";

    const collectRes = await fetch(`${apiUrl}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: input.amount,
        payer: input.payer,
        payerName: input.payerName,
        category: input.category,
        currency: process.env.IOTEC_PAY_CURRENCY || "UGX",
        walletId,
        externalId: input.externalId,
        payerNote: `Amdern Properties ${input.type} payment`,
        payeeNote: input.item,
        channel: "AmdernProperties",
        transactionChargesCategory: "ChargeWallet",
        ...(input.redirectUrl ? { redirectUrl: input.redirectUrl } : {}),
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!collectRes.ok) {
      console.warn("[ioTec Pay Collect]: Status", collectRes.status);
      return { success: false };
    }

    const collectData = (await collectRes.json()) as {
      id?: string;
      redirectUrl?: string;
      cardRedirectUrl?: string;
    };

    return {
      success: true,
      id: collectData.id,
      redirectUrl: collectData.redirectUrl,
      cardRedirectUrl: collectData.cardRedirectUrl,
    };
  } catch (err) {
    console.warn("[ioTec Pay Gateway Warning]:", err instanceof Error ? err.message : err);
    return { success: false };
  }
}

export async function handleInitiatePayment(request: Request): Promise<Response> {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const type = typeof body["type"] === "string" ? body["type"] : "subscription";
    const item = typeof body["item"] === "string" ? body["item"] : "Subscription Plan";
    const amount = typeof body["amount"] === "number" ? body["amount"] : Number(body["amount"]) || 0;
    const method = typeof body["method"] === "string" ? body["method"] : "mobile-money";
    const rawPayer = typeof body["payer"] === "string" ? body["payer"].trim() : "";
    const payerName = typeof body["payerName"] === "string" ? body["payerName"].trim() : "Valued Customer";
    const period = typeof body["period"] === "string" ? body["period"] : "/mo";
    const listingId = typeof body["listingId"] === "string" ? body["listingId"] : undefined;
    const listingRef = typeof body["listingRef"] === "string" ? body["listingRef"] : undefined;

    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: "A valid payment amount is required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const payer = method === "card" ? rawPayer.toLowerCase() : normalizePhone(rawPayer);

    if (!payer) {
      return new Response(JSON.stringify({ error: "Payer contact details are required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const externalId = generatePaymentReference();
    const configuredRedirect =
      process.env.IOTEC_PAY_REDIRECT_URL || "https://amdernpropertiessmclimited.com/payments/result";

    // Attempt ioTec Pay if configured
    const iotecResult = await tryIotecPayCollection({
      category: method === "card" ? "Card" : "MobileMoney",
      amount,
      payer,
      payerName,
      externalId,
      item,
      type,
      redirectUrl: `${configuredRedirect}?paymentId=${externalId}`,
    });

    const record: PaymentRecord = {
      id: externalId,
      externalId,
      type,
      item,
      amount,
      currency: "UGX",
      method,
      payer,
      payerName,
      period,
      listingId,
      listingRef,
      status: "Pending",
      statusCode: iotecResult.success ? "sent_to_vendor" : "awaiting_momo_transfer",
      statusMessage: iotecResult.success
        ? "Payment initiated with gateway. Complete on your phone/card to finish."
        : "Payment request recorded. Please complete payment via MTN/Airtel Mobile Money and confirm with Amdern.",
      cardRedirectUrl: iotecResult.cardRedirectUrl || null,
      redirectUrl: iotecResult.redirectUrl || null,
      createdAt: new Date().toISOString(),
      paidAt: null,
    };

    // Save in memory store
    paymentStore.set(externalId, record);

    return new Response(
      JSON.stringify({
        payment: record,
        cardRedirectUrl: record.cardRedirectUrl,
        redirectUrl: record.redirectUrl,
        manualInstructions: true,
        message: "Payment order recorded successfully.",
        merchantDetails: {
          ...OFFICIAL_MERCHANT,
          reference: externalId,
          amount,
          currency: "UGX",
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[Initiate Payment Error]:", error);
    const message = error instanceof Error ? error.message : "Unable to initiate payment.";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function handleGetPaymentStatus(_request: Request, id: string): Promise<Response> {
  try {
    const cleanId = decodeURIComponent(id || "").trim();

    if (!cleanId) {
      return new Response(JSON.stringify({ error: "Missing payment reference." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check store
    let record = paymentStore.get(cleanId);

    // If not found directly, search through values
    if (!record) {
      for (const val of paymentStore.values()) {
        if (val.id === cleanId || val.externalId === cleanId) {
          record = val;
          break;
        }
      }
    }

    // If record isn't in memory (e.g. worker rebooted), synthesize standard pending state
    if (!record) {
      record = {
        id: cleanId,
        externalId: cleanId,
        type: "subscription",
        item: "Subscription / Promotion Upgrade",
        amount: 0,
        currency: "UGX",
        method: "mobile-money",
        payer: "",
        status: "Pending",
        statusCode: "manual_verification",
        statusMessage:
          "Payment request recorded. Complete transfer via MTN/Airtel Mobile Money and notify the Amdern accounts desk.",
        createdAt: new Date().toISOString(),
        paidAt: null,
      };
    }

    return new Response(
      JSON.stringify({
        payment: record,
        merchantDetails: {
          ...OFFICIAL_MERCHANT,
          reference: record.externalId || record.id,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[Get Payment Status Error]:", error);
    const message = error instanceof Error ? error.message : "Unable to retrieve payment status.";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
