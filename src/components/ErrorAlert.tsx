"use client";

interface ErrorAlertProps {
  message: string;
}

export default function ErrorAlert({ message }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-6 flex items-start gap-3">
      <span className="text-base leading-none mt-0.5 shrink-0">⚠️</span>
      <span>{message}</span>
    </div>
  );
}
