"use client";

import { useRoom } from "@/components/game/RoomProvider";
import { MatchSummaryView } from "@/components/game/views/MatchSummaryView";

export default function MatchSummaryPhasePage() {
  const { session, mySlot, playerId } = useRoom();
  if (session.phase !== "match_summary") return null;
  return <MatchSummaryView session={session} mySlot={mySlot} playerId={playerId} />;
}
