"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Session, Submission, Slot } from "@/types/session";
import { gameApi } from "@/lib/game-api";
import { RoomCodeKeyboard } from "@/components/lobby/RoomCodeKeyboard";

export function RoundView({
  session,
  submissions,
  mySlot,
  playerId,
}: {
  session: Session;
  submissions: Submission[];
  mySlot: Slot | null;
  playerId: string;
}) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ kind: "ok" | "bad"; msg: string } | null>(null);
  const [now, setNow] = useState(Date.now());
  const timerCheckSent = useRef(false);
  const chipsScrollRef = useRef<HTMLDivElement>(null);

  const isMyTurn = session.current_turn === mySlot;
  const endsAt = session.turn_ends_at ? new Date(session.turn_ends_at).getTime() : 0;
  // Cap the remaining time at turn_seconds so the grace period is hidden from the user
  const remaining = Math.min(session.turn_seconds, Math.max(0, Math.ceil((endsAt - now) / 1000)));

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (remaining === 0 && session.phase === "round" && !timerCheckSent.current) {
      timerCheckSent.current = true;
      gameApi.checkTimeout({ sessionId: session.id }).catch(() => {});
    }
    if (remaining > 0) timerCheckSent.current = false;
  }, [remaining, session.phase, session.id]);

  useEffect(() => {
    setInput("");
    setFlash(null);
  }, [session.current_turn, session.current_round]);

  // Auto-scroll chips to the right when a new word is added
  const currentRoundValidWords = submissions
    .filter((s) => s.round === session.current_round && s.valid && s.word)
    .map((s) => s.word as string);

  const wordCount = currentRoundValidWords.length;
  useEffect(() => {
    if (chipsScrollRef.current) {
      chipsScrollRef.current.scrollLeft = chipsScrollRef.current.scrollWidth;
    }
  }, [wordCount]);

  const send = useCallback(async () => {
    if (!isMyTurn || busy) return;
    const word = input.trim();
    if (!word) return;

    setBusy(true);
    setFlash({ kind: "ok", msg: "Checking…" });

    let rejected = false;
    try {
      const res = await gameApi.submitWord({ sessionId: session.id, playerId, word });
      if (res.ok === false) {
        rejected = true;
        setFlash({ kind: "bad", msg: res.reason ?? "Invalid" });
      } else {
        setFlash({ kind: "ok", msg: "Nice!" });
        setInput("");
      }
    } catch (e: unknown) {
      rejected = true;
      setFlash({ kind: "bad", msg: e instanceof Error ? e.message : "Failed" });
    } finally {
      setBusy(false);
      setTimeout(() => setFlash(null), rejected ? 2500 : 1200);
    }
  }, [isMyTurn, busy, input, session.id, playerId]);

  const handleKey = useCallback(
    (char: string) => {
      if (!isMyTurn || busy) return;
      setInput((prev) => prev + char);
    },
    [isMyTurn, busy],
  );

  const handleBackspace = useCallback(() => {
    if (!isMyTurn || busy) return;
    setInput((prev) => prev.slice(0, -1));
  }, [isMyTurn, busy]);

  const timerColor =
    remaining <= 3
      ? "text-[var(--invalid)]"
      : remaining <= 6
        ? "text-[var(--present)]"
        : "text-foreground";

  const currentPlayerName =
    session.current_turn === "host" ? session.host_name : session.guest_name;

  const oddWords = currentRoundValidWords.filter((_, i) => i % 2 === 0);
  const evenWords = currentRoundValidWords.filter((_, i) => i % 2 === 1);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-10 pt-4 flex flex-col justify-around">
        {/* Turn label + Timer */}
        <div className="text-center mb-6">
          <p className="text-base text-foreground">
            {isMyTurn ? "Your turn" : `${currentPlayerName}'s turn`}
          </p>
          <div className={`text-4xl font-bold tabular-nums mt-1 transition-colors ${timerColor}`}>
            {remaining}
          </div>
        </div>

        {/* Letter display: StartTile — underline — EndTile */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 shrink-0 bg-foreground text-background flex items-center justify-center text-2xl font-bold uppercase rounded-sm">
            {session.start_letter || "?"}
          </div>
          <div className="flex-1 border-b-[1.5px] border-foreground mb-1 h-14" />
          <div className="w-14 h-14 shrink-0 bg-foreground text-background flex items-center justify-center text-2xl font-bold uppercase rounded-sm">
            {session.end_letter || "?"}
          </div>
        </div>

        {/* Answer chips — two staggered rows, horizontally scrollable */}
        <div ref={chipsScrollRef} className="overflow-x-auto overflow-y-hidden mt-2">
          <div className="flex flex-col gap-2" style={{ width: "max-content" }}>
            {/* Row 1: words at index 0, 2, 4, … */}
            <div className="flex gap-2">
              {oddWords.map((word) => (
                <span
                  key={word}
                  className="shrink-0 px-4 py-2 border border-input rounded-sm text-sm font-medium text-foreground whitespace-nowrap"
                >
                  {word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()}
                </span>
              ))}
            </div>
            {/* Row 2: words at index 1, 3, 5, … — offset by half a chip */}
            {evenWords.length > 0 && (
              <div className="flex gap-2">
                {evenWords.map((word) => (
                  <span
                    key={word}
                    className="shrink-0 px-4 py-2 border border-input rounded-sm text-sm font-medium text-foreground whitespace-nowrap"
                  >
                    {word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input display + Go — sits just above the keyboard */}
      <div className={`mb-6 ${flash?.kind === "bad" ? "animate-shake" : ""}`}>
        <div className="flex gap-0">
          {/* Read-only display driven by the custom keyboard */}
          <div
            className={`flex-1 h-14 px-4 border-[1.5px] rounded-l-sm text-xl font-bold uppercase tracking-wider bg-background flex items-center overflow-hidden ${isMyTurn ? "border-foreground" : "border-input"}`}
          >
            <span className="flex-1 truncate">{input}</span>
          </div>
          <button
            id="submit-word-btn"
            onClick={send}
            disabled={!isMyTurn || busy || !input}
            className={`h-14 px-6 font-semibold rounded-r-sm transition-opacity text-base ml-2 ${isMyTurn ? "bg-foreground text-background hover:opacity-80" : "bg-input text-background"}`}
          >
            Go
          </button>
        </div>
        {flash ? (
          <p
            className={`h-1 mt-4 mb-2 text-center font-bold text-sm transition-colors ${
              flash.kind === "ok" ? "text-correct" : "text-invalid"
            }`}
          >
            {flash.msg}
          </p>
        ) : (
          <p
            className={`h-1 mt-4 mb-2 text-center font-bold text-sm transition-colors`}
          >
            {" "}
          </p>
        )}
      </div>

      {/* Keyboard — break out of card's px-6 horizontally */}
      <div className="-mx-6">
        <RoomCodeKeyboard
          onKey={handleKey}
          onBackspace={handleBackspace}
          onEnter={send}
          showNumbers={false}
          disabled={!isMyTurn || busy}
        />
      </div>
    </div>
  );
}
