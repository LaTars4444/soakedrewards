import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Vinzzur Rewards",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="min-h-screen bg-[var(--bg-color)] px-6 py-10 text-[var(--text-primary)]">
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}
