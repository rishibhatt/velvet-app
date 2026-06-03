import Link from "next/link";
import { BoardCard } from "@/components/organisms/BoardCard";
import { COLLECTION_CARD_GRID } from "@/constants/collection-ui";
import { ROUTES } from "@/constants/routes";
import type { Board } from "@/types/board.types";

export function PublicCollectionList({ boards }: { boards: Board[] }) {
  if (boards.length === 0) {
    return (
      <p className="rounded-2xl bg-surface-container-low py-12 text-center text-on-surface-variant">
        No public collections yet.
      </p>
    );
  }

  return (
    <div className={COLLECTION_CARD_GRID}>
      {boards.map((board) => {
        const username = board.owner?.username;
        const href =
          board.slug && username
            ? ROUTES.publicCollection(username, board.slug)
            : undefined;
        return (
          <BoardCard
            key={board.id}
            board={board}
            owner={board.owner}
            showLike
            emptyVariant="other"
            publicHref={href}
          />
        );
      })}
    </div>
  );
}

export function CreatorLinks({ boards }: { boards: Board[] }) {
  const creators = new Map(
    boards
      .map((board) => board.owner)
      .filter((owner): owner is NonNullable<Board["owner"]> => Boolean(owner))
      .map((owner) => [owner.username, owner]),
  );

  if (creators.size === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="mb-3 font-display text-xl text-on-surface">Related creators</h2>
      <ul className="flex flex-wrap gap-2">
        {[...creators.values()].map((owner) => (
          <li key={owner.username}>
            <Link className="rounded-full bg-surface-container px-3 py-1 text-sm font-medium text-primary" href={ROUTES.creator(owner.username)}>
              @{owner.username}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
