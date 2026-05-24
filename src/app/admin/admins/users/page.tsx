"use client";

import { useState, useEffect } from "react";
import AdminAdminsTab from "@/fe/admin/components/AdminAdminsTab";
import AdminLoadingSkeleton from "@/fe/admin/components/AdminLoadingSkeleton";

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/admins")
      .then(res => res.json())
      .then(data => {
        if (data.admins) setAdmins(data.admins);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Daftar Admin</h1>
        <AdminLoadingSkeleton type="table" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Daftar Admin</h1>
      <AdminAdminsTab admins={admins} />
    </div>
  );
}
