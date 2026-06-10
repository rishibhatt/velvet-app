import { create } from "zustand";
import type { Item } from "@/types/board.types";

export interface ItemModalState {
  open: boolean;
  itemId?: string;
  boardId?: string;
  /** Item data from the grid click — avoids showing a stale cached item while loading */
  snapshot?: Item;
  readOnly?: boolean;
  canEdit?: boolean;
  startEditing?: boolean;
  curatorLabel?: string;
}

export interface ShareSheetState {
  open: boolean;
  url?: string;
  title?: string;
  text?: string;
  imageUrl?: string | null;
  imageUrls?: string[];
  eyebrow?: string;
}

interface ModalStore {
  saveModal: { open: boolean; boardId?: string };
  itemModal: ItemModalState;
  createBoardModal: boolean;
  inviteModal: { open: boolean; boardId?: string };
  shareSheet: ShareSheetState;
  openSaveModal: (boardId?: string) => void;
  openItemModal: (
    itemId: string,
    options?: {
      snapshot?: Item;
      boardId?: string;
      readOnly?: boolean;
      canEdit?: boolean;
      startEditing?: boolean;
      curatorLabel?: string;
    },
  ) => void;
  openCreateBoard: () => void;
  openInviteModal: (boardId: string) => void;
  openShareSheet: (payload: Omit<ShareSheetState, "open">) => void;
  closeShareSheet: () => void;
  closeSaveModal: () => void;
  closeItemModal: () => void;
  closeCreateBoard: () => void;
  closeInviteModal: () => void;
  closeAll: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  saveModal: { open: false },
  itemModal: { open: false },
  createBoardModal: false,
  inviteModal: { open: false },
  shareSheet: { open: false },
  openSaveModal: (boardId) =>
    set({ saveModal: { open: true, boardId } }),
  openItemModal: (itemId, options) =>
    set({
      itemModal: {
        open: true,
        itemId,
        boardId: options?.boardId ?? options?.snapshot?.board_id,
        snapshot: options?.snapshot,
        readOnly: options?.readOnly,
        canEdit: options?.canEdit,
        startEditing: options?.startEditing,
        curatorLabel: options?.curatorLabel,
      },
    }),
  openCreateBoard: () => set({ createBoardModal: true }),
  openInviteModal: (boardId) =>
    set({ inviteModal: { open: true, boardId } }),
  openShareSheet: (payload) =>
    set({ shareSheet: { open: true, ...payload } }),
  closeShareSheet: () => set({ shareSheet: { open: false } }),
  closeSaveModal: () => set({ saveModal: { open: false } }),
  closeItemModal: () => set({ itemModal: { open: false } }),
  closeCreateBoard: () => set({ createBoardModal: false }),
  closeInviteModal: () => set({ inviteModal: { open: false } }),
  closeAll: () =>
    set({
      saveModal: { open: false },
      itemModal: { open: false },
      createBoardModal: false,
      inviteModal: { open: false },
      shareSheet: { open: false },
    }),
}));
