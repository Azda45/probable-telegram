import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/be/auth";
import { getOverlaySettingsByUserId, updateOverlaySettings } from "@/be/services";
import { apiErrorResponse, rejectCrossOrigin, validationErrorResponse } from "@/be/security/request-security";
import { OverlaySettingsSchema } from "@/shared/validation";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return apiErrorResponse(req, { error: "Unauthorized" }, 401);
    }

    const settings = await getOverlaySettingsByUserId(user.id);
    return NextResponse.json({ settings });
  } catch (error: unknown) {
    console.error("Get overlay settings error:", error);
    return apiErrorResponse(req, { error: "Gagal mengambil pengaturan overlay" }, 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const originError = rejectCrossOrigin(req);
    if (originError) return originError;

    const user = await getAuthUser();
    if (!user) {
      return apiErrorResponse(req, { error: "Unauthorized" }, 401);
    }

    const parsed = OverlaySettingsSchema.safeParse(await req.json());
    if (!parsed.success) return validationErrorResponse(req);

    const body = parsed.data;
    const settings = await updateOverlaySettings(user.id, {
      alert_sound: body.alert_sound,
      alert_duration: body.alert_duration,
      overlay_style: body.overlay_style,
      overlay_animation: body.overlay_animation,
      overlay_animation_duration: body.overlay_animation_duration,
      overlay_animation_enabled: body.overlay_animation_enabled,
      overlay_bg_color: body.overlay_bg_color,
      overlay_border_color: body.overlay_border_color,
      overlay_text_color: body.overlay_text_color,
      overlay_message_color: body.overlay_message_color,
      overlay_accent_color: body.overlay_accent_color,
      overlay_progress_color: body.overlay_progress_color,
      overlay_progress_enabled: body.overlay_progress_enabled,
    });

    try {
      const { emitOverlaySettingsUpdated } = await import("@/be/realtime/socket-server");
      emitOverlaySettingsUpdated(user.id, settings);
    } catch (e) {
      console.warn("Failed to emit overlay settings update event", e);
    }

    return NextResponse.json({ settings, message: "Pengaturan overlay berhasil disimpan" });
  } catch (error: unknown) {
    console.error("Update overlay settings error:", error);
    return apiErrorResponse(req, { error: "Gagal menyimpan pengaturan overlay" }, 500);
  }
}
