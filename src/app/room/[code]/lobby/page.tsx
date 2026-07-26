"use client";

import { useRoom } from "@/components/game/RoomProvider";
import { LobbyView } from "@/components/game/views/LobbyView";

export default function LobbyPhasePage() {
  const { session } = useRoom();
  if (session.phase !== "lobby") return null;
  return <LobbyView session={session} />;
}
