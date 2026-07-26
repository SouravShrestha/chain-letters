"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";
import type { Session, Slot } from "@/types/session";
import { Tile } from "@/components/game/Tile";
import { gameApi } from "@/lib/game-api";
import Link from "next/link";

export function MatchSummaryView({
  session,
  mySlot,
  playerId,
}: {
  session: Session;
  mySlot: Slot | null;
  playerId: string;
}) {
  const router = useRouter();
  const loader = useTopLoader();
  const [busy, setBusy] = useState(false);

  const winner =
    session.host_score > session.guest_score
      ? "host"
      : session.guest_score > session.host_score
        ? "guest"
        : "tie";
  const iWon = winner === mySlot;
  
  let title = "Draw";
  if (winner === "host" || winner === "guest") {
    title = iWon ? "You Win" : "You Lose";
  }

  useEffect(() => {
    if (session.rematch_code && session.rematch_code !== session.code) {
      const t = setTimeout(() => {
        router.push(`/room/${session.rematch_code}`);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [session.rematch_code, session.code, router]);

  const handleRematch = async () => {
    setBusy(true);
    loader.start();
    try {
      const res = await gameApi.rematch({ sessionId: session.id, playerId });
      router.push(`/room/${res.code}`);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed");
      loader.done();
      setBusy(false);
    }
  };

  return (
    <div className="py-2 text-center flex flex-col items-center font-[inherit]">
      <h1 className="text-3xl mt-6 mb-10">
        {title}
      </h1>

      <div className="flex justify-center gap-20 text-center w-full mx-auto mb-10">
        <div className="flex flex-col items-center flex-1">
          <div className="text-2xl leading-none mb-6">{session.host_score}</div>
          <div className="text-lg font-medium">{session.host_name}</div>
        </div>
        <div className="flex flex-col items-center flex-1">
          <div className="text-2xl leading-none mb-6">{session.guest_score}</div>
          <div className="text-lg font-medium">{session.guest_name}</div>
        </div>
      </div>

      <div className="w-full max-w-xs mx-auto text-left">
        <h3 className="text-xl font-medium mb-8 text-center">
          Round recap
        </h3>
        <div className="flex flex-col gap-6 mb-16">
          {session.round_history.map((h) => (
            <div
              key={h.round}
              className="grid grid-cols-[3rem_auto_1fr] items-center gap-4"
            >
              <div className="text-sm font-bold uppercase">
                R{h.round}
              </div>
              <div className="flex items-center gap-2">
                {h.start_letter && h.end_letter ? (
                  <>
                    <Tile letter={h.start_letter} variant="filled" className="bg-black text-white border-black dark:bg-white dark:text-black dark:border-white font-serif" size="sm" />
                    <Tile letter={h.end_letter} variant="filled" className="bg-black text-white border-black dark:bg-white dark:text-black dark:border-white font-serif" size="sm" />
                  </>
                ) : (
                  <div className="w-[4.5rem] h-8 flex items-center justify-center text-xs text-muted-foreground italic">
                    Timeout
                  </div>
                )}
              </div>
              <div className="text-sm font-bold text-right">
                {h.winner === "host" ? session.host_name : h.winner === "guest" ? session.guest_name : "Tie"}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto w-full max-w-xs mx-auto flex items-center justify-around gap-4">
        {mySlot === "host" ? (
          <>
            <Link
              href="/"
              className="h-12 px-6 flex items-center justify-center rounded-none border border-black dark:border-white font-medium tracking-wide hover:opacity-70 transition-opacity"
            >
              Leave
            </Link>
            <button
              id="rematch-btn"
              disabled={busy}
              onClick={handleRematch}
              className="h-12 px-6 rounded-none bg-black text-white dark:bg-white dark:text-black font-medium tracking-wide disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {busy ? "…" : "Rematch"}
            </button>
          </>
        ) : (
          <>
            <div className="text-sm font-medium text-left flex-1">
              {session.rematch_code
                ? "Joining rematch…"
                : `${session.host_name} can start a rematch`}
            </div>
            <Link
              href="/"
              className="h-12 px-6 flex items-center justify-center rounded-none bg-black text-white dark:bg-white dark:text-black font-medium tracking-wide hover:opacity-90 transition-opacity"
            >
              Leave
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
