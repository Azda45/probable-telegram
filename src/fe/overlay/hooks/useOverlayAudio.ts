import { useEffect } from "react";
import {
  destroyAlertAudio,
  preloadAlertSounds,
  stopAlertSounds,
  unlockAlertAudio,
} from "../components/NotificationSound";

export default function useOverlayAudio() {
  useEffect(() => {
    preloadAlertSounds().catch((error) => {
      console.warn("Alert audio preload failed:", error);
    });

    const cleanupListeners = () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };

    const unlockAudio = () => {
      unlockAlertAudio().finally(cleanupListeners);
    };

    window.addEventListener("click", unlockAudio, { once: false });
    window.addEventListener("touchstart", unlockAudio, { once: false });
    window.addEventListener("keydown", unlockAudio, { once: false });

    return () => {
      cleanupListeners();
      stopAlertSounds();
      destroyAlertAudio();
    };
  }, []);
}
