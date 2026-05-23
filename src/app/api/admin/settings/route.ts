import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/be/auth";
import { getPlatformSettings, updatePlatformSettings } from "@/be/services/settings";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || !user.is_admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const settings = await getPlatformSettings();
    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || !user.is_admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { settings } = await req.json();
    await updatePlatformSettings(settings, user.id, user.username);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PUT /api/admin/settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
