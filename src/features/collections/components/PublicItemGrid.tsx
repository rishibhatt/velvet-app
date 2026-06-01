"use client";

import { ItemCard } from "@/components/organisms/ItemCard";
import type { Item } from "@/types/board.types";

export function PublicItemGrid({ items }: { items: Item[] }) {
  return (
    <div className="masonry-grid">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
