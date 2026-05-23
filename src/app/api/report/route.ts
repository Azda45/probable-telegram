import { NextRequest, NextResponse } from "next/server";
import { ensureReportsTable } from "@/be/schema/reports";
import pool from "@/be/db";

export async function POST(req: NextRequest) {
  try {
    await ensureReportsTable();
    const data = await req.json();

    const { target_user_id, reporter_name, reason } = data;

    if (!target_user_id || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await pool.execute(
      "INSERT INTO reports (target_user_id, reporter_name, reason) VALUES (?, ?, ?)",
      [target_user_id, reporter_name || null, reason]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Report API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
