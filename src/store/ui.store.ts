import { create } from "zustand";

interface UIStore {
  sidebarOpen: boolean;
  collabPanelOpen: boolean;
  activeTheme: "light";
  toggleSidebar: () => void;
  toggleCollabPanel: () => void;
  setCollabPanelOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  collabPanelOpen: false,
  activeTheme: "light",
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleCollabPanel: () =>
    set((s) => ({ collabPanelOpen: !s.collabPanelOpen })),
  setCollabPanelOpen: (open) => set({ collabPanelOpen: open }),
}));
