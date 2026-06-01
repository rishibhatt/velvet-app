"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import { getErrorMessage, type ErrorContext } from "@/lib/errors";
import { velvetToast } from "@/lib/toast";

declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: {
      skipErrorToast?: boolean;
      errorContext?: ErrorContext;
    };
    mutationMeta: {
      skipErrorToast?: boolean;
      errorContext?: ErrorContext;
    };
  }
}

export function createAppQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.meta?.skipErrorToast) return;
        const context = query.meta?.errorContext ?? "generic";
        velvetToast.error(
          "Couldn't load data",
          getErrorMessage(error, context),
        );
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (mutation.meta?.skipErrorToast) return;
        const ctx = mutation.meta?.errorContext ?? "generic";
        velvetToast.fromError(error, ctx);
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
