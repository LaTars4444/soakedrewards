"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type NavUser = {
  username: string;
  tokens: number;
  xp: number;
  avatar?: string | null;
};

export default function NavBar() {
  const [user] = useState<NavUser | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem("wildcs_user");
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      return {
        username: parsed.username,
        tokens: parsed.tokens ?? 0,
        xp: parsed.xp ?? 0,
        avatar: parsed.avatar ?? null,
      };
    } catch {
      return null;
    }
  });

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-[var(--border-color)] bg-[rgba(30,22,36,0.78)]/95 backdrop-blur-xl px-4 py-4 shadow-[0_25px_40px_-20px_rgba(0,0,0,0.65)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-3">
            <span className="text-xl font-black uppercase tracking-[0.08em] text-[var(--text-primary)] transition group-hover:text-[var(--accent-color)] sm:text-2xl">
              Vinzzur Rewards
            </span>
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/leaderboard" className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--surface-color)]/95 px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-[var(--text-primary)] transition hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]">
            HellCasino LB
          </Link>
          <Link href="/profile" className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--surface-color)]/95 px-4 py-3 text-sm uppercase tracking-[0.18em] text-[var(--text-secondary)] transition hover:border-[var(--accent-color)] hover:text-[var(--text-primary)]">
            Profile
          </Link>
          <Link href="/store" className="rounded-full border border-[var(--border-color)] bg-[var(--surface-color)]/90 px-4 py-3 text-sm uppercase tracking-[0.18em] text-[var(--text-secondary)] transition hover:border-[var(--accent-color)] hover:text-[var(--text-primary)]">
            Store
          </Link>
          {user ? (
            <div className="flex items-center gap-3 rounded-full border border-[var(--border-color)] bg-[var(--surface-color)]/95 px-3 py-2">
              <div className="hidden items-center gap-2 rounded-full bg-[var(--bg-color)]/95 px-3 py-2 text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)] sm:flex">
                <span>{user.tokens.toLocaleString()} VinzzurBucks</span>
                <span className="h-1 w-1 rounded-full bg-[var(--accent-color)]" />
                <span>{user.xp} XP</span>
              </div>
              <Link href="/profile" className="flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--elevated-color)]/90 px-3 py-2 transition hover:border-[var(--accent-color)]">
                <div className="relative h-9 w-9 overflow-hidden rounded-full bg-[var(--bg-color)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]">
                  {user.avatar ? (
                      <Image src={user.avatar} alt={user.username} className="h-full w-full object-cover" fill sizes="36px" unoptimized />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-sm font-black uppercase text-[var(--text-primary)]">
                      {user.username.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="hidden text-sm font-semibold text-[var(--text-primary)] sm:inline">{user.username}</span>
              </Link>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="rounded-full border border-[var(--border-color)] px-4 py-2 text-sm">Log in</Link>
              <Link href="/auth/register" className="rounded-full bg-[var(--accent-color)] px-4 py-2 text-sm font-semibold">Sign up</Link>
            </>
          )}
        </div>

        <a href="https://discord.gg/TQeKGwfe28" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)]/95 px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-[var(--text-primary)] transition hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]">
          Discord
        </a>
      </div>
    </nav>
  );
}
