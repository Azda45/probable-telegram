"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { formatRupiah } from "@/lib/utils";
import { useOverlay } from "@/hooks/useOverlay";

function OverlayContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? null;
  const { current, isShowing, isResumedAlert, overlayStyle } = useOverlay(token);
  const shadowParam = searchParams?.get("shadow") ?? overlayStyle;

  let wrapperClass = "w-full max-w-[95%]";
  let shadowClass = "";

  if (shadowParam === "right") {
    wrapperClass += " mr-4 mt-4";
    shadowClass = "shadow-[8px_-8px_0px_#6366f1]";
  } else if (shadowParam === "left") {
    wrapperClass += " ml-4 mt-4";
    shadowClass = "shadow-[-8px_-8px_0px_#6366f1]";
  } else {
    wrapperClass += " mt-2";
    shadowClass = "shadow-lg";
  }

  if (!token) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#f87171" }}>
        Token overlay tidak ditemukan. Tambahkan ?token=YOUR_TOKEN di URL.
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center px-[5%] py-2 bg-transparent overflow-hidden box-border">
      {current && (
        <div
          className={wrapperClass}
          style={{
            animation: isShowing
              ? isResumedAlert
                ? "none"
                : "overlaySlideIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards"
              : "overlaySlideOut 0.5s ease-in forwards",
          }}
        >
          <div className={`w-full bg-[#1e293b] border-2 border-[#334155] rounded-2xl px-8 py-10 md:py-12 flex flex-col items-center justify-center text-center relative min-h-[160px] ${shadowClass}`}>
            
            {/* Main Text */}
            <div className="text-2xl md:text-3xl font-bold tracking-wide text-[#fafafa] mt-2">
              <span className="text-[#818cf8]">{current.donor_name}</span>{" "}
              berdonasi{" "}
              <span className="text-[#818cf8]">{formatRupiah(current.amount)}</span>
            </div>

            {/* Message */}
            {current.message && (
              <div className="mt-4 text-xl md:text-2xl text-[#a1a1aa] font-medium">
                {current.message}
              </div>
            )}
          </div>
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
