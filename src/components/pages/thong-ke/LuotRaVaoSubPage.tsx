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
  Anchor,
  ScrollArea,
  Stack,
  Title,
  Grid,
  TextInput,
  Select,
  Button,
  Box,
  ThemeIcon,
  Modal,
  Radio,
  Textarea,
  Loader,
  Center,
  Pagination,
} from "@mantine/core";
import {
  IconSearch,
  IconRefresh,
  IconDownload,
  IconPlus,
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { fetchThongKeRaVao } from "@/services/dashboard/thongkeService";

export interface ThongKeOverview {
  stt: number;
  studentId: string;
  hoTen: string;
  maNhom: string;
  luotVao: number;
  luotRa: number;
  tongLuot: number;
  avatarUrl: string;
  khu: string;
  phong: string;
  trangThai: string;
}

function SafeAvatar({ src, fallback, alt, radius, size }: { src: string; fallback: string; alt?: string; radius?: any; size?: any }) {
  const [imgSrc, setImgSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setFailed(false);
  }, [src]);

  return (
    <Avatar
      src={failed ? fallback : imgSrc}
      radius={radius}
      size={size}
      alt={alt}
      onError={() => {
        if (!failed) {
          setFailed(true);
        }
      }}
    />
  );
}

const resolveKhu = (item: any): string => {
  if (!item) return "Khu A";
  let rawKhu = item.tenKhu || item.maKhu || item.danhSachVao?.[0]?.tenKhu || item.danhSachRa?.[0]?.tenKhu || "";
  
  if (rawKhu === "A" || rawKhu === "B") {
    rawKhu = `Khu ${rawKhu}`;
  }
  
  const phong = item.maPhong || item.tenPhong || item.danhSachVao?.[0]?.maPhong || item.danhSachRa?.[0]?.maPhong || "";
  if (!rawKhu && phong) {
    const firstChar = String(phong).charAt(0).toUpperCase();
    if (["A", "B", "C", "D"].includes(firstChar)) {
      rawKhu = `Khu ${firstChar}`;
    }
  }
  
  return rawKhu || "Khu A";
};

export default function LuotRaVaoSubPage() {
  const [hoTen, setHoTen] = useState("");
  const [mssv, setMssv] = useState("");
  const [tuNgay, setTuNgay] = useState<Date | null>(null);
  const [denNgay, setDenNgay] = useState<Date | null>(null);
  const [khuKtx, setKhuKtx] = useState("Tất cả");
  const [trangThai, setTrangThai] = useState("Tất cả");
  const [loaiDoiTuong, setLoaiDoiTuong] = useState("Tất cả");
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

  const [overviewList, setOverviewList] = useState<ThongKeOverview[]>([]);
  const [globalHistoryList, setGlobalHistoryList] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedStudent, setSelectedStudent] = useState<ThongKeOverview | null>(null);
  const [detailType, setDetailType] = useState<"Vào" | "Ra" | "Tất cả" | null>(null);

  // Pagination states
  const [overviewPage, setOverviewPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const pageSize = 10;

  const [modalOpened, setModalOpened] = useState(false);
  const [formMssv, setFormMssv] = useState("");
  const [formHoTen, setFormHoTen] = useState("");
  const [formKhuKtx, setFormKhuKtx] = useState("");
  const [formPhong, setFormPhong] = useState("");
  const [formLoai, setFormLoai] = useState("Vào");
  const [formThoiGian, setFormThoiGian] = useState(() => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
  });
  const [formGhiChu, setFormGhiChu] = useState("");

  const loadThongKeData = useCallback(async (overrides?: { tuNgay?: Date | null; denNgay?: Date | null }) => {
    setLoading(true);
    setError(null);
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
        // Default: today's date for both start and end
        const now = new Date();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const yyyy = now.getFullYear();
        return `${mm}/${dd}/${yyyy}`;
      };

      const tuNgayFormatted = formatDate(activeTu, true);
      const denNgayFormatted = formatDate(activeDen, false);

      const res = await fetchThongKeRaVao({
        tuNgay: tuNgayFormatted,
        denNgay: denNgayFormatted,
      });

      const list = res?.payload || [];
      console.log("[LuotRaVao] fetchThongKeRaVao payload sample:", list[0]);

      const resolveImageUrl = (url: string): string => {
        return url || "";
      };

      // 1. Map overview list
      const mappedOverview: ThongKeOverview[] = list.map((item: any, index: number) => {
        const studentId = item.maSo || item.maSinhVien || `no-id-${index}`;
        const hasVaoScans = Array.isArray(item.danhSachVao) && item.danhSachVao.length > 0;
        const hasRaScans = Array.isArray(item.danhSachRa) && item.danhSachRa.length > 0;

        let pathImage = "";
        if (hasVaoScans) pathImage = item.danhSachVao[0].pathimage || "";
        else if (hasRaScans) pathImage = item.danhSachRa[0].pathimage || "";

        const avatarUrl = pathImage
          ? resolveImageUrl(pathImage)
          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(studentId)}`;

        const khu = resolveKhu(item);
        const phong = item.maPhong || item.tenPhong || item.danhSachVao?.[0]?.maPhong || item.danhSachRa?.[0]?.maPhong || "--";
        const trangThai = item.trangThai || item.status || "Hợp lệ";

        return {
          stt: index + 1,
          studentId,
          hoTen: item.hoTen || "Chưa rõ",
          maNhom: item.maNhom || "Thành viên",
          avatarUrl,
          luotVao: item.luotVao || 0,
          luotRa: item.luotRa || 0,
          tongLuot: item.tongLuot || 0,
          khu,
          phong,
          trangThai,
        };
      });

      setOverviewList(mappedOverview);

      // Helper to format scan date and time safely
      const formatDisplayTime = (scan: any): string => {
        if (scan.timecheck) {
          const num = Number(scan.timecheck);
          if (!isNaN(num) && num > 0) {
            const ms = num < 10000000000 ? num * 1000 : num;
            const d = new Date(ms);
            if (!isNaN(d.getTime())) {
              const dd = String(d.getDate()).padStart(2, "0");
              const mm = String(d.getMonth() + 1).padStart(2, "0");
              const yyyy = d.getFullYear();
              const hh = String(d.getHours()).padStart(2, "0");
              const min = String(d.getMinutes()).padStart(2, "0");
              const ss = String(d.getSeconds()).padStart(2, "0");
              return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
            }
          }
        }
        
        const rawTime = scan.thoiGian || scan.time;
        if (rawTime) {
          const d = new Date(rawTime);
          if (!isNaN(d.getTime())) {
            const dd = String(d.getDate()).padStart(2, "0");
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const yyyy = d.getFullYear();
            if (String(rawTime).includes(":") || String(rawTime).includes("T")) {
              const hh = String(d.getHours()).padStart(2, "0");
              const min = String(d.getMinutes()).padStart(2, "0");
              const ss = String(d.getSeconds()).padStart(2, "0");
              return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
            }
            return `${dd}/${mm}/${yyyy}`;
          }
          return String(rawTime);
        }
        
        return "Chưa cập nhật";
      };

      // 2. Map global check-in/out history list
      const allScans: any[] = [];
      list.forEach((studentItem: any) => {
        const studentId = studentItem.maSo || studentItem.maSinhVien || "N/A";
        const hoTen = studentItem.hoTen || "Chưa rõ";

        // Map Vào list
        (studentItem.danhSachVao || []).forEach((scan: any) => {
          const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(studentId)}`;
          allScans.push({
            timecheck: scan.timecheck || 0,
            time: formatDisplayTime(scan),
            studentId,
            hoTen,
            avatarUrl: scan.pathimage || defaultAvatar,
            type: "Vào",
            ktx: resolveKhu(studentItem),
            room: scan.maPhong || studentItem.maPhong || "--",
            status: scan.cameraName || "Camera vào",
          });
        });

        // Map Ra list
        (studentItem.danhSachRa || []).forEach((scan: any) => {
          const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(studentId)}`;
          allScans.push({
            timecheck: scan.timecheck || 0,
            time: formatDisplayTime(scan),
            studentId,
            hoTen,
            avatarUrl: scan.pathimage || defaultAvatar,
            type: "Ra",
            ktx: resolveKhu(studentItem),
            room: scan.maPhong || studentItem.maPhong || "--",
            status: scan.cameraName || "Camera ra",
          });
        });

        // Map custom danhSachTatCa if it exists
        if (Array.isArray(studentItem.danhSachTatCa)) {
          studentItem.danhSachTatCa.forEach((scan: any) => {
            const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(studentId)}`;
            const isVao = String(scan.cameraName || scan.checkType || scan.type || "").toLowerCase().includes("vào") || scan.cameraIdId === 1;
            allScans.push({
              timecheck: scan.timecheck || 0,
              time: formatDisplayTime(scan),
              studentId,
              hoTen,
              avatarUrl: scan.pathimage || defaultAvatar,
              type: isVao ? "Vào" : "Ra",
              ktx: resolveKhu(studentItem),
              room: scan.maPhong || studentItem.maPhong || "--",
              status: scan.cameraName || scan.tenLoaiSuKien || (isVao ? "Camera vào" : "Camera ra"),
            });
          });
        }
      });

      // Sort scans by timestamp descending
      allScans.sort((a, b) => b.timecheck - a.timecheck);
      setGlobalHistoryList(allScans);

      // Reset page numbers
      setOverviewPage(1);
      setHistoryPage(1);
    } catch (err: any) {
      setError(err?.message || "Không thể tải dữ liệu thống kê");
      setOverviewList([]);
      setGlobalHistoryList([]);
    } finally {
      setLoading(false);
    }
  }, [tuNgay, denNgay]);

  // Load data once on mount
  useEffect(() => {
    loadThongKeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMssvChange = (value: string) => {
    setFormMssv(value);
    const existing = overviewList.find(
      (s) => s.studentId.toLowerCase() === value.toLowerCase().trim()
    );
    if (existing) {
      setFormHoTen(existing.hoTen);
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

    const newScan = {
      timecheck: Math.floor(parsedDate.getTime() / 1000),
      time: formattedTime,
      studentId: formMssv,
      hoTen: formHoTen || "Học viên mới",
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formMssv)}`,
      type: formLoai,
      ktx: formKhuKtx,
      room: formPhong,
      status: formGhiChu || "Ghi nhận thủ công",
    };

    setGlobalHistoryList([newScan, ...globalHistoryList]);

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
        tongLuot: student.tongLuot + 1,
      };
      setOverviewList(updatedOverviewList);
    } else {
      const newStudent: ThongKeOverview = {
        stt: overviewList.length + 1,
        studentId: formMssv,
        hoTen: formHoTen || "Học viên mới",
        maNhom: "Sinh viên",
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formMssv)}`,
        luotVao: formLoai === "Vào" ? 1 : 0,
        luotRa: formLoai === "Ra" ? 1 : 0,
        tongLuot: 1,
        khu: formKhuKtx || "Khu A",
        phong: formPhong || "--",
        trangThai: formGhiChu || "Hợp lệ",
      };
      setOverviewList([...overviewList, newStudent]);
    }

    setFormMssv("");
    setFormHoTen("");
    setFormKhuKtx("");
    setFormPhong("");
    setFormLoai("Vào");
    setFormGhiChu("");
    setModalOpened(false);
  };

  const handleReset = () => {
    setHoTen("");
    setMssv("");
    setTuNgay(null);
    setDenNgay(null);
    setKhuKtx("Tất cả");
    setTrangThai("Tất cả");
    setLoaiDoiTuong("Tất cả");
    setSelectedStudent(null);
    setDetailType(null);
    loadThongKeData({ tuNgay: null, denNgay: null });
  };

  // Normalize khu value để so sánh (xử lý mọi format: "A", "Khu A", "KHU_A", "khu a"...)
  const normalizeKhu = (val: string | undefined | null): string => {
    if (!val) return "";
    const s = String(val).toLowerCase().replace(/[_\-\s]+/g, "");
    if (s.includes("a")) return "Khu A";
    if (s.includes("b")) return "Khu B";
    return val;
  };

  const filteredOverview = overviewList.filter((item) => {
    if (!item) return false;
    const name = item.hoTen || "";
    const id = item.studentId || "";
    const group = item.maNhom || "";
    const matchName = name.toLowerCase().includes(hoTen.toLowerCase());
    const matchMssv = id.toLowerCase().includes(mssv.toLowerCase());
    const matchGroup =
      loaiDoiTuong === "Tất cả" ||
      (loaiDoiTuong === "Sinh viên" && group.includes("Sinh viên")) ||
      (loaiDoiTuong === "Cán bộ" && group.includes("Cán bộ"));
    const matchKhu =
      khuKtx === "Tất cả" ||
      normalizeKhu(item.khu) === khuKtx;
    return matchName && matchMssv && matchGroup && matchKhu;
  });

  // Calculate chart data based on dynamic list (Top 10 most active in/outs)
  const chartData = filteredOverview.length > 0
    ? [...filteredOverview]
        .sort((a, b) => b.tongLuot - a.tongLuot)
        .slice(0, 10)
        .map((student) => ({
          name: (student.hoTen && typeof student.hoTen === "string")
            ? (student.hoTen.split(" ").pop() || student.hoTen)
            : "Chưa rõ",
          "Lượt vào": student.luotVao,
          "Lượt ra": student.luotRa,
        }))
    : [{ name: "Không có dữ liệu", "Lượt vào": 0, "Lượt ra": 0 }];

  // Calculate Pie chart metrics based on student statuses
  const statusCounts = filteredOverview.reduce((acc: { [key: string]: number }, curr) => {
    const status = curr.trangThai || "Hợp lệ";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const totalStatusCount = filteredOverview.length;

  const pieData = totalStatusCount > 0
    ? Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
    : [{ name: "Không có dữ liệu", value: 1 }];

  // Filter history events
  const filteredHistoryList = globalHistoryList.filter((item) => {
    if (!item) return false;

    // Filter by selected student
    if (selectedStudent && item.studentId !== selectedStudent.studentId) return false;

    // Filter by check direction
    if (detailType === "Vào" && item.type !== "Vào") return false;
    if (detailType === "Ra" && item.type !== "Ra") return false;

    // Filter by KTX - normalize both sides
    if (khuKtx !== "Tất cả" && normalizeKhu(item.ktx) !== khuKtx) return false;

    // Filter by status
    if (trangThai !== "Tất cả" && item.status !== trangThai) return false;

    return true;
  });

  // Paginated lists
  const totalOverviewPages = Math.ceil(filteredOverview.length / pageSize);
  const paginatedOverview = filteredOverview.slice((overviewPage - 1) * pageSize, overviewPage * pageSize);

  const totalHistoryPages = Math.ceil(filteredHistoryList.length / pageSize);
  const paginatedHistory = filteredHistoryList.slice((historyPage - 1) * pageSize, historyPage * pageSize);

  const handleStatClick = (student: ThongKeOverview, clickType: "Vào" | "Ra" | "Tất cả") => {
    setSelectedStudent(student);
    setDetailType(clickType);
    setHistoryPage(1);
  };

  return (
    <Stack gap="xl" p="sm" style={{ backgroundColor: "#fafbfd", minHeight: "100vh", fontFamily: "var(--font-readex-pro), sans-serif" }}>
      <Group gap="md">
        <ThemeIcon size={38} variant="light" color="blue" style={{ backgroundColor: "#e0f2fe" }}>
          <IconReportAnalytics size={20} color="#1f5ca9" />
        </ThemeIcon>
        <Title order={2} fw={800} c="#1f5ca9" style={{ letterSpacing: "-0.5px", fontFamily: "var(--font-readex-pro), sans-serif" }}>
          THỐNG KÊ LƯỢT RA VÀO
        </Title>
      </Group>

      <Card withBorder radius="lg" p="lg" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)", borderColor: "#e2e8f0" }}>
        <Stack gap="md">
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
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
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
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
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
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
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                label="TRẠNG THÁI"
                value={trangThai}
                onChange={(val) => setTrangThai(val || "Tất cả")}
                data={["Tất cả", "Hợp lệ", "Nghi vấn", "Không hợp lệ"]}
                styles={{
                  label: { fontSize: "11px", fontWeight: 700, color: "#1f5ca9", marginBottom: "6px", letterSpacing: "0.5px" },
                  input: { borderRadius: "8px", fontFamily: "var(--font-readex-pro), sans-serif" }
                }}
              />
            </Grid.Col>
          </Grid>

          {/* Advanced filter toggle button */}
          <Group justify="flex-start" mt={-4}>
            <Button
              variant="subtle"
              size="xs"
              color="blue"
              leftSection={showAdvancedFilter ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
              onClick={() => setShowAdvancedFilter((v) => !v)}
              style={{ fontFamily: "var(--font-readex-pro), sans-serif", color: "#1f5ca9", paddingLeft: 0 }}
            >
              {showAdvancedFilter ? "Ẩn bộ lọc nâng cao" : "Mở rộng bộ lọc"}
            </Button>
          </Group>

          {/* Advanced filters: Loại đối tượng, Họ tên, MSSV */}
          {showAdvancedFilter && (
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <Select
                  label="LOẠI ĐỐI TƯỢNG"
                  value={loaiDoiTuong}
                  onChange={(val) => setLoaiDoiTuong(val || "Tất cả")}
                  data={["Tất cả", "Sinh viên", "Cán bộ"]}
                  styles={{
                    label: { fontSize: "11px", fontWeight: 700, color: "#1f5ca9", marginBottom: "6px", letterSpacing: "0.5px" },
                    input: { borderRadius: "8px", fontFamily: "var(--font-readex-pro), sans-serif" }
                  }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <TextInput
                  label="HỌ TÊN"
                  placeholder="Nhập họ tên..."
                  value={hoTen}
                  onChange={(e) => setHoTen(e.currentTarget.value)}
                  styles={{
                    label: { fontSize: "11px", fontWeight: 700, color: "#1f5ca9", marginBottom: "6px", letterSpacing: "0.5px" },
                    input: { borderRadius: "8px", fontFamily: "var(--font-readex-pro), sans-serif" }
                  }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 12, md: 4 }}>
                <TextInput
                  label="MSSV / MÃ SỐ"
                  placeholder="Nhập MSSV hoặc mã cán bộ..."
                  value={mssv}
                  onChange={(e) => setMssv(e.currentTarget.value)}
                  styles={{
                    label: { fontSize: "11px", fontWeight: 700, color: "#1f5ca9", marginBottom: "6px", letterSpacing: "0.5px" },
                    input: { borderRadius: "8px", fontFamily: "var(--font-readex-pro), sans-serif" }
                  }}
                />
              </Grid.Col>
            </Grid>
          )}

          <Group gap="xs" justify="flex-end" wrap="wrap" mt="xs">
            <Button
              leftSection={loading ? <Loader size={16} color="white" /> : <IconSearch size={16} />}
              style={{ backgroundColor: "#1f5ca9", fontFamily: "var(--font-readex-pro), sans-serif" }}
              onClick={() => loadThongKeData()}
              disabled={loading}
            >
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
            <Button leftSection={<IconPlus size={16} />} style={{ background: "linear-gradient(135deg, #1f5ca9, #00afef)", fontFamily: "var(--font-readex-pro), sans-serif" }} onClick={() => setModalOpened(true)}>
              Thêm dữ liệu
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
            <Text size="sm" c="dimmed">Đang tải dữ liệu từ hệ thống...</Text>
          </Stack>
        </Center>
      ) : (
        <>
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Card withBorder radius="lg" p="lg" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}>
                <Text fw={700} size="sm" c="dimmed" mb="md" style={{ letterSpacing: "0.5px" }}>
                  TOP 10 RA VÀO NHIỀU NHẤT
                </Text>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Lượt vào" fill="#1f5ca9" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Lượt ra" fill="#00afef" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card withBorder radius="lg" p="lg" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}>
                <Text fw={700} size="sm" c="dimmed" mb="md" style={{ letterSpacing: "0.5px" }}>
                  PHÂN BỔ LƯỢT RA VÀO THEO TRẠNG THÁI
                </Text>
                <div style={{ height: 300, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                  <ResponsiveContainer width="100%" height="70%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => {
                          const COLORS = ["#1f5ca9", "#00afef", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#6366f1", "#ec4899", "#14b8a6", "#f43f5e"];
                          return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                        })}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <Group gap="sm" mt="md" justify="center" wrap="wrap">
                    {pieData.map((entry, index) => {
                      const COLORS = ["#1f5ca9", "#00afef", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#6366f1", "#ec4899", "#14b8a6", "#f43f5e"];
                      const color = COLORS[index % COLORS.length];
                      const pct = totalStatusCount > 0 ? Math.round((entry.value / totalStatusCount) * 100) : 0;
                      return (
                        <Group gap="xs" key={entry.name}>
                          <Box style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: color }} />
                          <Text size="xs" fw={500}>{entry.name} ({pct}%)</Text>
                        </Group>
                      );
                    })}
                  </Group>
                </div>
              </Card>
            </Grid.Col>
          </Grid>

          <Card withBorder radius="lg" p="lg" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}>
            <Group justify="space-between" mb="md">
              <Text fw={800} size="md" c="#1e293b" style={{ letterSpacing: "0.25px" }}>
                BẢNG THỐNG KÊ SINH VIÊN RA VÀO
              </Text>
            </Group>

            <ScrollArea>
              <Table verticalSpacing="sm" highlightOnHover style={{ minWidth: 800 }}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>STT</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>MSSV / Mã số</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>Họ tên</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>Mã nhóm / Vai trò</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>Ảnh đại diện</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>Khu KTX</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px", textAlign: "center" }}>Lượt vào</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px", textAlign: "center" }}>Lượt ra</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px", textAlign: "center" }}>Tổng lượt</Table.Th>
                    <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px", textAlign: "center" }}>Trạng thái</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {paginatedOverview.map((row, index) => {
                    const isSelected = selectedStudent?.studentId === row.studentId;
                    return (
                      <Table.Tr key={row.studentId || index} style={{ borderBottom: "1px solid #f1f5f9", backgroundColor: isSelected ? "#f0f7ff" : "transparent" }}>
                        <Table.Td style={{ fontSize: "13px", color: "#64748b" }}>
                          {(overviewPage - 1) * pageSize + index + 1}
                        </Table.Td>
                        <Table.Td style={{ fontSize: "13px", color: "#64748b", fontFamily: "monospace" }}>{row.studentId}</Table.Td>
                        <Table.Td style={{ fontSize: "13px", color: "#1e293b", fontWeight: 600 }}>{row.hoTen}</Table.Td>
                        <Table.Td style={{ fontSize: "13px", color: "#475569" }}>{row.maNhom}</Table.Td>
                        <Table.Td>
                          <SafeAvatar
                            src={row.avatarUrl}
                            fallback={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(row.studentId)}`}
                            radius="sm"
                            size="md"
                            alt={row.hoTen}
                          />
                        </Table.Td>
                        <Table.Td style={{ fontSize: "13px", color: "#475569" }}>{row.khu}</Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          <Anchor component="button" fw={700} c="#0369A1" onClick={() => handleStatClick(row, "Vào")} style={{ fontSize: "13px", textDecoration: isSelected && detailType === "Vào" ? "underline" : "none" }}>
                            {row.luotVao}
                          </Anchor>
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          <Anchor component="button" fw={700} c="#B91C1C" onClick={() => handleStatClick(row, "Ra")} style={{ fontSize: "13px", textDecoration: isSelected && detailType === "Ra" ? "underline" : "none" }}>
                            {row.luotRa}
                          </Anchor>
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          <Anchor component="button" fw={700} c="#1A52C5" onClick={() => handleStatClick(row, "Tất cả")} style={{ fontSize: "13px", textDecoration: isSelected && detailType === "Tất cả" ? "underline" : "none" }}>
                            {row.tongLuot}
                          </Anchor>
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          <Badge color="blue" variant="light" size="xs">
                            {row.trangThai}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                  {filteredOverview.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={10}>
                        <Text ta="center" c="dimmed" py="xl">Không tìm thấy kết quả phù hợp</Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            {totalOverviewPages > 1 && (
              <Group justify="center" mt="md">
                <Pagination
                  value={overviewPage}
                  onChange={setOverviewPage}
                  total={totalOverviewPages}
                  color="blue"
                  radius="md"
                  withEdges
                />
              </Group>
            )}
          </Card>

          {selectedStudent && (
            <Card withBorder radius="lg" p="lg" mt="md" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}>
              <Group justify="space-between" mb="md">
                <Text fw={800} size="md" c="#1e293b" style={{ letterSpacing: "0.25px", fontFamily: "var(--font-readex-pro), sans-serif" }}>
                  CHI TIẾT LỊCH SỬ RA VÀO - {selectedStudent.hoTen.toUpperCase()} ({selectedStudent.studentId})
                  {detailType && ` - LỌC THEO: ${detailType.toUpperCase()}`}
                </Text>
                <Button variant="subtle" color="red" size="xs" onClick={() => { setSelectedStudent(null); setDetailType(null); }} style={{ fontFamily: "var(--font-readex-pro), sans-serif" }}>
                  Đóng chi tiết
                </Button>
              </Group>

              <ScrollArea>
                <Table verticalSpacing="sm" highlightOnHover style={{ minWidth: 800 }}>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>STT</Table.Th>
                      <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>Thời gian</Table.Th>
                      <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px", textAlign: "center" }}>Loại</Table.Th>
                      <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>Khu KTX</Table.Th>
                      <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px" }}>Phòng / Vị trí</Table.Th>
                      <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px", textAlign: "center" }}>Trạng thái / Camera</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {paginatedHistory.map((detail, index) => (
                      <Table.Tr key={index} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <Table.Td style={{ fontSize: "13px", color: "#64748b" }}>
                          {(historyPage - 1) * pageSize + index + 1}
                        </Table.Td>
                        <Table.Td style={{ fontSize: "13px", color: "#1e293b", fontWeight: 500 }}>{detail.time}</Table.Td>
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
                              String(detail.status).toLowerCase().includes("vào") || String(detail.status).toLowerCase().includes("ra") || detail.status === "Hợp lệ" || String(detail.status).toLowerCase().includes("ghi nhận") ? "green" : "red"
                            }
                            variant="light"
                            size="sm"
                          >
                            {detail.status}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                    {filteredHistoryList.length === 0 && (
                      <Table.Tr>
                        <Table.Td colSpan={6}>
                          <Text ta="center" c="dimmed" py="xl">
                            Không có dữ liệu lịch sử ra vào chi tiết cho bộ lọc này
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </ScrollArea>

              {totalHistoryPages > 1 && (
                <Group justify="center" mt="md">
                  <Pagination
                    value={historyPage}
                    onChange={setHistoryPage}
                    total={totalHistoryPages}
                    color="blue"
                    radius="md"
                    withEdges
                  />
                </Group>
              )}
            </Card>
          )}
        </>
      )}

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={<Text fw={800} size="lg" c="#1A52C5" style={{ textTransform: "uppercase", letterSpacing: "0.5px" }}>Thêm dữ liệu vào/ra</Text>}
        centered
        radius="lg"
        size="md"
        padding="xl"
        styles={{ header: { borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" } }}
      >
        <Stack gap="md" mt="sm">
          <TextInput label="MSSV" placeholder="Nhập MSSV" required value={formMssv} onChange={(e) => handleMssvChange(e.currentTarget.value)} styles={{ label: { fontWeight: 700, fontSize: "14px", color: "#1e293b", marginBottom: "4px" }, input: { borderRadius: "8px" } }} />
          <TextInput label="Họ tên" placeholder="Nhập họ tên" value={formHoTen} onChange={(e) => setFormHoTen(e.currentTarget.value)} styles={{ label: { fontWeight: 700, fontSize: "14px", color: "#1e293b", marginBottom: "4px" }, input: { borderRadius: "8px" } }} />
          <Select label="Khu KTX" placeholder="--Chọn khu KTX--" required value={formKhuKtx} onChange={(val) => setFormKhuKtx(val || "")} data={["Khu A", "Khu B"]} styles={{ label: { fontWeight: 700, fontSize: "14px", color: "#1e293b", marginBottom: "4px" }, input: { borderRadius: "8px" } }} />
          <Select label="Phòng" placeholder="--Chọn khu KTX--" required value={formPhong} onChange={(val) => setFormPhong(val || "")} data={formKhuKtx === "Khu A" ? ["A101", "A302", "A408"] : formKhuKtx === "Khu B" ? ["B104", "B205"] : ["A101", "A302", "A408", "B104", "B205"]} styles={{ label: { fontWeight: 700, fontSize: "14px", color: "#1e293b", marginBottom: "4px" }, input: { borderRadius: "8px" } }} />
          <Radio.Group label="Loại" required value={formLoai} onChange={setFormLoai} styles={{ label: { fontWeight: 700, fontSize: "14px", color: "#1e293b", marginBottom: "8px" } }}>
            <Group gap="xl">
              <Radio value="Vào" label="Vào" color="green" styles={{ label: { fontWeight: 500 } }} />
              <Radio value="Ra" label="Ra" color="green" styles={{ label: { fontWeight: 500 } }} />
            </Group>
          </Radio.Group>
          <TextInput label="Thời gian" type="datetime-local" required value={formThoiGian} onChange={(e) => setFormThoiGian(e.currentTarget.value)} styles={{ label: { fontWeight: 700, fontSize: "14px", color: "#1e293b", marginBottom: "4px" }, input: { borderRadius: "8px" } }} />
          <Textarea label="Ghi chú" placeholder="Nhập ghi chú (nếu có)" value={formGhiChu} onChange={(e) => setFormGhiChu(e.currentTarget.value)} rows={3} styles={{ label: { fontWeight: 700, fontSize: "14px", color: "#1e293b", marginBottom: "4px" }, input: { borderRadius: "8px" } }} />
          <Group justify="center" mt="xl" gap="md">
            <Button variant="outline" color="gray" onClick={() => setModalOpened(false)} style={{ width: 140, borderRadius: "8px", fontWeight: 600 }}>Hủy</Button>
            <Button onClick={handleFormSubmit} style={{ width: 140, borderRadius: "8px", backgroundColor: "#007fff", fontWeight: 600 }}>Ghi nhận</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
