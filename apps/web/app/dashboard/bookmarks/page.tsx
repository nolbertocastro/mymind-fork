import React from "react";
import Bookmarks from "@/components/dashboard/bookmarks/Bookmarks";
import TopOfMindRow from "@/components/dashboard/bookmarks/TopOfMindRow";

// The main Krystal grid.
//
// Layout:
//   1. Top of Mind — horizontal scrolling strip of pinned cards. Hidden
//      when there are no pinned cards, so the grid feels normal until you
//      choose to elevate something.
//   2. Everything else — the full masonry grid via <Bookmarks>. We still
//      pass the unfiltered query so pinned cards also appear in the main
//      grid; they're only *additionally* surfaced above. This mirrors how
//      mymind treats pinned items — they're the same items, just easier
//      to reach.
export default async function BookmarksPage() {
  return (
    <div>
      <TopOfMindRow />
      <Bookmarks query={{ archived: false }} showEditorCard={true} />
    </div>
  );
}
