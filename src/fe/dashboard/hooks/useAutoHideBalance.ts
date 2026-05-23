import { useEffect } from "react";

export default function useAutoHideBalance(showBalance: boolean, setShowBalance: (visible: boolean) => void) {
  useEffect(() => {
    if (!showBalance) return;

    let timeout: NodeJS.Timeout;
    let lastActivityReset = Date.now();
    const hide = () => setShowBalance(false);

    timeout = setTimeout(hide, 30000);

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivityReset > 1000) {
        lastActivityReset = now;
        clearTimeout(timeout);
        timeout = setTimeout(hide, 60000);
      }
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleActivity);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
    };
  }, [showBalance, setShowBalance]);
}
