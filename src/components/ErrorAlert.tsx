"use client";

interface ErrorAlertProps {
  message: string;
}

export default function ErrorAlert({ message }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <div
      style={{
        padding: "0.75rem 1rem",
        background: "rgba(239,68,68,0.1)",
        border: "1px solid rgba(239,68,68,0.2)",
        borderRadius: 10,
        color: "#f87171",
        fontSize: "0.875rem",
        marginBottom: "1.5rem",
      }}
    >
      {message}
    </div>
  );
}
