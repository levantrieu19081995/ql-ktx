"use client";
// src\app\[locale]\no-permission\page.tsx
import { Button, Center, Stack, Title, Text } from "@mantine/core";
import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";

export default function NoPermissionPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("NoPermission");

  return (
    <Center h="100vh">
      <Stack align="center" gap="md">
        <Title order={2}>🚫 {t("title")}</Title>
        <Text c="dimmed">{t("message")}</Text>
        {/* <Button onClick={() => router.push(`/${locale}/dashboard`)}> */}
        <Button onClick={() => router.push(`/dashboard`)}>
          {t("backHome")}
        </Button>
      </Stack>
    </Center>
  );
}
