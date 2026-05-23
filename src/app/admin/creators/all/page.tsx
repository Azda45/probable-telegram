"use client";

import { useState, useEffect } from "react";
import AdminUsersTab from "@/fe/admin/components/AdminUsersTab";
import AdminStreamerModal from "@/fe/admin/components/AdminStreamerModal";

export default function AdminCreatorsAllPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => {
        if (data.users) setUsers(data.users);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggleBan = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? "unban" : "ban"} this user?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_banned: !currentStatus }),
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, is_active: currentStatus ? 1 : 0, banned_at: currentStatus ? null : new Date().toISOString() } : u));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update ban status");
      }
    } catch (err) {
      alert("An error occurred");
    }
  };

  const handleToggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    if (!confirm(`Are you sure you want to ${currentIsAdmin ? "revoke admin access from" : "grant admin access to"} this user?`)) return;

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
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update admin status");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  if (loading) {
    return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-slate-700 rounded w-3/4"></div></div></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">All Creators</h1>
      <AdminUsersTab users={users} onToggleBan={handleToggleBan} onViewDetails={setSelectedUser} onToggleAdmin={handleToggleAdmin} />
      
      {selectedUser && (
        <AdminStreamerModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}
