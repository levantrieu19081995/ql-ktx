"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DateInput } from "@mantine/dates";
import {
  Card,
  Group,
  Text,
  Table,
  Badge,
  Avatar,
  ScrollArea,
  Stack,
  Title,
  Grid,
  TextInput,
  Select,
  Button,
  ThemeIcon,
  Loader,
  Pagination,
  Center,
} from "@mantine/core";
import {
  IconSearch,
  IconRefresh,
  IconDownload,
  IconReportAnalytics,
} from "@tabler/icons-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  MOCK_STRANGER_CHART,
} from "./mockThongKeData";
import {
  NguoiLaItem,
} from "@/services/dashboard/dashboardService";
import { post } from "@/utils/axios";

const getDefaultDates = () => {
  const den = new Date();
  const tu = new Date();
  tu.setDate(tu.getDate() - 30); // 30 ngày trước (1 tháng)
  return { tu, den };
};

export default function NguoiLaSubPage() {
  const [tuNgay, setTuNgay] = useState<Date | null>(() => getDefaultDates().tu);
  const [denNgay, setDenNgay] = useState<Date | null>(() => getDefaultDates().den);
  const [khuKtx, setKhuKtx] = useState("Tất cả");

  const [nguoiLaList, setNguoiLaList] = useState<NguoiLaItem[]>([]);
  const [nguoiLaLoading, setNguoiLaLoading] = useState(false);
  const [nguoiLaError, setNguoiLaError] = useState<string | null>(null);
  const [nguoiLaPage, setNguoiLaPage] = useState(1);
  const [nguoiLaPageSize] = useState(10);
  const [nguoiLaTotalPages, setNguoiLaTotalPages] = useState(1);
  const [nguoiLaTotalElements, setNguoiLaTotalElements] = useState(0);

  const loadNguoiLa = useCallback(
    async (page: number, overrides?: { tuNgay?: Date | null; denNgay?: Date | null }) => {
      setNguoiLaLoading(true);
      setNguoiLaError(null);
      try {
        const activeTu = (overrides && overrides.tuNgay !== undefined) ? overrides.tuNgay : tuNgay;
        const activeDen = (overrides && overrides.denNgay !== undefined) ? overrides.denNgay : denNgay;

        const formatDate = (dateVal: Date | null, isStart: boolean): string => {
          if (dateVal && !isNaN(dateVal.getTime())) {
            const mm = String(dateVal.getMonth() + 1).padStart(2, "0");
            const dd = String(dateVal.getDate()).padStart(2, "0");
            const yyyy = dateVal.getFullYear();
            return `${mm}/${dd}/${yyyy}`;
          }
          const fallbackDate = isStart ? getDefaultDates().tu : getDefaultDates().den;
          const mm = String(fallbackDate.getMonth() + 1).padStart(2, "0");
          const dd = String(fallbackDate.getDate()).padStart(2, "0");
          const yyyy = fallbackDate.getFullYear();
          return `${mm}/${dd}/${yyyy}`;
        };

        // Chuẩn hóa khu KTX theo yêu cầu API ("Khu A" -> "A", "Khu B" -> "B", "Tất cả" -> "-1")
        let maKhu = "-1";
        if (khuKtx === "Khu A") maKhu = "A";
        else if (khuKtx === "Khu B") maKhu = "B";

        const body = {
          page: String(page),
          pageSize: String(nguoiLaPageSize),
          tuNgay: formatDate(activeTu, true),
          denNgay: formatDate(activeDen, false),
          maKhu,
        };

        console.log("[NguoiLa] Sending body:", JSON.stringify(body, null, 2));
        const res = await post<any>("/face-detect-service/face-web-check-time/paginate-nguoi-la", body);
        console.log("[NguoiLa] API response:", res);
        console.log("[NguoiLa] res.payload:", res?.payload);
        console.log("[NguoiLa] res.payload.items:", res?.payload?.items);
        console.log("[NguoiLa] res.payload.items length:", res?.payload?.items?.length);

        const payload = res?.payload;
        const items = payload?.items ?? payload?.content ?? [];
        setNguoiLaList(items);
        setNguoiLaTotalPages(payload?.totalPages ?? 1);
        setNguoiLaTotalElements(
          payload?.totalElements ?? payload?.numberOfElements ?? items.length
        );
      } catch (err: any) {
        setNguoiLaError(err?.message ?? "Lỗi khi tải dữ liệu người lạ");
        setNguoiLaList([]);
      } finally {
        setNguoiLaLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [khuKtx, tuNgay, denNgay, nguoiLaPageSize]
  );

  useEffect(() => {
    loadNguoiLa(nguoiLaPage);
  }, [nguoiLaPage, loadNguoiLa]);

  const handleNguoiLaSearch = () => {
    setNguoiLaPage(1);
    loadNguoiLa(1);
  };

  const handleReset = () => {
    const defaults = getDefaultDates();
    setTuNgay(defaults.tu);
    setDenNgay(defaults.den);
    setKhuKtx("Tất cả");
    setNguoiLaPage(1);
    loadNguoiLa(1, { tuNgay: defaults.tu, denNgay: defaults.den });
  };

  // Group stranger occurrences by date for the chart
  const computeChartData = () => {
    const dateGroups: { [key: string]: { date: string; "Khu A": number; "Khu B": number; "Tổng": number } } = {};
    
    nguoiLaList.forEach((item) => {
      const date = item.ngay || "--";
      if (!dateGroups[date]) {
        dateGroups[date] = { date, "Khu A": 0, "Khu B": 0, "Tổng": 0 };
      }
      const isKhuA = String(item.maKhu || "").toLowerCase().includes("a") || String(item.tenKhu || "").toLowerCase().includes("a");
      if (isKhuA) {
        dateGroups[date]["Khu A"]++;
      } else {
        dateGroups[date]["Khu B"]++;
      }
      dateGroups[date]["Tổng"]++;
    });

    const list = Object.values(dateGroups);
    if (list.length === 0) {
      return [{ date: "Không có dữ liệu", "Khu A": 0, "Khu B": 0, "Tổng": 0 }];
    }
    return list.slice(0, 10);
  };
  
  const chartData = nguoiLaList.length > 0 ? computeChartData() : [{ date: "Không có dữ liệu", "Khu A": 0, "Khu B": 0, "Tổng": 0 }];

  return (
    <Stack gap="xl" p="sm" style={{ backgroundColor: "#fafbfd", minHeight: "100vh", fontFamily: "var(--font-readex-pro), sans-serif" }}>
      <Group gap="md">
        <ThemeIcon size={38} variant="light" color="blue" style={{ backgroundColor: "#e0f2fe" }}>
          <IconReportAnalytics size={20} color="#1f5ca9" />
        </ThemeIcon>
        <Title order={2} fw={800} c="#1f5ca9" style={{ letterSpacing: "-0.5px", fontFamily: "var(--font-readex-pro), sans-serif" }}>
          THỐNG KÊ NGƯỜI LẠ XUẤT HIỆN
        </Title>
      </Group>

      <Card withBorder radius="lg" p="lg" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)", borderColor: "#e2e8f0" }}>
        <Stack gap="md">
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, sm: 4, md: 4 }}>
              <DateInput
                label="TỪ NGÀY"
                placeholder="Chọn ngày..."
                value={tuNgay}
                onChange={(val) => setTuNgay(val ? new Date(val) : null)}
                valueFormat="DD/MM/YYYY"
                clearable
                styles={{
                  label: { fontSize: "11px", fontWeight: 700, color: "#1f5ca9", marginBottom: "6px", letterSpacing: "0.5px" },
                  input: { borderRadius: "8px", fontFamily: "var(--font-readex-pro), sans-serif" }
                }}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4, md: 4 }}>
              <DateInput
                label="ĐẾN NGÀY"
                placeholder="Chọn ngày..."
                value={denNgay}
                onChange={(val) => setDenNgay(val ? new Date(val) : null)}
                valueFormat="DD/MM/YYYY"
                clearable
                styles={{
                  label: { fontSize: "11px", fontWeight: 700, color: "#1f5ca9", marginBottom: "6px", letterSpacing: "0.5px" },
                  input: { borderRadius: "8px", fontFamily: "var(--font-readex-pro), sans-serif" }
                }}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4, md: 4 }}>
              <Select
                label="KHU KTX"
                value={khuKtx}
                onChange={(val) => setKhuKtx(val || "Tất cả")}
                data={["Tất cả", "Khu A", "Khu B"]}
                styles={{
                  label: { fontSize: "11px", fontWeight: 700, color: "#1f5ca9", marginBottom: "6px", letterSpacing: "0.5px" },
                  input: { borderRadius: "8px", fontFamily: "var(--font-readex-pro), sans-serif" }
                }}
              />
            </Grid.Col>
          </Grid>

          <Group gap="xs" justify="flex-end" wrap="wrap" mt="xs">
            <Button leftSection={<IconSearch size={16} />} style={{ backgroundColor: "#1f5ca9", fontFamily: "var(--font-readex-pro), sans-serif" }} onClick={handleNguoiLaSearch} loading={nguoiLaLoading}>
              Tìm kiếm
            </Button>
            <Button leftSection={<IconRefresh size={16} />} variant="outline" color="gray" onClick={handleReset} style={{ borderColor: "#cbd5e1", color: "#64748b", fontFamily: "var(--font-readex-pro), sans-serif" }}>
              Làm mới
            </Button>
            <Button leftSection={<IconDownload size={16} />} variant="outline" style={{ borderColor: "#22c55e", color: "#16a34a", fontFamily: "var(--font-readex-pro), sans-serif" }}>
              Xuất Excel
            </Button>
            <Button leftSection={<IconDownload size={16} />} variant="outline" style={{ borderColor: "#ef4444", color: "#dc2626", fontFamily: "var(--font-readex-pro), sans-serif" }}>
              Xuất PDF
            </Button>
          </Group>
        </Stack>
      </Card>

      <Grid gutter="md">
        <Grid.Col span={12}>
          <Card withBorder radius="lg" p="lg" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}>
            <Text fw={700} size="sm" c="dimmed" mb="md" style={{ letterSpacing: "0.5px" }}>
              TẦN SUẤT PHÁT HIỆN NGƯỜI LẠ (7 NGÀY QUA)
            </Text>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="Khu A" stroke="#228be6" fill="#228be6" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="Khu B" stroke="#40c057" fill="#40c057" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Grid.Col>
      </Grid>

      <Card withBorder radius="lg" p="lg" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}>
        <Group justify="space-between" mb="md">
          <div>
            <Text fw={800} size="md" c="#1e293b" style={{ letterSpacing: "0.25px" }}>
              BẢNG PHÁT HIỆN NGƯỜI LẠ XUẤT HIỆN
            </Text>
            {!nguoiLaLoading && (
              <Text size="xs" c="dimmed" mt={2}>
                Tổng cộng: <b>{nguoiLaTotalElements}</b> bản ghi
              </Text>
            )}
          </div>
          {nguoiLaError && (
            <Badge color="red" variant="light" size="sm">
              {nguoiLaError}
            </Badge>
          )}
        </Group>

        {nguoiLaLoading ? (
          <Center py="xl">
            <Stack align="center" gap="sm">
              <Loader size="md" color="blue" />
              <Text size="sm" c="dimmed">Đang tải dữ liệu người lạ...</Text>
            </Stack>
          </Center>
        ) : (
          <>
            <ScrollArea>
              <Table verticalSpacing="sm" highlightOnHover style={{ minWidth: 800 }}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>STT</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>Thời gian phát hiện</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>Khu KTX</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>Vị trí / Cổng</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px", textAlign: "center" }}>Ảnh camera</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px", textAlign: "center" }}>Trạng thái</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {nguoiLaList.map((row, index) => {
                    const stt = (nguoiLaPage - 1) * nguoiLaPageSize + index + 1;
                    const thoiGian = (row.ngay && row.thoigian) ? `${row.ngay} ${row.thoigian}` : (row.timecheck ?? "--");
                    const khu = row.tenKhu ?? row.maKhu ?? "--";
                    const viTri = row.cameraName ?? "--";
                    const imgSrc = row.pathImage ?? "";
                    const tt = row.trangThai ?? "Nghi vấn";
                    return (
                      <Table.Tr key={row.id ?? index} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <Table.Td style={{ fontSize: "13px", color: "#64748b" }}>{stt}</Table.Td>
                        <Table.Td style={{ fontSize: "13px", color: "#1e293b", fontWeight: 500 }}>{thoiGian}</Table.Td>
                        <Table.Td style={{ fontSize: "13px", color: "#475569" }}>{khu}</Table.Td>
                        <Table.Td style={{ fontSize: "13px", color: "#475569" }}>{viTri}</Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          {imgSrc ? (
                            <Avatar src={imgSrc} radius="sm" size="md" alt="Stranger" style={{ margin: "auto" }} />
                          ) : (
                            <Text size="xs" c="dimmed">Không có ảnh</Text>
                          )}
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          <Badge color={tt === "Cảnh báo" || tt === "WARNING" || tt === "Nghi vấn" ? "red" : tt === "Hợp lệ" || tt === "OK" ? "green" : "blue"} variant="light" size="sm">
                            {tt || "Phát hiện"}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                  {nguoiLaList.length === 0 && !nguoiLaLoading && (
                    <Table.Tr>
                      <Table.Td colSpan={6}>
                        <Text ta="center" c="dimmed" py="xl">
                          {nguoiLaError ? nguoiLaError : "Không có dữ liệu người lạ trong khoảng thời gian này"}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            {nguoiLaTotalPages > 1 && (
              <Center mt="md">
                <Pagination total={nguoiLaTotalPages} value={nguoiLaPage} onChange={(p) => setNguoiLaPage(p)} size="sm" color="blue" />
              </Center>
            )}
          </>
        )}
      </Card>
    </Stack>
  );
}
