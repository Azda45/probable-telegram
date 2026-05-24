"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import AdminUsersTab from "@/fe/admin/components/AdminUsersTab";
import AdminStreamerModal from "@/fe/admin/components/AdminStreamerModal";
import AdminLoadingSkeleton from "@/fe/admin/components/AdminLoadingSkeleton";

export default function AdminCreatorsSuspendedPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/users?status=suspended")
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
        body: JSON.stringify({ is_banned: false }), // We only unban here
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId)); // Remove from suspended list
        toast.success("Pengguna berhasil di-unban.");
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal mengubah status ban.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan.");
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Creator Suspended</h1>
        <AdminLoadingSkeleton type="table" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Creator Suspended</h1>
      <AdminUsersTab users={users} onToggleBan={handleToggleBan} onViewDetails={(u) => setSelectedUser(u)} />
      
      {selectedUser && (
        <AdminStreamerModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}
