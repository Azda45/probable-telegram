import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/be/auth";
import { getAdminUsersList } from "@/be/services/admin";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status") || "all";

    const users = await getAdminUsersList(status);

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
