"use client";

import { useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { useBoards } from "@/queries/board/queries";
import { useDebounce } from "@/hooks/useDebounce";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const { data: boards = [] } = useBoards();

  const filteredBoards = boards.filter((b) =>
    b.title.toLowerCase().includes(debouncedQuery.toLowerCase()),
  );

  return (
    <main className="mx-auto max-w-7xl px-margin-mobile py-stack-lg md:px-margin-desktop md:py-12">
      <h1 className="font-display mb-6 text-3xl text-on-surface">Explore</h1>

      <div className="relative mb-8">
        <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search boards and items..."
          className="w-full rounded-full border border-outline-variant/30 bg-surface-container-low py-4 pr-4 pl-12 text-base focus:border-primary focus:outline-none"
          aria-label="Search"
        />
      </div>

      <section>
        <h2 className="font-display mb-4 text-xl text-primary">Boards</h2>
        <div className="space-y-3">
          {filteredBoards.map((board) => (
            <Link
              key={board.id}
              href={ROUTES.board(board.id)}
              className="flex items-center gap-4 rounded-2xl bg-surface-container-low p-4 transition-all hover:bg-surface-container hover:shadow-[var(--shadow-card)]"
            >
              {board.cover_url && (
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={board.cover_url}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <p className="font-medium text-on-surface">{board.title}</p>
                <p className="text-sm text-on-surface-variant">
                  {board.item_count ?? 0} items
                </p>
              </div>
            </Link>
          ))}
          {filteredBoards.length === 0 && debouncedQuery && (
            <p className="py-8 text-center text-on-surface-variant">
              No results for &ldquo;{debouncedQuery}&rdquo;
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
