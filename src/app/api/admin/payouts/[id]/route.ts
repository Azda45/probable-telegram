import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/be/auth";
import { processPayout } from "@/be/services/payouts";
import { createAuditLog } from "@/be/services/settings";

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const user = await getAuthUser();
    
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { action } = await req.json();

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await processPayout(params.id, action);
    await createAuditLog(user.id, user.username, "PROCESS_PAYOUT", `${action} payout request ID: ${params.id}`);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PATCH /api/admin/payouts/[id] error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
