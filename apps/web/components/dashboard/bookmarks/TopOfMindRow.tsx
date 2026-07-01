"use client";

import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@karakeep/shared-react/trpc";

import BookmarkCard from "./BookmarkCard";
import { BookmarkContextMenuTrigger } from "./BookmarkContextMenu";

// Krystal — Top of Mind row.
//
// A horizontal scrolling strip that sits above the main masonry grid. It
// surfaces the bookmarks flagged as "Top of Mind" (persisted as the
// existing `favourited` field on the bookmark, semantically rebranded).
//
// Design:
//   - Small uppercase label "TOP OF MIND" on the left, tracked wide
//   - Row is a native horizontal scroller (touch + trackpad friendly)
//   - Each pinned card is rendered at a fixed ~200px width
//   - Snap to card edges for a polished feel
//   - Row hides itself entirely if there are no pinned cards
//
// The row is intentionally lightweight — it doesn't try to be a mini grid.
// Detail viewing / context menu still work per card. Users pin/unpin via
// the card context menu (Top of Mind action).

const TILE_WIDTH = 208; // px

export default function TopOfMindRow() {
  const api = useTRPC();

  // Fetch up to 24 pinned bookmarks. This is a bounded set by nature — the
  // point of Top of Mind is a curated few, not everything.
  const { data, isPending } = useQuery(
    api.bookmarks.getBookmarks.queryOptions({
      favourited: true,
      archived: false,
      limit: 24,
      useCursorV2: true,
    }),
  );

  if (isPending) return null;
  const items = data?.bookmarks ?? [];
  if (items.length === 0) return null;

  return (
    <section
      aria-label="Top of Mind"
      className="mb-8 border-b border-border/40 pb-6"
    >
      <div className="mb-3 flex items-baseline justify-between px-1">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Top of Mind
        </h2>
        <span className="text-[11px] tabular-nums text-muted-foreground/60">
          {items.length}
        </span>
      </div>

      {/*
        Horizontal scroller. `snap-x` + `snap-mandatory` gives a slight click
        to each card edge. We also hide the native scrollbar via the utility
        below (defined in globals.css) — the row is scrolled by trackpad or
        touch.
      */}
      <div
        className="krystal-hide-scrollbar -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2"
      >
        {items.map((bookmark) => (
          <BookmarkContextMenuTrigger key={bookmark.id} bookmark={bookmark}>
            <div
              className="snap-start shrink-0 overflow-hidden rounded-xl bg-card mymind-card-shadow transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5"
              style={{ width: TILE_WIDTH }}
            >
              <BookmarkCard bookmark={bookmark} />
            </div>
          </BookmarkContextMenuTrigger>
        ))}
      </div>
    </section>
  );
}
