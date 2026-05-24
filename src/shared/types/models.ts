export interface User {
  id: string;
  username: string;
  display_name: string;
  min_amount: number;
  max_amount: number;
  total_received: number;
  bio: string | null;
  avatar_url: string | null;
  is_admin: boolean | number;
  bank_name?: string | null;
  bank_account?: string | null;
}

export interface OverlaySettings {
  user_id: string;
  alert_sound: string;
  alert_duration: number;
  overlay_style: "right" | "left" | "none";
  overlay_animation: string;
  overlay_animation_duration: number;
  overlay_animation_enabled: boolean | number;
  overlay_bg_color: string;
  overlay_border_color: string;
  overlay_text_color: string;
  overlay_message_color: string;
  overlay_accent_color: string;
  overlay_progress_color: string;
  overlay_progress_enabled: boolean | number;
  action_text: string;
}

export interface DonationRecord {
  id: string;
  order_id: string;
  donor_name: string;
  donor_email: string;
  amount: number;
  message: string | null;
  transaction_status: string;
  created_at: string;
  paid_at: string | null;
}

export interface DonationStats {
  totalAmount: number;
  totalDonations: number;
  todayAmount: number;
  todayDonations: number;
  balance: number;
  topDonors: Array<{ donor_name: string; total: number; count: number }>;
}

export interface OverlayNotification {
  id: string;
  donor_name: string;
  amount: number;
  message: string | null;
}
