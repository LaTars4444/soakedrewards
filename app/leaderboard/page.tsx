'use client';

import { useEffect, useState } from "react";
import LeaderboardTable from "@/components/LeaderboardTable";
import { fetchLeaderboard } from "@/lib/api";
import type { User } from "@/lib/types";

function getMonthRemaining() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const totalSeconds = Math.max(0, Math.floor((nextMonth.getTime() - now.getTime()) / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days}d ${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState("Loading...");

  useEffect(() => {
    const updateCountdown = () => setCountdown(getMonthRemaining());
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadBoards = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchLeaderboard("all");

        if (!isMounted) {
          return;
        }

        setUsers(result);
      } catch {
        if (isMounted) {
          setError("Unable to load the HellCasino leaderboard.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadBoards();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="relative min-h-screen px-4 py-10 sm:px-6">
      <div className="relative mx-auto max-w-7xl space-y-8">
        <header className="border-y border-[var(--border-color)]/70 px-2 py-8 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-[var(--accent-color)]">Vinzzur Rewards presents</p>
          <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-4xl font-black uppercase tracking-[0.12em] text-[var(--text-primary)] sm:text-6xl">HellCasino</div>
              <h1 className="mt-3 text-2xl font-black text-[var(--text-primary)] sm:text-3xl">The only leaderboard that matters</h1>
            </div>
          </div>
        </header>

        <section className="border-b border-[var(--border-color)]/70 px-2 pb-8 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[var(--accent-color)]">HellCasino / all time</p>
              <h2 className="mt-2 text-2xl font-black text-[var(--text-primary)]">Player rankings</h2>
            </div>
              <div className="text-right text-sm text-[var(--text-secondary)]"><p>1-month leaderboard</p><p className="mt-1 font-black text-[var(--accent-color)]">Resets in {countdown}</p></div>
          </div>
        </section>

        {error ? (
          <div className="space-y-4">
            <div className="border border-red-500/30 bg-red-500/10 p-6 text-red-200">
              {error} Showing open positions until the board reconnects.
            </div>
            <LeaderboardTable title="HellCasino leaderboard" users={[]} />
          </div>
        ) : isLoading ? (
          <div className="border border-[var(--border-color)]/70 bg-[var(--surface-color)]/35 p-8 text-[var(--text-secondary)]">
            Loading the HellCasino leaderboard...
          </div>
        ) : (
          <LeaderboardTable title="HellCasino leaderboard" users={users} />
        )}
      </div>
    </main>
  );
}
