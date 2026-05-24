import { toast } from "sonner";
import { formatRupiah } from "@/shared/utils";
import {
  deleteDashboardDonation,
  logoutDashboardUser,
  regenerateDashboardKeys,
  replayOverlayDonation,
  saveDashboardOverlaySettings,
  saveDashboardSettings,
  sendOverlayTestNotification,
  skipOverlayNotification,
  toggleOverlayCensor,
  toggleOverlayPause,
  triggerOverlayRefresh,
} from "../api";
import { mapOverlaySettingsToForm } from "../forms";
import type { User } from "@/shared/types/models";
import type { DashboardOverlayForm, DashboardSettingsForm } from "../types";

interface DashboardActionArgs {
  loadProfile: () => Promise<void>;
  loadDonations: (page?: number, filter?: any) => Promise<void>;
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
  loadDonations,
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

  const deleteDonation = async (donationId: string) => {
    if (!confirm("Hapus pesan donasi ini? (Pesan yang berisi kata tidak pantas dapat di-censor, atau dihapus sepenuhnya)")) return;
    try {
      await deleteDashboardDonation(donationId);
      toast.success("Pesan donasi berhasil dihapus");
      loadDonations();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const skipOverlay = async () => {
    try {
      if (!overlayToken) throw new Error("Token overlay belum tersedia");
      const data = await skipOverlayNotification(overlayToken);
      toast.success(data.emitted ? "1 notifikasi dilewati" : "Overlay belum terhubung");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const toggleCensorOverlay = async () => {
    try {
      if (!overlayToken) throw new Error("Token overlay belum tersedia");
      const data = await toggleOverlayCensor(overlayToken);
      toast.success(data.isCensored ? "Sensor Aktif" : "Sensor Dimatikan");
      return data.isCensored;
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const refreshOverlay = async () => {
    try {
      if (!overlayToken) throw new Error("Token overlay belum tersedia");
      const data = await triggerOverlayRefresh(overlayToken);
      toast.success(data.emitted ? "Perintah refresh dikirim" : "Overlay belum terhubung");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return {
    deleteDonation,
    logoutDashboardUser,
    pauseOverlay,
    regenerateKeys,
    replayDonation,
    saveOverlaySettings,
    saveSettings,
    skipOverlay,
    testOverlay,
    toggleCensorOverlay,
    refreshOverlay,
  };
}
