import { fetchClient } from "@/shared/api/instance";
import type { ApiSchema } from "@/shared/api/schema";
import { create } from "zustand";

type VisitsSessionState = {
  session: ApiSchema["SessionModel"] | null;
  setSession: (session: ApiSchema["SessionModel"]) => Promise<void>;
  fetchSession: () => void;
};

export const useVisitsSession = create<VisitsSessionState>((set) => ({
  session: null,
  setSession: async (session) => {
    set({ session: session });
  },
  fetchSession: () => {
    fetchClient
      .GET("/api/v1/visits/current")
      .then(({ data }) => set({ session: data ?? null }))
      .catch(() => set({ session: null }));
  },
}));
