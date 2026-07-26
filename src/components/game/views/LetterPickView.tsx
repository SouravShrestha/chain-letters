"use client";

import { useState, useEffect } from "react";
import type { Session, Slot } from "@/types/session";
import { Tile } from "@/components/game/Tile";
import { gameApi } from "@/lib/game-api";

export function LetterPickView({
  session,
  mySlot,
  playerId,
}: {
  session: Session;
  mySlot: Slot | null;
  playerId: string;
}) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // revealed is set when both picks come in (session advances to "round")
  // We animate from letter_pick → round transition
  const [revealedStart, setRevealedStart] = useState<string | null>(null);
  const [revealedEnd, setRevealedEnd] = useState<string | null>(null);

  useEffect(() => {
    setChosen(null);
    setRevealedStart(null);
    setRevealedEnd(null);
  }, [session.current_round]);

  // When start/end letters appear (both picked), animate the reveal
  useEffect(() => {
    if (session.start_letter && session.end_letter) {
      const t = setTimeout(() => {
        setRevealedStart(session.start_letter);
        setRevealedEnd(session.end_letter);
      }, 100);
      return () => clearTimeout(t);
    }
  }, [session.start_letter, session.end_letter]);

  const send = async (letter: string) => {
    if (!mySlot || busy) return;
    setBusy(true);
    setChosen(letter);
    try {
      await gameApi.submitLetter({ sessionId: session.id, playerId, letter });
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed");
      setChosen(null);
    } finally {
      setBusy(false);
    }
  };

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  if (revealedStart && revealedEnd) {
    return (
      <div className="py-12 md:py-24 flex flex-col items-center min-h-[60vh] justify-center text-center">
        <div className="text-sm uppercase tracking-widest text-muted-foreground font-bold mb-12">
          Letters revealed!
        </div>
        <div className="flex justify-center gap-8 md:gap-16">
          <div className="flex flex-col items-center gap-6">
            <span className="text-sm uppercase tracking-widest text-muted-foreground font-bold">Start</span>
            <Tile letter={revealedStart} variant="correct" size="xl" className="animate-reveal-letter" />
          </div>
          <div className="flex flex-col items-center gap-6">
            <span className="text-sm uppercase tracking-widest text-muted-foreground font-bold">End</span>
            <div style={{ animationDelay: "0.15s" }}>
              <Tile
                letter={revealedEnd}
                variant="present"
                size="xl"
                className="animate-reveal-letter"
              />
            </div>
          </div>
        </div>
        <p className="mt-16 text-muted-foreground animate-pulse">Starting round…</p>
      </div>
    );
  }

  return (
    <div className="py-6 md:py-8 flex flex-col items-center min-h-[60vh] justify-center">
      {!chosen && (
        <div className="text-center mb-8">
          {session.rounds_total > 0 && (
            <p className="text-xs tracking-widest text-muted-foreground font-bold mb-3">
              Round {session.current_round} of {session.rounds_total}
            </p>
          )}
          <h2 className="text-xl">Pick your letter</h2>
        </div>
      )}

      {chosen ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-6 font-bold text-xl tracking-widest">
            You picked
          </p>
          <Tile letter={chosen} variant="filled" size="lg" />
          <p className="mt-8 text-muted-foreground animate-pulse text-base tracking-wider">Waiting for opponent...</p>
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-3 sm:gap-4 w-full max-w-[320px] sm:max-w-100 mx-auto">
          {letters.map((l) => (
            <button
              key={l}
              onClick={() => send(l)}
              disabled={busy}
              className="aspect-square border-[1.5px] border-(--tile-border) bg-(--tile) text-foreground uppercase select-none text-2xl sm:text-3xl hover:border-foreground transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center rounded-sm"
            >
              {l}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
