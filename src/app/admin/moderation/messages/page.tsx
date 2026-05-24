"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import AdminMessagesTab from "@/fe/admin/components/AdminMessagesTab";
import AdminLoadingSkeleton from "@/fe/admin/components/AdminLoadingSkeleton";

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
    try {
      const res = await fetch(`/api/admin/moderation/messages/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMessages(messages.map(m => m.id === id ? { ...m, message: "[Pesan telah dihapus oleh Admin]" } : m));
        toast.success("Pesan berhasil dihapus/disensor.");
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal menghapus pesan.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan.");
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Pesan Donasi</h1>
        <AdminLoadingSkeleton type="table" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Pesan Donasi</h1>
      <AdminMessagesTab messages={messages} onDelete={handleDelete} />
    </div>
  );
}
