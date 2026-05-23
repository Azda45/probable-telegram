import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/be/auth";
import { getBlacklistWords, addBlacklistWord } from "@/be/services/moderation";
import { createAuditLog } from "@/be/services/settings";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || !user.is_admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const words = await getBlacklistWords();
    return NextResponse.json({ words });
  } catch (error: any) {
    console.error("GET /api/admin/moderation/blacklist error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || !user.is_admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { word } = await req.json();
    if (!word || typeof word !== "string" || word.trim() === "") {
      return NextResponse.json({ error: "Invalid word" }, { status: 400 });
    }

    const id = await addBlacklistWord(word, user.username || "admin");
    await createAuditLog(user.id, user.username, "ADD_BLACKLIST", `Added word '${word}' to blacklist`);
    
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    if (error.message.includes("sudah ada")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
