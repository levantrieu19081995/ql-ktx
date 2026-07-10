"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
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
  SimpleGrid,
  Divider,
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
  const t = useTranslations("Statistics");

  const getTranslatedStatus = (statusName: string) => {
    if (statusName === "Nghi vấn") return t("statusSuspicious");
    if (statusName === "Cảnh báo") return t("statusSuspicious");
    if (statusName === "Hợp lệ") return t("statusValid");
    return statusName;
  };

  const getTranslatedKhu = (khu: string) => {
    if (khu === "Khu A" || khu === "A") return t("dormA");
    if (khu === "Khu B" || khu === "B") return t("dormB");
    return khu;
  };

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
      return [{ date: t("noData"), "Khu A": 0, "Khu B": 0, "Tổng": 0 }];
    }
    return list.slice(0, 10);
  };
  
  const chartData = nguoiLaList.length > 0 ? computeChartData() : [{ date: t("noData"), "Khu A": 0, "Khu B": 0, "Tổng": 0 }];

  return (
    <Stack gap="xl" p="sm" style={{ backgroundColor: "#fafbfd", minHeight: "100vh", fontFamily: "var(--font-readex-pro), sans-serif" }}>
      <Group gap="md">
        <ThemeIcon size={38} variant="light" color="blue" style={{ backgroundColor: "#e0f2fe" }}>
          <IconReportAnalytics size={20} color="#1f5ca9" />
        </ThemeIcon>
        <Title order={2} fw={800} c="#1f5ca9" style={{ letterSpacing: "-0.5px", fontFamily: "var(--font-k2d), sans-serif" }}>
          {t("strangerTitle")}
        </Title>
      </Group>

      <Card withBorder radius="lg" p="lg" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)", borderColor: "#e2e8f0" }}>
        <Stack gap="md">
          {/* Row 1: 3 filter fields */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <DateInput
              label={t("fromDate").toUpperCase()}
              placeholder="MM/DD/YYYY"
              value={tuNgay}
              onChange={(val) => setTuNgay(val ? new Date(val) : null)}
              valueFormat="DD/MM/YYYY"
              clearable
              styles={{
                label: { fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "6px", letterSpacing: "0.5px" },
                input: { borderRadius: "8px", fontFamily: "var(--font-readex-pro), sans-serif", height: "40px" }
              }}
            />
            <DateInput
              label={t("toDate").toUpperCase()}
              placeholder="MM/DD/YYYY"
              value={denNgay}
              onChange={(val) => setDenNgay(val ? new Date(val) : null)}
              valueFormat="DD/MM/YYYY"
              clearable
              styles={{
                label: { fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "6px", letterSpacing: "0.5px" },
                input: { borderRadius: "8px", fontFamily: "var(--font-readex-pro), sans-serif", height: "40px" }
              }}
            />
            <Select
              label={t("dormZone").toUpperCase()}
              value={khuKtx}
              onChange={(val) => setKhuKtx(val || "Tất cả")}
              data={[
                { value: "Tất cả", label: t("all") },
                { value: "Khu A", label: t("dormA") },
                { value: "Khu B", label: t("dormB") }
              ]}
              styles={{
                label: { fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "6px", letterSpacing: "0.5px" },
                input: { borderRadius: "8px", fontFamily: "var(--font-readex-pro), sans-serif", height: "40px" }
              }}
            />
          </SimpleGrid>

          {/* Dotted divider */}
          <Divider variant="dashed" style={{ borderStyle: "dashed", borderColor: "#cbd5e1" }} my="xs" />

          {/* Row 2: Search buttons */}
          <Group justify="flex-end" gap="sm">
            <Button
              leftSection={nguoiLaLoading ? <Loader size={16} color="white" /> : <IconSearch size={16} />}
              style={{ backgroundColor: "#1f5ca9", fontFamily: "var(--font-readex-pro), sans-serif", borderRadius: "8px", height: "40px" }}
              onClick={handleNguoiLaSearch}
              loading={nguoiLaLoading}
            >
              {t("search")}
            </Button>
            <Button
              leftSection={<IconRefresh size={16} />}
              variant="outline"
              color="gray"
              onClick={handleReset}
              style={{ borderColor: "#cbd5e1", color: "#64748b", fontFamily: "var(--font-readex-pro), sans-serif", borderRadius: "8px", height: "40px" }}
            >
              {t("reset")}
            </Button>
            <Button
              leftSection={<IconDownload size={16} />}
              variant="outline"
              style={{ borderColor: "#1f5ca9", color: "#1f5ca9", fontFamily: "var(--font-readex-pro), sans-serif", borderRadius: "8px", height: "40px" }}
            >
              {t("exportExcel")}
            </Button>
            <Button
              leftSection={<IconDownload size={16} />}
              variant="outline"
              style={{ borderColor: "#0ea5e9", color: "#0ea5e9", fontFamily: "var(--font-readex-pro), sans-serif", borderRadius: "8px", height: "40px" }}
            >
              {t("exportPdf")}
            </Button>
          </Group>
        </Stack>
      </Card>

      <Grid gutter="md">
        <Grid.Col span={12}>
          <Card withBorder radius="lg" p="lg" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}>
            <Text fw={700} size="xs" c="#1f5ca9" mb="md" style={{ letterSpacing: "0.5px", textTransform: "uppercase", fontFamily: "var(--font-readex-pro), sans-serif" }}>
              {t("strangerChartTitle")}
            </Text>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="Khu A" name={t("dormA")} stroke="#1f5ca9" fill="#1f5ca9" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="Khu B" name={t("dormB")} stroke="#00afef" fill="#00afef" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Grid.Col>
      </Grid>

      <Card withBorder radius="lg" p="lg" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}>
        <Group justify="space-between" mb="md">
          <div>
            <Text fw={700} size="xs" c="#1f5ca9" style={{ letterSpacing: "0.5px", textTransform: "uppercase", fontFamily: "var(--font-readex-pro), sans-serif" }}>
              {t("strangerTableTitle")}
            </Text>
            {!nguoiLaLoading && (
              <Text size="xs" c="dimmed" mt={2}>
                {t("totalLabel")} <b>{nguoiLaTotalElements}</b>
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
              <Text size="sm" c="dimmed">{t("loadingStranger")}</Text>
            </Stack>
          </Center>
        ) : (
          <>
            <ScrollArea>
              <Table verticalSpacing="sm" highlightOnHover style={{ minWidth: 800 }}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>{t("no")}</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>{t("detectTime")}</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>{t("dormZone")}</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>{t("detectPosition")}</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px", textAlign: "center" }}>{t("cameraImg")}</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px", textAlign: "center" }}>{t("status")}</Table.Th>
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
                        <Table.Td style={{ fontSize: "13px", color: "#475569" }}>{getTranslatedKhu(khu)}</Table.Td>
                        <Table.Td style={{ fontSize: "13px", color: "#475569" }}>{viTri}</Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          {imgSrc ? (
                            <Avatar src={imgSrc} radius="sm" size="md" alt="Stranger" style={{ margin: "auto" }} />
                          ) : (
                            <Text size="xs" c="dimmed">{t("noData")}</Text>
                          )}
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          <Badge color={tt === "Cảnh báo" || tt === "WARNING" || tt === "Nghi vấn" ? "red" : tt === "Hợp lệ" || tt === "OK" ? "green" : "blue"} variant="light" size="sm">
                            {getTranslatedStatus(tt)}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                  {nguoiLaList.length === 0 && !nguoiLaLoading && (
                    <Table.Tr>
                      <Table.Td colSpan={6}>
                        <Text ta="center" c="dimmed" py="xl">
                          {t("noStrangerData")}
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
