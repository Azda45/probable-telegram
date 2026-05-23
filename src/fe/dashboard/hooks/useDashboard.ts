import { useCallback, useEffect, useState } from "react";
import { fetchDashboardDonations, fetchDashboardProfile } from "../api";
import {
  initialDashboardOverlayForm,
  initialDashboardSettingsForm,
  mapOverlaySettingsToForm,
  mapUserToSettingsForm,
} from "../forms";
import type { DonationRecord, DonationStats, User } from "@/shared/types/models";
import type { DashboardOverlayForm, DashboardSettingsForm, DonationFilter } from "../types";
import useAutoHideBalance from "./useAutoHideBalance";
import useDashboardActions from "./useDashboardActions";

const DONATIONS_PER_PAGE = 15;

export default function useDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [overlayToken, setOverlayToken] = useState("");
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [donationPage, setDonationPage] = useState(1);
  const [donationTotal, setDonationTotal] = useState(0);
  const [donationFilter] = useState<DonationFilter>("success");
  const [loading, setLoading] = useState(true);
  const [testingSend, setTestingSend] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [isOverlayPaused, setIsOverlayPaused] = useState(false);
  const [overlayPreviewNonce, setOverlayPreviewNonce] = useState(0);
  const [settingsForm, setSettingsForm] = useState<DashboardSettingsForm>(initialDashboardSettingsForm);
  const [overlayForm, setOverlayForm] = useState<DashboardOverlayForm>(initialDashboardOverlayForm);

  useAutoHideBalance(showBalance, setShowBalance);

  const loadProfile = useCallback(async () => {
    try {
      const data = await fetchDashboardProfile();
      const overlaySettings = data.overlaySettings || {};

      setOverlayToken(data.overlayToken);
      setUser(data.user);
      setStats(data.stats);
      setSettingsForm(mapUserToSettingsForm(data.user));
      setOverlayForm(mapOverlaySettingsToForm(overlaySettings));
    } catch {
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDonations = useCallback(async (page = 1, filter: DonationFilter = "all") => {
    try {
      const data = await fetchDashboardDonations(page, filter);
      setDonations(data.donations);
      setDonationTotal(data.total);
      setDonationPage(page);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadProfile();
      loadDonations(1, donationFilter);
    });
  }, [loadProfile, loadDonations, donationFilter]);

  const actions = useDashboardActions({
    loadProfile,
    overlayForm,
    overlayToken,
    setIsOverlayPaused,
    setOverlayForm,
    setShowRegenModal,
    setTestingSend,
    setUser,
    settingsForm,
  });

  return {
    DONATIONS_PER_PAGE,
    donationFilter,
    donationPage,
    donationTotal,
    donations,
    isOverlayPaused,
    loading,
    loadDonations,
    logoutDashboardUser: actions.logoutDashboardUser,
    overlayForm,
    overlayPreviewNonce,
    overlayToken,
    pauseOverlay: actions.pauseOverlay,
    regenerateKeys: actions.regenerateKeys,
    replayDonation: actions.replayDonation,
    saveOverlaySettings: actions.saveOverlaySettings,
    saveSettings: actions.saveSettings,
    setOverlayForm,
    setOverlayPreviewNonce,
    setSettingsForm,
    setShowBalance,
    setShowRegenModal,
    settingsForm,
    showBalance,
    showRegenModal,
    stats,
    testingSend,
    skipOverlay: actions.skipOverlay,
    testOverlay: actions.testOverlay,
    user,
  };
}
