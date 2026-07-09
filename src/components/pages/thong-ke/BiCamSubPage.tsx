"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Pagination,
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
} from "@/services/dashboard/dashboardService";

interface BannedItem {
  camId: number;
  sinhVienId: number;
  lyDo: string;
  ngayBatDau: number | null;
  ngayKetThuc: number | null;
  loaiSuKienId: number;
  maSinhVien: string;
  hoTen?: string;
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
        <p style={{ margin: 0, fontWeight: 700, fontSize: "13px", color: "#1e293b" }}>
          {data.fullName}
        </p>
        <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#dc2626", lineHeight: "1.4", wordBreak: "break-word", whiteSpace: "normal" }}>
          <span style={{ fontWeight: 600 }}>Lý do cấm:</span> {data.lyDo || "Không rõ lý do"}
        </p>
      </div>
    );
  }
  return null;
};

export default function BiCamSubPage() {
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
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

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

  const loadBannedData = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchSinhVienCamPaginate({
          page: String(page),
          pageSize: String(PAGE_SIZE),
          maSinhVien: mssvFilter.trim() || "-1",
        });
        const payload = res?.payload;
        const items: BannedItem[] = payload?.items ?? [];
        setBannedList(items);
        const calculatedPages = Math.ceil((payload?.totalElements ?? 0) / PAGE_SIZE) || 1;
        setTotalPages(calculatedPages);
        setTotalElements(payload?.totalElements ?? 0);

        // Resolve student names
        const uniqueMaSv = [...new Set(items.map((i) => i.maSinhVien).filter(Boolean))];
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
              if (sv.maSinhVien) nameMap[sv.maSinhVien] = sv.hoTen || sv.ten || sv.hoVaTen || sv.maSinhVien;
            });
            setSvNameMap(nameMap);
          } catch {
            // ignore
          }
        }
      } catch (err: any) {
        setError(err?.message || "Lỗi khi tải dữ liệu sinh viên bị cấm");
        setBannedList([]);
      } finally {
        setLoading(false);
      }
    },
    [mssvFilter]
  );

  useEffect(() => {
    loadBannedData(currentPage);
  }, [currentPage, loadBannedData]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (svSearchRef.current && !svSearchRef.current.contains(e.target as Node)) {
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
    loadBannedData(1);
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
    if (!form.maSinhVien.trim()) errs.maSinhVien = "Vui lòng nhập mã sinh viên";
    if (!form.lyDo.trim()) errs.lyDo = "Vui lòng nhập lý do cấm";
    if (!form.ngayBatDau) errs.ngayBatDau = "Vui lòng chọn ngày bắt đầu cấm";
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
        throw new Error(data?.message || data?.error || "Thao tác thất bại (API status: " + data?.status + ")");
      }

      setModalOpen(false);
      showToast("success", isEditing ? "Cập nhật lệnh cấm thành công!" : "Thêm lệnh cấm thành công!");
      loadBannedData(currentPage);
    } catch (err: any) {
      console.error("[BiCam] Save error:", err);
      showToast("error", err?.message || "Lỗi khi lưu dữ liệu. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  // Chart data
  const chartData =
    bannedList.length > 0
      ? bannedList.slice(0, 10).map((item) => ({
        name: svNameMap[item.maSinhVien]
          ? (svNameMap[item.maSinhVien].split(" ").pop() || svNameMap[item.maSinhVien])
          : item.maSinhVien || `SV${item.sinhVienId}`,
        fullName: svNameMap[item.maSinhVien] || item.maSinhVien,
        value: 1,
        lyDo: item.lyDo,
      }))
      : [{ name: "Không có dữ liệu", fullName: "", value: 0, lyDo: "" }];

  const filteredBanned = bannedList.filter((item) => {
    const mssvMatch = !mssvFilter || (item.maSinhVien || "").toLowerCase().includes(mssvFilter.toLowerCase());
    const nameResolved = svNameMap[item.maSinhVien] || "";
    const nameMatch = !hoTenFilter || nameResolved.toLowerCase().includes(hoTenFilter.toLowerCase());
    return mssvMatch && nameMatch;
  });

  return (
    <Stack gap="xl" p="sm" style={{ backgroundColor: "#fafbfd", minHeight: "100vh", fontFamily: "var(--font-readex-pro), sans-serif" }}>
      {/* Toast - client-only, no SSR mismatch */}
      {toast && (
        <div style={{
          position: "fixed",
          top: 20,
          right: 24,
          zIndex: 9999,
          minWidth: 320,
        }}>
          <Alert
            color={toast.type === "success" ? "green" : "red"}
            icon={toast.type === "success" ? <IconCheck size={18} /> : <IconX size={18} />}
            radius="md"
            style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
          >
            <Text fw={600} size="sm">{toast.msg}</Text>
          </Alert>
        </div>
      )}

      {/* Header */}
      <Group justify="space-between" align="center">
        <Group gap="md">
          <ThemeIcon size={38} variant="light" color="blue" style={{ backgroundColor: "#e0f2fe" }}>
            <IconReportAnalytics size={20} color="#1f5ca9" />
          </ThemeIcon>
          <Title order={2} fw={800} c="#1f5ca9" style={{ letterSpacing: "-0.5px", fontFamily: "var(--font-readex-pro), sans-serif" }}>
            THỐNG KÊ SINH VIÊN BỊ CẤM / CẢNH BÁO XÂM NHẬP
          </Title>
        </Group>
        <Button
          leftSection={<IconPlus size={16} />}
          style={{ background: "linear-gradient(135deg, #1f5ca9, #00afef)", fontFamily: "var(--font-readex-pro), sans-serif", borderRadius: "8px" }}
          onClick={openAddModal}
        >
          Thêm lệnh cấm
        </Button>
      </Group>

      {/* Filter Card */}
      <Card withBorder radius="lg" p="lg" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)", borderColor: "#e2e8f0" }}>
        <Stack gap="md">
          {/* Row 1: 2 filter fields */}
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              label="HỌ TÊN"
              placeholder="Nhập họ tên..."
              value={hoTenFilter}
              onChange={(e) => setHoTenFilter(e.currentTarget.value)}
              styles={{
                label: { fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "6px", letterSpacing: "0.5px" },
                input: { borderRadius: "8px", fontFamily: "var(--font-readex-pro), sans-serif", height: "40px" },
              }}
            />
            <TextInput
              label="MSSV / MÃ SỐ"
              placeholder="Nhập MSSV để tìm kiếm..."
              value={mssvFilter}
              onChange={(e) => setMssvFilter(e.currentTarget.value)}
              styles={{
                label: { fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "6px", letterSpacing: "0.5px" },
                input: { borderRadius: "8px", fontFamily: "var(--font-readex-pro), sans-serif", height: "40px" },
              }}
            />
          </SimpleGrid>

          {/* Dotted divider */}
          <Divider variant="dashed" style={{ borderStyle: "dashed", borderColor: "#cbd5e1" }} my="xs" />

          {/* Row 2: Search buttons */}
          <Group justify="flex-end" gap="sm">
            <Button
              leftSection={loading ? <Loader size={16} color="white" /> : <IconSearch size={16} />}
              style={{ backgroundColor: "#1f5ca9", fontFamily: "var(--font-readex-pro), sans-serif", borderRadius: "8px", height: "40px" }}
              onClick={handleSearch}
              disabled={loading}
            >
              Tìm kiếm
            </Button>
            <Button
              leftSection={<IconRefresh size={16} />}
              variant="outline"
              color="gray"
              onClick={handleReset}
              style={{ borderColor: "#cbd5e1", color: "#64748b", fontFamily: "var(--font-readex-pro), sans-serif", borderRadius: "8px", height: "40px" }}
            >
              Làm mới
            </Button>
            <Button
              leftSection={<IconDownload size={16} />}
              variant="outline"
              style={{ borderColor: "#1f5ca9", color: "#1f5ca9", fontFamily: "var(--font-readex-pro), sans-serif", borderRadius: "8px", height: "40px" }}
            >
              Xuất Excel
            </Button>
            <Button
              leftSection={<IconDownload size={16} />}
              variant="outline"
              style={{ borderColor: "#0ea5e9", color: "#0ea5e9", fontFamily: "var(--font-readex-pro), sans-serif", borderRadius: "8px", height: "40px" }}
            >
              Xuất PDF
            </Button>
          </Group>
        </Stack>
      </Card>

      {error && (
        <Badge color="red" variant="light" size="lg" style={{ width: "100%", padding: "12px", borderRadius: "8px" }}>
          {error}
        </Badge>
      )}

      {loading ? (
        <Center py="xl">
          <Stack align="center" gap="sm">
            <Loader size="md" color="blue" />
            <Text size="sm" c="dimmed">Đang tải danh sách sinh viên bị cấm...</Text>
          </Stack>
        </Center>
      ) : (
        <>
          {/* Chart */}
          <Grid gutter="md">
            <Grid.Col span={12}>
              <Card withBorder radius="lg" p="lg" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <Text fw={700} size="sm" c="dimmed" mb="md" style={{ letterSpacing: "0.5px" }}>
                  TOP 10 SINH VIÊN BỊ CẤM (Trang hiện tại)
                </Text>
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#e03131" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Grid.Col>
          </Grid>

          {/* Table */}
          <Card withBorder radius="lg" p="lg" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <Group justify="space-between" mb="md">
              <Text fw={800} size="md" c="#1e293b" style={{ letterSpacing: "0.25px" }}>
                BẢNG THỐNG KÊ SINH VIÊN BỊ CẤM ({totalElements} bản ghi)
              </Text>
            </Group>

            <ScrollArea>
              <Table verticalSpacing="sm" highlightOnHover style={{ minWidth: 860 }}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>STT</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>Mã SV</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>Tên sinh viên</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>Lý do cấm</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px", textAlign: "center" }}>Ngày bắt đầu</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px", textAlign: "center" }}>Ngày kết thúc</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px", textAlign: "center" }}>Loại sự kiện</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px", textAlign: "center" }}>Thao tác</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredBanned.map((row, index) => (
                    <Table.Tr key={row.camId || index} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <Table.Td style={{ fontSize: "13px", color: "#64748b" }}>
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </Table.Td>
                      <Table.Td style={{ fontSize: "13px", color: "#64748b", fontFamily: "monospace", fontWeight: 600 }}>
                        {row.maSinhVien}
                      </Table.Td>
                      <Table.Td style={{ fontSize: "13px", color: "#1e293b", fontWeight: 600 }}>
                        {svNameMap[row.maSinhVien] || "—"}
                      </Table.Td>
                      <Table.Td style={{ fontSize: "13px", color: "#fa5252", fontWeight: 500, maxWidth: 260 }}>
                        {row.lyDo}
                      </Table.Td>
                      <Table.Td style={{ fontSize: "13px", color: "#475569", textAlign: "center" }}>
                        {formatTimestamp(row.ngayBatDau)}
                      </Table.Td>
                      <Table.Td style={{ fontSize: "13px", color: "#475569", textAlign: "center" }}>
                        {row.ngayKetThuc ? formatTimestamp(row.ngayKetThuc) : (
                          <Badge color="red" variant="light" size="xs">Chưa có</Badge>
                        )}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        <Badge color="orange" variant="light" size="sm">
                          ID: {row.loaiSuKienId}
                        </Badge>
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        <Tooltip label="Sửa lệnh cấm" withArrow>
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
                          Không tìm thấy sinh viên bị cấm phù hợp
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            {totalPages > 1 && (
              <Group justify="center" mt="lg">
                <Pagination
                  value={currentPage}
                  onChange={(p) => setCurrentPage(p)}
                  total={totalPages}
                  size="sm"
                  radius="md"
                  color="#1f5ca9"
                />
              </Group>
            )}
          </Card>
        </>
      )}

      {/* Add / Edit Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          <Group gap="xs">
            <ThemeIcon size={28} variant="light" color={isEditing ? "blue" : "green"}>
              {isEditing ? <IconEdit size={16} /> : <IconPlus size={16} />}
            </ThemeIcon>
            <Text fw={700} c={isEditing ? "#1f5ca9" : "#16a34a"} size="md">
              {isEditing ? "Chỉnh sửa lệnh cấm sinh viên" : "Thêm mới lệnh cấm sinh viên"}
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
                  <Text size="11px" fw={700} c="#1f5ca9" style={{ letterSpacing: "0.5px" }}>THÔNG TIN SINH VIÊN</Text>
                </Group>
              }
              mb="sm"
            />

            {/* Autocomplete search */}
            <div ref={svSearchRef} style={{ position: "relative" }}>
              <TextInput
                label="TÌM KIẾM SINH VIÊN (theo mã số)"
                placeholder="Nhập mã sinh viên để tìm kiếm..."
                value={svSearch}
                onChange={(e) => handleSvSearchChange(e.currentTarget.value)}
                leftSection={svLoading ? <Loader size={14} /> : <IconUserSearch size={14} color="#94a3b8" />}
                error={formErrors.maSinhVien}
                styles={{
                  label: { fontSize: "11px", fontWeight: 700, color: "#1f5ca9", marginBottom: "6px", letterSpacing: "0.5px" },
                  input: { borderRadius: "8px", fontFamily: "var(--font-readex-pro), sans-serif" },
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
                        borderBottom: i < svSuggestions.length - 1 ? "1px solid #f1f5f9" : "none",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f7ff")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <Group gap="xs">
                        <Text size="xs" fw={700} c="#1f5ca9" style={{ fontFamily: "monospace" }}>{sv.maSinhVien}</Text>
                        <Text size="xs" c="#475569">—</Text>
                        <Text size="xs" fw={500} c="#1e293b">{sv.hoTen}</Text>
                        {sv.maPhong && <Badge size="xs" variant="light" color="teal">{sv.maPhong}</Badge>}
                      </Group>
                    </Box>
                  ))}
                </Paper>
              )}
            </div>

            {/* Display selected student info */}
            {form.hoTen && (
              <Paper radius="md" p="sm" mt="xs" style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <Group gap="xs">
                  <IconCheck size={16} color="#16a34a" />
                  <Text size="sm" fw={600} c="#15803d">
                    Đã chọn: <span style={{ color: "#1f5ca9" }}>{form.maSinhVien}</span> — {form.hoTen}
                  </Text>
                </Group>
              </Paper>
            )}

            {/* Manual entry fallback */}
            {!form.sinhVienId && (
              <Grid gutter="sm" mt="xs">
                <Grid.Col span={6}>
                  <TextInput
                    label="MÃ SINH VIÊN (nhập thủ công)"
                    placeholder="VD: 805"
                    value={form.maSinhVien}
                    onChange={(e) => {
                      const val = e.currentTarget.value;
                      setForm((f) => ({ ...f, maSinhVien: val }));
                      setSvSearch(val);
                      setFormErrors((err) => ({ ...err, maSinhVien: undefined }));
                    }}
                    error={formErrors.maSinhVien}
                    styles={{
                      label: { fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "4px", letterSpacing: "0.5px" },
                      input: { borderRadius: "8px", fontSize: "13px" },
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="ID SINH VIÊN (sinhVienId)"
                    placeholder="VD: 16"
                    value={form.sinhVienId}
                    onChange={(e) => { const val = e.currentTarget.value; setForm((f) => ({ ...f, sinhVienId: val })); }}
                    styles={{
                      label: { fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "4px", letterSpacing: "0.5px" },
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
                  <Text size="11px" fw={700} c="#1f5ca9" style={{ letterSpacing: "0.5px" }}>CHI TIẾT LỆNH CẤM</Text>
                </Group>
              }
              mb="sm"
            />
            <Stack gap="sm">
              <Textarea
                label="LÝ DO CẤM *"
                placeholder="Nhập lý do cấm sinh viên..."
                value={form.lyDo}
                onChange={(e) => {
                  const val = e.currentTarget.value;
                  setForm((f) => ({ ...f, lyDo: val }));
                  setFormErrors((err) => ({ ...err, lyDo: undefined }));
                }}
                minRows={3}
                error={formErrors.lyDo}
                styles={{
                  label: { fontSize: "11px", fontWeight: 700, color: "#1f5ca9", marginBottom: "6px", letterSpacing: "0.5px" },
                  input: { borderRadius: "8px", fontFamily: "var(--font-readex-pro), sans-serif" },
                }}
              />

              <Grid gutter="sm">
                <Grid.Col span={6}>
                  <DateInput
                    label="NGÀY BẮT ĐẦU CẤM *"
                    placeholder="Chọn ngày..."
                    value={form.ngayBatDau}
                    onChange={(val) => {
                      setForm((f) => ({ ...f, ngayBatDau: val ? new Date(val) : null }));
                      setFormErrors((err) => ({ ...err, ngayBatDau: undefined }));
                    }}
                    valueFormat="DD/MM/YYYY"
                    clearable
                    leftSection={<IconCalendar size={14} color="#94a3b8" />}
                    error={formErrors.ngayBatDau}
                    styles={{
                      label: { fontSize: "11px", fontWeight: 700, color: "#1f5ca9", marginBottom: "6px", letterSpacing: "0.5px" },
                      input: { borderRadius: "8px" },
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <DateInput
                    label="NGÀY KẾT THÚC CẤM"
                    placeholder="Để trống nếu chưa xác định"
                    value={form.ngayKetThuc}
                    onChange={(val) => setForm((f) => ({ ...f, ngayKetThuc: val ? new Date(val) : null }))}
                    valueFormat="DD/MM/YYYY"
                    clearable
                    leftSection={<IconCalendar size={14} color="#94a3b8" />}
                    styles={{
                      label: { fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "6px", letterSpacing: "0.5px" },
                      input: { borderRadius: "8px" },
                    }}
                  />
                </Grid.Col>
              </Grid>

              <TextInput
                label="LOẠI SỰ KIỆN ID"
                placeholder="VD: 2"
                value={form.loaiSuKienId}
                onChange={(e) => { const val = e.currentTarget.value; setForm((f) => ({ ...f, loaiSuKienId: val })); }}
                styles={{
                  label: { fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "6px", letterSpacing: "0.5px" },
                  input: { borderRadius: "8px", fontSize: "13px", maxWidth: 160 },
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
              Dữ liệu sẽ được lưu trực tiếp vào cơ sở dữ liệu. Các trường có dấu <b>*</b> là bắt buộc.
            </Text>
          </Alert>

          {/* Buttons */}
          <Group justify="flex-end" mt="xs" gap="sm">
            <Button variant="outline" color="gray" onClick={() => setModalOpen(false)} style={{ borderRadius: "8px" }}>
              Hủy bỏ
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
              {saving ? "Đang lưu..." : isEditing ? "Cập nhật" : "Lưu lệnh cấm"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
