"use client";

import Image from "next/image";
import Link from "next/link";
import { BookmarkMarkdownComponent } from "@/components/dashboard/bookmarks/BookmarkMarkdownComponent";
import { bookmarkLayoutSwitch } from "@/lib/userLocalSettings/bookmarksLayout";
import { cn } from "@/lib/utils";

import type { ZBookmarkTypeText } from "@karakeep/shared/types/bookmarks";
import { getAssetUrl } from "@karakeep/shared/utils/assetUtils";
import { getSourceUrl } from "@karakeep/shared/utils/bookmarkUtils";

import { BookmarkLayoutAdaptingCard } from "./BookmarkLayoutAdaptingCard";
import FooterLinkURL from "./FooterLinkURL";

// mymind quote card.
//
// Text bookmarks in the grid are treated like editorial pull-quotes: no
// title inside the card, no chrome — just the text itself in the serif face,
// centered on the card's cream/charcoal surface. The full markdown component
// is used only for list view / preview where interaction matters. Short text
// (a saved sentence or thought) reads as a quote; longer text is clipped
// and expands in the detail view.
function QuoteBody({ text }: { text: string }) {
  const clean = text.trim();
  const isShort = clean.length <= 240;
  return (
    <div
      className={cn(
        "flex min-h-[16rem] w-full items-center justify-center px-8 py-10",
        "text-center",
      )}
    >
      <p
        className={cn(
          "font-serif italic leading-snug text-foreground",
          isShort ? "text-2xl" : "text-lg",
          "line-clamp-[10] whitespace-pre-wrap break-words",
        )}
      >
        {clean}
      </p>
    </div>
  );
}

export default function TextCard({
  bookmark,
  className,
  bookmarkIndex,
}: {
  bookmark: ZBookmarkTypeText;
  className?: string;
  bookmarkIndex?: number;
}) {
  const banner = bookmark.assets.find((a) => a.assetType == "bannerImage");
  const text = bookmark.content.text ?? "";

  return (
    <>
      <BookmarkLayoutAdaptingCard
        // Quote cards without a banner render as a self-sized editorial
        // pull-quote — no forced 4:3 crop on the image well.
        imageAspect={banner ? "4/3" : "auto"}
        // Title suppressed in grid; caption below the card handles it.
        title={bookmark.title}
        content={
          // In grid/masonry the QuoteBody replaces the markdown; the layout
          // adaptor will still render this `content` node for list view.
          <BookmarkMarkdownComponent readOnly={true}>
            {bookmark}
          </BookmarkMarkdownComponent>
        }
        footer={
          getSourceUrl(bookmark) && (
            <FooterLinkURL url={getSourceUrl(bookmark)} />
          )
        }
        wrapTags={true}
        bookmark={bookmark}
        className={className}
        bookmarkIndex={bookmarkIndex}
        fitHeight={true}
        image={(layout, className) =>
          bookmarkLayoutSwitch(layout, {
            // Use the "image" slot to render the editorial quote treatment.
            // GridView will then skip its interior title + content chrome and
            // let this pull-quote dominate the card.
            grid: banner ? (
              <div className="relative size-full flex-1">
                <Link href={`/dashboard/preview/${bookmark.id}`}>
                  <Image
                    alt="card banner"
                    fill={true}
                    unoptimized
                    className={cn("flex-1", className)}
                    src={getAssetUrl(banner.id)}
                  />
                </Link>
              </div>
            ) : (
              <Link
                href={`/dashboard/preview/${bookmark.id}`}
                className="block w-full"
              >
                <QuoteBody text={text} />
              </Link>
            ),
            masonry: banner ? (
              <div className="relative size-full flex-1">
                <Link href={`/dashboard/preview/${bookmark.id}`}>
                  <Image
                    alt="card banner"
                    fill={true}
                    unoptimized
                    className={cn("flex-1", className)}
                    src={getAssetUrl(banner.id)}
                  />
                </Link>
              </div>
            ) : (
              <Link
                href={`/dashboard/preview/${bookmark.id}`}
                className="block w-full"
              >
                <QuoteBody text={text} />
              </Link>
            ),
            compact: null,
            list: banner ? (
              <div className="relative size-full flex-1">
                <Link href={`/dashboard/preview/${bookmark.id}`}>
                  <Image
                    alt="card banner"
                    fill={true}
                    unoptimized
                    className={cn("flex-1", className)}
                    src={getAssetUrl(banner.id)}
                  />
                </Link>
              </div>
            ) : (
              <div
                className={cn(
                  "flex size-full items-center justify-center bg-accent text-center",
                  className,
                )}
              >
                Note
              </div>
            ),
          })
        }
      />
    </>
  );
}
