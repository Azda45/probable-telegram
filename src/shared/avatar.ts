const DEFAULT_AVATAR_BACKGROUNDS = "b6e3f4,c0aede,d1d4f9";

export function getAvatarUrl(displayName: string, avatarUrl?: string | null): string {
  const trimmedAvatarUrl = avatarUrl?.trim();
  if (trimmedAvatarUrl) return trimmedAvatarUrl;

  const seed = encodeURIComponent(displayName.trim() || "user");
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=${DEFAULT_AVATAR_BACKGROUNDS}`;
}
