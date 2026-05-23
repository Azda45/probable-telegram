import { NextRequest, NextResponse } from "next/server";
import { createSession, createUser } from "@/be/services";
import { setSessionCookie } from "@/be/session-cookie";
import { checkRateLimit } from "@/be/rate-limit";
import { apiErrorResponse, getClientIp, rejectCrossOrigin } from "@/be/security/request-security";
import { RegisterSchema } from "@/shared/validation";

export function GET(req: NextRequest) {
  return NextResponse.redirect(new URL("/405", req.url));
}

export async function POST(req: NextRequest) {
  try {
    const originError = rejectCrossOrigin(req);
    if (originError) return originError;

    const clientIp = getClientIp(req);
    if (!(await checkRateLimit(`register:${clientIp}`, 3, 60 * 60 * 1000))) {
      return NextResponse.json({ error: "Terlalu banyak percobaan registrasi" }, { status: 429 });
    }

    const parsed = RegisterSchema.safeParse(await req.json());
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const field = firstIssue?.path.join(".") || "input";
      return apiErrorResponse(req, { error: `Input tidak valid: ${field}`, details: parsed.error.flatten().fieldErrors }, 400);
    }

    const { username, email, password, displayName } = parsed.data;

    const user = await createUser(username, email, password, displayName);
    const session = await createSession(user.id);

    const response = NextResponse.json({
      message: "Registrasi berhasil",
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
      },
    });

    setSessionCookie(response, session.token);

    return response;
  } catch (error: unknown) {
    const err = error as Error & { code?: string };
    if (err.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "Username atau email sudah terdaftar" },
        { status: 409 }
      );
    }
    console.error("Register error:", err);
    return apiErrorResponse(req, { error: "Gagal registrasi" }, 500);
  }
}
