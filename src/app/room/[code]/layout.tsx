import type { Metadata } from "next";
import type { ReactNode } from "react";

type Props = {
  params: Promise<{ code: string }>;
  children: ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Room ${code} - Chain Letters`,
    description: `Join room ${code} in Chain Letters, a live real-time word duel.`,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: `Room ${code} - Chain Letters`,
      description: "Join a live 2-player word duel. Match letters, race the clock.",
      type: "website",
    },
  };
}

import { RoomProvider } from "@/components/game/RoomProvider";

export default function RoomLayout({ children }: { children: ReactNode }) {
  return <RoomProvider>{children}</RoomProvider>;
}
