import type { DonationRecord, User } from "@/shared/types/models";
import type {
  DashboardOverlayForm,
  DashboardProfileResponse,
  DashboardSettingsForm,
  DonationFilter,
} from "./types";

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

async function ensureOk<T extends { error?: string }>(response: Response): Promise<T> {
  const data = await readJson<T>(response);
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

export async function fetchDashboardProfile(): Promise<DashboardProfileResponse> {
  const profileResponse = await fetch("/api/user");
  if (!profileResponse.ok) throw new Error("UNAUTHORIZED");

  const profileData = await readJson<Omit<DashboardProfileResponse, "overlayToken">>(profileResponse);
  const tokenResponse = await fetch("/api/user/overlay-token", { cache: "no-store" });
  const tokenData = tokenResponse.ok ? await readJson<{ overlayToken?: string }>(tokenResponse) : {};

  return {
    ...profileData,
    overlayToken: tokenData.overlayToken || "",
  };
}

export async function fetchDashboardDonations(page = 1, filter: DonationFilter = "success") {
  const url = new URL("/api/donations", window.location.origin);
  url.searchParams.set("page", page.toString());
  url.searchParams.set("limit", "15");
  if (filter !== "all") url.searchParams.set("status", filter);

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("Failed to load donations");
  return readJson<{ donations: DonationRecord[]; total: number }>(response);
}

export async function saveDashboardSettings(settingsForm: DashboardSettingsForm): Promise<User> {
  const data = await ensureOk<{ user: User; error?: string }>(await fetch("/api/user", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settingsForm),
  }));
  return data.user;
}

export async function saveDashboardOverlaySettings(overlayForm: DashboardOverlayForm) {
  const data = await ensureOk<{ settings: DashboardOverlayForm; error?: string }>(await fetch("/api/overlay/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(overlayForm),
  }));
  return data.settings;
}

export async function regenerateDashboardKeys() {
  return ensureOk<{ error?: string }>(await fetch("/api/user", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "regenerate_keys" }),
  }));
}

export async function sendOverlayTestNotification(overlayToken: string) {
  return ensureOk<{ donation: { donor_name: string; amount: number }; error?: string }>(await fetch("/api/overlay/control/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: overlayToken }),
  }));
}

export async function replayOverlayDonation(donationId: string) {
  // Keeping replay separate since it requires donationId, or we could add it to control API.
  return ensureOk<{ donation: { donor_name: string; amount: number }; error?: string }>(await fetch("/api/overlay/replay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ donationId }),
  }));
}

export async function skipOverlayNotification(overlayToken: string) {
  return ensureOk<{ emitted: boolean; error?: string }>(await fetch("/api/overlay/control/skip", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: overlayToken }),
  }));
}

export async function toggleOverlayCensor(overlayToken: string) {
  return ensureOk<{ isCensored: boolean; error?: string }>(await fetch("/api/overlay/control/censor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: overlayToken }),
  }));
}

export async function deleteDashboardDonation(donationId: string) {
  return ensureOk<{ success: boolean; error?: string }>(await fetch(`/api/user/donations/${donationId}`, { method: "DELETE" }));
}

export async function toggleOverlayPause(overlayToken: string) {
  return ensureOk<{ paused: boolean; error?: string }>(await fetch("/api/overlay/control/pause", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: overlayToken }),
  }));
}

export async function triggerOverlayRefresh(overlayToken: string) {
  return ensureOk<{ emitted: boolean; error?: string }>(await fetch("/api/overlay/control/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: overlayToken }),
  }));
}

export function logoutDashboardUser() {
  return fetch("/api/auth/logout", { method: "POST" });
}
