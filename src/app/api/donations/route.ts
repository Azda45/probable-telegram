import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/be/auth";
import { getUserDonations } from "@/be/services";
import { DonationListQuerySchema } from "@/shared/validation";
import { apiErrorResponse, validationErrorResponse } from "@/be/security/request-security";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return apiErrorResponse(req, { error: "Unauthorized" }, 401);
    }

    const { searchParams } = new URL(req.url);
    const parsed = DonationListQuerySchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    });
    if (!parsed.success) return validationErrorResponse(req);

    const { page, limit, status } = parsed.data;

    const result = await getUserDonations(user.id, page, limit, status);

    return NextResponse.json({
      ...result,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    });
  } catch (error: unknown) {
    console.error("Get donations error:", error);
    return apiErrorResponse(req, { error: "Gagal mengambil data donasi" }, 500);
  }
}
