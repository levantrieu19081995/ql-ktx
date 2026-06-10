"use client";

import { Modal, Button, Text, Group, Stack, ThemeIcon } from "@mantine/core";
import { useSessionStore } from "@/context/sessionStore";
import { signIn, signOut } from "next-auth/react";
import { IconAlertTriangle } from "@tabler/icons-react";
import { fetchUserAPI, refreshTokenAPI } from "@/services/auth/authService";

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
  const expired = useSessionStore((s) => s.expired);
  // const setExpired = useSessionStore((s) => s.setExpired);
  // const setAccessToken = useSessionStore((s) => s.setAccessToken);
  // const setRefreshToken = useSessionStore((s) => s.setRefreshToken);
  const isExpired = useSessionStore((s) => s.isExpired);
  const setIsExpired = useSessionStore((s) => s.setIsExpired);
  const setTokens = useSessionStore((s) => s.setTokens);

  const logout = async () => {
    setIsExpired(false);
    await signOut({ callbackUrl: "/" });
  };

  const continueSession = async () => {
    const oldRefresh = useSessionStore.getState().refreshToken;
    if (!oldRefresh) return logout();

    const data = await refreshTokenAPI(oldRefresh);

    // GỌI LẠI USER INFO BẰNG TOKEN MỚI
    const userInfo = await fetchUserAPI(data.access_token);
    // update store
    setTokens(data.access_token, data.refresh_token, data.expired);
    setIsExpired(false);

    // update NextAuth JWT
    await signIn("credentials", {
      redirect: false,
      username: "REFRESH_MODE",
      password: "REFRESH_MODE",
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expired: data.expired,
      user: JSON.stringify(userInfo),
    });
  };

  return (
    <Modal
      opened={isExpired}
      centered
      withCloseButton={false}
      onClose={function (): void {
        throw new Error("Function not implemented.");
      }}
    >
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
