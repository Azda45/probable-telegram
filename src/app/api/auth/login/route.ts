import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, createSession } from "@/be/services";
import { setSessionCookie } from "@/be/session-cookie";
import { checkRateLimit } from "@/be/rate-limit";
import { getClientIp, rejectCrossOrigin, validationErrorResponse } from "@/be/security/request-security";
import { LoginSchema } from "@/shared/validation";

export function GET(req: NextRequest) {
  return NextResponse.redirect(new URL("/405", req.url));
}

export async function POST(req: NextRequest) {
  try {
    const originError = rejectCrossOrigin(req);
    if (originError) return originError;

    const clientIp = getClientIp(req);
    if (!(await checkRateLimit(`login:${clientIp}`, 5, 15 * 60 * 1000))) {
      return NextResponse.json({ error: "Terlalu banyak percobaan login" }, { status: 429 });
    }

    const parsed = LoginSchema.safeParse(await req.json());
    if (!parsed.success) return validationErrorResponse(req);

    const { login, password } = parsed.data;

    const user = await authenticateUser(login, password);
    if (!user) {
      return NextResponse.json(
        { error: "Username/email atau password salah" },
        { status: 401 }
      );
    }

    const session = await createSession(user.id);

    const response = NextResponse.json({
      message: "Login berhasil",
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
      },
    });

    setSessionCookie(response, session.token);

    return response;
  } catch (error: unknown) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Gagal login" },
      { status: 500 }
    );
  }
}
