"use client";

import { useState, useEffect } from "react";
import AdminSettingsTab from "@/fe/admin/components/AdminSettingsTab";
import AdminLoadingSkeleton from "@/fe/admin/components/AdminLoadingSkeleton";

export default function AdminPlatformSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        if (data.settings) setSettings(data.settings);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (newSettings: Record<string, string>) => {
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: newSettings }),
    });
    if (!res.ok) {
      throw new Error("Failed to save");
    }
  };

  if (loading || !settings) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Pengaturan Platform</h1>
        <AdminLoadingSkeleton type="settings" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Pengaturan Platform</h1>
      <AdminSettingsTab initialSettings={settings} onSave={handleSave} />
    </div>
  );
}
