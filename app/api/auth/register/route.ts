import { NextResponse } from "next/server";
import { hashPassword, createSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (username.length < 3 || username.length > 32 || !/^[a-zA-Z0-9_ -]+$/.test(username)) return NextResponse.json({ error: "Username is invalid." }, { status: 400 });
    if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    const user = await prisma.user.create({ data: { username, email, passwordHash: await hashPassword(password), connectedAccounts: { hellCasinoId: "", xp: 0 } } });
    await createSession(user.id);
    return NextResponse.json({ user: { id: user.id, username: user.username, email: user.email } }, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return NextResponse.json({ error: "That username or email is already registered." }, { status: 409 });
    return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
  }
}