"use client";

import { useEffect, useState, useTransition } from "react";

type AdminUser = { id: string; username: string; email: string; lifetimeWagered: number; createdAt: string; _count: { wagers: number; rewards: number } };
type AdminWager = { id: string; externalId: string | null; amount: number; status: string; placedAt: string; user: { username: string; email: string } };

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "Request failed");
  return result;
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<"dashboard" | "users" | "wagers">("dashboard");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [wagers, setWagers] = useState<AdminWager[]>([]);
  const [amount, setAmount] = useState(100);
  const [selectedUser, setSelectedUser] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [userResult, wagerResult] = await Promise.all([getJson<{ users: AdminUser[] }>("/api/admin/users"), getJson<{ wagers: AdminWager[] }>("/api/admin/wagers")]);
      setUsers(userResult.users);
      setWagers(wagerResult.wagers);
      setSelectedUser((current) => current || userResult.users[0]?.id || "");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const grant = () => {
    startTransition(async () => {
      setStatus(null);
      setError(null);
      try {
        const response = await fetch("/api/admin/grant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: selectedUser, amount }) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Grant failed");
        setStatus(`${amount.toLocaleString()} VinzzurBucks granted to ${result.user.username}.`);
        await load();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Grant failed.");
      }
    });
  };

  return (
    <main className="border border-[var(--border-color)] bg-[var(--surface-color)]/70 p-6 sm:p-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border-color)] pb-6"><div><p className="text-xs uppercase tracking-[0.28em] text-[var(--accent-color)]">Vinzzur Rewards</p><h1 className="mt-2 text-3xl font-black">Admin dashboard</h1></div><button type="button" onClick={() => void load()} disabled={loading} className="rounded-full border border-[var(--border-color)] px-4 py-2 text-sm transition hover:border-[var(--accent-color)] disabled:opacity-50">{loading ? "Refreshing..." : "Refresh data"}</button></div>
      <nav className="flex gap-2 border-b border-[var(--border-color)] py-4" aria-label="Admin sections">{(["dashboard", "users", "wagers"] as const).map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-full px-4 py-2 text-sm capitalize transition ${tab === item ? "bg-[var(--accent-color)] text-black" : "border border-[var(--border-color)] hover:border-[var(--accent-color)]"}`}>{item}</button>)}</nav>
      {error && <p className="mt-6 border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</p>}{status && <p className="mt-6 border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-200">{status}</p>}
      {loading ? <p className="mt-8 text-[var(--text-secondary)]">Loading admin data...</p> : tab === "dashboard" ? <section className="mt-8 grid gap-4 sm:grid-cols-3"><div className="border border-[var(--border-color)] p-5"><p className="text-sm text-[var(--text-secondary)]">Users</p><p className="mt-2 text-3xl font-black">{users.length}</p></div><div className="border border-[var(--border-color)] p-5"><p className="text-sm text-[var(--text-secondary)]">Wagers</p><p className="mt-2 text-3xl font-black">{wagers.length}</p></div><div className="border border-[var(--border-color)] p-5"><p className="text-sm text-[var(--text-secondary)]">Wager volume</p><p className="mt-2 text-3xl font-black">${wagers.reduce((total, wager) => total + wager.amount, 0).toLocaleString()}</p></div></section> : tab === "users" ? <section className="mt-8 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead><tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)]"><th className="p-3">User</th><th className="p-3">Email</th><th className="p-3">Wagered</th><th className="p-3">Wagers</th><th className="p-3">Joined</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-b border-[var(--border-color)]/60"><td className="p-3 font-semibold">{user.username}</td><td className="p-3">{user.email}</td><td className="p-3">${user.lifetimeWagered.toLocaleString()}</td><td className="p-3">{user._count.wagers}</td><td className="p-3">{new Date(user.createdAt).toLocaleString()}</td></tr>)}</tbody></table>{users.length === 0 && <p className="p-6 text-[var(--text-secondary)]">No registered users yet.</p>}</section> : <section className="mt-8 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead><tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)]"><th className="p-3">Player</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Placed</th><th className="p-3">External ID</th></tr></thead><tbody>{wagers.map((wager) => <tr key={wager.id} className="border-b border-[var(--border-color)]/60"><td className="p-3 font-semibold">{wager.user.username}</td><td className="p-3">${wager.amount.toLocaleString()}</td><td className="p-3">{wager.status}</td><td className="p-3">{new Date(wager.placedAt).toLocaleString()}</td><td className="p-3">{wager.externalId ?? "-"}</td></tr>)}</tbody></table>{wagers.length === 0 && <p className="p-6 text-[var(--text-secondary)]">No wagers recorded yet.</p>}</section>}
      <section className="mt-10 border-t border-[var(--border-color)] pt-6"><h2 className="text-xl font-black">Grant VinzzurBucks</h2><div className="mt-4 flex flex-wrap gap-3"><select value={selectedUser} onChange={(event) => setSelectedUser(event.target.value)} className="rounded-md border border-[var(--border-color)] bg-[var(--bg-color)] px-3 py-2" aria-label="User"><option value="">Select user</option>{users.map((user) => <option key={user.id} value={user.id}>{user.username}</option>)}</select><input type="number" min="1" value={amount} onChange={(event) => setAmount(Number(event.target.value))} className="w-32 rounded-md border border-[var(--border-color)] bg-[var(--bg-color)] px-3 py-2" aria-label="Amount" /><button type="button" disabled={!selectedUser || isPending} onClick={grant} className="rounded-full bg-[var(--accent-color)] px-4 py-2 font-semibold text-black disabled:opacity-50">{isPending ? "Granting..." : "Grant coins"}</button></div></section>
    </main>
  );
}
