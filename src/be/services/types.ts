import type { OverlayAnimationSettings } from "@/shared/overlay-animation";

export interface User {
  id: string;
  username: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  stream_key: string;
  overlay_token: string;
  min_amount: number;
  max_amount: number;
  total_received: number;
  created_at: Date;
}

export interface AuthSession {
  token: string;
  expiresAt: Date;
}

export interface OverlayOwner {
  id: string;
  username: string;
  display_name: string;
  overlay_token: string;
}

export interface OverlaySettings extends OverlayAnimationSettings {
  user_id: string;
  alert_sound: string;
  alert_duration: number;
  overlay_style: "right" | "left" | "none";
  overlay_bg_color: string;
  overlay_border_color: string;
  overlay_text_color: string;
  overlay_message_color: string;
  overlay_accent_color: string;
  overlay_progress_color: string;
  overlay_progress_enabled: boolean;
}

export interface Donation {
  id: string;
  user_id: string;
  order_id: string;
  donor_name: string;
  donor_email: string;
  amount: number;
  message: string | null;
  payment_type: string;
  transaction_id: string | null;
  transaction_status: string;
  qr_url: string | null;
  deeplink_url: string | null;
  paid_at: Date | null;
  shown_on_overlay: boolean;
  created_at: Date;
}

export interface DonationStatusUpdate {
  previousStatus: string;
  currentStatus: string;
  becamePaid: boolean;
  statusChanged: boolean;
  paidAt: Date | null;
}
