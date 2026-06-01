import { z } from "zod";

export const createBoardSchema = z.object({
  title: z.string().min(1, "Board name is required").max(80),
  mood: z.enum([
    "wedding",
    "travel",
    "fashion",
    "home",
    "events",
    "lifestyle",
    "other",
  ]),
  isPublic: z.boolean(),
  description: z.string().max(500).optional(),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
