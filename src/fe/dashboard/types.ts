import type { OverlayAnimationSettings } from "@/shared/overlay-animation";
import type { DonationStats, User } from "@/shared/types/models";

export type OverlayStyle = "right" | "left" | "none";
export type DonationFilter = "all" | "success" | "pending" | "failed";

export interface DashboardSettingsForm {
  display_name: string;
  bio: string;
  min_amount: number;
  avatar_url: string;
  max_amount: number;
  bank_name: string;
  bank_account: string;
  youtube_url: string;
  instagram_url: string;
  twitter_url: string;
  facebook_url: string;
}

export interface DashboardOverlayForm extends OverlayAnimationSettings {
  alert_duration: number;
  alert_sound: string;
  overlay_style: OverlayStyle;
  overlay_bg_color: string;
  overlay_border_color: string;
  overlay_text_color: string;
  overlay_message_color: string;
  overlay_accent_color: string;
  overlay_progress_color: string;
  overlay_progress_enabled: boolean;
  action_text: string;
}

export type DashboardOverlaySettingsSource = Partial<Omit<DashboardOverlayForm, "overlay_progress_enabled">> & {
  overlay_progress_enabled?: boolean | number;
};

export interface DashboardProfileResponse {
  user: User;
  stats: DonationStats;
  overlaySettings?: DashboardOverlaySettingsSource;
  overlayToken: string;
}
