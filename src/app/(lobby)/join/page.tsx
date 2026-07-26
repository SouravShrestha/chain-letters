"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";
import { JoinScreen } from "@/components/lobby/JoinScreen";
import { useLobby } from "@/components/lobby/LobbyProvider";
import { getPlayerId } from "@/lib/player-id";
import { gameApi } from "@/lib/game-api";

export default function JoinPage() {
  const router = useRouter();
  const loader = useTopLoader();
  const { name } = useLobby();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Enter your name first");
      return;
    }

    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) {
      setError("Enter a room code");
      return;
    }

    setBusy(true);
    loader.start();
    try {
      const playerId = getPlayerId();
      const res = await gameApi.join({ code: trimmedCode, playerId, name: trimmedName });
      router.push(`/room/${res.code}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      loader.done();
      setBusy(false);
    }
  };

  return (
    <JoinScreen
      code={code}
      setCode={setCode}
      onBack={() => router.push("/")}
      onSubmit={handleSubmit}
      busy={busy}
      error={error}
    />
  );
}
