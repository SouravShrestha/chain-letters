"use client";

import type { Session, Slot } from "@/types/session";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowIcon } from "../icons/ArrowIcon";
import { useState } from "react";
import { ConfirmDialog } from "../ConfirmDialog";
import { gameApi } from "@/lib/game-api";

export function TopBar({
  session,
  mySlot,
  playerId,
  onLeave,
}: {
  session: Session;
  mySlot: Slot | null;
  playerId: string;
  onLeave: () => void;
}) {
  const [showConfirmQuit, setShowConfirmQuit] = useState(false);
  const [quitting, setQuitting] = useState(false);

  const handleConfirmQuit = async () => {
    setQuitting(true);
    try {
      await gameApi.leave({ sessionId: session.id, playerId });
    } catch {
      // best-effort — navigate regardless
    }
    onLeave();
  };

  const showScores = session.rounds_total > 0 && session.phase === "letter_pick";

  return (
    <div className="w-full flex flex-col gap-8 mb-4">
      {/* Top Row: Quit | Round | Theme */}
      <div className="flex items-center justify-between w-full h-10">
        <button
          onClick={() => setShowConfirmQuit(true)}
          disabled={quitting}
          className="text-sm font-semibold hover:opacity-60 transition-opacity flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <div className="rotate-180 mr-1.5"><ArrowIcon width={24} height={18} /></div> Quit
        </button>

        <ThemeToggle />
      </div>

      <ConfirmDialog
        isOpen={showConfirmQuit}
        onClose={() => setShowConfirmQuit(false)}
        onConfirm={handleConfirmQuit}
        title="Quit Game?"
        description="Are you sure you want to quit? This will end the game for everyone."
        confirmText="Quit"
        cancelText="Cancel"
      />

      {/* Scores Row — hidden during active round */}
      {showScores && (
        <div className="flex items-center w-full justify-between">
          {/* Player 1 (Host) */}
          <div className="flex flex-col gap-1.5 items-start">
            <div className="text-3xl tabular-nums leading-none tracking-tighter">
              {session.host_score}
            </div>
            <div className="text-sm font-semibold text-muted-foreground">
              {session.host_name} {mySlot === "host" && <span className="text-foreground">(You)</span>}
            </div>
          </div>

          {/* Player 2 (Guest) */}
          <div className="flex flex-col gap-1.5 items-end text-right">
            <div className="text-3xl tabular-nums leading-none tracking-tighter">
              {session.guest_score}
            </div>
            <div className="text-sm font-semibold text-muted-foreground">
              {session.guest_name || "Guest"} {mySlot === "guest" && <span className="text-foreground">(You)</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
