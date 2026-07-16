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
  Center,
  SimpleGrid,
  Divider,
  Box,
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
import { MOCK_STRANGER_CHART } from "./mockThongKeData";
import {
  NguoiLaItem,
  fetchThongKeNguoiLa,
  fetchThongKeChiTietNguoiLa,
  fetchNguoiLaPaginate,
} from "@/services/dashboard/dashboardService";
import PageSectionHeader from "@/components/common/PageSectionHeader";
import { KhuKtx } from "@/types/type-danh-muc-ktx";
import { fetchDanhSachKhuKtx } from "@/services/danh-muc/danhMucKtxService";
import CustomPagination from "@/components/common/CustomPagination";

const getDefaultDates = () => {
  const den = new Date();
  const tu = new Date(2026, 4, 5); // Ngày 5 tháng 5 năm 2026
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

  // State for dynamic zones list loaded from API
  const [danhSachKhu, setDanhSachKhu] = useState<KhuKtx[]>([]);
  const [zonesLoading, setZonesLoading] = useState(false);

  const getTranslatedKhu = (khu: string) => {
    const matched = danhSachKhu.find((z) => z.maKhu === khu);
    if (matched) return matched.tenKhu;
    if (khu === "Khu A" || khu === "A") return t("dormA");
    if (khu === "Khu B" || khu === "B") return t("dormB");
    return khu;
  };

  const [tuNgay, setTuNgay] = useState<Date | null>(() => getDefaultDates().tu);
  const [denNgay, setDenNgay] = useState<Date | null>(
    () => getDefaultDates().den,
  );
  const [khuKtx, setKhuKtx] = useState("-1");

  // State for paginated history table
  const [nguoiLaList, setNguoiLaList] = useState<NguoiLaItem[]>([]);
  const [nguoiLaLoading, setNguoiLaLoading] = useState(false);
  const [nguoiLaError, setNguoiLaError] = useState<string | null>(null);
  const [nguoiLaPage, setNguoiLaPage] = useState(1);
  const [nguoiLaPageSize] = useState(1000);
  const [nguoiLaTotalPages, setNguoiLaTotalPages] = useState(1);
  const [nguoiLaTotalElements, setNguoiLaTotalElements] = useState(0);

  // State for daily quantity chart
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);

  // State for daily detailed strangers appearance
  const [detailDate, setDetailDate] = useState<Date | null>(() => new Date());
  const [detailList, setDetailList] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Format utility (returns MM/dd/yyyy)
  const formatDateToMMDDYYYY = (
    dateVal: Date | null,
    fallbackDate: Date,
  ): string => {
    const target =
      dateVal && !isNaN(dateVal.getTime()) ? dateVal : fallbackDate;
    const mm = String(target.getMonth() + 1).padStart(2, "0");
    const dd = String(target.getDate()).padStart(2, "0");
    const yyyy = target.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };

  // Format utility (returns dd/MM/yyyy)
  const formatDateToDDMMYYYY = (
    dateVal: Date | null,
    fallbackDate: Date,
  ): string => {
    const target =
      dateVal && !isNaN(dateVal.getTime()) ? dateVal : fallbackDate;
    const dd = String(target.getDate()).padStart(2, "0");
    const mm = String(target.getMonth() + 1).padStart(2, "0");
    const yyyy = target.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  // Format utility (returns yyyy-MM-dd)
  const formatDateToYYYYMMDD = (
    dateVal: Date | null,
    fallbackDate: Date,
  ): string => {
    const target =
      dateVal && !isNaN(dateVal.getTime()) ? dateVal : fallbackDate;
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, "0");
    const dd = String(target.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Parse helper for chart active label
  const parseDateStr = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const part0 = parseInt(parts[0], 10);
      const part1 = parseInt(parts[1], 10);
      const part2 = parseInt(parts[2], 10);
      // Determine if DD/MM/YYYY or MM/DD/YYYY
      if (part0 > 12) {
        return new Date(part2, part1 - 1, part0); // DD/MM/YYYY
      } else {
        return new Date(part2, part0 - 1, part1); // MM/DD/YYYY
      }
    }
    return null;
  };

  // 1. Fetch Zones List
  const loadZones = async () => {
    setZonesLoading(true);
    try {
      const res = await fetchDanhSachKhuKtx({
        page: 1,
        pageSize: 1000,
        maKhu: "-1",
      });
      setDanhSachKhu(res?.items || []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách khu:", err);
    } finally {
      setZonesLoading(false);
    }
  };

  // 2. Fetch Paginated History Table
  const loadNguoiLaHistory = useCallback(
    async (
      page: number,
      overrides?: {
        tuNgay?: Date | null;
        denNgay?: Date | null;
        maKhu?: string;
      },
    ) => {
      setNguoiLaLoading(true);
      setNguoiLaError(null);
      try {
        const activeTu =
          overrides && overrides.tuNgay !== undefined
            ? overrides.tuNgay
            : tuNgay;
        const activeDen =
          overrides && overrides.denNgay !== undefined
            ? overrides.denNgay
            : denNgay;
        const activeKhu =
          overrides && overrides.maKhu !== undefined ? overrides.maKhu : khuKtx;

        const body = {
          page: String(page),
          pageSize: String(nguoiLaPageSize),
          tuNgay: formatDateToMMDDYYYY(activeTu, getDefaultDates().tu),
          denNgay: formatDateToMMDDYYYY(activeDen, getDefaultDates().den),
          maKhu: activeKhu,
        };

        const res = await fetchNguoiLaPaginate(body);
        const payload = res?.payload;
        const items = payload?.items ?? payload?.content ?? [];
        setNguoiLaList(items);
        setNguoiLaTotalPages(payload?.totalPages ?? 1);
        setNguoiLaTotalElements(
          payload?.totalElements ?? payload?.numberOfElements ?? items.length,
        );
      } catch (err: any) {
        setNguoiLaError(err?.message ?? "Lỗi khi tải lịch sử người lạ");
        setNguoiLaList([]);
      } finally {
        setNguoiLaLoading(false);
      }
    },
    [khuKtx, tuNgay, denNgay, nguoiLaPageSize],
  );

  // 3. Fetch Chart Data (Quantity count)
  const loadChartData = useCallback(
    async (overrides?: {
      tuNgay?: Date | null;
      denNgay?: Date | null;
      maKhu?: string;
    }) => {
      setChartLoading(true);
      setChartError(null);
      try {
        const activeTu =
          overrides && overrides.tuNgay !== undefined
            ? overrides.tuNgay
            : tuNgay;
        const activeDen =
          overrides && overrides.denNgay !== undefined
            ? overrides.denNgay
            : denNgay;
        const activeKhu =
          overrides && overrides.maKhu !== undefined ? overrides.maKhu : khuKtx;

        const body = {
          tuNgay: formatDateToMMDDYYYY(activeTu, getDefaultDates().tu),
          denNgay: formatDateToMMDDYYYY(activeDen, getDefaultDates().den),
          maKhu: activeKhu,
        };

        const res = await fetchThongKeNguoiLa(body);
        setChartData(res?.payload || []);
      } catch (err: any) {
        setChartError(err?.message ?? "Lỗi khi tải biểu đồ lượt ra vào");
        setChartData([]);
      } finally {
        setChartLoading(false);
      }
    },
    [khuKtx, tuNgay, denNgay],
  );

  // 4. Fetch Stranger Daily Details List
  const loadStrangerDailyDetails = useCallback(
    async (overrides?: { detailDate?: Date | null; maKhu?: string }) => {
      setDetailLoading(true);
      setDetailError(null);

      const activeDate =
        overrides && overrides.detailDate !== undefined
          ? overrides.detailDate
          : detailDate;
      const activeKhu =
        overrides && overrides.maKhu !== undefined ? overrides.maKhu : khuKtx;

      if (!activeDate) {
        setDetailList([]);
        setDetailLoading(false);
        return;
      }

      try {
        const ngayChiTiet = formatDateToMMDDYYYY(activeDate, new Date());
        const res = await fetchThongKeChiTietNguoiLa({
          ngay: ngayChiTiet,
          maKhu: activeKhu,
        });
        const items = res?.payload || [];
        setDetailList(items);
        setDetailLoading(false);
        return;
      } catch (err: any) {
        setDetailError(
          err?.message ?? "Lá»—i khi táº£i chi tiáº¿t ngÆ°á»i láº¡ trong ngĂ y",
        );
        setDetailList([]);
        setDetailLoading(false);
        return;
      }

      // const formats = [
      //   {
      //     Ngay: formatDateToMMDDYYYY(activeDate, new Date()),
      //     maKhu: activeKhu,
      //   },
      //   {
      //     ngay: formatDateToMMDDYYYY(activeDate, new Date()),
      //     maKhu: activeKhu,
      //   },
      //   {
      //     Ngay: formatDateToDDMMYYYY(activeDate, new Date()),
      //     maKhu: activeKhu,
      //   },
      //   {
      //     ngay: formatDateToDDMMYYYY(activeDate, new Date()),
      //     maKhu: activeKhu,
      //   },
      //   {
      //     Ngay: formatDateToYYYYMMDD(activeDate, new Date()),
      //     maKhu: activeKhu,
      //   },
      //   {
      //     ngay: formatDateToYYYYMMDD(activeDate, new Date()),
      //     maKhu: activeKhu,
      //   },
      // ];

      // let lastErr = null;
      // for (const params of formats) {
      //   try {
      //     const res = await fetchThongKeChiTietNguoiLa(params);
      //     setDetailList(res?.payload || []);
      //     setDetailLoading(false);
      //     return;
      //   } catch (err: any) {
      //     lastErr = err;
      //     // Continue loop to try other formats
      //   }
      // }

      // setDetailError(
      //   lastErr?.message ?? "Lỗi khi tải chi tiết người lạ trong ngày",
      // );
      // setDetailList([]);
      // setDetailLoading(false);
    },
    [khuKtx, detailDate],
  );

  // Load zones on mount, and trigger initial data load
  useEffect(() => {
    loadZones();
  }, []);

  useEffect(() => {
    loadNguoiLaHistory(nguoiLaPage);
  }, [nguoiLaPage, loadNguoiLaHistory]);

  useEffect(() => {
    loadChartData();
  }, [loadChartData]);

  useEffect(() => {
    loadStrangerDailyDetails();
  }, [loadStrangerDailyDetails]);

  // Search Handler
  const handleSearch = () => {
    setNguoiLaPage(1);
    loadNguoiLaHistory(1);
    loadChartData();
    loadStrangerDailyDetails();
  };

  // Reset Handler
  const handleReset = () => {
    const defaults = getDefaultDates();
    setTuNgay(defaults.tu);
    setDenNgay(defaults.den);
    setKhuKtx("-1");
    setNguoiLaPage(1);
    setDetailDate(new Date());

    loadNguoiLaHistory(1, {
      tuNgay: defaults.tu,
      denNgay: defaults.den,
      maKhu: "-1",
    });
    loadChartData({ tuNgay: defaults.tu, denNgay: defaults.den, maKhu: "-1" });
    loadStrangerDailyDetails({ detailDate: new Date(), maKhu: "-1" });
  };

  // Handle chart node click to view details of that clicked date
  const handleChartClick = (nextState: any) => {
    if (nextState && nextState.activeLabel) {
      const parsedDate = parseDateStr(nextState.activeLabel);
      if (parsedDate) {
        setDetailDate(parsedDate);
        loadStrangerDailyDetails({ detailDate: parsedDate });
      }
    }
  };

  // Dynamic dropdown list mapping
  const zonesDropdownData = [
    { value: "-1", label: t("all") },
    ...danhSachKhu.map((k) => ({
      value: k.maKhu || "",
      label: k.tenKhu || `Khu ${k.maKhu}`,
    })),
  ];

  return (
    <Stack
      gap="xl"
      p="sm"
      style={{
        backgroundColor: "#fafbfd",
        minHeight: "100vh",
        fontFamily: "var(--font-readex-pro), sans-serif",
      }}
    >
      <PageSectionHeader
        title={t("strangerTitle")}
        description="Theo dõi thống kê người lạ theo thời gian, khu vực và các lần phát hiện gần nhất."
        icon={<IconReportAnalytics size={20} color="#1f5ca9" />}
      />

      {/* Filter Card */}
      <Card
        withBorder
        radius="lg"
        p="md"
        style={{
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
          borderColor: "#e2e8f0",
        }}
      >
        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr)) auto",
            gap: "16px",
            alignItems: "end",
          }}
        >
          <DateInput
            label={t("fromDate").toUpperCase()}
            placeholder="MM/DD/YYYY"
            value={tuNgay}
            onChange={(val) => setTuNgay(val ? new Date(val) : null)}
            valueFormat="DD/MM/YYYY"
            clearable
            styles={{
              label: {
                fontSize: "11px",
                fontWeight: 600,
                color: "#475569",
                marginBottom: "6px",
                letterSpacing: "0.3px",
              },
              input: {
                borderRadius: "8px",
                height: "40px",
              },
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
              label: {
                fontSize: "11px",
                fontWeight: 600,
                color: "#475569",
                marginBottom: "6px",
                letterSpacing: "0.3px",
              },
              input: {
                borderRadius: "8px",
                height: "40px",
              },
            }}
          />

          <Select
            label={t("dormZone").toUpperCase()}
            value={khuKtx}
            onChange={(val) => setKhuKtx(val || "-1")}
            data={zonesDropdownData}
            disabled={zonesLoading}
            styles={{
              label: {
                fontSize: "11px",
                fontWeight: 600,
                color: "#475569",
                marginBottom: "6px",
                letterSpacing: "0.3px",
              },
              input: {
                borderRadius: "8px",
                height: "40px",
              },
            }}
          />

          <Group gap="sm" wrap="nowrap">
            <Button
              leftSection={
                nguoiLaLoading || chartLoading ? (
                  <Loader size={16} color="white" />
                ) : (
                  <IconSearch size={16} />
                )
              }
              onClick={handleSearch}
              disabled={nguoiLaLoading || chartLoading}
              style={{
                backgroundColor: "#1f5ca9",
                borderRadius: "8px",
                height: "40px",
                whiteSpace: "nowrap",
              }}
            >
              {t("search")}
            </Button>

            <Button
              leftSection={<IconRefresh size={16} />}
              variant="outline"
              color="gray"
              onClick={handleReset}
              style={{
                borderColor: "#cbd5e1",
                color: "#64748b",
                borderRadius: "8px",
                height: "40px",
                whiteSpace: "nowrap",
              }}
            >
              {t("reset")}
            </Button>

            <Button
              leftSection={<IconDownload size={16} />}
              variant="outline"
              style={{
                borderColor: "#1f5ca9",
                color: "#1f5ca9",
                borderRadius: "8px",
                height: "40px",
                whiteSpace: "nowrap",
              }}
            >
              {t("exportExcel")}
            </Button>

            <Button
              leftSection={<IconDownload size={16} />}
              variant="outline"
              style={{
                borderColor: "#0ea5e9",
                color: "#0ea5e9",
                borderRadius: "8px",
                height: "40px",
                whiteSpace: "nowrap",
              }}
            >
              {t("exportPdf")}
            </Button>
          </Group>
        </Box>
      </Card>

      <Card
        withBorder
        radius="lg"
        p="lg"
        style={{
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
          height: "100%",
        }}
      >
        <Text
          fw={700}
          size="xs"
          c="#1f5ca9"
          mb="md"
          style={{
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            fontFamily: "var(--font-readex-pro), sans-serif",
          }}
        >
          {t("strangerChartTitle")}
        </Text>
        {chartLoading ? (
          <Center style={{ height: 260 }}>
            <Loader size="md" color="blue" />
          </Center>
        ) : chartError ? (
          <Center style={{ height: 260 }}>
            <Text
              size="sm"
              c="dimmed"
              style={{ fontFamily: "var(--font-readex-pro), sans-serif" }}
            >
              {t("noStrangerData") ||
                "Không có dữ liệu người lạ trong khoảng thời gian này"}
            </Text>
          </Center>
        ) : !chartData || chartData.length === 0 ? (
          <Center style={{ height: 260 }}>
            <Text
              size="sm"
              c="dimmed"
              style={{ fontFamily: "var(--font-readex-pro), sans-serif" }}
            >
              {t("noStrangerData") ||
                "Không có dữ liệu người lạ trong khoảng thời gian này"}
            </Text>
          </Center>
        ) : (
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                onClick={handleChartClick}
                style={{ cursor: "pointer" }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="ngay" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="soLuong"
                  name={t("strangerCount") || "Số lượng người lạ"}
                  stroke="#1f5ca9"
                  fill="#1f5ca9"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card
        withBorder
        radius="lg"
        p="lg"
        style={{
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
          // height: "100%",
        }}
      >
        <Group justify="space-between" align="center" mb="md">
          <Text
            fw={700}
            size="xs"
            c="#1f5ca9"
            style={{
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              fontFamily: "var(--font-readex-pro), sans-serif",
            }}
          >
            {t("dailyDetailsTitle") || "CHI TIẾT NGƯỜI LẠ TRONG NGÀY"}
          </Text>
          <DateInput
            placeholder="Chọn ngày..."
            value={detailDate}
            onChange={(val) => {
              const d = val ? new Date(val) : null;
              setDetailDate(d);
              loadStrangerDailyDetails({ detailDate: d });
            }}
            valueFormat="DD/MM/YYYY"
            clearable={false}
            styles={{
              input: {
                borderRadius: "8px",
                width: "150px",
                height: "32px",
                fontSize: "12px",
                fontFamily: "var(--font-readex-pro), sans-serif",
              },
            }}
          />
        </Group>

        {detailLoading ? (
          <Center style={{ height: 230 }}>
            <Loader size="md" color="blue" />
          </Center>
        ) : detailError ? (
          <Center style={{ height: 230 }}>
            <Text
              size="sm"
              c="dimmed"
              style={{ fontFamily: "var(--font-readex-pro), sans-serif" }}
            >
              {t("noStrangerData") ||
                "Không có dữ liệu người lạ trong khoảng thời gian này"}
            </Text>
          </Center>
        ) : (
          <Table
            verticalSpacing="md"
            horizontalSpacing="md"
            highlightOnHover
            style={{ width: "100%", tableLayout: "fixed" }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: 60, textAlign: "center" }}>
                  STT
                </Table.Th>
                <Table.Th style={{ width: 110, textAlign: "center" }}>
                  Hinh anh
                </Table.Th>
                <Table.Th style={{ width: 180 }}>Camera</Table.Th>
                <Table.Th style={{ width: 90, textAlign: "center" }}>
                  Ma khu
                </Table.Th>
                <Table.Th style={{ width: 180 }}>KTX</Table.Th>
                <Table.Th style={{ width: 120, textAlign: "center" }}>
                  Ngay
                </Table.Th>
                <Table.Th style={{ width: 100, textAlign: "center" }}>
                  Gio
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {detailList.map((item, idx) => (
                <Table.Tr key={idx}>
                  <Table.Td
                    style={{
                      textAlign: "center",
                      fontWeight: 600,
                      color: "#64748b",
                    }}
                  >
                    {idx + 1}
                  </Table.Td>
                  <Table.Td style={{ textAlign: "center" }}>
                    {item.pathImage ? (
                      <Avatar
                        src={item.pathImage}
                        radius="sm"
                        size={56}
                        alt="Stranger"
                        style={{ margin: "auto" }}
                      />
                    ) : (
                      <Text size="xs" c="dimmed">
                        {t("noImage") || "Khong co anh"}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td style={{ color: "#16a34a", fontWeight: 500 }}>
                    {item.cameraName || `Camera ${item.cameraId || "--"}`}
                  </Table.Td>
                  <Table.Td style={{ textAlign: "center", fontWeight: 500 }}>
                    {item.maKhu || "--"}
                  </Table.Td>
                  <Table.Td>
                    {item.tenKhu || getTranslatedKhu(item.maKhu) || "--"}
                  </Table.Td>
                  <Table.Td style={{ textAlign: "center" }}>
                    {item.ngay || "--"}
                  </Table.Td>
                  <Table.Td style={{ textAlign: "center", fontWeight: 500 }}>
                    {item.thoiGian ||
                      (item.timecheck
                        ? item.timecheck.substring(11, 19)
                        : "--")}
                  </Table.Td>
                </Table.Tr>
              ))}
              {detailList.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={7}>
                    <Text size="sm" c="dimmed" ta="center" py="xl">
                      {t("noStrangerDetailsForDay") ||
                        "Khong phat hien nguoi la nao trong ngay nay."}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        )}
      </Card>
    </Stack>
  );
}
