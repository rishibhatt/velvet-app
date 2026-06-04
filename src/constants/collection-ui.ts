/** Shared collection card shell — editorial, 24px radius */
export const COLLECTION_CARD_SHELL =
  "overflow-hidden rounded-[24px] bg-bg-elevated shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-hover)]";

/** Full-bleed editorial card — image fills the card (reference layout) */
export const COLLECTION_CARD_MEDIA =
  "relative w-full overflow-hidden aspect-[3/4] sm:aspect-[4/5]";

export const COLLECTION_CARD_TITLE =
  "font-display text-lg leading-[1.12] text-bg-elevated drop-shadow-[0_2px_14px_rgba(0,0,0,0.4)] sm:text-xl";

export const COLLECTION_CARD_SUBTITLE =
  "mt-0.5 line-clamp-2 text-[11px] font-medium leading-snug text-white/88 sm:text-xs";

/** Mobile-first: 1 card per row; scales up on tablet/desktop */
export const COLLECTION_CARD_GRID =
  "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4";

/**
 * Home Discover preview only — horizontal scroll on mobile with next-card peek.
 * Desktop uses the same multi-column grid as explore.
 */
export const HOME_DISCOVER_CARD_RAIL =
  "-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 hide-scrollbar scroll-smooth snap-x snap-mandatory sm:gap-4 md:grid md:grid-cols-3 md:overflow-visible md:pb-0 md:snap-none lg:grid-cols-4";

/** ~72vw on mobile — smaller card + clearer peek of the next slide */
export const HOME_DISCOVER_CARD_RAIL_ITEM =
  "w-[min(72vw,280px)] shrink-0 snap-start md:w-auto";

/** Your collections on home — same horizontal rail as Discover */
export const HOME_OWNED_CARD_RAIL = HOME_DISCOVER_CARD_RAIL;
export const HOME_OWNED_CARD_RAIL_ITEM = HOME_DISCOVER_CARD_RAIL_ITEM;

/** Preview count on home (full list lives on profile). */
export const HOME_OWNED_PREVIEW_COUNT = 4;

/** Save / item tiles inside collection boards */
export const ITEM_CARD_SHELL =
  "group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-bg-elevated shadow-[var(--shadow-card)] ring-1 ring-outline-variant/20 transition-all duration-300 hover:-translate-y-0.5 hover:ring-primary/25 hover:shadow-[var(--shadow-hover)] active:scale-[0.99]";

export const ITEM_CARD_MEDIA = "relative aspect-square w-full overflow-hidden bg-surface-container-low";

export const ITEM_CARD_BODY = "flex flex-col gap-2 border-t border-outline-variant/15 bg-bg-elevated p-3";
