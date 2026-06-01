"use client";

import { toast } from "sonner";
import { ToastContent, type ToastVariant } from "@/components/molecules/ToastContent";
import { getErrorMessage, type ErrorContext } from "@/lib/errors";

function show(
  variant: ToastVariant,
  title: string,
  description?: string,
  duration = variant === "error" ? 6000 : 4000,
) {
  return toast.custom(
    (id) => (
      <ToastContent
        variant={variant}
        title={title}
        description={description}
        onDismiss={() => toast.dismiss(id)}
      />
    ),
    { duration: variant === "loading" ? Infinity : duration },
  );
}

export const velvetToast = {
  success(title: string, description?: string) {
    return show("success", title, description);
  },

  error(title: string, description?: string) {
    return show("error", title, description, 7000);
  },

  info(title: string, description?: string) {
    return show("info", title, description);
  },

  loading(title: string, description?: string) {
    return show("loading", title, description);
  },

  dismiss(id?: string | number) {
    toast.dismiss(id);
  },

  fromError(error: unknown, context: ErrorContext = "generic") {
    const message = getErrorMessage(error, context);
    const titles: Partial<Record<ErrorContext, string>> = {
      auth: "Sign-in issue",
      board: "Collection error",
      item: "Couldn't update save",
      upload: "Upload failed",
      profile: "Profile error",
      generic: "Something went wrong",
    };
    return velvetToast.error(titles[context] ?? "Something went wrong", message);
  },

  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      context?: ErrorContext;
    },
  ) {
    const id = velvetToast.loading(messages.loading);
    return promise
      .then((result) => {
        velvetToast.dismiss(id);
        velvetToast.success(messages.success);
        return result;
      })
      .catch((err) => {
        velvetToast.dismiss(id);
        velvetToast.fromError(err, messages.context ?? "generic");
        throw err;
      });
  },
};
