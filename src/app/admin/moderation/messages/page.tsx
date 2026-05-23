"use client";

import { useState, useEffect } from "react";
import AdminMessagesTab from "@/fe/admin/components/AdminMessagesTab";

export default function AdminModerationMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/moderation/messages")
      .then(res => res.json())
      .then(data => {
        if (data.messages) setMessages(data.messages);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(`Hapus (sensor) pesan ini secara permanen?`)) return;

    try {
      const res = await fetch(`/api/admin/moderation/messages/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMessages(messages.map(m => m.id === id ? { ...m, message: "[Pesan telah dihapus oleh Admin]" } : m));
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus pesan");
      }
    } catch (err) {
      alert("Terjadi kesalahan");
    }
  };

  if (loading) {
    return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-slate-700 rounded w-3/4"></div></div></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Pesan Donasi</h1>
      <AdminMessagesTab messages={messages} onDelete={handleDelete} />
    </div>
  );
}
