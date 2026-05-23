import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/be/auth";
import { getDonationMessages } from "@/be/services/moderation";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = await getDonationMessages(page, limit);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("GET /api/admin/moderation/messages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
