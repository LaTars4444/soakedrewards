import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type ProviderRecord = Record<string, unknown>;

function numberValue(record: ProviderRecord, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
    if (Number.isFinite(number)) return number;
  }
  return 0;
}

function stringValue(record: ProviderRecord, ...keys: string[]) {
  for (const key of keys) {
    if (typeof record[key] === "string" && record[key]) return record[key] as string;
  }
  return undefined;
}

function providerRecords(payload: unknown): ProviderRecord[] {
  if (Array.isArray(payload)) return payload.filter((item): item is ProviderRecord => !!item && typeof item === "object");
  if (!payload || typeof payload !== "object") return [];

  const wrapper = payload as ProviderRecord;
  for (const key of ["data", "results", "leaderboard", "users"]) {
    if (Array.isArray(wrapper[key])) {
      return wrapper[key].filter((item): item is ProviderRecord => !!item && typeof item === "object");
    }
  }
  return [];
}

async function getDatabaseLeaderboard() {
  return prisma.user.findMany({
    orderBy: { totalWagered: "desc" },
    take: 50,
    select: { id: true, username: true, avatar: true, totalWagered: true, weeklyWagered: true, monthlyWagered: true, lifetimeWagered: true, lifetimeTokenCredits: true, tokens: true, bonusBalance: true, watchTime: true, vipTier: true, streakDays: true, connectedAccounts: true },
  });
}

async function getProviderLeaderboard() {
  const endpoint = process.env.HELL_CASINO_API;
  if (!endpoint) return null;

  const response = await fetch(endpoint, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`HellCasino API returned ${response.status}`);

  const records = providerRecords(await response.json());
  if (records.length === 0) return [];

  const users = await getDatabaseLeaderboard();
  const usersById = new Map<string, (typeof users)[number]>();
  const usersByName = new Map<string, (typeof users)[number]>();
  for (const user of users) {
    usersById.set(user.id, user);
    usersByName.set(user.username.toLowerCase(), user);
    const accounts = user.connectedAccounts && typeof user.connectedAccounts === "object" ? user.connectedAccounts as { hellCasinoId?: string } : {};
    if (accounts.hellCasinoId) usersById.set(accounts.hellCasinoId, user);
  }

  return records.map((record, index) => {
    const providerId = stringValue(record, "userId", "user_id", "id", "playerId", "player_id");
    const username = stringValue(record, "username", "userName", "user_name", "player", "name") ?? `Player ${index + 1}`;
    const localUser = (providerId ? usersById.get(providerId) : undefined) ?? usersByName.get(username.toLowerCase());
    const lifetimeWagered = numberValue(record, "lifetimeWagered", "lifetime_wagered", "totalWagered", "total_wagered", "wagered", "amount");

    return {
      id: localUser?.id ?? providerId ?? `provider-${index}`,
      username: localUser?.username ?? username,
      avatar: localUser?.avatar ?? null,
      totalWagered: lifetimeWagered,
      weeklyWagered: localUser?.weeklyWagered ?? 0,
      monthlyWagered: localUser?.monthlyWagered ?? 0,
      lifetimeWagered,
      lifetimeTokenCredits: localUser?.lifetimeTokenCredits ?? 0,
      tokens: localUser?.tokens ?? 0,
      bonusBalance: localUser?.bonusBalance ?? 0,
      watchTime: localUser?.watchTime ?? 0,
      vipTier: localUser?.vipTier ?? "bronze",
      streakDays: localUser?.streakDays ?? 0,
    };
  }).sort((left, right) => right.totalWagered - left.totalWagered).slice(0, 50);
}


export async function GET() {
  try {
    const users = await getProviderLeaderboard();
    return NextResponse.json(users ?? await getDatabaseLeaderboard());
  } catch (error) {
    console.error("leaderboard provider error", error);
    return NextResponse.json(await getDatabaseLeaderboard());
  }
}
