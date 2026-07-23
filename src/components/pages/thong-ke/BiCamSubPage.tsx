"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
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
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  createOrUpdateSinhVienCam,
  fetchSinhVienPaginate,
  fetchThongKeSvBiCamNoPhi,
} from "@/services/dashboard/dashboardService";
import PageSectionHeader from "@/components/common/PageSectionHeader";
import ExcelExportForm from "@/components/common/excel/excelHelper";
import PdfExportForm from "@/components/common/pdf/pdfHelper";

interface BannedItem {
  camId?: number;
  sinhVienId?: number | string;
  lyDo: string;
  ngayBatDau: number | null;
  ngayKetThuc: number | null;
  loaiSuKienId: number | string;
  maSinhVien: string;
  hoTen?: string;
  trangThai?: string;
  danhSachNoPhi?: NoPhiEvent[];
}

interface NoPhiEvent {
  maPhong?: string;
  soTien?: number | null;
  loaiSuKienId?: number;
  tenLoaiSuKien?: string;
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

type ViolationChartItem = {
  name: string;
  value: number;
  percentage: number;
  color: string;
  lyDo?: string;
};

type DuLieuXuat = {
  title: string;
  fileName: string;
  columnLabels: string[];
  data: Record<string, string | number | boolean | null | undefined>[];
  sheetName?: string;
};

function formatDateApi(d: Date | null): string {
  if (!d || isNaN(d.getTime())) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function formatTimestamp(ts: number | null): string {
  if (!ts) return "-";
  const normalized = ts < 10000000000 ? ts * 1000 : ts;
  const d = new Date(normalized);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function parseTimestamp(value: any): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" && !Number.isNaN(value)) return value;

  const numeric = Number(value);
  if (!Number.isNaN(numeric) && numeric > 0) return numeric;

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
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

const VIOLATION_CHART_COLORS = [
  "#1f5ca9",
  "#00afef",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#ec4899",
];

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: ViolationChartItem }>;
};

function formatPercentVi(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}

function renderWrappedAxisTick(props: {
  x?: number;
  y?: number;
  payload?: { value?: string };
}) {
  const { x = 0, y = 0, payload } = props;
  const label = payload?.value || "";
  const words = label.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length > 16 && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      return;
    }
    currentLine = nextLine;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return (
    <text x={x} y={y} textAnchor="middle" fill="#475569" fontSize={11}>
      {lines.map((line, index) => (
        <tspan key={`${line}-${index}`} x={x} dy={index === 0 ? 0 : 14}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

const CustomTooltip = ({ active, payload }: ChartTooltipProps) => {
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
          {data.name}
        </p>
        <p
          style={{
            margin: "4px 0 0 0",
            fontSize: "11px",
            color: "#334155",
            lineHeight: "1.4",
          }}
        >
          <span style={{ fontWeight: 600 }}>Số sinh viên:</span> {data.value}
        </p>
        <p
          style={{
            margin: "4px 0 0 0",
            fontSize: "11px",
            color: "#334155",
            lineHeight: "1.4",
          }}
        >
          <span style={{ fontWeight: 600 }}>Tỷ lệ:</span>{" "}
          {formatPercentVi(data.percentage)}%
        </p>
      </div>
    );
  }
  return null;
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
  const [allBannedItems, setAllBannedItems] = useState<BannedItem[]>([]);
  const [svNameMap, setSvNameMap] = useState<Record<string, string>>({});
  const [totalElements, setTotalElements] = useState(0);

  // Toast notifications
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [duLieuXuatExcel, setDuLieuXuatExcel] = useState<DuLieuXuat | null>(
    null,
  );
  const [duLieuXuatPdf, setDuLieuXuatPdf] = useState<DuLieuXuat | null>(null);

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

  const loadBannedData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchThongKeSvBiCamNoPhi({
        keyWord: mssvFilter.trim() || hoTenFilter.trim() || "",
      });
      const payload = res?.payload;
      const rawItems: any[] =
        payload?.content ??
        payload?.items ??
        (Array.isArray(payload) ? payload : []);
      const items: BannedItem[] = rawItems.map((item: any, index: number) => {
        const maSinhVien =
          item.maSinhVien || item.maSo || item.maso || item.studentId || "";
        const lyDo =
          item.reason ||
          item.lyDo ||
          item.danhSachNoPhi?.[0]?.tenLoaiSuKien ||
          item.tenLoaiSuKien ||
          "Không rõ lý do";
        const ngayBatDau =
          parseTimestamp(item.ngayBatDau) ||
          parseTimestamp(item.startDate) ||
          parseTimestamp(item.createdDate);
        const ngayKetThuc =
          parseTimestamp(item.ngayKetThuc) || parseTimestamp(item.endDate);

        return {
          camId: item.camId ?? index + 1,
          sinhVienId: item.sinhVienId ?? item.studentId ?? item.id ?? "",
          maSinhVien,
          hoTen: item.hoTen || item.fullName || item.ten || "",
          lyDo,
          ngayBatDau,
          ngayKetThuc,
          loaiSuKienId:
            item.loaiSuKienId ??
            item.violationCount ??
            item.tongSoLanNoPhi ??
            0,
          danhSachNoPhi: Array.isArray(item.danhSachNoPhi)
            ? item.danhSachNoPhi
            : [],
          trangThai:
            item.status ||
            (ngayKetThuc && ngayKetThuc < Date.now()
              ? "HĂ¡ÂºÂ¿t hĂ¡ÂºÂ¡n"
              : "Ă„Âang cĂ¡ÂºÂ¥m"),
        };
      });
      setAllBannedItems(items);
      setBannedList(items);
      setTotalElements(items.length);

      // Resolve student names
      const uniqueMaSv = [
        ...new Set(items.map((i) => i.maSinhVien).filter(Boolean)),
      ];
      if (uniqueMaSv.length > 0) {
        try {
          const svRes = await fetchSinhVienPaginate({
            page: 1,
            pageSize: 200,
            maKhu: "-1",
            maPhong: "-1",
          });
          const svItems: any[] = svRes?.payload?.items ?? [];
          const nameMap: Record<string, string> = {};
          svItems.forEach((sv: any) => {
            if (sv.maSinhVien)
              nameMap[sv.maSinhVien] =
                sv.hoTen || sv.ten || sv.hoVaTen || sv.maSinhVien;
          });
          setSvNameMap(nameMap);
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      setError(err?.message || "Lỗi khi tải dữ liệu sinh viên bị cấm");
      setAllBannedItems([]);
      setBannedList([]);
    } finally {
      setLoading(false);
    }
  }, [hoTenFilter, mssvFilter]);

  useEffect(() => {
    loadBannedData();
  }, [loadBannedData]);

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
  };

  const handleSearch = () => {
    loadBannedData();
  };

  // ---- Modal helpers ----
  const openAddModal = () => {
    setIsEditing(false);
    setForm(makeDefaultForm());
    setSvSearch("");
    setSvSuggestions([]);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (item: BannedItem) => {
    setIsEditing(true);
    const hoTenResolved = svNameMap[item.maSinhVien] || item.hoTen || "";
    setForm({
      camId: item.camId,
      sinhVienId: String(item.sinhVienId),
      maSinhVien: item.maSinhVien,
      hoTen: hoTenResolved,
      lyDo: item.lyDo,
      ngayBatDau: item.ngayBatDau ? new Date(item.ngayBatDau) : null,
      ngayKetThuc: item.ngayKetThuc ? new Date(item.ngayKetThuc) : null,
      loaiSuKienId: String(item.loaiSuKienId),
    });
    setSvSearch(item.maSinhVien);
    setFormErrors({});
    setModalOpen(true);
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

      // Build body - luĂ´n gá»­i sinhVienId (ká»ƒ cáº£ 0) vĂ¬ API yĂªu cáº§u
      const body: Record<string, any> = {
        sinhVienId: isNaN(svIdNum) ? 0 : svIdNum,
        maSinhVien: form.maSinhVien.trim(),
        lyDo: form.lyDo.trim(),
        ngayBatDau: ngayBatDauStr,
        loaiSuKienId: loaiId,
      };

      // Chá»‰ gá»­i ngayKetThuc náº¿u cĂ³ giĂ¡ trá»‹
      if (ngayKetThucStr) {
        body.ngayKetThuc = ngayKetThucStr;
      }

      // Gá»­i camId khi cáº­p nháº­t
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
            "Thao tĂ¡c tháº¥t báº¡i (API status: " + data?.status + ")",
        );
      }

      setModalOpen(false);
      showToast(
        "success",
        isEditing ? t("toastUpdateSuccess") : t("toastAddSuccess"),
      );
      loadBannedData();
    } catch (err: any) {
      console.error("[BiCam] Save error:", err);
      showToast("error", err?.message || t("toastSaveError"));
    } finally {
      setSaving(false);
    }
  };

  const violationChartData = useMemo<ViolationChartItem[]>(() => {
    if (!Array.isArray(allBannedItems) || allBannedItems.length === 0) {
      return [];
    }

    const studentIdsByViolation = new Map<string, Set<string>>();

    allBannedItems.forEach((item, itemIndex) => {
      const studentKey =
        String(item.maSinhVien || item.sinhVienId || `unknown-${itemIndex}`) ||
        `unknown-${itemIndex}`;
      const events = Array.isArray(item.danhSachNoPhi)
        ? item.danhSachNoPhi
        : [];

      events.forEach((event, eventIndex) => {
        const violationName =
          event?.tenLoaiSuKien?.trim() ||
          item.lyDo?.trim() ||
          `Loại vi phạm ${eventIndex + 1}`;

        if (!studentIdsByViolation.has(violationName)) {
          studentIdsByViolation.set(violationName, new Set<string>());
        }

        studentIdsByViolation.get(violationName)?.add(studentKey);
      });
    });

    const rawChartData = Array.from(studentIdsByViolation.entries())
      .map(([name, students]) => ({
        name,
        value: students.size,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    const total = rawChartData.reduce((sum, item) => sum + item.value, 0);

    return rawChartData.map((item, index) => ({
      ...item,
      percentage:
        total > 0 ? Number(((item.value / total) * 100).toFixed(1)) : 0,
      color: VIOLATION_CHART_COLORS[index % VIOLATION_CHART_COLORS.length],
      lyDo: `Số sinh viên: ${item.value} | Tỷ lệ: ${formatPercentVi(
        total > 0 ? (item.value / total) * 100 : 0,
      )}%`,
    }));
  }, [allBannedItems]);

  const totalViolationStudents = useMemo(
    () => violationChartData.reduce((sum, item) => sum + item.value, 0),
    [violationChartData],
  );

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

  const taoDuLieuXuatBiCam = () => {
    return filteredBanned.map((item, index) => ({
      [t("no")]: index + 1,
      [t("studentId")]: item.maSinhVien,
      [t("fullName")]: svNameMap[item.maSinhVien] || item.hoTen || "-",
      [t("bannedReason")]: item.lyDo,
      [t("startDate")]: formatTimestamp(item.ngayBatDau),
      [t("endDate")]: item.ngayKetThuc
        ? formatTimestamp(item.ngayKetThuc)
        : t("noData"),
      [t("banEventType")]: item.loaiSuKienId,
    }));
  };

  const xuLyXuatExcel = () => {
    const columnLabels = [
      t("no"),
      t("studentId"),
      t("fullName"),
      t("bannedReason"),
      t("startDate"),
      t("endDate"),
      t("banEventType"),
    ];

    setDuLieuXuatExcel({
      title: "Danh sách sinh viên bị cấm",
      fileName: `Danh_Sach_Sinh_Vien_Bi_Cam_${new Date().toISOString().split("T")[0]}`,
      sheetName: "Sinh viên bị cấm",
      columnLabels,
      data: taoDuLieuXuatBiCam(),
    });
  };

  const xuLyXuatPdf = () => {
    const columnLabels = [
      t("no"),
      t("studentId"),
      t("fullName"),
      t("bannedReason"),
      t("startDate"),
      t("endDate"),
      t("banEventType"),
    ];

    setDuLieuXuatPdf({
      title: "Danh sách sinh viên bị cấm",
      fileName: `Danh_Sach_Sinh_Vien_Bi_Cam_${new Date().toISOString().split("T")[0]}`,
      columnLabels,
      data: taoDuLieuXuatBiCam(),
    });
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
      {/* Toast - client-only, no SSR mismatch */}
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
        rightSection={<></>}
      />

      {/* Filter Card */}
      <Card
        withBorder
        radius="lg"
        p="lg"
        style={{
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
          borderColor: "#e2e8f0",
        }}
      >
        <div className="flex flex-col gap-4 w-full lg:flex-row lg:items-end">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            <div>
              <TextInput
                label={t("fullName").toUpperCase()}
                placeholder={t("enterFullName") + "..."}
                value={hoTenFilter}
                onChange={(e) => setHoTenFilter(e.currentTarget.value)}
                styles={{
                  label: {
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#475569",
                    marginBottom: "6px",
                    letterSpacing: "0.5px",
                  },
                  input: {
                    borderRadius: "8px",
                    fontFamily: "var(--font-readex-pro), sans-serif",
                    height: "40px",
                  },
                }}
              />
            </div>
            <div>
              <TextInput
                label={t("studentId").toUpperCase()}
                placeholder={t("enterMssv") + "..."}
                value={mssvFilter}
                onChange={(e) => setMssvFilter(e.currentTarget.value)}
                styles={{
                  label: {
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#475569",
                    marginBottom: "6px",
                    letterSpacing: "0.5px",
                  },
                  input: {
                    borderRadius: "8px",
                    fontFamily: "var(--font-readex-pro), sans-serif",
                    height: "40px",
                  },
                }}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-end w-full lg:w-auto">
            <Button
              leftSection={
                loading ? (
                  <Loader size={16} color="white" />
                ) : (
                  <IconSearch size={16} />
                )
              }
              style={{
                backgroundColor: "#1f5ca9",
                fontFamily: "var(--font-readex-pro), sans-serif",
                borderRadius: "8px",
                height: "40px",
              }}
              onClick={handleSearch}
              disabled={loading}
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
                fontFamily: "var(--font-readex-pro), sans-serif",
                borderRadius: "8px",
                height: "40px",
              }}
            >
              {t("reset")}
            </Button>
            <Button
              leftSection={<IconDownload size={16} />}
              variant="outline"
              onClick={xuLyXuatExcel}
              style={{
                borderColor: "#1f5ca9",
                color: "#1f5ca9",
                fontFamily: "var(--font-readex-pro), sans-serif",
                borderRadius: "8px",
                height: "40px",
              }}
            >
              {t("exportExcel")}
            </Button>
            <Button
              leftSection={<IconDownload size={16} />}
              variant="outline"
              onClick={xuLyXuatPdf}
              style={{
                borderColor: "#0ea5e9",
                color: "#0ea5e9",
                fontFamily: "var(--font-readex-pro), sans-serif",
                borderRadius: "8px",
                height: "40px",
              }}
            >
              {t("exportPdf")}
            </Button>
          </div>
        </div>
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
          <Grid gutter="md" align="stretch">
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Card
                withBorder
                radius="lg"
                p="lg"
                style={{
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
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
                  Thống kê sinh viên theo loại vi phạm
                </Text>
                <div style={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={violationChartData}
                      margin={{
                        top: 20,
                        right: 12,
                        left: 0,
                        bottom: 42,
                      }}
                      barCategoryGap="28%"
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#dbe4ee"
                      />

                      <XAxis
                        dataKey="name"
                        interval={0}
                        height={64}
                        tick={renderWrappedAxisTick}
                        tickLine={false}
                        axisLine={{
                          stroke: "#94a3b8",
                        }}
                      />

                      <YAxis
                        allowDecimals={false}
                        width={48}
                        domain={[0, "dataMax + 1"]}
                        tick={{
                          fontSize: 12,
                          fill: "#475569",
                        }}
                        tickLine={false}
                        axisLine={{
                          stroke: "#94a3b8",
                        }}
                        label={{
                          value: "Số sinh viên",
                          angle: -90,
                          position: "insideLeft",
                          fill: "#64748b",
                          fontSize: 12,
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
                        radius={[8, 8, 0, 0]}
                        maxBarSize={80}
                        label={{
                          position: "top",
                          fill: "#475569",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {violationChartData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <ViolationBarChartLegend data={violationChartData} />
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card
                withBorder
                radius="lg"
                p="lg"
                style={{
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
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
                  Tỷ lệ theo loại vi phạm
                </Text>

                {violationChartData.length > 0 ? (
                  <Stack gap="md" h={320} justify="space-between">
                    <Box
                      style={{ position: "relative", flex: 1, minHeight: 0 }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={violationChartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={62}
                            outerRadius={92}
                            paddingAngle={3}
                            cx="50%"
                            cy="48%"
                          >
                            {violationChartData.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>

                      <Box
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          pointerEvents: "none",
                        }}
                      >
                        <Stack gap={0} align="center">
                          <Text size="xs" c="#64748b" fw={600}>
                            Tổng
                          </Text>
                          <Text size="xl" fw={800} c="#1e293b">
                            {totalViolationStudents}
                          </Text>
                        </Stack>
                      </Box>
                    </Box>

                    <BannedChartLegend data={violationChartData} />
                  </Stack>
                ) : (
                  <Center h={320}>
                    <Text c="dimmed">Không có dữ liệu thống kê</Text>
                  </Center>
                )}
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
                    <Table.Th
                      style={{
                        color: "#475569",
                        fontWeight: 600,
                        fontSize: "12px",
                        textAlign: "center",
                      }}
                    >
                      {t("actions")}
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredBanned.map((row, index) => (
                    <Table.Tr
                      key={row.camId || index}
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                    >
                      <Table.Td style={{ fontSize: "13px", color: "#64748b" }}>
                        {index + 1}
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
                        {svNameMap[row.maSinhVien] || "-"}
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
                          ID: {row.loaiSuKienId}
                        </Badge>
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
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
                      </Table.Td>
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
                          -
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
                    - {form.hoTen}
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
              <b>*</b> lĂ  báº¯t buá»™c.
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

      {duLieuXuatExcel && (
        <ExcelExportForm
          hidden
          autoExport
          title={duLieuXuatExcel.title}
          fileName={duLieuXuatExcel.fileName}
          sheetName={duLieuXuatExcel.sheetName}
          columnLabels={duLieuXuatExcel.columnLabels}
          data={duLieuXuatExcel.data}
          onExported={() => {
            setDuLieuXuatExcel(null);
            showToast("success", t("exportExcel"));
          }}
        />
      )}

      {duLieuXuatPdf && (
        <PdfExportForm
          hidden
          autoExport
          title={duLieuXuatPdf.title}
          fileName={duLieuXuatPdf.fileName}
          columnLabels={duLieuXuatPdf.columnLabels}
          data={duLieuXuatPdf.data}
          onExported={() => {
            setDuLieuXuatPdf(null);
            showToast("success", t("exportPdf"));
          }}
        />
      )}
    </Stack>
  );
}

const ViolationBarChartLegend = ({
  data,
}: {
  data: ViolationChartItem[];
}) => {
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
          Số lượng
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
          Loại
        </Text>
      </Box>

      {data.map((item) => (
        <Group key={item.name} gap={5} wrap="nowrap">
          <Box
            style={{
              width: 11,
              height: 11,
              borderRadius: 2,
              backgroundColor: item.color,
            }}
          />

          <Text size="12px" c="#64748b">
            {item.name}
          </Text>
        </Group>
      ))}
    </Group>
  );
};

const BannedChartLegend = ({ data }: { data: ViolationChartItem[] }) => {
  return (
    <Stack gap={8}>
      {data.map((item) => (
        <Group key={item.name} gap="xs" wrap="nowrap" align="flex-start">
          <Box
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: item.color,
              marginTop: 3,
              flexShrink: 0,
            }}
          />
          <Text size="sm" c="#475569" style={{ lineHeight: 1.4 }}>
            {item.name}: {item.value} ({formatPercentVi(item.percentage)}%)
          </Text>
        </Group>
      ))}
    </Stack>
  );
};
