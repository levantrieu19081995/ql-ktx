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
  Drawer,
  Tabs,
  Textarea,
  ActionIcon,
  Tooltip,
  Divider,
  Alert,
  Paper,
  Box,
  Image,
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
  IconBan,
  IconCash,
  IconCamera,
  IconEye,
  IconAlertTriangle,
  IconCircleCheck,
} from "@tabler/icons-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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
  lyDo?: string;
  ngayBatDau?: number | null;
  ngayKetThuc?: number | null;
  loaiSuKienId?: number | string;
  maSinhVien?: string;
  hoTen?: string;
  maPhong?: string;
  maLop?: string;
  tenLop?: string;
  lop?: string;
  trangThai?: string;
  tongSoLanBiCam?: number;
  tongSoLanNoPhi?: number;
  danhSachCam?: ViolationSourceItem[];
  danhSachNoPhi?: ViolationSourceItem[];
  danhSachChiTietPhatHien?: DetectionDetailItem[];
}

interface ViolationSourceItem {
  lyDo?: string;
  lyDoCam?: string;
  tenLoaiSuKien?: string;
  loiPhatHien?: string;
  noiDung?: string;
  tenLoi?: string;
  moTa?: string;
  maPhong?: string;
  soTien?: number | null;
  loaiSuKienId?: number;
  ngayBatDau?: string | number | null;
  ngayKetThuc?: string | number | null;
  trangThai?: string;
  ghiChu?: string;
}

interface DetectionDetailItem extends ViolationSourceItem {
  tenCamera?: string;
  viTriCamera?: string;
  tenViTri?: string;
  viTri?: string;
  cameraName?: string;
  thoiGianPhatHien?: string | number | null;
  ngayPhatHien?: string | number | null;
  createdAt?: string | number | null;
  thoiGian?: string | number | null;
  ngayTao?: string | number | null;
  pathImage?: string;
  hinhAnh?: string;
  imageUrl?: string;
  urlAnh?: string;
}

interface DetectionDetailDisplay {
  violation: string;
  cameraPosition: string;
  detectedAtLabel: string;
  detectedAtValue: number | null;
  imageUrl: string | null;
}

type StudentStatus = "BOTH" | "BANNED" | "DEBT" | "DETECTED" | "NORMAL";

interface BannedTableRowView {
  item: BannedItem;
  bannedItems: ViolationSourceItem[];
  debtItems: ViolationSourceItem[];
  detectionItems: DetectionDetailItem[];
  detectionDetails: DetectionDetailDisplay[];
  bannedCount: number;
  debtCount: number;
  detectionCount: number;
  status: StudentStatus;
}

interface BannedApiItem extends BannedItem {
  maSo?: string;
  maso?: string;
  studentId?: number | string;
  id?: number | string;
  fullName?: string;
  ten?: string;
  maLop?: string;
  tenLop?: string;
  lop?: string;
  reason?: string;
  startDate?: string | number | null;
  endDate?: string | number | null;
  status?: string;
  violationCount?: number;
  createdDate?: string | number | null;
}

interface BannedStatisticsPayload {
  tongSoLuotPhatHienSinhVienBiCam?: number;
  tongSoLuotPhatHienSinhVienNoPhi?: number;
  chiTiet?: BannedApiItem[];
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

type StudentStatusChartItem = {
  name: string;
  value: number;
  color: string;
};

type DetailTab = "banned" | "debt" | "detection";

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

function getDefaultFilterDates() {
  const den = new Date();
  const tu = new Date(den.getFullYear(), 0, 1);
  return { tu, den };
}

function normalizeDateInputValue(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const parsed = new Date(value as string | number);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
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

function getDisplayValue(value: unknown): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return String(value);
}

function getViolationName(item: ViolationSourceItem | null | undefined) {
  return getDisplayValue(
    item?.lyDo ||
      item?.lyDoCam ||
      item?.tenLoaiSuKien ||
      item?.loiPhatHien ||
      item?.noiDung ||
      item?.tenLoi ||
      item?.moTa,
  );
}

function getCameraPosition(item: DetectionDetailItem | null | undefined) {
  return getDisplayValue(
    item?.tenCamera ||
      item?.viTriCamera ||
      item?.tenViTri ||
      item?.viTri ||
      item?.cameraName,
  );
}

function getDetectionTime(item: DetectionDetailItem | null | undefined) {
  return (
    item?.thoiGianPhatHien ||
    item?.ngayPhatHien ||
    item?.createdAt ||
    item?.thoiGian ||
    item?.ngayTao ||
    null
  );
}

function formatDateTime(value: string | number | null | undefined): string {
  const timestamp = parseTimestamp(value);
  if (!timestamp) return "-";

  const normalized = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
  const d = new Date(normalized);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");

  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

function formatDateValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  return formatDateTime(value);
}

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }

  return `${new Intl.NumberFormat("vi-VN").format(Number(value))} đ`;
}

function getStudentStatusDisplay(status: StudentStatus) {
  switch (status) {
    case "BOTH":
      return {
        label: "Cấm và nợ phí",
        color: "red",
      };
    case "BANNED":
      return {
        label: "Bị cấm",
        color: "orange",
      };
    case "DEBT":
      return {
        label: "Nợ phí",
        color: "yellow",
      };
    case "DETECTED":
      return {
        label: "Camera phát hiện",
        color: "blue",
      };
    default:
      return {
        label: "Bình thường",
        color: "green",
      };
  }
}

function getDetectionDetails(item: BannedItem): DetectionDetailDisplay[] {
  const details = Array.isArray(item.danhSachChiTietPhatHien)
    ? item.danhSachChiTietPhatHien
    : [];

  return details
    .map((detail) => {
      const detectedAt = getDetectionTime(detail);

      return {
        violation: getViolationName(detail) || "Phát hiện vi phạm",
        cameraPosition: getCameraPosition(detail) || "-",
        detectedAtLabel: formatDateTime(detectedAt),
        detectedAtValue: parseTimestamp(detectedAt),
        imageUrl: getDisplayValue(
          detail.pathImage ||
            detail.hinhAnh ||
            detail.imageUrl ||
            detail.urlAnh,
        ),
      };
    })
    .sort((a, b) => (b.detectedAtValue ?? 0) - (a.detectedAtValue ?? 0));
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

type StudentStatusTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: StudentStatusChartItem }>;
};

type ClickableCountBadgeProps = {
  count: number;
  label: string;
  color: string;
  icon: React.ReactNode;
  onClick: () => void;
};

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
    <text x={x} y={y + 12} textAnchor="middle" fill="#475569" fontSize={11}>
      {lines.map((line, index) => (
        <tspan key={`${line}-${index}`} x={x} dy={index === 0 ? 0 : 14}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

const StudentStatusTooltip = ({
  active,
  payload,
}: StudentStatusTooltipProps) => {
  if (!active || !payload?.length) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <Paper withBorder radius="md" p="sm" shadow="sm">
      <Text size="sm" fw={700}>
        {data.name}
      </Text>
      <Text size="sm" c="dimmed">
        {data.value} lượt phát hiện
      </Text>
    </Paper>
  );
};

function DetectionThumbnail({
  src,
  alt,
}: {
  src: string | null;
  alt: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <Center
        w={128}
        h={84}
        style={{
          flexShrink: 0,
          borderRadius: 8,
          border: "1px dashed #cbd5e1",
          background: "#f8fafc",
        }}
      >
        <Stack align="center" gap={3}>
          <IconCamera size={20} color="#94a3b8" />
          <Text size="10px" c="dimmed">
            {hasError ? "Không tải được ảnh" : "Không có ảnh"}
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      w={128}
      h={84}
      radius="md"
      fit="cover"
      loading="lazy"
      onError={() => setHasError(true)}
      style={{ flexShrink: 0, border: "1px solid #e2e8f0" }}
    />
  );
}

function ClickableCountBadge({
  count,
  label,
  color,
  icon,
  onClick,
}: ClickableCountBadgeProps) {
  if (count <= 0) {
    return (
      <Text size="sm" c="dimmed">
        -
      </Text>
    );
  }

  return (
    <Button
      variant="light"
      color={color}
      size="compact-sm"
      radius="md"
      leftSection={icon}
      onClick={onClick}
      styles={{
        root: {
          fontWeight: 600,
          whiteSpace: "nowrap",
        },
      }}
    >
      {count} {label}
    </Button>
  );
}

function ChartAxisLegend() {
  return (
    <Group justify="center" gap="xl" wrap="wrap" mt="sm">
      <Group gap={6} wrap="nowrap">
        <Box w={12} h={12} style={{ borderRadius: 3, background: "#ef4444" }} />
        <Text size="xs" c="#64748b" fw={500}>
          Lượt phát hiện sinh viên bị cấm
        </Text>
      </Group>

      <Group gap={6} wrap="nowrap">
        <Box w={12} h={12} style={{ borderRadius: 3, background: "#2563eb" }} />
        <Text size="xs" c="#64748b" fw={500}>
          Lượt phát hiện sinh viên nợ phí
        </Text>
      </Group>
    </Group>
  );
}

export default function BiCamSubPage() {
  const t = useTranslations("Statistics");

  const getTranslatedStatus = (statusName: string) => {
    if (statusName === "Đang cấm") return t("banning");
    if (statusName === "Hết hạn") return t("expired");
    return statusName;
  };

  const [keyWordFilter, setKeyWordFilter] = useState("");
  const [tuNgayFilter, setTuNgayFilter] = useState<Date | null>(
    () => getDefaultFilterDates().tu,
  );
  const [denNgayFilter, setDenNgayFilter] = useState<Date | null>(
    () => getDefaultFilterDates().den,
  );

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bannedList, setBannedList] = useState<BannedItem[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [detectionTotals, setDetectionTotals] = useState({
    banned: 0,
    debt: 0,
  });

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
  const [selectedDetailRow, setSelectedDetailRow] =
    useState<BannedTableRowView | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>("banned");

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

  const openStudentDetail = (row: BannedTableRowView, tab: DetailTab) => {
    setSelectedDetailRow(row);
    setActiveDetailTab(tab);
  };

  const getDefaultDetailTab = (row: BannedTableRowView): DetailTab => {
    if (row.bannedCount > 0) return "banned";
    if (row.debtCount > 0) return "debt";
    return "detection";
  };

  const loadBannedData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const defaultDates = getDefaultFilterDates();
      const res = await fetchThongKeSvBiCamNoPhi({
        tuNgay: formatDateApi(tuNgayFilter || defaultDates.tu),
        denNgay: formatDateApi(denNgayFilter || defaultDates.den),
        keyWord: keyWordFilter.trim(),
      });
      const payload = res?.payload as BannedStatisticsPayload | undefined;
      const rawItems: BannedApiItem[] = Array.isArray(payload?.chiTiet)
        ? payload.chiTiet
        : [];
      const items: BannedItem[] = rawItems.map((item, index) => {
        const maSinhVien =
          item.maSinhVien || item.maSo || item.maso || item.studentId || "";
        const ngayBatDau =
          parseTimestamp(item.ngayBatDau) ||
          parseTimestamp(item.startDate) ||
          parseTimestamp(item.createdDate);
        const ngayKetThuc =
          parseTimestamp(item.ngayKetThuc) || parseTimestamp(item.endDate);

        return {
          camId: item.camId ?? index + 1,
          sinhVienId: item.sinhVienId ?? item.studentId ?? item.id ?? "",
          maSinhVien: String(maSinhVien || ""),
          hoTen: item.hoTen || item.fullName || item.ten || "",
          maPhong: item.maPhong || "-",
          maLop: item.maLop,
          tenLop: item.tenLop,
          lop: item.lop,
          lyDo: item.reason || item.lyDo || "",
          ngayBatDau,
          ngayKetThuc,
          loaiSuKienId:
            item.loaiSuKienId ??
            item.violationCount ??
            item.tongSoLanNoPhi ??
            0,
          tongSoLanBiCam: item.tongSoLanBiCam,
          tongSoLanNoPhi: item.tongSoLanNoPhi,
          danhSachCam: Array.isArray(item.danhSachCam) ? item.danhSachCam : [],
          danhSachNoPhi: Array.isArray(item.danhSachNoPhi)
            ? item.danhSachNoPhi
            : [],
          danhSachChiTietPhatHien: Array.isArray(item.danhSachChiTietPhatHien)
            ? item.danhSachChiTietPhatHien
            : [],
          trangThai:
            item.status ||
            (ngayKetThuc && ngayKetThuc < Date.now() ? "Hết hạn" : "Đang cấm"),
        };
      });
      setBannedList(items);
      setTotalElements(items.length);
      setDetectionTotals({
        banned: Math.max(
          0,
          Number(payload?.tongSoLuotPhatHienSinhVienBiCam) || 0,
        ),
        debt: Math.max(
          0,
          Number(payload?.tongSoLuotPhatHienSinhVienNoPhi) || 0,
        ),
      });
    } catch (err: any) {
      setError(err?.message || "Lỗi khi tải dữ liệu sinh viên bị cấm");
      setBannedList([]);
      setTotalElements(0);
      setDetectionTotals({ banned: 0, debt: 0 });
    } finally {
      setLoading(false);
    }
  }, [denNgayFilter, keyWordFilter, tuNgayFilter]);

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
    const defaultDates = getDefaultFilterDates();
    setKeyWordFilter("");
    setTuNgayFilter(defaultDates.tu);
    setDenNgayFilter(defaultDates.den);
  };

  const handleSearch = () => {
    loadBannedData();
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
      loadBannedData();
    } catch (err: any) {
      console.error("[BiCam] Save error:", err);
      showToast("error", err?.message || t("toastSaveError"));
    } finally {
      setSaving(false);
    }
  };

  const studentStatusChartData = useMemo<StudentStatusChartItem[]>(() => {
    return [
      {
        name: "Sinh viên bị cấm",
        value: detectionTotals.banned,
        color: "#ef4444",
      },
      {
        name: "Sinh viên nợ phí",
        value: detectionTotals.debt,
        color: "#2563eb",
      },
    ];
  }, [detectionTotals]);

  const chartTotal = useMemo(
    () => studentStatusChartData.reduce((sum, item) => sum + item.value, 0),
    [studentStatusChartData],
  );

  const filteredBanned = bannedList.filter((item) => {
    const keyword = keyWordFilter.trim().toLowerCase();
    if (!keyword) return true;

    const maSinhVien = (item.maSinhVien || "").toLowerCase();
    const nameResolved = (item.hoTen || "").toLowerCase();

    return maSinhVien.includes(keyword) || nameResolved.includes(keyword);
  });

  const tableRows = useMemo<BannedTableRowView[]>(
    () =>
      filteredBanned.map((item) => {
        const bannedItems = Array.isArray(item.danhSachCam)
          ? item.danhSachCam
          : [];

        const debtItems = Array.isArray(item.danhSachNoPhi)
          ? item.danhSachNoPhi
          : [];

        const detectionItems = Array.isArray(item.danhSachChiTietPhatHien)
          ? item.danhSachChiTietPhatHien
          : [];

        const detectionDetails = getDetectionDetails(item);
        let status: StudentStatus = "NORMAL";

        if (bannedItems.length > 0 && debtItems.length > 0) {
          status = "BOTH";
        } else if (bannedItems.length > 0) {
          status = "BANNED";
        } else if (debtItems.length > 0) {
          status = "DEBT";
        } else if (detectionItems.length > 0) {
          status = "DETECTED";
        }

        return {
          item,
          bannedItems,
          debtItems,
          detectionItems,
          detectionDetails,
          bannedCount:
            typeof item.tongSoLanBiCam === "number"
              ? item.tongSoLanBiCam
              : bannedItems.length,
          debtCount:
            typeof item.tongSoLanNoPhi === "number"
              ? item.tongSoLanNoPhi
              : debtItems.length,
          detectionCount: detectionItems.length,
          status,
        };
      }),
    [filteredBanned],
  );

  const taoDuLieuXuatBiCam = () => {
    return tableRows.map((row, index) => ({
      STT: index + 1,
      MSSV: row.item.maSinhVien || "-",
      "Họ tên": row.item.hoTen || "-",
      Lớp: row.item.maLop || row.item.tenLop || row.item.lop || "-",
      Phòng: row.item.maPhong || "-",
      "Số lượt cấm": row.bannedCount,
      "Số khoản nợ phí": row.debtCount,
      "Số lần camera phát hiện": row.detectionCount,
      "Trạng thái": getStudentStatusDisplay(row.status).label,
    }));
  };

  const xuLyXuatExcel = () => {
    const columnLabels = [
      "STT",
      "MSSV",
      "Họ tên",
      "Lớp",
      "Phòng",
      "Số lượt cấm",
      "Số khoản nợ phí",
      "Số lần camera phát hiện",
      "Trạng thái",
    ];

    setDuLieuXuatExcel({
      title: "Danh sách sinh viên thuộc diện cấm / nợ phí được phát hiện",
      fileName: `Danh_Sach_Sinh_Vien_Vi_Pham_${new Date().toISOString().split("T")[0]}`,
      sheetName: "Sinh viên vi phạm",
      columnLabels,
      data: taoDuLieuXuatBiCam(),
    });
  };

  const xuLyXuatPdf = () => {
    const columnLabels = [
      "STT",
      "MSSV",
      "Họ tên",
      "Lớp",
      "Phòng",
      "Số lượt cấm",
      "Số khoản nợ phí",
      "Số lần camera phát hiện",
      "Trạng thái",
    ];

    setDuLieuXuatPdf({
      title: "Danh sách sinh viên thuộc diện cấm / nợ phí được phát hiện",
      fileName: `Danh_Sach_Sinh_Vien_Vi_Pham_${new Date().toISOString().split("T")[0]}`,
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
            <div>
              <DateInput
                label="TỪ NGÀY"
                placeholder="Chọn từ ngày..."
                value={tuNgayFilter}
                onChange={(value) => {
                  setTuNgayFilter(normalizeDateInputValue(value));
                }}
                valueFormat="DD/MM/YYYY"
                clearable={false}
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
              <DateInput
                label="ĐẾN NGÀY"
                placeholder="Chọn đến ngày..."
                value={denNgayFilter}
                onChange={(value) => {
                  setDenNgayFilter(normalizeDateInputValue(value));
                }}
                valueFormat="DD/MM/YYYY"
                clearable={false}
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
                label="HỌ TÊN/MSSV"
                placeholder="Nhập họ tên hoặc MSSV..."
                value={keyWordFilter}
                onChange={(e) => setKeyWordFilter(e.currentTarget.value)}
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
          <Card
            withBorder
            radius="lg"
            p="lg"
            style={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <Stack gap={4} mb="md">
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
                Thống kê lượt phát hiện
              </Text>

              <Text size="sm" c="dimmed">
                Tổng số lượt camera phát hiện sinh viên bị cấm và sinh viên nợ
                phí trong kỳ lọc.
              </Text>
            </Stack>
            <Box h={360}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={studentStatusChartData}
                  margin={{
                    top: 24,
                    right: 24,
                    left: 0,
                    bottom: 24,
                  }}
                  barCategoryGap="35%"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    dataKey="name"
                    interval={0}
                    tickLine={false}
                    axisLine={{
                      stroke: "#cbd5e1",
                    }}
                    tick={renderWrappedAxisTick}
                    height={56}
                  />

                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fontSize: 12,
                      fill: "#64748b",
                    }}
                    domain={[0, "dataMax + 1"]}
                  />

                  <RechartsTooltip
                    content={<StudentStatusTooltip />}
                    cursor={{
                      fill: "rgba(148, 163, 184, 0.08)",
                    }}
                  />

                  <Bar
                    dataKey="value"
                    name="Số lượt phát hiện"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={120}
                    minPointSize={3}
                    label={{
                      position: "top",
                      fill: "#475569",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {studentStatusChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
            <ChartAxisLegend />

            <Text size="sm" c="dimmed" mt="xs">
              Tổng cộng{" "}
              <span
                style={{
                  fontWeight: 700,
                  color: "#1f5ca9",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {chartTotal}
              </span>{" "}
              lượt phát hiện.
            </Text>
          </Card>

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
                DANH SÁCH SINH VIÊN THUỘC DIỆN CẤM / NỢ PHÍ ĐƯỢC PHÁT HIỆN (
                {totalElements})
              </Text>
            </Group>

            <ScrollArea>
              <Table
                verticalSpacing="sm"
                highlightOnHover
                style={{ minWidth: 1240 }}
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
                      Sinh viên
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: "#475569",
                        fontWeight: 600,
                        fontSize: "12px",
                      }}
                    >
                      Lớp
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: "#475569",
                        fontWeight: 600,
                        fontSize: "12px",
                        textAlign: "center",
                      }}
                    >
                      Phòng
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: "#475569",
                        fontWeight: 600,
                        fontSize: "12px",
                        minWidth: 140,
                        textAlign: "center",
                      }}
                    >
                      Danh sách cấm
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: "#475569",
                        fontWeight: 600,
                        fontSize: "12px",
                        minWidth: 140,
                        textAlign: "center",
                      }}
                    >
                      Nợ phí
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: "#475569",
                        fontWeight: 600,
                        fontSize: "12px",
                        minWidth: 160,
                        textAlign: "center",
                      }}
                    >
                      Camera phát hiện/Phát hiện thêm
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: "#475569",
                        fontWeight: 600,
                        fontSize: "12px",
                        minWidth: 140,
                        textAlign: "center",
                      }}
                    >
                      Trạng thái
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: "#475569",
                        fontWeight: 600,
                        fontSize: "12px",
                        textAlign: "center",
                      }}
                    >
                      Thao tác
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {tableRows.map((row, index) => {
                    const statusDisplay = getStudentStatusDisplay(row.status);

                    return (
                      <Table.Tr
                        key={row.item.camId || index}
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        <Table.Td
                          style={{ fontSize: "13px", color: "#64748b" }}
                        >
                          {index + 1}
                        </Table.Td>
                        <Table.Td>
                          <Stack gap={2}>
                            <Text size="sm" fw={700} c="#1e293b">
                              {row.item.hoTen || "-"}
                            </Text>
                            <Text
                              size="xs"
                              c="#1f5ca9"
                              fw={600}
                              style={{ fontFamily: "monospace" }}
                            >
                              {row.item.maSinhVien || "-"}
                            </Text>
                          </Stack>
                        </Table.Td>
                        <Table.Td
                          style={{
                            fontSize: "13px",
                            color: "#475569",
                          }}
                        >
                          {row.item.maLop ||
                            row.item.tenLop ||
                            row.item.lop ||
                            "-"}
                        </Table.Td>
                        <Table.Td
                          style={{
                            fontSize: "13px",
                            color: "#475569",
                            textAlign: "center",
                          }}
                        >
                          <Badge color="teal" variant="light" radius="sm">
                            {row.item.maPhong || "-"}
                          </Badge>
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          <ClickableCountBadge
                            count={row.bannedCount}
                            label="lượt cấm"
                            color="red"
                            icon={<IconBan size={14} />}
                            onClick={() => openStudentDetail(row, "banned")}
                          />
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          <ClickableCountBadge
                            count={row.debtCount}
                            label="khoản"
                            color="orange"
                            icon={<IconCash size={14} />}
                            onClick={() => openStudentDetail(row, "debt")}
                          />
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          <ClickableCountBadge
                            count={row.detectionCount}
                            label="lần phát hiện"
                            color="blue"
                            icon={<IconCamera size={14} />}
                            onClick={() => openStudentDetail(row, "detection")}
                          />
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          <Badge
                            color={statusDisplay.color}
                            variant="light"
                            radius="sm"
                          >
                            {statusDisplay.label}
                          </Badge>
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          <Tooltip label="Xem toàn bộ thông tin">
                            <ActionIcon
                              variant="light"
                              color="blue"
                              radius="md"
                              onClick={() =>
                                openStudentDetail(row, getDefaultDetailTab(row))
                              }
                            >
                              <IconEye size={17} />
                            </ActionIcon>
                          </Tooltip>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                  {tableRows.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={9}>
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

      <Drawer
        opened={Boolean(selectedDetailRow)}
        onClose={() => setSelectedDetailRow(null)}
        position="right"
        size="xl"
        title={
          <Stack gap={2}>
            <Text fw={700} c="#1f5ca9">
              Chi tiết sinh viên
            </Text>
            <Text size="sm" c="dimmed">
              {selectedDetailRow?.item.hoTen || "-"} •{" "}
              {selectedDetailRow?.item.maSinhVien || "-"}
            </Text>
          </Stack>
        }
        styles={{
          body: {
            paddingBottom: 24,
          },
        }}
      >
        <Paper withBorder radius="lg" p="md" mb="md">
          <Group justify="space-between" align="flex-start">
            <Stack gap={3}>
              <Text fw={700}>{selectedDetailRow?.item.hoTen || "-"}</Text>
              <Text size="sm" c="dimmed">
                MSSV: {selectedDetailRow?.item.maSinhVien || "-"}
              </Text>
              <Text size="sm" c="dimmed">
                Lớp:{" "}
                {selectedDetailRow?.item.maLop ||
                  selectedDetailRow?.item.tenLop ||
                  selectedDetailRow?.item.lop ||
                  "-"}
              </Text>
              <Text size="sm" c="dimmed">
                Phòng: {selectedDetailRow?.item.maPhong || "-"}
              </Text>
            </Stack>
          </Group>
        </Paper>

        <SimpleGrid cols={{ base: 1, sm: 3 }} mb="lg">
          <Paper withBorder radius="md" p="md">
            <Text size="xs" c="dimmed">
              Danh sách cấm
            </Text>
            <Text fw={800} size="xl" c="red">
              {selectedDetailRow?.bannedCount ?? 0}
            </Text>
          </Paper>

          <Paper withBorder radius="md" p="md">
            <Text size="xs" c="dimmed">
              Nợ phí
            </Text>
            <Text fw={800} size="xl" c="orange">
              {selectedDetailRow?.debtCount ?? 0}
            </Text>
          </Paper>

          <Paper withBorder radius="md" p="md">
            <Text size="xs" c="dimmed">
              Camera phát hiện
            </Text>
            <Text fw={800} size="xl" c="blue">
              {selectedDetailRow?.detectionCount ?? 0}
            </Text>
          </Paper>
        </SimpleGrid>

        <Tabs
          value={activeDetailTab}
          onChange={(value) =>
            setActiveDetailTab((value as DetailTab) || "banned")
          }
        >
          <Tabs.List grow>
            <Tabs.Tab value="banned" leftSection={<IconBan size={15} />}>
              Danh sách cấm ({selectedDetailRow?.bannedCount ?? 0})
            </Tabs.Tab>
            <Tabs.Tab value="debt" leftSection={<IconCash size={15} />}>
              Nợ phí ({selectedDetailRow?.debtCount ?? 0})
            </Tabs.Tab>
            <Tabs.Tab value="detection" leftSection={<IconCamera size={15} />}>
              Camera ({selectedDetailRow?.detectionCount ?? 0})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="banned" pt="md">
            {selectedDetailRow && selectedDetailRow.bannedItems.length === 0 ? (
              <Center py="xl">
                <Stack align="center" gap="xs">
                  <ThemeIcon size={44} radius="xl" color="gray" variant="light">
                    <IconCircleCheck size={22} />
                  </ThemeIcon>
                  <Text c="dimmed">Sinh viên không có thông tin cấm.</Text>
                </Stack>
              </Center>
            ) : (
              <Stack gap="sm">
                {selectedDetailRow?.bannedItems.map((item, index) => {
                  const reason =
                    item.lyDo ||
                    item.lyDoCam ||
                    item.noiDung ||
                    item.moTa ||
                    item.tenLoaiSuKien ||
                    "Thông tin cấm";

                  return (
                    <Paper
                      key={`banned-${index}`}
                      withBorder
                      radius="md"
                      p="md"
                    >
                      <Stack gap={6}>
                        <Group justify="space-between" align="flex-start">
                          <Text fw={700}>{reason}</Text>
                          {item.trangThai && (
                            <Badge color="red" variant="light">
                              {item.trangThai}
                            </Badge>
                          )}
                        </Group>
                        {item.maPhong && (
                          <Text size="sm" c="dimmed">
                            Phòng: {item.maPhong}
                          </Text>
                        )}
                        {formatDateValue(item.ngayBatDau) && (
                          <Text size="sm" c="dimmed">
                            Ngày bắt đầu: {formatDateValue(item.ngayBatDau)}
                          </Text>
                        )}
                        {formatDateValue(item.ngayKetThuc) && (
                          <Text size="sm" c="dimmed">
                            Ngày kết thúc: {formatDateValue(item.ngayKetThuc)}
                          </Text>
                        )}
                        {item.ghiChu && (
                          <Text size="sm" c="dimmed">
                            Ghi chú: {item.ghiChu}
                          </Text>
                        )}
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="debt" pt="md">
            {selectedDetailRow && selectedDetailRow.debtItems.length === 0 ? (
              <Center py="xl">
                <Stack align="center" gap="xs">
                  <ThemeIcon size={44} radius="xl" color="gray" variant="light">
                    <IconCircleCheck size={22} />
                  </ThemeIcon>
                  <Text c="dimmed">Sinh viên không có khoản nợ phí.</Text>
                </Stack>
              </Center>
            ) : (
              <Stack gap="sm">
                {selectedDetailRow?.debtItems.map((item, index) => {
                  const debtName =
                    item.tenLoaiSuKien ||
                    item.noiDung ||
                    item.tenLoi ||
                    item.moTa ||
                    "Khoản nợ";

                  return (
                    <Paper key={`debt-${index}`} withBorder radius="md" p="md">
                      <Stack gap={6}>
                        <Group justify="space-between" align="flex-start">
                          <Text fw={700}>{debtName}</Text>
                          {item.soTien !== null &&
                            item.soTien !== undefined && (
                              <Text fw={700} c="orange">
                                {formatCurrency(item.soTien)}
                              </Text>
                            )}
                        </Group>
                        {item.maPhong && (
                          <Text size="sm" c="dimmed">
                            Phòng: {item.maPhong}
                          </Text>
                        )}
                        {(item.noiDung || item.ghiChu) && (
                          <Text size="sm" c="dimmed">
                            Nội dung: {item.noiDung || item.ghiChu}
                          </Text>
                        )}
                        {item.trangThai && (
                          <Text size="sm" c="dimmed">
                            Trạng thái: {item.trangThai}
                          </Text>
                        )}
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="detection" pt="md">
            {selectedDetailRow &&
            selectedDetailRow.detectionDetails.length === 0 ? (
              <Center py="xl">
                <Stack align="center" gap="xs">
                  <ThemeIcon size={44} radius="xl" color="gray" variant="light">
                    <IconCircleCheck size={22} />
                  </ThemeIcon>
                  <Text c="dimmed">Chưa có lần phát hiện từ camera.</Text>
                </Stack>
              </Center>
            ) : (
              <Stack gap="sm">
                {selectedDetailRow?.detectionDetails.map((detail, index) => (
                  <Paper
                    key={`${detail.violation}-${detail.detectedAtLabel}-${index}`}
                    withBorder
                    radius="md"
                    p="md"
                  >
                    <Group
                      justify="space-between"
                      align="flex-start"
                      wrap="nowrap"
                    >
                      <Group
                        align="flex-start"
                        wrap="nowrap"
                        style={{ flex: 1, minWidth: 0 }}
                      >
                        <DetectionThumbnail
                          src={detail.imageUrl}
                          alt={`Ảnh camera phát hiện lần ${index + 1}`}
                        />

                        <ThemeIcon
                          color="blue"
                          variant="light"
                          style={{ flexShrink: 0 }}
                        >
                          <IconCamera size={17} />
                        </ThemeIcon>

                        <Stack gap={3}>
                          <Text fw={700}>{detail.violation}</Text>
                          <Text size="sm" c="dimmed">
                            Vị trí: {detail.cameraPosition}
                          </Text>
                          <Text size="sm" c="dimmed">
                            Thời gian: {detail.detectedAtLabel}
                          </Text>
                        </Stack>
                      </Group>

                      <Badge variant="light" color="blue">
                        Lần {index + 1}
                      </Badge>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            )}
          </Tabs.Panel>
        </Tabs>
      </Drawer>

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
