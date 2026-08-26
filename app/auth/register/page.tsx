"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setError("Username, email, and password are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, email, password }) });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Unable to create account.");
      return;
    }
    router.push("/profile");
  };

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-md">
        <section className="rounded-[1.5rem] border border-[var(--border-color)] bg-[var(--surface-color)]/90 p-8">
          <h1 className="text-2xl font-black">Create account</h1>
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="rounded-md border border-[var(--border-color)] bg-[var(--bg-color)] px-3 py-3 text-[var(--text-primary)] outline-none"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="rounded-md border border-[var(--border-color)] bg-[var(--bg-color)] px-3 py-3 text-[var(--text-primary)] outline-none"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="rounded-md border border-[var(--border-color)] bg-[var(--bg-color)] px-3 py-3 text-[var(--text-primary)] outline-none"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="rounded-md border border-[var(--border-color)] bg-[var(--bg-color)] px-3 py-3 text-[var(--text-primary)] outline-none"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button type="submit" className="rounded-full bg-[var(--accent-color)] px-4 py-3 font-semibold">Create account</button>
              <button type="button" onClick={() => router.push('/auth/login')} className="rounded-full border border-[var(--border-color)] px-4 py-3">Log in</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
