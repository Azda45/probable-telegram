import crypto from "crypto";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "";
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";

const BASE_URL = IS_PRODUCTION
  ? "https://api.midtrans.com/v2"
  : "https://api.sandbox.midtrans.com/v2";

const authString = Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64");

interface ChargeResponse {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_status: string;
  fraud_status?: string;
  actions?: Array<{
    name: string;
    method: string;
    url: string;
  }>;
}

interface TransactionStatusResponse {
  status_code: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_status: string;
  fraud_status?: string;
  transaction_time: string;
  settlement_time?: string;
}

export async function createQrisCharge(
  orderId: string,
  amount: number,
  donorName: string
): Promise<ChargeResponse> {
  const payload = {
    payment_type: "gopay",
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    item_details: [
      {
        id: "donation",
        price: amount,
        quantity: 1,
        name: `Donasi dari ${donorName}`,
      },
    ],
    customer_details: {
      first_name: donorName,
    },
    gopay: {
      enable_callback: true,
      callback_url: `${process.env.APP_URL || "http://localhost:3000"}/donation/success`,
    },
  };

  const response = await fetch(`${BASE_URL}/charge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${authString}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (data.status_code && !["200", "201"].includes(data.status_code)) {
    throw new Error(`Midtrans error: ${data.status_message}`);
  }

  return data as ChargeResponse;
}

export async function getTransactionStatus(
  orderId: string
): Promise<TransactionStatusResponse> {
  const response = await fetch(`${BASE_URL}/${orderId}/status`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${authString}`,
    },
  });

  return (await response.json()) as TransactionStatusResponse;
}

export function verifySignatureKey(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  // Midtrans signature: SHA512(order_id + status_code + gross_amount + server_key)
  const input = orderId + statusCode + grossAmount + MIDTRANS_SERVER_KEY;
  const hash = crypto.createHash("sha512").update(input).digest("hex");
  return hash === signatureKey;
}
