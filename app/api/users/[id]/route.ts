import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const currentUser = await requireUser().catch(() => null);
  if (!currentUser || (currentUser.id !== id && currentUser.email.toLowerCase() !== "vinzzur@mail.com")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      rewards: { select: { id: true, type: true, amount: true, claimed: true, claimedAt: true, createdAt: true } },
      watchTimeEntries: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
