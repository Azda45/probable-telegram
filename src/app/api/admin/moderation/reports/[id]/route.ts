import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/be/auth";
import pool from "@/be/db";
import { ensureReportsTable } from "@/be/schema/reports";
import { createAuditLog } from "@/be/services/settings";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser();
    if (!user || !user.is_admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { status } = await req.json();
    if (!['resolved', 'dismissed'].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await ensureReportsTable();
    await pool.execute("UPDATE reports SET status = ? WHERE id = ?", [status, params.id]);
    await createAuditLog(user.id, user.username, "RESOLVE_REPORT", `Marked report ID: ${params.id} as ${status}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
