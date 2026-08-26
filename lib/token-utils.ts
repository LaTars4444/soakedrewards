export const TOKEN_RATE = 100;
export const CLAIM_COINS_PER_DOLLAR = 20;

export function earnedTokensFromLifetime(lifetimeWagered: number, rankMultiplier = 1) {
  return Math.floor((lifetimeWagered / TOKEN_RATE) * rankMultiplier);
}

export function lifetimeTokenDelta(lifetimeWagered: number, lifetimeTokenCredits: number, rankMultiplier = 1) {
  return Math.max(0, earnedTokensFromLifetime(lifetimeWagered, rankMultiplier) - lifetimeTokenCredits);
}
