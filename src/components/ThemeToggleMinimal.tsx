"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggleMinimal() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  
  if (!mounted) return null;
  
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className="group flex w-9 h-9 items-center justify-center rounded-full bg-white/90 dark:bg-black/90 ring-1 ring-zinc-200 dark:ring-zinc-800 backdrop-blur transition hover:ring-gray-900/60 dark:hover:ring-yellow-500/40 cursor-pointer"
    >
      {theme === "dark" ? (
        <Sun size={20} className="text-zinc-500 transition group-hover:text-yellow-500" />
      ) : (
        <Moon size={20} className="text-zinc-500 transition group-hover:text-gray-900" />
      )}
    </button>
  );
}
