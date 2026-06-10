import { create } from "zustand";

// interface SessionState {
//   accessToken: string | null;
//   refreshToken: string | null;
//   expired: number | null;
//   isHydrated: boolean;
//   setSession: (data: any) => void;
//   clear: () => void;
//   setHydrated: () => void;
// }

 
interface SessionState {
  accessToken: string | null;
  refreshToken: string | null;
  expired: number | null;   // timestamp ms
  isExpired: boolean;       // dùng để bật modal
  isHydrated: boolean;

  setSession: (data: any) => void;
  setTokens: (access: string, refresh: string, expired: number) => void;
  setIsExpired: (v: boolean) => void;
  clear: () => void;
  setHydrated: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  accessToken: null,
  refreshToken: null,
  expired: null,
  isExpired: false,
  isHydrated: false,

  setSession: (data) =>
    set({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expired: data.expired,
      isExpired: false,
    }),

  setTokens: (access, refresh, expired) =>
    set({
      accessToken: access,
      refreshToken: refresh,
      expired,
      isExpired: false,
    }),

  setIsExpired: (v) => set({ isExpired: v }),

  clear: () =>
    set({
      accessToken: null,
      refreshToken: null,
      expired: null,
      isExpired: false,
    }),

  setHydrated: () => set({ isHydrated: true }),
}));
