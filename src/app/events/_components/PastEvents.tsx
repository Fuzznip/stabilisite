"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

/** The archive only grows, so it stays folded away by default and the page
 *  leads with what is actually happening.
 *
 *  Only the toggle lives on the client: the rows arrive already rendered as
 *  `children` from the server component, so no event data crosses the
 *  boundary and the JS here is just the open/closed state. */
export default function PastEvents({
  count,
  children,
}: {
  count: number;
  children: React.ReactNode;
}): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        className={cn(
          // bg-card, not a bare border: in light mode --border (91%) sits
          // almost on top of --background (96%), so an unfilled panel has no
          // edge to read. In dark mode --card equals --background, so this
          // costs nothing there and the border does the work instead.
          "flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3",
          "text-left transition-colors hover:bg-accent/50",
          "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
          // Square off the bottom while open so the trigger and the rows below
          // read as one surface rather than two stacked cards.
          open && "rounded-b-none border-b-0",
        )}
      >
        <span className="text-sm font-semibold text-foreground/80">
          Past events
        </span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-foreground/60">
          {count}
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "ml-auto size-4 text-foreground/50 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=open]:fade-in-0">
        <div className="divide-y divide-border rounded-b-xl border border-border bg-card">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
