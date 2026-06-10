"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Group,
  SimpleGrid,
  Stack,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { INFOR_THANHTOAN, GIA_THUPHI } from "@/constants/dataMagic";

import SettingSystemInfo from "./SettingSystemInfo";
import SettingPreview from "./SettingPreview";
import SettingPaymentInfo from "./SettingPaymentInfo";
import SettingFeeInfo from "./SettingFeeInfo";
import SettingExcelViewer from "./SettingExcelViewer";
import { useRouter } from "next/navigation";
type CompanySettings = {
  title: string;
  primaryColor: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  logoDataUrl?: string | null; // <= logo (base64) lưu localStorage
};

const STORAGE_KEY = "company_settings_v1";

const DEFAULT_SETTINGS: CompanySettings = {
  title: "QUẢN LÝ ĐĂNG KIỂM",
  primaryColor: "#4C6EF5",
  address: "Tòa nhà ABC, Quận 1, TP. HCM",
  phone: "+84 912 345 678",
  email: "contact@company.vn",
  description:
    "Nền tảng quản lý & lên lịch đăng đa kênh. Giúp đội ngũ của bạn vận hành truyền thông hiệu quả.",
  logoDataUrl: null,
};
type GiaThuPhi = typeof GIA_THUPHI;

export default function SettingPage() {
  const router = useRouter();
  const t = useTranslations("Settings");
  const [values, setValues] = useState<CompanySettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  const [paymentInfo, setPaymentInfo] = useState(INFOR_THANHTOAN);

  const [feeValues, setFeeValues] = useState<GiaThuPhi>(GIA_THUPHI);

  const previewColor = useMemo(
    () => values.primaryColor || "#4C6EF5",
    [values.primaryColor]
  );

  // load từ localStorage
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as CompanySettings;
        setValues({ ...DEFAULT_SETTINGS, ...parsed });
      } catch {
        /* ignore */
      }
    }
  }, []);

  return (
    <Stack gap="xl">
      {/* Header */}
      <Group justify="space-between">
        <Group>
          <ThemeIcon size={38} variant="light" color="indigo">
            <IconSettings size={20} />
          </ThemeIcon>
          <Title order={3}>{t("title")}</Title>
        </Group>
        <Group gap="xs">
          {saved && <Badge color="teal">Đã lưu... thay đổi hệ thống</Badge>}
        </Group>
      </Group>

      <Group>
        <Button
          color="blue"
          variant="light"
          onClick={() => router.push("/vi/settings/import")}
        >
          Thêm dữ liệu phương tiện từ Excel
        </Button>
      </Group>

      {/* Cầu hình thông tin hệ thông  */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <SettingSystemInfo
          values={values}
          onChange={(key, val) => setValues((s) => ({ ...s, [key]: val }))}
          setSaved={setSaved}
        />
        <SettingPreview values={values} previewColor={previewColor} />
      </SimpleGrid>

      {/* Cấu hình thanh toán */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <SettingPaymentInfo
          paymentInfo={paymentInfo}
          onChange={(key, val) => setPaymentInfo((s) => ({ ...s, [key]: val }))}
          setSaved={setSaved}
        />
        <SettingFeeInfo
          feeValues={feeValues}
          onChange={(key, val) => setFeeValues((s) => ({ ...s, [key]: val }))}
          setSaved={setSaved}
        />
      </SimpleGrid>
    </Stack>
  );
}
