import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/be/auth";
import { resetCreatorOverlayToken } from "@/be/services/moderation";
import { createAuditLog } from "@/be/services/settings";

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const user = await getAuthUser();
    
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const newToken = await resetCreatorOverlayToken(params.id);
    await createAuditLog(user.id, user.username, "RESET_OVERLAY_TOKEN", `Reset overlay token for user ID: ${params.id}`);
    
    return NextResponse.json({ success: true, token: newToken });
  } catch (error: any) {
    console.error("PATCH /api/admin/overlay/reset/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
