"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UI_LABELS } from "@/constants/ui-labels";
import { velvetToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/Button";
import { SegmentButton } from "@/components/atoms/SegmentButton";
import { ModalShell } from "@/components/organisms/ModalShell";
import { CUSTOM_MOOD_VALUE, MOODS, type MoodValue } from "@/constants/moods";
import { useCreateBoard } from "@/queries/board/mutations";
import { useModalStore } from "@/store/modal.store";
import {
  createBoardSchema,
  type CreateBoardInput,
} from "@/schemas/board.schema";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

type MoodSelection = MoodValue | typeof CUSTOM_MOOD_VALUE;

export function CreateBoardModal() {
  const router = useRouter();
  const { createBoardModal, closeCreateBoard } = useModalStore();
  const createBoard = useCreateBoard();
  const [moodSelection, setMoodSelection] = useState<MoodSelection>("wedding");
  const [customMoodLabel, setCustomMoodLabel] = useState("");
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
    const isCustom = moodSelection === CUSTOM_MOOD_VALUE;
    const trimmedCustom = customMoodLabel.trim();

    if (isCustom && !trimmedCustom) {
      velvetToast.error("Name your mood", "Enter a custom mood or pick a preset.");
      return;
    }

    try {
      const board = await createBoard.mutateAsync({
        ...data,
        mood: isCustom ? "other" : moodSelection,
        moodLabel: isCustom ? trimmedCustom : undefined,
        isPublic,
      });
      velvetToast.success("Collection created!", "Start saving inspiration.");
      reset();
      setMoodSelection("wedding");
      setCustomMoodLabel("");
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
      className="surface-panel w-full sm:max-w-lg"
      contentClassName="p-4 sm:p-stack-lg md:p-12"
      footer={
        <Button
          type="submit"
          form="create-board-form"
          size="lg"
          loading={createBoard.isPending}
          className="w-full"
        >
          {UI_LABELS.createCollection}
        </Button>
      }
    >
      <form id="create-board-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 sm:space-y-10">
        <div className="space-y-4">
          <input
            {...register("title")}
            placeholder="Name your collection..."
            className="velvet-input-title w-full border-0 border-b-2 border-outline-variant/50 bg-transparent py-4 font-display text-xl text-on-surface placeholder:text-outline/70 md:text-2xl"
            aria-label="Collection name"
          />
          {errors.title && (
            <p className="text-sm text-error">{errors.title.message}</p>
          )}
          <textarea
            {...register("description")}
            placeholder="What is this collection for? (optional)"
            rows={2}
            className="velvet-field w-full resize-none rounded-xl px-4 py-3 text-sm"
            aria-label="Description"
          />
        </div>

        <section className="space-y-3">
          <div>
            <label className="block text-sm font-bold tracking-widest text-on-surface uppercase">
              Choose a mood
            </label>
            <p className="mt-1 text-xs text-on-surface-variant">
              Pick a preset or name your own vibe below.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {MOODS.map((mood) => {
              const selected = moodSelection === mood.value;
              return (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => setMoodSelection(mood.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border-2 px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98]",
                    selected
                      ? "border-primary bg-primary-fixed/55 text-primary shadow-sm"
                      : "border-outline-variant/40 bg-bg-elevated text-on-surface hover:border-primary/35 hover:bg-primary-fixed/25",
                  )}
                >
                  <span className="text-lg leading-none" aria-hidden>
                    {mood.emoji}
                  </span>
                  {mood.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setMoodSelection(CUSTOM_MOOD_VALUE)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border-2 px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98]",
                moodSelection === CUSTOM_MOOD_VALUE
                  ? "border-primary bg-primary-fixed/55 text-primary shadow-sm"
                  : "border-outline-variant/40 bg-bg-elevated text-on-surface hover:border-primary/35 hover:bg-primary-fixed/25",
              )}
            >
              <span className="text-lg leading-none" aria-hidden>
                ✏️
              </span>
              Custom
            </button>
          </div>

          {moodSelection === CUSTOM_MOOD_VALUE && (
            <div className="space-y-1.5 pt-1">
              <label htmlFor="custom-mood" className="text-sm font-semibold text-on-surface">
                Your mood name
              </label>
              <input
                id="custom-mood"
                value={customMoodLabel}
                onChange={(e) => setCustomMoodLabel(e.target.value)}
                placeholder="e.g. Nursery, Recipes, Fitness, Date night..."
                maxLength={48}
                className="velvet-field w-full rounded-xl px-4 py-3 text-base sm:text-sm"
              />
            </div>
          )}
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
