"use client";

import { useEffect } from "react";

interface HowToPlayDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    icon: "👥",
    title: "Two players, one room",
    description:
      "One player creates a room and shares the code. The other joins using that code.",
  },
  {
    icon: "🔤",
    title: "Pick your letters",
    description:
      "Each player secretly picks a letter. One becomes the Start letter, the other the End letter for the round.",
  },
  {
    icon: "⛓️",
    title: "Build the chain",
    description:
      "Take turns submitting words. Every word must start with the Start letter and end with the End letter for that round.",
  },
  {
    icon: "⏱️",
    title: "Beat the clock",
    description:
      "You have a limited time on your turn. Run out of time or submit an invalid word and your opponent wins the round.",
  },
  {
    icon: "🏆",
    title: "Win the match",
    description:
      "Win the most rounds to take the match. Best of 1, 3, or 5 rounds, host's choice.",
  },
];

export function HowToPlayDialog({ isOpen, onClose }: HowToPlayDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 w-full sm:max-w-sm max-h-[85dvh] overflow-y-auto rounded-t-2xl sm:rounded-sm shadow-xl ring-1 ring-zinc-200 dark:ring-zinc-800 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-zinc-900 px-6 pt-5 pb-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-bold">How to play</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Steps */}
        <div className="px-6 py-5 flex flex-col gap-5">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="text-2xl w-9 shrink-0 text-center mt-0.5">{step.icon}</div>
              <div>
                <p className="font-semibold text-base tracking-wide">{step.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed font-sans">
                  {step.description}
                </p>
              </div>
            </div>
          ))}

          {/* Example chain */}
          <div className="mt-1 rounded-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 p-4">
            <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3">
              Example (Start: S, End: E)
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              {["SCORE", "SHADE", "SMILE", "STONE"].map((word, i, arr) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-2.5 py-1 text-sm font-mono font-semibold tracking-wider">
                    <span className="text-blue-500">{word[0]}</span>
                    {word.slice(1, -1)}
                    <span className="text-emerald-500">{word[word.length - 1]}</span>
                  </span>
                  {i < arr.length - 1 && (
                    <span className="text-muted-foreground text-xs">→</span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm font-sans text-muted-foreground mt-2.5">
              Every word starts with{" "}
              <span className="font-semibold text-blue-500">S</span> and ends with{" "}
              <span className="font-semibold text-emerald-500">E</span>. Run out of valid words and your opponent wins!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full h-12 bg-foreground text-background flex items-center justify-center font-semibold transition-opacity hover:opacity-80 rounded-sm"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
