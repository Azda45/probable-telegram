import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/be/auth";
import { toggleUserBan } from "@/be/services/admin";
import { createAuditLog } from "@/be/services/settings";
import { z } from "zod";

const banSchema = z.object({
  is_banned: z.boolean(),
});

export async function PATCH(req: NextRequest, props: { params: Promise<{ userId: string }> }) {
  try {
    const params = await props.params;
    const user = await getAuthUser();
    
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // You cannot ban yourself
    if (user.id === params.userId) {
      return NextResponse.json({ error: "Cannot modify your own ban status" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = banSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    await toggleUserBan(params.userId, parsed.data.is_banned);
    await createAuditLog(user.id, user.username || "admin", parsed.data.is_banned ? "BAN_USER" : "UNBAN_USER", `${parsed.data.is_banned ? "Banned" : "Unbanned"} user ID: ${params.userId}`);

    return NextResponse.json({ success: true, is_banned: parsed.data.is_banned });
  } catch (error: any) {
    console.error("PATCH /api/admin/users/[userId]/ban error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
