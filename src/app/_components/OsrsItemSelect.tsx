"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { OsrsItem } from "@/lib/types";
import { useOsrsItems } from "@/lib/hooks/useOsrsItems";
import { Input } from "@/components/ui/input";

type Props = {
  value: string;
  onItemSelect: (item: OsrsItem) => void;
};

// This needs serious refactoring --- I apologize...
export function OsrsItemSelect({ value, onItemSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const { results, searchItems, loading } = useOsrsItems();
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLInputElement>(null);

  const isFocused = useMemo(
    () => () =>
      popoverRef.current?.contains(document.activeElement) ||
      triggerRef.current?.contains(document.activeElement),
    [popoverRef, triggerRef]
  );

  useEffect(() => {
    if (!open && value && isFocused() && isDirty) {
      setOpen(true);
    }
  }, [open, value, isFocused, isDirty]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onItemSelect({ name: newValue, id: undefined, image: undefined });
    searchItems(newValue);
    setIsDirty(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (!isFocused()) setOpen(false);
    }, 0);
  };

  return (
    <Popover open={open} modal={false}>
      <PopoverTrigger asChild>
        <Input
          type="text"
          onFocus={(event) => {
            event.preventDefault();
          }}
          onBlur={handleBlur}
          ref={triggerRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.currentTarget.blur();
            }
          }}
          placeholder="Torva Platebody"
          className="w-64 dark:bg-input/30"
        />
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-2 overflow-y-auto h-64 overflow-x-hidden"
        forceMount
        ref={popoverRef}
        onBlur={handleBlur}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {loading ? (
          <div className="p-2 text-sm">Loading...</div>
        ) : results.length > 0 ? (
          <ul className="flex flex-col items-start h-fit gap-1">
            {results.map((item: OsrsItem) => (
              <li
                key={item.id}
                className="flex items-center gap-2 px-2 py-4 cursor-pointer w-full rounded-lg hover:text-accent-foreground hover:bg-accent hover:border hover:border-foreground hover:px-[7px] hover:py-[15px]"
                onClick={() => {
                  onItemSelect(item);
                  setOpen(false);
                  setIsDirty(false);
                }}
              >
                <div className="w-fit h-fit p-1 rounded-lg bg-accent">
                  <div className="relative size-6">
                    <Image
                      src={item.image || ""}
                      alt={item.name}
                      sizes="100%"
                      fill
                      className="rounded-sm absolute object-contain"
                    />
                  </div>
                </div>
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-2 text-sm">No results found.</div>
        )}
      </PopoverContent>
    </Popover>
  );
}
