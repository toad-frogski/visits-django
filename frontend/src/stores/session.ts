import { create } from "zustand";
import { type SessionModel } from "../lib/api";

type SessionState = {
  session: SessionModel | null;
  setSession: (session: SessionModel | null) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
}));
