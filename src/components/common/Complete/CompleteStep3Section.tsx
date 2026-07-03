/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  Title,
  Button,
  Group,
  Flex,
  ThemeIcon,
  Card,
  Stack,
  Text,
  Divider,
  Box,
  Loader,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchConfigPayment } from "@/services/setting/settinPaymentInfoService";
// import { HoSoPhiDichVuQuery } from "@/types/global";
import { useUser } from "@/context/UserContext";
// import { fetchListHoSoPhiDichVu } from "@/services/ho-so-phu-dich-vu/hoSoPhiDichVuService";
import dayjs from "dayjs";
import { useLocale } from "next-intl";

type Props = {
  result: any;
  paymentInfo?: any;
  setResult: (data: any) => void;
};

export default function CompleteSection({
  result,
  paymentInfo,
  setResult,
}: Props) {
  const [payment, setPayment] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [listPhi, setListPhi] = useState<any[]>([]);
  const router = useRouter();
  const { user } = useUser();
  const locale = useLocale();

  const tongTien = listPhi.reduce(
    (sum: number, item: any) => sum + (item.phiThucTe || 0),
    0,
  );

  // Fallback tài khoản thụ hưởng mặc định
  const account = payment || {
    ten: "Diep Ngo Minh Khoi",
    soTaiKhoan: "1013001940",
    maNganHang: "970436",
  };

  // Thông tin chủ phương tiện lấy từ result
  const ownerInfo = {
    tenChuXe: result?.tenChuXe || "—",
    ttptBienkiemsoat: result?.ttptBienkiemsoat || "—",
    Cccd: result?.ttcptCccd || "—",
    ttcptSodienthoai: result?.ttcptSodienthoai || "—",
    ngayTiepNhan: result?.ngayTiepNhan
      ? dayjs(result.ngayTiepNhan).format("DD/MM/YYYY")
      : "—",
    loaiXe: result?.ttptTen || "—",
    maHoSo: result?.hsMa || "—",
  };

  // Lấy danh sách phí dịch vụ theo hồ sơ ID
  const _fetchListHoSoPhiDichVu = async () => {
    if (!result?.hsId) return;
    setLoading(true);
    try {
      // const params: HoSoPhiDichVuQuery = {
      const params: any = {
        page: 1,
        pageSize: 500,
        userIdTiepNhan: String(user?.guid),
        hsId: result.hsId,
      };

      // const response = await fetchListHoSoPhiDichVu(params);
      const response = null;
      setListPhi([]);
      // if (response?.status === "OK") {
      //   const list = response.payload?.items || [];
      //   setListPhi(list);
      // } else {
      //   setListPhi([]);
      // }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách hồ sơ phí dịch vụ:", error);
      setListPhi([]);
    } finally {
      setLoading(false);
    }
  };

  // Lấy config thông tin tài khoản thụ hưởng
  const getConfigPaymentSimple = async () => {
    try {
      const configPaymentData = await fetchConfigPayment();
      const filteredData = configPaymentData.payload.reduce(
        (acc: any, item: any) => {
          if (!item?.key) return acc;
          const key = item.key;
          const value = item.value ?? "";

          switch (key) {
            case "qldk.ho-ten-chu-tai-khoan":
              acc.ten = value;
              break;
            case "qldk.so-tai-khoan-ngan-hang":
              acc.soTaiKhoan = value;
              break;
            case "qldk.ma-bin-ngan-hang":
              acc.maNganHang = value;
              break;
            case "qldk.dia-chi-mac-dinh":
              acc.chiNhanhNganHang = value;
              break;
          }

          return acc;
        },
        {},
      );
      setPayment(filteredData);
    } catch (error) {
      console.error("Lỗi khi lấy config thanh toán:", error);
    }
  };

  useEffect(() => {
    getConfigPaymentSimple();
  }, []);

  useEffect(() => {
    _fetchListHoSoPhiDichVu();
  }, [result?.hsId]);

  return (
    <Flex direction="column" align="center" w="100%" gap="lg">
      {/* Tiêu đề */}
      <Group justify="center" mt="lg">
        <ThemeIcon color="teal" size={40} radius="xl">
          <IconCheck size={24} />
        </ThemeIcon>
        <Title order={3} c="teal">
          Hoàn thành tiếp nhận nội trú
        </Title>
      </Group>

      {/* Khối thông tin chính */}
      <Stack w="100%" maw={600} gap="md">
        {/* Thông tin sinh viên*/}
        <Card shadow="sm" radius="md" withBorder>
          <Title order={5} mb="sm" c="indigo">
            Thông tin sinh viên
          </Title>
          <Stack gap="xs">
            <Group justify="space-between">
              <Text>Tên chủ phương tiện:</Text>
              <Text fw={500}>{ownerInfo.tenChuXe}</Text>
            </Group>

            <Group justify="space-between">
              <Text>CCCD:</Text>
              <Text fw={500}>{ownerInfo.Cccd}</Text>
            </Group>
            <Group justify="space-between">
              <Text>Số điện thoại:</Text>
              <Text fw={500}>{ownerInfo.ttcptSodienthoai}</Text>
            </Group>
            <Group justify="space-between">
              <Text>Ngày tiếp nhận:</Text>
              <Text fw={500}>{ownerInfo.ngayTiepNhan}</Text>
            </Group>
          </Stack>
        </Card>

        {/* Thông tin phí */}
        <Card shadow="sm" radius="md" withBorder>
          <Title order={5} mb="sm" c="indigo">
            Thông tin phí
          </Title>

          {loading ? (
            <Flex justify="center" my="md">
              <Loader color="indigo" />
            </Flex>
          ) : listPhi.length > 0 ? (
            <Stack gap="xs">
              {listPhi.map((item: any, index: number) => (
                <Group key={index} justify="space-between">
                  <Text>
                    {item.tenPhi}{" "}
                    <Text span c="dimmed" fz="sm">
                      ({item.hinhThucThanhToanTen})
                    </Text>
                  </Text>
                  <Text fw={500}>
                    {item.phiThucTe.toLocaleString("vi-VN")} VNĐ
                  </Text>
                </Group>
              ))}

              <Divider my="xs" />
              <Group justify="space-between">
                <Text fw={600}>Tổng phí cần thanh toán:</Text>
                <Text fw={700} c="indigo">
                  {tongTien.toLocaleString("vi-VN")} VNĐ
                </Text>
              </Group>
            </Stack>
          ) : (
            <Text c="dimmed" fs="italic">
              Không có dữ liệu phí dịch vụ
            </Text>
          )}
        </Card>

        {/* Tài khoản thụ hưởng */}
        <Card shadow="sm" radius="md" withBorder>
          <Title order={5} mb="sm" c="indigo">
            Tài khoản thụ hưởng
          </Title>
          <Stack gap="xs">
            <Group justify="space-between">
              <Text>Tên:</Text>
              <Text fw={500}>{account.ten}</Text>
            </Group>
            <Group justify="space-between">
              <Text>Số tài khoản:</Text>
              <Text fw={500}>{account.soTaiKhoan}</Text>
            </Group>
            <Group justify="space-between">
              <Text>Mã ngân hàng:</Text>
              <Text fw={500}>{account.maNganHang}</Text>
            </Group>
            {account?.chiNhanhNganHang && (
              <Group justify="space-between">
                <Text>Chi nhánh:</Text>
                <Text fw={500}>{account.chiNhanhNganHang}</Text>
              </Group>
            )}
          </Stack>
        </Card>

        {/* Ghi chú */}
        <Box>
          <Text c="dimmed" fz="sm" ta="center" mt="xs">
            Cảm ơn bạn đã hoàn tất thủ tục tiếp nhận nội trú. Thông tin thanh toán đã được ghi
            nhận.
          </Text>
        </Box>

        {/* Nút hành động */}
        <Group justify="center" mt="lg">
          <Button
            color="indigo"
            onClick={() => router.push(`/${locale}/extra-fees-management`)}
          >
            Quay về danh sách
          </Button>
        </Group>
      </Stack>
    </Flex>
  );
}
