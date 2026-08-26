import Link from "next/link";
import UserCard from "@/components/UserCard";

const sampleUser = {
  id: "sample-user",
  username: "WildPlayer",
  totalWagered: 18250,
  weeklyWagered: 4800,
  monthlyWagered: 13200,
  lifetimeWagered: 18250,
  lifetimeTokenCredits: Math.floor(18250 / 100),
  tokens: 1420,
  bonusBalance: 75,
  watchTime: 895,
  vipTier: "gold",
  streakDays: 18,
  avatar: null,
};

export default function DashboardPage() {
  return (
    <main className="relative min-h-screen px-6 py-10">
      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.16),transparent_18%)]" />
      <div className="relative mx-auto max-w-6xl space-y-8">
        <section className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface-color)]/85 p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.22em] text-[var(--accent-color)]">Dashboard</p>
          <h1 className="mt-2 text-3xl font-black text-[var(--text-primary)] sm:text-4xl">Overview</h1>
          <p className="mt-3 text-[var(--text-secondary)]">
            This dashboard page is a starting point for your platform analytics and user activity.
          </p>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface-color)]/85 p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.75rem] bg-[var(--elevated-color)]/80 p-6 text-sm text-[var(--text-secondary)]">
                <p className="text-[var(--text-secondary)]">Active users</p>
                <p className="mt-3 text-3xl font-black text-[var(--text-primary)]">1.2k</p>
              </div>
              <div className="rounded-[1.75rem] bg-[var(--elevated-color)]/80 p-6 text-sm text-[var(--text-secondary)]">
                <p className="text-[var(--text-secondary)]">Weekly volume</p>
                <p className="mt-3 text-3xl font-black text-[var(--text-primary)]">$72.4k</p>
              </div>
              <div className="rounded-[1.75rem] bg-[var(--elevated-color)]/80 p-6 text-sm text-[var(--text-secondary)]">
                <p className="text-[var(--text-secondary)]">Rewards issued</p>
                <p className="mt-3 text-3xl font-black text-[var(--text-primary)]">384</p>
              </div>
            </div>
          </div>

          <UserCard user={sampleUser} />
        </div>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface-color)]/85 p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--accent-color)]">Watch tracking</p>
            <h2 className="mt-3 text-2xl font-black text-[var(--text-primary)]">Connect your Kick account</h2>
            <p className="mt-3 text-[var(--text-secondary)]">
              Link Kick for watch hour tracking and stronger token rewards.
            </p>
            <Link
              href="/auth/kick"
              className="mt-6 inline-flex rounded-full bg-[var(--accent-color)] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:brightness-110"
            >
              Connect Kick
            </Link>
          </div>
          <div className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface-color)]/85 p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--accent-color)]">Reward store</p>
            <h2 className="mt-3 text-2xl font-black text-[var(--text-primary)]">Redeem VinzzurBucks for cash</h2>
            <p className="mt-3 text-[var(--text-secondary)]">
              Spend your VinzzurBucks on a $5 reward through the Vinzzur store.
            </p>
            <Link
              href="/store"
              className="mt-6 inline-flex rounded-full border border-[var(--border-color)] bg-[var(--surface-color)]/95 px-6 py-3 text-sm uppercase tracking-[0.14em] text-[var(--text-primary)] transition hover:border-[var(--primary-color)]"
            >
              Open Store
            </Link>
          </div>
          <div className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface-color)]/85 p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--accent-color)]">VinzzurBucks</p>
            <h2 className="mt-3 text-2xl font-black text-[var(--text-primary)]">Simple earning, clear rewards</h2>
            <p className="mt-3 text-[var(--text-secondary)]">
              Every $100 wagered earns 1 VinzzurBuck. Redeem 500 VinzzurBucks for a $5 bonus.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
