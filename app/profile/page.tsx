"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getRankIndex, rankNames, thresholds, getNextThreshold, getMultiplier } from "@/lib/ranks";
import { earnedTokensFromLifetime } from "@/lib/token-utils";

type User = {
  username: string;
  tokens: number;
  bonusBalance?: number;
  avatar?: string | null;
  xp?: number;
  hellCasinoId?: string;
  totalWagered?: number;
  weeklyWagered?: number;
  monthlyWagered?: number;
  lifetimeWagered?: number;
  lifetimeTokenCredits?: number;
  password?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem("wildcs_user");
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const handleLogout = () => {
    window.localStorage.removeItem("wildcs_user");
    setUser(null);
  };

  const handleProfileSave = () => {
    if (!user || !usernameInput.trim()) return;
    const updated = { ...user, username: usernameInput.trim(), ...(passwordInput ? { password: passwordInput } : {}) };
    window.localStorage.setItem("wildcs_user", JSON.stringify(updated));
    setUser(updated);
    setUsernameInput(updated.username);
    setPasswordInput("");
    setProfileMessage("Profile details updated.");
  };

  const avatars = ["/avatars/avatar1.svg","/avatars/avatar2.svg","/avatars/avatar3.svg"];

  const handleAvatar = (path: string) => {
    if (!user) return;
    const updated = { ...user, avatar: path } as User;
    window.localStorage.setItem("wildcs_user", JSON.stringify(updated));
    setUser(updated);
  };

  const handleAvatarUpload = (file: File) => {
    if (!user) return;

    const reader = new FileReader();
    reader.onload = () => {
      const avatar = reader.result as string;
      const updated = { ...user, avatar } as User;
      window.localStorage.setItem("wildcs_user", JSON.stringify(updated));
      setUser(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleHellCasinoIdUpdate = (value: string) => {
    if (!user) return;
    const updated = { ...user, hellCasinoId: value } as User;
    window.localStorage.setItem("wildcs_user", JSON.stringify(updated));
    setUser(updated);
  };

  const handleImportWagersCsv = (file: File) => {
    if (!user) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length === 0) return;

      const headerCols = lines[0].split(/,|;/).map((s) => s.trim().toLowerCase());
      const amountCandidates = ["amount", "wager", "bet", "stake", "value"];
      const amountIdx = headerCols.findIndex((h) => amountCandidates.includes(h));
      let startRow = 0;
      if (amountIdx !== -1) startRow = 1;

      let sum = 0;
      for (let i = startRow; i < lines.length; i++) {
        const cols = lines[i].split(/,|;/).map((s) => s.trim());
        let v: number | null = null;
        if (amountIdx !== -1) {
          v = parseFloat(cols[amountIdx].replace(/[^0-9.-]/g, ""));
        } else {
          for (const c of cols) {
            const n = parseFloat(c.replace(/[^0-9.-]/g, ""));
            if (!isNaN(n)) {
              v = n;
              break;
            }
          }
        }
        if (v !== null && !isNaN(v)) sum += v;
      }

      const newLifetime = (user.lifetimeWagered ?? 0) + sum;
      const newLifetimeCredits = earnedTokensFromLifetime(newLifetime, multiplier);
      const previousLifetimeCredits = user.lifetimeTokenCredits ?? 0;
      const lifetimeDelta = Math.max(0, newLifetimeCredits - previousLifetimeCredits);

      const updated: User = {
        ...user,
        monthlyWagered: (user.monthlyWagered ?? 0) + sum,
        lifetimeWagered: newLifetime,
        lifetimeTokenCredits: newLifetimeCredits,
        totalWagered: (user.totalWagered ?? 0) + sum,
        tokens: (user.tokens ?? 0) + lifetimeDelta,
      };

      window.localStorage.setItem("wildcs_user", JSON.stringify(updated));
      setUser(updated);
    };
    reader.readAsText(file);
  };

  const xp = user?.xp ?? 0;
  const rankIndex = getRankIndex(xp);
  const rankName = rankNames[rankIndex];
  const nextThreshold = getNextThreshold(xp);
  const next = nextThreshold.next;
  const current = thresholds[rankIndex];
  const progress = next > current ? Math.round(((xp - current) / (next - current)) * 100) : 100;
  const multiplier = getMultiplier(rankIndex);

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-[1.5rem] border border-[var(--border-color)] bg-[var(--surface-color)]/90 p-8">
          <h1 className="text-2xl font-black">Profile</h1>
          {!user ? (
            <div className="mt-6 space-y-4">
              <p className="text-[var(--text-secondary)]">No account found. Sign in to access your tokens and rank.</p>
              <Link href="/auth/login" className="inline-flex rounded-full bg-[var(--accent-color)] px-5 py-3 font-semibold">Log in</Link>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              <div className="border-b border-[var(--border-color)]/70 pb-6">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent-color)]">Account details</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input value={usernameInput || user.username} onChange={(e) => setUsernameInput(e.target.value)} placeholder="Username" className="rounded-md border border-[var(--border-color)] bg-[var(--bg-color)] px-3 py-2 text-[var(--text-primary)]" />
                  <input value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} type="password" placeholder="New password" className="rounded-md border border-[var(--border-color)] bg-[var(--bg-color)] px-3 py-2 text-[var(--text-primary)]" />
                </div>
                <button onClick={handleProfileSave} className="mt-3 rounded-full bg-[var(--accent-color)] px-4 py-2 font-semibold text-black">Save account details</button>
                {profileMessage && <p className="mt-2 text-sm text-[var(--text-secondary)]">{profileMessage}</p>}
              </div>
              <div className="flex items-center gap-6">
                <div className="relative h-20 w-20 overflow-hidden rounded-3xl border-2 border-[var(--accent-color)] bg-gradient-to-br from-violet-950 via-fuchsia-900 to-pink-700 p-2 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                   <Image src={`/ranks/rank-${rankIndex}.svg`} alt={rankName} className="h-full w-full object-cover rounded-2xl" fill sizes="80px" />
                </div>
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">{rankName}</p>
                  <p className="text-2xl font-black">{xp} XP</p>
                  <p className="text-sm text-[var(--text-secondary)]">Multiplier: x{multiplier.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <div className="h-3 w-full rounded-full bg-[var(--elevated-color)]/60">
                  <div className="h-3 rounded-full bg-[var(--accent-color)]" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{progress}% to next rank ({next - xp} XP)</p>
              </div>

              <p className="text-sm text-[var(--text-secondary)]">Username</p>
              <p className="text-lg font-black">{user.username}</p>

              <p className="text-sm text-[var(--text-secondary)]">VinzzurBucks</p>
              <p className="text-xl font-black text-[var(--accent-color)]">{user.tokens}</p>

              <p className="text-sm text-[var(--text-secondary)]">HellCasino account</p>
              <div className="mt-2 space-y-3">
                <div>
                  <label className="text-xs text-[var(--text-secondary)]">HellCasino username or ID</label>
                  <input
                    type="text"
                    value={user.hellCasinoId ?? ""}
                    onChange={(e) => handleHellCasinoIdUpdate(e.target.value)}
                    placeholder="Add your HellCasino account"
                    className="mt-1 w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-color)] px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
                  />
                </div>
              </div>

              <div>
                <p className="mt-4 text-sm text-[var(--text-secondary)]">Select avatar</p>
                <div className="mt-2 grid gap-3 sm:grid-cols-3">
                  {avatars.map((a) => (
                    <button key={a} onClick={() => handleAvatar(a)} className="relative h-12 w-12 rounded-md border p-1">
                        <Image src={a} alt="avatar" className="h-10 w-10 object-cover" fill sizes="40px" />
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-[var(--border-color)] bg-[var(--bg-color)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--accent-color)]">
                    Upload a custom avatar
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAvatarUpload(file);
                      }}
                    />
                  </label>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-[var(--text-secondary)]">Import wagers (CSV)</p>
                  <p className="text-xs text-[var(--text-secondary)]">Upload a CSV exported from your HellCasino account. The importer credits 1 VinzzurBuck per $100 wagered.</p>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleImportWagersCsv(f);
                      }}
                      className="rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button onClick={handleLogout} className="text-sm text-[var(--text-secondary)] underline-offset-4 transition hover:text-[var(--text-primary)]">
                  Sign out
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
