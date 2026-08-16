"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Package, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BotwBoss, BotwChallenge } from "@/lib/types/v2";

function pointsLabel(points: number): string {
  return `${points} ${points === 1 ? "pt" : "pts"}`;
}

/**
 * Boss icon: the icon uploaded to S3, or a generic glyph. `onError` still
 * covers the case where the stored URL 404s.
 */
function BossIcon({ boss, className }: { boss: BotwBoss; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (!boss.image_url || failed) {
    return (
      <span className={cn("relative shrink-0", className)}>
        <Swords className="absolute inset-0 m-auto size-1/2 text-foreground/30" />
      </span>
    );
  }

  return (
    <span className={cn("relative shrink-0", className)}>
      <Image
        src={boss.image_url}
        alt=""
        fill
        sizes="80px"
        unoptimized
        className="object-contain"
        onError={() => setFailed(true)}
      />
    </span>
  );
}

function DropItem({ challenge }: { challenge: BotwChallenge }) {
  const { trigger, value } = challenge;
  const [failed, setFailed] = useState(false);

  return (
    <li className="flex items-center gap-3 rounded-md bg-white/[0.03] px-3 py-2.5">
      <span className="relative size-12 shrink-0">
        {trigger.img_path && !failed ? (
          <Image
            src={trigger.img_path}
            alt=""
            fill
            sizes="48px"
            className="object-contain"
            unoptimized
            onError={() => setFailed(true)}
          />
        ) : (
          <Package className="absolute inset-0 m-auto size-6 text-foreground/30" />
        )}
      </span>
      <span className="flex-1 min-w-0 truncate text-lg text-foreground/90">
        {trigger.name}
      </span>
      <span className="shrink-0 text-lg font-bold tabular-nums text-stability-accent">
        {pointsLabel(value)}
      </span>
    </li>
  );
}

export function BossCard({ boss }: { boss: BotwBoss }) {
  const [open, setOpen] = useState(false);

  const kc = boss.challenges.find((c) => c.trigger.type === "KC");
  const drops = boss.challenges
    .filter((c) => c.trigger.type === "DROP")
    .sort(
      (a, b) =>
        b.value - a.value || a.trigger.name.localeCompare(b.trigger.name),
    );

  return (
    <Card className="overflow-hidden h-full py-0">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full cursor-pointer text-left transition-colors hover:bg-white/[0.03]"
          >
            <CardContent className="flex items-center gap-4 p-5">
              <BossIcon boss={boss} className="size-20" />
              <div className="flex flex-1 min-w-0 flex-col gap-1.5">
                <h3 className="text-3xl font-bold leading-tight text-foreground">
                  {boss.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  {kc ? (
                    <Badge
                      variant="secondary"
                      className="gap-1.5 text-sm font-medium"
                      title="Points awarded per kill"
                    >
                      {pointsLabel(kc.value)} per kill
                    </Badge>
                  ) : null}
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "size-6 shrink-0 text-foreground/50 transition-transform",
                  open && "rotate-180",
                )}
              />
            </CardContent>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="@container px-5 pb-5 pt-0 mt-2">
            {drops.length > 0 ? (
              // Columns keyed to the *card's* width, not the viewport: the same
              // card is full width with one boss and a third of it with three.
              // Viewport breakpoints squeeze the name to nothing in the narrow
              // case; a wide card with one drop per row leaves a runway of
              // whitespace before the points.
              <ul className="grid gap-2 @md:grid-cols-2 @3xl:grid-cols-3">
                {drops.map((challenge) => (
                  <DropItem key={challenge.id} challenge={challenge} />
                ))}
              </ul>
            ) : (
              <p className="text-base text-foreground/60">
                No drops configured.
              </p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
