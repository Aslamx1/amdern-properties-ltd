import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { z } from "zod";
import prisma from "../config/db";
import { Role } from "@prisma/client";
import {
  getCollectionStatus,
  initiateCollection,
  normalizeWalletId,
  type CollectionResponse,
  type Currency,
  type TransactionChargesCategory,
} from "../services/iotec-pay";

const PAYMENT_ITEMS = {
  subscription: {
    Premium: { amount: 150000, period: "/mo" },
    "Premium Plus": { amount: 450000, period: "/mo" },
  },
  promotion: {
    "Featured Promotion": { amount: 75000, validAmounts: [75000] },
    "Premium Plus Promotion": { amount: 250000, validAmounts: [100000, 250000] },
    "Bump Up Promotion": { amount: 25000, validAmounts: [25000, 50000] },
  },
} as const;

type CatalogEntry = {
  amount: number;
  period?: string;
  validAmounts?: readonly number[];
};

const initiateSchema = z.object({
  type: z.enum(["subscription", "promotion"]),
  item: z.string().min(1).max(150),
  amount: z.number().min(500).max(1000000000),
  method: z.enum(["mobile-money", "card"]),
  payer: z.string().min(1).max(100),
  payerName: z.string().max(150).optional(),
  period: z.string().max(50).optional(),
  listingId: z.string().max(100).optional(),
  listingRef: z.string().max(100).optional(),
});

type PaymentRecord = Awaited<ReturnType<typeof prisma.paymentTransaction.findUnique>>;

function json(value: unknown): string {
  return JSON.stringify(value);
}

function terminalStatus(status?: string | null): boolean {
  return status === "Success" || status === "Failed" || status === "Cancelled" || status === "Rejected" || status === "RolledBack";
}

function getCatalogEntry(type: "subscription" | "promotion", item: string): CatalogEntry | null {
  if (type === "subscription") {
    const entry = PAYMENT_ITEMS.subscription[item as keyof typeof PAYMENT_ITEMS.subscription];
    return entry ? { amount: entry.amount, period: entry.period } : null;
  }
  if (type === "promotion") {
    const entry = PAYMENT_ITEMS.promotion[item as keyof typeof PAYMENT_ITEMS.promotion];
    return entry ? { amount: entry.amount, validAmounts: entry.validAmounts } : null;
  }
  return null;
}

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("256") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `256${digits.slice(1)}`;
  if (digits.length === 9) return `256${digits}`;
  return digits;
}

function isHttpOrHttpsUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const protocol = new URL(value).protocol;
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

export function publicPayment(payment: NonNullable<PaymentRecord>) {
  return {
    id: payment.id,
    type: payment.type,
    item: payment.item,
    amount: payment.amount,
    currency: payment.currency,
    method: payment.method,
    status: payment.status,
    statusCode: payment.statusCode,
    statusMessage: payment.statusMessage,
    externalId: payment.externalId,
    providerTransactionId: payment.providerTransactionId,
    cardRedirectUrl: payment.cardRedirectUrl,
    redirectUrl: payment.redirectUrl,
    createdAt: payment.createdAt,
    paidAt: payment.paidAt,
  };
}

export async function fulfillPayment(payment: NonNullable<PaymentRecord>): Promise<void> {
  if (payment.fulfillmentStatus === "Fulfilled") return;

  const paidAt = payment.paidAt ?? new Date();

  if (payment.type === "subscription") {
    const durationDays = payment.period?.toLowerCase().includes("/yr") ? 365 : 30;
    const subscriptionExpiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
    await prisma.user.update({
      where: { id: payment.userId },
      data: {
        subscriptionPlan: payment.item,
        subscriptionStatus: "active",
        subscriptionExpiresAt,
      },
    });
  }

  if (payment.type === "promotion" && payment.listingId) {
    await prisma.property.updateMany({
      where: { id: payment.listingId, userId: payment.userId },
      data: {
        isFeatured: true,
        featuredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  await prisma.paymentTransaction.update({
    where: { id: payment.id },
    data: {
      fulfillmentStatus: "Fulfilled",
      paidAt,
    },
  });
}

async function applyProviderStatus(
  payment: NonNullable<PaymentRecord>,
  provider: CollectionResponse
): Promise<NonNullable<PaymentRecord>> {
  const data: {
    status: string;
    statusCode?: string;
    statusMessage?: string;
    cardRedirectUrl?: string | null;
    redirectUrl?: string | null;
    paidAt?: Date;
  } = {
    status: provider.status,
  };

  if (provider.statusCode !== undefined) data.statusCode = provider.statusCode ?? undefined;
  if (provider.statusMessage !== undefined) data.statusMessage = provider.statusMessage ?? undefined;
  if (provider.cardRedirectUrl !== undefined) data.cardRedirectUrl = provider.cardRedirectUrl;
  if (provider.redirectUrl !== undefined) data.redirectUrl = provider.redirectUrl;
  if (provider.status === "Success") data.paidAt = payment.paidAt ?? new Date();

  const updated = await prisma.paymentTransaction.update({
    where: { id: payment.id },
    data,
  });

  if (provider.status === "Success") await fulfillPayment(updated);
  return updated;
}

function paymentError(res: Response, message: string, status = 500): void {
  res.status(status).json({ error: message });
}

export async function initiatePayment(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      paymentError(res, "Authentication required", 401);
      return;
    }

    const parsed = initiateSchema.safeParse(req.body);
    if (!parsed.success) {
      paymentError(res, parsed.error.errors[0]?.message || "Invalid payment request", 400);
      return;
    }

    const input = parsed.data;
    const catalogEntry = getCatalogEntry(input.type, input.item);
    const isValidAmount =
      Boolean(catalogEntry) &&
      (catalogEntry?.amount === input.amount ||
        Boolean(catalogEntry?.validAmounts && catalogEntry.validAmounts.includes(input.amount)));

    if (!catalogEntry || !isValidAmount) {
      paymentError(res, "Payment amount does not match the selected product", 400);
      return;
    }

    const missingProviderConfig = [
      "IOTEC_PAY_CLIENT_ID",
      "IOTEC_PAY_CLIENT_SECRET",
      "IOTEC_PAY_WALLET_ID",
    ].filter((key) => !process.env[key] || !process.env[key]?.trim());

    let walletId: string | null = null;
    if (missingProviderConfig.length === 0) {
      try {
        walletId = normalizeWalletId(process.env.IOTEC_PAY_WALLET_ID);
      } catch {
        walletId = null;
      }
    }

    const payer =
      input.method === "card"
        ? (input.payer.trim().toLowerCase() || req.user.email?.toLowerCase() || "")
        : normalizePhone(input.payer);

    if (!payer) {
      paymentError(res, "Payer details are required", 400);
      return;
    }

    if (input.method === "card" && !payer.includes("@")) {
      paymentError(res, "A valid customer email address is required for card payments", 400);
      return;
    }

    const externalId = `amdern-${req.user.id.slice(0, 8)}-${Date.now().toString(36)}-${randomUUID().slice(0, 8)}`;
    const configuredRedirectUrl = process.env.IOTEC_PAY_REDIRECT_URL;
    const redirectUrl = isHttpOrHttpsUrl(configuredRedirectUrl) ? configuredRedirectUrl : undefined;
    const chargesCategory: TransactionChargesCategory = "ChargeWallet";
    const metadata = {
      type: input.type,
      item: input.item,
      period: input.period ?? catalogEntry.period,
      listingId: input.listingId,
      listingRef: input.listingRef,
    };

    const payment = await prisma.paymentTransaction.create({
      data: {
        userId: req.user.id,
        userEmail: req.user.email || undefined,
        type: input.type,
        item: input.item,
        amount: input.amount,
        currency: process.env.IOTEC_PAY_CURRENCY || "UGX",
        method: input.method,
        externalId,
        payer,
        payerName: input.payerName?.trim() || undefined,
        period: input.period ?? catalogEntry.period,
        listingId: input.listingId || undefined,
        listingRef: input.listingRef || undefined,
        redirectUrl,
        metadata: json(metadata),
      },
    });

    let automatedSuccess = false;
    let providerResponse: CollectionResponse | null = null;

    if (walletId && missingProviderConfig.length === 0) {
      try {
        const provider = await initiateCollection({
          category: input.method === "card" ? "Card" : "MobileMoney",
          amount: input.amount,
          payer,
          payerName: input.payerName?.trim() || req.user.name,
          currency: (process.env.IOTEC_PAY_CURRENCY || "UGX") as Currency,
          walletId,
          externalId,
          payerNote: `Amdern Properties ${input.type} payment`,
          payeeNote: `${input.item}${input.listingRef ? ` | ${input.listingRef}` : ""}`,
          channel: "AmdernProperties",
          transactionChargesCategory: chargesCategory,
          ...(redirectUrl ? { redirectUrl } : {}),
        });

        if (provider && provider.id) {
          automatedSuccess = true;
          providerResponse = provider;
        }
      } catch (gatewayError) {
        console.warn(
          "[Payment Gateway Warning]: Automated collection skipped/failed, using resilient Mobile Money flow:",
          gatewayError instanceof Error ? gatewayError.message : gatewayError
        );
      }
    }

    if (automatedSuccess && providerResponse) {
      const updated = await applyProviderStatus(payment, providerResponse);
      res.status(200).json({
        payment: publicPayment(updated),
        cardRedirectUrl: updated.cardRedirectUrl,
        redirectUrl: updated.redirectUrl,
      });
      return;
    }

    // Resilient fallback: Provide recorded transaction and direct instructions
    const fallbackPayment = await prisma.paymentTransaction.update({
      where: { id: payment.id },
      data: {
        status: "Pending",
        statusCode: "manual_verification",
        statusMessage: "Awaiting payment receipt via MTN/Airtel Mobile Money or Bank Transfer.",
      },
    });

    res.status(200).json({
      payment: publicPayment(fallbackPayment),
      manualInstructions: true,
      message: "Payment order recorded successfully.",
      merchantDetails: {
        company: "AMDERN PROPERTIES SMC LIMITED",
        mtnMomo: "+256 702 104 499",
        airtelMoney: "+256 786 793 139",
        whatsapp: "256702104499",
        reference: fallbackPayment.externalId,
        amount: fallbackPayment.amount,
        currency: fallbackPayment.currency,
      },
    });
  } catch (error) {
    console.error("[Payment Request Error]:", error);
    paymentError(res, "Invalid payment request");
  }
}

export async function getPaymentStatus(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      paymentError(res, "Authentication required", 401);
      return;
    }

    let payment = await prisma.paymentTransaction.findUnique({
      where: { id: req.params.id },
    });

    if (!payment) {
      payment = await prisma.paymentTransaction.findFirst({
        where: { externalId: req.params.id },
      });
    }

    if (!payment) {
      paymentError(res, "Payment not found", 404);
      return;
    }

    if (payment.userId !== req.user.id && req.user.role !== Role.ADMIN) {
      paymentError(res, "Forbidden", 403);
      return;
    }

    let current = payment;
    if (payment.providerTransactionId && !terminalStatus(payment.status)) {
      try {
        const provider = await getCollectionStatus(payment.providerTransactionId);
        current = await applyProviderStatus(payment, provider);
      } catch (error) {
        console.warn("[Payment Status Refresh Warning]:", (error as Error)?.message);
      }
    }

    res.json({ payment: publicPayment(current) });
  } catch (error) {
    console.error("[Payment Status Error]:", error);
    paymentError(res, "Unable to load payment status");
  }
}

export async function handlePaymentCallback(req: Request, res: Response): Promise<void> {
  const callbackSecret = process.env.IOTEC_PAY_CALLBACK_SECRET;
  const authorization = req.headers.authorization;
  const secretHeader = req.headers["x-iotec-pay-secret"];

  if (!callbackSecret || (authorization !== `Bearer ${callbackSecret}` && secretHeader !== callbackSecret)) {
    res.status(401).json({ error: "Unauthorized callback" });
    return;
  }

  try {
    const payload = req.body as Record<string, unknown>;
    const providerTransactionId = typeof payload.id === "string" ? payload.id : null;
    const externalId = typeof payload.externalId === "string" ? payload.externalId : null;
    if (!providerTransactionId && !externalId) {
      res.status(400).json({ error: "Callback payload is missing transaction identifiers" });
      return;
    }

    const payment = await prisma.paymentTransaction.findFirst({
      where: {
        OR: [
          ...(providerTransactionId ? [{ providerTransactionId }] : []),
          ...(externalId ? [{ externalId }] : []),
        ],
      },
    });

    if (!payment) {
      res.status(404).json({ error: "Payment not found" });
      return;
    }

    const status = typeof payload.status === "string" ? payload.status : null;
    if (!status) {
      res.status(400).json({ error: "Callback payload is missing status" });
      return;
    }

    if (
      (typeof payload.amount === "number" && payload.amount !== payment.amount) ||
      (typeof payload.currency === "string" && payload.currency !== payment.currency)
    ) {
      res.status(400).json({ error: "Callback payload does not match payment" });
      return;
    }

    const data: {
      status: string;
      statusCode?: string;
      statusMessage?: string;
      providerTransactionId?: string;
      paidAt?: Date;
    } = { status };

    if (providerTransactionId) data.providerTransactionId = providerTransactionId;
    if (typeof payload.statusCode === "string") data.statusCode = payload.statusCode;
    if (typeof payload.statusMessage === "string") data.statusMessage = payload.statusMessage;
    if (status === "Success") data.paidAt = payment.paidAt ?? new Date();

    const updated = await prisma.paymentTransaction.update({
      where: { id: payment.id },
      data,
    });

    if (status === "Success") await fulfillPayment(updated);

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("[Payment Callback Error]:", error);
    res.status(500).json({ error: "Unable to process callback" });
  }
}
