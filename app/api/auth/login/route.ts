import { NextResponse } from "next/server";
import { createSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = typeof body.identifier === "string" ? body.identifier.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!identifier || !password) return NextResponse.json({ error: "Email/username and password are required." }, { status: 400 });
    const user = await prisma.user.findFirst({ where: { OR: [{ email: identifier }, { username: identifier }] } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    await createSession(user.id);
    return NextResponse.json({ user: { id: user.id, username: user.username, email: user.email } });
  } catch {
    return NextResponse.json({ error: "Unable to log in." }, { status: 500 });
  }
}