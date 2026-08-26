"use client";

import { useEffect, useState } from "react";
import VeltaCoinIcon from "@/components/VeltaCoinIcon";
import { CLAIM_COINS_PER_DOLLAR } from "@/lib/token-utils";
import { getMultiplier, getRankIndex } from "@/lib/ranks";

type LocalUser = {
  tokens?: number;
  bonusBalance?: number;
  hellCasinoId?: string;
  lifetimeWagered?: number;
  totalWagered?: number;
  lifetimeTokenCredits?: number;
  xp?: number;
};

const COIN_NAME = "VinzzurBucks";
const MIN_CLAIM = 5;
const CLAIM_STEP = 5;
const MAX_CLAIM = 500;

export default function StorePage() {
  const [user, setUser] = useState<LocalUser | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem("wildcs_user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });
  const [claimed, setClaimed] = useState(false);
  const [claimAmount, setClaimAmount] = useState(MIN_CLAIM);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);
  const claimCost = claimAmount * CLAIM_COINS_PER_DOLLAR;

  useEffect(() => {
    if (!user?.hellCasinoId) return;

    const wagered = user.lifetimeWagered ?? user.totalWagered ?? 0;
    const multiplier = getMultiplier(getRankIndex(user.xp ?? 0));
    const earnedCoins = Math.floor((wagered / 100) * multiplier);
    const creditedCoins = user.lifetimeTokenCredits ?? 0;
    const newCoins = Math.max(0, earnedCoins - creditedCoins);

    if (newCoins === 0) return;

    const updated = {
      ...user,
      tokens: (user.tokens ?? 0) + newCoins,
      lifetimeTokenCredits: earnedCoins,
    };
    window.localStorage.setItem("wildcs_user", JSON.stringify(updated));
    queueMicrotask(() => setUser(updated));
  }, [user]);

  const handleClaim = (amount = claimAmount) => {
    const selectedCost = amount * CLAIM_COINS_PER_DOLLAR;
    if (!user || claimed) return;
    if (!user.hellCasinoId) {
      setClaimMessage("Link your HellCasino account in Profile before redeeming.");
      return;
    }
    if ((user.tokens ?? 0) < selectedCost) {
      setClaimMessage("You do not have enough VinzzurBucks for that reward.");
      return;
    }
    const updated = {
      ...user,
      tokens: (user.tokens ?? 0) - selectedCost,
      bonusBalance: (user.bonusBalance ?? 0) + amount,
    };
    setUser(updated);
    setClaimed(true);
    setClaimMessage(`$${amount} redeemed successfully.`);
    window.localStorage.setItem("wildcs_user", JSON.stringify(updated));
  };

  return (
    <main className="relative min-h-screen px-6 py-20">
      <div className="absolute inset-x-0 top-0 h-52 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.16),transparent_20%),radial-gradient(circle_at_70%_80%,_rgba(168,85,247,0.14),transparent_24%)]" />
      <div className="relative mx-auto max-w-6xl space-y-10">
        <section className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface-color)]/85 p-10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.22em] text-[var(--accent-color)]">Store</p>
          <h1 className="mt-2 text-3xl font-black text-[var(--text-primary)] sm:text-4xl">Bonuses & rewards</h1>
          <p className="mt-4 max-w-3xl text-[var(--text-secondary)]">
            Turn your VinzzurBucks into rewards you can actually use.
          </p>
          <p className="mt-2 text-xs text-[var(--text-secondary)]">Payouts are processed within 24 hours of a successful claim.</p>
        </section>

        <section className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface-color)]/85 p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
          <h2 className="text-xl font-black text-[var(--text-primary)]">Your VinzzurBucks</h2>
          <p className="mt-2 text-[var(--text-secondary)]">Earn 1 VinzzurBuck for every $100 wagered through HellCasino.</p>
          <div className="mt-6 flex items-center gap-4 rounded-[1.75rem] border border-[var(--border-color)] bg-[var(--elevated-color)]/80 p-6">
            <VeltaCoinIcon />
            <div>
            <p className="text-sm uppercase tracking-[0.18em] text-[var(--text-secondary)]">Current balance</p>
            <p className="mt-4 text-4xl font-black text-[var(--accent-color)]">{user ? (user.tokens ?? 0).toLocaleString() : "0"}</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{COIN_NAME}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface-color)]/85 p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-[var(--accent-color)]">Instant reward</p>
              <h2 className="mt-2 text-3xl font-black text-[var(--text-primary)]">Claim your reward</h2>
              <p className="mt-3 max-w-xl text-[var(--text-secondary)]">Choose any amount from $5 to $500 in $5 steps. Every $5 costs 100 VinzzurBucks.</p>
            </div>
            <div className="rounded-full bg-[var(--elevated-color)]/80 px-4 py-3 text-sm uppercase tracking-[0.16em] text-[var(--text-secondary)]">
              {claimCost.toLocaleString()} {COIN_NAME}
            </div>
          </div>
          <div className="mt-6 rounded-[1.75rem] border border-[var(--border-color)] bg-[var(--bg-color)]/80 p-6">
            <div>
              <p className="text-lg font-bold text-[var(--text-primary)]">${claimAmount} bonus credit</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Your claim is added to your bonus balance.</p>
            </div>
            <input
              type="range"
              min={MIN_CLAIM}
              max={MAX_CLAIM}
              step={CLAIM_STEP}
              value={claimAmount}
              onChange={(event) => setClaimAmount(Number(event.target.value))}
              className="mt-6 w-full accent-red-500"
              aria-label="Reward claim amount"
            />
            <div className="mt-2 flex justify-between text-xs text-[var(--text-secondary)]"><span>$5</span><span>$500</span></div>
            {!user && <p className="mt-4 text-sm text-[var(--text-secondary)]">Log in to redeem rewards.</p>}
            {user && !user.hellCasinoId && <p className="mt-4 text-sm text-amber-300">Link your HellCasino account in Profile to calculate and receive VinzzurBucks.</p>}
            {user && !claimed && <p className="mt-4 text-sm text-[var(--text-secondary)]">Select an amount, then press Claim Reward.</p>}
            {claimMessage && <p className="mt-4 text-sm text-[var(--accent-color)]">{claimMessage}</p>}
            <button
              type="button"
              disabled={!user || claimed || !user.hellCasinoId || (user.tokens ?? 0) < claimCost}
              onClick={() => handleClaim()}
              className="mt-5 rounded-full bg-[var(--accent-color)] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {!user ? "Log in to claim" : claimed ? "Claimed" : !user.hellCasinoId ? "Link HellCasino first" : (user.tokens ?? 0) < claimCost ? "Need more coins" : `Claim $${claimAmount}`}
            </button>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface-color)]/85 p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-[var(--text-primary)]">Vinzzur shop</h2>
              <p className="mt-3 text-[var(--text-secondary)]">
                More ways to spend your VinzzurBucks are on the way.
              </p>
            </div>
            <div className="rounded-full bg-[var(--elevated-color)]/80 px-4 py-3 text-sm uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              {user ? `${(user.tokens ?? 0).toLocaleString()} ${COIN_NAME} available` : "Log in to view"}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.75rem] border border-[var(--border-color)] bg-[var(--bg-color)]/80 p-5">
              <p className="text-sm uppercase tracking-[0.18em] text-[var(--text-secondary)]">Bonus buy</p>
              <p className="mt-2 text-3xl font-black text-[var(--text-primary)]">$40</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Future rewards powered by {COIN_NAME}.</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">New reward drops coming soon</p>
              <button
                disabled
                className="mt-5 rounded-full border border-[var(--border-color)] bg-[var(--accent-color)] px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Coming soon
              </button>
            </div>

            <div className="rounded-[1.75rem] border border-[var(--border-color)] bg-[var(--bg-color)]/80 p-5">
              <p className="text-sm uppercase tracking-[0.18em] text-[var(--text-secondary)]">Coming soon</p>
              <p className="mt-2 text-3xl font-black text-[var(--text-primary)]">TBD</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Fresh ways to use your coins</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">Watch this space</p>
              <button
                disabled
                className="mt-5 rounded-full border border-[var(--border-color)] bg-[var(--surface-color)] px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-[var(--text-secondary)] cursor-not-allowed opacity-50"
              >
                Coming soon
              </button>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
