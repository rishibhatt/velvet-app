"use client";

import { motion } from "framer-motion";
import { ExploreCollectionCard } from "@/components/organisms/ExploreCollectionCard";
import { AdCard } from "@/components/ads/AdCard";
import { injectAdsIntoFeed } from "@/lib/feed-injection";
import type { PublicBoard } from "@/services/discover/discover.service";
import type { AdUnit } from "@/types/board.types";
import { COLLECTION_CARD_GRID } from "@/constants/collection-ui";
import { fadeUp, stagger } from "@/lib/animations";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";
import { useEffect } from "react";

interface ExploreFeedGridProps {
  boards: PublicBoard[];
  ads: AdUnit[];
  onBoardClick: (board: PublicBoard) => void;
}

export function ExploreFeedGrid({ boards, ads, onBoardClick }: ExploreFeedGridProps) {
  const feed = injectAdsIntoFeed(boards, ads);

  useEffect(() => {
    for (const ad of ads) {
      track(ANALYTICS_EVENTS.AD_IMPRESSION, {
        ad_unit_id: ad.id,
        placement: ad.placement,
      });
    }
  }, [ads]);

  const firstBoardIndex = feed.findIndex((item) => item.type === "board");

  return (
    <motion.div
      className={COLLECTION_CARD_GRID}
      variants={stagger}
      initial="initial"
      animate="animate"
    >
      {feed.map((entry, index) => {
        const isFirstBoard = entry.type === "board" && index === firstBoardIndex;

        return (
          <motion.div
            key={entry.type === "ad" ? `ad-${entry.data.id}` : entry.data.id}
            variants={fadeUp}
            initial={isFirstBoard ? false : "initial"}
          >
            {entry.type === "ad" ? (
              <AdCard ad={entry.data} />
            ) : (
              <ExploreCollectionCard
                board={entry.data}
                owner={entry.data.owner}
                onClick={() => onBoardClick(entry.data)}
                priority={isFirstBoard}
                trafficPreset="internal_explore"
              />
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
