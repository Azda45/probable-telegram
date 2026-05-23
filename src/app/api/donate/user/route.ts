import { NextRequest, NextResponse } from "next/server";
import { getUserByUsername } from "@/be/services";
import { apiErrorResponse, validationErrorResponse } from "@/be/security/request-security";
import { z } from "zod";

const UsernameSchema = z.string().trim().toLowerCase().min(3).max(30).regex(/^[a-z0-9_]+$/);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  const parsedUsername = UsernameSchema.safeParse(username);
  if (!parsedUsername.success) return validationErrorResponse(req);

  const user = await getUserByUsername(parsedUsername.data);
  if (!user) {
    return apiErrorResponse(req, { error: "User not found" }, 404);
  }

  return NextResponse.json({
    user: {
      username: user.username,
      display_name: user.display_name,
      bio: user.bio,
      avatar_url: user.avatar_url,
      min_amount: user.min_amount,
    },
  });
}
