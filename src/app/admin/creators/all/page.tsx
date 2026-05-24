"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import AdminUsersTab from "@/fe/admin/components/AdminUsersTab";
import AdminStreamerModal from "@/fe/admin/components/AdminStreamerModal";
import AdminLoadingSkeleton from "@/fe/admin/components/AdminLoadingSkeleton";
import AdminSearchBar from "@/fe/admin/components/AdminSearchBar";

export default function AdminCreatorsAllPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => {
        if (data.users) setUsers(data.users);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggleBan = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_banned: !currentStatus }),
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, is_active: currentStatus ? 1 : 0, banned_at: currentStatus ? null : new Date().toISOString() } : u));
        toast.success(currentStatus ? "Pengguna berhasil di-unban." : "Pengguna berhasil di-ban.");
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal mengubah status ban.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan.");
    }
  };

  const handleToggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/admin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_admin: !currentIsAdmin }),
      });

      if (res.ok) {
        setUsers(users.map(u => 
          u.id === userId ? { ...u, is_admin: !currentIsAdmin ? 1 : 0 } : u
        ));
        toast.success(currentIsAdmin ? "Akses admin berhasil dicabut." : "Akses admin berhasil diberikan.");
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal mengubah status admin.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan.");
    }
  };

  const filteredUsers = users.filter(u => {
    if (!search) return true;
    const s = search.toLowerCase();
    return u.username?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || u.display_name?.toLowerCase().includes(s);
  });

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Semua Creator</h1>
        <AdminLoadingSkeleton type="table" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Semua Creator</h1>
        <AdminSearchBar value={search} onChange={setSearch} placeholder="Cari username, email..." />
      </div>
      <AdminUsersTab users={filteredUsers} onToggleBan={handleToggleBan} onViewDetails={setSelectedUser} onToggleAdmin={handleToggleAdmin} />
      
      {selectedUser && (
        <AdminStreamerModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}
