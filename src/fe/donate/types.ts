export interface UserInfo {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  min_amount: number;
  max_amount: number;
  youtube_url?: string | null;
  instagram_url?: string | null;
  twitter_url?: string | null;
  facebook_url?: string | null;
}

export type DonationStage = "form" | "qr" | "success";

export interface DonationFormState {
  donorName: string;
  donorEmail: string;
  amount: number;
  message: string;
}

export interface DonationFieldErrors {
  donorName?: string;
  amount?: string;
  donorEmail?: string;
}

export interface DonationQrData {
  orderId: string;
  statusToken: string;
  qrUrl: string;
  amount: number;
}
