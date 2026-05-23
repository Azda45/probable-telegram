"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getAvatarUrl } from "@/shared/avatar";

interface NavbarProps {
  user?: { display_name: string; avatar_url?: string | null; is_admin?: boolean | number } | null;
  onLogout?: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const router = useRouter();
  const avatarUrl = user ? getAvatarUrl(user.display_name, user.avatar_url) : "";

  return (
    <nav className="border-b border-[var(--color-border)] bg-[var(--color-surface)] py-4">
      <div className="container flex justify-between items-center min-h-[52px] md:min-h-[56px]">
        <Link href="/" className="no-underline text-xl md:text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <span className="text-[var(--color-primary)]">💜</span> DonasiKu
        </Link>
        <div className="flex items-center gap-3 md:gap-4">
          {user ? (
            <>
              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center gap-3 md:gap-4 p-1.5 pr-3 rounded-full hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50 transition-all duration-200 cursor-pointer"
                >
                  <div className="w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden bg-slate-800 border border-slate-700/50 shadow-sm flex-shrink-0">
                    <Image
                      src={avatarUrl}
                      alt={`${user.display_name}'s avatar`}
                      width={44}
                      height={44}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col items-start hidden sm:flex text-left">
                    <span className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Halo,</span>
                    <span className="text-sm md:text-base font-bold leading-none mt-0.5">{user.display_name}</span>
                  </div>
                  <svg 
                    className="w-4 h-4 ml-1 text-slate-400 transition-transform duration-200 group-hover:rotate-180" 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu (Hover Triggered) */}
                <div 
                  className="absolute left-0 top-[100%] pt-2 w-56 z-50 opacity-0 scale-95 -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 origin-top-left"
                >
                  <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden py-1">
                    <div className="px-3 py-2 border-b border-[var(--color-border)] sm:hidden">
                       <span className="block text-xs text-[var(--color-text-muted)]">Masuk sebagai</span>
                       <span className="block text-sm font-bold truncate">{user.display_name}</span>
                    </div>
                    <div className="p-2">
                      {user.is_admin ? (
                        <button
                          type="button"
                          onClick={() => router.push("/admin")}
                          className="w-full text-left !pl-6 !pr-4 !py-3 mb-1 text-[15px] font-medium hover:bg-yellow-500/10 text-yellow-500 hover:text-yellow-400 rounded-lg transition-colors flex items-center gap-3 cursor-pointer"
                        >
                          <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Admin Panel
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => router.push("/dashboard")}
                        className="w-full text-left !pl-6 !pr-4 !py-3 text-[15px] font-medium hover:bg-violet-500/10 hover:text-violet-400 rounded-lg transition-colors flex items-center gap-3 cursor-pointer"
                      >
                        <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Dashboard
                      </button>
                    </div>
                    <div className="p-2 border-t border-[var(--color-border)]">
                      <button
                        type="button"
                        onClick={() => { if (onLogout) onLogout(); }}
                        className="w-full text-left !pl-6 !pr-4 !py-3 text-[15px] font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors flex items-center gap-3 cursor-pointer"
                      >
                        <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Keluar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-secondary btn-sm !rounded-lg"
                onClick={() => router.push("/login")}
              >
                Masuk
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm !rounded-lg"
                onClick={() => router.push("/register")}
              >
                Daftar
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
