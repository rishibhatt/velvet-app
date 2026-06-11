/** Shared layout width — keep in sync with `.page-container` in globals.css */
export const LAYOUT_MAX_WIDTH = "80rem";

/** Tailwind class for the standard page gutter + max width */
export const PAGE_CONTAINER_CLASS = "page-container";

/** Narrow content width (profile editor, settings-style pages) */
export const PAGE_CONTAINER_NARROW_CLASS = "page-container max-w-5xl";

/** Full-bleed on mobile, constrained to page width on md+ */
export const PAGE_FRAME_INNER_CLASS =
  "page-container max-md:max-w-none max-md:px-0";
