import { NextRequest, NextResponse } from "next/server";
import { emitOverlayToggleCensor } from "@/be/realtime/socket-server/emitters";
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

    const isCensored = await emitOverlayToggleCensor(user.id);

    return NextResponse.json({
      message: "Toggle censor command sent",
      isCensored,
    });
  } catch (error: unknown) {
    console.error("Toggle censor overlay error:", error);
    return apiErrorResponse(request, { error: "Gagal toggle sensor notifikasi" }, 500);
  }
}
