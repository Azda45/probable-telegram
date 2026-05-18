import { getUserByUsername } from "@/lib/services";
import DonateClient from "./DonateClient";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> | { username: string } }): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const user = await getUserByUsername(resolvedParams.username);
  if (!user) return { title: "Not Found" };
  return { title: `Donate to ${user.display_name} | DonasiKu` };
}

export default async function DonatePage({ params }: { params: Promise<{ username: string }> | { username: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const user = await getUserByUsername(resolvedParams.username);
  
  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>😿</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>User Tidak Ditemukan</h1>
          <p style={{ color: "var(--color-text-secondary)" }}>Username <strong>@{resolvedParams.username}</strong> tidak terdaftar</p>
        </div>
      </div>
    );
  }

  // Pass plain, serializable data to the client component
  const userInfo = {
    username: user.username,
    display_name: user.display_name,
    bio: user.bio,
    avatar_url: user.avatar_url,
    min_amount: user.min_amount,
    max_amount: user.max_amount,
  };

  return <DonateClient user={userInfo} username={resolvedParams.username} />;
}
