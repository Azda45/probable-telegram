"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useOverlay, type OverlayTimerState } from "@/fe/overlay/hooks/useOverlay";
import { getOverlayAnimationCss } from "@/shared/overlay-animation";
import { getOverlayAppearance } from "@/shared/overlay-appearance";
import OverlayAlertCard from "@/fe/overlay/components/OverlayAlertCard";

const TIMER_PHASE_ACCENT: Record<OverlayTimerState["phase"], string> = {
  enter: "#38bdf8",
  alert: "#818cf8",
  exit: "#fb923c",
};

function formatTimerSeconds(ms: number): string {
  return `${(Math.max(0, ms) / 1000).toFixed(1)}s`;
}

function formatQueuedCount(count: number): string {
  return count > 99 ? "99+" : String(count);
}

function PausedBadge({ queuedCount, floating = false }: { queuedCount: number; floating?: boolean }) {
  const positionClass = floating
    ? "pointer-events-none absolute left-0 top-full mt-3"
    : "fixed left-[5%] top-1/2 -translate-y-1/2";

  return (
    <div className={`${positionClass} inline-flex items-center justify-center whitespace-nowrap rounded-full border border-white/35 bg-rose-600/95 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-white shadow-[0_0_24px_rgba(244,63,94,0.75)] backdrop-blur-sm`}>
      Paused · {formatQueuedCount(queuedCount)} pesan menumpuk
    </div>
  );
}

function OverlayTimer({ timer, progressColor }: { timer: OverlayTimerState; progressColor: string }) {
  const progress = Math.min(100, Math.max(0, timer.progress * 100));
  const accent = timer.phase === "alert" ? progressColor : TIMER_PHASE_ACCENT[timer.phase];

  return (
    <div className="mt-3 flex w-full items-center gap-3 rounded-full border border-[#334155]/70 bg-[#0f172a]/75 px-3 py-2 shadow-lg backdrop-blur-sm">
      <div
        aria-label="Durasi overlay"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(progress)}
        className="h-2 flex-1 overflow-hidden rounded-full bg-[#1e293b]"
        role="progressbar"
      >
        <div
          className="h-full rounded-full transition-[width] duration-100 ease-linear"
          style={{ width: `${progress}%`, backgroundColor: accent }}
        />
      </div>
      <span className="min-w-[3.25rem] text-right text-xs font-semibold tabular-nums text-[#cbd5e1]">
        {formatTimerSeconds(timer.totalRemainingMs)}
      </span>
    </div>
  );
}

function OverlayContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? null;
  const { current, isShowing, isResumedAlert, isPaused, isCensored, queuedCount, overlayStyle, overlayAnimation, overlayColors, overlayTimer } = useOverlay(token);
  const shadowParam = searchParams?.get("shadow") ?? overlayStyle;
  const { wrapperClass, shadowClass } = getOverlayAppearance(shadowParam);

  if (!token) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#f87171" }}>
        Token overlay tidak ditemukan. Tambahkan ?token=YOUR_TOKEN di URL.
      </div>
    );
  }

  const alertAnimation = isShowing && isResumedAlert
    ? "none"
    : getOverlayAnimationCss(overlayAnimation, isShowing ? "enter" : "exit");

  const alertAnimationWithState = alertAnimation === "none"
    ? "none"
    : `${alertAnimation} ${isPaused ? "paused" : "running"}`;

  return (
    <div className="w-screen h-screen flex items-center justify-center px-[5%] py-2 bg-transparent overflow-hidden box-border">
      {current ? (
        <div
          className={`${wrapperClass} overlay-alert-shell relative`}
          style={{
            animation: alertAnimationWithState,
          }}
        >
          <OverlayAlertCard
            donorName={current.donor_name}
            amount={current.amount}
            message={isCensored && current.message ? "*****************" : current.message}
            shadowClass={shadowClass}
            colors={overlayColors}
          />
          {overlayTimer && overlayColors.overlay_progress_enabled && (
            <OverlayTimer timer={overlayTimer} progressColor={overlayColors.overlay_progress_color} />
          )}
          {isPaused && <PausedBadge queuedCount={queuedCount} floating />}
        </div>
      ) : isPaused ? (
        <PausedBadge queuedCount={queuedCount} />
      ) : null}
    </div>
  );
}

export default function OverlayPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            width: "100vw",
            height: "100vh",
            background: "transparent",
          }}
        />
      }
    >
      <OverlayContent />
    </Suspense>
  );
}
