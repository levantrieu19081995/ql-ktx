"use client";

export const dynamic = "force-dynamic";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Alert,
  Button,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconLock,
  IconRefresh,
  IconShieldCheck,
  IconUser,
} from "@tabler/icons-react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import logo from "@/assets/images/CTU_logo.png";
import { fetchCaptchaAPI } from "@/services/auth/authService";

const BRAND_BLUE = "#5AA4E7";
const BRAND_RED = "#E2433E";

async function removeWhiteBackground(base64: string) {
  return new Promise<string>((resolve) => {
    if (!base64) {
      resolve(base64);
      return;
    }

    const img = new window.Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(base64);
        return;
      }

      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (r > 240 && g > 240 && b > 240) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = () => {
      resolve(base64);
    };

    img.src = base64;
  });
}

function LoginContent() {
  const router = useRouter();
  const locale = useLocale();
  const search = useSearchParams();
  const from = search?.get("from") || `/${locale}/dashboard`;

  const t = useTranslations("Login");
  const te = useTranslations("Login.errors");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaGuid, setCaptchaGuid] = useState("");
  const [captchaUrl, setCaptchaUrl] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLoginErrorMessage = useCallback(
    (code?: string | null) => {
      if (!code) return te("generic");

      try {
        return te(code as never);
      } catch {
        return code;
      }
    },
    [te],
  );

  const loadCaptcha = useCallback(async () => {
    setCaptchaLoading(true);

    try {
      const captchaData = await fetchCaptchaAPI();
      const processedCaptchaUrl = await removeWhiteBackground(
        captchaData?.url || "",
      );
      setCaptchaGuid(captchaData?.guid || "");
      setCaptchaUrl(processedCaptchaUrl);
    } catch (err: any) {
      setCaptchaGuid("");
      setCaptchaUrl("");
      setError(err?.message || te("generic"));
    } finally {
      setCaptchaLoading(false);
    }
  }, [te]);

  useEffect(() => {
    const qErr = search?.get("error");
    if (qErr) setError(getLoginErrorMessage(qErr));
  }, [getLoginErrorMessage, search]);

  useEffect(() => {
    loadCaptcha();
  }, [loadCaptcha]);

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

    if (!captchaGuid) {
      setError(te("generic"));
      return;
    }

    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        callbackUrl: from,
        username,
        password,
        captchaGuid,
        captchaCode: captchaInput.trim(),
      });

      if (!res) {
        setError(te("generic"));
        return;
      }

      if (res.error) {
        await loadCaptcha();
        setCaptchaInput("");
        setError(getLoginErrorMessage(res.error));
        return;
      }

      router.replace(res.url ?? from);
    } catch (err: any) {
      await loadCaptcha();
      setCaptchaInput("");
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

  const refreshCaptcha = () => {
    setCaptchaInput("");
    setError(null);
    loadCaptcha();
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
            alt="Quan ly Ky tuc xa"
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
                    {captchaUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={captchaUrl}
                        alt={t("captchaCode")}
                        className="captcha-image"
                      />
                    ) : (
                      <Text size="sm" c="#64748b">
                        {captchaLoading ? "Loading..." : te("generic")}
                      </Text>
                    )}
                  </div>
                </div>

                <ActionIcon
                  variant="light"
                  size={42}
                  color="blue"
                  onClick={refreshCaptcha}
                  aria-label={t("captchaRefresh")}
                  loading={captchaLoading}
                >
                  <IconRefresh size={18} />
                </ActionIcon>
              </Group>

              <TextInput
                size="md"
                label={t("captchaInput")}
                placeholder={t("captchaInputPh")}
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.currentTarget.value)}
                required
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
              disabled={captchaLoading || !captchaGuid}
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
  min-height: 62px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  background:
    linear-gradient(135deg, rgba(90,164,231,.10), rgba(226,67,62,.08)),
    repeating-linear-gradient(45deg, transparent 0 10px, rgba(15,23,42,.04) 10px 12px);
  user-select: none;
  overflow: hidden;
}

.captcha-image {
  display: block;
  max-width: 100%;
  height: auto;
}
`,
        }}
      />
    </Paper>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
