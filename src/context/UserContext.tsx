"use client";
//src\context\UserContext.tsx
import { createContext, useContext, ReactNode } from "react";
import { useSession } from "next-auth/react";

type Permission = {
  dmcnId: number;
  dmcnSlug: string;
  listPermission: { psName: string; allowed: boolean }[];
};

type User = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string | number | null;
  guid?: string | null;
  organizations?: any;
  caNhan?: any;
  username?: any;
  permissions?: Permission[] | { payload?: Permission[] };
  ten?: string | null;
  organizationGuid?: string | null;
};

type UserContextType = {
  user: User | null;
  isAuthenticated: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const user: User | null = session?.user || null;
  const isAuthenticated = status === "authenticated";

  return (
    <UserContext.Provider value={{ user, isAuthenticated }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
