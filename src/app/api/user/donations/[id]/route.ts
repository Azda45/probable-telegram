import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/be/auth";
import { deleteDonationMessage } from "@/be/services/moderation";
import pool from "@/be/db";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [rows] = await pool.execute(
      "SELECT id FROM donations WHERE id = ? AND user_id = ?",
      [params.id, user.id]
    );

    if ((rows as any[]).length === 0) {
      return NextResponse.json({ error: "Not found or not your donation" }, { status: 404 });
    }

    await deleteDonationMessage(params.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
