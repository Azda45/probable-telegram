"use client";

import { useState, useEffect } from "react";
import AdminBlacklistTab from "@/fe/admin/components/AdminBlacklistTab";

export default function AdminBlacklistPage() {
  const [words, setWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/moderation/blacklist")
      .then(res => res.json())
      .then(data => {
        if (data.words) setWords(data.words);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-slate-700 rounded w-3/4"></div></div></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Blacklist Words</h1>
      <AdminBlacklistTab initialWords={words} />
    </div>
  );
}
