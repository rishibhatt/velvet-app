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
import { CollectionListRow } from "@/components/molecules/CollectionListRow";
import { ROUTES } from "@/constants/routes";
import { getTrackedCollectionHref } from "@/lib/collection-href";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";

function matchesQuery(
  normalized: string,
  parts: (string | null | undefined)[],
): boolean {
  if (!normalized) return true;
  return parts.some((p) => (p ?? "").toLowerCase().includes(normalized));
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 300);
  const { user } = useAuth();
  const { data: boards = [] } = useBoards();

  const normalized = debouncedQuery.trim().toLowerCase();

  const publicFilters = useMemo(
    () => ({
      sort: "trending" as const,
      query: debouncedQuery.trim() || undefined,
      excludeOwnerId: user?.id,
      limit: 32,
    }),
    [debouncedQuery, user?.id],
  );

  const { data: publicBoards = [], isLoading: publicLoading } =
    usePublicBoards(publicFilters);

  const { data: profiles = [], isLoading: profilesLoading } = useProfileSearch(
    debouncedQuery,
    debouncedQuery.trim().length >= 2,
  );

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const syncUrl = (q: string) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    const qs = params.toString();
    router.replace(qs ? `${ROUTES.search}?${qs}` : ROUTES.search);
  };

  const filteredMine = useMemo(() => {
    return boards.filter((b) =>
      matchesQuery(normalized, [
        b.title,
        b.description,
        b.mood,
        b.mood_label,
      ]),
    );
  }, [boards, normalized]);

  const hasQuery = normalized.length > 0;
  const showPeople = debouncedQuery.trim().length >= 2;

  useEffect(() => {
    if (!hasQuery) return;
    track(ANALYTICS_EVENTS.SEARCH_PERFORMED, {
      query: normalized,
      results_count: filteredMine.length + publicBoards.length + profiles.length,
      tab: "universal",
    });
  }, [
    filteredMine.length,
    hasQuery,
    normalized,
    profiles.length,
    publicBoards.length,
  ]);

  const totalResults =
    filteredMine.length + publicBoards.length + (showPeople ? profiles.length : 0);

  return (
    <main className="page-container py-stack-lg pb-28 md:py-12 md:pb-12">
      <div className="mb-6">
        <h1 className="font-display flex items-center gap-2 text-2xl text-on-surface md:text-3xl">
          <Sparkles className="h-6 w-6 text-primary" aria-hidden />
          Search
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Collections and creators in one place
        </p>

        <div className="relative mt-4">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-primary/70" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              syncUrl(e.target.value);
            }}
            placeholder="Search collections, moods, or @people…"
            className="w-full rounded-full border border-outline-variant/30 bg-bg-elevated py-3.5 pr-4 pl-12 text-base text-on-surface shadow-sm transition-shadow focus:border-primary focus:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Search"
          />
        </div>
        {hasQuery && (
          <p className="mt-2 text-xs text-on-surface-variant">
            {totalResults === 0
              ? "No results"
              : `${totalResults} result${totalResults === 1 ? "" : "s"}`}
          </p>
        )}
      </div>

      {!hasQuery && (
        <p className="mb-8 text-sm text-on-surface-variant">
          Try a collection name, mood like &ldquo;wedding&rdquo;, or a creator @username.
        </p>
      )}

      {filteredMine.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display mb-3 text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
            Your collections
          </h2>
          <ul className="space-y-2.5">
            {filteredMine.map((board) => (
              <li key={board.id}>
                <CollectionListRow
                  board={board}
                  href={ROUTES.board(board.id)}
                  scope="yours"
                  showLike={false}
                  onClick={() =>
                    track(ANALYTICS_EVENTS.SEARCH_RESULT_CLICKED, {
                      query: normalized,
                      result_type: "own_collection",
                      collection_id: board.id,
                    })
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {(publicLoading || publicBoards.length > 0) && (
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
              {hasQuery ? "Public collections" : "Trending public"}
            </h2>
            <Link
              href={ROUTES.explore}
              className="shrink-0 text-xs font-semibold text-primary hover:underline"
            >
              Explore all
            </Link>
          </div>
          {publicLoading ? (
            <p className="py-6 text-center text-sm text-on-surface-variant">Searching…</p>
          ) : publicBoards.length > 0 ? (
            <ul className="space-y-2.5">
              {publicBoards.map((board) => (
                <li key={board.id}>
                  <CollectionListRow
                    board={board}
                    href={getTrackedCollectionHref(board, {
                      userId: user?.id,
                      ownerUsername: board.owner?.username,
                      preset: "internal_search",
                      presetContext: { query: normalized },
                    })}
                    owner={board.owner}
                    scope="public"
                    onClick={() =>
                      track(ANALYTICS_EVENTS.SEARCH_RESULT_CLICKED, {
                        query: normalized,
                        result_type: "public_collection",
                        collection_id: board.id,
                      })
                    }
                  />
                </li>
              ))}
            </ul>
          ) : hasQuery ? (
            <p className="py-4 text-center text-sm text-on-surface-variant">
              No public collections match.
            </p>
          ) : null}
        </section>
      )}

      {showPeople && (
        <section>
          <h2 className="font-display mb-3 text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
            People
          </h2>
          {profilesLoading ? (
            <p className="py-6 text-center text-sm text-on-surface-variant">Searching…</p>
          ) : profiles.length > 0 ? (
            <div className="space-y-2.5">
              {profiles.map((p) => (
                <ProfileSearchCard
                  key={p.id}
                  profile={p}
                  onClick={() =>
                    track(ANALYTICS_EVENTS.SEARCH_RESULT_CLICKED, {
                      query: normalized,
                      result_type: "profile",
                      profile_id: p.id,
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-on-surface-variant">
              No people found for &ldquo;{debouncedQuery.trim()}&rdquo;
            </p>
          )}
        </section>
      )}

      {hasQuery &&
        !publicLoading &&
        filteredMine.length === 0 &&
        publicBoards.length === 0 &&
        (!showPeople || (!profilesLoading && profiles.length === 0)) && (
          <p className="py-12 text-center text-on-surface-variant">
            Nothing matched. Try Explore or a different term.
          </p>
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
