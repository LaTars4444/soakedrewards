import "server-only";

import { cookies } from "next/headers";
import { createHash, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { prisma } from "@/lib/db";

const scrypt = promisify(nodeScrypt);
const SESSION_COOKIE = "vinzzur_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
export const ADMIN_EMAIL = "vinzzur@mail.com";

export type SafeUser = {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  tokens: number;
  bonusBalance: number;
  totalWagered: number;
  lifetimeWagered: number;
  xp?: number;
  hellCasinoId?: string;
};

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, expectedHex] = stored.split(":");
  if (!salt || !expectedHex) return false;
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(expectedHex, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

function toSafeUser(user: { id: string; username: string; email: string; avatar: string | null; tokens: number; bonusBalance: number; totalWagered: number; lifetimeWagered: number; connectedAccounts: unknown }) : SafeUser {
  const accounts = user.connectedAccounts && typeof user.connectedAccounts === "object" ? user.connectedAccounts as { hellCasinoId?: string; xp?: number } : {};
  return { id: user.id, username: user.username, email: user.email, avatar: user.avatar, tokens: user.tokens, bonusBalance: user.bonusBalance, totalWagered: user.totalWagered, lifetimeWagered: user.lifetimeWagered, hellCasinoId: accounts.hellCasinoId, xp: accounts.xp };
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }
  return toSafeUser(session.user);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  await prisma.session.create({ data: { userId, tokenHash: hashSessionToken(token), expiresAt: new Date(Date.now() + SESSION_TTL_MS) } });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_TTL_MS / 1000 });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
  cookieStore.delete(SESSION_COOKIE);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.email.toLowerCase() !== ADMIN_EMAIL) throw new Error("FORBIDDEN");
  return user;
}