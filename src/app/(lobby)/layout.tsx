"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { AvatarPandaIcon } from "@/components/icons/AvatarPandaIcon";
import { LogoIcon } from "@/components/icons/LogoIcon";
import { LobbyProvider, useLobby } from "@/components/lobby/LobbyProvider";
import { usePathname, useRouter } from "next/navigation";
import { ArrowIcon } from "@/components/icons/ArrowIcon";
import { HowToPlayDialog } from "@/components/lobby/HowToPlayDialog";
import { ThemeToggleMinimal } from "@/components/ThemeToggleMinimal";

function LobbyHeader() {
  const { name, setName } = useLobby();
  const [editingName, setEditingName] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isFormScreen = pathname === "/create" || pathname === "/join";

  return (
    <div className="flex items-center justify-between mb-auto h-10 w-full">
      {isFormScreen ? (
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-1 text-sm font-semibold hover:opacity-60 transition-opacity"
        >
          <div className="rotate-180 mr-1.5"><ArrowIcon width={24} height={18} /></div> Back
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 overflow-hidden">
            <AvatarPandaIcon className="w-full h-full text-foreground" />
          </div>
          {editingName ? (
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 24))}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => { if (e.key === "Enter") setEditingName(false); }}
              className="text-[16px] font-semibold border-b border-foreground bg-transparent outline-none w-24 text-left"
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="text-sm font-semibold hover:opacity-60 transition-opacity"
              title="Click to edit name"
            >
              {name || "Alex"}
            </button>
          )}
        </div>
      )}
      <ThemeToggleMinimal />
    </div>
  );
}

export default function LobbyLayout({ children }: { children: React.ReactNode }) {
  return (
    <LobbyProvider>
      <LobbyLayoutInner>{children}</LobbyLayoutInner>
    </LobbyProvider>
  );
}

function LobbyLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFormScreen = pathname === "/create" || pathname === "/join";
  const isJoinScreen = pathname === "/join";
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);

  return (
    <main className="h-dvh bg-zinc-50 dark:bg-black flex items-center justify-center sm:px-4">
      <div
        className={`w-full sm:max-w-sm h-full relative flex flex-col px-6 bg-white bg-box-pattern ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-300/20 ${
          isJoinScreen ? "pt-6 pb-0" : "py-6"
        }`}
      >
        <LobbyHeader />

        {isJoinScreen ? (
          // Join screen: flat flex-col so JoinScreen can pin the keyboard to the bottom
          <div className="flex-1 flex flex-col w-full">
            {children}
          </div>
        ) : (
          <div className={`flex flex-col items-center flex-1 gap-12 ${isFormScreen ? "justify-start pt-6" : "justify-center py-12"}`}>
            {!isFormScreen && <LogoIcon className="w-72 h-32 text-foreground" />}
            {children}
          </div>
        )}

        {!isFormScreen && (
          <div className="flex justify-end mt-auto mb-6">
            <button
              onClick={() => setHowToPlayOpen(true)}
              className="text-sm font-semibold hover:opacity-60 transition-opacity"
            >
              How to play?
            </button>
          </div>
        )}

        <HowToPlayDialog
          isOpen={howToPlayOpen}
          onClose={() => setHowToPlayOpen(false)}
        />
      </div>
    </main>
  );
}
