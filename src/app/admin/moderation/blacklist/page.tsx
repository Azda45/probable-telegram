"use client";

import { useState, useEffect } from "react";
import AdminBlacklistTab from "@/fe/admin/components/AdminBlacklistTab";
import AdminLoadingSkeleton from "@/fe/admin/components/AdminLoadingSkeleton";

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
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Kata Terlarang</h1>
        <AdminLoadingSkeleton type="table" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Kata Terlarang</h1>
      <AdminBlacklistTab initialWords={words} />
    </div>
  );
}
