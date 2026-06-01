import { create } from "zustand";
import type { Item } from "@/types/board.types";

export interface ItemModalState {
  open: boolean;
  itemId?: string;
  boardId?: string;
  /** Item data from the grid click — avoids showing a stale cached item while loading */
  snapshot?: Item;
  readOnly?: boolean;
  curatorLabel?: string;
}

interface ModalStore {
  saveModal: { open: boolean; boardId?: string };
  itemModal: ItemModalState;
  createBoardModal: boolean;
  inviteModal: { open: boolean; boardId?: string };
  openSaveModal: (boardId?: string) => void;
  openItemModal: (
    itemId: string,
    options?: {
      snapshot?: Item;
      boardId?: string;
      readOnly?: boolean;
      curatorLabel?: string;
    },
  ) => void;
  openCreateBoard: () => void;
  openInviteModal: (boardId: string) => void;
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
        curatorLabel: options?.curatorLabel,
      },
    }),
  openCreateBoard: () => set({ createBoardModal: true }),
  openInviteModal: (boardId) =>
    set({ inviteModal: { open: true, boardId } }),
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
    }),
}));
