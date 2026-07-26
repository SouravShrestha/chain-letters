"use client";

import { RoomCodeKeyboard } from "./RoomCodeKeyboard";

interface JoinScreenProps {
  code: string;
  setCode: (code: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  busy: boolean;
  error: string | null;
}

const CODE_LENGTH = 5;

export function JoinScreen({ code, setCode, onSubmit, busy, error }: JoinScreenProps) {
  const handleKey = (char: string) => {
    if (code.length < CODE_LENGTH) setCode(code + char);
  };

  const handleBackspace = () => setCode(code.slice(0, -1));

  return (
    <div className="flex-1 flex flex-col w-full">
      {/* Content area */}
      <div className="flex-1 pt-4">
        <p className="text-sm font-semibold mb-4">Room code</p>

        {/* 5-tile code display */}
        <div className="flex gap-2 mb-6">
          {Array.from({ length: CODE_LENGTH }, (_, i) => {
            const char = code[i];
            const isCursor = i === code.length;
            return (
              <div
                key={i}
                className={`
                  flex-1 h-14 flex items-center justify-center
                  text-xl font-bold border-2 transition-colors
                  ${char ? "border-foreground text-foreground" : ""}
                  ${!char && isCursor ? "border-foreground" : ""}
                  ${!char && !isCursor ? "border-zinc-200 dark:border-zinc-700" : ""}
                `}
              >
                {char ?? (
                  isCursor ? (
                    <span className="w-[2px] h-6 bg-foreground animate-[blink_1s_step-end_infinite]" />
                  ) : null
                )}
              </div>
            );
          })}
        </div>

        <button
          id="confirm-join-btn"
          type="button"
          onClick={onSubmit}
          disabled={busy || code.length < CODE_LENGTH}
          className="w-full h-12 bg-foreground text-background text-base font-semibold transition-opacity hover:opacity-80 disabled:opacity-30"
        >
          {busy ? "Joining…" : "Join"}
        </button>

        {error && (
          <p className="mt-3 text-sm font-semibold text-[var(--invalid)] animate-shake">
            {error}
          </p>
        )}
      </div>

      {/* Keyboard — negative horizontal margin to break out of the layout's px-6 */}
      <div className="-mx-6">
        <RoomCodeKeyboard
          onKey={handleKey}
          onBackspace={handleBackspace}
          onEnter={onSubmit}
        />
      </div>
    </div>
  );
}
