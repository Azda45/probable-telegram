"use client";

import { useEffect, useState, useCallback } from "react";

interface ToastData {
  type: "success" | "error";
  message: string;
}

// Global toast trigger (simple pub/sub)
type ToastListener = (data: ToastData) => void;
const listeners: Set<ToastListener> = new Set();

export function showToast(type: "success" | "error", message: string) {
  listeners.forEach((fn) => fn({ type, message }));
}

export default function Toast() {
  const [toast, setToast] = useState<ToastData | null>(null);

  const handler = useCallback((data: ToastData) => {
    setToast(data);
  }, []);

  useEffect(() => {
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, [handler]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  return (
    <div className={`toast toast-${toast.type}`}>
      {toast.message}
    </div>
  );
}
