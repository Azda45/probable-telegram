"use client";

import { useState, useEffect } from "react";
import AdminUsersTab from "@/fe/admin/components/AdminUsersTab";
import AdminStreamerModal from "@/fe/admin/components/AdminStreamerModal";

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
    if (!confirm(`Are you sure you want to unban this user?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_banned: false }), // We only unban here
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId)); // Remove from suspended list
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update ban status");
      }
    } catch (err) {
      alert("An error occurred");
    }
  };

  if (loading) {
    return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-slate-700 rounded w-3/4"></div></div></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Suspended Creators</h1>
      <AdminUsersTab users={users} onToggleBan={handleToggleBan} onViewDetails={(u) => setSelectedUser(u)} />
      
      {selectedUser && (
        <AdminStreamerModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}
