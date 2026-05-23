import Image from "next/image";
import type { UserInfo } from "../types";

interface DonateProfileHeaderProps {
  avatarUrl: string;
  user: UserInfo;
  username: string;
}

export default function DonateProfileHeader({ avatarUrl, user, username }: DonateProfileHeaderProps) {
  return (
    <div style={{ textAlign: "center", marginBottom: "2rem" }}>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "var(--color-surface-elevated)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2rem",
          margin: "0 auto 1rem",
          overflow: "hidden",
          border: "1px solid var(--color-border)",
        }}
      >
        <Image src={avatarUrl} alt={`${user.display_name} avatar`} width={72} height={72} unoptimized className="h-full w-full object-cover" />
      </div>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.25rem" }}>{user.display_name}</h1>
      <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>@{username}</p>
    </div>
  );
}
