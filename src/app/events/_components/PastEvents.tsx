"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

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
          "flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3",
          "text-left transition-colors hover:bg-accent/50",
          "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
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
