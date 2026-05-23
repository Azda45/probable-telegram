import { NextRequest, NextResponse } from "next/server";
import { getTransactionStatus } from "@/be/midtrans";
import { getDonationByOrderIdForStatus } from "@/be/services";
import { apiErrorResponse, validationErrorResponse } from "@/be/security/request-security";
import { OrderIdSchema, StatusTokenSchema } from "@/shared/validation";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId: rawOrderId } = await params;
    const parsedOrderId = OrderIdSchema.safeParse(rawOrderId);
    if (!parsedOrderId.success) return validationErrorResponse(req);

    const orderId = parsedOrderId.data;
    const token = new URL(req.url).searchParams.get("token");
    const parsedToken = StatusTokenSchema.safeParse(token);
    if (!parsedToken.success) return validationErrorResponse(req);

    const donation = await getDonationByOrderIdForStatus(orderId, parsedToken.data);
    if (!donation) {
      return apiErrorResponse(req, { error: "Donasi tidak ditemukan" }, 404);
    }

    // If already settled, return from DB
    if (["settlement", "capture"].includes(donation.transaction_status)) {
      return NextResponse.json({
        status: donation.transaction_status,
        orderId: donation.order_id,
        amount: donation.amount,
        paid: true,
      });
    }

    // Check Midtrans for latest status
    try {
      const mtStatus = await getTransactionStatus(orderId);
      return NextResponse.json({
        status: mtStatus.transaction_status,
        orderId: mtStatus.order_id,
        amount: parseInt(mtStatus.gross_amount),
        paid: ["settlement", "capture"].includes(mtStatus.transaction_status),
      });
    } catch {
      return NextResponse.json({
        status: donation.transaction_status,
        orderId: donation.order_id,
        amount: donation.amount,
        paid: false,
      });
    }
  } catch (error: unknown) {
    console.error("Check status error:", error);
    return apiErrorResponse(req, { error: "Gagal mengecek status" }, 500);
  }
}
