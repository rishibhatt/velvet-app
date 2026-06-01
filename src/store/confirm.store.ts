import { create } from "zustand";

export type ConfirmVariant = "default" | "destructive";

export interface ConfirmRequest {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

interface ConfirmState extends ConfirmRequest {
  open: boolean;
  confirmLabel: string;
  cancelLabel: string;
  variant: ConfirmVariant;
  resolve: ((value: boolean) => void) | null;
}

interface ConfirmActions {
  request: (options: ConfirmRequest) => Promise<boolean>;
  confirm: () => void;
  cancel: () => void;
}

const initialState: ConfirmState = {
  open: false,
  title: "",
  description: undefined,
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  variant: "default",
  resolve: null,
};

export const useConfirmStore = create<ConfirmState & ConfirmActions>((set, get) => ({
  ...initialState,

  request: (options) =>
    new Promise<boolean>((resolve) => {
      set({
        open: true,
        title: options.title,
        description: options.description,
        confirmLabel: options.confirmLabel ?? "Confirm",
        cancelLabel: options.cancelLabel ?? "Cancel",
        variant: options.variant ?? "default",
        resolve,
      });
    }),

  confirm: () => {
    get().resolve?.(true);
    set({ ...initialState });
  },

  cancel: () => {
    get().resolve?.(false);
    set({ ...initialState });
  },
}));
