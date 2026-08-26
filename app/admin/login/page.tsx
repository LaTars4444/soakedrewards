"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isPasswordNotSet = !ADMIN_PASSWORD;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("wildcs_admin_auth");
      if (stored === "true") {
        router.replace("/admin");
      }
    }
  }, [router]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPasswordNotSet) {
      setError("Admin password is not configured. Set NEXT_PUBLIC_ADMIN_PASSWORD in environment variables.");
      return;
    }
    if (password.trim() === ADMIN_PASSWORD) {
      window.localStorage.setItem("wildcs_admin_auth", "true");
      router.push("/admin");
      return;
    }

    setError("Invalid admin password. Please try again.");
  };

  return (
    <main className="min-h-screen px-6 py-20">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface-color)]/90 p-10 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.22em] text-[var(--accent-color)]">Admin login</p>
        <h1 className="mt-2 text-3xl font-black text-[var(--text-primary)]">Hidden access page</h1>
        <p className="mt-4 text-[var(--text-secondary)]">
          This page is only accessible by direct URL. Enter the admin password to unlock the Vinzzur Rewards admin dashboard.
        </p>
        {isPasswordNotSet && (
          <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-200">
            ⚠️ Admin password not configured. Set <code className="bg-black/30 px-2 py-1 rounded">NEXT_PUBLIC_ADMIN_PASSWORD</code> in your environment variables.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <label className="block text-sm font-semibold text-[var(--text-secondary)]">
            Admin password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-3 w-full rounded-3xl border border-[var(--border-color)] bg-[var(--bg-color)]/90 px-4 py-3 text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-color)]"
              placeholder="Enter secret access code"
            />
          </label>

          {error ? (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-4">
            <button
              type="submit"
              className="rounded-full bg-[var(--accent-color)] px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-black transition hover:brightness-110"
            >
              Unlock Admin Dashboard
            </button>
            <Link
              href="/"
              className="rounded-full border border-[var(--border-color)] bg-[var(--surface-color)]/95 px-6 py-3 text-sm uppercase tracking-[0.16em] text-[var(--text-primary)] transition hover:border-[var(--primary-color)]"
            >
              Back to Home
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
