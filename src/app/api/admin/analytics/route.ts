import { NextResponse } from "next/server";
import { getAuthUser } from "@/be/auth";
import { getAdminAnalytics } from "@/be/services/admin";

export async function GET() {
  try {
    const user = await getAuthUser();
    
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const result = await getAdminAnalytics();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("GET /api/admin/analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
