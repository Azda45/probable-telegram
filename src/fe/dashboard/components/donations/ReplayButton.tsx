"use client";

import { useState } from "react";
import { Check, Play } from "lucide-react";

interface ReplayButtonProps {
  donationId: string;
  onReplay: (id: string) => Promise<void>;
}

export default function ReplayButton({ donationId, onReplay }: ReplayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onReplay(donationId);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || done}
      title="Tampilkan ulang di overlay"
      className={`px-2 py-1 inline-flex items-center justify-center gap-1 min-w-[75px] rounded-md text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
        done
          ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          : "border border-violet-500/25 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20"
      } ${loading || done ? "cursor-default" : "cursor-pointer"}`}
    >
      {loading ? "..." : done ? (
        <><Check className="w-3 h-3" /> Sent</>
      ) : (
        <><Play className="w-3 h-3" /> Replay</>
      )}
    </button>
  );
}
