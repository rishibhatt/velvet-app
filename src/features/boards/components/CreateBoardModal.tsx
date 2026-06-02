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
      <form id="create-board-form" onSubmit={handleSubmit(onSubmit)} className="space-y-10">
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
            className="velvet-field w-full resize-none rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-sm"
            aria-label="Description"
          />
        </div>

        <section>
          <label className="mb-4 block text-sm font-bold tracking-widest text-on-surface uppercase">
            Choose a Mood
          </label>
          <div className="flex gap-stack-md overflow-x-auto pb-2 hide-scrollbar -mx-2 px-2">
            {MOODS.slice(0, 5).map((mood) => {
              const Icon = mood.Icon;
              const selected = selectedMood === mood.value;
              return (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => setSelectedMood(mood.value)}
                  className={cn(
                    "flex flex-shrink-0 items-center gap-2.5 rounded-full border-2 px-5 py-2.5 transition-all duration-200 active:scale-[0.98]",
                    selected
                      ? "border-primary bg-primary-fixed/50 text-primary shadow-sm"
                      : "border-outline-variant/40 bg-bg-elevated text-on-surface hover:border-primary/35 hover:bg-primary-fixed/20",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                      selected
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-low text-primary",
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                  </span>
                  <span className="text-sm font-semibold">{mood.label}</span>
                </button>
              );
            })}
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
