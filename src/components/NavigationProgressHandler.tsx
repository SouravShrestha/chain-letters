"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";

/**
 * Starts the top loader bar on browser back/forward (popstate) navigation,
 * since nextjs-toploader only fires on pushState/replaceState by default.
 *
 * Handles two edge cases:
 * - Back navigation resolves from Next.js cache nearly instantly, so we
 *   complete the bar as soon as the pathname changes.
 * - Safari swipe-back restores from bfcache before popstate fires, meaning
 *   there is no real navigation — we suppress or immediately complete the bar.
 */
export default function NavigationProgressHandler() {
  const loader = useTopLoader();
  const pathname = usePathname();
  const pendingRef = useRef(false);

  useEffect(() => {
    const handlePopState = () => {
      // pageshow with persisted=true (bfcache) will fire right before or
      // after this in Safari. We set pending=true and let the pathname
      // effect resolve it.
      pendingRef.current = true;
      loader.start();
    };

    // Safari bfcache restore: page is shown from snapshot, no JS navigation
    // occurs, so pathname never changes. Complete immediately.
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        pendingRef.current = false;
        loader.done();
      }
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [loader]);

  // When the pathname actually changes, the navigation is complete.
  useEffect(() => {
    if (pendingRef.current) {
      pendingRef.current = false;
      loader.done();
    }
  }, [pathname, loader]);

  return null;
}
