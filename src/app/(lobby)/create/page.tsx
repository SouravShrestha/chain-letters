"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";
import { CreateScreen } from "@/components/lobby/CreateScreen";
import { useLobby } from "@/components/lobby/LobbyProvider";
import { getPlayerId } from "@/lib/player-id";
import { gameApi } from "@/lib/game-api";

export default function CreatePage() {
  const router = useRouter();
  const loader = useTopLoader();
  const { name } = useLobby();
  const [rounds, setRounds] = useState<1 | 3 | 5>(3);
  const [turnSeconds, setTurnSeconds] = useState<10 | 15 | 30 | 30000>(15);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter your name first");
      return;
    }

    setBusy(true);
    loader.start();
    try {
      const playerId = getPlayerId();
      const res = await gameApi.create({ playerId, name: trimmed, rounds, turnSeconds });
      router.push(`/room/${res.code}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      loader.done();
      setBusy(false);
    }
  };

  return (
    <CreateScreen
      rounds={rounds}
      setRounds={setRounds}
      turnSeconds={turnSeconds}
      setTurnSeconds={setTurnSeconds}
      onBack={() => router.push("/")}
      onSubmit={handleSubmit}
      busy={busy}
      error={error}
    />
  );
}
