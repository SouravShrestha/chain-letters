"use client";

import { useEffect, useState } from "react";
import NextTopLoader from "nextjs-toploader";

export default function TopLoader() {
  const [color, setColor] = useState("#27272a");

  useEffect(() => {
    const update = () => {
      const fg = getComputedStyle(document.documentElement)
        .getPropertyValue("--foreground")
        .trim();
      if (fg) setColor(fg);
    };
    update();

    // Re-read when the theme class changes on <html>
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <NextTopLoader
      color={color}
      initialPosition={0.08}
      crawlSpeed={200}
      height={3}
      crawl
      showSpinner={false}
      easing="ease"
      speed={200}
      shadow={`0 0 0 ${color},0 0 0 ${color}`}
      zIndex={9999}
    />
  );
}
