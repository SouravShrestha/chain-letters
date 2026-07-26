import { CreateIcon } from "@/components/icons/CreateIcon";
import { JoinIcon } from "@/components/icons/JoinIcon";
import Link from "next/link";

export function ChooseScreen() {
  return (
    <div className="w-full flex flex-col gap-6 items-center">
      <Link
        href="/create"
        id="create-room-btn"
        className="w-[80%] h-14 bg-foreground text-background flex items-center justify-center gap-3 text-lg font-semibold transition-opacity hover:opacity-80 rounded-sm"
      >
        <CreateIcon width={26} height={26} />
        <span className="">Create room</span>
      </Link>

      <Link
        href="/join"
        id="join-room-btn"
        className="w-[80%] h-14 bg-white dark:bg-zinc-900 text-foreground border-[1.5px] border-foreground flex items-center justify-center gap-3 text-lg font-semibold transition-opacity hover:opacity-70 rounded-sm"
      >
        <JoinIcon width={26} height={26} />
        <span className="">Join room</span>
      </Link>
    </div>
  );
}
