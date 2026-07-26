"use client";

import { useRoom } from "@/components/game/RoomProvider";
import { RoundResultView } from "@/components/game/views/RoundResultView";

export default function RoundResultPhasePage() {
  const { session, mySlot, playerId } = useRoom();
  if (session.phase !== "round_result") return null;
  return <RoundResultView session={session} mySlot={mySlot} playerId={playerId} />;
}
