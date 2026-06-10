"use client";

import { ItemCard } from "@/components/organisms/ItemCard";
import { CollectionItemsGrid } from "@/components/organisms/CollectionItemsGrid";
import { useModalStore } from "@/store/modal.store";
import type { Item } from "@/types/board.types";

interface PublicItemGridProps {
  items: Item[];
  curatorLabel?: string;
}

export function PublicItemGrid({ items, curatorLabel }: PublicItemGridProps) {
  const openItemModal = useModalStore((s) => s.openItemModal);

  return (
    <CollectionItemsGrid>
      {items.map((item, index) => (
        <ItemCard
          key={item.id}
          item={item}
          priority={index === 0}
          onClick={() =>
            openItemModal(item.id, {
              snapshot: item,
              boardId: item.board_id,
              readOnly: true,
              curatorLabel,
            })
          }
        />
      ))}
    </CollectionItemsGrid>
  );
}
