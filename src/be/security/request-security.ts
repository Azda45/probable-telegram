import { NextRequest, NextResponse } from "next/server";
import { env } from "@/be/env";

type ErrorPageStatus = 400 | 401 | 403 | 404 | 405 | 500 | 503;

function isBrowserPageRequest(req: NextRequest): boolean {
  const accept = req.headers.get("accept") || "";
  const fetchDest = req.headers.get("sec-fetch-dest");

  return accept.includes("text/html") && (!fetchDest || fetchDest === "document");
}

export function apiErrorResponse(
  req: NextRequest,
  body: { error: string; [key: string]: unknown },
  status: ErrorPageStatus
) {
  if (isBrowserPageRequest(req)) {
    return NextResponse.redirect(new URL(`/${status}`, req.url));
  }

  return NextResponse.json(body, { status });
}

export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || req.headers.get("x-real-ip") || "unknown";
}

export function rejectCrossOrigin(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin");

  if (!origin) {
    return env.IS_PRODUCTION
      ? apiErrorResponse(req, { error: "Forbidden" }, 403)
      : null;
  }

  try {
    const normalizedOrigin = new URL(origin).origin;
    if (env.ALLOWED_ORIGINS.includes(normalizedOrigin)) return null;
  } catch {
    return apiErrorResponse(req, { error: "Forbidden" }, 403);
  }

  return apiErrorResponse(req, { error: "Forbidden" }, 403);
}

export function validationErrorResponse(req?: NextRequest) {
  if (req) return apiErrorResponse(req, { error: "Input tidak valid" }, 400);

  return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
}

export function methodNotAllowedResponse(allowedMethods: string[], req?: NextRequest) {
  if (req && isBrowserPageRequest(req)) {
    const response = NextResponse.redirect(new URL("/405", req.url));
    response.headers.set("Allow", allowedMethods.join(", "));
    return response;
  }

  return NextResponse.json(
    { error: "Method not allowed", allowedMethods },
    { status: 405, headers: { Allow: allowedMethods.join(", ") } }
  );
}

export function requireInternalApiKey(req: NextRequest): NextResponse | null {
  const apiKey = req.headers.get("x-api-key");
  if (!env.API_KEY || apiKey !== env.API_KEY) {
    return apiErrorResponse(req, { error: "Unauthorized" }, 401);
  }

  return null;
}
