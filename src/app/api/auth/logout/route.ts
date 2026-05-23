import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/shared/auth-constants";
import { clearSessionCookie } from "@/be/session-cookie";
import { deleteSessionByToken } from "@/be/services";
import { rejectCrossOrigin } from "@/be/security/request-security";

export function GET(req: NextRequest) {
  return NextResponse.redirect(new URL("/405", req.url));
}

export async function POST(req: NextRequest) {
  const originError = rejectCrossOrigin(req);
  if (originError) return originError;

  await deleteSessionByToken(req.cookies.get(AUTH_COOKIE_NAME)?.value);

  const response = NextResponse.json({ message: "Logout berhasil" });
  clearSessionCookie(response);
  return response;
}
