interface ExploreEmptyStaticProps {
  mood?: string | null;
}

/** Server-rendered empty state — paints before JS for fast LCP on /explore. */
export function ExploreEmptyStatic({ mood }: ExploreEmptyStaticProps) {
  const title = mood
    ? "No public collections in this mood yet"
    : "Nothing to explore yet";
  const description = mood
    ? "Try another category or check back soon as creators publish more."
    : "When creators mark collections as public, they'll appear here.";

  return (
    <div className="flex flex-col items-center justify-center rounded-3xl bg-surface-container-low px-8 py-16 text-center">
      <svg viewBox="0 0 120 120" className="mb-6 h-24 w-24 opacity-80" aria-hidden>
        <rect x="20" y="30" width="50" height="40" rx="8" fill="#F4A896" opacity="0.3" />
        <rect x="45" y="20" width="50" height="40" rx="8" fill="#E8B4B8" opacity="0.4" />
        <rect x="35" y="50" width="50" height="40" rx="8" fill="#C9B6E4" opacity="0.3" />
        <path
          d="M15 90 Q30 80 45 90 T75 90 T105 90"
          stroke="#8a4e40"
          strokeWidth="2"
          fill="none"
          opacity="0.4"
        />
      </svg>
      <h2 className="font-display mb-2 text-2xl text-on-surface">{title}</h2>
      <p className="mb-6 max-w-sm text-on-surface-variant">{description}</p>
    </div>
  );
}
