async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return json as T;
}

export const gameApi = {
  create: (data: { playerId: string; name: string; rounds: number; turnSeconds: number }) =>
    apiPost<{ code: string; id: string }>("/api/game/create", data),

  join: (data: { code: string; playerId: string; name: string }) =>
    apiPost<{ code: string; id: string }>("/api/game/join", data),


  start: (data: { sessionId: string; playerId: string }) =>
    apiPost<{ ok: boolean }>("/api/game/start", data),

  submitLetter: (data: { sessionId: string; playerId: string; letter: string }) =>
    apiPost<{ ok: boolean }>("/api/game/submit-letter", data),

  submitWord: (data: { sessionId: string; playerId: string; word: string }) =>
    apiPost<{ ok: boolean; reason?: string }>("/api/game/submit-word", data),

  checkTimeout: (data: { sessionId: string }) =>
    apiPost<{ ok: boolean }>("/api/game/check-timeout", data),

  nextRound: (data: { sessionId: string; playerId: string }) =>
    apiPost<{ ok: boolean }>("/api/game/next-round", data),

  leave: (data: { sessionId: string; playerId: string }) =>
    apiPost<{ ok: boolean }>("/api/game/leave", data),

  rematch: (data: { sessionId: string; playerId: string }) =>
    apiPost<{ code: string; id: string }>("/api/game/rematch", data),
};
