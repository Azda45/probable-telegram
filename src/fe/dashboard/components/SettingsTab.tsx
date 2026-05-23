"use client";

import type { Dispatch, SetStateAction } from "react";
import type { DashboardOverlayForm, DashboardSettingsForm } from "../types";
import ProfileSettingsCard from "./settings/ProfileSettingsCard";
import DonationSettingsCard from "./settings/DonationSettingsCard";
import OverlaySettingsCard from "./settings/OverlaySettingsCard";

interface SettingsTabProps {
  settingsForm: DashboardSettingsForm;
  overlayForm: DashboardOverlayForm;
  overlayPreviewNonce: number;
  setSettingsForm: Dispatch<SetStateAction<DashboardSettingsForm>>;
  setOverlayForm: Dispatch<SetStateAction<DashboardOverlayForm>>;
  setOverlayPreviewNonce: Dispatch<SetStateAction<number>>;
  onSaveSettings: () => void;
  onSaveOverlaySettings: () => void;
}

export default function SettingsTab({
  settingsForm,
  overlayForm,
  overlayPreviewNonce,
  setSettingsForm,
  setOverlayForm,
  setOverlayPreviewNonce,
  onSaveSettings,
  onSaveOverlaySettings,
}: SettingsTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start max-w-5xl" style={{ gap: "1.5rem" }}>
      <div className="flex flex-col gap-6">
        <ProfileSettingsCard settingsForm={settingsForm} setSettingsForm={setSettingsForm} onSaveSettings={onSaveSettings} />
      </div>
      <div className="flex flex-col gap-6">
        <DonationSettingsCard
          settingsForm={settingsForm}
          setSettingsForm={setSettingsForm}
          onSaveSettings={onSaveSettings}
        />
        <OverlaySettingsCard
          overlayForm={overlayForm}
          overlayPreviewNonce={overlayPreviewNonce}
          setOverlayForm={setOverlayForm}
          setOverlayPreviewNonce={setOverlayPreviewNonce}
          onSaveOverlaySettings={onSaveOverlaySettings}
        />
      </div>
    </div>
  );
}
