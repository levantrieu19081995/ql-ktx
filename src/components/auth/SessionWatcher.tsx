"use client";

import { Button, Group, Modal, Stack, Text, ThemeIcon } from "@mantine/core";
import { useSessionStore } from "@/context/sessionStore";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { IconAlertTriangle } from "@tabler/icons-react";
import { refreshTokenAPI } from "@/services/auth/authService";

export default function SessionWatcher({
  title,
  message,
  reloginLabel,
  continueLabel,
}: {
  title: string;
  message: string;
  reloginLabel: string;
  continueLabel: string;
}) {
  const isExpired = useSessionStore((s) => s.isExpired);
  const setIsExpired = useSessionStore((s) => s.setIsExpired);
  const setTokens = useSessionStore((s) => s.setTokens);
  const router = useRouter();

  const logout = async () => {
    setIsExpired(false);

    const currentPath = `${window.location.pathname}${window.location.search}`;
    const parts = window.location.pathname.split("/");
    const locale = parts[1] || "vi";

    await signOut({
      callbackUrl: `/${locale}/login?from=${encodeURIComponent(currentPath)}`,
    });
  };

  const continueSession = async () => {
    const oldRefresh = useSessionStore.getState().refreshToken;
    if (!oldRefresh) return logout();

    try {
      const data = await refreshTokenAPI(oldRefresh);

      const result = await signIn("credentials", {
        redirect: false,
        username: "REFRESH_MODE",
        password: "REFRESH_MODE",
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expired: data.expired,
      });

      if (result?.error) {
        return logout();
      }

      setTokens(data.access_token, data.refresh_token, data.expired);
      setIsExpired(false);

      router.refresh();
      window.location.reload();
    } catch (error) {
      console.error("Continue session failed:", error);
      await logout();
    }
  };

  return (
    <Modal opened={isExpired} centered withCloseButton={false} onClose={() => {}}>
      <Stack align="center">
        <ThemeIcon color="yellow" size={64}>
          <IconAlertTriangle size={32} />
        </ThemeIcon>

        <Text fw={600}>{title}</Text>
        <Text c="dimmed">{message}</Text>

        <Group>
          <Button variant="outline" onClick={logout}>
            {reloginLabel}
          </Button>
          <Button onClick={continueSession}>{continueLabel}</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
