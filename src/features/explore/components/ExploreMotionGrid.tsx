"use client";

import { motion } from "framer-motion";
import { ExploreCollectionCard } from "@/components/organisms/ExploreCollectionCard";
import { ExploreBoardListRow } from "@/components/molecules/ExploreBoardListRow";
import type { PublicBoard } from "@/services/discover/discover.service";
import { COLLECTION_CARD_GRID } from "@/constants/collection-ui";
import { fadeUp, stagger } from "@/lib/animations";
import { boardPublicHref } from "@/features/explore/explore-utils";

interface ExploreMotionGridProps {
  boards: PublicBoard[];
  onBoardClick: (board: PublicBoard) => void;
}

export function ExploreMotionGrid({ boards, onBoardClick }: ExploreMotionGridProps) {
  return (
    <motion.div
      className={COLLECTION_CARD_GRID}
      variants={stagger}
      initial="initial"
      animate="animate"
    >
      {boards.map((board) => (
        <motion.div key={board.id} variants={fadeUp}>
          <ExploreCollectionCard
            board={board}
            owner={board.owner}
            onClick={() => onBoardClick(board)}
            publicHref={boardPublicHref(board)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

interface ExploreMotionListProps {
  boards: PublicBoard[];
  onBoardClick: (board: PublicBoard) => void;
}

export function ExploreMotionList({ boards, onBoardClick }: ExploreMotionListProps) {
  return (
    <motion.ul
      className="space-y-3"
      variants={stagger}
      initial="initial"
      animate="animate"
    >
      {boards.map((board) => (
        <motion.li key={board.id} variants={fadeUp}>
          <ExploreBoardListRow
            board={board}
            owner={board.owner}
            onClick={() => onBoardClick(board)}
            publicHref={boardPublicHref(board)}
          />
        </motion.li>
      ))}
    </motion.ul>
  );
}
