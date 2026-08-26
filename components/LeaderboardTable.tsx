import Image from "next/image";
import { getRankIndex, getRankName } from "@/lib/ranks";
import { User } from "@/lib/types";

const MIN_ROWS = 10;

function RankBadge({ user }: { user: User }) {
  const rankIndex = getRankIndex(user.xp ?? 0);
  return (
    <span className="mt-1 flex items-center justify-center gap-1 text-xs text-[var(--accent-color)]">
      <Image src={`/ranks/rank-${rankIndex}.svg`} alt="" width={18} height={18} />
      {getRankName(user.xp ?? 0)}
    </span>
  );
}

function PodiumPlace({ user, place }: { user?: User; place: 1 | 2 | 3 }) {
  const placeLabel = place === 1 ? "1st" : place === 2 ? "2nd" : "3rd";
  return (
    <div className={`flex flex-1 flex-col items-center justify-end text-center ${place === 1 ? "order-2 md:order-2" : place === 2 ? "order-1 md:order-1" : "order-3 md:order-3"}`}>
      <p className="mb-3 text-xs font-black uppercase tracking-[0.3em] text-[var(--accent-color)]">{placeLabel}</p>
      <div className={`flex min-h-44 w-full flex-col items-center justify-center border-x border-t px-4 py-5 ${place === 1 ? "border-[var(--accent-color)] bg-[var(--accent-color)]/15 md:min-h-60" : "border-[var(--border-color)] bg-[var(--surface-color)]/25 md:min-h-44"}`}>
        {user ? (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-color)] text-xl font-black text-black">{user.username.charAt(0).toUpperCase()}</div>
            <p className="mt-3 font-black text-[var(--text-primary)]">{user.username}</p>
            <RankBadge user={user} />
            <p className="mt-3 text-xl font-black text-[var(--text-primary)]">${user.totalWagered.toFixed(0)}</p>
          </>
        ) : (
          <p className="font-black text-[var(--text-secondary)]">Open Position</p>
        )}
      </div>
      <div className={`h-3 w-full ${place === 1 ? "bg-[var(--accent-color)]" : "bg-[var(--border-color)]"}`} />
    </div>
  );
}

export default function LeaderboardTable({ title, users }: { title?: string; users: User[] }) {
  const remainingUsers = users.slice(3);
  const placeholderCount = Math.max(0, MIN_ROWS - users.length);

  return (
    <div className="overflow-x-auto border border-[var(--border-color)]/70 bg-[var(--surface-color)]/25">
      {title ? <div className="border-b border-[var(--border-color)] bg-[var(--elevated-color)]/25 px-6 py-4 text-sm uppercase tracking-[0.18em] text-[var(--text-secondary)]">{title}</div> : null}
      <div className="flex flex-col items-end gap-4 border-b border-[var(--border-color)]/70 px-4 pt-6 md:flex-row md:items-end md:px-10 md:pt-10">
        <PodiumPlace user={users[1]} place={2} />
        <PodiumPlace user={users[0]} place={1} />
        <PodiumPlace user={users[2]} place={3} />
      </div>
      <table className="min-w-full border-separate border-spacing-0 text-left">
        <thead className="bg-[var(--elevated-color)]/25 text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">
          <tr><th className="px-4 py-4">Rank</th><th className="px-4 py-4">Player</th><th className="px-4 py-4">Wagered</th><th className="px-4 py-4">VinzzurBucks</th></tr>
        </thead>
        <tbody>
          {remainingUsers.map((user, index) => (
            <tr key={user.id} className="border-t border-[var(--border-color)] hover:bg-white/5">
              <td className="px-4 py-4 text-sm text-[var(--text-secondary)]">{index + 4}</td>
              <td className="px-4 py-4"><div className="font-medium text-[var(--text-primary)]">{user.username}</div><RankBadge user={user} /></td>
              <td className="px-4 py-4 text-sm">${user.totalWagered.toFixed(0)}</td>
              <td className="px-4 py-4 text-sm">{user.tokens.toFixed(0)}</td>
            </tr>
          ))}
          {Array.from({ length: placeholderCount }, (_, index) => <tr key={`placeholder-${index}`} className="border-t border-[var(--border-color)]"><td colSpan={5} className="px-4 py-4 text-sm text-[var(--text-secondary)]">Open Position</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}
