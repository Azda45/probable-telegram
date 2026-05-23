import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/be/auth";
import { emitOverlaySkip } from "@/be/realtime/socket-server";
import { apiErrorResponse, methodNotAllowedResponse, rejectCrossOrigin } from "@/be/security/request-security";

export function GET(req: NextRequest) {
  return methodNotAllowedResponse(["POST"], req);
}

export async function POST(req: NextRequest) {
  try {
    const originError = rejectCrossOrigin(req);
    if (originError) return originError;

    const user = await getAuthUser();
    if (!user) {
      return apiErrorResponse(req, { error: "Unauthorized" }, 401);
    }

    const emitted = await emitOverlaySkip(user.id);

    return NextResponse.json({
      message: emitted ? "Skip command sent" : "Overlay socket unavailable",
      emitted,
    });
  } catch (error: unknown) {
    console.error("Skip overlay error:", error);
    return apiErrorResponse(req, { error: "Gagal skip notifikasi" }, 500);
  }
}
