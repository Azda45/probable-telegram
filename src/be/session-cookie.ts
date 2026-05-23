import type { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/shared/auth-constants";
import { env } from "./env";

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.IS_PRODUCTION,
    sameSite: "lax",
    maxAge: env.SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: env.IS_PRODUCTION,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}
