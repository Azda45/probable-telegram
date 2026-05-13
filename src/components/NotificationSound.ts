"use client";

/**
 * Notification Sound Player — spam-safe.
 * Creates a fresh Audio element for each play to avoid
 * conflicts when notifications overlap.
 */
export async function playNotificationSound(): Promise<void> {
  try {
    const audio = new Audio("/cutCaching.mp3");
    audio.volume = 1.0;

    // Auto-cleanup after playback finishes or errors out
    const cleanup = () => {
      audio.removeEventListener("ended", cleanup);
      audio.removeEventListener("error", cleanup);
      // Let GC handle the element — don't set src="" as it can
      // trigger spurious error events and corrupt audio state
    };
    audio.addEventListener("ended", cleanup);
    audio.addEventListener("error", cleanup);

    await audio.play();
  } catch {
    // Autoplay blocked or not supported — silently ignore
  }
}
