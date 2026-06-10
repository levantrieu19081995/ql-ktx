// src/app/(routes)/[locale]/login/page.tsx
"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Paper,
  Stack,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Group,
  Divider,
  Alert,
} from "@mantine/core";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { IconAlertCircle, IconLock, IconUser } from "@tabler/icons-react";
import logo from "@/assets/images/logo.png";

const BRAND_BLUE = "#5AA4E7";
const BRAND_RED = "#E2433E";

function LoginContent() {
  const router = useRouter();
  const locale = useLocale();
  const search = useSearchParams();
  const from = search?.get("from") || `/${locale}/dashboard`;

  const t = useTranslations("Login");
  const te = useTranslations("Login.errors");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const qErr = search?.get("error");
    if (qErr) setError(te(qErr as any) || te("generic"));
  }, [search, te]);

  const whiteCard = useMemo(
    () => ({
      background: "#ffffff",
      border: "1px solid rgba(15,23,42,0.06)",
      boxShadow:
        "0 22px 60px -28px rgba(11,15,26,.45), 0 16px 40px -24px rgba(90,164,231,.25)",
      borderRadius: 18,
    }),
    [],
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      redirect: false,
      callbackUrl: from,
      username,
      password,
    });

    setLoading(false);
    if (!res) return setError(te("generic"));
    if (res.error) return setError((res.error as any) || te("generic"));
    router.replace(res.url ?? from);
  };

  const clearValidity: React.FormEventHandler<HTMLInputElement> = (e) => {
    e.currentTarget.setCustomValidity("");
  };

  const invalidUser: React.FormEventHandler<HTMLInputElement> = (e) => {
    const el = e.currentTarget;
    el.setCustomValidity(
      el.validity.tooShort
        ? te("minUsername", { count: el.minLength })
        : te("requiredUsername"),
    );
  };

  const invalidPass: React.FormEventHandler<HTMLInputElement> = (e) => {
    const el = e.currentTarget;
    el.setCustomValidity(
      el.validity.tooShort
        ? te("minPassword", { count: el.minLength })
        : te("requiredPassword"),
    );
  };

  return (
    <Paper
      radius={18}
      p="xl"
      w={480}
      withBorder
      style={whiteCard}
      className="login-card"
    >
      <Stack gap="lg">
        <Group justify="center">
          <Image
            src={logo}
            alt="Quản lý ký túc xá"
            width={120}
            height={120}
            priority
          />
        </Group>

        <Stack gap={4} align="center">
          <Title order={3} c="#0b0f1a">
            {t("title")}
          </Title>
          <Text size="sm" c="#475569" ta="center">
            {t("welcome")}
          </Text>
        </Stack>

        {error && (
          <Alert
            color="red"
            icon={<IconAlertCircle size={16} />}
            variant="light"
            styles={{ label: { fontWeight: 600 } }}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={onSubmit}>
          <Stack>
            <TextInput
              size="md"
              label={t("username")}
              placeholder={t("usernamePh")}
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
              required
              minLength={3}
              autoComplete="username"
              onInvalid={invalidUser}
              onInput={clearValidity}
              leftSection={<IconUser size={18} />}
              leftSectionPointerEvents="none"
              styles={{ label: { color: "#334155", fontWeight: 600 } }}
              autoFocus
            />

            <PasswordInput
              size="md"
              label={t("password")}
              placeholder={t("passwordPh")}
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
              minLength={6}
              autoComplete="current-password"
              onInvalid={invalidPass}
              onInput={clearValidity}
              leftSection={<IconLock size={18} />}
              leftSectionPointerEvents="none"
              styles={{ label: { color: "#334155", fontWeight: 600 } }}
            />

            <Button
              type="submit"
              size="md"
              loading={loading}
              styles={{
                root: {
                  background: `linear-gradient(90deg, ${BRAND_BLUE}, ${BRAND_RED})`,
                },
              }}
            >
              {t("submit")}
            </Button>

            <Divider
              label={
                <Text size="xs" c="#64748b">
                  {t("divider")}
                </Text>
              }
              color="#e5e7eb"
            />
          </Stack>
        </form>

        <Text size="xs" c="#64748b" ta="center">
          {t("forgot")}
        </Text>
      </Stack>
    </Paper>
  );
}

// Thêm Suspense wrapper để tránh lỗi build
export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
