import { create } from "zustand";

interface AppState {
  clinics: any[];
  setClinics: (clinics: any[]) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  clinics: [],
  setClinics: (clinics) => set({ clinics }),
  activeTab: "dashboard",
  setActiveTab: (activeTab) => set({ activeTab }),
}));
