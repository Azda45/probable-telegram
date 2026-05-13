"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { playNotificationSound } from "@/components/NotificationSound";
import { formatRupiah } from "@/lib/utils";
import type { OverlayNotification } from "@/lib/types";

interface Settings {
  alert_duration: number;
  alert_sound: string;
  tts_enabled: boolean;
  tts_voice?: string;
}

// ── Audio Manager ──
// Creates a fresh Audio element per notification.
// Uses a "resolved" guard to prevent double-resolve bugs.
class TTSAudioManager {
  private currentAudio: HTMLAudioElement | null = null;

  /** Stop current HTML5 Audio playback */
  stopAudio() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.src = "";
      } catch { /* ignore */ }
      this.currentAudio = null;
    }
  }

  /** Cancel SpeechSynthesis — call ONLY right before a new speak() */
  private cancelSpeech() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Play Cloud TTS (Google Translate).
   * Waits for "canplaythrough" before calling play() to avoid
   * premature play failures on slow connections.
   */
  playCloud(url: string): Promise<void> {
    this.stopAudio();
    this.cancelSpeech();

    return new Promise<void>((resolve) => {
      let resolved = false;
      const done = () => {
        if (resolved) return; // ← Guard: only resolve once
        resolved = true;
        audio.removeEventListener("ended", done);
        audio.removeEventListener("error", done);
        if (this.currentAudio === audio) this.currentAudio = null;
        resolve();
      };

      const audio = new Audio();
      audio.volume = 1.0;
      audio.preload = "auto";
      this.currentAudio = audio;

      audio.addEventListener("ended", done);
      audio.addEventListener("error", done);

      // Safety timeout: force-resolve if audio hangs
      setTimeout(done, 20000);

      // Wait for enough data before playing
      audio.addEventListener(
        "canplaythrough",
        () => {
          if (resolved) return;
          audio.play().catch(done);
        },
        { once: true }
      );

      // Set src last — this triggers loading
      audio.src = url;

      // Fallback: if canplaythrough doesn't fire in 5s, try play anyway
      setTimeout(() => {
        if (resolved) return;
        audio.play().catch(done);
      }, 5000);
    });
  }

  /**
   * Play Browser SpeechSynthesis (male voices).
   * Includes 150ms delay after cancel() to avoid Chrome silence bug.
   */
  playSpeech(text: string, lang: string): Promise<void> {
    this.stopAudio();
    this.cancelSpeech();

    return new Promise<void>((resolve) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        resolve();
        return;
      }

      let resolved = false;
      const done = () => {
        if (resolved) return;
        resolved = true;
        resolve();
      };

      // Chrome workaround: 150ms delay after cancel() before speak()
      setTimeout(() => {
        if (resolved) return;

        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const targetLang = lang.split("-")[1] || "id";

        // Find best male voice
        const maleVoice =
          voices.find(
            (v) =>
              v.lang.startsWith(targetLang) &&
              (v.name.toLowerCase().includes("male") ||
                v.name.toLowerCase().includes("david") ||
                v.name.toLowerCase().includes("alex"))
          ) ||
          voices.find((v) => v.lang.startsWith(targetLang)) ||
          voices[0];

        if (maleVoice) utterance.voice = maleVoice;
        utterance.rate = 0.9;
        utterance.pitch = 0.8;

        utterance.onend = done;
        utterance.onerror = done;

        // Safety timeout
        setTimeout(done, 15000);

        window.speechSynthesis.speak(utterance);
      }, 150);
    });
  }

  /** Full cleanup — only for unmount */
  destroy() {
    this.stopAudio();
    this.cancelSpeech();
  }
}

function OverlayContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [current, setCurrent] = useState<OverlayNotification | null>(null);
  const [isShowing, setIsShowing] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);

  const settingsRef = useRef<Settings | null>(null);
  const queueRef = useRef<OverlayNotification[]>([]);
  const showingRef = useRef(false);
  const activeNotifIdRef = useRef<string | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audioManagerRef = useRef(new TTSAudioManager());

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const addTimer = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  // Initialize audio unlock on mount
  useEffect(() => {
    const unlockAudio = () => {
      const dummyAudio = new Audio(
        "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"
      );
      dummyAudio.play().catch(() => {});

      if ("speechSynthesis" in window) {
        const u = new SpeechSynthesisUtterance("");
        u.volume = 0;
        window.speechSynthesis.speak(u);
      }

      setAudioBlocked(false);
    };

    window.addEventListener("click", unlockAudio, { once: false });
    window.addEventListener("touchstart", unlockAudio, { once: false });
    window.addEventListener("keydown", unlockAudio, { once: false });

    // Pre-load voices for SpeechSynthesis
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }

    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      audioManagerRef.current.destroy();
      clearAllTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showNotification = useCallback(
    (notif: OverlayNotification) => {
      clearAllTimers();

      showingRef.current = true;
      activeNotifIdRef.current = notif.id;
      setCurrent(notif);
      setIsShowing(true);

      // Play notification alert sound
      if (settingsRef.current?.alert_sound !== "none") {
        playNotificationSound().catch(() => {});
      }

      // Helper: slide out → clear → next
      const hideAndNext = () => {
        if (activeNotifIdRef.current !== notif.id) return;
        setIsShowing(false);

        addTimer(() => {
          if (activeNotifIdRef.current === notif.id) {
            setCurrent(null);
            showingRef.current = false;
            activeNotifIdRef.current = null;
          }

          fetch(`/api/overlay?token=${token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ donationId: notif.id }),
          }).catch(() => {});

          if (queueRef.current.length > 0) {
            const next = queueRef.current.shift()!;
            addTimer(() => showNotification(next), 3000);
          }
        }, 600);
      };

      // TTS-aware display timing
      if (settingsRef.current?.tts_enabled) {
        const text = `${notif.donor_name} berdonasi sebesar ${notif.amount} rupiah. ${notif.message || ""}`;
        const lang = settingsRef.current?.tts_voice || "id";
        const showStartTime = Date.now();
        const MIN_DISPLAY_MS = 3000;

        let ttsDoneHandled = false;
        const onTTSDone = () => {
          if (ttsDoneHandled || activeNotifIdRef.current !== notif.id) return;
          ttsDoneHandled = true;

          const elapsed = Date.now() - showStartTime;
          const remainingMinDisplay = Math.max(0, MIN_DISPLAY_MS - elapsed);
          const holdDelay = Math.max(remainingMinDisplay, 1500);
          addTimer(hideAndNext, holdDelay);
        };

        // Start TTS after 1s
        addTimer(async () => {
          const splitText = (str: string, limit: number) => {
            const words = str.split(" ");
            const chunks: string[] = [];
            let currentStr = "";
            for (const word of words) {
              if ((currentStr + word).length > limit) {
                chunks.push(currentStr.trim());
                currentStr = word + " ";
              } else {
                currentStr += word + " ";
              }
            }
            if (currentStr) chunks.push(currentStr.trim());
            return chunks;
          };

          const chunks = splitText(text, 180);

          for (const chunk of chunks) {
            if (activeNotifIdRef.current !== notif.id) break;

            try {
              if (lang.startsWith("male-")) {
                await audioManagerRef.current.playSpeech(chunk, lang);
              } else {
                const ttsUrl = `/api/tts?voice=${lang}&text=${encodeURIComponent(chunk)}`;
                await audioManagerRef.current.playCloud(ttsUrl);
              }
            } catch (err) {
              console.error("TTS chunk playback failed:", err);
            }
          }

          if (activeNotifIdRef.current === notif.id) {
            onTTSDone();
          }
        }, 1000);
      } else {
        // No TTS: use fixed alert_duration
        const duration = (settingsRef.current?.alert_duration || 5) * 1000;
        addTimer(hideAndNext, duration);
      }
    },
    [token, clearAllTimers, addTimer]
  );

  // Stable polling effect
  useEffect(() => {
    if (!token) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/overlay?token=${token}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.settings) {
          settingsRef.current = data.settings;
        }

        if (data.notifications && data.notifications.length > 0) {
          for (const notif of data.notifications as OverlayNotification[]) {
            if (seenIdsRef.current.has(notif.id)) continue;
            seenIdsRef.current.add(notif.id);

            if (
              typeof notif.amount !== "number" ||
              isNaN(notif.amount) ||
              notif.amount <= 0
            ) {
              fetch(`/api/overlay?token=${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ donationId: notif.id }),
              }).catch(() => {});
              continue;
            }

            if (showingRef.current) {
              queueRef.current.push(notif);
            } else {
              showNotification(notif);
            }
          }
        }
      } catch {
        // ignore polling errors
      }
    };

    const interval = setInterval(poll, 3000);
    poll();

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#f87171" }}>
        Token overlay tidak ditemukan. Tambahkan ?token=YOUR_TOKEN di URL.
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "2rem",
        background: "transparent",
        overflow: "hidden",
      }}
    >
      {current && (
        <div
          style={{
            animation: isShowing
              ? "overlaySlideIn 0.5s ease-out forwards"
              : "overlaySlideOut 0.5s ease-in forwards",
            width: 420,
            maxWidth: "90vw",
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(15,15,35,0.95), rgba(26,26,46,0.95))",
              border: "1px solid rgba(139,92,246,0.4)",
              borderRadius: 20,
              padding: "1.5rem 2rem",
              backdropFilter: "blur(20px)",
              animation: "overlayPulse 2s ease-in-out infinite",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Glow effect */}
            <div
              style={{
                position: "absolute",
                top: -50,
                left: "50%",
                transform: "translateX(-50%)",
                width: 200,
                height: 100,
                background:
                  "radial-gradient(ellipse, rgba(139,92,246,0.3), transparent)",
                animation: "overlayGlow 2s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />

            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "0.75rem",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  flexShrink: 0,
                }}
              >
                💜
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 800,
                    color: "#f1f5f9",
                  }}
                >
                  {current.donor_name}
                </div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 900,
                    background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {formatRupiah(current.amount)}
                </div>
              </div>
            </div>

            {/* Message */}
            {current.message && (
              <div
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 12,
                  padding: "0.75rem 1rem",
                  fontSize: "0.9375rem",
                  color: "#cbd5e1",
                  lineHeight: 1.5,
                  position: "relative",
                  zIndex: 1,
                  borderLeft: "3px solid rgba(139,92,246,0.5)",
                }}
              >
                {current.message}
              </div>
            )}
          </div>
        </div>
      )}

      {audioBlocked && (
        <div
          onClick={() => {
            const dummyAudio = new Audio(
              "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"
            );
            dummyAudio.play().catch(() => {});

            if ("speechSynthesis" in window) {
              const u = new SpeechSynthesisUtterance("");
              u.volume = 0;
              window.speechSynthesis.speak(u);
            }

            setAudioBlocked(false);
          }}
          style={{
            position: "fixed",
            bottom: "1rem",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(239, 68, 68, 0.2)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            color: "#fca5a5",
            padding: "4px 8px",
            borderRadius: 6,
            fontSize: "0.7rem",
            cursor: "pointer",
            zIndex: 9999,
          }}
        >
          🔇 Klik di sini untuk izinkan suara
        </div>
      )}
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
