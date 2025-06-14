import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  SessionApi,
  VisitsApi,
  type SessionModel,
  type UserModel,
} from "@/lib/api";
import client from "@/lib/api-client";

const sessionApi = new SessionApi(undefined, undefined, client);
const visitsApi = new VisitsApi(undefined, undefined, client);

type AuthState = {
  user?: UserModel | null;
  session: SessionModel | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  fetchSession: () => Promise<void>;
  setSession: (session: SessionModel | null) => void;
};

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,

      login: async (username, password) => {
        const { data } = await sessionApi.login({ username, password });
        set({ user: data });
      },

      logout: async () => {
        await sessionApi.logout();
        set({ user: null });
        set({ session: null });
      },

      fetchUser: async () => {
        try {
          const { data } = await sessionApi.me();
          set({ user: data });
        } catch {
          set({ user: null });
        }
      },

      fetchSession: async () => {
        try {
          const { data } = await visitsApi.current();
          set({ session: data });
        } catch {}
      },

      setSession: (session) => set({ session }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export default useAuthStore;
