import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getUserById, getDonationStats, updateUserSettings, regenerateKeys } from "@/lib/services";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getDonationStats(user.id);

    return NextResponse.json({
      user,
      stats,
    });
  } catch (error: unknown) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { display_name, bio, min_amount, max_amount, alert_sound, alert_duration, avatar_url, overlay_style } = body;

    await updateUserSettings(user.id, {
      display_name,
      bio,
      min_amount,
      max_amount,
      alert_sound,
      alert_duration,
      avatar_url,
      overlay_style,
    });

    const updated = await getUserById(user.id);
    try {
      const { emitOverlaySettingsUpdated } = await import("@/lib/realtime/socket-server");
      emitOverlaySettingsUpdated(user.id);
    } catch (e) {
      console.warn("Failed to emit overlay settings update event", e);
    }
    return NextResponse.json({ user: updated, message: "Pengaturan berhasil disimpan" });
  } catch (error: unknown) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Gagal menyimpan pengaturan" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === "regenerate_keys") {
      const keys = await regenerateKeys(user.id);
      return NextResponse.json({ ...keys, message: "Keys berhasil di-generate ulang" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    console.error("Patch profile error:", error);
    return NextResponse.json({ error: "Gagal memproses" }, { status: 500 });
  }
}
