import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/be/auth";
import { removeBlacklistWord } from "@/be/services/moderation";
import { createAuditLog } from "@/be/services/settings";

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const user = await getAuthUser();
    
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await removeBlacklistWord(params.id);
    await createAuditLog(user.id, user.username, "REMOVE_BLACKLIST", `Removed word ID: ${params.id} from blacklist`);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
