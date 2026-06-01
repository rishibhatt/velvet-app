"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { velvetToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/Button";
import { SegmentButton } from "@/components/atoms/SegmentButton";
import { ModalShell } from "@/components/organisms/ModalShell";
import { MOODS } from "@/constants/moods";
import { useCreateBoard } from "@/queries/board/mutations";
import { useModalStore } from "@/store/modal.store";
import {
  createBoardSchema,
  type CreateBoardInput,
} from "@/schemas/board.schema";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

export function CreateBoardModal() {
  const router = useRouter();
  const { createBoardModal, closeCreateBoard } = useModalStore();
  const createBoard = useCreateBoard();
  const [selectedMood, setSelectedMood] =
    useState<CreateBoardInput["mood"]>("wedding");
  const [isPublic, setIsPublic] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBoardInput>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: { mood: "wedding", isPublic: false },
  });

  const onSubmit = async (data: CreateBoardInput) => {
    try {
      const board = await createBoard.mutateAsync({
        ...data,
        mood: selectedMood,
        isPublic,
      });
      velvetToast.success("Collection created!", "Start saving inspiration.");
      reset();
      closeCreateBoard();
      router.push(ROUTES.board(board.id));
    } catch {
      /* global mutation toast */
    }
  };

  return (
    <ModalShell
      open={createBoardModal}
      onClose={closeCreateBoard}
      title="New collection"
      subtitle="Gather your inspirations in one curated space"
      className="surface-panel max-w-lg"
      contentClassName="p-stack-lg md:p-12"
      footer={
        <Button type="submit" form="create-board-form" size="lg" loading={createBoard.isPending} className="w-full">
          Create Board
          <ArrowRight className="h-5 w-5" />
        </Button>
      }
    >
      <form id="create-board-form" onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        <div className="space-y-4">
          <input
            {...register("title")}
            placeholder="Name your collection..."
            className="w-full border-0 border-b-2 border-outline-variant bg-transparent py-4 font-display text-xl text-on-surface placeholder:text-outline/70 transition-colors focus:border-primary focus:ring-0 focus:outline-none md:text-2xl"
            aria-label="Collection name"
          />
          {errors.title && (
            <p className="text-sm text-error">{errors.title.message}</p>
          )}
          <textarea
            {...register("description")}
            placeholder="What is this collection for? (optional)"
            rows={2}
            className="w-full resize-none rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-sm focus:border-primary focus:outline-none"
            aria-label="Description"
          />
        </div>

        <section>
          <label className="mb-4 block text-sm font-bold tracking-widest text-on-surface uppercase">
            Choose a Mood
          </label>
          <div className="flex gap-stack-md overflow-x-auto pb-2 hide-scrollbar -mx-2 px-2">
            {MOODS.slice(0, 5).map((mood) => (
              <button
                key={mood.value}
                type="button"
                onClick={() => setSelectedMood(mood.value)}
                className={cn(
                  "flex flex-shrink-0 items-center gap-2 rounded-full border-2 px-6 py-3 transition-all duration-200 active:scale-95",
                  selectedMood === mood.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-outline-variant/50 bg-white text-on-surface hover:border-primary/40",
                )}
              >
                <span className="text-xl">{mood.emoji}</span>
                <span className="text-sm font-semibold">{mood.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <label className="block text-sm font-bold tracking-widest text-on-surface uppercase">
            Privacy
          </label>
          <SegmentButton
            options={[
              { value: "private", label: "Private" },
              { value: "shared", label: "Shared" },
            ]}
            value={isPublic ? "shared" : "private"}
            onChange={(v) => setIsPublic(v === "shared")}
          />
        </section>

      </form>
    </ModalShell>
  );
}
