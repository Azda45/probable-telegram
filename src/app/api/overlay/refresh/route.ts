import { NextRequest, NextResponse } from "next/server";
import { emitOverlayRefresh } from "@/be/realtime/socket-server";
import { getUserByOverlayToken } from "@/be/services";
import { SESSION_TOKEN_PATTERN } from "@/shared/auth-constants";
import { apiErrorResponse } from "@/be/security/request-security";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token || !SESSION_TOKEN_PATTERN.test(token)) {
      return apiErrorResponse(request, { error: "Valid overlay token is required" }, 400);
    }

    const user = await getUserByOverlayToken(token);
    if (!user) {
      return apiErrorResponse(request, { error: "Invalid overlay token" }, 401);
    }

    const emitted = await emitOverlayRefresh(user.id);

    return NextResponse.json({
      message: emitted ? "Refresh command sent" : "Overlay socket unavailable",
      emitted,
    });
  } catch (error: unknown) {
    console.error("Refresh overlay error:", error);
    return apiErrorResponse(request, { error: "Gagal refresh overlay" }, 500);
  }
}
