"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { Search } from "lucide-react";
import { VelvetImage } from "@/components/atoms/VelvetImage";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useBoards } from "@/queries/board/queries";
import { usePublicBoards, useProfileSearch } from "@/queries/discover/queries";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ProfileSearchCard } from "@/components/molecules/ProfileSearchCard";
import {
  BoardCard,
  BoardCardSkeleton,
} from "@/components/organisms/BoardCard";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type SearchTab = "mine" | "public" | "people";

const TABS: { id: SearchTab; label: string }[] = [
  { id: "mine", label: "Yours" },
  { id: "public", label: "Public" },
  { id: "people", label: "People" },
];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const initialTab = (searchParams.get("tab") as SearchTab) || "mine";

  const [query, setQuery] = useState(initialQuery);
  const [tab, setTab] = useState<SearchTab>(
    TABS.some((t) => t.id === initialTab) ? initialTab : "mine",
  );
  const debouncedQuery = useDebounce(query, 300);
  const { user } = useAuth();
  const { data: boards = [] } = useBoards();

  const publicFilters = useMemo(
    () => ({
      sort: "trending" as const,
      query: debouncedQuery.trim() || undefined,
      excludeOwnerId: user?.id,
      limit: 24,
    }),
    [debouncedQuery, user?.id],
  );

  const {
    data: publicBoards = [],
    isLoading: publicLoading,
  } = usePublicBoards(publicFilters);

  const {
    data: profiles = [],
    isLoading: profilesLoading,
  } = useProfileSearch(debouncedQuery, tab === "people");

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const nextTab = searchParams.get("tab") as SearchTab;
    if (TABS.some((t) => t.id === nextTab)) setTab(nextTab);
  }, [searchParams]);

  const syncUrl = (nextTab: SearchTab, q: string) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (nextTab !== "mine") params.set("tab", nextTab);
    const qs = params.toString();
    router.replace(qs ? `${ROUTES.search}?${qs}` : ROUTES.search);
  };

  const handleTabChange = (nextTab: SearchTab) => {
    setTab(nextTab);
    syncUrl(nextTab, query);
  };

  const normalized = debouncedQuery.trim().toLowerCase();
  const filteredMine = boards.filter((b) => {
    if (!normalized) return true;
    const inTitle = b.title.toLowerCase().includes(normalized);
    const inDescription = (b.description ?? "").toLowerCase().includes(normalized);
    const inMood = (b.mood ?? "").toLowerCase().includes(normalized);
    return inTitle || inDescription || inMood;
  });

  const placeholders: Record<SearchTab, string> = {
    mine: "Search your collections…",
    public: "Search public collections…",
    people: "Search by @username or name…",
  };

  return (
    <main className="page-container py-stack-lg pb-28 md:py-12 md:pb-12">
      <h1 className="font-display mb-4 text-2xl text-on-surface md:text-3xl">
        Search
      </h1>

      <div
        className="mb-4 flex gap-1 overflow-x-auto rounded-2xl bg-surface-container-low p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => handleTabChange(t.id)}
            className={cn(
              "min-h-[44px] flex-1 shrink-0 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
              tab === t.id
                ? "bg-bg-elevated text-primary shadow-sm"
                : "text-on-surface-variant",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="relative mb-6">
        <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            syncUrl(tab, e.target.value);
          }}
          placeholder={placeholders[tab]}
          className="w-full rounded-full border border-outline-variant/30 bg-surface-container-lowest py-4 pr-4 pl-12 text-base text-on-surface shadow-sm focus:border-primary focus:outline-none"
          aria-label="Search"
        />
      </div>

      {tab === "mine" && (
        <section>
          <h2 className="font-display mb-4 text-lg text-primary md:text-xl">
            {normalized ? `Your results` : "All your collections"}
          </h2>
          <div className="space-y-3">
            {filteredMine.map((board) => (
              <Link
                key={board.id}
                href={ROUTES.board(board.id)}
                className="flex items-center gap-4 rounded-2xl border border-outline-variant/20 bg-bg-elevated p-4 transition-all active:scale-[0.99] hover:border-primary/30"
              >
                {board.cover_url ? (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                    <VelvetImage
                      src={board.cover_url}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-surface-container text-2xl">
                    📌
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium text-on-surface">
                    {board.title}
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    {board.item_count ?? 0} items
                    {board.mood ? ` · ${board.mood}` : ""}
                    {!board.is_public && " · Private"}
                  </p>
                </div>
              </Link>
            ))}
            {filteredMine.length === 0 && normalized && (
              <p className="py-8 text-center text-on-surface-variant">
                No collections match your search.
              </p>
            )}
            {boards.length === 0 && (
              <p className="py-8 text-center text-on-surface-variant">
                Create a collection to start searching yours.
              </p>
            )}
          </div>
        </section>
      )}

      {tab === "public" && (
        <section>
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="font-display text-lg text-primary md:text-xl">
              {normalized ? "Public matches" : "Trending public"}
            </h2>
            <Link
              href={ROUTES.explore}
              className="shrink-0 text-sm font-semibold text-primary hover:underline"
            >
              Explore all
            </Link>
          </div>
          {publicLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <BoardCardSkeleton key={i} />
              ))}
            </div>
          ) : publicBoards.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {publicBoards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  showLike
                  owner={board.owner}
                  publicHref={
                    board.slug
                      ? ROUTES.publicCollection(board.slug)
                      : undefined
                  }
                />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-on-surface-variant">
              {normalized
                ? "No public collections match. Try Explore or another term."
                : "No public collections yet. Check back soon."}
            </p>
          )}
        </section>
      )}

      {tab === "people" && (
        <section>
          <h2 className="font-display mb-4 text-lg text-primary md:text-xl">
            Creators
          </h2>
          {debouncedQuery.trim().length < 2 ? (
            <p className="py-8 text-center text-sm text-on-surface-variant">
              Type at least 2 characters to find people by @username or name.
            </p>
          ) : profilesLoading ? (
            <p className="py-8 text-center text-on-surface-variant">Searching…</p>
          ) : profiles.length > 0 ? (
            <div className="space-y-3">
              {profiles.map((profile) => (
                <ProfileSearchCard key={profile.id} profile={profile} />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-on-surface-variant">
              No profiles found for &ldquo;{debouncedQuery.trim()}&rdquo;
            </p>
          )}
        </section>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="page-container py-12 text-on-surface-variant">
          Loading search…
        </main>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
