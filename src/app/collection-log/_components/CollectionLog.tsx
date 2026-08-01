"use client";

import { useMemo, useRef, useState } from "react";
import {
  CollectionLogCategory,
  CollectionLogItemEntry,
  CollectionLogMember,
  CollectionLogSummary,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ItemGrid } from "./ItemGrid";
import { OsrsPanel, PANEL_RULE } from "./OsrsPanel";
import { ItemMembersDialog } from "./ItemMembersDialog";
import { ScrollPane, useResetScroll } from "./ScrollPane";
import { getItemMembers } from "../_actions/getItemMembers";

const TAB = cn(
  // Tabs keep their in-game 96px width rather than stretching, so widening the
  // log leaves panel background to the right of the last tab.
  "relative shrink-0 cursor-pointer bg-repeat-x",
  "w-[calc(96*var(--cl-px))] h-[calc(26*var(--cl-px))]",
  // The end caps have transparent pixels outside their rounded corner, so the
  // tiled middle must not paint underneath them or a square corner shows
  // through the notch. The 20px padding exists purely to inset the background
  // by the cap width via bg-clip-content; the label ignores it and is
  // positioned across the full tab (see TAB_LABEL).
  "px-[calc(20*var(--cl-px))] [background-size:calc(20*var(--cl-px))_100%]",
  "bg-clip-content",
  // The end caps are one sprite; the client mirrors it for the right-hand side.
  'before:content-[""] before:absolute before:top-0 before:left-0 before:h-full',
  "before:w-[calc(20*var(--cl-px))] before:bg-no-repeat",
  "before:[background-size:100%_100%]",
  'after:content-[""] after:absolute after:top-0 after:right-0 after:h-full',
  "after:w-[calc(20*var(--cl-px))] after:bg-no-repeat",
  "after:[background-size:100%_100%] after:[transform:scaleX(-1)]",
  "focus-visible:[outline:var(--cl-px)_solid_var(--cl-white)]",
  "focus-visible:[outline-offset:calc(-1*var(--cl-px))]",
);

/*
 * Labels centre across the whole tab, as the client draws them: "Minigames" is
 * wider than the gap between the two end caps. Absolute positioning frees it
 * from the tab's background-inset padding, and z-10 puts it above the caps,
 * which are absolutely positioned pseudo-elements and would otherwise paint
 * over its last letter.
 */
const TAB_LABEL = "absolute inset-0 z-10 flex items-center justify-center";

// Active tab pieces have no bottom edge, so the tab merges into the panel.
const TAB_ACTIVE = cn(
  "text-[var(--cl-orange)] bg-[url(/collection-log/ui/tab-active-mid.png)]",
  "before:bg-[url(/collection-log/ui/tab-active-cap.png)]",
  "after:bg-[url(/collection-log/ui/tab-active-cap.png)]",
);

const TAB_IDLE = cn(
  "text-[var(--cl-tan)] hover:text-[var(--cl-orange-hover)]",
  "bg-[url(/collection-log/ui/tab-mid.png)]",
  "before:bg-[url(/collection-log/ui/tab-cap.png)]",
  "after:bg-[url(/collection-log/ui/tab-cap.png)]",
);

const PAGE_BUTTON = cn(
  "text-left cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis",
  "px-[calc(6*var(--cl-px))] leading-[calc(15*var(--cl-px))]",
  "focus-visible:[outline:var(--cl-px)_solid_var(--cl-white)]",
  "focus-visible:[outline-offset:calc(-1*var(--cl-px))]",
);

function obtainedCount(
  items: CollectionLogItemEntry[],
  summary: CollectionLogSummary,
): number {
  return items.filter((item) => (summary[item.itemId]?.memberCount ?? 0) > 0)
    .length;
}

/** The log's own colouring: green complete, yellow partial, red none. */
function countColor(got: number, total: number): string {
  if (total > 0 && got === total) return "var(--cl-green)";
  if (got > 0) return "var(--cl-yellow)";
  return "var(--cl-red)";
}

export function CollectionLog({
  categories,
  summary,
}: {
  categories: CollectionLogCategory[];
  summary: CollectionLogSummary;
}): React.ReactElement {
  const [activeCategory, setActiveCategory] = useState(
    categories[0]?.category ?? "",
  );
  const [activePage, setActivePage] = useState(
    categories[0]?.pages[0]?.page ?? "",
  );
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] =
    useState<CollectionLogItemEntry | null>(null);
  const [members, setMembers] = useState<CollectionLogMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const requestedItemId = useRef<number | null>(null);
  const itemPaneRef = useRef<HTMLDivElement>(null);

  const handleSelect = (item: CollectionLogItemEntry) => {
    setSelectedItem(item);
    setMembers([]);
    setMembersLoading(true);
    requestedItemId.current = item.itemId;
    getItemMembers(item.itemId)
      .then((result) => {
        if (requestedItemId.current === item.itemId) setMembers(result);
      })
      .finally(() => {
        if (requestedItemId.current === item.itemId) setMembersLoading(false);
      });
  };

  const category =
    categories.find((cat) => cat.category === activeCategory) ?? categories[0];
  const page =
    category?.pages.find((pg) => pg.page === activePage) ?? category?.pages[0];

  // Totals across the whole log, for the "Collection Log - x/y" title.
  const totals = useMemo(() => {
    const ids = new Set<number>();
    const obtained = new Set<number>();
    for (const cat of categories) {
      for (const pg of cat.pages) {
        for (const item of pg.items) {
          ids.add(item.itemId);
          if ((summary[item.itemId]?.memberCount ?? 0) > 0)
            obtained.add(item.itemId);
        }
      }
    }
    return { total: ids.size, obtained: obtained.size };
  }, [categories, summary]);

  const query = search.trim().toLowerCase();

  // Searching matches item names across the whole log, as it does in game.
  const searchResults = useMemo(() => {
    if (!query) return null;
    const seen = new Set<number>();
    const results: CollectionLogItemEntry[] = [];
    for (const cat of categories) {
      for (const pg of cat.pages) {
        for (const item of pg.items) {
          if (seen.has(item.itemId)) continue;
          if (!item.name.toLowerCase().includes(query)) continue;
          seen.add(item.itemId);
          results.push(item);
        }
      }
    }
    return results;
  }, [categories, query]);

  const visiblePages = useMemo(() => {
    if (!query || !category) return category?.pages ?? [];
    return category.pages.filter((pg) =>
      pg.items.some((item) => item.name.toLowerCase().includes(query)),
    );
  }, [category, query]);

  const shownItems = searchResults ?? page?.items ?? [];
  const shownObtained = obtainedCount(shownItems, summary);

  useResetScroll(itemPaneRef, searchResults ? query : page?.page);

  return (
    <>
      <OsrsPanel className="h-[calc(300*var(--cl-px))]">
        {/* Search left, title centred, info right. From sm up the outer
              tracks are forced equal so the title sits dead centre in the
              window. A phone has no room for that, so there the title just
              centres in whatever the search and info button leave. */}
        <div
          className={cn(
            "grid items-center shrink-0",
            "grid-cols-[auto_1fr_auto]",
            "sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]",
            "gap-[calc(6*var(--cl-px))] h-[calc(28*var(--cl-px))] px-[calc(4*var(--cl-px))]",
          )}
        >
          {/* A sunken well: filled with the tile the client uses inside its
                own boxes, bevelled with the frame's darkest/lightest pixels. */}
          <div
            className={cn(
              "flex items-center justify-self-start min-w-0 max-w-full",
              "gap-[calc(3*var(--cl-px))] px-[calc(3*var(--cl-px))] py-[calc(2*var(--cl-px))]",
              "bg-[url(/collection-log/ui/bg-inset.png)] bg-repeat",
              "[background-size:calc(88*var(--cl-px))_calc(60*var(--cl-px))]",
              "border-solid border-[length:var(--cl-px)]",
              "border-t-[var(--cl-bevel-dark)] border-l-[var(--cl-bevel-dark)]",
              "border-b-[var(--cl-bevel-light)] border-r-[var(--cl-bevel-light)]",
              "focus-within:border-t-[var(--cl-bevel-light)]",
              "focus-within:border-l-[var(--cl-bevel-light)]",
              "focus-within:border-b-[var(--cl-bevel-dark)]",
              "focus-within:border-r-[var(--cl-bevel-dark)]",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "shrink-0 w-[calc(20*var(--cl-px))] h-[calc(20*var(--cl-px))]",
                "bg-[url(/collection-log/ui/icon-search.png)] bg-no-repeat",
                "[background-size:100%_100%]",
              )}
            />
            <input
              type="search"
              value={search}
              placeholder="Search"
              aria-label="Search the collection log"
              onChange={(event) => setSearch(event.target.value)}
              className={cn(
                "min-w-0 p-0 bg-transparent border-none outline-none",
                // Narrow on phones so the title still fits beside the info
                // button without ellipsising.
                "w-[calc(50*var(--cl-px))] sm:w-[calc(140*var(--cl-px))]",
                "text-[var(--cl-white)] [font:inherit] [text-shadow:inherit]",
                // Strip the UA search styling (white field, native clear).
                "appearance-none",
                "[&::-webkit-search-cancel-button]:appearance-none",
                "[&::-webkit-search-cancel-button]:hidden",
                "[&::-webkit-search-decoration]:appearance-none",
              )}
            />
          </div>

          <h2 className="min-w-0 font-bold text-center whitespace-nowrap overflow-hidden text-ellipsis">
            Clan Collection Log - {totals.obtained}/{totals.total}
          </h2>

          {/* Sits in the third track, which is the same width as the search
                field's, so the title stays centred in the window. */}
          <Popover>
            <PopoverTrigger
              aria-label="About this collection log"
              className={cn(
                "justify-self-end cursor-pointer bg-no-repeat",
                "w-[calc(21*var(--cl-px))] h-[calc(21*var(--cl-px))]",
                "bg-[url(/collection-log/ui/btn-info.png)]",
                "[background-size:100%_100%]",
                // 2522 is the sprite's pressed state: light bevel bottom-right.
                "active:bg-[url(/collection-log/ui/btn-info-pressed.png)]",
                "data-[state=open]:bg-[url(/collection-log/ui/btn-info-pressed.png)]",
                "focus-visible:[outline:var(--cl-px)_solid_var(--cl-white)]",
              )}
            />
            <PopoverContent
              align="end"
              className="text-xl font-osrs max-w-xs bg-[#0f0e0c] border-[#5a4f3a] text-[#ff9040]"
            >
              This collection log tracks progress across all clan members with
              Dink active.
            </PopoverContent>
          </Popover>
        </div>

        {/* Rule so the top bar reads as its own section above the tabs. */}
        <span aria-hidden className={PANEL_RULE} />

        {/* Five fixed-width tabs need ~976px at 2x. Narrower windows scroll
              the row rather than clipping "Other" off the end. */}
        <div
          role="tablist"
          className={cn(
            "flex shrink-0 overflow-x-auto",
            "gap-[calc(4*var(--cl-px))] px-[calc(4*var(--cl-px))]",
            "[border-bottom:var(--cl-px)_solid_var(--cl-tab-border)]",
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          {categories.map((cat) => {
            const active = cat.category === activeCategory;
            return (
              <button
                key={cat.category}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setActiveCategory(cat.category);
                  setActivePage(cat.pages[0]?.page ?? "");
                }}
                className={cn(TAB, active ? TAB_ACTIVE : TAB_IDLE)}
              >
                <span className={TAB_LABEL}>{cat.category}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-1 min-h-0">
          <div className="flex shrink-0 w-[calc(130*var(--cl-px))] sm:w-[calc(185*var(--cl-px))]">
            <ScrollPane>
              <div className="flex flex-col pt-[calc(3*var(--cl-px))]">
                {visiblePages.map((pg) => {
                  const total = pg.items.length;
                  const got = obtainedCount(pg.items, summary);
                  const complete = got === total && total > 0;
                  const current = !searchResults && pg.page === activePage;
                  return (
                    <button
                      key={pg.page}
                      type="button"
                      aria-current={current}
                      onClick={() => {
                        setSearch("");
                        setActivePage(pg.page);
                      }}
                      className={cn(
                        PAGE_BUTTON,
                        complete
                          ? "text-[var(--cl-green)]"
                          : "text-[var(--cl-tan)] hover:text-[var(--cl-orange-hover)]",
                        current && "bg-black/20",
                      )}
                    >
                      {pg.page}
                    </button>
                  );
                })}
              </div>
            </ScrollPane>
          </div>

          <span
            aria-hidden
            className={cn(
              "shrink-0 w-[calc(4*var(--cl-px))] bg-center bg-repeat-y",
              "bg-[url(/collection-log/ui/divider-m.png)]",
              "[background-size:100%_calc(20*var(--cl-px))]",
            )}
          />

          <div className="flex flex-col flex-1 min-w-0" ref={itemPaneRef}>
            <div
              className={cn(
                "shrink-0 px-[calc(8*var(--cl-px))]",
                "pt-[calc(4*var(--cl-px))] pb-[calc(2*var(--cl-px))]",
              )}
            >
              <h3 className="font-bold">
                {searchResults ? "Search results" : page?.page}
              </h3>
              <p>
                <span>Obtained: </span>
                <span
                  style={{
                    color: countColor(shownObtained, shownItems.length),
                  }}
                >
                  {shownObtained}/{shownItems.length}
                </span>
              </p>
            </div>

            {shownItems.length ? (
              <ScrollPane>
                <ItemGrid
                  items={shownItems}
                  summary={summary}
                  onSelect={handleSelect}
                />
              </ScrollPane>
            ) : (
              <p
                className={cn(
                  "text-[var(--cl-white)]",
                  "px-[calc(8*var(--cl-px))] py-[calc(10*var(--cl-px))]",
                )}
              >
                No items matching search criteria found.
              </p>
            )}
          </div>
        </div>
      </OsrsPanel>

      <ItemMembersDialog
        item={selectedItem}
        members={members}
        loading={membersLoading}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      />
    </>
  );
}
