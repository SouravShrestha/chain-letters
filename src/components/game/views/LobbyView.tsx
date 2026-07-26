"use client";

import { useState, useEffect } from "react";
import type { Session } from "@/types/session";
import { useRoom } from "@/components/game/RoomProvider";
import { gameApi } from "@/lib/game-api";
import { useTopLoader } from "nextjs-toploader";
import { AvatarPandaIcon } from "@/components/icons/AvatarPandaIcon";
import { AvatarFoxIcon } from "@/components/icons/AvatarFoxIcon";
import { ShareIcon } from "@/components/icons/ShareIcon";
import { Moon, Sun, ArrowLeft, Copy, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { ArrowIcon } from "@/components/icons/ArrowIcon";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ThemeToggleMinimal } from "@/components/ThemeToggleMinimal";
export function LobbyView({ session }: { session: Session }) {
  const { playerId, mySlot } = useRoom();
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const router = useRouter();
  const loader = useTopLoader();

  // Computed at call time so it's never an empty string (avoids Safari rejecting share)
  const getUrl = () => `${window.location.origin}/room/${session.code}`;

  const copyToClipboard = async (text: string): Promise<boolean> => {
    // Modern API — works on desktop and iOS 13.4+ over HTTPS
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fall through to execCommand fallback
      }
    }
    // Legacy fallback — works on older Safari / iOS WebView
    try {
      const el = document.createElement("textarea");
      el.value = text;
      // Position off-screen so appending it never triggers a scroll
      el.style.cssText =
        "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;";
      el.setAttribute("readonly", "");
      el.setAttribute("aria-hidden", "true");
      document.body.appendChild(el);
      el.focus({ preventScroll: true });
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(session.code);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleInvite = async () => {
    const url = getUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my Chain Letters game",
          text: `Join my game with room code ${session.code}`,
          url,
        });
        return;
      } catch (e: unknown) {
        // AbortError = user dismissed share sheet — not a real error
        if (e instanceof Error && e.name === "AbortError") return;
        // Share failed, fall through to clipboard copy
      }
    }
  };

  const handleStart = async () => {
    if (mySlot !== "host") return;
    setStarting(true);
    setStartError(null);
    loader.start();
    try {
      await gameApi.start({ sessionId: session.id, playerId });
    } catch {
      loader.done();
      setStarting(false);
      setStartError("Failed to start game. Please try again.");
    }
  };

  const handleLeave = async () => {
    loader.start();
    try {
      await gameApi.leave({ sessionId: session.id, playerId });
    } catch {
      // best-effort — navigate home regardless
    }
    router.push("/");
  };

  const opponentConnected = !!session.guest_id;

  return (
    <main className="h-screen bg-zinc-50 dark:bg-black flex items-center justify-center sm:px-4">
      <div className="w-full sm:max-w-sm h-full relative flex flex-col px-6 py-6 bg-white ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-300/20">
        
        {/* Header section */}
        <div className="flex items-center justify-between mb-auto h-10 w-full">
          <button 
            onClick={() => setShowConfirmExit(true)} 
            className="text-sm font-semibold hover:opacity-60 transition-opacity flex items-center gap-1"
            title="Exit Room"
          >
            <div className="rotate-180 mr-1.5"><ArrowIcon width={24} height={18} /></div> Exit room
          </button>
          <ThemeToggleMinimal />
        </div>

        <ConfirmDialog
          isOpen={showConfirmExit}
          onClose={() => setShowConfirmExit(false)}
          onConfirm={handleLeave}
          title="Exit Room?"
          description="Are you sure you want to exit the room?"
          confirmText="Exit"
          cancelText="Cancel"
        />

        <div className="flex flex-col items-center flex-1 justify-center gap-16 py-8 px-6">
          
          {/* Room Code */}
          <button
            onClick={handleCopy}
            aria-label="Copy room code"
            className="flex items-center gap-2 pl-6 pr-4 py-2 bg-background border-[1.5px] border-foreground/90 hover:border-foreground/90 transition-colors cursor-pointer select-none w-auto rounded-sm"
          >
            <span className="text-xl font-bold tracking-[0.2em] uppercase flex-1 text-left">
              {session.code}
            </span>
            <span className="flex items-center justify-center text-foreground ml-2">
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </span>
          </button>

          {/* Players */}
          <div className="flex items-center w-full justify-between px-2">
            {/* Host */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 overflow-hidden">
                <AvatarPandaIcon />
              </div>
              <span className="text-sm font-semibold">{session.host_name}</span>
            </div>
            
            <div className="text-base font-semibold text-foreground w-16 h-16 mb-8 justify-center items-center flex">vs</div>

            {/* Guest */}
            {opponentConnected ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 overflow-hidden">
                  <AvatarFoxIcon />
                </div>
                <span className="text-sm font-semibold">{session.guest_name}</span>
              </div>
            ) : (
              <button
                onClick={handleInvite}
                className="flex flex-col items-center gap-3 group"
              >
                <div className="w-16 h-16 border-[1.5px] border-foreground flex items-center justify-center group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 transition-colors">
                  <ShareIcon height={20} width={20}/>
                </div>
                <span className="text-sm font-semibold text-foreground">Invite</span>
              </button>
            )}
          </div>
          
          {/* Start Button */}
          {mySlot === "host" ? (
            <div className="flex flex-col items-center gap-2 w-full">
             <button
                onClick={handleStart}
                disabled={!opponentConnected || starting}
                className="mt-8 h-12 w-[60%] bg-foreground text-background font-semibold tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
             >
                Start
             </button>
             {startError && (
               <p className="text-sm text-red-500">{startError}</p>
             )}
            </div>
          ) : (
            <div className="mt-8 h-12 w-full flex items-center justify-center font-semibold text-muted-foreground animate-pulse border-[1.5px] border-foreground">
               waiting for host to start...
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
