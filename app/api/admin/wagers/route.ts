import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();
    const wagers = await prisma.wager.findMany({ orderBy: { placedAt: "desc" }, take: 500, select: { id: true, externalId: true, userId: true, amount: true, status: true, placedAt: true, createdAt: true, user: { select: { username: true, email: true } } } });
    return NextResponse.json({ wagers });
  } catch (error) {
    const status = error instanceof Error && error.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ error: status === 403 ? "Forbidden" : "Unauthorized" }, { status });
  }
}
