"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
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
  Button,
  ThemeIcon,
  Loader,
  Center,
  Modal,
  Textarea,
  ActionIcon,
  Tooltip,
  Divider,
  Alert,
  Paper,
  Box,
  Transition,
  SimpleGrid,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
  IconSearch,
  IconRefresh,
  IconDownload,
  IconReportAnalytics,
  IconPlus,
  IconEdit,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconUserSearch,
  IconCalendar,
  IconFileText,
} from "@tabler/icons-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  fetchSinhVienCamPaginate,
  createOrUpdateSinhVienCam,
  fetchSinhVienPaginate,
  fetchThongKeSvBiCamNoPhi,
} from "@/services/dashboard/dashboardService";
import PageSectionHeader from "@/components/common/PageSectionHeader";
import CustomPagination from "@/components/common/CustomPagination";

interface BannedItem {
  camId: number;
  sinhVienId: number;
  lyDo: string;
  ngayBatDau: number | null;
  ngayKetThuc: number | null;
  loaiSuKienId: number;
  maSinhVien: string;
  hoTen?: string;
  tenLoaiSuKien?: string | null;
}

interface ThongKeBannedDetail {
  lyDo?: string | null;
  tenLoaiSuKien?: string | null;
  loaiSuKienId?: number | null;
  ngayBatDau?: string | null;
  ngayKetThuc?: string | null;
}

interface ThongKeBannedStudent {
  maSinhVien?: string | null;
  hoTen?: string | null;
  maLop?: string | null;
  maPhong?: string | null;
  tongSoLanBiCam?: number;
  tongSoLanNoPhi?: number;
  danhSachCam?: ThongKeBannedDetail[];
  danhSachNoPhi?: ThongKeBannedDetail[];
}

interface SinhVienSuggestion {
  sinhVienId: number | string;
  maSinhVien: string;
  hoTen: string;
  maPhong?: string;
  maKhu?: string;
}

interface FormState {
  camId?: number;
  sinhVienId: string;
  maSinhVien: string;
  hoTen: string;
  lyDo: string;
  ngayBatDau: Date | null;
  ngayKetThuc: Date | null;
  loaiSuKienId: string;
}

interface FormErrors {
  maSinhVien?: string;
  lyDo?: string;
  ngayBatDau?: string;
}

const PAGE_SIZE = 10;

function formatDateApi(d: Date | null): string {
  if (!d || isNaN(d.getTime())) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function formatTimestamp(ts: number | null): string {
  if (!ts) return "—";
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatDateRangeApi(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

const defaultForm: FormState = {
  sinhVienId: "",
  maSinhVien: "",
  hoTen: "",
  lyDo: "",
  ngayBatDau: null,
  ngayKetThuc: null,
  loaiSuKienId: "2",
};

function makeDefaultForm(): FormState {
  return { ...defaultForm, ngayBatDau: new Date() };
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #cbd5e1",
          padding: "10px 12px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          maxWidth: "320px",
          fontFamily: "var(--font-readex-pro), sans-serif",
        }}
      >
        <p
          style={{
            margin: 0,
            fontWeight: 700,
            fontSize: "13px",
            color: "#1e293b",
          }}
        >
          {data.fullName}
        </p>
        <p
          style={{
            margin: "4px 0 0 0",
            fontSize: "11px",
            color: "#dc2626",
            lineHeight: "1.4",
            wordBreak: "break-word",
            whiteSpace: "normal",
          }}
        >
          <span style={{ fontWeight: 600 }}>Lý do cấm:</span>{" "}
          {data.lyDo || "Không rõ lý do"}
        </p>
      </div>
    );
  }
  return null;
};

const BannedChartLegend = () => {
  return (
    <Group justify="center" align="flex-end" gap="md" mt={8} wrap="wrap">
      {/* Minh họa trục biểu đồ */}
      <Box
        style={{
          position: "relative",
          width: 96,
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
          Số lượng
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
          Mã số
        </Text>
      </Box>

      {/* Chú thích cột */}
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
          Sinh viên bị cấm
        </Text>
      </Group>
    </Group>
  );
};

export default function BiCamSubPage() {
  const t = useTranslations("Statistics");

  const getTranslatedStatus = (statusName: string) => {
    if (statusName === "Đang cấm") return t("banning");
    if (statusName === "Hết hạn") return t("expired");
    return statusName;
  };

  const [hoTenFilter, setHoTenFilter] = useState("");
  const [mssvFilter, setMssvFilter] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bannedList, setBannedList] = useState<BannedItem[]>([]);
  const [svNameMap, setSvNameMap] = useState<Record<string, string>>({});
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Toast notifications
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [form, setForm] = useState<FormState>(defaultForm);

  // Student search autocomplete
  const [svSearch, setSvSearch] = useState("");
  const [svSuggestions, setSvSuggestions] = useState<SinhVienSuggestion[]>([]);
  const [svLoading, setSvLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const svSearchRef = useRef<HTMLDivElement>(null);
  const svDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const loadBannedThongKeData = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const today = new Date();
        const fromDate = new Date(today.getFullYear(), 0, 1);

        const res = await fetchThongKeSvBiCamNoPhi({
          tuNgay: formatDateRangeApi(fromDate),
          denNgay: formatDateRangeApi(today),
          keyword: mssvFilter.trim() || "",
          maKhu: "-1",
          maPhong: "-1",
        } as any);

        const payload: ThongKeBannedStudent[] = Array.isArray(res?.payload)
          ? res.payload
          : [];

        const flattened: BannedItem[] = payload.flatMap(
          (student, studentIndex) =>
            (student.danhSachCam || []).map((item, itemIndex) => ({
              camId: studentIndex * 1000 + itemIndex + 1,
              sinhVienId: 0,
              lyDo: item.lyDo || "",
              ngayBatDau: item.ngayBatDau
                ? new Date(item.ngayBatDau).getTime()
                : null,
              ngayKetThuc: item.ngayKetThuc
                ? new Date(item.ngayKetThuc).getTime()
                : null,
              loaiSuKienId: Number(item.loaiSuKienId ?? 0),
              maSinhVien: student.maSinhVien || "",
              hoTen: student.hoTen || undefined,
              tenLoaiSuKien: item.tenLoaiSuKien || null,
            })),
        );

        const filtered = flattened.filter((item) => {
          const mssvMatch =
            !mssvFilter ||
            (item.maSinhVien || "")
              .toLowerCase()
              .includes(mssvFilter.toLowerCase());
          const nameMatch =
            !hoTenFilter ||
            (item.hoTen || "")
              .toLowerCase()
              .includes(hoTenFilter.toLowerCase());
          return mssvMatch && nameMatch;
        });

        const total = filtered.length;
        const start = (page - 1) * PAGE_SIZE;
        const pagedItems = filtered.slice(start, start + PAGE_SIZE);

        setBannedList(pagedItems);
        setSvNameMap(
          filtered.reduce<Record<string, string>>((acc, item) => {
            if (item.maSinhVien && item.hoTen) {
              acc[item.maSinhVien] = item.hoTen;
            }
            return acc;
          }, {}),
        );
        setTotalElements(total);
        setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
      } catch (err: any) {
        setError(
          err?.message || "Lỗi khi tải dữ liệu sinh viên bị cấm từ thống kê",
        );
        setBannedList([]);
        setTotalElements(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [hoTenFilter, mssvFilter],
  );

  useEffect(() => {
    loadBannedThongKeData(currentPage);
  }, [currentPage, loadBannedThongKeData]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        svSearchRef.current &&
        !svSearchRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Debounce student search
  const handleSvSearchChange = (value: string) => {
    setSvSearch(value);
    setForm((f) => ({ ...f, maSinhVien: value, sinhVienId: "", hoTen: "" }));
    if (svDebounceRef.current) clearTimeout(svDebounceRef.current);
    if (!value.trim()) {
      setSvSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    svDebounceRef.current = setTimeout(async () => {
      setSvLoading(true);
      try {
        const res = await fetchSinhVienPaginate({
          page: 1,
          pageSize: 20,
          maKhu: "-1",
          maPhong: "-1",
          maSinhVien: value.trim(),
        });
        const items: any[] = res?.payload?.items ?? [];
        const mapped: SinhVienSuggestion[] = items.map((sv) => ({
          sinhVienId: sv.sinhVienId || sv.id || "",
          maSinhVien: sv.maSinhVien || "",
          hoTen: sv.hoTen || sv.ten || sv.hoVaTen || sv.maSinhVien || "",
          maPhong: sv.maPhong || "",
          maKhu: sv.maKhu || "",
        }));
        setSvSuggestions(mapped);
        setShowSuggestions(mapped.length > 0);
      } catch {
        setSvSuggestions([]);
      } finally {
        setSvLoading(false);
      }
    }, 350);
  };

  const handleSelectSv = (sv: SinhVienSuggestion) => {
    setSvSearch(sv.maSinhVien);
    setForm((f) => ({
      ...f,
      sinhVienId: String(sv.sinhVienId),
      maSinhVien: sv.maSinhVien,
      hoTen: sv.hoTen,
    }));
    setSvSuggestions([]);
    setShowSuggestions(false);
    setFormErrors((e) => ({ ...e, maSinhVien: undefined }));
  };

  const handleReset = () => {
    setHoTenFilter("");
    setMssvFilter("");
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadBannedThongKeData(1);
  };

  const validateForm = (): boolean => {
    const errs: FormErrors = {};
    if (!form.maSinhVien.trim()) errs.maSinhVien = t("validateBannedMssv");
    if (!form.lyDo.trim()) errs.lyDo = t("validateBannedReason");
    if (!form.ngayBatDau) errs.ngayBatDau = t("validateBannedStartDate");
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const svIdNum = parseInt(form.sinhVienId, 10);
      const loaiId = form.loaiSuKienId ? parseInt(form.loaiSuKienId, 10) : 2;
      const ngayBatDauStr = formatDateApi(form.ngayBatDau);
      const ngayKetThucStr = formatDateApi(form.ngayKetThuc);

      // Build body - luôn gửi sinhVienId (kể cả 0) vì API yêu cầu
      const body: Record<string, any> = {
        sinhVienId: isNaN(svIdNum) ? 0 : svIdNum,
        maSinhVien: form.maSinhVien.trim(),
        lyDo: form.lyDo.trim(),
        ngayBatDau: ngayBatDauStr,
        loaiSuKienId: loaiId,
      };

      // Chỉ gửi ngayKetThuc nếu có giá trị
      if (ngayKetThucStr) {
        body.ngayKetThuc = ngayKetThucStr;
      }

      // Gửi camId khi cập nhật
      if (isEditing && form.camId) {
        body.camId = Number(form.camId);
      }

      console.log("[BiCam] Sending body:", JSON.stringify(body));
      const data = await createOrUpdateSinhVienCam(body, isEditing);
      console.log("[BiCam] API response:", data);

      const isSuccess =
        data?.status === "OK" ||
        data?.status === "200" ||
        data?.status === 200 ||
        data?.statusCode === 200 ||
        data?.code === 200;

      if (!isSuccess) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Thao tác thất bại (API status: " + data?.status + ")",
        );
      }

      setModalOpen(false);
      showToast(
        "success",
        isEditing ? t("toastUpdateSuccess") : t("toastAddSuccess"),
      );
      loadBannedThongKeData(currentPage);
    } catch (err: any) {
      console.error("[BiCam] Save error:", err);
      showToast("error", err?.message || t("toastSaveError"));
    } finally {
      setSaving(false);
    }
  };

  // Chart data
  const chartData =
    bannedList.length > 0
      ? bannedList.slice(0, 10).map((item) => ({
          name: item.maSinhVien || `SV${item.sinhVienId}`,
          fullName: item.maSinhVien || `SV${item.sinhVienId}`,
          value: 1,
          lyDo: item.lyDo,
        }))
      : [{ name: t("noData"), fullName: "", value: 0, lyDo: "" }];

  const filteredBanned = bannedList.filter((item) => {
    const mssvMatch =
      !mssvFilter ||
      (item.maSinhVien || "").toLowerCase().includes(mssvFilter.toLowerCase());
    const nameResolved = svNameMap[item.maSinhVien] || "";
    const nameMatch =
      !hoTenFilter ||
      nameResolved.toLowerCase().includes(hoTenFilter.toLowerCase());
    return mssvMatch && nameMatch;
  });

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
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 24,
            zIndex: 9999,
            minWidth: 320,
          }}
        >
          <Alert
            color={toast.type === "success" ? "green" : "red"}
            icon={
              toast.type === "success" ? (
                <IconCheck size={18} />
              ) : (
                <IconX size={18} />
              )
            }
            radius="md"
            style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
          >
            <Text fw={600} size="sm">
              {toast.msg}
            </Text>
          </Alert>
        </div>
      )}

      {/* Header */}
      <PageSectionHeader
        title={t("bannedTitle")}
        description="Theo dõi danh sách sinh viên bị cấm, lý do áp dụng và thời gian hiệu lực."
        icon={<IconReportAnalytics size={20} color="#1f5ca9" />}
        rightSection={
          <></>
          // <Button
          //   leftSection={<IconPlus size={16} />}
          //   style={{
          //     background: "linear-gradient(135deg, #1f5ca9, #00afef)",
          //     fontFamily: "var(--font-readex-pro), sans-serif",
          //     borderRadius: "8px",
          //   }}
          //   onClick={openAddModal}
          // >
          //   {t("addBannedBtn")}
          // </Button>
        }
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
            gridTemplateColumns: "minmax(220px, 1fr) minmax(220px, 1fr) auto",
            gap: "16px",
            alignItems: "end",
          }}
        >
          <TextInput
            label={t("fullName").toUpperCase()}
            placeholder={`${t("enterFullName")}...`}
            value={hoTenFilter}
            onChange={(e) => setHoTenFilter(e.currentTarget.value)}
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

          <TextInput
            label={t("studentId").toUpperCase()}
            placeholder={`${t("enterMssv")}...`}
            value={mssvFilter}
            onChange={(e) => setMssvFilter(e.currentTarget.value)}
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
                loading ? (
                  <Loader size={16} color="white" />
                ) : (
                  <IconSearch size={16} />
                )
              }
              onClick={handleSearch}
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
          </Group>
        </Box>
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
          {/* Chart */}
          {/* Chart */}
          <Grid gutter="md">
            <Grid.Col span={12}>
              <Card
                withBorder
                radius="lg"
                p="lg"
                style={{
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
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
                  }}
                >
                  {t("bannedChartTitle")}
                </Text>

                <div style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 16,
                        right: 16,
                        left: 0,
                        bottom: 4,
                      }}
                      barCategoryGap="34%"
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
                          fontSize: 11,
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
                        domain={[0, "dataMax + 1"]}
                        tick={{
                          fontSize: 12,
                          fill: "#475569",
                        }}
                        tickLine={false}
                        axisLine={{
                          stroke: "#94a3b8",
                        }}
                      />

                      <RechartsTooltip
                        content={<CustomTooltip />}
                        cursor={{
                          fill: "rgba(148, 163, 184, 0.08)",
                        }}
                      />

                      <Bar
                        dataKey="value"
                        name="Sinh viên bị cấm"
                        fill="#1f5ca9"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={70}
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

                <BannedChartLegend />
              </Card>
            </Grid.Col>
          </Grid>

          {/* Table */}
          <Card
            withBorder
            radius="lg"
            p="lg"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
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
                {t("bannedTableTitle")} ({totalElements})
              </Text>
            </Group>

            <ScrollArea>
              <Table
                verticalSpacing="sm"
                highlightOnHover
                style={{ minWidth: 860 }}
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
                      {t("bannedReason")}
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: "#475569",
                        fontWeight: 600,
                        fontSize: "12px",
                        textAlign: "center",
                      }}
                    >
                      {t("startDate")}
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: "#475569",
                        fontWeight: 600,
                        fontSize: "12px",
                        textAlign: "center",
                      }}
                    >
                      {t("endDate")}
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: "#475569",
                        fontWeight: 600,
                        fontSize: "12px",
                        textAlign: "center",
                      }}
                    >
                      {t("banEventType")}
                    </Table.Th>
                    {/* <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px", textAlign: "center" }}>{t("actions")}</Table.Th> */}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredBanned.map((row, index) => (
                    <Table.Tr
                      key={row.camId || index}
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                    >
                      <Table.Td style={{ fontSize: "13px", color: "#64748b" }}>
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </Table.Td>
                      <Table.Td
                        style={{
                          fontSize: "13px",
                          color: "#64748b",
                          fontFamily: "monospace",
                          fontWeight: 600,
                        }}
                      >
                        {row.maSinhVien}
                      </Table.Td>
                      <Table.Td
                        style={{
                          fontSize: "13px",
                          color: "#1e293b",
                          fontWeight: 600,
                        }}
                      >
                        {svNameMap[row.maSinhVien] || "—"}
                      </Table.Td>
                      <Table.Td
                        style={{
                          fontSize: "13px",
                          color: "#fa5252",
                          fontWeight: 500,
                          maxWidth: 260,
                        }}
                      >
                        {row.lyDo}
                      </Table.Td>
                      <Table.Td
                        style={{
                          fontSize: "13px",
                          color: "#475569",
                          textAlign: "center",
                        }}
                      >
                        {formatTimestamp(row.ngayBatDau)}
                      </Table.Td>
                      <Table.Td
                        style={{
                          fontSize: "13px",
                          color: "#475569",
                          textAlign: "center",
                        }}
                      >
                        {row.ngayKetThuc ? (
                          formatTimestamp(row.ngayKetThuc)
                        ) : (
                          <Badge color="red" variant="light" size="xs">
                            {t("noData")}
                          </Badge>
                        )}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        <Badge color="orange" variant="light" size="sm">
                          {row.tenLoaiSuKien || `ID: ${row.loaiSuKienId}`}
                        </Badge>
                      </Table.Td>
                      {/* <Table.Td style={{ textAlign: "center" }}>
                        <Tooltip label={t("save")} withArrow>
                          <ActionIcon
                            variant="light"
                            color="blue"
                            size="sm"
                            onClick={() => openEditModal(row)}
                          >
                            <IconEdit size={14} />
                          </ActionIcon>
                        </Tooltip>
                      </Table.Td> */}
                    </Table.Tr>
                  ))}
                  {filteredBanned.length === 0 && (
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
              totalItems={totalElements}
              totalPages={totalPages}
              page={currentPage}
              pageSize={PAGE_SIZE}
              setPage={setCurrentPage}
              setPageSize={() => {}}
            />
          </Card>
        </>
      )}

      {/* Add / Edit Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          <Group gap="xs">
            <ThemeIcon
              size={28}
              variant="light"
              color={isEditing ? "blue" : "green"}
            >
              {isEditing ? <IconEdit size={16} /> : <IconPlus size={16} />}
            </ThemeIcon>
            <Text fw={700} c={isEditing ? "#1f5ca9" : "#16a34a"} size="md">
              {t("addBannedModalTitle")}
            </Text>
          </Group>
        }
        size="lg"
        radius="lg"
        centered
        styles={{
          header: { borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" },
          body: { padding: "20px 24px 24px" },
        }}
      >
        <Stack gap="lg">
          {/* Student search section */}
          <Box>
            <Divider
              label={
                <Group gap={6}>
                  <IconUserSearch size={13} color="#1f5ca9" />
                  <Text
                    size="11px"
                    fw={700}
                    c="#1f5ca9"
                    style={{ letterSpacing: "0.5px" }}
                  >
                    {t("studentInfoCardTitle")}
                  </Text>
                </Group>
              }
              mb="sm"
            />

            {/* Autocomplete search */}
            <div ref={svSearchRef} style={{ position: "relative" }}>
              <TextInput
                label={t("searchByCodeTitle")}
                placeholder={t("searchMssvPlaceholder")}
                value={svSearch}
                onChange={(e) => handleSvSearchChange(e.currentTarget.value)}
                leftSection={
                  svLoading ? (
                    <Loader size={14} />
                  ) : (
                    <IconUserSearch size={14} color="#94a3b8" />
                  )
                }
                error={formErrors.maSinhVien}
                styles={{
                  label: {
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#1f5ca9",
                    marginBottom: "6px",
                    letterSpacing: "0.5px",
                  },
                  input: {
                    borderRadius: "8px",
                    fontFamily: "var(--font-readex-pro), sans-serif",
                  },
                }}
              />
              {/* Suggestions dropdown */}
              {showSuggestions && svSuggestions.length > 0 && (
                <Paper
                  shadow="md"
                  radius="md"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    maxHeight: 220,
                    overflowY: "auto",
                    border: "1px solid #e2e8f0",
                    marginTop: 4,
                  }}
                >
                  {svSuggestions.map((sv, i) => (
                    <Box
                      key={i}
                      onClick={() => handleSelectSv(sv)}
                      style={{
                        padding: "10px 14px",
                        cursor: "pointer",
                        borderBottom:
                          i < svSuggestions.length - 1
                            ? "1px solid #f1f5f9"
                            : "none",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f0f7ff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <Group gap="xs">
                        <Text
                          size="xs"
                          fw={700}
                          c="#1f5ca9"
                          style={{ fontFamily: "monospace" }}
                        >
                          {sv.maSinhVien}
                        </Text>
                        <Text size="xs" c="#475569">
                          —
                        </Text>
                        <Text size="xs" fw={500} c="#1e293b">
                          {sv.hoTen}
                        </Text>
                        {sv.maPhong && (
                          <Badge size="xs" variant="light" color="teal">
                            {sv.maPhong}
                          </Badge>
                        )}
                      </Group>
                    </Box>
                  ))}
                </Paper>
              )}
            </div>

            {/* Display selected student info */}
            {form.hoTen && (
              <Paper
                radius="md"
                p="sm"
                mt="xs"
                style={{
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                }}
              >
                <Group gap="xs">
                  <IconCheck size={16} color="#16a34a" />
                  <Text size="sm" fw={600} c="#15803d">
                    {t("selected")}:{" "}
                    <span style={{ color: "#1f5ca9" }}>{form.maSinhVien}</span>{" "}
                    — {form.hoTen}
                  </Text>
                </Group>
              </Paper>
            )}

            {/* Manual entry fallback */}
            {!form.sinhVienId && (
              <Grid gutter="sm" mt="xs">
                <Grid.Col span={6}>
                  <TextInput
                    label={`${t("studentId")} (${t("manualRecord").toLowerCase()})`}
                    placeholder="VD: 805"
                    value={form.maSinhVien}
                    onChange={(e) => {
                      const val = e.currentTarget.value;
                      setForm((f) => ({ ...f, maSinhVien: val }));
                      setSvSearch(val);
                      setFormErrors((err) => ({
                        ...err,
                        maSinhVien: undefined,
                      }));
                    }}
                    error={formErrors.maSinhVien}
                    styles={{
                      label: {
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#64748b",
                        marginBottom: "4px",
                        letterSpacing: "0.5px",
                      },
                      input: { borderRadius: "8px", fontSize: "13px" },
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label={`ID ${t("studentId")}`}
                    placeholder="VD: 16"
                    value={form.sinhVienId}
                    onChange={(e) => {
                      const val = e.currentTarget.value;
                      setForm((f) => ({ ...f, sinhVienId: val }));
                    }}
                    styles={{
                      label: {
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#64748b",
                        marginBottom: "4px",
                        letterSpacing: "0.5px",
                      },
                      input: { borderRadius: "8px", fontSize: "13px" },
                    }}
                  />
                </Grid.Col>
              </Grid>
            )}
          </Box>

          {/* Ban details section */}
          <Box>
            <Divider
              label={
                <Group gap={6}>
                  <IconFileText size={13} color="#1f5ca9" />
                  <Text
                    size="11px"
                    fw={700}
                    c="#1f5ca9"
                    style={{ letterSpacing: "0.5px" }}
                  >
                    {t("detailTitle")}
                  </Text>
                </Group>
              }
              mb="sm"
            />
            <Stack gap="sm">
              <Textarea
                label={`${t("bannedReason").toUpperCase()} *`}
                placeholder={t("enterReasonPlaceholder")}
                value={form.lyDo}
                onChange={(e) => {
                  const val = e.currentTarget.value;
                  setForm((f) => ({ ...f, lyDo: val }));
                  setFormErrors((err) => ({ ...err, lyDo: undefined }));
                }}
                minRows={3}
                error={formErrors.lyDo}
                styles={{
                  label: {
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#1f5ca9",
                    marginBottom: "6px",
                    letterSpacing: "0.5px",
                  },
                  input: {
                    borderRadius: "8px",
                    fontFamily: "var(--font-readex-pro), sans-serif",
                  },
                }}
              />

              <Grid gutter="sm">
                <Grid.Col span={6}>
                  <DateInput
                    label={`${t("startDate").toUpperCase()} *`}
                    placeholder="Chọn ngày..."
                    value={form.ngayBatDau}
                    onChange={(val) => {
                      setForm((f) => ({
                        ...f,
                        ngayBatDau: val ? new Date(val) : null,
                      }));
                      setFormErrors((err) => ({
                        ...err,
                        ngayBatDau: undefined,
                      }));
                    }}
                    valueFormat="DD/MM/YYYY"
                    clearable
                    leftSection={<IconCalendar size={14} color="#94a3b8" />}
                    error={formErrors.ngayBatDau}
                    styles={{
                      label: {
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#1f5ca9",
                        marginBottom: "6px",
                        letterSpacing: "0.5px",
                      },
                      input: { borderRadius: "8px" },
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <DateInput
                    label={t("endDate").toUpperCase()}
                    placeholder={t("selectEndDate")}
                    value={form.ngayKetThuc}
                    onChange={(val) =>
                      setForm((f) => ({
                        ...f,
                        ngayKetThuc: val ? new Date(val) : null,
                      }))
                    }
                    valueFormat="DD/MM/YYYY"
                    clearable
                    leftSection={<IconCalendar size={14} color="#94a3b8" />}
                    styles={{
                      label: {
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#64748b",
                        marginBottom: "6px",
                        letterSpacing: "0.5px",
                      },
                      input: { borderRadius: "8px" },
                    }}
                  />
                </Grid.Col>
              </Grid>

              <TextInput
                label={t("banEventType").toUpperCase()}
                placeholder="VD: 2"
                value={form.loaiSuKienId}
                onChange={(e) => {
                  const val = e.currentTarget.value;
                  setForm((f) => ({ ...f, loaiSuKienId: val }));
                }}
                styles={{
                  label: {
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#64748b",
                    marginBottom: "6px",
                    letterSpacing: "0.5px",
                  },
                  input: {
                    borderRadius: "8px",
                    fontSize: "13px",
                    maxWidth: 160,
                  },
                }}
              />
            </Stack>
          </Box>

          {/* Info note */}
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="blue"
            variant="light"
            radius="md"
            style={{ padding: "10px 14px" }}
          >
            <Text size="xs" c="dimmed">
              Dữ liệu sẽ được lưu trực tiếp vào cơ sở dữ liệu. Các trường có dấu{" "}
              <b>*</b> là bắt buộc.
            </Text>
          </Alert>

          {/* Buttons */}
          <Group justify="flex-end" mt="xs" gap="sm">
            <Button
              variant="outline"
              color="gray"
              onClick={() => setModalOpen(false)}
              style={{ borderRadius: "8px" }}
            >
              {t("cancel")}
            </Button>
            <Button
              loading={saving}
              leftSection={saving ? undefined : <IconCheck size={16} />}
              style={{
                backgroundColor: isEditing ? "#1f5ca9" : "#16a34a",
                borderRadius: "8px",
                minWidth: 140,
              }}
              onClick={handleSave}
            >
              {saving ? t("loading") : isEditing ? t("submit") : t("submit")}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
