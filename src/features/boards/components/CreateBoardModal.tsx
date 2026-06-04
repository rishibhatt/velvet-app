"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UI_LABELS } from "@/constants/ui-labels";
import { velvetToast } from "@/lib/toast";
import { confirmAction } from "@/lib/confirm";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/Button";
import { ModalShell } from "@/components/organisms/ModalShell";
import { CollectionVisibilityToggle } from "@/components/molecules/CollectionVisibilityToggle";
import { MoodSelect, type MoodSelection } from "@/components/molecules/MoodSelect";
import { CUSTOM_MOOD_VALUE } from "@/constants/moods";
import { useCreateBoard } from "@/queries/board/mutations";
import { useModalStore } from "@/store/modal.store";
import {
  createBoardSchema,
  type CreateBoardInput,
} from "@/schemas/board.schema";
import { ROUTES } from "@/constants/routes";

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

  const requestVisibilityChange = async (nextPublic: boolean) => {
    if (nextPublic === isPublic) return;

    if (nextPublic) {
      const ok = await confirmAction({
        title: "Make this collection public?",
        description:
          "It will appear in Explore and anyone with the link can view it. You can switch to private anytime in settings.",
        confirmLabel: "Make public",
        cancelLabel: "Keep private",
      });
      if (ok) setIsPublic(true);
      return;
    }

    setIsPublic(false);
  };

  const onSubmit = async (data: CreateBoardInput) => {
    const isCustom = moodSelection === CUSTOM_MOOD_VALUE;
    const trimmedCustom = customMoodLabel.trim();

    if (isCustom && !trimmedCustom) {
      velvetToast.error("Add a mood name", "Enter a custom mood or pick a preset from the list.");
      return;
    }

    try {
      const board = await createBoard.mutateAsync({
        ...data,
        mood: isCustom ? "other" : moodSelection,
        moodLabel: isCustom ? trimmedCustom : undefined,
        isPublic,
      });
      velvetToast.success(
        "Collection created",
        `"${board.title}" is ready — start saving inspiration.`,
      );
      reset();
      setMoodSelection("wedding");
      setCustomMoodLabel("");
      setIsPublic(false);
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
      className="w-full sm:max-w-md"
      responsive
      footer={
        <Button
          type="submit"
          form="create-board-form"
          loading={createBoard.isPending}
          className="w-full"
        >
          {UI_LABELS.createCollection}
        </Button>
      }
    >
      <form
        id="create-board-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 px-5 py-5 sm:px-6"
      >
        <div className="space-y-1.5">
          <label htmlFor="new-board-title" className="text-xs font-semibold text-on-surface-variant">
            Title
          </label>
          <input
            id="new-board-title"
            {...register("title")}
            placeholder="Name your collection"
            className="velvet-field w-full rounded-xl px-3 py-2.5 text-sm"
            autoComplete="off"
          />
          {errors.title && (
            <p className="text-xs text-error">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="new-board-desc" className="text-xs font-semibold text-on-surface-variant">
            Description
          </label>
          <textarea
            id="new-board-desc"
            {...register("description")}
            placeholder="Optional"
            rows={2}
            className="velvet-field w-full resize-none rounded-xl px-3 py-2.5 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="collection-mood" className="text-xs font-semibold text-on-surface-variant">
            Mood
          </label>
          <MoodSelect value={moodSelection} onChange={setMoodSelection} />
          {moodSelection === CUSTOM_MOOD_VALUE && (
            <input
              value={customMoodLabel}
              onChange={(e) => setCustomMoodLabel(e.target.value)}
              placeholder="e.g. Nursery, Recipes, Date night"
              maxLength={48}
              className="velvet-field w-full rounded-xl px-3 py-2.5 text-sm"
              aria-label="Custom mood name"
            />
          )}
        </div>

        <CollectionVisibilityToggle
          isPublic={isPublic}
          onChange={(next) => void requestVisibilityChange(next)}
        />
      </form>
    </ModalShell>
  );
}
