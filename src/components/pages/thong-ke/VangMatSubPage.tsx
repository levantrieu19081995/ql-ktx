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
  ActionIcon,
  Box,
} from "@mantine/core";
import {
  IconSearch,
  IconRefresh,
  IconDownload,
  IconReportAnalytics,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchThongKeRaVao } from "@/services/dashboard/thongkeService";
import PageSectionHeader from "@/components/common/PageSectionHeader";
import CustomPagination from "@/components/common/CustomPagination";

const resolveKhu = (item: any): string => {
  if (!item) return "Khu A";
  let rawKhu =
    item.tenKhu ||
    item.maKhu ||
    item.danhSachVao?.[0]?.tenKhu ||
    item.danhSachRa?.[0]?.tenKhu ||
    "";

  if (rawKhu === "A" || rawKhu === "B") {
    rawKhu = `Khu ${rawKhu}`;
  }

  const phong =
    item.maPhong ||
    item.tenPhong ||
    item.danhSachVao?.[0]?.maPhong ||
    item.danhSachRa?.[0]?.maPhong ||
    "";
  if (!rawKhu && phong) {
    const firstChar = String(phong).charAt(0).toUpperCase();
    if (["A", "B", "C", "D"].includes(firstChar)) {
      rawKhu = `Khu ${firstChar}`;
    }
  }

  return rawKhu || "Khu A";
};

const getDefaultDates = () => {
  const den = new Date();
  const tu = new Date();
  tu.setDate(tu.getDate() - 60); // 60 ngày trước (tầm 2 tháng)
  return { tu, den };
};

const AbsentChartLegend = () => {
  return (
    <Group justify="center" align="flex-end" gap="md" mt={8} wrap="wrap">
      {/* Minh họa trục biểu đồ */}
      <Box
        style={{
          position: "relative",
          width: 116,
          height: 40,
          flexShrink: 0,
        }}
      >
        {/* Tên trục Y */}
        <Text
          size="10px"
          fw={600}
          c="#64748b"
          style={{
            position: "absolute",
            top: -2,
            left: 0,
            whiteSpace: "nowrap",
          }}
        >
          Số sinh viên
        </Text>

        {/* Trục Y */}
        <Box
          style={{
            position: "absolute",
            left: 5,
            bottom: 4,
            width: 1,
            height: 21,
            backgroundColor: "#64748b",
          }}
        />

        {/* Trục X */}
        <Box
          style={{
            position: "absolute",
            left: 5,
            bottom: 4,
            width: 42,
            height: 1,
            backgroundColor: "#64748b",
          }}
        />

        {/* Cột minh họa */}
        <Box
          style={{
            position: "absolute",
            left: 17,
            bottom: 5,
            width: 10,
            height: 13,
            borderRadius: "2px 2px 0 0",
            backgroundColor: "#1f5ca9",
          }}
        />

        {/* Tên trục X */}
        <Text
          size="10px"
          fw={600}
          c="#64748b"
          style={{
            position: "absolute",
            left: 52,
            bottom: 0,
            whiteSpace: "nowrap",
            right: -4,
          }}
        >
          Số ngày vắng
        </Text>
      </Box>

      {/* Chú thích series */}
      <Group gap={5} wrap="nowrap">
        <Box
          style={{
            width: 11,
            height: 11,
            borderRadius: 2,
            backgroundColor: "#1f5ca9",
          }}
        />

        <Text size="12px" c="#64748b">
          Số lượng
        </Text>
      </Group>
    </Group>
  );
};

export default function VangMatSubPage() {
  const t = useTranslations("Statistics");

  const getTranslatedStatus = (statusName: string) => {
    if (statusName === "Vắng mặt") return t("statusAbsent");
    if (statusName === "Đang có mặt") return t("statusPresent");
    if (statusName === "Cảnh báo") return t("statusWarning") || "Cảnh báo";
    if (statusName === "Nghi vấn") return t("statusSuspicious") || "Nghi vấn";
    if (statusName === "Hợp lệ") return t("statusValid") || "Hợp lệ";
    return statusName;
  };

  const getTranslatedKhu = (khu: string) => {
    if (khu === "Khu A") return t("dormA");
    if (khu === "Khu B") return t("dormB");
    return khu;
  };

  const [hoTen, setHoTen] = useState("");
  const [mssv, setMssv] = useState("");

  const [tuNgay, setTuNgay] = useState<Date | null>(() => getDefaultDates().tu);
  const [denNgay, setDenNgay] = useState<Date | null>(
    () => getDefaultDates().den,
  );
  const [khuKtx, setKhuKtx] = useState("Tất cả");
  const [trangThai, setTrangThai] = useState("Tất cả");
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [absentList, setAbsentList] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadAbsentData = useCallback(
    async (overrides?: { tuNgay?: Date | null; denNgay?: Date | null }) => {
      setLoading(true);
      setError(null);
      try {
        const activeTu =
          overrides && overrides.tuNgay !== undefined
            ? overrides.tuNgay
            : tuNgay;
        const activeDen =
          overrides && overrides.denNgay !== undefined
            ? overrides.denNgay
            : denNgay;

        const formatDate = (
          dateVal: Date | null,
          defaultToToday: boolean,
        ): string => {
          if (dateVal && !isNaN(dateVal.getTime())) {
            const mm = String(dateVal.getMonth() + 1).padStart(2, "0");
            const dd = String(dateVal.getDate()).padStart(2, "0");
            const yyyy = dateVal.getFullYear();
            return `${mm}/${dd}/${yyyy}`;
          }
          const fallbackDate = defaultToToday
            ? getDefaultDates().den
            : getDefaultDates().tu;
          const mm = String(fallbackDate.getMonth() + 1).padStart(2, "0");
          const dd = String(fallbackDate.getDate()).padStart(2, "0");
          const yyyy = fallbackDate.getFullYear();
          return `${mm}/${dd}/${yyyy}`;
        };

        const res = await fetchThongKeRaVao({
          tuNgay: formatDate(activeTu, false),
          denNgay: formatDate(activeDen, true),
        });

        const list = res?.payload || [];
        const endTs =
          activeDen && !isNaN(activeDen.getTime())
            ? activeDen.getTime()
            : Date.now();

        const mappedAbsent = list.map((item: any, index: number) => {
          let lastActiveTs = 0;

          // Tìm timestamp của lần quét thẻ gần nhất trong danh sách vào và ra
          if (Array.isArray(item.danhSachVao)) {
            item.danhSachVao.forEach((s: any) => {
              const tc = Number(s.timecheck);
              if (!isNaN(tc) && tc > 0) {
                const ms = tc < 10000000000 ? tc * 1000 : tc;
                if (ms > lastActiveTs) lastActiveTs = ms;
              }
            });
          }

          if (Array.isArray(item.danhSachRa)) {
            item.danhSachRa.forEach((s: any) => {
              const tc = Number(s.timecheck);
              if (!isNaN(tc) && tc > 0) {
                const ms = tc < 10000000000 ? tc * 1000 : tc;
                if (ms > lastActiveTs) lastActiveTs = ms;
              }
            });
          }

          // Tính số ngày vắng mặt
          let absentDays = 0;
          let lastScanStr = "Chưa quét";

          if (lastActiveTs > 0) {
            const diffMs = endTs - lastActiveTs;
            absentDays = Math.max(
              0,
              Math.floor(diffMs / (1000 * 60 * 60 * 24)),
            );

            const d = new Date(lastActiveTs);
            const dd = String(d.getDate()).padStart(2, "0");
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const yyyy = d.getFullYear();
            lastScanStr = `${dd}/${mm}/${yyyy}`;
          } else {
            // Nếu chưa bao giờ quét thẻ trong kỳ, tính vắng từ ngày bắt đầu truy vấn
            const start = activeTu || getDefaultDates().tu;
            const diffMs = endTs - start.getTime();
            absentDays = Math.max(
              1,
              Math.floor(diffMs / (1000 * 60 * 60 * 24)),
            );
          }

          return {
            stt: index + 1,
            studentId: item.maSinhVien || item.maSo || `SV${index}`,
            hoTen: item.hoTen || "Chưa rõ",
            ktx: resolveKhu(item),
            room: item.maPhong || "--",
            absentDays,
            lastScan: lastScanStr,
            status:
              absentDays > 15
                ? "Cảnh báo"
                : absentDays > 7
                  ? "Nghi vấn"
                  : "Hợp lệ",
          };
        });

        setAbsentList(mappedAbsent);
        console.log("[VangMat] fetchThongKeRaVao payload sample:", list[0]);
      } catch (err: any) {
        setError(err?.message || "Lỗi khi tải dữ liệu sinh viên vắng mặt");
        setAbsentList([]);
      } finally {
        setLoading(false);
      }
    },
    [tuNgay, denNgay],
  );

  useEffect(() => {
    loadAbsentData();
  }, [loadAbsentData]);

  const handleReset = () => {
    setHoTen("");
    setMssv("");
    const defaults = getDefaultDates();
    setTuNgay(defaults.tu);
    setDenNgay(defaults.den);
    setKhuKtx("Tất cả");
    setTrangThai("Tất cả");
    setCurrentPage(1);
    loadAbsentData({ tuNgay: defaults.tu, denNgay: defaults.den });
  };

  const normalizeKhu = (val: string | undefined | null): string => {
    if (!val) return "";
    const s = String(val)
      .toLowerCase()
      .replace(/[_\-\s]+/g, "");
    if (s.includes("a")) return "Khu A";
    if (s.includes("b")) return "Khu B";
    return val;
  };

  // Chỉ hiển thị sinh viên vắng mặt lâu ngày (>= 5 ngày)
  const filteredAbsent = absentList.filter((item) => {
    if (!item) return false;
    // Lọc sinh viên vắng mặt lâu ngày (tối thiểu 5 ngày)
    if ((item.absentDays || 0) < 5) return false;

    const name = item.hoTen || "";
    const id = item.studentId || "";
    const ktxStr = item.ktx || "";
    const statusStr = item.status || "";

    const matchName =
      hoTen.trim() === "" || name.toLowerCase().includes(hoTen.toLowerCase());
    const matchMssv =
      mssv.trim() === "" || id.toLowerCase().includes(mssv.toLowerCase());
    const matchKhu = khuKtx === "Tất cả" || normalizeKhu(ktxStr) === khuKtx;
    const matchTrangThai = trangThai === "Tất cả" || statusStr === trangThai;
    return matchName && matchMssv && matchKhu && matchTrangThai;
  });

  const totalPages = Math.ceil(filteredAbsent.length / pageSize);
  const paginatedAbsent = filteredAbsent.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // Calculate dynamic bar chart from data — phân nhóm vắng mặt
  const chartData = [
    {
      name: t("range5to10") || "5–10",
      value: filteredAbsent.filter(
        (s) => s.absentDays >= 5 && s.absentDays <= 10,
      ).length,
    },
    {
      name: t("range11to15") || "11–15",
      value: filteredAbsent.filter(
        (s) => s.absentDays > 10 && s.absentDays <= 15,
      ).length,
    },
    {
      name: t("rangeOver15") || "Trên 15",
      value: filteredAbsent.filter((s) => s.absentDays > 15).length,
    },
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
        title={t("absentTitle")}
        description="Theo dõi thống kê sinh viên vắng mặt kéo dài theo thời gian, khu vực và mức độ cảnh báo."
        icon={<IconReportAnalytics size={20} color="#1f5ca9" />}
      />

      <Card
        withBorder
        radius="lg"
        p="md"
        style={{
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
          borderColor: "#e2e8f0",
        }}
      >
        {!showAdvancedFilter ? (
          // ==================== THU GỌN ====================
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr)) auto",
              gap: "16px",
              alignItems: "end",
            }}
          >
            <DateInput
              label={t("fromDate")}
              placeholder="MM/DD/YYYY"
              value={tuNgay}
              onChange={(val) => setTuNgay(val ? new Date(val) : null)}
              valueFormat="DD/MM/YYYY"
              clearable
              styles={{
                label: {
                  fontSize: "12px",
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
              label={t("toDate")}
              placeholder="MM/DD/YYYY"
              value={denNgay}
              onChange={(val) => setDenNgay(val ? new Date(val) : null)}
              valueFormat="DD/MM/YYYY"
              clearable
              styles={{
                label: {
                  fontSize: "12px",
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
              label={t("dormZone")}
              value={khuKtx}
              onChange={(val) => setKhuKtx(val || "Tất cả")}
              data={[
                { value: "Tất cả", label: t("all") },
                { value: "Khu A", label: t("dormA") },
                { value: "Khu B", label: t("dormB") },
              ]}
              styles={{
                label: {
                  fontSize: "12px",
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
              label={t("status")}
              value={trangThai}
              onChange={(val) => setTrangThai(val || "Tất cả")}
              data={[
                { value: "Tất cả", label: t("all") },
                {
                  value: "Cảnh báo",
                  label: t("statusWarning") || "Cảnh báo",
                },
                {
                  value: "Nghi vấn",
                  label: t("statusSuspicious") || "Nghi vấn",
                },
                {
                  value: "Hợp lệ",
                  label: t("statusValid") || "Hợp lệ",
                },
              ]}
              styles={{
                label: {
                  fontSize: "12px",
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

            <Box
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "end",
              }}
            >
              <Group gap={10} wrap="nowrap">
                <Button
                  leftSection={
                    loading ? (
                      <Loader size={16} color="white" />
                    ) : (
                      <IconSearch size={17} />
                    )
                  }
                  onClick={() => loadAbsentData()}
                  disabled={loading}
                  style={{
                    backgroundColor: "#1f5ca9",
                    borderRadius: "10px",
                    height: "40px",
                    minWidth: "128px",
                    fontWeight: 600,
                    fontSize: "14px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("search")}
                </Button>

                <Button
                  leftSection={<IconRefresh size={17} />}
                  variant="outline"
                  color="gray"
                  onClick={handleReset}
                  style={{
                    borderColor: "#cbd5e1",
                    color: "#64748b",
                    borderRadius: "10px",
                    height: "40px",
                    minWidth: "118px",
                    fontWeight: 600,
                    fontSize: "14px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("reset")}
                </Button>

                <Button
                  leftSection={<IconDownload size={17} />}
                  variant="outline"
                  style={{
                    borderColor: "#1f5ca9",
                    color: "#1f5ca9",
                    borderRadius: "10px",
                    height: "40px",
                    minWidth: "136px",
                    fontWeight: 600,
                    fontSize: "14px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("exportExcel")}
                </Button>

                <Button
                  leftSection={<IconDownload size={17} />}
                  variant="outline"
                  style={{
                    borderColor: "#60a5fa",
                    color: "#3b82f6",
                    borderRadius: "10px",
                    height: "40px",
                    minWidth: "128px",
                    fontWeight: 600,
                    fontSize: "14px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("exportPdf")}
                </Button>

                <ActionIcon
                  variant="outline"
                  color="gray"
                  size="lg"
                  aria-label="Thu gọn bộ lọc"
                  onClick={() => setShowAdvancedFilter(true)}
                  style={{
                    borderColor: "#cbd5e1",
                    borderRadius: "10px",
                    height: "40px",
                    width: "40px",
                    minWidth: "40px",
                  }}
                >
                  <IconChevronDown size={18} color="#64748b" />
                </ActionIcon>
              </Group>
            </Box>
          </Box>
        ) : (
          // ==================== MỞ RỘNG ====================
          <Stack gap={12}>
            {/* Hàng 1 */}
            <SimpleGrid
              cols={{ base: 1, sm: 2, md: 4 }}
              spacing="md"
              verticalSpacing="md"
            >
              <DateInput
                label={t("fromDate")}
                placeholder="MM/DD/YYYY"
                value={tuNgay}
                onChange={(val) => setTuNgay(val ? new Date(val) : null)}
                valueFormat="DD/MM/YYYY"
                clearable
                styles={{
                  label: {
                    fontSize: "12px",
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
                label={t("toDate")}
                placeholder="MM/DD/YYYY"
                value={denNgay}
                onChange={(val) => setDenNgay(val ? new Date(val) : null)}
                valueFormat="DD/MM/YYYY"
                clearable
                styles={{
                  label: {
                    fontSize: "12px",
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
                label={t("dormZone")}
                value={khuKtx}
                onChange={(val) => setKhuKtx(val || "Tất cả")}
                data={[
                  { value: "Tất cả", label: t("all") },
                  { value: "Khu A", label: t("dormA") },
                  { value: "Khu B", label: t("dormB") },
                ]}
                styles={{
                  label: {
                    fontSize: "12px",
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
                label={t("status")}
                value={trangThai}
                onChange={(val) => setTrangThai(val || "Tất cả")}
                data={[
                  { value: "Tất cả", label: t("all") },
                  {
                    value: "Cảnh báo",
                    label: t("statusWarning") || "Cảnh báo",
                  },
                  {
                    value: "Nghi vấn",
                    label: t("statusSuspicious") || "Nghi vấn",
                  },
                  {
                    value: "Hợp lệ",
                    label: t("statusValid") || "Hợp lệ",
                  },
                ]}
                styles={{
                  label: {
                    fontSize: "12px",
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
            </SimpleGrid>

            {/* Hàng 2 */}
            <Box
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(220px, 1fr) minmax(220px, 1fr) auto",
                gap: "16px",
                alignItems: "end",
              }}
            >
              <TextInput
                label={t("fullName")}
                placeholder={`${t("enterFullName")}...`}
                value={hoTen}
                onChange={(e) => setHoTen(e.currentTarget.value)}
                styles={{
                  label: {
                    fontSize: "12px",
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

              <TextInput
                label={t("studentId")}
                placeholder={`${t("enterMssv")}...`}
                value={mssv}
                onChange={(e) => setMssv(e.currentTarget.value)}
                styles={{
                  label: {
                    fontSize: "12px",
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
                    loading ? (
                      <Loader size={16} color="white" />
                    ) : (
                      <IconSearch size={16} />
                    )
                  }
                  onClick={() => loadAbsentData()}
                  disabled={loading}
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

                <ActionIcon
                  variant="outline"
                  color="gray"
                  size="lg"
                  aria-label="Thu gọn bộ lọc"
                  onClick={() => setShowAdvancedFilter(false)}
                  style={{
                    borderColor: "#cbd5e1",
                    borderRadius: "8px",
                    height: "40px",
                    width: "40px",
                    minWidth: "40px",
                  }}
                >
                  <IconChevronUp size={18} color="#64748b" />
                </ActionIcon>
              </Group>
            </Box>
          </Stack>
        )}
      </Card>

      {error && (
        <Badge
          color="red"
          variant="light"
          size="lg"
          style={{ width: "100%", padding: "12px", borderRadius: "8px" }}
        >
          {error}
        </Badge>
      )}

      {loading ? (
        <Center py="xl">
          <Stack align="center" gap="sm">
            <Loader size="md" color="blue" />
            <Text size="sm" c="dimmed">
              {t("loading")}
            </Text>
          </Stack>
        </Center>
      ) : (
        <>
          <Grid gutter="md">
            <Grid.Col span={12}>
              <Card
                withBorder
                radius="lg"
                p="lg"
                style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}
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
                  {t("absentChartTitle")}
                </Text>
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 18,
                        right: 16,
                        left: 0,
                        bottom: 4,
                      }}
                      barCategoryGap="32%"
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#d1d5db"
                      />

                      <XAxis
                        dataKey="name"
                        interval={0}
                        tick={{
                          fontSize: 12,
                          fill: "#475569",
                        }}
                        tickLine={false}
                        axisLine={{
                          stroke: "#94a3b8",
                        }}
                      />

                      <YAxis
                        allowDecimals={false}
                        width={40}
                        tick={{
                          fontSize: 12,
                          fill: "#475569",
                        }}
                        tickLine={false}
                        axisLine={{
                          stroke: "#94a3b8",
                        }}
                      />

                      <Tooltip
                        cursor={{
                          fill: "rgba(148, 163, 184, 0.08)",
                        }}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 4px 14px rgba(15, 23, 42, 0.08)",
                          fontSize: "12px",
                        }}
                        formatter={(value) => [
                          `${value} sinh viên`,
                          "Số lượng",
                        ]}
                        labelFormatter={(label) => `Thời gian vắng: ${label}`}
                      />

                      <Bar
                        dataKey="value"
                        name="Số lượng"
                        fill="#1f5ca9"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={76}
                        label={{
                          position: "top",
                          fill: "#475569",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <AbsentChartLegend />
              </Card>
            </Grid.Col>
          </Grid>

          <Card
            withBorder
            radius="lg"
            p="lg"
            style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}
          >
            <Group justify="space-between" mb="md">
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
                {t("absentTableTitle")}
              </Text>
            </Group>

            <ScrollArea>
              <Table
                verticalSpacing="sm"
                highlightOnHover
                style={{ minWidth: 800 }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th
                      style={{
                        color: "#475569",
                        fontWeight: 600,
                        fontSize: "12px",
                      }}
                    >
                      {t("no")}
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: "#475569",
                        fontWeight: 600,
                        fontSize: "12px",
                      }}
                    >
                      {t("studentId")}
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: "#475569",
                        fontWeight: 600,
                        fontSize: "12px",
                      }}
                    >
                      {t("fullName")}
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: "#475569",
                        fontWeight: 600,
                        fontSize: "12px",
                      }}
                    >
                      {t("dormZone")}
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: "#475569",
                        fontWeight: 600,
                        fontSize: "12px",
                      }}
                    >
                      {t("room")}
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: "#475569",
                        fontWeight: 600,
                        fontSize: "12px",
                        textAlign: "center",
                      }}
                    >
                      {t("daysAbsent")}
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: "#475569",
                        fontWeight: 600,
                        fontSize: "12px",
                      }}
                    >
                      {t("lastActive")}
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: "#475569",
                        fontWeight: 600,
                        fontSize: "12px",
                        textAlign: "center",
                      }}
                    >
                      {t("status")}
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {paginatedAbsent.map((row, index) => (
                    <Table.Tr
                      key={row.studentId || index}
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                    >
                      <Table.Td style={{ fontSize: "13px", color: "#64748b" }}>
                        {(currentPage - 1) * pageSize + index + 1}
                      </Table.Td>
                      <Table.Td
                        style={{
                          fontSize: "13px",
                          color: "#64748b",
                          fontFamily: "monospace",
                        }}
                      >
                        {row.studentId}
                      </Table.Td>
                      <Table.Td
                        style={{
                          fontSize: "13px",
                          color: "#1e293b",
                          fontWeight: 600,
                        }}
                      >
                        {row.hoTen}
                      </Table.Td>
                      <Table.Td style={{ fontSize: "13px", color: "#475569" }}>
                        {getTranslatedKhu(row.ktx)}
                      </Table.Td>
                      <Table.Td style={{ fontSize: "13px", color: "#475569" }}>
                        {row.room}
                      </Table.Td>
                      <Table.Td
                        style={{
                          fontSize: "13px",
                          color: "#e03131",
                          fontWeight: 700,
                          textAlign: "center",
                        }}
                      >
                        {t("daysCount", { days: row.absentDays })}
                      </Table.Td>
                      <Table.Td style={{ fontSize: "13px", color: "#475569" }}>
                        {row.lastScan}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        <Badge
                          color={
                            row.status === "Cảnh báo"
                              ? "red"
                              : row.status === "Nghi vấn"
                                ? "orange"
                                : "green"
                          }
                          variant="light"
                          size="sm"
                        >
                          {getTranslatedStatus(row.status)}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  {paginatedAbsent.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={8}>
                        <Text ta="center" c="dimmed" py="xl">
                          {t("noData")}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            <CustomPagination
              totalItems={filteredAbsent.length}
              totalPages={totalPages}
              page={currentPage}
              pageSize={pageSize}
              setPage={setCurrentPage}
              setPageSize={() => {}}
            />
          </Card>
        </>
      )}
    </Stack>
  );
}
