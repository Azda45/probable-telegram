// Shared types across the application

export interface User {
  id: string;
  username: string;
  display_name: string;
  email: string;
  stream_key: string;
  overlay_token: string;
  min_amount: number;
  max_amount: number;
  alert_duration: number;
  total_received: number;
  bio: string | null;
  avatar_url: string | null;
  alert_sound: string;
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
  topDonors: Array<{ donor_name: string; total: number; count: number }>;
}

export interface OverlayNotification {
  id: string;
  donor_name: string;
  amount: number;
  message: string | null;
}
