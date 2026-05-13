import { NextRequest, NextResponse } from "next/server";
import { getTransactionStatus } from "@/lib/midtrans";
import { getDonationByOrderId } from "@/lib/services";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    const donation = await getDonationByOrderId(orderId);
    if (!donation) {
      return NextResponse.json({ error: "Donasi tidak ditemukan" }, { status: 404 });
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
    return NextResponse.json({ error: "Gagal mengecek status" }, { status: 500 });
  }
}
