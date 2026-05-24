"use client";

import { useState } from "react";
import { Plus, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import AdminEmptyState from "./AdminEmptyState";

interface AdminBlacklistTabProps {
  initialWords: any[];
}

export default function AdminBlacklistTab({ initialWords }: AdminBlacklistTabProps) {
  const [words, setWords] = useState<any[]>(initialWords);
  const [newWord, setNewWord] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;

    setIsAdding(true);
    try {
      const res = await fetch("/api/admin/moderation/blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: newWord }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setWords([{ id: data.id, word: newWord.toLowerCase().trim(), added_by: "You", created_at: new Date().toISOString() }, ...words]);
        setNewWord("");
        toast.success("Kata berhasil ditambahkan ke blacklist.");
      } else {
        toast.error(data.error || "Gagal menambahkan kata.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string, wordText: string) => {
    try {
      const res = await fetch(`/api/admin/moderation/blacklist/${id}`, { method: "DELETE" });
      if (res.ok) {
        setWords(words.filter(w => w.id !== id));
        toast.success(`Kata "${wordText}" berhasil dihapus dari blacklist.`);
      } else {
        toast.error("Gagal menghapus kata.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan.");
    }
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl">
      <div className="px-6 py-4 border-b border-[var(--color-border)] flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="w-5 h-5 text-red-500" />
          Kata Terlarang
        </h2>
      </div>
      
      <div className="p-6 border-b border-[var(--color-border)]">
        <form onSubmit={handleAdd} className="flex gap-4">
          <input 
            type="text"
            placeholder="Tambah kata kotor / dilarang..."
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            className="flex-1 bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-lg px-4 py-2 focus:outline-none focus:border-red-500 transition-colors"
          />
          <button 
            type="submit"
            disabled={isAdding || !newWord.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Tambah
          </button>
        </form>
        <p className="text-xs text-[var(--color-text-muted)] mt-2">
          Pesan donasi yang mengandung kata-kata di bawah ini akan secara otomatis diblokir sistem.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[var(--color-surface-hover)]">
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Kata</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Ditambahkan Oleh</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Tanggal</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {words.map((w) => (
              <tr key={w.id} className="hover:bg-[var(--color-surface-hover)]/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-bold text-red-400">
                  {w.word}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-muted)]">
                  @{w.added_by}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-muted)]">
                  {new Date(w.created_at).toLocaleDateString("id-ID")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button 
                    onClick={() => handleDelete(w.id, w.word)}
                    className="p-2 text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {words.length === 0 && (
              <AdminEmptyState
                icon={<FileText className="w-6 h-6" />}
                title="Tidak ada kata terlarang"
                description="Belum ada kata yang ditambahkan ke blacklist."
                colSpan={4}
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
