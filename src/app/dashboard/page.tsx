"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import DonationTable from "@/fe/dashboard/components/DonationTable";
import Footer from "@/components/Footer";
import DashboardHeader from "@/fe/dashboard/components/DashboardHeader";
import DashboardQuickLinks from "@/fe/dashboard/components/DashboardQuickLinks";
import DashboardSkeleton from "@/fe/dashboard/components/DashboardSkeleton";
import DashboardTabs, { type DashboardTab } from "@/fe/dashboard/components/DashboardTabs";
import OverviewTab from "@/fe/dashboard/components/OverviewTab";
import PayoutsTab from "@/fe/dashboard/components/PayoutsTab";
import OverlayControlTab from "@/fe/dashboard/components/OverlayControlTab";
import RegenerateKeysModal from "@/fe/dashboard/components/RegenerateKeysModal";
import SettingsTab from "@/fe/dashboard/components/SettingsTab";
import useDashboard from "@/fe/dashboard/hooks/useDashboard";

export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<DashboardTab>("overview");
  const dashboard = useDashboard();

  if (dashboard.loading) return <DashboardSkeleton />;
  if (!dashboard.user) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const donateUrl = `${origin}/donate/${dashboard.user.username}`;
  const overlayUrl = dashboard.overlayToken ? `${origin}/overlay?token=${dashboard.overlayToken}` : "";
  const controlUrl = dashboard.overlayToken ? `${origin}/overlay/control?token=${dashboard.overlayToken}` : "";
  
  // RAW API URLs for Stream Deck / Macro tools
  const pauseApiUrl = dashboard.overlayToken ? `${origin}/api/overlay/control/pause?token=${dashboard.overlayToken}` : "";
  const skipApiUrl = dashboard.overlayToken ? `${origin}/api/overlay/control/skip?token=${dashboard.overlayToken}` : "";
  const censorApiUrl = dashboard.overlayToken ? `${origin}/api/overlay/control/censor?token=${dashboard.overlayToken}` : "";
  const testApiUrl = dashboard.overlayToken ? `${origin}/api/overlay/control/test?token=${dashboard.overlayToken}` : "";
  const refreshApiUrl = dashboard.overlayToken ? `${origin}/api/overlay/control/refresh?token=${dashboard.overlayToken}` : "";

  const handleLogout = async () => {
    await dashboard.logoutDashboardUser();
    router.push("/");
  };

  return (
    <div className="min-h-screen">
      <Navbar user={dashboard.user} onLogout={handleLogout} />

      <div className="container">
        <DashboardHeader displayName={dashboard.user.display_name} />
        <DashboardQuickLinks
          donateUrl={donateUrl}
          overlayUrl={overlayUrl}
        />
        <DashboardTabs
          activeTab={tab}
          onChange={(nextTab) => {
            setTab(nextTab);
            if (nextTab === "donations") dashboard.loadDonations();
          }}
        />

        {tab === "overview" && dashboard.stats && (
          <OverviewTab
            stats={dashboard.stats}
            showBalance={dashboard.showBalance}
            onToggleBalance={() => dashboard.setShowBalance(!dashboard.showBalance)}
          />
        )}

        {tab === "donations" && (
          <DonationTable
            donations={dashboard.donations}
            page={dashboard.donationPage}
            total={dashboard.donationTotal}
            perPage={dashboard.DONATIONS_PER_PAGE}
            onPageChange={(page) => dashboard.loadDonations(page, dashboard.donationFilter)}
            onReplay={dashboard.replayDonation}
            onDelete={dashboard.deleteDonation}
          />
        )}

        {tab === "payouts" && dashboard.stats && (
          <PayoutsTab balance={dashboard.stats.balance} />
        )}

        {tab === "overlay-control" && (
          <OverlayControlTab
            controlUrl={controlUrl}
            pauseApiUrl={pauseApiUrl}
            skipApiUrl={skipApiUrl}
            censorApiUrl={censorApiUrl}
            testApiUrl={testApiUrl}
            refreshApiUrl={refreshApiUrl}
            testingSend={dashboard.testingSend}
            isOverlayPaused={dashboard.isOverlayPaused}
            onTestOverlay={dashboard.testOverlay}
            onPauseOverlay={dashboard.pauseOverlay}
            onSkipOverlay={dashboard.skipOverlay}
            onToggleCensorOverlay={dashboard.toggleCensorOverlay}
            onRefreshOverlay={dashboard.refreshOverlay}
            onRegenerate={() => dashboard.setShowRegenModal(true)}
          />
        )}

        {tab === "settings" && (
          <SettingsTab
            settingsForm={dashboard.settingsForm}
            overlayForm={dashboard.overlayForm}
            overlayPreviewNonce={dashboard.overlayPreviewNonce}
            setSettingsForm={dashboard.setSettingsForm}
            setOverlayForm={dashboard.setOverlayForm}
            setOverlayPreviewNonce={dashboard.setOverlayPreviewNonce}
            onSaveSettings={dashboard.saveSettings}
            onSaveOverlaySettings={dashboard.saveOverlaySettings}
          />
        )}
      </div>

      {dashboard.showRegenModal && (
        <RegenerateKeysModal onCancel={() => dashboard.setShowRegenModal(false)} onConfirm={dashboard.regenerateKeys} />
      )}
      <Footer />
    </div>
  );
}
