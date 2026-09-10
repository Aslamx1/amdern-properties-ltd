type TokenResponse = {
  access_token: string;
  expires_in: number;
  token_type?: string;
};

export type CollectionCategory = "MobileMoney" | "Card";

export type TransactionChargesCategory = "ChargeWallet" | "ChargeCustomer";

export type Currency = "ITX" | "UGX" | "USD";

export type BankTransferType = "InternalTransfer" | "Rtgs" | "Eft" | "Swift";

export type PaymentCategory = "MobileMoney" | "WalletToWallet" | "BankTransfer" | "Card";

export type RequestStatus = "Pending" | "SentToVendor" | "Success" | "Failed" | "AwaitingApproval" | "RolledBack" | "Scheduled" | "Cancelled" | "Rejected";

export interface InitiateCollectionInput {
  category: CollectionCategory;
  amount: number;
  payer: string;
  payerName?: string;
  currency: Currency;
  walletId: string;
  externalId: string;
  payerNote: string;
  payeeNote: string;
  channel: string;
  transactionChargesCategory: TransactionChargesCategory;
  redirectUrl?: string;
}

export interface CollectionResponse {
  id: string;
  status: RequestStatus;
  statusCode?: string | null;
  statusMessage?: string | null;
  cardRedirectUrl?: string | null;
  redirectUrl?: string | null;
  externalId?: string | null;
  amount?: number | null;
  currency?: string | null;
  payer?: string;
  payerName?: string;
  payeeNote?: string | null;
  payerNote?: string | null;
  createdAt?: string;
  transactionCharge?: number;
  totalTransactionCharge?: number;
}

export interface DisbursementInput {
  category: "MobileMoney" | "WalletToWallet" | "BankTransfer";
  amount: number;
  payee: string;
  payeeName?: string;
  payeeEmail?: string;
  currency: Currency;
  walletId: string;
  externalId: string;
  payeeNote?: string;
  payerNote?: string;
  channel?: string;
  bankId?: string;
  bankIdentificationCode?: string;
  bankTransferType?: BankTransferType;
  sendAt?: string;
}

export interface BankDisbursementInput {
  amount: number;
  accountName: string;
  accountNumber: string;
  currency: Currency;
  walletId: string;
  externalId: string;
  bankId?: string;
  bankIdentificationCode?: string;
  transferType: BankTransferType;
  channel?: string;
  payeeNote?: string;
  sendAt?: string;
}

export interface DisbursementResponse {
  id: string;
  status: RequestStatus;
  statusCode?: string | null;
  statusMessage?: string | null;
  amount?: number | null;
  currency?: string | null;
  externalId?: string | null;
  payee?: string;
  payeeName?: string;
  createdAt?: string;
  transactionCharge?: number;
  totalTransactionCharge?: number;
}

export interface Bank {
  id: string;
  name: string;
  code: string;
}

export interface WalletBalance {
  walletId: string;
  balance: number;
  currency: Currency;
  lastUpdated: string;
}

export interface PaginatedDisbursementHistory {
  page: number;
  totalPages: number;
  total: number;
  data: DisbursementResponse[];
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface DisbursementHistoryQuery {
  walletId?: string;
  bulkId?: string;
  externalId?: string;
  categories?: PaymentCategory[];
  statuses?: RequestStatus[];
  vendors?: string[];
  statusCodes?: string[];
  partnerId?: string;
  query?: string;
  skip?: number;
  limit?: number;
  page?: number;
  pageSize?: number;
  orderBy?: string;
  order?: "asc" | "desc";
  from?: string;
  to?: string;
}

export class IotecPayError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "IotecPayError";
  }
}

let cachedToken: { value: string; expiresAt: number } | null = null;

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

export function normalizeWalletId(value: string | undefined): string {
  const raw = (value ?? "").trim().replace(/^['"]|['"]$/g, "");
  if (!raw) {
    throw new Error("Missing IOTEC_PAY_WALLET_ID");
  }

  const urlMatch = raw.match(/https?:\/\/[^/]+\/p\/([^/?#]+)/i);
  const uuidMatch = raw.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
  const normalized = (urlMatch?.[1] ?? uuidMatch?.[0] ?? raw).trim();

  if (!normalized) {
    throw new Error("Missing IOTEC_PAY_WALLET_ID");
  }

  return normalized;
}

async function requestJson<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const text = await response.text();
  let payload: unknown = text;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    let message = `ioTec Pay request failed with status ${response.status}`;
    if (typeof payload === "string") {
      message = payload;
    } else if (typeof payload === "object" && payload !== null) {
      const p = payload as Record<string, unknown>;
      message = String(p.message || p.error || p.detail || p.title || message);
    }
    throw new IotecPayError(message || `ioTec Pay request failed with status ${response.status}`, response.status);
  }

  return payload as T;
}

export async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 30_000) {
    return cachedToken.value;
  }

  const authUrl = process.env.IOTEC_PAY_AUTH_URL || "https://id.iotec.io/connect/token";
  const payload = new URLSearchParams({
    client_id: requiredEnv("IOTEC_PAY_CLIENT_ID"),
    client_secret: requiredEnv("IOTEC_PAY_CLIENT_SECRET"),
    grant_type: "client_credentials",
  });

  const token = await requestJson<TokenResponse>(authUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload,
  });

  if (!token.access_token) {
    throw new IotecPayError("ioTec Pay did not return an access token", 502);
  }

  const expiresIn = Number(token.expires_in) || 300;
  cachedToken = {
    value: token.access_token,
    expiresAt: now + expiresIn * 1000 - 30_000,
  };

  return cachedToken.value;
}

export async function initiateCollection(input: InitiateCollectionInput): Promise<CollectionResponse> {
  const apiUrl = process.env.IOTEC_PAY_API_URL || "https://pay.iotec.io";
  const endpoint = input.category === "Card" ? "/api/collections/collect/card" : "/api/collections/collect";
  const body: Record<string, unknown> = {
    amount: input.amount,
    payer: input.payer,
    category: input.category,
    currency: input.currency,
    walletId: input.walletId,
    externalId: input.externalId,
    payerNote: input.payerNote,
    payeeNote: input.payeeNote,
    channel: input.channel,
    transactionChargesCategory: input.transactionChargesCategory,
  };

  if (input.payerName) body.payerName = input.payerName;
  if (input.redirectUrl) body.redirectUrl = input.redirectUrl;

  const accessToken = await getAccessToken();
  return requestJson<CollectionResponse>(`${apiUrl}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export async function getCollectionStatus(requestId: string): Promise<CollectionResponse> {
  const apiUrl = process.env.IOTEC_PAY_API_URL || "https://pay.iotec.io";
  const accessToken = await getAccessToken();
  return requestJson<CollectionResponse>(`${apiUrl}/api/collections/status/${encodeURIComponent(requestId)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
}

export async function getCollectionStatusByExternalId(externalId: string): Promise<CollectionResponse> {
  const apiUrl = process.env.IOTEC_PAY_API_URL || "https://pay.iotec.io";
  const accessToken = await getAccessToken();
  return requestJson<CollectionResponse>(`${apiUrl}/api/collections/external-id/${encodeURIComponent(externalId)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
}

export async function initiateDisbursement(input: DisbursementInput): Promise<DisbursementResponse> {
  const apiUrl = process.env.IOTEC_PAY_API_URL || "https://pay.iotec.io";
  const body: Record<string, unknown> = {
    category: input.category,
    amount: input.amount,
    payee: input.payee,
    currency: input.currency,
    walletId: input.walletId,
    externalId: input.externalId,
    channel: input.channel,
    bankTransferType: input.bankTransferType || "InternalTransfer",
  };

  if (input.payeeName) body.payeeName = input.payeeName;
  if (input.payeeEmail) body.payeeEmail = input.payeeEmail;
  if (input.payeeNote) body.payeeNote = input.payeeNote;
  if (input.payerNote) body.payerNote = input.payerNote;
  if (input.bankId) body.bankId = input.bankId;
  if (input.bankIdentificationCode) body.bankIdentificationCode = input.bankIdentificationCode;
  if (input.sendAt) body.sendAt = input.sendAt;

  const accessToken = await getAccessToken();
  return requestJson<DisbursementResponse>(`${apiUrl}/api/disbursements/disburse`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export async function initiateBankDisbursement(input: BankDisbursementInput): Promise<DisbursementResponse> {
  const apiUrl = process.env.IOTEC_PAY_API_URL || "https://pay.iotec.io";
  const body: Record<string, unknown> = {
    accountName: input.accountName,
    accountNumber: input.accountNumber,
    amount: input.amount,
    walletId: input.walletId,
    externalId: input.externalId,
    currency: input.currency,
    transferType: input.transferType,
  };

  if (input.bankId) body.bankId = input.bankId;
  if (input.bankIdentificationCode) body.bankIdentificationCode = input.bankIdentificationCode;
  if (input.channel) body.channel = input.channel;
  if (input.payeeNote) body.payeeNote = input.payeeNote;
  if (input.sendAt) body.sendAt = input.sendAt;

  const accessToken = await getAccessToken();
  return requestJson<DisbursementResponse>(`${apiUrl}/api/disbursements/bank-disburse`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export async function getDisbursementStatus(transactionId: string): Promise<DisbursementResponse> {
  const apiUrl = process.env.IOTEC_PAY_API_URL || "https://pay.iotec.io";
  const accessToken = await getAccessToken();
  return requestJson<DisbursementResponse>(`${apiUrl}/api/disbursements/status/${encodeURIComponent(transactionId)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
}

export async function getDisbursementStatusByExternalId(externalId: string): Promise<DisbursementResponse> {
  const apiUrl = process.env.IOTEC_PAY_API_URL || "https://pay.iotec.io";
  const accessToken = await getAccessToken();
  return requestJson<DisbursementResponse>(`${apiUrl}/api/disbursements/external-id/${encodeURIComponent(externalId)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
}

export async function getBankList(): Promise<Bank[]> {
  const apiUrl = process.env.IOTEC_PAY_API_URL || "https://pay.iotec.io";
  const accessToken = await getAccessToken();
  return requestJson<Bank[]>(`${apiUrl}/api/disbursements/bank-list`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
}

export async function getWalletBalance(walletId: string): Promise<WalletBalance> {
  const apiUrl = process.env.IOTEC_PAY_API_URL || "https://pay.iotec.io";
  const accessToken = await getAccessToken();
  return requestJson<WalletBalance>(`${apiUrl}/api/wallet-balance/${encodeURIComponent(walletId)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
}

export async function getDisbursementHistory(query: DisbursementHistoryQuery): Promise<PaginatedDisbursementHistory> {
  const apiUrl = process.env.IOTEC_PAY_API_URL || "https://pay.iotec.io";
  const accessToken = await getAccessToken();

  // Build query parameters
  const params = new URLSearchParams();
  
  if (query.walletId) params.append("WalletId", query.walletId);
  if (query.bulkId) params.append("BulkId", query.bulkId);
  if (query.externalId) params.append("ExternalId", query.externalId);
  if (query.categories && query.categories.length > 0) {
    query.categories.forEach(cat => params.append("Categories", cat));
  }
  if (query.statuses && query.statuses.length > 0) {
    query.statuses.forEach(status => params.append("Statuses", status));
  }
  if (query.vendors && query.vendors.length > 0) {
    query.vendors.forEach(vendor => params.append("Vendors", vendor));
  }
  if (query.statusCodes && query.statusCodes.length > 0) {
    query.statusCodes.forEach(code => params.append("StatusCodes", code));
  }
  if (query.partnerId) params.append("PartnerId", query.partnerId);
  if (query.query) params.append("Query", query.query);
  if (query.skip !== undefined) params.append("Skip", query.skip.toString());
  if (query.limit !== undefined) params.append("Limit", query.limit.toString());
  if (query.page !== undefined) params.append("Page", query.page.toString());
  if (query.pageSize !== undefined) params.append("PageSize", query.pageSize.toString());
  if (query.orderBy) params.append("OrderBy", query.orderBy);
  if (query.order) params.append("Order", query.order);
  if (query.from) params.append("From", query.from);
  if (query.to) params.append("To", query.to);

  const queryString = params.toString();
  const url = `${apiUrl}/api/disbursements/paged-history${queryString ? "?" + queryString : ""}`;

  return requestJson<PaginatedDisbursementHistory>(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
}
