"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { DateInput } from "@mantine/dates";
import {
  Card,
  Group,
  Text,
  Table,
  Avatar,
  Stack,
  Select,
  Button,
  Loader,
  Center,
  Box,
} from "@mantine/core";
import {
  IconSearch,
  IconRefresh,
  IconDownload,
  IconReportAnalytics,
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
import { xuatRaFileExcel } from "@/components/common/excel/excelHelper";
import { xuatRaFilePdf } from "@/components/common/pdf/pdfHelper";
import { showNoti } from "@/components/common/showNoti";

const getDefaultDates = () => {
  const den = new Date();
  const tu = new Date(2026, 4, 5); // Ngày 5 tháng 5 năm 2026
  return { tu, den };
};

const getCurrentYearDetailDates = () => {
  const den = new Date();
  const tu = new Date(den.getFullYear(), 0, 1);
  return { tu, den };
};

const STRANGER_EXPORT_TITLE = "Danh s\u00e1ch ng\u01b0\u1eddi l\u1ea1";
const STRANGER_EXPORT_SHEET = "Ng\u01b0\u1eddi l\u1ea1";
const STRANGER_EXPORT_COLUMNS = [
  "STT",
  "Camera",
  "M\u00e3 khu",
  "KTX",
  "Ng\u00e0y",
  "Gi\u1edd",
];
const DATE_RANGE_ERROR = "Đến ngày không được nhỏ hơn từ ngày.";

const getDateOnlyTime = (dateVal: Date | null) => {
  if (!dateVal || Number.isNaN(dateVal.getTime())) return null;

  return new Date(
    dateVal.getFullYear(),
    dateVal.getMonth(),
    dateVal.getDate(),
  ).getTime();
};

const isInvalidDateRange = (fromDate: Date | null, toDate: Date | null) => {
  const fromTime = getDateOnlyTime(fromDate);
  const toTime = getDateOnlyTime(toDate);

  return fromTime !== null && toTime !== null && toTime < fromTime;
};

const StrangerChartLegend = ({ label }: { label: string }) => {
  return (
    <Group justify="center" align="flex-end" gap="lg" mt={8} wrap="wrap">
      <Box
        style={{
          position: "relative",
          width: 78,
          height: 40,
          flexShrink: 0,
        }}
      >
        <Text
          size="10px"
          fw={600}
          c="#64748b"
          style={{
            position: "absolute",
            top: -2,
            left: 0,
          }}
        >
          {"S\u1ed1 l\u01b0\u1ee3ng"}
        </Text>
        <Box
          style={{
            position: "absolute",
            left: 5,
            bottom: 4,
            width: 1,
            height: 21,
            backgroundColor: "#94a3b8",
          }}
        />
        <Box
          style={{
            position: "absolute",
            left: 5,
            bottom: 4,
            width: 45,
            height: 1,
            backgroundColor: "#94a3b8",
          }}
        />
        <Box
          style={{
            position: "absolute",
            left: 16,
            bottom: 5,
            width: 10,
            height: 13,
            borderRadius: "2px 2px 0 0",
            backgroundColor: "#1f5ca9",
          }}
        />
        <Text
          size="10px"
          fw={600}
          c="#64748b"
          style={{
            position: "absolute",
            right: -4,
            bottom: 0,
          }}
        >
          {"Ng\u00e0y"}
        </Text>
      </Box>

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
          {label}
        </Text>
      </Group>
    </Group>
  );
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
  const [dangXuat, setDangXuat] = useState<"excel" | "pdf" | null>(null);

  // State for daily quantity chart
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);

  const [detailList, setDetailList] = useState<NguoiLaItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [detailPage, setDetailPage] = useState(1);
  const [detailPageSize, setDetailPageSize] = useState(10);
  const [detailTotalPages, setDetailTotalPages] = useState(1);
  const [detailTotalElements, setDetailTotalElements] = useState(0);

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

  const formatChartDateLabel = (value: string) => {
    if (!value) return "";

    const parsedDate = parseDateStr(value);
    if (!parsedDate) return value;

    return formatDateToDDMMYYYY(parsedDate, parsedDate);
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

    if (dateStr.includes("/")) {
      const parts = dateStr.split("/");

      if (parts.length === 3) {
        const part0 = parseInt(parts[0], 10);
        const part1 = parseInt(parts[1], 10);
        const part2 = parseInt(parts[2], 10);

        if (Number.isNaN(part0) || Number.isNaN(part1) || Number.isNaN(part2)) {
          return null;
        }

        // Chart data is displayed in Vietnamese date order, so prefer DD/MM/YYYY
        // for ambiguous values such as 06/01/2026.
        if (part0 > 12) {
          return new Date(part2, part1 - 1, part0);
        }

        if (part1 > 12) {
          return new Date(part2, part0 - 1, part1);
        }

        return new Date(part2, part1 - 1, part0);
      }
    }

    if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);

        if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
          return null;
        }

        return new Date(year, month - 1, day);
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

        if (isInvalidDateRange(activeTu, activeDen)) {
          setNguoiLaError(DATE_RANGE_ERROR);
          setNguoiLaList([]);
          setNguoiLaTotalPages(1);
          setNguoiLaTotalElements(0);
          return;
        }

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

        if (isInvalidDateRange(activeTu, activeDen)) {
          setChartError(DATE_RANGE_ERROR);
          setChartData([]);
          return;
        }

        const body = {
          tuNgay: formatDateToMMDDYYYY(activeTu, getDefaultDates().tu),
          denNgay: formatDateToMMDDYYYY(activeDen, getDefaultDates().den),
          maKhu: activeKhu,
        };

        const res = await fetchThongKeNguoiLa(body);
        const normalizedChartData = (res?.payload || []).map((item: any) => {
          const parsedDate = parseDateStr(item?.ngay);

          return {
            ...item,
            ngay: parsedDate
              ? formatDateToDDMMYYYY(parsedDate, parsedDate)
              : item?.ngay,
          };
        });

        const sortedChartData = [...normalizedChartData].sort((a, b) => {
          const dateA = parseDateStr(a?.ngay);
          const dateB = parseDateStr(b?.ngay);

          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;

          return dateA.getTime() - dateB.getTime();
        });

        setChartData(sortedChartData);
      } catch (err: any) {
        setChartError(err?.message ?? "Lỗi khi tải biểu đồ người lạ");
        setChartData([]);
      } finally {
        setChartLoading(false);
      }
    },
    [khuKtx, tuNgay, denNgay],
  );

  // 4. Fetch Stranger Daily Details List
  const loadStrangerDailyDetails = useCallback(
    async (
      page: number,
      pageSize: number,
      overrides?: {
        tuNgay?: Date | null;
        denNgay?: Date | null;
        maKhu?: string;
      },
    ) => {
      setDetailLoading(true);
      setDetailError(null);

      const defaultDetailDates = getCurrentYearDetailDates();
      const activeTuNgay =
        overrides && overrides.tuNgay !== undefined ? overrides.tuNgay : tuNgay;
      const activeDenNgay =
        overrides && overrides.denNgay !== undefined
          ? overrides.denNgay
          : denNgay;
      const activeKhu =
        overrides && overrides.maKhu !== undefined ? overrides.maKhu : khuKtx;

      if (isInvalidDateRange(activeTuNgay, activeDenNgay)) {
        setDetailError(DATE_RANGE_ERROR);
        setDetailList([]);
        setDetailTotalPages(1);
        setDetailTotalElements(0);
        setDetailLoading(false);
        return;
      }

      if (!activeTuNgay || !activeDenNgay) {
        setDetailList([]);
        setDetailTotalPages(1);
        setDetailTotalElements(0);
        setDetailLoading(false);
        return;
      }

      try {
        const tuNgayChiTiet = formatDateToMMDDYYYY(
          activeTuNgay,
          defaultDetailDates.tu,
        );
        const denNgayChiTiet = formatDateToMMDDYYYY(
          activeDenNgay,
          defaultDetailDates.den,
        );
        const res = await fetchThongKeChiTietNguoiLa({
          tuNgay: tuNgayChiTiet,
          denNgay: denNgayChiTiet,
          maKhu: activeKhu,
          page,
          pageSize,
        });

        const payload = res?.payload;

        const items = Array.isArray(payload)
          ? payload
          : (payload?.items ?? payload?.content ?? []);

        const totalElements = Array.isArray(payload)
          ? items.length
          : (payload?.totalElements ??
            payload?.totalItems ??
            payload?.numberOfElements ??
            items.length);

        const totalPages = Array.isArray(payload)
          ? Math.max(1, Math.ceil(totalElements / pageSize))
          : (payload?.totalPages ??
            Math.max(1, Math.ceil(totalElements / pageSize)));

        setDetailList(items);
        setDetailTotalElements(totalElements);
        setDetailTotalPages(totalPages);
      } catch (err: any) {
        setDetailError(
          err?.message ?? "Lỗi khi tải chi tiết người lạ trong ngày",
        );

        setDetailList([]);
        setDetailTotalPages(1);
        setDetailTotalElements(0);
      } finally {
        setDetailLoading(false);
      }
    },
    [khuKtx, tuNgay, denNgay],
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
    loadStrangerDailyDetails(detailPage, detailPageSize);
  }, [detailPage, detailPageSize, loadStrangerDailyDetails]);

  // Search Handler
  const handleSearch = () => {
    setNguoiLaPage(1);
    setDetailPage(1);

    if (isInvalidDateRange(tuNgay, denNgay)) {
      setNguoiLaError(DATE_RANGE_ERROR);
      setChartError(DATE_RANGE_ERROR);
      setDetailError(DATE_RANGE_ERROR);
      setNguoiLaList([]);
      setNguoiLaTotalPages(1);
      setNguoiLaTotalElements(0);
      setChartData([]);
      setDetailList([]);
      setDetailTotalPages(1);
      setDetailTotalElements(0);
      showNoti("error", DATE_RANGE_ERROR);
      return;
    }

    loadNguoiLaHistory(1);
    loadChartData();
    loadStrangerDailyDetails(1, detailPageSize);
  };

  // Reset Handler
  const handleReset = () => {
    const defaults = getDefaultDates();
    const detailDefaults = getCurrentYearDetailDates();
    setTuNgay(defaults.tu);
    setDenNgay(defaults.den);
    setKhuKtx("-1");
    setNguoiLaPage(1);
    setDetailPage(1);

    loadNguoiLaHistory(1, {
      tuNgay: defaults.tu,
      denNgay: defaults.den,
      maKhu: "-1",
    });
    loadChartData({ tuNgay: defaults.tu, denNgay: defaults.den, maKhu: "-1" });
    loadStrangerDailyDetails(1, detailPageSize, {
      tuNgay: detailDefaults.tu,
      denNgay: detailDefaults.den,
      maKhu: "-1",
    });
  };

  // Handle chart node click to view details of that clicked date
  const handleChartClick = (nextState: any) => {
    if (nextState && nextState.activeLabel) {
      const parsedDate = parseDateStr(nextState.activeLabel);
      if (parsedDate) {
        setDetailPage(1);

        loadStrangerDailyDetails(1, detailPageSize, {
          tuNgay: parsedDate,
          denNgay: parsedDate,
        });
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

  const taoDuLieuXuatNguoiLa = (items: NguoiLaItem[]) => {
    return items.map((item, index) => ({
      STT: index + 1,
      Camera: item.cameraName || `Camera ${item.cameraId || "--"}`,
      "M\u00e3 khu": item.maKhu || "--",
      KTX: item.tenKhu || getTranslatedKhu(item.maKhu || "") || "--",
      "Ng\u00e0y": item.ngay || "--",
      "Gi\u1edd":
        item.thoiGian ||
        (item.timecheck ? String(item.timecheck).substring(11, 19) : "--"),
    }));
  };

  const xuLyXuatExcel = async () => {
    if (dangXuat) return;

    setDangXuat("excel");
    try {
      const fileName = `Danh_Sach_Nguoi_La_${new Date().toISOString().split("T")[0]}`;

      await xuatRaFileExcel(
        taoDuLieuXuatNguoiLa(detailList),
        fileName,
        STRANGER_EXPORT_SHEET,
        {
          soCot: STRANGER_EXPORT_COLUMNS.length,
          nhanCot: STRANGER_EXPORT_COLUMNS,
          tieuDe: STRANGER_EXPORT_TITLE,
          soCotKhoiTieuNgu: 6,
        },
      );
      showNoti("success", t("exportExcelSuccess"));
    } catch (error) {
      console.error("Lỗi khi xuất Excel danh sách người lạ:", error);
      showNoti("error", t("exportError"));
    } finally {
      setDangXuat(null);
    }
  };

  const xuLyXuatPdf = async () => {
    if (dangXuat) return;

    setDangXuat("pdf");
    try {
      const fileName = `Danh_Sach_Nguoi_La_${new Date().toISOString().split("T")[0]}`;

      await xuatRaFilePdf(taoDuLieuXuatNguoiLa(detailList), fileName, {
        soCot: STRANGER_EXPORT_COLUMNS.length,
        nhanCot: STRANGER_EXPORT_COLUMNS,
        tieuDe: STRANGER_EXPORT_TITLE,
      });
      showNoti("success", t("exportPdfSuccess"));
    } catch (error) {
      console.error("Lỗi khi xuất PDF danh sách người lạ:", error);
      showNoti("error", t("exportError"));
    } finally {
      setDangXuat(null);
    }
  };

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
            minDate={tuNgay || undefined}
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
              onClick={() => void xuLyXuatExcel()}
              loading={dangXuat === "excel"}
              disabled={dangXuat !== null}
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
              onClick={() => void xuLyXuatPdf()}
              loading={dangXuat === "pdf"}
              disabled={dangXuat !== null}
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
              {chartError}
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
          <>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  // onClick={handleChartClick}
                  // style={{ cursor: "pointer" }}
                  margin={{
                    top: 8,
                    right: 12,
                    left: 0,
                    bottom: 2,
                  }}
                  barCategoryGap="18%"
                  barGap={4}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#d1d5db"
                  />
                  <XAxis
                    dataKey="ngay"
                    interval="preserveStartEnd"
                    minTickGap={24}
                    height={54}
                    tickMargin={10}
                    angle={-25}
                    textAnchor="end"
                    tickFormatter={formatChartDateLabel}
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
                    formatter={(value) => [`${value} người lạ`, "Số lượng"]}
                    labelFormatter={(value) => `Ngày: ${value}`}
                  />
                  <Bar
                    dataKey="soLuong"
                    name={t("strangerCount") || "Số lượng người lạ"}
                    fill="#1f5ca9"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={34}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <StrangerChartLegend
              label={t("strangerCount") || "Số lượng người lạ"}
            />
          </>
        )}
      </Card>

      {/* Cụm chi tiết người lạ */}
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
              {detailError}
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
                  Hình ảnh
                </Table.Th>
                <Table.Th style={{ width: 180 }}>Camera</Table.Th>
                <Table.Th style={{ width: 90, textAlign: "center" }}>
                  Mã khu
                </Table.Th>
                <Table.Th style={{ width: 180 }}>KTX</Table.Th>
                <Table.Th style={{ width: 120, textAlign: "center" }}>
                  Ngày
                </Table.Th>
                <Table.Th style={{ width: 100, textAlign: "center" }}>
                  Giờ
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
                    {(detailPage - 1) * detailPageSize + idx + 1}
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
                        {t("noImage") || "Không có ảnh"}
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
                    {item.tenKhu || getTranslatedKhu(item.maKhu || "") || "--"}
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
                        "Không phát hiện người lạ nào trong ngày này."}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        )}
        {!detailLoading && !detailError && detailList.length > 0 && (
          <CustomPagination
            totalItems={detailTotalElements}
            totalPages={detailTotalPages}
            page={detailPage}
            pageSize={detailPageSize}
            setPage={setDetailPage}
            setPageSize={setDetailPageSize}
          />
        )}
      </Card>
    </Stack>
  );
}
