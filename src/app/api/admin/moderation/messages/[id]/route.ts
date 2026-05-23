import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/be/auth";
import { deleteDonationMessage } from "@/be/services/moderation";
import { createAuditLog } from "@/be/services/settings";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser();
    
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await deleteDonationMessage(params.id);
    await createAuditLog(user.id, user.username, "DELETE_MESSAGE", `Deleted message for donation ID: ${params.id}`);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/admin/moderation/messages/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
