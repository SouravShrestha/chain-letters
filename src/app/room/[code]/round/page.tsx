"use client";

import { useRoom } from "@/components/game/RoomProvider";
import { RoundView } from "@/components/game/views/RoundView";

export default function RoundPhasePage() {
  const { session, currentRoundSubmissions, mySlot, playerId } = useRoom();
  if (session.phase !== "round") return null;
  return (
    <RoundView
      session={session}
      submissions={currentRoundSubmissions}
      mySlot={mySlot}
      playerId={playerId}
    />
  );
}
