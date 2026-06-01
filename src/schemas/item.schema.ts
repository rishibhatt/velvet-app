import { z } from "zod";

export const saveItemSchema = z.object({
  boardId: z.string().min(1),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  title: z.string().min(1, "Title is required").max(200),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
});

export type SaveItemFormInput = z.infer<typeof saveItemSchema>;
