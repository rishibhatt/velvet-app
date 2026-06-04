"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { Search, Sparkles } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useBoards } from "@/queries/board/queries";
import { usePublicBoards, useProfileSearch } from "@/queries/discover/queries";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ProfileSearchCard } from "@/components/molecules/ProfileSearchCard";
import { VelvetGradientTabs } from "@/components/molecules/VelvetGradientTabs";
import { BoardCard } from "@/components/organisms/BoardCard";
import { CollectionCardSkeleton } from "@/components/organisms/CollectionCard";
import { CollectionCardSkeletonGrid } from "@/components/skeletons/CollectionCardSkeletonGrid";
import { CollectionPosterGrid } from "@/components/molecules/CollectionPosterGrid";
import { COLLECTION_CARD_GRID } from "@/constants/collection-ui";
import { ROUTES } from "@/constants/routes";
import { useInfiniteSlice } from "@/hooks/useInfiniteSlice";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";

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

  const { visible: visibleMine, sentinelRef: mineSentinel } = useInfiniteSlice(
    filteredMine,
    12,
  );
  const { visible: visiblePublic, sentinelRef: publicSentinel } =
    useInfiniteSlice(publicBoards, 12);

  useEffect(() => {
    if (!normalized) return;
    const count =
      tab === "mine"
        ? filteredMine.length
        : tab === "public"
          ? publicBoards.length
          : profiles.length;
    track(ANALYTICS_EVENTS.SEARCH_PERFORMED, {
      query: normalized,
      results_count: count,
      tab,
    });
  }, [filteredMine.length, normalized, profiles.length, publicBoards.length, tab]);

  const placeholders: Record<SearchTab, string> = {
    mine: "Search your collections…",
    public: "Search public collections…",
    people: "Search by @username or name…",
  };

  return (
    <main className="page-container py-stack-lg pb-28 md:py-12 md:pb-12">
      <div className="velvet-panel mb-6 p-4 sm:p-6">
        <h1 className="font-display flex items-center gap-2 text-2xl text-on-surface md:text-3xl">
          <Sparkles className="h-6 w-6 text-primary" aria-hidden />
          Search
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Find your boards, public inspiration, and creators
        </p>

        <VelvetGradientTabs
          className="mt-5"
          tabs={TABS}
          value={tab}
          onChange={handleTabChange}
          aria-label="Search categories"
        />

        <div className="relative mt-4">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-primary/70" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              syncUrl(tab, e.target.value);
            }}
            placeholder={placeholders[tab]}
            className="w-full rounded-full border border-outline-variant/30 bg-bg-elevated py-4 pr-4 pl-12 text-base text-on-surface shadow-sm transition-shadow focus:border-primary focus:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Search"
          />
        </div>
      </div>

      {tab === "mine" && (
        <section>
          <h2 className="font-display mb-4 text-lg text-primary md:text-xl">
            {normalized ? "Your results" : "All your collections"}
          </h2>
          {filteredMine.length > 0 ? (
            <>
              <div className="space-y-3">
                {visibleMine.map((board) => (
                  <Link
                    key={board.id}
                    href={ROUTES.board(board.id)}
                    onClick={() =>
                      track(ANALYTICS_EVENTS.SEARCH_RESULT_CLICKED, {
                        query: normalized,
                        result_type: "own_collection",
                        collection_id: board.id,
                      })
                    }
                    className="flex items-center gap-3 rounded-2xl border border-outline-variant/20 bg-bg-elevated p-3 transition-all active:scale-[0.99] hover:border-primary/30 sm:gap-4 sm:p-4"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl sm:h-[72px] sm:w-[72px]">
                      <CollectionPosterGrid
                        images={board.preview_images ?? []}
                        title={board.title}
                        itemCount={board.item_count ?? 0}
                        emptyVariant="own"
                        compactEmpty
                        className="h-full w-full"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-base text-on-surface">
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
              </div>
              {visibleMine.length < filteredMine.length && (
                <div ref={mineSentinel} className="py-4 text-center text-sm text-on-surface-variant">
                  Loading more…
                </div>
              )}
            </>
          ) : normalized ? (
            <p className="py-8 text-center text-on-surface-variant">
              No collections match your search.
            </p>
          ) : (
            <p className="py-8 text-center text-on-surface-variant">
              Create a collection to start searching yours.
            </p>
          )}
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
              className="shrink-0 rounded-full px-2 py-1 text-sm font-semibold text-primary transition-colors hover:bg-primary-fixed/40"
            >
              Explore all →
            </Link>
          </div>
          {publicLoading ? (
            <CollectionCardSkeletonGrid count={4} />
          ) : publicBoards.length > 0 ? (
            <>
              <div className={COLLECTION_CARD_GRID}>
                {visiblePublic.map((board) => (
                  <BoardCard
                    key={board.id}
                    board={board}
                    showLike
                    owner={board.owner}
                    publicHref={
                      board.slug
                        ? board.owner?.username
                          ? ROUTES.publicCollection(board.owner.username, board.slug)
                          : ROUTES.legacyPublicCollection(board.slug)
                        : undefined
                    }
                    className="cursor-pointer"
                    onClick={() =>
                      track(ANALYTICS_EVENTS.SEARCH_RESULT_CLICKED, {
                        query: normalized,
                        result_type: "public_collection",
                        collection_id: board.id,
                      })
                    }
                  />
                ))}
              </div>
              {visiblePublic.length < publicBoards.length && (
                <div
                  ref={publicSentinel}
                  className={`${COLLECTION_CARD_GRID} mt-3`}
                >
                  <CollectionCardSkeleton />
                  <CollectionCardSkeleton />
                </div>
              )}
            </>
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
        <section className="velvet-panel p-4 sm:p-6">
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
                <ProfileSearchCard
                  key={profile.id}
                  profile={profile}
                  onClick={() =>
                    track(ANALYTICS_EVENTS.SEARCH_RESULT_CLICKED, {
                      query: normalized,
                      result_type: "profile",
                      profile_id: profile.id,
                    })
                  }
                />
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
