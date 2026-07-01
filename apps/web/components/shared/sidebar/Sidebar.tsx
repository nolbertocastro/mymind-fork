import { useTranslation } from "@/lib/i18n/server";
import { TFunction } from "i18next";

import serverConfig from "@karakeep/shared/config";

import SidebarItem from "./SidebarItem";
import SidebarVersion from "./SidebarVersion";
import { TSidebarItem } from "./TSidebarItem";

// Krystal mobile-drawer sidebar.
//
// The visual identity is the rotated "Krystal" wordmark at the top, in the
// editorial serif. Nav items are still available below it (Home, Tags,
// Highlights, Archive, Lists) — those are the practical utilities that
// Karakeep needs. We keep them but style them to feel calmer:
// no right border, tighter type, tighter spacing. The rotated wordmark is the
// identity moment; everything below it is quiet UI.

export default async function Sidebar({
  items,
  extraSections,
}: {
  items: (t: TFunction) => TSidebarItem[];
  extraSections?: React.ReactNode;
}) {
  // oxlint-disable-next-line rules-of-hooks
  const { t } = await useTranslation();

  return (
    <aside className="relative flex h-[calc(100vh-80px)] w-56 flex-col bg-background">
      {/* Rotated "Krystal" identity — sits along the left edge of the drawer. */}
      <div className="pointer-events-none absolute left-3 top-2 select-none">
        <span className="block origin-top-left -rotate-90 translate-y-40 whitespace-nowrap font-serif text-2xl italic tracking-tight text-muted-foreground/60">
          Krystal
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-5 px-4 pb-4 pl-12 pt-6">
        <div>
          <ul className="space-y-1 text-sm">
            {items(t).map((item) => (
              <SidebarItem
                key={item.name}
                logo={item.icon}
                name={item.name}
                path={item.path}
              />
            ))}
          </ul>
        </div>
        {extraSections}
        <SidebarVersion
          serverVersion={serverConfig.serverVersion}
          changeLogVersion={serverConfig.changelogVersion}
        />
      </div>
    </aside>
  );
}
