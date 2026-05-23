import { toast } from "sonner";
import { formatRupiah } from "@/shared/utils";
import {
  logoutDashboardUser,
  regenerateDashboardKeys,
  replayOverlayDonation,
  saveDashboardOverlaySettings,
  saveDashboardSettings,
  sendOverlayTestNotification,
  skipOverlayNotification,
  toggleOverlayPause,
} from "../api";
import { mapOverlaySettingsToForm } from "../forms";
import type { User } from "@/shared/types/models";
import type { DashboardOverlayForm, DashboardSettingsForm } from "../types";

interface DashboardActionArgs {
  loadProfile: () => Promise<void>;
  overlayForm: DashboardOverlayForm;
  overlayToken: string;
  setIsOverlayPaused: (paused: boolean) => void;
  setOverlayForm: (form: DashboardOverlayForm) => void;
  setShowRegenModal: (visible: boolean) => void;
  setTestingSend: (sending: boolean) => void;
  setUser: (user: User) => void;
  settingsForm: DashboardSettingsForm;
}

export default function useDashboardActions({
  loadProfile,
  overlayForm,
  overlayToken,
  setIsOverlayPaused,
  setOverlayForm,
  setShowRegenModal,
  setTestingSend,
  setUser,
  settingsForm,
}: DashboardActionArgs) {
  const saveSettings = async () => {
    try {
      setUser(await saveDashboardSettings(settingsForm));
      toast.success("Pengaturan berhasil disimpan!");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const saveOverlaySettings = async () => {
    try {
      setOverlayForm(mapOverlaySettingsToForm(await saveDashboardOverlaySettings(overlayForm)));
      toast.success("Pengaturan overlay berhasil disimpan!");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const regenerateKeys = async () => {
    try {
      await regenerateDashboardKeys();
      toast.success("Keys berhasil di-generate ulang!");
      setShowRegenModal(false);
      loadProfile();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const testOverlay = async () => {
    setTestingSend(true);
    try {
      const data = await sendOverlayTestNotification();
      toast.success(`Test notifikasi dikirim! (${data.donation.donor_name} — Rp${data.donation.amount.toLocaleString("id-ID")})`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setTestingSend(false);
    }
  };

  const replayDonation = async (donationId: string) => {
    try {
      const data = await replayOverlayDonation(donationId);
      toast.success(`🔄 Replay: ${data.donation.donor_name} — ${formatRupiah(data.donation.amount)}`);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const pauseOverlay = async () => {
    try {
      if (!overlayToken) throw new Error("Token overlay belum tersedia");
      const data = await toggleOverlayPause(overlayToken);
      const nextPaused = Boolean(data.paused);
      setIsOverlayPaused(nextPaused);
      toast.success(`Overlay ${nextPaused ? "di-pause" : "dijalankan kembali"}!`);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const skipOverlay = async () => {
    try {
      const data = await skipOverlayNotification();
      toast.success(data.emitted ? "1 notifikasi dilewati" : "Overlay belum terhubung");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return {
    logoutDashboardUser,
    pauseOverlay,
    regenerateKeys,
    replayDonation,
    saveOverlaySettings,
    saveSettings,
    skipOverlay,
    testOverlay,
  };
}
