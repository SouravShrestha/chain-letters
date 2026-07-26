"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getPlayerName, setPlayerName as persistPlayerName } from "@/lib/player-id";

interface LobbyContextType {
  name: string;
  setName: (name: string) => void;
}

const LobbyContext = createContext<LobbyContextType | null>(null);

export function LobbyProvider({ children }: { children: React.ReactNode }) {
  const [name, setName] = useState("Alex");

  useEffect(() => {
    setName(getPlayerName() || "Alex");
  }, []);

  const handleSetName = (newName: string) => {
    setName(newName);
    persistPlayerName(newName);
  };

  return (
    <LobbyContext.Provider value={{ name, setName: handleSetName }}>
      {children}
    </LobbyContext.Provider>
  );
}

export function useLobby() {
  const context = useContext(LobbyContext);
  if (!context) throw new Error("useLobby must be used within LobbyProvider");
  return context;
}
