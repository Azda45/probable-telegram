import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/be/auth";
import { getAdminUsers } from "@/be/services/settings";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || !user.is_admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const admins = await getAdminUsers();
    return NextResponse.json({ admins });
  } catch (error: any) {
    console.error("GET /api/admin/admins error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
