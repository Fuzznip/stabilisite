"use client";

import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

export function ThemedBackground() {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === "dark";

  // Light mode: very subtle, calm background with soft neutral tones
  // Dark mode: keep the original warm reddish aesthetic
  const gridConfig = isDark
    ? {
        // Saturation, not brightness, is what keeps this from looking washed.
        // Compositing at 25% alpha over a grey page roughly halves the
        // source's saturation, so the old #A52D2A (59%) landed each lit square
        // at ~31% — a grey-mauve rather than a red. This sits at 78%, which
        // puts the square near 45% and reads as actual colour at the same
        // luminance.
        //
        // Don't reach for maxOpacity instead: 4px squares on a 14px pitch
        // cover 8% of the area, so the grid spatially averages into a film of
        // about maxOpacity/24 rather than resolving as separate squares, and
        // raising it just brightens the veil. Page contrast belongs to
        // --background in globals.css.
        color: "#D01A1A",
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
