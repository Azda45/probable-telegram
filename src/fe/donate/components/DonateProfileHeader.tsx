"use client";

import Image from "next/image";
import { useState } from "react";
import { FaYoutube, FaInstagram, FaTwitter, FaFacebook } from "react-icons/fa";
import type { UserInfo } from "../types";

interface DonateProfileHeaderProps {
  avatarUrl: string;
  user: UserInfo;
  username: string;
}

export default function DonateProfileHeader({ avatarUrl, user, username }: DonateProfileHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if bio is long enough to warrant a 'Show more' button
  // A rough estimate: > 100 chars or more than 2 newlines
  const shouldShowToggle = user.bio ? (user.bio.length > 100 || (user.bio.match(/\n/g) || []).length > 2) : false;

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
        <Image src={avatarUrl} alt={`${user.display_name} avatar`} width={72} height={72} className="h-full w-full object-cover" unoptimized />
      </div>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.25rem" }}>{user.display_name}</h1>
      <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>@{username}</p>

      {/* Social Links */}
      {(user.youtube_url || user.instagram_url || user.twitter_url || user.facebook_url) && (
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          {user.youtube_url && (
            <a href={user.youtube_url} target="_blank" rel="noreferrer noopener" className="text-[#FF0000] hover:opacity-80 transition-opacity">
              <FaYoutube className="w-5 h-5" />
            </a>
          )}
          {user.instagram_url && (
            <a href={user.instagram_url} target="_blank" rel="noreferrer noopener" className="text-[#E1306C] hover:opacity-80 transition-opacity">
              <FaInstagram className="w-5 h-5" />
            </a>
          )}
          {user.twitter_url && (
            <a href={user.twitter_url} target="_blank" rel="noreferrer noopener" className="text-[#1DA1F2] hover:opacity-80 transition-opacity">
              <FaTwitter className="w-5 h-5" />
            </a>
          )}
          {user.facebook_url && (
            <a href={user.facebook_url} target="_blank" rel="noreferrer noopener" className="text-[#1877F2] hover:opacity-80 transition-opacity">
              <FaFacebook className="w-5 h-5" />
            </a>
          )}
        </div>
      )}

      {user.bio && (
        <div style={{ background: "var(--color-bg)", padding: "1rem", borderRadius: "0.75rem", textAlign: "left", marginTop: "1rem" }}>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflowWrap: "break-word",
              ...(isExpanded
                ? {}
                : {
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }),
            }}
          >
            {user.bio}
          </p>
          {shouldShowToggle && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                marginTop: "0.5rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--color-primary)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              {isExpanded ? "Tampilkan lebih sedikit" : "Selengkapnya"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
