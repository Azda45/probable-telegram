import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/be/auth";
import { toggleUserAdmin } from "@/be/services/admin";
import { createAuditLog } from "@/be/services/settings";
import { z } from "zod";

const schema = z.object({
  is_admin: z.boolean()
});

export async function PATCH(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const user = await getAuthUser();
    
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Don't let admin demote themselves
    if (params.userId === user.id && !schema.parse(await req.json().catch(()=>({}))).is_admin) {
        return NextResponse.json({ error: "Cannot demote yourself" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await toggleUserAdmin(params.userId, parsed.data.is_admin);
    await createAuditLog(user.id, user.username || "admin", parsed.data.is_admin ? "MAKE_ADMIN" : "REVOKE_ADMIN", `${parsed.data.is_admin ? "Promoted" : "Demoted"} user ID: ${params.userId} to Admin`);

    return NextResponse.json({ success: true, is_admin: parsed.data.is_admin });
  } catch (error: any) {
    console.error("PATCH /api/admin/users/[userId]/admin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
