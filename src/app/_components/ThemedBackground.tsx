"use client";

import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemedBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === "dark";

  // Light mode: very subtle, calm background with soft neutral tones
  // Dark mode: keep the original warm reddish aesthetic
  const gridConfig = isDark
    ? {
        color: "#A52D2A",
        maxOpacity: 0.25,
        flickerChance: 0.25,
      }
    : {
        // Light mode: soft red to complement stability red
        color: "#c98a88",
        maxOpacity: 0.25,
        flickerChance: 0.25,
      };

  return (
    <FlickeringGrid
      className="fixed inset-0 -z-10 size-full [mask-image:radial-gradient(90%_90%_at_center,white,transparent)]"
      squareSize={4}
      gridGap={10}
      color={gridConfig.color}
      maxOpacity={gridConfig.maxOpacity}
      flickerChance={gridConfig.flickerChance}
    />
  );
}
