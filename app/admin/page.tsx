'use client';

import { useState } from "react";
import Link from "next/link";

type Pending = { id: string; username: string; amount: number; status: string; createdAt: string };

const rankNames = [
  "Bronze",
  "Bronze II",
  "Bronze I",
  "Iron",
  "Iron II",
  "Silver",
  "Silver II",
  "Gold",
  "Gold II",
  "Platinum",
  "Platinum II",
  "Diamond",
  "Diamond II",
  "Emerald",
  "Sapphire",
  "Amethyst",
  "Topaz",
  "Obsidian",
  "Titanium",
  "Ruby",
];

const getRankIndex = (xp: number) => {
  const thresholds = [
    0, 50, 120, 210, 330, 480, 660, 870, 1100, 1360,
    1650, 1960, 2300, 2660, 3040, 3440, 3860, 4300, 4760, 5240,
  ];
  let idx = 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) idx = i;
  }
  return Math.min(idx, rankNames.length - 1);
};

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.localStorage.getItem("wildcs_admin_auth") === "true";
  });

  const handleLogout = () => {
    window.localStorage.removeItem("wildcs_admin_auth");
    setAuthorized(false);
  };

  const [pending, setPending] = useState<Pending[]>(() => {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem("wildcs_pending_claims");
    return raw ? JSON.parse(raw) : [];
  });
  const [coinAmount, setCoinAmount] = useState(100);
  const [coinMessage, setCoinMessage] = useState<string | null>(null);

  const addVinzzurBucks = () => {
    if (!Number.isFinite(coinAmount) || coinAmount <= 0) return;
    const raw = window.localStorage.getItem("wildcs_user");
    if (!raw) {
      setCoinMessage("No signed-in player account is available.");
      return;
    }

    try {
      const user = JSON.parse(raw);
      user.tokens = (user.tokens || 0) + Math.floor(coinAmount);
      window.localStorage.setItem("wildcs_user", JSON.stringify(user));
      setCoinMessage(`${Math.floor(coinAmount).toLocaleString()} VinzzurBucks added to ${user.username}.`);
    } catch {
      setCoinMessage("Unable to update the player account.");
    }
  };

  const refreshPending = () => {
    const raw = window.localStorage.getItem("wildcs_pending_claims");
    setPending(raw ? JSON.parse(raw) : []);
  };

  const approve = (id: string) => {
    const raw = window.localStorage.getItem("wildcs_pending_claims");
    if (!raw) return;
    const list: Pending[] = JSON.parse(raw);
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) return;
    const claim = list[idx];

    // load stored user
    const userRaw = window.localStorage.getItem("wildcs_user");
    if (!userRaw) {
      // nothing to update
      list.splice(idx, 1);
      window.localStorage.setItem("wildcs_pending_claims", JSON.stringify(list));
      refreshPending();
      return;
    }
    const user = JSON.parse(userRaw);

    // calculate rank-based multiplier
    const rank = getRankIndex(user.xp ?? 0);
    const multiplier = Math.pow(1.15, rank);
    const granted = Math.round(claim.amount * multiplier);

    user.tokens = (user.tokens || 0) + granted;
    user.xp = (user.xp || 0) + claim.amount * 5;

    window.localStorage.setItem("wildcs_user", JSON.stringify(user));

    // remove claim
    list.splice(idx, 1);
    window.localStorage.setItem("wildcs_pending_claims", JSON.stringify(list));
    refreshPending();
  };

  const reject = (id: string) => {
    const raw = window.localStorage.getItem("wildcs_pending_claims");
    if (!raw) return;
    const list: Pending[] = JSON.parse(raw);
    const newList = list.filter((p) => p.id !== id);
    window.localStorage.setItem("wildcs_pending_claims", JSON.stringify(newList));
    refreshPending();
  };

  if (!authorized) {
    return (
      <main className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface-color)]/85 p-10 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.22em] text-[var(--accent-color)]">Restricted Admin Access</p>
        <h1 className="mt-2 text-3xl font-black text-[var(--text-primary)]">Admin login required</h1>
        <p className="mt-4 max-w-2xl text-[var(--text-secondary)]">
          This page is protected and can only be accessed with the secret admin login link.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/admin/login"
            className="rounded-full bg-[var(--accent-color)] px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-black transition hover:brightness-110"
          >
            Go to Admin Login
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-[var(--border-color)] bg-[var(--surface-color)]/95 px-6 py-3 text-sm uppercase tracking-[0.16em] text-[var(--text-primary)] transition hover:border-[var(--primary-color)]"
          >
            Go to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface-color)]/85 p-10 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
      <p className="text-sm uppercase tracking-[0.22em] text-[var(--accent-color)]">Admin Console</p>
      <h1 className="mt-2 text-3xl font-black text-[var(--text-primary)]">Management</h1>
      <p className="mt-4 max-w-2xl text-[var(--text-secondary)]">
        This admin page is a placeholder for managing users, rewards, and sync operations.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/leaderboard"
          className="rounded-full bg-[var(--accent-color)] px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-black transition hover:brightness-110"
        >
          View Leaderboard
        </Link>
        <Link
          href="/dashboard"
          className="rounded-full border border-[var(--border-color)] bg-[var(--surface-color)]/95 px-6 py-3 text-sm uppercase tracking-[0.16em] text-[var(--text-primary)] transition hover:border-[var(--primary-color)]"
        >
          Go to Dashboard
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-red-500 bg-red-500/10 px-6 py-3 text-sm uppercase tracking-[0.16em] text-red-200 transition hover:bg-red-500/20"
        >
          Sign out
        </button>
      </div>
      <div className="mt-8 border border-[var(--border-color)] bg-[var(--elevated-color)]/35 p-5">
        <h2 className="text-xl font-black">Add VinzzurBucks</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Grant coins to the currently signed-in player account for testing or manual adjustments.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input type="number" min="1" step="1" value={coinAmount} onChange={(event) => setCoinAmount(Number(event.target.value))} className="w-40 rounded-md border border-[var(--border-color)] bg-[var(--bg-color)] px-3 py-2 text-[var(--text-primary)]" aria-label="VinzzurBucks amount" />
          <button type="button" onClick={addVinzzurBucks} className="rounded-full bg-[var(--accent-color)] px-4 py-2 font-semibold text-black">Add bucks</button>
        </div>
        {coinMessage && <p className="mt-3 text-sm text-[var(--text-secondary)]">{coinMessage}</p>}
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-black">Pending Claims</h2>
        <div className="mt-4 space-y-3">
          {pending.length === 0 ? (
            <div className="text-sm text-[var(--text-secondary)]">No pending claims.</div>
          ) : (
            pending.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="font-medium">{p.username}</div>
                  <div className="text-sm text-[var(--text-secondary)]">{p.amount} VinzzurBucks — {new Date(p.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approve(p.id)} className="rounded-md bg-green-500 px-3 py-1 text-sm text-black">Approve</button>
                  <button onClick={() => reject(p.id)} className="rounded-md bg-red-500 px-3 py-1 text-sm text-black">Reject</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
