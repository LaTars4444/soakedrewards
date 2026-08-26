import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireUser();
    return children;
  } catch {
    redirect("/auth/login");
  }
}
