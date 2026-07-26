"use client";

import { useState, useEffect, useCallback } from "react";
import { useTopLoader } from "nextjs-toploader";
import type { Session, Slot } from "@/types/session";
import { gameApi } from "@/lib/game-api";

export function RoundResultView({
  session,
  mySlot,
  playerId,
}: {
  session: Session;
  mySlot: Slot | null;
  playerId: string;
}) {
  const [busy, setBusy] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const loader = useTopLoader();
  const r = session.last_result;

  const handleNext = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    loader.start();
    try {
      await gameApi.nextRound({ sessionId: session.id, playerId });
    } catch (e: unknown) {
      // 409 means the phase already moved on (Realtime beat the timer) — ignore it silently
      const msg = e instanceof Error ? e.message : "";
      if (msg !== "Not ready for next round") {
        alert(msg || "Failed");
      }
      loader.done();
    } finally {
      setBusy(false);
    }
  }, [busy, loader, playerId, session.id]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (mySlot === "host") {
      handleNext();
    }
    return () => clearTimeout(timer);
  }, [countdown, mySlot, handleNext]);

  if (!r) return null;

  let title = "Draw";
  if (r.winner === "host" || r.winner === "guest") {
    title = r.winner === mySlot ? "You Win" : "You Lose";
  }

  return (
    <div className="py-2 text-center flex flex-col items-center font-[inherit]">
      <h1 className="text-4xl font-bold mt-12 mb-6 tracking-tight">
        {title}
      </h1>
      <div className="text-xl mb-20 font-medium">
        Round {session.current_round} of {session.rounds_total}
      </div>

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

      <div className="mt-28 flex flex-col items-center">
        <div className="text-lg font-medium mb-3">
          next round in
        </div>
        <div className="text-xl font-medium">
          {countdown}s
        </div>
      </div>
    </div>
  );
}
