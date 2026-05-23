import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/be/auth";
import { apiErrorResponse } from "@/be/security/request-security";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return apiErrorResponse(req, { error: "Unauthorized" }, 401);
    }

    return NextResponse.json(
      { overlayToken: user.overlay_token },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error: unknown) {
    console.error("Get overlay token error:", error);
    return apiErrorResponse(req, { error: "Gagal mengambil token overlay" }, 500);
  }
}
