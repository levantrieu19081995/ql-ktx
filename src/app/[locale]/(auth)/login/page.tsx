// src/app/(routes)/[locale]/login/page.tsx
"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  ActionIcon,
} from "@mantine/core";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  IconAlertCircle,
  IconLock,
  IconRefresh,
  IconShieldCheck,
  IconUser,
} from "@tabler/icons-react";
import logo from "@/assets/images/CTU_logo.png";

const BRAND_BLUE = "#5AA4E7";
const BRAND_RED = "#E2433E";

const taoMaCaptcha = () => {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return String(values[0] % 1_000_000).padStart(6, "0");
  }

  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
};

function LoginContent() {
  const router = useRouter();
  const locale = useLocale();
  const search = useSearchParams();
  const from = search?.get("from") || `/${locale}/dashboard`;

  const t = useTranslations("Login");
  const te = useTranslations("Login.errors");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaCode, setCaptchaCode] = useState(() => taoMaCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLoginErrorMessage = useCallback(
    (code?: string | null) => {
      if (!code) return te("generic");

      try {
        return te(code as any);
      } catch {
        return code;
      }
    },
    [te],
  );

  useEffect(() => {
    const qErr = search?.get("error");
    if (qErr) setError(getLoginErrorMessage(qErr));
  }, [getLoginErrorMessage, search]);

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
    setError(null);

    if (!captchaInput.trim()) {
      setError(te("requiredCaptcha"));
      return;
    }

    if (captchaInput.trim() !== captchaCode) {
      setError(te("captchaMismatch"));
      setCaptchaCode(taoMaCaptcha());
      setCaptchaInput("");
      return;
    }

    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        callbackUrl: from,
        username,
        password,
        captcha: captchaInput.trim(),
        captchaExpected: captchaCode,
      });

      if (!res) return setError(te("generic"));
      if (res.error) return setError(getLoginErrorMessage(res.error));
      router.replace(res.url ?? from);
    } catch (err: any) {
      setError(err?.message || te("generic"));
    } finally {
      setLoading(false);
    }
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

  const lamMoiCaptcha = () => {
    setCaptchaCode(taoMaCaptcha());
    setCaptchaInput("");
    setError(null);
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
            alt="Quản lý Ký túc xá"
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

            <Stack gap={8}>
              <Group justify="space-between" align="flex-end" gap="sm">
                <div style={{ flex: 1 }}>
                  <Text size="sm" fw={600} c="#334155" mb={6}>
                    {t("captcha")}
                  </Text>
                  <div className="captcha-box" aria-label={t("captchaCode")}>
                    {captchaCode.split("").map((so, index) => (
                      <span key={`${so}-${index}`} className="captcha-digit">
                        {so}
                      </span>
                    ))}
                  </div>
                </div>

                <ActionIcon
                  variant="light"
                  size={42}
                  color="blue"
                  onClick={lamMoiCaptcha}
                  aria-label={t("captchaRefresh")}
                >
                  <IconRefresh size={18} />
                </ActionIcon>
              </Group>

              <TextInput
                size="md"
                label={t("captchaInput")}
                placeholder={t("captchaInputPh")}
                value={captchaInput}
                onChange={(e) =>
                  setCaptchaInput(
                    e.currentTarget.value.replace(/\D/g, "").slice(0, 6),
                  )
                }
                required
                inputMode="numeric"
                maxLength={6}
                autoComplete="off"
                leftSection={<IconShieldCheck size={18} />}
                leftSectionPointerEvents="none"
                styles={{ label: { color: "#334155", fontWeight: 600 } }}
              />
            </Stack>

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
      <style
        dangerouslySetInnerHTML={{
          __html: `
.captcha-box {
  min-height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  background:
    linear-gradient(135deg, rgba(90,164,231,.10), rgba(226,67,62,.08)),
    repeating-linear-gradient(45deg, transparent 0 10px, rgba(15,23,42,.04) 10px 12px);
  user-select: none;
}

.captcha-digit {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(255,255,255,.72);
  color: #0f172a;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 1.1rem;
  font-weight: 800;
  box-shadow: inset 0 0 0 1px rgba(15,23,42,.06);
}
`,
        }}
      />
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
