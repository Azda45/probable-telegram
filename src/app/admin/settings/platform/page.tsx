"use client";

import { useState, useEffect } from "react";
import AdminSettingsTab from "@/fe/admin/components/AdminSettingsTab";

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
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: newSettings }),
      });
      if (res.ok) {
        alert("Platform settings saved successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save settings");
      }
    } catch (err) {
      alert("An error occurred while saving.");
    }
  };

  if (loading || !settings) {
    return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-slate-700 rounded w-3/4"></div></div></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Platform Settings</h1>
      <AdminSettingsTab initialSettings={settings} onSave={handleSave} />
    </div>
  );
}
