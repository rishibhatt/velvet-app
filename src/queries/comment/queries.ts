"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { commentsService } from "@/services/items/items.service";
import { commentKeys } from "../board/keys";
import { velvetToast } from "@/lib/toast";

export function useComments(itemId: string) {
  return useQuery({
    queryKey: commentKeys.list(itemId),
    queryFn: () => commentsService.getComments(itemId),
    enabled: Boolean(itemId),
  });
}

export function useAddComment(itemId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      commentsService.addComment(itemId, content),
    meta: { errorContext: "comment" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(itemId) });
      velvetToast.success("Comment added");
    },
  });
}
