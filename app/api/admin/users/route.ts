import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, username: true, email: true, avatar: true, totalWagered: true, lifetimeWagered: true, bonusBalance: true, vipTier: true, streakDays: true, createdAt: true, updatedAt: true, _count: { select: { wagers: true, rewards: true } } },
    });
    return NextResponse.json({ users });
  } catch (error) {
    const status = error instanceof Error && error.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ error: status === 403 ? "Forbidden" : "Unauthorized" }, { status });
  }
}
