import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/be/auth";
import pool from "@/be/db";
import { ensureReportsTable } from "@/be/schema/reports";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || !user.is_admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    await ensureReportsTable();
    const [rows] = await pool.execute(
      `SELECT r.id, r.target_user_id, r.reporter_name, r.reason, r.status, r.created_at, u.username as target_username
       FROM reports r
       LEFT JOIN users u ON r.target_user_id = u.id
       ORDER BY r.created_at DESC`
    );

    return NextResponse.json({ reports: rows });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
