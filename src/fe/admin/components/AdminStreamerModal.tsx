"use client";

import { X, ExternalLink } from "lucide-react";
import { getAvatarUrl } from "@/shared/avatar";
import { toast } from "sonner";
import Image from "next/image";

interface AdminStreamerModalProps {
  user: any;
  onClose: () => void;
}

export default function AdminStreamerModal({ user, onClose }: AdminStreamerModalProps) {
  if (!user) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const donateUrl = `${origin}/donate/${user.username}`;
  const overlayUrl = user.overlay_token ? `${origin}/overlay?token=${user.overlay_token}` : "";

  const handleToggleAdmin = async () => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}/admin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_admin: !user.is_admin })
      });
      if (res.ok) {
        toast.success(user.is_admin ? "Akses admin berhasil dicabut." : "Akses admin berhasil diberikan.");
        window.location.reload();
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal mengubah status admin.");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan.");
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Detail Streamer
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors text-[var(--color-text-muted)] hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-6 mb-8">
            <Image
              src={getAvatarUrl(user.display_name, user.avatar_url)}
              alt="Avatar"
              width={80}
              height={80}
              unoptimized
              className="rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-border)]"
            />
            <div className="flex-1">
              <h3 className="text-2xl font-bold">{user.display_name}</h3>
              <p className="text-[var(--color-text-muted)]">@{user.username} • {user.email}</p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-surface-hover)] rounded-full text-sm font-medium border border-[var(--color-border)]">
                Status: 
                <span className={user.is_active && !user.banned_at ? "text-green-400" : "text-red-400"}>
                  {user.is_active && !user.banned_at ? "Aktif" : "Banned"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[var(--color-surface-hover)] p-4 rounded-xl border border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold mb-1">Total Diterima</p>
              <p className="text-xl font-bold text-green-400">Rp {Number(user.total_received || 0).toLocaleString("id-ID")}</p>
            </div>
            <div className="bg-[var(--color-surface-hover)] p-4 rounded-xl border border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold mb-1">Tanggal Bergabung</p>
              <p className="text-xl font-bold">{new Date(user.created_at).toLocaleDateString("id-ID")}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold mb-2">Bio</p>
              <p className="text-sm text-[var(--color-text-muted)] bg-[var(--color-surface-hover)] p-3 rounded-lg border border-[var(--color-border)]">
                {user.bio || "Belum ada bio."}
              </p>
            </div>
            
            <div className="flex gap-4">
              <a
                href={donateUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white font-medium rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors text-sm flex-1 justify-center"
              >
                <ExternalLink size={16} />
                Halaman Donasi
              </a>
              <button
                onClick={handleToggleAdmin}
                className={`flex items-center gap-2 px-4 py-2 text-white font-medium rounded-lg transition-colors text-sm flex-1 justify-center ${user.is_admin ? "bg-red-600 hover:bg-red-700" : "bg-yellow-600 hover:bg-yellow-700"}`}
              >
                {user.is_admin ? "Cabut Admin" : "Jadikan Admin"}
              </button>
              <a 
                href={overlayUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-surface-hover)] hover:bg-slate-700 text-white py-2 px-4 rounded-xl font-semibold transition-colors border border-[var(--color-border)]"
              >
                Lihat Overlay <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
