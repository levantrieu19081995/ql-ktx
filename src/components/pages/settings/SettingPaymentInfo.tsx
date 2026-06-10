/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { showNoti } from "@/components/common/showNoti";

import {
  fetchConfigPayment,
  updateConfigPayment,
} from "@/services/setting/settinPaymentInfoService";
import {
  Card,
  Title,
  Stack,
  TextInput,
  Textarea,
  Button,
  Group,
} from "@mantine/core";
import {
  IconBuildingSkyscraper,
  IconCreditCard,
  IconSettings,
  IconMapPin,
  IconInfoCircle,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

type Props = {
  paymentInfo: any;
  onChange: (key: string, val: any) => void;
  setSaved: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function SettingPaymentInfo({
  paymentInfo,
  onChange,
  setSaved,
}: Props) {
  const [payment, setPayment] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(false);
  const getConfigPaymentSimple = async () => {
    try {
      const configPaymentData = await fetchConfigPayment();

      // Duyệt mảng payload
      const filteredData = configPaymentData.payload.reduce(
        (acc: any, item: any) => {
          if (!item?.key) return acc;
          const key = item.key;
          const value = item.value ?? "";

          switch (key) {
            case "qldk.ho-ten-chu-tai-khoan":
              acc.hoTenTaiKhoanThuHuong = { configId: item.configId, value };
              break;
            case "qldk.so-tai-khoan-ngan-hang":
              acc.soTaiKhoanThuHuong = { configId: item.configId, value };
              break;
            case "qldk.ma-bin-ngan-hang":
              acc.maNganHang = { configId: item.configId, value };
              break;
            case "qldk.dia-chi-mac-dinh":
              acc.chiNhanhNganHang = { configId: item.configId, value };
              break;
            // Thêm nếu có key khác cần
          }

          return acc;
        },
        {} as Record<string, any>
      );

      setPayment(filteredData);

      // Gán giá trị vào state cha (preview)
      if (filteredData.hoTenTaiKhoanThuHuong)
        onChange(
          "hoTenTaiKhoanThuHuong",
          filteredData.hoTenTaiKhoanThuHuong.value
        );
      if (filteredData.soTaiKhoanThuHuong)
        onChange("soTaiKhoanThuHuong", filteredData.soTaiKhoanThuHuong.value);
      if (filteredData.maNganHang)
        onChange("maNganHang", filteredData.maNganHang.value);
      if (filteredData.chiNhanhNganHang)
        onChange("chiNhanhNganHang", filteredData.chiNhanhNganHang.value);
    } catch (error) {
      console.error("Lỗi khi lấy config thanh toán:", error);
    }
  };

  async function handleSavePaymentConfig() {
    setLoading(true);
    setSaved(true);
    const payload = Object.entries(paymentInfo).map(([key, value]) => {
      const configItem = (payment as any)?.[key];
      return {
        configId: configItem?.configId ?? null,
        value: String(value ?? ""),
        organizationId: 1,
      };
    });

    const validPayload = payload.filter((i) => i.configId !== null);

    try {
      //   const response = await updateConfigSystem(validPayload);
      const response = await updateConfigPayment(validPayload);
      console.log("Lưu cấu hình thanh toán thành công:", response);
    } catch (error) {
      console.error("Lỗi khi lưu thanh toán:", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setSaved(false);
        showNoti("success", "Cập nhật thông tin thanh toán thành công!");
      }, 2000);
    }
  }

  useEffect(() => {
    getConfigPaymentSimple();
  }, []);

  return (
    <Card withBorder>
      <Title order={5} mb="md">
        Thông tin thanh toán
      </Title>

      <Stack gap="xs">
        <TextInput
          label="Tên tài khoản thụ hưởng"
          placeholder="Nguyễn Văn A"
          leftSection={<IconBuildingSkyscraper size={16} />}
          value={paymentInfo.hoTenTaiKhoanThuHuong || ""}
          onChange={(e) =>
            onChange("hoTenTaiKhoanThuHuong", e.currentTarget.value)
          }
        />

        <TextInput
          label="Số tài khoản"
          placeholder="0123456789"
          leftSection={<IconCreditCard size={16} />}
          value={paymentInfo.soTaiKhoanThuHuong || ""}
          onChange={(e) =>
            onChange("soTaiKhoanThuHuong", e.currentTarget.value)
          }
        />

        <TextInput
          label="Mã ngân hàng"
          placeholder="VCB / BIDV / ACB..."
          leftSection={<IconSettings size={16} />}
          value={paymentInfo.maNganHang || ""}
          onChange={(e) => onChange("maNganHang", e.currentTarget.value)}
        />

        <TextInput
          label="Chi nhánh ngân hàng"
          placeholder="TP. HCM"
          leftSection={<IconMapPin size={16} />}
          value={paymentInfo.chiNhanhNganHang || ""}
          onChange={(e) => onChange("chiNhanhNganHang", e.currentTarget.value)}
        />

        <Textarea
          label="Ghi chú thanh toán"
          placeholder="Ví dụ: Chỉ sử dụng cho thanh toán nội bộ"
          autosize
          minRows={2}
          leftSection={<IconInfoCircle size={16} />}
          value={paymentInfo.ghiChuThanhToan || ""}
          onChange={(e) => onChange("ghiChuThanhToan", e.currentTarget.value)}
        />
      </Stack>

      <Group gap="xs" mt={20} justify="flex-end">
        <Button
          leftSection={<IconDeviceFloppy size={16} />}
          onClick={handleSavePaymentConfig}
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
