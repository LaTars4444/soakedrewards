import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const userId = typeof body.userId === "string" ? body.userId : "";
    const amount = Number(body.amount);
    if (!userId || !Number.isInteger(amount) || amount <= 0 || amount > 1_000_000) return NextResponse.json({ error: "Invalid grant." }, { status: 400 });
    const user = await prisma.user.update({ where: { id: userId }, data: { tokens: { increment: amount } }, select: { id: true, username: true, tokens: true } });
    return NextResponse.json({ user });
  } catch (error) {
    const status = error instanceof Error && error.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ error: status === 403 ? "Forbidden" : "Unauthorized" }, { status });
  }
}
