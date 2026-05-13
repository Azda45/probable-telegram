import { NextRequest, NextResponse } from "next/server";
import { verifySignatureKey } from "@/lib/midtrans";
import { getDonationByOrderId, updateDonationStatus } from "@/lib/services";
import { publishMessage, QUEUES } from "@/lib/rabbitmq";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      transaction_id,
    } = body;

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

    // Update donation status
    await updateDonationStatus(order_id, finalStatus, transaction_id);

    // If payment successful, publish to overlay notification queue
    if (["settlement", "capture"].includes(finalStatus)) {
      console.log(`✅ Payment success for order: ${order_id}`);

      try {
        await publishMessage(QUEUES.DONATION_PAID, {
          donationId: donation.id,
          orderId: order_id,
          userId: donation.user_id,
          donorName: donation.donor_name,
          amount: donation.amount,
          message: donation.message,
          paidAt: new Date().toISOString(),
        });

        await publishMessage(QUEUES.OVERLAY_NOTIFICATION, {
          type: "donation",
          userId: donation.user_id,
          donorName: donation.donor_name,
          amount: donation.amount,
          message: donation.message,
          timestamp: new Date().toISOString(),
        });
      } catch (mqError) {
        console.warn("RabbitMQ publish failed (non-critical):", mqError);
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: unknown) {
    console.error("Midtrans notification error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
