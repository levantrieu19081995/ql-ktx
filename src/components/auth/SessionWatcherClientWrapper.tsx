/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSessionStore } from "@/context/sessionStore";

export default function SessionWatcherClientWrapper() {
  const { data: session } = useSession();
  const setSession = useSessionStore((s) => s.setSession);
  const setHydrated = useSessionStore((s) => s.setHydrated);

  useEffect(() => {
    if (!session) return;

    setSession({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expired: session.expired, // đúng
    });

    setHydrated();
  }, [session]);

  return null;
}
