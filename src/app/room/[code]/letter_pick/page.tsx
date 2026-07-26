"use client";

import { useRoom } from "@/components/game/RoomProvider";
import { LetterPickView } from "@/components/game/views/LetterPickView";

export default function LetterPickPhasePage() {
  const { session, mySlot, playerId } = useRoom();
  if (session.phase !== "letter_pick") return null;
  return <LetterPickView session={session} mySlot={mySlot} playerId={playerId} />;
}
