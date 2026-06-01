"use client";

import { ItemCard } from "@/components/organisms/ItemCard";
import { CollectionItemsGrid } from "@/components/organisms/CollectionItemsGrid";
import type { Item } from "@/types/board.types";

export function PublicItemGrid({ items }: { items: Item[] }) {
  return (
    <CollectionItemsGrid
      header={
        <p className="mb-5 text-sm text-on-surface-variant">
          {items.length} {items.length === 1 ? "save" : "saves"}
        </p>
      }
    >
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </CollectionItemsGrid>
  );
}
