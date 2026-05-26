"use client";

import { useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { Bell, Eye, EyeOff, PauseCircle, PlayCircle, RefreshCw, SkipForward } from "lucide-react";
import {
  sendOverlayTestNotification,
  skipOverlayNotification,
  toggleOverlayCensor,
  toggleOverlayPause,
  triggerOverlayRefresh,
} from "@/fe/dashboard/api";
import { toast } from "sonner";

export default function OverlayControlPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const [testingSend, setTestingSend] = useState(false);
  const [isOverlayPaused, setIsOverlayPaused] = useState(false);
  const [isCensored, setIsCensored] = useState(false);

  const handleTestOverlay = useCallback(async () => {
    if (!token) return;
    try {
      setTestingSend(true);
      await sendOverlayTestNotification(token);
      toast.success("Notifikasi test berhasil dikirim.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setTestingSend(false);
    }
  }, [token]);

  const handlePauseOverlay = useCallback(async () => {
    if (!token) return;
    try {
      const res = await toggleOverlayPause(token);
      setIsOverlayPaused(res.paused);
      toast.success(res.paused ? "Overlay Dipause" : "Overlay Dilanjutkan");
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [token]);

  const handleSkipOverlay = useCallback(async () => {
    if (!token) return;
    try {
      await skipOverlayNotification(token);
      toast.success("Notifikasi Di-skip");
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [token]);

  const handleToggleCensorOverlay = useCallback(async () => {
    if (!token) return;
    try {
      const res = await toggleOverlayCensor(token);
      setIsCensored(res.isCensored);
      toast.success(res.isCensored ? "Sensor Aktif" : "Sensor Dimatikan");
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [token]);

  const handleRefreshOverlay = useCallback(async () => {
    if (!token) return;
    try {
      await triggerOverlayRefresh(token);
      toast.success("Overlay Di-refresh");
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [token]);

  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center text-red-400 p-4">Token overlay tidak valid atau tidak ditemukan.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-2">Remote Control</h1>
        <p className="text-[var(--color-text-secondary)] text-center mb-8 text-sm">
          Kontrol overlay OBS Anda dari perangkat ini.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            className="btn btn-secondary flex-col gap-2 h-24"
            onClick={handleTestOverlay}
            disabled={testingSend}
          >
            <Bell className="w-6 h-6" />
            <span>{testingSend ? "Sending..." : "Test Notif"}</span>
          </button>
          
          <button
            className={`btn flex-col gap-2 h-24 ${isOverlayPaused ? "btn-primary" : "btn-secondary"}`}
            onClick={handlePauseOverlay}
          >
            {isOverlayPaused ? <PlayCircle className="w-6 h-6" /> : <PauseCircle className="w-6 h-6" />}
            <span>{isOverlayPaused ? "Resume" : "Pause"}</span>
          </button>
          
          <button
            className="btn btn-secondary flex-col gap-2 h-24"
            onClick={handleSkipOverlay}
          >
            <SkipForward className="w-6 h-6" />
            <span>Skip</span>
          </button>
          
          <button
            className={`btn flex-col gap-2 h-24 ${isCensored ? "btn-primary" : "btn-secondary"}`}
            onClick={handleToggleCensorOverlay}
          >
            {isCensored ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
            <span>{isCensored ? "Unsensor" : "Sensor"}</span>
          </button>
          
          <button
            className="btn btn-secondary flex-col gap-2 h-24 col-span-2"
            onClick={handleRefreshOverlay}
          >
            <RefreshCw className="w-6 h-6" />
            <span>Refresh Overlay</span>
          </button>
        </div>
      </div>
    </div>
  );
}
