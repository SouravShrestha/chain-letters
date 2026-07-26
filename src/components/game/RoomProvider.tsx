"use client";

import { createContext, useContext } from "react";
import { useRouter, useParams } from "next/navigation";
import type { Session, Submission, Slot } from "@/types/session";
import Link from "next/link";
import { TopBar } from "@/components/game/TopBar";
import { ViewErrorBoundary } from "@/components/ViewErrorBoundary";
import { useRoomSession } from "@/hooks/useRoomSession";

interface RoomContextType {
  session: Session;
  submissions: Submission[];
  playerId: string;
  mySlot: Slot | null;
  currentRoundSubmissions: Submission[];
}

const RoomContext = createContext<RoomContextType | null>(null);

export function useRoom() {
  const context = useContext(RoomContext);
  if (!context) throw new Error("useRoom must be used within RoomProvider");
  return context;
}

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const router = useRouter();

  const {
    session,
    submissions,
    loading,
    notFound,
    hostLeft,
    countdown,
    playerId,
    mySlot,
    currentRoundSubmissions,
  } = useRoomSession(code);

  if (hostLeft) {
    return (
      <main className="h-dvh bg-zinc-50 dark:bg-black flex items-center justify-center sm:px-4">
        <div className="w-full sm:max-w-sm h-full relative flex flex-col px-6 py-6 bg-white bg-box-pattern ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-300/20 items-center justify-center gap-4">
          <h1 className="text-3xl font-extrabold text-foreground text-center">Opponent Left</h1>
          <p className="text-muted-foreground text-center">Your opponent left and the room has been deleted.</p>
          <p className="text-sm text-muted-foreground animate-pulse mt-2 mb-2">Redirecting in {countdown} seconds...</p>
          <Link
            href="/"
            className="h-12 w-full flex items-center justify-center border-2 border-foreground bg-foreground text-background font-bold uppercase hover:bg-transparent hover:text-foreground transition-colors"
          >
            Go back now
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="h-dvh bg-zinc-50 dark:bg-black flex items-center justify-center sm:px-4">
        <div className="w-full sm:max-w-sm h-full relative flex flex-col px-6 py-6 bg-white bg-box-pattern ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-300/20 items-center justify-center">
          <p className="text-muted-foreground animate-pulse font-bold tracking-widest">Loading room…</p>
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="h-dvh bg-zinc-50 dark:bg-black flex items-center justify-center sm:px-4">
        <div className="w-full sm:max-w-sm h-full relative flex flex-col px-6 py-6 bg-white bg-box-pattern ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-300/20 items-center justify-center gap-4">
          <h1 className="text-3xl font-extrabold text-foreground">Room not found</h1>
          <p className="text-muted-foreground text-center">The code &ldquo;{code}&rdquo; doesn&apos;t match any room.</p>
          <Link
            href="/"
            className="h-12 w-full mt-4 flex items-center justify-center border-2 border-foreground bg-foreground text-background font-bold uppercase hover:bg-transparent hover:text-foreground transition-colors"
          >
            Back to lobby
          </Link>
        </div>
      </main>
    );
  }

  if (!session) return null;

  const isLobby = session.phase === "lobby";

  if (isLobby) {
    return (
      <RoomContext.Provider
        value={{
          session,
          submissions,
          playerId,
          mySlot,
          currentRoundSubmissions,
        }}
      >
        <ViewErrorBoundary>
          {children}
        </ViewErrorBoundary>
      </RoomContext.Provider>
    );
  }

  return (
    <RoomContext.Provider
      value={{
        session,
        submissions,
        playerId,
        mySlot,
        currentRoundSubmissions,
      }}
    >
      <main className="h-dvh bg-zinc-50 dark:bg-black flex items-center justify-center sm:px-4">
        <div className={`w-full sm:max-w-sm h-full relative flex flex-col px-6 bg-white bg-box-pattern ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-300/20 overflow-y-auto ${session.phase === "round" ? "pt-6 pb-0" : "py-6"}`}>
          <TopBar session={session} mySlot={mySlot} playerId={playerId} onLeave={() => router.push("/")} />
          <div className="flex-1 flex flex-col">
            <ViewErrorBoundary>
              {children}
            </ViewErrorBoundary>
          </div>
        </div>
      </main>
    </RoomContext.Provider>
  );
}
