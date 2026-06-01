"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/atoms/Button";
import {
  BoardCard,
  BoardCardSkeleton,
} from "@/components/organisms/BoardCard";
import { EmptyState } from "@/components/molecules/EmptyState";
import { ErrorAlert } from "@/components/molecules/ErrorAlert";
import { useBoards } from "@/queries/board/queries";
import { useModalStore } from "@/store/modal.store";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getGreeting } from "@/utils/format";
import { fadeUp, stagger } from "@/lib/animations";
import { isSupabaseConfigured } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const { data: boards, isLoading, isError, error, refetch } = useBoards();
  const { openCreateBoard } = useModalStore();
  const { profile } = useAuth();

  useEffect(() => {
    if (!isSupabaseConfigured() || isLoading || isError) return;
    if (boards && boards.length === 0) {
      const skipped = sessionStorage.getItem("velvet_onboarding_skip");
      if (!skipped) {
        router.replace("/onboarding");
      }
    }
  }, [boards, isLoading, isError, router]);

  return (
    <main className="page-container py-stack-lg md:py-12">
      {isError && (
        <ErrorAlert
          className="mb-6"
          error={error}
          title="Couldn't load your collections"
          onRetry={() => refetch()}
        />
      )}

      <motion.section className="mb-10" {...fadeUp}>
        <h2 className="font-display mb-2 text-2xl text-on-surface md:text-3xl">
          {getGreeting(profile?.full_name)}
        </h2>
        <p className="text-on-surface-variant">
          Your creative space is ready for today&apos;s inspiration.
        </p>
      </motion.section>

      <div className="mb-8 flex items-end justify-between">
        <h3 className="font-display text-xl text-primary md:text-2xl">
          Your Boards
        </h3>
        <button
          onClick={openCreateBoard}
          className="hidden text-sm font-semibold text-primary hover:underline md:block"
        >
          + New Collection
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <BoardCardSkeleton key={i} />
          ))}
        </div>
      ) : boards && boards.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 gap-6 pb-24 sm:grid-cols-2 lg:grid-cols-3"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          {boards.map((board) => (
            <motion.div key={board.id} variants={fadeUp}>
              <BoardCard board={board} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <EmptyState
          title="Your velvet world starts here"
          description="Create your first board and begin curating the moments that matter."
          actionLabel="Create your first board"
          onAction={openCreateBoard}
        />
      )}

      <Button
        onClick={openCreateBoard}
        size="lg"
        className="fixed right-4 bottom-20 z-40 max-[380px]:right-3 max-[380px]:text-sm sm:right-6 md:bottom-12 md:right-12"
      >
        <Plus className="h-5 w-5" />
        New Board
      </Button>
    </main>
  );
}
