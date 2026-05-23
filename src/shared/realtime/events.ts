export const REALTIME_EVENT_VERSION = 1 as const;

export const REALTIME_EVENTS = {
  CONNECTION_READY: "connection:ready",
  HEARTBEAT_PING: "heartbeat:ping",
  HEARTBEAT_PONG: "heartbeat:pong",
  DONATION_CREATED: "donation:created",
  DONATION_PAID: "donation:paid",
  PAYMENT_STATUS_CHANGED: "payment:status_changed",
  OVERLAY_NOTIFICATION: "overlay:notification",
  OVERLAY_STATE: "overlay:state",
  OVERLAY_REPLAY: "overlay:replay",
  OVERLAY_TEST: "overlay:test",
  OVERLAY_ACK: "overlay:ack",
  OVERLAY_SKIP: "overlay:skip",
  OVERLAY_SETTINGS_UPDATED: "overlay:settings_updated",
  OVERLAY_PAUSE: "overlay:pause",
  STREAMER_TOTAL_CHANGED: "streamer:total_changed",
  ERROR: "error",
} as const;

export const REALTIME_ROOMS = {
  streamer: (userId: string) => `streamer:${userId}`,
  overlay: (userId: string) => `overlay:${userId}`,
  order: (orderId: string) => `order:${orderId}`,
} as const;

export type RealtimeEventName = typeof REALTIME_EVENTS[keyof typeof REALTIME_EVENTS];

export interface RealtimeEnvelope<TType extends RealtimeEventName, TPayload> {
  type: TType;
  version: typeof REALTIME_EVENT_VERSION;
  eventId: string;
  timestamp: string;
  payload: TPayload;
}

export interface PublicDonationPayload {
  donationId: string;
  orderId: string;
  userId: string;
  donorName: string;
  amount: number;
  message: string | null;
  paidAt: string;
}

export interface OverlaySettingsPayload {
  user_id: string;
  alert_sound: string;
  alert_duration: number;
  overlay_style: "right" | "left" | "none";
  overlay_animation: string;
  overlay_animation_duration: number;
  overlay_animation_enabled: boolean;
  overlay_bg_color: string;
  overlay_border_color: string;
  overlay_text_color: string;
  overlay_message_color: string;
  overlay_accent_color: string;
  overlay_progress_color: string;
  overlay_progress_enabled: boolean;
}

export interface OverlayStatePayload {
  userId: string;
  settings: OverlaySettingsPayload;
  notifications: PublicDonationPayload[];
  paused: boolean;
  queuedCount: number;
}

export interface DonationCreatedPayload {
  donationId: string;
  orderId: string;
  userId: string;
  amount: number;
  createdAt: string;
}

export interface PaymentStatusPayload {
  orderId: string;
  donationId: string;
  status: string;
  paid: boolean;
  paidAt: string | null;
}

export interface OverlayAckPayload {
  donationId: string;
  displayedAt: string;
}

export interface OverlaySkipPayload {
  userId: string;
}

export interface OverlaySettingsUpdatedPayload {
  userId: string;
  settings?: OverlaySettingsPayload;
}

export interface OverlayPausePayload {
  paused: boolean;
  queuedCount: number;
}

export interface StreamerTotalChangedPayload {
  userId: string;
  totalReceived: number;
  delta: number;
}

export interface ConnectionReadyPayload {
  socketId: string;
  heartbeatIntervalMs: number;
}

export interface HeartbeatPayload {
  now: string;
}

export interface RealtimeErrorPayload {
  code: string;
  message: string;
  recoverable: boolean;
}

export type RealtimeEventMap = {
  [REALTIME_EVENTS.CONNECTION_READY]: ConnectionReadyPayload;
  [REALTIME_EVENTS.HEARTBEAT_PING]: HeartbeatPayload;
  [REALTIME_EVENTS.HEARTBEAT_PONG]: HeartbeatPayload;
  [REALTIME_EVENTS.DONATION_CREATED]: DonationCreatedPayload;
  [REALTIME_EVENTS.DONATION_PAID]: PublicDonationPayload;
  [REALTIME_EVENTS.PAYMENT_STATUS_CHANGED]: PaymentStatusPayload;
  [REALTIME_EVENTS.OVERLAY_NOTIFICATION]: PublicDonationPayload;
  [REALTIME_EVENTS.OVERLAY_STATE]: OverlayStatePayload;
  [REALTIME_EVENTS.OVERLAY_REPLAY]: PublicDonationPayload;
  [REALTIME_EVENTS.OVERLAY_TEST]: PublicDonationPayload;
  [REALTIME_EVENTS.OVERLAY_ACK]: OverlayAckPayload;
  [REALTIME_EVENTS.OVERLAY_SKIP]: OverlaySkipPayload;
  [REALTIME_EVENTS.OVERLAY_SETTINGS_UPDATED]: OverlaySettingsUpdatedPayload;
  [REALTIME_EVENTS.OVERLAY_PAUSE]: OverlayPausePayload;
  [REALTIME_EVENTS.STREAMER_TOTAL_CHANGED]: StreamerTotalChangedPayload;
  [REALTIME_EVENTS.ERROR]: RealtimeErrorPayload;
};

export type RealtimeEvent<TType extends keyof RealtimeEventMap> = RealtimeEnvelope<
  TType,
  RealtimeEventMap[TType]
>;

export function createRealtimeEnvelope<TType extends keyof RealtimeEventMap>(
  type: TType,
  payload: RealtimeEventMap[TType],
  eventId: string
): RealtimeEvent<TType> {
  return {
    type,
    version: REALTIME_EVENT_VERSION,
    eventId,
    timestamp: new Date().toISOString(),
    payload,
  };
}
