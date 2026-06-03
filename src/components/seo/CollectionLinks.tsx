import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import type { Board } from "@/types/board.types";

interface Owner {
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

export function CollectionLinks({
  title,
  boards,
  owner,
}: {
  title: string;
  boards: Board[];
  owner?: Owner | null;
}) {
  if (boards.length === 0) return null;
  return (
    <div>
      <h2 className="mb-3 font-display text-lg text-on-surface">{title}</h2>
      <ul className="space-y-2">
        {boards.map((board) => {
          const boardOwner = board.owner ?? owner;
          if (!board.slug || !boardOwner?.username) return null;
          return (
            <li key={board.id}>
              <Link className="text-sm font-medium text-primary hover:underline" href={ROUTES.publicCollection(boardOwner.username, board.slug)}>
                {board.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
