
const roundOptions = [1, 3, 5] as const;
const turnOptions = (
  process.env.NODE_ENV === "development"
    ? [10, 15, 30, 30000]
    : [10, 15, 30]
) as readonly (10 | 15 | 30 | 30000)[];

interface CreateScreenProps {
  rounds: number;
  setRounds: (rounds: (typeof roundOptions)[number]) => void;
  turnSeconds: number;
  setTurnSeconds: (turnSeconds: (typeof turnOptions)[number]) => void;
  onBack: () => void;
  onSubmit: () => void;
  busy: boolean;
  error: string | null;
}

export function CreateScreen({
  rounds,
  setRounds,
  turnSeconds,
  setTurnSeconds,
  onSubmit,
  busy,
  error,
}: CreateScreenProps) {
  return (
    <div className="w-full flex flex-col gap-6 items-center h-full justify-center">
      <fieldset className="w-full mt-10">
        <legend className="text-sm font-semibold mb-2">Rounds</legend>
        <div className="grid grid-cols-3 gap-2">
          {roundOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRounds(option)}
              aria-pressed={rounds === option}
              className={`h-11 border-[1.5px] rounded-sm text-base font-bold transition-colors ${
                rounds === option
                  ? "border-foreground bg-foreground text-background"
                  : "border-foreground bg-white dark:bg-zinc-900 hover:opacity-70"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="w-full mt-1">
        <legend className="flex items-center gap-2 text-sm font-semibold mb-2">
          Turn time
        </legend>
        <div className={`grid gap-2 ${turnOptions.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
          {turnOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setTurnSeconds(option)}
              aria-pressed={turnSeconds === option}
              className={`h-11 border-[1.5px] rounded-sm text-sm font-bold transition-colors ${
                turnSeconds === option
                  ? "border-foreground bg-foreground text-background"
                  : "border-foreground bg-white dark:bg-zinc-900 hover:opacity-70"
              }`}
            >
              {option === 30000 ? "∞" : `${option}s`}
            </button>
          ))}
        </div>
      </fieldset>

      <button
        id="confirm-create-btn"
        onClick={onSubmit}
        disabled={busy}
        className="w-[60%] h-14 bg-foreground text-background flex items-center justify-center gap-3 text-lg font-semibold transition-opacity hover:opacity-80 disabled:opacity-40 rounded-sm mt-10"
      >
        {busy ? "Creating…" : "Create"}
      </button>

      {error && (
        <p className="text-sm font-semibold text-[var(--invalid)] animate-shake">
          {error}
        </p>
      )}
    </div>
  );
}
