"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Group,
  Text,
  Table,
  Badge,
  Avatar,
  Anchor,
  ScrollArea,
  Stack,
  Title,
  Grid,
  TextInput,
  Select,
  Button,
  ActionIcon,
  Collapse,
  Box,
  ThemeIcon,
  Modal,
  Radio,
  Textarea,
  Loader,
  Pagination,
  Center,
} from "@mantine/core";
import {
  IconSearch,
  IconRefresh,
  IconDownload,
  IconPlus,
  IconChevronDown,
  IconChevronUp,
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
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  MOCK_THONG_KE_OVERVIEW,
  MOCK_THONG_KE_DETAILS,
  ThongKeOverview,
  ThongKeDetail,
  AbsentStudent,
  BannedViolation,
  MOCK_ABSENT_STUDENTS,
  MOCK_ABSENT_CHART,
  MOCK_STRANGER_CHART,
  MOCK_BANNED_VIOLATIONS,
  MOCK_BANNED_CHART,
} from "./mockThongKeData";
import {
  fetchNguoiLaPaginate,
  NguoiLaItem,
} from "@/services/dashboard/dashboardService";

interface ThongKePageProps {
  type?: "luot-ra-vao" | "vang-mat" | "nguoi-la" | "bi-cam";
}

export default function ThongKePage({ type = "luot-ra-vao" }: ThongKePageProps) {
  // Local states for data to allow interactive additions
  const [overviewList, setOverviewList] = useState<ThongKeOverview[]>(MOCK_THONG_KE_OVERVIEW);
  const [detailsMap, setDetailsMap] = useState<{ [key: string]: Omit<ThongKeDetail, "stt">[] }>(MOCK_THONG_KE_DETAILS);

  // States for absent and banned logs (still mock)
  const [absentList, setAbsentList] = useState<AbsentStudent[]>(MOCK_ABSENT_STUDENTS);
  const [bannedList, setBannedList] = useState<BannedViolation[]>(MOCK_BANNED_VIOLATIONS);

  // === Nguoi-la API states ===
  const [nguoiLaList, setNguoiLaList] = useState<NguoiLaItem[]>([]);
  const [nguoiLaLoading, setNguoiLaLoading] = useState(false);
  const [nguoiLaError, setNguoiLaError] = useState<string | null>(null);
  const [nguoiLaPage, setNguoiLaPage] = useState(1);
  const [nguoiLaPageSize] = useState(10);
  const [nguoiLaTotalPages, setNguoiLaTotalPages] = useState(1);
  const [nguoiLaTotalElements, setNguoiLaTotalElements] = useState(0);

  // Collapsible filters
  const [opened, setOpened] = useState(true);

  // Search input states
  const [hoTen, setHoTen] = useState("");
  const [mssv, setMssv] = useState("");
  const [tuNgay, setTuNgay] = useState("");
  const [denNgay, setDenNgay] = useState("");
  const [khuKtx, setKhuKtx] = useState("Tất cả");
  const [trangThai, setTrangThai] = useState("Tất cả");
  const [loaiDoiTuong, setLoaiDoiTuong] = useState("Tất cả");

  // Selected student and click type for the detailed list
  const [selectedStudent, setSelectedStudent] = useState<ThongKeOverview | null>(null);
  const [detailType, setDetailType] = useState<"Vào" | "Ra" | "Tất cả" | null>(null);

  // Helper to get local date-time string formatted for datetime-local input
  const getLocalDatetimeString = () => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  // Add modal states
  const [modalOpened, setModalOpened] = useState(false);
  const [formMssv, setFormMssv] = useState("");
  const [formHoTen, setFormHoTen] = useState("");
  const [formKhuKtx, setFormKhuKtx] = useState("");
  const [formPhong, setFormPhong] = useState("");
  const [formLoai, setFormLoai] = useState("Vào"); // "Vào" | "Ra"
  const [formThoiGian, setFormThoiGian] = useState(getLocalDatetimeString());
  const [formGhiChu, setFormGhiChu] = useState("");

  const handleMssvChange = (value: string) => {
    setFormMssv(value);
    const existing = overviewList.find(s => s.studentId.toLowerCase() === value.toLowerCase().trim());
    if (existing) {
      setFormHoTen(existing.hoTen);
      const details = detailsMap[existing.studentId] || [];
      if (details.length > 0) {
        setFormKhuKtx(details[0].ktx);
        setFormPhong(details[0].room);
      }
    }
  };

  const handleFormSubmit = () => {
    if (!formMssv || !formKhuKtx || !formPhong || !formLoai || !formThoiGian) {
      alert("Vui lòng nhập đầy đủ các trường bắt buộc (*)");
      return;
    }

    const parsedDate = new Date(formThoiGian);
    const day = String(parsedDate.getDate()).padStart(2, "0");
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const year = parsedDate.getFullYear();
    const hours = String(parsedDate.getHours()).padStart(2, "0");
    const minutes = String(parsedDate.getMinutes()).padStart(2, "0");
    const formattedTime = `${day}/${month}/${year} ${hours}:${minutes}`;

    const newDetail: Omit<ThongKeDetail, "stt"> = {
      time: formattedTime,
      type: formLoai as "Vào" | "Ra",
      ktx: formKhuKtx,
      room: formPhong,
      status: "Hợp lệ"
    };

    const updatedDetailsMap = { ...detailsMap };
    if (!updatedDetailsMap[formMssv]) {
      updatedDetailsMap[formMssv] = [];
    }
    updatedDetailsMap[formMssv] = [newDetail, ...updatedDetailsMap[formMssv]];
    setDetailsMap(updatedDetailsMap);

    const existingOverviewIndex = overviewList.findIndex(
      (s) => s.studentId.toLowerCase() === formMssv.toLowerCase().trim()
    );

    if (existingOverviewIndex > -1) {
      const updatedOverviewList = [...overviewList];
      const student = updatedOverviewList[existingOverviewIndex];
      const isVao = formLoai === "Vào";
      const isRa = formLoai === "Ra";

      updatedOverviewList[existingOverviewIndex] = {
        ...student,
        luotVao: student.luotVao + (isVao ? 1 : 0),
        luotRa: student.luotRa + (isRa ? 1 : 0),
        tongLuot: student.tongLuot + 1
      };
      setOverviewList(updatedOverviewList);
    } else {
      const newOverview: ThongKeOverview = {
        stt: overviewList.length + 1,
        studentId: formMssv.toUpperCase().trim(),
        hoTen: formHoTen || "Chưa rõ họ tên",
        maNhom: "Sinh viên khóa 48",
        luotVao: formLoai === "Vào" ? 1 : 0,
        luotRa: formLoai === "Ra" ? 1 : 0,
        tongLuot: 1,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formMssv}`
      };
      setOverviewList([...overviewList, newOverview]);
    }

    setFormMssv("");
    setFormHoTen("");
    setFormKhuKtx("");
    setFormPhong("");
    setFormLoai("Vào");
    setFormThoiGian(getLocalDatetimeString());
    setFormGhiChu("");

    setModalOpened(false);
  };

  // Handle clicking on statistics columns
  const handleStatClick = (student: ThongKeOverview, type: "Vào" | "Ra" | "Tất cả") => {
    setSelectedStudent(student);
    setDetailType(type);
  };

  // === Fetch nguoi-la from API ===
  const loadNguoiLa = useCallback(async (page: number) => {
    setNguoiLaLoading(true);
    setNguoiLaError(null);
    try {
      // Format date MM/dd/yyyy for API; use defaults if empty
      const formatDate = (dateStr: string, isStart: boolean): string => {
        if (dateStr) {
          const d = new Date(dateStr);
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          const yyyy = d.getFullYear();
          return `${mm}/${dd}/${yyyy}`;
        }
        // Default: current month range
        const now = new Date();
        if (isStart) {
          return `${String(now.getMonth() + 1).padStart(2, "0")}/01/${now.getFullYear()}`;
        } else {
          const mm = String(now.getMonth() + 1).padStart(2, "0");
          const dd = String(now.getDate()).padStart(2, "0");
          return `${mm}/${dd}/${now.getFullYear()}`;
        }
      };

      const maKhu = khuKtx === "Tất cả" ? "-1" : khuKtx;

      const res = await fetchNguoiLaPaginate({
        page: String(page),
        pageSize: String(nguoiLaPageSize),
        tuNgay: formatDate(tuNgay, true),
        denNgay: formatDate(denNgay, false),
        maKhu,
      });

      const payload = res?.payload;
      const items = payload?.items ?? payload?.content ?? [];
      setNguoiLaList(items);
      setNguoiLaTotalPages(payload?.totalPages ?? 1);
      // API thực tế trả về numberOfElements thay vì totalElements
      setNguoiLaTotalElements(payload?.numberOfElements ?? payload?.totalElements ?? items.length);
    } catch (err: any) {
      setNguoiLaError(err?.message ?? "Lỗi khi tải dữ liệu người lạ");
      setNguoiLaList([]);
    } finally {
      setNguoiLaLoading(false);
    }
  }, [khuKtx, tuNgay, denNgay, nguoiLaPageSize]);

  useEffect(() => {
    if (type === "nguoi-la") {
      loadNguoiLa(nguoiLaPage);
    }
  }, [type, nguoiLaPage, loadNguoiLa]);

  // Clear search filters
  const handleReset = () => {
    setHoTen("");
    setMssv("");
    setTuNgay("");
    setDenNgay("");
    setKhuKtx("Tất cả");
    setTrangThai("Tất cả");
    setLoaiDoiTuong("Tất cả");
    setSelectedStudent(null);
    setDetailType(null);
    setNguoiLaPage(1);
  };

  // Get filtered overview data based on search inputs
  const filteredOverview = overviewList.filter((item) => {
    const matchName = item.hoTen.toLowerCase().includes(hoTen.toLowerCase());
    const matchMssv = item.studentId.toLowerCase().includes(mssv.toLowerCase());
    const matchGroup =
      loaiDoiTuong === "Tất cả" ||
      (loaiDoiTuong === "Sinh viên" && item.maNhom.includes("Sinh viên")) ||
      (loaiDoiTuong === "Cán bộ" && item.maNhom.includes("Cán bộ"));
    return matchName && matchMssv && matchGroup;
  });

  // Get selected details data
  const rawDetails = selectedStudent ? detailsMap[selectedStudent.studentId] || [] : [];
  const filteredDetails = rawDetails
    .filter((detail) => {
      if (detailType === "Vào" && detail.type !== "Vào") return false;
      if (detailType === "Ra" && detail.type !== "Ra") return false;

      // Filter by status if selected
      if (trangThai !== "Tất cả" && detail.status !== trangThai) return false;

      // Filter by zone if selected
      if (khuKtx !== "Tất cả" && detail.ktx !== khuKtx) return false;

      return true;
    })
    .map((detail, index) => ({
      ...detail,
      stt: index + 1,
    }));

  const filteredAbsent = absentList.filter((item) => {
    const matchName = item.hoTen.toLowerCase().includes(hoTen.toLowerCase());
    const matchMssv = item.studentId.toLowerCase().includes(mssv.toLowerCase());
    const matchKhu = khuKtx === "Tất cả" || item.ktx === khuKtx;
    const matchTrangThai = trangThai === "Tất cả" || item.status === trangThai;
    return matchName && matchMssv && matchKhu && matchTrangThai;
  });

  const filteredBanned = bannedList.filter((item) => {
    const matchName = item.hoTen.toLowerCase().includes(hoTen.toLowerCase());
    const matchMssv = item.studentId.toLowerCase().includes(mssv.toLowerCase());
    const matchTrangThai = trangThai === "Tất cả" || item.status === trangThai;
    return matchName && matchMssv && matchTrangThai;
  });

  // Handle search for nguoi-la (trigger API call from page 1)
  const handleNguoiLaSearch = () => {
    setNguoiLaPage(1);
    loadNguoiLa(1);
  };

  return (
    <Stack gap="xl" p="sm" style={{ backgroundColor: "#fafbfd", minHeight: "100vh" }}>
      {/* Page Title */}
      <Group gap="md">
        <ThemeIcon size={38} variant="light" color="blue">
          <IconReportAnalytics size={20} />
        </ThemeIcon>
        <Title order={2} fw={800} c="#0f172a" style={{ letterSpacing: "-0.5px" }}>
          {type === "luot-ra-vao"
            ? "THỐNG KÊ LƯỢT RA VÀO"
            : type === "vang-mat"
              ? "THỐNG KÊ SINH VIÊN VẮNG MẶT LÂU NGÀY"
              : type === "nguoi-la"
                ? "THỐNG KÊ NGƯỜI LẠ XUẤT HIỆN"
                : "THỐNG KÊ SINH VIÊN BỊ CẤM / CẢNH BÁO XÂM NHẬP"}
        </Title>
      </Group>

      {/* Expandable Search Filter Card (Image 2 design) */}
      <Card withBorder radius="lg" p="lg" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}>
        <Stack gap="md">
          {/* Row 1: Always Visible */}
          <Grid align="flex-end" gutter="md">
            <Grid.Col span={{ base: 12, md: 3 }}>
              <TextInput
                label="HỌ TÊN"
                placeholder="Nhập họ tên..."
                value={hoTen}
                onChange={(e) => setHoTen(e.currentTarget.value)}
                styles={{ label: { fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "6px" } }}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 3 }}>
              <TextInput
                label="MSSV"
                placeholder="Nhập MSSV..."
                value={mssv}
                onChange={(e) => setMssv(e.currentTarget.value)}
                styles={{ label: { fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "6px" } }}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Group gap="xs" justify="flex-end">
                <Button
                  leftSection={<IconSearch size={16} />}
                  color="blue"
                  style={{ backgroundColor: "#1A52C5" }}
                  onClick={type === "nguoi-la" ? handleNguoiLaSearch : () => { }}
                  loading={type === "nguoi-la" && nguoiLaLoading}
                >
                  Tìm kiếm
                </Button>
                <Button
                  leftSection={<IconRefresh size={16} />}
                  variant="outline"
                  color="gray"
                  onClick={handleReset}
                >
                  Làm mới
                </Button>
                <Button
                  leftSection={<IconDownload size={16} />}
                  variant="outline"
                  color="green"
                  style={{ borderColor: "#22c55e", color: "#16a34a" }}
                >
                  Xuất Excel
                </Button>
                <Button
                  leftSection={<IconDownload size={16} />}
                  variant="outline"
                  color="red"
                  style={{ borderColor: "#ef4444", color: "#dc2626" }}
                >
                  Xuất PDF
                </Button>
                <Button
                  leftSection={<IconPlus size={16} />}
                  style={{ background: "linear-gradient(135deg, #0284c7, #0369a1)" }}
                  onClick={() => setModalOpened(true)}
                >
                  Thêm dữ liệu
                </Button>
                <ActionIcon
                  variant="light"
                  color="blue"
                  size="lg"
                  onClick={() => setOpened((o) => !o)}
                >
                  {opened ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
                </ActionIcon>
              </Group>
            </Grid.Col>
          </Grid>

          {/* Row 2: Collapsible filters */}
          <Collapse in={opened}>
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
                <TextInput
                  label="TỪ NGÀY"
                  placeholder="mm/dd/yyyy"
                  value={tuNgay}
                  onChange={(e) => setTuNgay(e.currentTarget.value)}
                  styles={{ label: { fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "6px" } }}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
                <TextInput
                  label="ĐẾN NGÀY"
                  placeholder="mm/dd/yyyy"
                  value={denNgay}
                  onChange={(e) => setDenNgay(e.currentTarget.value)}
                  styles={{ label: { fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "6px" } }}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 4, md: 2.4 }}>
                <Select
                  label="KHU KTX"
                  value={khuKtx}
                  onChange={(val) => setKhuKtx(val || "Tất cả")}
                  data={["Tất cả", "Khu A", "Khu B"]}
                  styles={{ label: { fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "6px" } }}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 4, md: 2.4 }}>
                <Select
                  label="TRẠNG THÁI"
                  value={trangThai}
                  onChange={(val) => setTrangThai(val || "Tất cả")}
                  data={["Tất cả", "Hợp lệ", "Nghi vấn", "Không hợp lệ"]}
                  styles={{ label: { fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "6px" } }}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 4, md: 2.4 }}>
                <Select
                  label="LOẠI ĐỐI TƯỢNG"
                  value={loaiDoiTuong}
                  onChange={(val) => setLoaiDoiTuong(val || "Tất cả")}
                  data={["Tất cả", "Sinh viên", "Cán bộ"]}
                  styles={{ label: { fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "6px" } }}
                />
              </Grid.Col>
            </Grid>
          </Collapse>
        </Stack>
      </Card>

      {/* Charts Section */}
      {type === "luot-ra-vao" && (
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card withBorder radius="lg" p="lg" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}>
              <Text fw={700} size="sm" c="dimmed" mb="md" style={{ letterSpacing: "0.5px" }}>
                THỐNG KÊ LƯỢT VÀO/RA THEO THỜI GIAN
              </Text>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: "Thứ 2", "Lượt vào": 120, "Lượt ra": 115 },
                      { name: "Thứ 3", "Lượt vào": 140, "Lượt ra": 138 },
                      { name: "Thứ 4", "Lượt vào": 150, "Lượt ra": 145 },
                      { name: "Thứ 5", "Lượt vào": 130, "Lượt ra": 128 },
                      { name: "Thứ 6", "Lượt vào": 160, "Lượt ra": 155 },
                      { name: "Thứ 7", "Lượt vào": 90, "Lượt ra": 110 },
                      { name: "Chủ nhật", "Lượt vào": 80, "Lượt ra": 85 }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Lượt vào" fill="#228be6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Lượt ra" fill="#fd7e14" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder radius="lg" p="lg" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}>
              <Text fw={700} size="sm" c="dimmed" mb="md" style={{ letterSpacing: "0.5px" }}>
                THỐNG KÊ THEO KHU KÝ TÚC XÁ
              </Text>
              <div style={{ height: 300, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <ResponsiveContainer width="100%" height="70%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Khu A", value: 65 },
                        { name: "Khu B", value: 35 }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#228be6" />
                      <Cell fill="#40c057" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <Group gap="xl" mt="md">
                  <Group gap="xs">
                    <Box style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#228be6" }} />
                    <Text size="xs" fw={500}>Khu A (65%)</Text>
                  </Group>
                  <Group gap="xs">
                    <Box style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#40c057" }} />
                    <Text size="xs" fw={500}>Khu B (35%)</Text>
                  </Group>
                </Group>
              </div>
            </Card>
          </Grid.Col>
        </Grid>
      )}

      {type === "vang-mat" && (
        <Grid gutter="md">
          <Grid.Col span={12}>
            <Card withBorder radius="lg" p="lg" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}>
              <Text fw={700} size="sm" c="dimmed" mb="md" style={{ letterSpacing: "0.5px" }}>
                THỐNG KÊ SINH VIÊN VẮNG MẶT THEO SỐ NGÀY
              </Text>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_ABSENT_CHART}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#fa5252" radius={[4, 4, 0, 0]} label={{ position: 'top' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Grid.Col>
        </Grid>
      )}

      {type === "nguoi-la" && (
        <Grid gutter="md">
          <Grid.Col span={12}>
            <Card withBorder radius="lg" p="lg" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}>
              <Text fw={700} size="sm" c="dimmed" mb="md" style={{ letterSpacing: "0.5px" }}>
                TẦN SUẤT PHÁT HIỆN NGƯỜI LẠ (7 NGÀY QUA)
              </Text>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_STRANGER_CHART}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis />
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
      )}

      {type === "bi-cam" && (
        <Grid gutter="md">
          <Grid.Col span={12}>
            <Card withBorder radius="lg" p="lg" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}>
              <Text fw={700} size="sm" c="dimmed" mb="md" style={{ letterSpacing: "0.5px" }}>
                PHÂN BỔ SỐ LƯỢT XÂM NHẬP TRÁI PHÉP BỊ CẢNH BÁO
              </Text>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_BANNED_CHART}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#e03131" radius={[4, 4, 0, 0]} label={{ position: 'top' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Grid.Col>
        </Grid>
      )}

      {/* Table 1: Overview Statistics (Only for In/Out stats) */}
      {type === "luot-ra-vao" && (
        <>
          <Card withBorder radius="lg" p="lg" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}>
            <Group justify="space-between" mb="md">
              <Text fw={800} size="md" c="#1e293b" style={{ letterSpacing: "0.25px" }}>
                BẢNG THỐNG KÊ SINH VIÊN RA VÀO (TOP 5 VÀ CHI TIẾT)
              </Text>
            </Group>

            <ScrollArea>
              <Table verticalSpacing="sm" highlightOnHover style={{ minWidth: 800 }}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>STT</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>MSSV</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>Họ tên</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>Mã nhóm</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>Ảnh đại diện</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px", textAlign: "center" }}>Lượt vào</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px", textAlign: "center" }}>Lượt ra</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px", textAlign: "center" }}>Tổng lượt</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredOverview.map((row) => {
                    const isSelected = selectedStudent?.studentId === row.studentId;
                    return (
                      <Table.Tr
                        key={row.studentId}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          backgroundColor: isSelected ? "#f0f7ff" : "transparent",
                        }}
                      >
                        <Table.Td style={{ fontSize: "13px", color: "#64748b" }}>{row.stt}</Table.Td>
                        <Table.Td style={{ fontSize: "13px", color: "#64748b", fontFamily: "monospace" }}>
                          {row.studentId}
                        </Table.Td>
                        <Table.Td style={{ fontSize: "13px", color: "#1e293b", fontWeight: 600 }}>
                          {row.hoTen}
                        </Table.Td>
                        <Table.Td style={{ fontSize: "13px", color: "#475569" }}>{row.maNhom}</Table.Td>
                        <Table.Td>
                          <Avatar src={row.avatarUrl} radius="xl" size="sm" alt={row.hoTen} />
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          <Anchor
                            component="button"
                            fw={700}
                            c="#1A52C5"
                            onClick={() => handleStatClick(row, "Vào")}
                            style={{
                              fontSize: "13px",
                              textDecoration: isSelected && detailType === "Vào" ? "underline" : "none",
                            }}
                          >
                            {row.luotVao}
                          </Anchor>
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          <Anchor
                            component="button"
                            fw={700}
                            c="#1A52C5"
                            onClick={() => handleStatClick(row, "Ra")}
                            style={{
                              fontSize: "13px",
                              textDecoration: isSelected && detailType === "Ra" ? "underline" : "none",
                            }}
                          >
                            {row.luotRa}
                          </Anchor>
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          <Anchor
                            component="button"
                            fw={700}
                            c="#16a34a"
                            onClick={() => handleStatClick(row, "Tất cả")}
                            style={{
                              fontSize: "13px",
                              textDecoration: isSelected && detailType === "Tất cả" ? "underline" : "none",
                            }}
                          >
                            {row.tongLuot}
                          </Anchor>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                  {filteredOverview.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={8}>
                        <Text ta="center" c="dimmed" py="xl">
                          Không tìm thấy kết quả phù hợp
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Card>

          {/* Table 2: Detailed Statistics List */}
          <Card withBorder radius="lg" p="lg" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}>
            {selectedStudent && detailType ? (
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={800} size="md" c="#1e293b" style={{ letterSpacing: "0.25px" }}>
                    CHI TIẾT LƯỢT {detailType.toUpperCase()} - {selectedStudent.hoTen.toUpperCase()} ({selectedStudent.studentId})
                  </Text>
                  <Badge color={detailType === "Vào" ? "blue" : detailType === "Ra" ? "orange" : "green"} size="lg">
                    {detailType === "Tất cả" ? "Tất cả lượt ra/vào" : `Lượt ${detailType.toLowerCase()}`}
                  </Badge>
                </Group>

                <ScrollArea>
                  <Table verticalSpacing="sm" highlightOnHover style={{ minWidth: 800 }}>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>STT</Table.Th>
                        <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>Thời gian</Table.Th>
                        <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px", textAlign: "center" }}>Loại</Table.Th>
                        <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>Khu KTX</Table.Th>
                        <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>Phòng</Table.Th>
                        <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px", textAlign: "center" }}>Trạng thái</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {filteredDetails.map((detail) => (
                        <Table.Tr key={detail.stt} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <Table.Td style={{ fontSize: "13px", color: "#64748b" }}>{detail.stt}</Table.Td>
                          <Table.Td style={{ fontSize: "13px", color: "#1e293b", fontWeight: 500 }}>
                            {detail.time}
                          </Table.Td>
                          <Table.Td style={{ textAlign: "center" }}>
                            <Badge color={detail.type === "Vào" ? "blue" : "orange"} size="sm" radius="md">
                              {detail.type}
                            </Badge>
                          </Table.Td>
                          <Table.Td style={{ fontSize: "13px", color: "#475569" }}>{detail.ktx}</Table.Td>
                          <Table.Td style={{ fontSize: "13px", color: "#475569" }}>{detail.room}</Table.Td>
                          <Table.Td style={{ textAlign: "center" }}>
                            <Badge
                              color={
                                detail.status === "Hợp lệ"
                                  ? "green"
                                  : detail.status === "Nghi vấn"
                                    ? "yellow"
                                    : "red"
                              }
                              variant="light"
                              size="sm"
                            >
                              {detail.status}
                            </Badge>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                      {filteredDetails.length === 0 && (
                        <Table.Tr>
                          <Table.Td colSpan={6}>
                            <Text ta="center" c="dimmed" py="xl">
                              Không có dữ liệu chi tiết
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      )}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </Stack>
            ) : (
              <Box py="xl">
                <Text ta="center" c="dimmed" style={{ fontStyle: "italic" }}>
                  Chọn một số lượt thống kê (Lượt vào, Lượt ra, hoặc Tổng lượt) của một sinh viên ở bảng trên để hiển thị chi tiết lịch sử ra vào.
                </Text>
              </Box>
            )}
          </Card>
        </>
      )}

      {/* Table: Absent Students Statistics */}
      {type === "vang-mat" && (
        <Card withBorder radius="lg" p="lg" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}>
          <Group justify="space-between" mb="md">
            <Text fw={800} size="md" c="#1e293b" style={{ letterSpacing: "0.25px" }}>
              BẢNG THỐNG KÊ SINH VIÊN VẮNG MẶT LÂU NGÀY
            </Text>
          </Group>

          <ScrollArea>
            <Table verticalSpacing="sm" highlightOnHover style={{ minWidth: 800 }}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>STT</Table.Th>
                  <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>MSSV</Table.Th>
                  <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>Họ tên</Table.Th>
                  <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>Khu KTX</Table.Th>
                  <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>Phòng</Table.Th>
                  <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px", textAlign: "center" }}>Số ngày vắng</Table.Th>
                  <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>Lần quét cuối cùng</Table.Th>
                  <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px", textAlign: "center" }}>Trạng thái</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredAbsent.map((row) => (
                  <Table.Tr key={row.studentId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <Table.Td style={{ fontSize: "13px", color: "#64748b" }}>{row.stt}</Table.Td>
                    <Table.Td style={{ fontSize: "13px", color: "#64748b", fontFamily: "monospace" }}>{row.studentId}</Table.Td>
                    <Table.Td style={{ fontSize: "13px", color: "#1e293b", fontWeight: 600 }}>{row.hoTen}</Table.Td>
                    <Table.Td style={{ fontSize: "13px", color: "#475569" }}>{row.ktx}</Table.Td>
                    <Table.Td style={{ fontSize: "13px", color: "#475569" }}>{row.room}</Table.Td>
                    <Table.Td style={{ fontSize: "13px", color: "#e03131", fontWeight: 700, textAlign: "center" }}>{row.absentDays} ngày</Table.Td>
                    <Table.Td style={{ fontSize: "13px", color: "#475569" }}>{row.lastScan}</Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      <Badge color={row.status === "Cảnh báo" ? "red" : row.status === "Nghi vấn" ? "yellow" : "green"} variant="light" size="sm">
                        {row.status}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
                {filteredAbsent.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={8}>
                      <Text ta="center" c="dimmed" py="xl">
                        Không tìm thấy sinh viên vắng mặt lâu ngày phù hợp
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Card>
      )}

      {/* Table: Stranger Detection Statistics - API driven */}
      {type === "nguoi-la" && (
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
              <Badge color="red" variant="light" size="sm">{nguoiLaError}</Badge>
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
                      const thoiGian = row.detectTime ?? row.thoiGian ?? "--";
                      const khu = row.tenKhu ?? row.maKhu ?? "--";
                      const viTri = row.viTri ?? row.cong ?? "--";
                      const imgSrc = row.image ?? row.imageUrl ?? "";
                      const tt = row.trangThai ?? "";
                      return (
                        <Table.Tr key={row.id ?? index} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <Table.Td style={{ fontSize: "13px", color: "#64748b" }}>{stt}</Table.Td>
                          <Table.Td style={{ fontSize: "13px", color: "#1e293b", fontWeight: 500 }}>{thoiGian}</Table.Td>
                          <Table.Td style={{ fontSize: "13px", color: "#475569" }}>{khu}</Table.Td>
                          <Table.Td style={{ fontSize: "13px", color: "#475569" }}>{viTri}</Table.Td>
                          <Table.Td style={{ textAlign: "center" }}>
                            {imgSrc ? (
                              <Avatar src={imgSrc} radius="md" size="md" alt="Stranger" style={{ margin: "auto" }} />
                            ) : (
                              <Text size="xs" c="dimmed">Không có ảnh</Text>
                            )}
                          </Table.Td>
                          <Table.Td style={{ textAlign: "center" }}>
                            <Badge
                              color={
                                tt === "Cảnh báo" || tt === "WARNING" ? "red"
                                  : tt === "Hợp lệ" || tt === "OK" ? "green"
                                    : "blue"
                              }
                              variant="light"
                              size="sm"
                            >
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

              {/* Pagination */}
              {nguoiLaTotalPages > 1 && (
                <Center mt="md">
                  <Pagination
                    total={nguoiLaTotalPages}
                    value={nguoiLaPage}
                    onChange={(p) => setNguoiLaPage(p)}
                    size="sm"
                    color="blue"
                  />
                </Center>
              )}
            </>
          )}
        </Card>
      )}

      {/* Table: Banned Students Violations */}
      {type === "bi-cam" && (
        <Card withBorder radius="lg" p="lg" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}>
          <Group justify="space-between" mb="md">
            <Text fw={800} size="md" c="#1e293b" style={{ letterSpacing: "0.25px" }}>
              BẢNG THỐNG KÊ SINH VIÊN BỊ CẤM / CẢNH BÁO XÂM NHẬP
            </Text>
          </Group>

          <ScrollArea>
            <Table verticalSpacing="sm" highlightOnHover style={{ minWidth: 800 }}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>STT</Table.Th>
                  <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>MSSV</Table.Th>
                  <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>Họ tên</Table.Th>
                  <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>Phòng</Table.Th>
                  <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>Lý do cấm</Table.Th>
                  <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px", textAlign: "center" }}>Số lần vi phạm</Table.Th>
                  <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px", textAlign: "center" }}>Trạng thái thẻ</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredBanned.map((row) => (
                  <Table.Tr key={row.studentId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <Table.Td style={{ fontSize: "13px", color: "#64748b" }}>{row.stt}</Table.Td>
                    <Table.Td style={{ fontSize: "13px", color: "#64748b", fontFamily: "monospace" }}>{row.studentId}</Table.Td>
                    <Table.Td style={{ fontSize: "13px", color: "#1e293b", fontWeight: 600 }}>{row.hoTen}</Table.Td>
                    <Table.Td style={{ fontSize: "13px", color: "#475569" }}>{row.room}</Table.Td>
                    <Table.Td style={{ fontSize: "13px", color: "#fa5252", fontWeight: 500 }}>{row.reason}</Table.Td>
                    <Table.Td style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", textAlign: "center" }}>{row.violationCount} lần</Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      <Badge color={row.status === "Khóa thẻ" ? "red" : row.status === "Chờ xử lý" ? "yellow" : "orange"} variant="light" size="sm">
                        {row.status}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
                {filteredBanned.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={7}>
                      <Text ta="center" c="dimmed" py="xl">
                        Không tìm thấy vi phạm của sinh viên bị cấm phù hợp
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Card>
      )}

      {/* Modal: THÊM DỮ LIỆU VÀO/RA */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={
          <Text fw={800} size="lg" c="#1A52C5" style={{ textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Thêm dữ liệu vào/ra
          </Text>
        }
        centered
        radius="lg"
        size="md"
        padding="xl"
        styles={{
          header: { borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" },
        }}
      >
        <Stack gap="md" mt="sm">
          <TextInput
            label="MSSV"
            placeholder="Nhập MSSV"
            required
            value={formMssv}
            onChange={(e) => handleMssvChange(e.currentTarget.value)}
            styles={{
              label: { fontWeight: 700, fontSize: "14px", color: "#1e293b", marginBottom: "4px" },
              input: { borderRadius: "8px" },
            }}
          />

          <TextInput
            label="Họ tên"
            placeholder="Nhập họ tên"
            value={formHoTen}
            onChange={(e) => setFormHoTen(e.currentTarget.value)}
            styles={{
              label: { fontWeight: 700, fontSize: "14px", color: "#1e293b", marginBottom: "4px" },
              input: { borderRadius: "8px" },
            }}
          />

          <Select
            label="Khu KTX"
            placeholder="--Chọn khu KTX--"
            required
            value={formKhuKtx}
            onChange={(val) => setFormKhuKtx(val || "")}
            data={["Khu A", "Khu B"]}
            styles={{
              label: { fontWeight: 700, fontSize: "14px", color: "#1e293b", marginBottom: "4px" },
              input: { borderRadius: "8px" },
            }}
          />

          <Select
            label="Phòng"
            placeholder="--Chọn khu KTX--"
            required
            value={formPhong}
            onChange={(val) => setFormPhong(val || "")}
            data={
              formKhuKtx === "Khu A"
                ? ["A101", "A302", "A408"]
                : formKhuKtx === "Khu B"
                  ? ["B104", "B205"]
                  : ["A101", "A302", "A408", "B104", "B205"]
            }
            styles={{
              label: { fontWeight: 700, fontSize: "14px", color: "#1e293b", marginBottom: "4px" },
              input: { borderRadius: "8px" },
            }}
          />

          <Radio.Group
            label="Loại"
            required
            value={formLoai}
            onChange={setFormLoai}
            styles={{
              label: { fontWeight: 700, fontSize: "14px", color: "#1e293b", marginBottom: "8px" },
            }}
          >
            <Group gap="xl">
              <Radio value="Vào" label="Vào" color="green" styles={{ label: { fontWeight: 500 } }} />
              <Radio value="Ra" label="Ra" color="green" styles={{ label: { fontWeight: 500 } }} />
            </Group>
          </Radio.Group>

          <TextInput
            label="Thời gian"
            type="datetime-local"
            required
            value={formThoiGian}
            onChange={(e) => setFormThoiGian(e.currentTarget.value)}
            styles={{
              label: { fontWeight: 700, fontSize: "14px", color: "#1e293b", marginBottom: "4px" },
              input: { borderRadius: "8px" },
            }}
          />

          <Textarea
            label="Ghi chú"
            placeholder="Nhập ghi chú (nếu có)"
            value={formGhiChu}
            onChange={(e) => setFormGhiChu(e.currentTarget.value)}
            rows={3}
            styles={{
              label: { fontWeight: 700, fontSize: "14px", color: "#1e293b", marginBottom: "4px" },
              input: { borderRadius: "8px" },
            }}
          />

          <Group justify="center" mt="xl" gap="md">
            <Button
              variant="outline"
              color="gray"
              onClick={() => setModalOpened(false)}
              style={{ width: 140, borderRadius: "8px", fontWeight: 600 }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleFormSubmit}
              style={{ width: 140, borderRadius: "8px", backgroundColor: "#007fff", fontWeight: 600 }}
            >
              Ghi nhận
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
