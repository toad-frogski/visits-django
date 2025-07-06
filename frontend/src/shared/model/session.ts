import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type ApiSchema } from "@/shared/api/schema";
import { publicFetchClient } from "@/shared/api/instance";

type SessionState = {
  user?: ApiSchema["UserModel"];
  setUser: (user: ApiSchema["UserModel"]) => Promise<void>;
  clearUser: () => Promise<void>;
  fetchUser: () => Promise<void>;
};

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      user: undefined,

      setUser: async (user: ApiSchema["UserModel"]) => set({ user }),
      clearUser: async () => set({ user: undefined }),
      fetchUser: async () => {
        publicFetchClient
          .GET("/api/v1/session/me")
          .then(({ data }) => {
            set({ user: data });
          })
          .catch(() => {
            set({ user: undefined });
          });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
