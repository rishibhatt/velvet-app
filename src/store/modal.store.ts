import { create } from "zustand";

interface ModalStore {
  saveModal: { open: boolean; boardId?: string };
  itemModal: { open: boolean; itemId?: string };
  createBoardModal: boolean;
  inviteModal: { open: boolean; boardId?: string };
  openSaveModal: (boardId?: string) => void;
  openItemModal: (itemId: string) => void;
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
  openItemModal: (itemId) =>
    set({ itemModal: { open: true, itemId } }),
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
