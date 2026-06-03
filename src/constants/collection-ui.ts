/** Shared collection card media frame (home, explore, profile, search) */
export const COLLECTION_CARD_MEDIA =
  "relative w-full overflow-hidden aspect-[3/4] sm:aspect-[4/5]";

export const COLLECTION_CARD_SHELL =
  "overflow-hidden rounded-2xl bg-bg-elevated shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-hover)] sm:rounded-3xl";

/** Mobile-first: 2 columns; scales up on larger screens */
export const COLLECTION_CARD_GRID =
  "grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4";

/** Horizontal rail (Discover / Your collections on home) */
export const COLLECTION_CARD_RAIL =
  "-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 hide-scrollbar sm:gap-4 md:grid md:grid-cols-3 md:overflow-visible md:pb-0 lg:grid-cols-4";

/** Width of one card in a horizontal rail on mobile (~1.8 cards visible) */
export const COLLECTION_CARD_RAIL_ITEM = "w-[min(52vw,200px)] shrink-0 md:w-auto";

export const COLLECTION_CARD_TITLE =
  "font-display text-base leading-tight text-bg-elevated drop-shadow-md sm:text-lg";

export const COLLECTION_CARD_SUBTITLE =
  "mt-0.5 line-clamp-2 text-[11px] font-medium text-bg-elevated/90 sm:text-xs";

/** Save / item tiles inside collection boards */
export const ITEM_CARD_SHELL =
  "group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-bg-elevated shadow-[var(--shadow-card)] ring-1 ring-outline-variant/20 transition-all duration-300 hover:-translate-y-0.5 hover:ring-primary/25 hover:shadow-[var(--shadow-hover)] active:scale-[0.99]";

export const ITEM_CARD_MEDIA = "relative aspect-square w-full overflow-hidden bg-surface-container-low";

export const ITEM_CARD_BODY = "flex flex-col gap-2 border-t border-outline-variant/15 bg-bg-elevated p-3";
