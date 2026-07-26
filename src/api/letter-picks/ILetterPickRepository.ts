export interface ILetterPickRepository {
  upsert(data: {
    session_id: string;
    round: number;
    player_slot: string;
    letter: string;
  }): Promise<void>;
  findBySessionAndRound(
    sessionId: string,
    round: number,
  ): Promise<Array<{ player_slot: string; letter: string }>>;
}
