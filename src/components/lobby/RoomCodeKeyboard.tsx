"use client";

import { useEffect, useCallback, useRef } from "react";
import { Delete } from "lucide-react";

const NUMBER_ROW = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"] as const;
const ROW1 = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"] as const;
const ROW2 = ["A", "S", "D", "F", "G", "H", "J", "K", "L"] as const;
const ROW3 = ["Z", "X", "C", "V", "B", "N", "M"] as const;

const PHYSICAL_KEY_WHITELIST = new Set<string>([
  ...NUMBER_ROW, ...ROW1, ...ROW2, ...ROW3,
]);

interface RoomCodeKeyboardProps {
  onKey: (char: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  showNumbers?: boolean;
  disabled?: boolean;
}

export function RoomCodeKeyboard({
  onKey,
  onBackspace,
  onEnter,
  showNumbers = true,
  disabled = false,
}: RoomCodeKeyboardProps) {
  const handlePhysicalKey = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toUpperCase();
      if (key === "BACKSPACE" || key === "DELETE") {
        e.preventDefault();
        onBackspace();
      } else if (key === "ENTER") {
        e.preventDefault();
        onEnter();
      } else if (PHYSICAL_KEY_WHITELIST.has(key)) {
        e.preventDefault();
        onKey(key);
      }
    },
    [onKey, onBackspace, onEnter, disabled],
  );

  useEffect(() => {
    window.addEventListener("keydown", handlePhysicalKey);
    return () => window.removeEventListener("keydown", handlePhysicalKey);
  }, [handlePhysicalKey]);

  return (
    <div className="relative w-full">
      <div
        className="w-full bg-card px-1.25 pt-2.5 flex flex-col gap-2.75"
        style={{ paddingBottom: "max(18px, env(safe-area-inset-bottom))" }}
      >
        {showNumbers && (
          <div className="flex gap-[5px]">
            {NUMBER_ROW.map((char) => (
              <LetterKey key={char} char={char} onPress={() => onKey(char)} />
            ))}
          </div>
        )}

        {/* QWERTY row */}
        <div className="flex gap-[5px]">
          {ROW1.map((char) => (
            <LetterKey key={char} char={char} onPress={() => onKey(char)} />
          ))}
        </div>

        {/* Middle row — inset to mimic real keyboard stagger */}
        <div className="flex gap-[5px] px-[4%]">
          {ROW2.map((char) => (
            <LetterKey key={char} char={char} onPress={() => onKey(char)} />
          ))}
        </div>

        {/* Bottom row: letters + backspace */}
        <div className="flex gap-[5px]">
          {ROW3.map((char) => (
            <LetterKey key={char} char={char} onPress={() => onKey(char)} />
          ))}
          <ActionKey onPress={onBackspace}>
            <Delete size={16} strokeWidth={2} />
          </ActionKey>
        </div>
      </div>

      {/* Disabled overlay */}
      {disabled && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px]" />
      )}
    </div>
  );
}

function LetterKey({ char, onPress }: { char: string; onPress: () => void }) {
  return (
    <button
      type="button"
      onPointerDown={(e) => {
        e.preventDefault();
        onPress();
      }}
      className="
        flex-1 h-[44px] flex items-center justify-center
        rounded-[5px] select-none touch-manipulation
        bg-zinc-200 dark:bg-zinc-700
        text-foreground font-semibold text-[15px]
        active:bg-zinc-300 dark:active:bg-zinc-400
        transition-colors duration-75
      "
    >
      {char}
    </button>
  );
}

function ActionKey({ onPress, children }: { onPress: () => void; children: React.ReactNode }) {
  const holdTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const cancelHold = () => {
    if (holdTimeout.current) { clearTimeout(holdTimeout.current); holdTimeout.current = null; }
    if (holdInterval.current) { clearInterval(holdInterval.current); holdInterval.current = null; }
  };

  return (
    <button
      type="button"
      onPointerDown={(e) => {
        e.preventDefault();
        onPress();
        // After 500ms initial delay, repeat every 50ms
        holdTimeout.current = setTimeout(() => {
          holdInterval.current = setInterval(onPress, 50);
        }, 500);
      }}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onPointerCancel={cancelHold}
      className="
        flex-[1.5] h-[44px] flex items-center justify-center
        rounded-[5px] select-none touch-manipulation
        bg-[#ADB5BD] dark:bg-zinc-600
        text-foreground
        shadow-[0_1px_0_rgba(0,0,0,0.32)] dark:shadow-[0_1px_0_rgba(0,0,0,0.55)]
        active:opacity-60
        transition-opacity duration-75
      "
    >
      {children}
    </button>
  );
}
