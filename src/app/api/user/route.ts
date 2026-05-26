import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/be/auth";
import { getUserById, getDonationStats, updateUserSettings, regenerateKeys, getOverlaySettingsByUserId } from "@/be/services";
import { apiErrorResponse, rejectCrossOrigin, validationErrorResponse } from "@/be/security/request-security";
import { UserPatchSchema, UserSettingsSchema } from "@/shared/validation";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return apiErrorResponse(req, { error: "Unauthorized" }, 401);
    }

    const stats = await getDonationStats(user.id);
    const overlaySettings = await getOverlaySettingsByUserId(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        bio: user.bio,
        avatar_url: user.avatar_url,
        min_amount: user.min_amount,
        max_amount: user.max_amount,
        total_received: user.total_received,
        bank_name: user.bank_name,
        bank_account: user.bank_account,
        youtube_url: user.youtube_url,
        instagram_url: user.instagram_url,
        twitter_url: user.twitter_url,
        facebook_url: user.facebook_url,
        ...overlaySettings,
      },
      overlaySettings,
      stats,
    });
  } catch (error: unknown) {
    console.error("Get profile error:", error);
    return apiErrorResponse(req, { error: "Gagal mengambil data" }, 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const originError = rejectCrossOrigin(req);
    if (originError) return originError;

    const user = await getAuthUser();
    if (!user) {
      return apiErrorResponse(req, { error: "Unauthorized" }, 401);
    }

    const parsed = UserSettingsSchema.safeParse(await req.json());
    if (!parsed.success) return validationErrorResponse(req);

    const { display_name, bio, min_amount, max_amount, avatar_url, bank_name, bank_account, youtube_url, instagram_url, twitter_url, facebook_url } = parsed.data;

    await updateUserSettings(user.id, {
      display_name,
      bio,
      min_amount,
      max_amount,
      avatar_url,
      bank_name,
      bank_account,
      youtube_url,
      instagram_url,
      twitter_url,
      facebook_url,
    });

    const updated = await getUserById(user.id);
    return NextResponse.json({
      user: updated
        ? {
            id: updated.id,
            username: updated.username,
            display_name: updated.display_name,
            bio: updated.bio,
            avatar_url: updated.avatar_url,
            min_amount: updated.min_amount,
            max_amount: updated.max_amount,
            total_received: updated.total_received,
            bank_name: updated.bank_name,
            bank_account: updated.bank_account,
            youtube_url: updated.youtube_url,
            instagram_url: updated.instagram_url,
            twitter_url: updated.twitter_url,
            facebook_url: updated.facebook_url,
          }
        : null,
      message: "Pengaturan berhasil disimpan",
    });
  } catch (error: unknown) {
    console.error("Update profile error:", error);
    return apiErrorResponse(req, { error: "Gagal menyimpan pengaturan" }, 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const originError = rejectCrossOrigin(req);
    if (originError) return originError;

    const user = await getAuthUser();
    if (!user) {
      return apiErrorResponse(req, { error: "Unauthorized" }, 401);
    }

    const parsed = UserPatchSchema.safeParse(await req.json());
    if (!parsed.success) return validationErrorResponse(req);

    const { action } = parsed.data;

    if (action === "regenerate_keys") {
      await regenerateKeys(user.id);
      return NextResponse.json({ message: "Keys berhasil di-generate ulang" });
    }

    return apiErrorResponse(req, { error: "Invalid action" }, 400);
  } catch (error: unknown) {
    console.error("Patch profile error:", error);
    return apiErrorResponse(req, { error: "Gagal memproses" }, 500);
  }
}
