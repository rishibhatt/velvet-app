"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Sparkles } from "lucide-react";
import { UI_LABELS } from "@/constants/ui-labels";
import { velvetToast } from "@/lib/toast";
import { Button } from "@/components/atoms/Button";
import { SegmentButton } from "@/components/atoms/SegmentButton";
import { MOODS } from "@/constants/moods";
import { useCreateBoard } from "@/queries/board/mutations";
import {
  createBoardSchema,
  type CreateBoardInput,
} from "@/schemas/board.schema";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { authService } from "@/services/auth/auth.service";
import type { SignupInput } from "@/schemas/auth.schema";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const createBoard = useCreateBoard();
  const preferredMood =
    (user?.user_metadata?.preferred_mood as SignupInput["mood"] | undefined) ??
    "wedding";
  const [step, setStep] = useState(1);
  const [selectedMood, setSelectedMood] =
    useState<CreateBoardInput["mood"]>(preferredMood);
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    setSelectedMood(preferredMood);
  }, [preferredMood]);

  const {
    register,
    handleSubmit,
    trigger,
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
      velvetToast.success("Your first collection is ready!");
      router.push(`/boards/${board.id}`);
    } catch {
      /* global mutation toast */
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col justify-center px-margin-mobile py-12 md:px-0">
      <div className="mb-8 text-center">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
          <Sparkles className="h-4 w-4" />
          Step {step} of 2
        </span>
        <h1 className="font-display mt-4 text-3xl text-on-surface">
          {step === 1 ? "Create your first board" : "Choose a mood"}
        </h1>
        <p className="mt-2 text-on-surface-variant">
          {step === 1
            ? "Every great plan starts with a curated space."
            : "This helps Velvet personalize your experience."}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="surface-panel rounded-[2rem] p-8 md:p-10"
      >
        {step === 1 ? (
          <div className="space-y-8">
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-on-surface"
              >
                Board name
              </label>
              <input
                id="title"
                {...register("title")}
                placeholder="e.g. Wedding Planner"
                className="w-full border-0 border-b-2 border-outline-variant bg-transparent py-3 font-display text-xl focus:border-primary focus:ring-0 focus:outline-none"
              />
              {errors.title && (
                <p className="mt-2 text-sm text-error">{errors.title.message}</p>
              )}
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-on-surface">
                Privacy
              </p>
              <SegmentButton
                options={[
                  { value: "private", label: "Private" },
                  { value: "shared", label: "Shared" },
                ]}
                value={isPublic ? "shared" : "private"}
                onChange={(v) => setIsPublic(v === "shared")}
              />
            </div>

            <Button
              type="button"
              size="lg"
              icon={ArrowRight}
              className="w-full"
              onClick={async () => {
                const valid = await trigger("title");
                if (valid) setStep(2);
              }}
            >
              Continue
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-wrap justify-center gap-3">
              {MOODS.slice(0, 5).map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => setSelectedMood(mood.value)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border-2 px-5 py-2.5 font-medium transition-all",
                    selectedMood === mood.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-outline-variant/40 bg-white text-on-surface hover:border-primary/50",
                  )}
                >
                  <span>{mood.emoji}</span>
                  {mood.label}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                type="submit"
                size="lg"
                loading={createBoard.isPending}
                className="flex-1"
              >
                {UI_LABELS.createCollection}
              </Button>
            </div>
          </div>
        )}
      </form>

      <button
        type="button"
        onClick={() => {
          void authService.skipOnboarding().finally(() => {
            router.push("/");
          });
        }}
        className="mt-6 w-full text-center text-sm font-medium text-primary hover:underline"
      >
        Skip for now
      </button>
    </main>
  );
}
