import { NextRequest, NextResponse } from "next/server";
import { verifySignatureKey } from "@/be/midtrans";
import { getDonationByOrderId, updateDonationStatus } from "@/be/services";
import { publishMessage, QUEUES } from "@/be/rabbitmq";
import { emitOverlayNotification, emitPaymentStatus } from "@/be/realtime/socket-server";
import { methodNotAllowedResponse, validationErrorResponse } from "@/be/security/request-security";
import { z } from "zod";

const MidtransNotificationSchema = z.object({
  order_id: z.string().min(1).max(100),
  status_code: z.string().min(1).max(10),
  gross_amount: z.string().min(1).max(32),
  signature_key: z.string().min(64).max(256),
  transaction_status: z.string().min(1).max(50),
  fraud_status: z.string().max(50).optional(),
  transaction_id: z.string().max(100).optional(),
});

export function GET(req: NextRequest) {
  return methodNotAllowedResponse(["POST"], req);
}

export async function POST(req: NextRequest) {
  try {
    const parsed = MidtransNotificationSchema.safeParse(await req.json());
    if (!parsed.success) return validationErrorResponse(req);

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      transaction_id,
    } = parsed.data;

    console.log(`📬 Midtrans notification: order=${order_id}, status=${transaction_status}`);

    // Verify signature
    const isValid = verifySignatureKey(order_id, status_code, gross_amount, signature_key);
    if (!isValid) {
      console.warn("❌ Invalid Midtrans signature for order:", order_id);
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // Get donation
    const donation = await getDonationByOrderId(order_id);
    if (!donation) {
      console.warn("❌ Donation not found for order:", order_id);
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    // Determine final status
    let finalStatus = transaction_status;
    if (transaction_status === "capture") {
      finalStatus = fraud_status === "accept" ? "capture" : "fraud";
    }

    // Update donation status atomically. Only the first transition to paid
    // should produce realtime-visible events; duplicate webhooks become no-ops.
    const statusUpdate = await updateDonationStatus(order_id, finalStatus, transaction_id);

    // If payment successful, publish to overlay notification queue
    if (statusUpdate.becamePaid) {
      console.log(`✅ Payment success for order: ${order_id}`);

      const paidAt = statusUpdate.paidAt?.toISOString() || new Date().toISOString();

      try {
        await publishMessage(QUEUES.DONATION_PAID, {
          donationId: donation.id,
          orderId: order_id,
          userId: donation.user_id,
          donorName: donation.donor_name,
          amount: donation.amount,
          message: donation.message,
          paidAt,
        });

        await publishMessage(QUEUES.OVERLAY_NOTIFICATION, {
          type: "donation",
          donationId: donation.id,
          orderId: order_id,
          userId: donation.user_id,
          donorName: donation.donor_name,
          amount: donation.amount,
          message: donation.message,
          timestamp: paidAt,
        });

      } catch (mqError) {
        console.warn("RabbitMQ publish failed (non-critical):", mqError);
      }

      await emitOverlayNotification({
        donationId: donation.id,
        orderId: order_id,
        userId: donation.user_id,
        donorName: donation.donor_name,
        amount: donation.amount,
        message: donation.message,
        paidAt,
      });

      emitPaymentStatus({
        orderId: order_id,
        donationId: donation.id,
        status: statusUpdate.currentStatus,
        paid: true,
        paidAt,
      });
    } else if (["settlement", "capture"].includes(statusUpdate.currentStatus)) {
      console.log(`↩️ Duplicate paid webhook ignored for order: ${order_id}`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: unknown) {
    console.error("Midtrans notification error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
