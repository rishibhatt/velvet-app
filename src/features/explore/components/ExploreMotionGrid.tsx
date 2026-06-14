"use client";

import { motion } from "framer-motion";
import { ExploreCollectionCard } from "@/components/organisms/ExploreCollectionCard";
import { ExploreBoardListRow } from "@/components/molecules/ExploreBoardListRow";
import type { PublicBoard } from "@/services/discover/discover.service";
import { COLLECTION_CARD_GRID } from "@/constants/collection-ui";
import { fadeUp, stagger } from "@/lib/animations";

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
      {boards.map((board, index) => (
        <motion.div key={board.id} variants={fadeUp}>
          <ExploreCollectionCard
            board={board}
            owner={board.owner}
            onClick={() => onBoardClick(board)}
            priority={index === 0}
            trafficPreset="internal_explore"
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
          />
        </motion.li>
      ))}
    </motion.ul>
  );
}
