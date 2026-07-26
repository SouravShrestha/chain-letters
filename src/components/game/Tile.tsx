"use client";

import { cn } from "@/lib/utils";

type Variant = "empty" | "filled" | "correct" | "present" | "absent" | "invalid";

const variantStyles: Record<Variant, string> = {
  empty: "bg-[var(--tile)] text-foreground border-[var(--tile-empty-border)]",
  filled: "bg-[var(--tile)] text-foreground border-[var(--tile-border)]",
  correct: "bg-[var(--correct)] text-white border-[var(--correct)]",
  present: "bg-[var(--present)] text-white border-[var(--present)]",
  absent: "bg-[var(--absent)] text-white border-[var(--absent)]",
  invalid: "bg-[var(--invalid)] text-white border-[var(--invalid)]",
};

const sizeStyles = {
  sm: "w-8 h-8 text-lg",
  md: "w-10 h-10 text-xl",
  lg: "w-14 h-14 text-3xl",
  xl: "w-16 h-16 sm:w-20 sm:h-20 text-4xl sm:text-5xl",
};

export function Tile({
  letter,
  variant = "empty",
  size = "lg",
  className,
  flip = false,
}: {
  letter?: string;
  variant?: Variant;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  flip?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-sm inline-flex items-center justify-center border-2 font-extrabold uppercase select-none",
        sizeStyles[size],
        variantStyles[variant],
        flip && "animate-tile-flip",
        letter && !flip && "animate-tile-pop",
        className,
      )}
    >
      {letter || ""}
    </div>
  );
}
