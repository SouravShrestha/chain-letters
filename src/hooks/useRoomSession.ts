"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";
import { supabase } from "@/integrations/supabase/client";
import { getPlayerId, getPlayerName, setPlayerName } from "@/lib/player-id";
import { gameApi } from "@/lib/game-api";
import type { Session, Submission, Slot } from "@/types/session";

export function useRoomSession(code: string) {
  const router = useRouter();
  const pathname = usePathname();
  const loader = useTopLoader();

  const [playerId, setPlayerId] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [hostLeft, setHostLeft] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const joinedRef = useRef(false);

  useEffect(() => {
    if (hostLeft) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.replace("/");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [hostLeft, router]);

  useEffect(() => {
    setPlayerId(getPlayerId());
  }, []);

  const sessionRef = useRef<Session | null>(session);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    if (!playerId) return;

    const handleLeave = () => {
      const currentSession = sessionRef.current;
      if (currentSession) {
        const data = JSON.stringify({ sessionId: currentSession.id, playerId });
        const blob = new Blob([data], { type: "application/json" });
        navigator.sendBeacon("/api/game/leave", blob);
      }
    };

    window.addEventListener("beforeunload", handleLeave);
    
    return () => {
      window.removeEventListener("beforeunload", handleLeave);
      // When RoomProvider unmounts (e.g. user navigates back to home page)
      handleLeave();
    };
  }, [playerId]);

  const loadAndJoin = useCallback(async () => {
    if (!playerId || joinedRef.current) return;
    joinedRef.current = true;
    loader.start();

    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("code", code)
      .maybeSingle();

    if (error || !data) {
      setNotFound(true);
      setLoading(false);
      loader.done();
      return;
    }

    if (data.host_id !== playerId && (!data.guest_id || data.guest_id === playerId)) {
      const name = getPlayerName() || "Player 2";
      setPlayerName(name);
      try {
        await gameApi.join({ code, playerId, name });
      } catch {
        // join failure is non-fatal — fresh session fetch below determines actual state
      }
    }

    const { data: fresh } = await supabase
      .from("sessions")
      .select("*")
      .eq("code", code)
      .maybeSingle();

    if (fresh) setSession(fresh as unknown as Session);

    const { data: subs } = await supabase
      .from("submissions")
      .select("*")
      .eq("session_id", data.id)
      .order("created_at", { ascending: true });

    if (subs) setSubmissions(subs as unknown as Submission[]);
    setLoading(false);
    loader.done();
  }, [code, playerId, loader]);

  useEffect(() => {
    loadAndJoin();
  }, [loadAndJoin]);

  // Supabase Realtime
  useEffect(() => {
    if (!session?.id) return;
    const chan = supabase
      .channel(`room:${session.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sessions",
          filter: `id=eq.${session.id}`,
        },
        (payload) => setSession(payload.new as unknown as Session),
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "submissions",
          filter: `session_id=eq.${session.id}`,
        },
        (payload) => setSubmissions((prev) => [...prev, payload.new as unknown as Submission]),
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "sessions",
          filter: `id=eq.${session.id}`,
        },
        () => setHostLeft(true),
      )
      .subscribe();

    return () => { supabase.removeChannel(chan); };
  }, [session?.id]);

  // Phase Routing logic
  useEffect(() => {
    if (!session) return;
    const expectedPath = `/room/${code}/${session.phase}`;
    if (pathname !== expectedPath) {
      router.replace(expectedPath);
    }
  }, [session, session?.phase, pathname, router, code]);

  const mySlot: Slot | null =
    session?.host_id === playerId ? "host" : session?.guest_id === playerId ? "guest" : null;

  const currentRoundSubmissions = submissions.filter((s) => s.round === session?.current_round);

  return {
    session,
    submissions,
    loading,
    notFound,
    hostLeft,
    countdown,
    playerId,
    mySlot,
    currentRoundSubmissions,
  };
}
