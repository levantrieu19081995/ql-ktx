/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  Card,
  Title,
  Grid,
  TextInput,
  ColorInput,
  Textarea,
  Button,
  Group,
  Stack,
  Box,
  Image,
  Avatar,
  FileButton,
  Text,
} from "@mantine/core";
import {
  IconBuildingSkyscraper,
  IconMail,
  IconPhone,
  IconMapPin,
  IconHeartFilled,
  IconUpload,
  IconTrash,
  IconDeviceFloppy,
  IconPalette,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { ViewConfigData } from "@/types/global";
import {
  fetchConfigSystem,
  updateConfigSystem,
} from "@/services/setting/settingSystemInfoService";
import { showNoti } from "@/components/common/showNoti";
import logo from "@/assets/images/logo.png";
import { useSessionStore } from "@/context/sessionStore";
// ----------------------------- TYPES -----------------------------
export type CompanySettings = {
  title: string;
  primaryColor: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  logoDataUrl?: string | null; // logo base64 hoặc URL
};

type Props = {
  values: CompanySettings;
  onChange: (key: keyof CompanySettings, val: any) => void;
  setSaved: React.Dispatch<React.SetStateAction<boolean>>;
};

// ----------------------------- COMPONENT -----------------------------
export default function SettingSystemInfo({
  onChange,
  values,
  setSaved,
}: Props) {
  const [errors, setErrors] = useState<
    Partial<Record<keyof CompanySettings, string>>
  >({});
  const [config, setConfig] = useState<ViewConfigData | null>(null);
  const [loading, setLoading] = useState(false);
  const fallbackLogo = "/images/logo.png";
  // ----------------------------- LOGO HANDLERS -----------------------------
  async function handleLogoFile(file?: File | null) {
    if (!file) return;
    if (file.size > 1_500_000) {
      setErrors((e) => ({
        ...e,
        logoDataUrl: "Logo quá lớn, vui lòng chọn < 1.5MB",
      }));
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });

    setErrors((e) => ({ ...e, logoDataUrl: undefined }));
    onChange("logoDataUrl", dataUrl);
  }

  function removeLogo() {
    onChange("logoDataUrl", null);
  }

  // ----------------------------- SAVE CONFIG -----------------------------
  async function handleSaveConfigSystem() {
    setLoading(true);
    setSaved(true);
    try {
      const dataToSend = [
        {
          configId: (config as any)?.title?.configId ?? null,
          value: String(values.title ?? ""),
        },
        {
          configId: (config as any)?.color?.configId ?? null,
          value: String(values.primaryColor ?? ""),
        },
        {
          configId: (config as any)?.email?.configId ?? null,
          value: String(values.email ?? ""),
        },
        {
          configId: (config as any)?.phone?.configId ?? null,
          value: String(values.phone ?? ""),
        },
        {
          configId: (config as any)?.address?.configId ?? null,
          value: String(values.address ?? ""),
        },
        {
          configId: (config as any)?.description?.configId ?? null,
          value: String(values.description ?? ""),
        },
        {
          configId: (config as any)?.logo?.configId ?? null,
          value: String(values.logoDataUrl ?? ""),
        },
      ].filter((i) => i.configId !== null);

      if (dataToSend.length === 0) {
        console.warn("Không có dữ liệu hợp lệ để lưu");
        return;
      }

      const response = await updateConfigSystem(dataToSend);
      console.log("Cập nhật thành công:", response);
    } catch (error) {
      console.error("Lỗi khi lưu config:", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setSaved(false);
        showNoti("success", "Cập nhật thông tin hệ thống thành công!");
      }, 2000);
    }
  }

  // ----------------------------- FETCH CONFIG -----------------------------
  const getConfigSystemIndexSimple = async () => {
    try {
      const configData = await fetchConfigSystem();
      const filteredData = configData.payload.reduce((acc: any, item: any) => {
        if (!item?.config) return acc;
        const key = item.config.key;
        const id = item.config.id;
        const value = item.value ?? "";

        switch (key) {
          case "app.name":
            acc.title = { configId: id, value };
            break;
          case "app.color":
            acc.color = { configId: id, value };
            break;
          case "app.emailaddress":
            acc.email = { configId: id, value };
            break;
          case "app.tel":
            acc.phone = { configId: id, value };
            break;
          case "app.address":
            acc.address = { configId: id, value };
            break;
          case "app.description":
            acc.description = { configId: id, value };
            break;
          case "app.logo":
            acc.logo = { configId: id, value };
            break;
        }
        return acc;
      }, {});

      setConfig(filteredData);

      if (filteredData.title) onChange("title", filteredData.title.value);
      if (filteredData.color)
        onChange("primaryColor", filteredData.color.value);
      if (filteredData.email) onChange("email", filteredData.email.value);
      if (filteredData.phone) onChange("phone", filteredData.phone.value);
      if (filteredData.address) onChange("address", filteredData.address.value);
      if (filteredData.description)
        onChange("description", filteredData.description.value);
      if (filteredData.logo) onChange("logoDataUrl", filteredData.logo.value);
    } catch (error) {
      console.error("Lỗi khi lấy config:", error);
    }
  };

  const { accessToken, isHydrated } = useSessionStore();

  useEffect(() => {
    console.log("[RUN_LOG] ===> SystemIndexSimple accessToken : ", accessToken);
    console.log("[RUN_LOG] ===> SystemIndexSimple  isHydrated : ", isHydrated);

    if (!isHydrated) return;
    if (!accessToken) return;

    getConfigSystemIndexSimple();
  }, [isHydrated, accessToken]);

  // ----------------------------- UI -----------------------------
  return (
    <Card withBorder>
      <Title order={5} mb="md">
        Thông tin hiển thị
      </Title>

      <Grid gutter="md">
        <Grid.Col span={12}>
          <TextInput
            withAsterisk
            label="Tên (Title)"
            placeholder="VD: QUẢN LÝ ĐĂNG KIỂM"
            leftSection={<IconBuildingSkyscraper size={16} />}
            value={values.title}
            onChange={(e) => onChange("title", e.currentTarget.value)}
            error={errors.title}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6 }}>
          <ColorInput
            withAsterisk
            label="Màu chủ đạo"
            placeholder="#4C6EF5"
            leftSection={<IconPalette size={16} />}
            value={values.primaryColor}
            onChange={(color) => onChange("primaryColor", color)}
            error={errors.primaryColor}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            withAsterisk
            label="Email"
            placeholder="contact@company.vn"
            leftSection={<IconMail size={16} />}
            value={values.email}
            onChange={(e) => onChange("email", e.currentTarget.value)}
            error={errors.email}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            withAsterisk
            label="Số điện thoại"
            placeholder="+84 912 345 678"
            leftSection={<IconPhone size={16} />}
            value={values.phone}
            onChange={(e) => onChange("phone", e.currentTarget.value)}
            error={errors.phone}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            withAsterisk
            label="Địa chỉ"
            placeholder="Tòa nhà ABC, Quận 1, TP. HCM"
            leftSection={<IconMapPin size={16} />}
            value={values.address}
            onChange={(e) => onChange("address", e.currentTarget.value)}
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <Textarea
            label="Mô tả"
            placeholder="Mô tả ngắn về công ty / hệ thống…"
            autosize
            minRows={3}
            leftSection={<IconHeartFilled size={16} />}
            value={values.description}
            onChange={(e) => onChange("description", e.currentTarget.value)}
          />
        </Grid.Col>

        {/* Logo */}
        <Grid.Col span={12}>
          <Stack gap="xs">
            <Group justify="space-between">
              <Text fw={600}>
                Logo công ty <span style={{ color: "red" }}>*</span>
              </Text>
              <Text size="xs" c="dimmed">
                Khuyên dùng PNG, nền trong suốt, &lt; 1.5MB
              </Text>
            </Group>

            <Group align="flex-start" gap="lg" wrap="nowrap">
              <Box>
                {values.logoDataUrl ? (
                  <Image
                    src={values.logoDataUrl}
                    alt="Logo preview"
                    radius="md"
                    w={96}
                    h={96}
                    fit="contain"
                  />
                ) : fallbackLogo ? (
                  <Image
                    src={fallbackLogo}
                    alt="Default logo"
                    radius="md"
                    w={96}
                    h={96}
                    fit="contain"
                  />
                ) : (
                  <Avatar size={96} radius="md" variant="filled" color="gray">
                    {values.title?.slice(0, 2).toUpperCase()}
                  </Avatar>
                )}
              </Box>

              <Stack gap="sm">
                <Group gap="xs">
                  <FileButton
                    onChange={handleLogoFile}
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  >
                    {(props) => (
                      <Button {...props} leftSection={<IconUpload size={16} />}>
                        Chọn logo
                      </Button>
                    )}
                  </FileButton>
                  {values.logoDataUrl && (
                    <Button
                      variant="light"
                      color="red"
                      leftSection={<IconTrash size={16} />}
                      onClick={removeLogo}
                    >
                      Xóa logo
                    </Button>
                  )}
                </Group>
                {errors.logoDataUrl && (
                  <Text size="sm" c="red">
                    {errors.logoDataUrl}
                  </Text>
                )}
              </Stack>
            </Group>
          </Stack>
        </Grid.Col>
      </Grid>

      <Group justify="flex-end" mt="md">
        {/* <Button
          variant="light"
          leftSection={<IconReload size={16} />}
          onClick={onReset}
        >
          Reset mặc định
        </Button> */}

        <Button
          leftSection={<IconDeviceFloppy size={16} />}
          onClick={handleSaveConfigSystem}
          disabled={loading}
          //   loading={loading} // Hiện spinner ở giữa
        >
          {loading ? (
            <Group gap={6}>
              <div
                className="mantine-Loader-root"
                style={{ width: 16, height: 16 }}
              />
              <span>Đang lưu...</span>
            </Group>
          ) : (
            "Lưu thay đổi"
          )}
        </Button>
      </Group>
    </Card>
  );
}
