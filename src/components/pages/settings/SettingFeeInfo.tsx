/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { showNoti } from "@/components/common/showNoti";
import {
  fetchConfigFee,
  updateConfigFee,
} from "@/services/setting/settinFeeInfoService";

import {
  Card,
  Title,
  Stack,
  SimpleGrid,
  TextInput,
  Button,
  Group,
} from "@mantine/core";
import { IconPercentage, IconDeviceFloppy } from "@tabler/icons-react";
import { useEffect, useState } from "react";

type Props = {
  feeValues: any;
  onChange: (key: string, val: any) => void;
  setSaved: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function SettingFeeInfo({
  feeValues,
  onChange,
  setSaved,
}: Props) {
  const [fee, setFee] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(false);

  const getConfigFeeInfoSimple = async () => {
    try {
      const configPaymentData = await fetchConfigFee();

      // Duyệt mảng payload
      const filteredData = configPaymentData.payload.reduce(
        (acc: any, item: any) => {
          if (!item?.key) return acc;
          const key = item.key;
          const value = item.value ?? "";

          switch (key) {
            case "qldk.ti-le-thue-suat":
              acc.tiLeThueSuat = { configId: item.configId, value };
              break;
          }

          return acc;
        },
        {} as Record<string, any>
      );

      setFee(filteredData);

      if (filteredData.tiLeThueSuat)
        onChange("tiLeThueSuat", filteredData.tiLeThueSuat.value);
    } catch (error) {
      console.error("Lỗi khi lấy config thanh toán:", error);
    }
  };

  async function handleSaveFeeConfig() {
    setLoading(true);
    setSaved(true);
    const payload = Object.entries(feeValues).map(([key, value]) => {
      const configItem = (fee as any)?.[key];
      return {
        configId: configItem?.configId ?? null,
        value: String(value ?? ""),
        organizationId: 1,
      };
    });

    const validPayload = payload.filter((i) => i.configId !== null);

    try {
      const response = await updateConfigFee(validPayload);
      console.log("Lưu cấu hình thu phí thành công:", response);
    } catch (error) {
      console.error("Lỗi khi lưu thu phi:", error);
      showNoti("warning", "Cập nhật thông tin thu phí thất bại!");
    } finally {
      setTimeout(() => {
        setLoading(false);
        setSaved(false);
        showNoti("success", "Cập nhật thông tin thu phí thành công!");
      }, 2000);
    }
  }

  useEffect(() => {
    getConfigFeeInfoSimple();
  }, []);

  return (
    <Card withBorder>
      <Title order={5} mb="md">
        Thông tin thu phí
      </Title>

      <Stack gap="xs">
        <SimpleGrid cols={{ base: 1, sm: 1 }} spacing="md">
          <TextInput
            type="number"
            label="Thuế suất (%)"
            placeholder="VD: 10"
            leftSection={<IconPercentage size={16} />}
            value={feeValues.tiLeThueSuat}
            onChange={(e) => onChange("tiLeThueSuat", e.currentTarget.value)}
          />
        </SimpleGrid>
      </Stack>

      <Group gap="xs" mt={20} justify="flex-end">
        <Button
          leftSection={<IconDeviceFloppy size={16} />}
          onClick={handleSaveFeeConfig}
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
