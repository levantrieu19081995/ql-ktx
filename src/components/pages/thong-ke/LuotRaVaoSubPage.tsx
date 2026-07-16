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
  Anchor,
  ScrollArea,
  Stack,
  Title,
  Grid,
  TextInput,
  Select,
  Button,
  Box,
  Modal,
  Drawer,
  Radio,
  Textarea,
  Loader,
  Center,
  ActionIcon,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { fetchThongKeRaVao } from "@/services/dashboard/thongkeService";
import {
  fetchSinhVienCamPaginate,
  fetchThongKeSvBiCamNoPhi,
} from "@/services/dashboard/dashboardService";
import PageSectionHeader from "@/components/common/PageSectionHeader";
import CustomPagination from "@/components/common/CustomPagination";

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

function SafeAvatar({
  src,
  fallback,
  alt,
  radius,
  size,
}: {
  src: string;
  fallback: string;
  alt?: string;
  radius?: any;
  size?: any;
}) {
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

export default function LuotRaVaoSubPage() {
  const t = useTranslations("Statistics");

  const getTranslatedStatus = (statusName: string) => {
    if (statusName === "Hợp lệ") return t("statusValid");
    if (statusName === "Nghi vấn") return t("statusSuspicious");
    if (statusName === "Không hợp lệ") return t("statusInvalid");
    if (statusName === "Không có dữ liệu") return t("noData");
    return statusName;
  };

  const getTranslatedActionOrStatus = (val: string) => {
    if (val === "Vào") return t("in");
    if (val === "Ra") return t("out");
    if (val === "Hợp lệ") return t("statusValid");
    if (val === "Nghi vấn") return t("statusSuspicious");
    if (val === "Không hợp lệ") return t("statusInvalid");
    if (val === "Ghi nhận thủ công") return t("manualRecord");
    if (val === "Camera vào") return `Camera ${t("in").toLowerCase()}`;
    if (val === "Camera ra") return `Camera ${t("out").toLowerCase()}`;
    return val;
  };

  const getTranslatedKhu = (khu: string) => {
    if (khu === "Khu A") return t("dormA");
    if (khu === "Khu B") return t("dormB");
    return khu;
  };

  const [hoTen, setHoTen] = useState("");
  const [mssv, setMssv] = useState("");
  const [tuNgay, setTuNgay] = useState<Date | null>(new Date("2026-06-01"));
  const [denNgay, setDenNgay] = useState<Date | null>(new Date("2026-06-06"));
  const [khuKtx, setKhuKtx] = useState("Tất cả");
  const [trangThai, setTrangThai] = useState("Tất cả");
  const [loaiDoiTuong, setLoaiDoiTuong] = useState("Tất cả");
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

  const [overviewList, setOverviewList] = useState<ThongKeOverview[]>([]);
  const [globalHistoryList, setGlobalHistoryList] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedStudent, setSelectedStudent] =
    useState<ThongKeOverview | null>(null);
  const [detailType, setDetailType] = useState<"Vào" | "Ra" | "Tất cả" | null>(
    null,
  );

  // Pagination states
  const [overviewPage, setOverviewPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [overviewPageSize, setOverviewPageSize] = useState(10);
  const [historyPageSize, setHistoryPageSize] = useState(10);

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

  const loadThongKeData = useCallback(
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

        const formatDate = (dateVal: Date | null, isStart: boolean): string => {
          if (dateVal && !isNaN(dateVal.getTime())) {
            const mm = String(dateVal.getMonth() + 1).padStart(2, "0");
            const dd = String(dateVal.getDate()).padStart(2, "0");
            const yyyy = dateVal.getFullYear();
            return `${mm}/${dd}/${yyyy}`;
          }
          // Default to mock data range 06/01/2026 - 06/06/2026 when not filtered
          return isStart ? "06/01/2026" : "06/06/2026";
        };

        const tuNgayFormatted = formatDate(activeTu, true);
        const denNgayFormatted = formatDate(activeDen, false);

        const res = await fetchThongKeRaVao({
          tuNgay: tuNgayFormatted,
          denNgay: denNgayFormatted,
        });

        const list = res?.payload || [];
        console.log("[LuotRaVao] fetchThongKeRaVao payload sample:", list[0]);

        // Fetch banned students lookup map
        const bannedMap = new Set<string>();
        const bannedReasons: { [key: string]: string } = {};
        try {
          const bannedRes = await fetchSinhVienCamPaginate({
            page: 1,
            pageSize: 1000,
            maSinhVien: "-1",
          });
          const items = bannedRes?.payload?.items || [];
          items.forEach((item: any) => {
            if (item.maSinhVien) {
              bannedMap.add(item.maSinhVien);
              bannedReasons[item.maSinhVien] = item.lyDo || "Bị cấm ra vào";
            }
          });
        } catch (err) {
          console.error("Failed to load banned students for lookup:", err);
        }

        // Fetch debt students lookup map
        const debtMap = new Set<string>();
        const debtReasons: { [key: string]: string } = {};
        try {
          const statsRes = await fetchThongKeSvBiCamNoPhi({
            tuNgay: tuNgayFormatted,
            denNgay: denNgayFormatted,
          });
          const items = statsRes?.payload || [];
          items.forEach((item: any) => {
            const code = item.maSinhVien || item.maSo || item.maso;
            if (
              code &&
              (item.tongSoLanNoPhi > 0 ||
                (item.danhSachNoPhi && item.danhSachNoPhi.length > 0))
            ) {
              debtMap.add(code);
              debtReasons[code] =
                item.danhSachNoPhi?.[0]?.tenLoaiSuKien || "Nợ học phí";
            }
          });
        } catch (err) {
          console.error("Failed to load debt students for lookup:", err);
        }

        const resolveImageUrl = (url: string): string => {
          return url || "";
        };

        // 1. Map overview list
        const mappedOverview: ThongKeOverview[] = list.map(
          (item: any, index: number) => {
            const studentId = item.maSo || item.maSinhVien || `no-id-${index}`;
            const hasVaoScans =
              Array.isArray(item.danhSachVao) && item.danhSachVao.length > 0;
            const hasRaScans =
              Array.isArray(item.danhSachRa) && item.danhSachRa.length > 0;

            let pathImage = "";
            if (hasVaoScans) pathImage = item.danhSachVao[0].pathimage || "";
            else if (hasRaScans) pathImage = item.danhSachRa[0].pathimage || "";

            const avatarUrl = pathImage
              ? resolveImageUrl(pathImage)
              : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(studentId)}`;

            const khu = resolveKhu(item);
            const phong =
              item.maPhong ||
              item.tenPhong ||
              item.danhSachVao?.[0]?.maPhong ||
              item.danhSachRa?.[0]?.maPhong ||
              "--";

            // Resolve status based on lookup map
            const isBanned = bannedMap.has(studentId);
            const isDebt = debtMap.has(studentId);
            const trangThai = isBanned
              ? "Không hợp lệ"
              : isDebt
                ? "Nghi vấn"
                : "Hợp lệ";

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
          },
        );

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
              if (
                String(rawTime).includes(":") ||
                String(rawTime).includes("T")
              ) {
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
            const isBanned = bannedMap.has(studentId);
            const isDebt = debtMap.has(studentId);
            let resolvedStatus = scan.cameraName || "Camera vào";
            if (isBanned) {
              resolvedStatus = `Không hợp lệ (${bannedReasons[studentId] || "Bị cấm"})`;
            } else if (isDebt) {
              resolvedStatus = `Nghi vấn (${debtReasons[studentId] || "Nợ học phí"})`;
            }

            allScans.push({
              timecheck: scan.timecheck || 0,
              time: formatDisplayTime(scan),
              studentId,
              hoTen,
              avatarUrl: scan.pathimage || defaultAvatar,
              type: "Vào",
              ktx: resolveKhu(studentItem),
              room: scan.maPhong || studentItem.maPhong || "--",
              status: resolvedStatus,
            });
          });

          // Map Ra list
          (studentItem.danhSachRa || []).forEach((scan: any) => {
            const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(studentId)}`;
            const isBanned = bannedMap.has(studentId);
            const isDebt = debtMap.has(studentId);
            let resolvedStatus = scan.cameraName || "Camera ra";
            if (isBanned) {
              resolvedStatus = `Không hợp lệ (${bannedReasons[studentId] || "Bị cấm"})`;
            } else if (isDebt) {
              resolvedStatus = `Nghi vấn (${debtReasons[studentId] || "Nợ học phí"})`;
            }

            allScans.push({
              timecheck: scan.timecheck || 0,
              time: formatDisplayTime(scan),
              studentId,
              hoTen,
              avatarUrl: scan.pathimage || defaultAvatar,
              type: "Ra",
              ktx: resolveKhu(studentItem),
              room: scan.maPhong || studentItem.maPhong || "--",
              status: resolvedStatus,
            });
          });

          // Map custom danhSachTatCa if it exists
          if (Array.isArray(studentItem.danhSachTatCa)) {
            studentItem.danhSachTatCa.forEach((scan: any) => {
              const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(studentId)}`;
              const isVao =
                String(scan.cameraName || scan.checkType || scan.type || "")
                  .toLowerCase()
                  .includes("vào") || scan.cameraIdId === 1;
              const isBanned = bannedMap.has(studentId);
              const isDebt = debtMap.has(studentId);
              let resolvedStatus =
                scan.cameraName ||
                scan.tenLoaiSuKien ||
                (isVao ? "Camera vào" : "Camera ra");
              if (isBanned) {
                resolvedStatus = `Không hợp lệ (${bannedReasons[studentId] || "Bị cấm"})`;
              } else if (isDebt) {
                resolvedStatus = `Nghi vấn (${debtReasons[studentId] || "Nợ học phí"})`;
              }

              allScans.push({
                timecheck: scan.timecheck || 0,
                time: formatDisplayTime(scan),
                studentId,
                hoTen,
                avatarUrl: scan.pathimage || defaultAvatar,
                type: isVao ? "Vào" : "Ra",
                ktx: resolveKhu(studentItem),
                room: scan.maPhong || studentItem.maPhong || "--",
                status: resolvedStatus,
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
    },
    [tuNgay, denNgay],
  );

  // Load data once on mount
  useEffect(() => {
    loadThongKeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMssvChange = (value: string) => {
    setFormMssv(value);
    const existing = overviewList.find(
      (s) => s.studentId.toLowerCase() === value.toLowerCase().trim(),
    );
    if (existing) {
      setFormHoTen(existing.hoTen);
    }
  };

  const handleFormSubmit = () => {
    if (!formMssv || !formKhuKtx || !formPhong || !formLoai || !formThoiGian) {
      alert(t("requiredFieldsWarning"));
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
      hoTen: formHoTen || t("newStudent"),
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formMssv)}`,
      type: formLoai,
      ktx: formKhuKtx,
      room: formPhong,
      status: formGhiChu || t("manualRecord"),
    };

    setGlobalHistoryList([newScan, ...globalHistoryList]);

    const existingOverviewIndex = overviewList.findIndex(
      (s) => s.studentId.toLowerCase() === formMssv.toLowerCase().trim(),
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
        hoTen: formHoTen || t("newStudent"),
        maNhom: t("roleStudent"),
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formMssv)}`,
        luotVao: formLoai === "Vào" ? 1 : 0,
        luotRa: formLoai === "Ra" ? 1 : 0,
        tongLuot: 1,
        khu: formKhuKtx || "Khu A",
        phong: formPhong || "--",
        trangThai: formGhiChu || t("statusValid"),
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
    const defaultTu = new Date("2026-06-01");
    const defaultDen = new Date("2026-06-06");
    setTuNgay(defaultTu);
    setDenNgay(defaultDen);
    setKhuKtx("Tất cả");
    setTrangThai("Tất cả");
    setLoaiDoiTuong("Tất cả");
    setSelectedStudent(null);
    setDetailType(null);
    loadThongKeData({ tuNgay: defaultTu, denNgay: defaultDen });
  };

  // Normalize khu value để so sánh (xử lý mọi format: "A", "Khu A", "KHU_A", "khu a"...)
  const normalizeKhu = (val: string | undefined | null): string => {
    if (!val) return "";
    const s = String(val)
      .toLowerCase()
      .replace(/[_\-\s]+/g, "");
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
    const matchKhu = khuKtx === "Tất cả" || normalizeKhu(item.khu) === khuKtx;
    const matchTrangThai =
      trangThai === "Tất cả" || item.trangThai === trangThai;
    return matchName && matchMssv && matchGroup && matchKhu && matchTrangThai;
  });

  // Calculate chart data based on dynamic list (Top 10 most active in/outs)
  // const chartData =
  //   filteredOverview.length > 0
  //     ? [...filteredOverview]
  //         .sort((a, b) => b.tongLuot - a.tongLuot)
  //         .slice(0, 10)
  //         .map((student) => ({
  //           name: student.studentId ? `MS: ${student.studentId}` : "Chưa rõ",
  //           "Lượt vào": student.luotVao,
  //           "Lượt ra": student.luotRa,
  //         }))
  //     : [{ name: t("noData"), "Lượt vào": 0, "Lượt ra": 0 }];

  const chartData =
    filteredOverview.length > 0
      ? [...filteredOverview]
          .sort((a, b) => b.tongLuot - a.tongLuot)
          .slice(0, 10)
          .map((student) => ({
            name: student.studentId || "Chưa rõ",
            "Lượt vào": student.luotVao,
            "Lượt ra": student.luotRa,
          }))
      : [{ name: t("noData"), "Lượt vào": 0, "Lượt ra": 0 }];

  // Calculate Pie chart metrics based on student statuses
  const statusCounts = filteredOverview.reduce(
    (acc: { [key: string]: number }, curr) => {
      const status = curr.trangThai || "Hợp lệ";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {},
  );

  const totalStatusCount = filteredOverview.length;

  const pieData =
    totalStatusCount > 0
      ? Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
      : [{ name: t("noData"), value: 1 }];

  // Filter history events
  const filteredHistoryList = globalHistoryList.filter((item) => {
    if (!item) return false;

    // Filter by selected student
    if (selectedStudent && item.studentId !== selectedStudent.studentId)
      return false;

    // Filter by check direction
    if (detailType === "Vào" && item.type !== "Vào") return false;
    if (detailType === "Ra" && item.type !== "Ra") return false;

    // Filter by KTX - normalize both sides
    if (khuKtx !== "Tất cả" && normalizeKhu(item.ktx) !== khuKtx) return false;

    // Filter by status
    if (trangThai !== "Tất cả") {
      const lowerStatus = String(item.status || "").toLowerCase();
      if (trangThai === "Không hợp lệ" && !lowerStatus.includes("không hợp lệ"))
        return false;
      if (trangThai === "Nghi vấn" && !lowerStatus.includes("nghi vấn"))
        return false;
      if (
        trangThai === "Hợp lệ" &&
        (lowerStatus.includes("không hợp lệ") ||
          lowerStatus.includes("nghi vấn"))
      )
        return false;
    }

    return true;
  });

  // Paginated lists
  const totalOverviewPages = Math.ceil(
    filteredOverview.length / overviewPageSize,
  );
  const paginatedOverview = filteredOverview.slice(
    (overviewPage - 1) * overviewPageSize,
    overviewPage * overviewPageSize,
  );

  const totalHistoryPages = Math.ceil(
    filteredHistoryList.length / historyPageSize,
  );
  const paginatedHistory = filteredHistoryList.slice(
    (historyPage - 1) * historyPageSize,
    historyPage * historyPageSize,
  );

  const handleStatClick = (
    student: ThongKeOverview,
    clickType: "Vào" | "Ra" | "Tất cả",
  ) => {
    setSelectedStudent(student);
    setDetailType(clickType);
    setHistoryPage(1);
  };

  const CustomChartLegend = ({
    inboundLabel,
    outboundLabel,
  }: {
    inboundLabel: string;
    outboundLabel: string;
  }) => {
    return (
      <Group justify="center" align="flex-end" gap="lg" mt={8} wrap="wrap">
        {/* Mô tả trục biểu đồ */}
        <Box
          style={{
            position: "relative",
            width: 78,
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
            }}
          >
            Định lượng
          </Text>

          {/* Trục Y */}
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

          {/* Trục X */}
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

          {/* Cột minh họa 1 */}
          <Box
            style={{
              position: "absolute",
              left: 14,
              bottom: 5,
              width: 8,
              height: 9,
              borderRadius: "2px 2px 0 0",
              backgroundColor: "#1f5ca9",
            }}
          />

          {/* Cột minh họa 2 */}
          <Box
            style={{
              position: "absolute",
              left: 26,
              bottom: 5,
              width: 8,
              height: 14,
              borderRadius: "2px 2px 0 0",
              backgroundColor: "#00afef",
            }}
          />

          {/* Tên trục X */}
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
            Mã số
          </Text>
        </Box>

        {/* Chú thích Lượt ra */}
        <Group gap={5} wrap="nowrap">
          <Box
            style={{
              width: 11,
              height: 11,
              borderRadius: 2,
              backgroundColor: "#00afef",
            }}
          />

          <Text size="12px" c="#64748b">
            {outboundLabel}
          </Text>
        </Group>

        {/* Chú thích Lượt vào */}
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
            {inboundLabel}
          </Text>
        </Group>
      </Group>
    );
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
        title={t("inOutTitle")}
        description="Theo dõi thống kê lượt ra vào và chi tiết phát sinh theo sinh viên, khu và trạng thái."
        icon={<IconReportAnalytics size={20} color="#1f5ca9" />}
        rightSection={<></>}
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
            className="inout-compact-filter"
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(120px, 1fr) minmax(120px, 1fr) max-content max-content max-content max-content 40px",
              gap: "12px",
              alignItems: "end",
              justifyContent: "start",
              overflowX: "hidden",
              overflowY: "hidden",
              paddingBottom: 2,
            }}
          >
            <Box
              className="inout-compact-filter__field"
              style={{ minWidth: 0 }}
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
            </Box>

            <Box
              className="inout-compact-filter__field"
              style={{ minWidth: 0 }}
            >
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
            </Box>

            <Box
              className="inout-compact-filter__control"
              style={{ minWidth: 0 }}
            >
              <Button
                fullWidth
                leftSection={
                  loading ? (
                    <Loader size={16} color="white" />
                  ) : (
                    <IconSearch size={17} />
                  )
                }
                onClick={() => loadThongKeData()}
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
            </Box>

            <Box
              className="inout-compact-filter__control"
              style={{ minWidth: 0 }}
            >
              <Button
                fullWidth
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
            </Box>

            <Box
              className="inout-compact-filter__control"
              style={{ minWidth: 0 }}
            >
              <Button
                fullWidth
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
            </Box>

            <Box
              className="inout-compact-filter__control"
              style={{ minWidth: 0 }}
            >
              <Button
                fullWidth
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
            </Box>

            <Box
              className="inout-compact-filter__toggle"
              style={{ display: "flex", alignItems: "end", minWidth: 40 }}
            >
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
            </Box>
          </Box>
        ) : (
          // ==================== MỞ RỘNG ====================
          <Stack gap={12}>
            <Box
              className="inout-advanced-filter__grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
                gap: "12px",
                alignItems: "end",
              }}
            >
              <Box style={{ gridColumn: "span 3", minWidth: 0 }}>
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
              </Box>

              <Box style={{ gridColumn: "span 3", minWidth: 0 }}>
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
              </Box>

              <Box style={{ gridColumn: "span 3", minWidth: 0 }}>
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
              </Box>

              <Box style={{ gridColumn: "span 3", minWidth: 0 }}>
                <Select
                  label={t("status")}
                  value={trangThai}
                  onChange={(val) => setTrangThai(val || "Tất cả")}
                  data={[
                    { value: "Tất cả", label: t("all") },
                    { value: "Hợp lệ", label: t("statusValid") },
                    { value: "Nghi vấn", label: t("statusSuspicious") },
                    { value: "Không hợp lệ", label: t("statusInvalid") },
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
              </Box>

              <Box style={{ gridColumn: "span 2", minWidth: 0 }}>
                <Select
                  label={t("objectType")}
                  value={loaiDoiTuong}
                  onChange={(val) => setLoaiDoiTuong(val || "Tất cả")}
                  data={[
                    { value: "Tất cả", label: t("all") },
                    { value: "Sinh viên", label: t("roleStudent") },
                    { value: "Cán bộ", label: t("roleStaff") },
                  ]}
                  styles={{
                    label: {
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#475569",
                      marginBottom: "6px",
                      letterSpacing: "0.3px",
                      flex: 1,
                    },
                    input: {
                      borderRadius: "8px",
                      height: "40px",
                    },
                  }}
                />
              </Box>

              <Box style={{ gridColumn: "span 2", minWidth: 0 }}>
                <TextInput
                  label={t("fullName").toUpperCase()}
                  placeholder="Họ tên..."
                  value={hoTen}
                  onChange={(e) => setHoTen(e.currentTarget.value)}
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
              </Box>

              <Box style={{ gridColumn: "span 2", minWidth: 0 }}>
                <TextInput
                  label="MSSV / MÃ SỐ"
                  placeholder="MSSV..."
                  value={mssv}
                  onChange={(e) => setMssv(e.currentTarget.value)}
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
              </Box>

              <Group
                gap="sm"
                wrap="wrap"
                className="inout-advanced-filter__actions"
                style={{
                  gridColumn: "span 6",
                  justifyContent: "flex-start",
                  alignItems: "end",
                  minWidth: 0,
                }}
              >
                <Button
                  leftSection={
                    loading ? (
                      <Loader size={16} color="white" />
                    ) : (
                      <IconSearch size={16} />
                    )
                  }
                  onClick={() => loadThongKeData()}
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
            <Grid.Col span={{ base: 12, md: 8 }}>
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
                  {t("top10InOut")}
                </Text>
                <div style={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
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
                        labelFormatter={(value) => `Mã số: ${value}`}
                      />

                      <Bar
                        dataKey="Lượt vào"
                        name={t("inbound")}
                        fill="#1f5ca9"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={34}
                      />

                      <Bar
                        dataKey="Lượt ra"
                        name={t("outbound")}
                        fill="#00afef"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={34}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <CustomChartLegend
                  inboundLabel={t("inbound")}
                  outboundLabel={t("outbound")}
                />
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
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
                  {t("distByStatus")}
                </Text>
                <div
                  style={{
                    height: 300,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
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
                          const COLORS = [
                            "#1f5ca9",
                            "#00afef",
                            "#10b981",
                            "#f59e0b",
                            "#ef4444",
                            "#8b5cf6",
                            "#6366f1",
                            "#ec4899",
                            "#14b8a6",
                            "#f43f5e",
                          ];
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <Group gap="sm" mt="md" justify="center" wrap="wrap">
                    {pieData.map((entry, index) => {
                      const COLORS = [
                        "#1f5ca9",
                        "#00afef",
                        "#10b981",
                        "#f59e0b",
                        "#ef4444",
                        "#8b5cf6",
                        "#6366f1",
                        "#ec4899",
                        "#14b8a6",
                        "#f43f5e",
                      ];
                      const color = COLORS[index % COLORS.length];
                      const pct =
                        totalStatusCount > 0
                          ? Math.round((entry.value / totalStatusCount) * 100)
                          : 0;
                      return (
                        <Group gap="xs" key={entry.name}>
                          <Box
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              backgroundColor: color,
                            }}
                          />
                          <Text size="xs" fw={500}>
                            {getTranslatedStatus(entry.name)} ({pct}%)
                          </Text>
                        </Group>
                      );
                    })}
                  </Group>
                </div>
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
                {t("studentTableTitle")}
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
                      {t("role")}
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: "#475569",
                        fontWeight: 600,
                        fontSize: "12px",
                      }}
                    >
                      {t("avatar")}
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
                        textAlign: "center",
                      }}
                    >
                      {t("inbound")}
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: "#475569",
                        fontWeight: 600,
                        fontSize: "12px",
                        textAlign: "center",
                      }}
                    >
                      {t("outbound")}
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: "#475569",
                        fontWeight: 600,
                        fontSize: "12px",
                        textAlign: "center",
                      }}
                    >
                      {t("totalScans")}
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
                  {paginatedOverview.map((row, index) => {
                    const isSelected =
                      selectedStudent?.studentId === row.studentId;
                    const roleTxt =
                      row.maNhom === "Sinh viên"
                        ? t("roleStudent")
                        : row.maNhom === "Cán bộ"
                          ? t("roleStaff")
                          : row.maNhom;
                    return (
                      <Table.Tr
                        key={row.studentId || index}
                        onClick={() => handleStatClick(row, "Tất cả")}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          backgroundColor: isSelected
                            ? "#f0f7ff"
                            : "transparent",
                          cursor: "pointer",
                        }}
                      >
                        <Table.Td
                          style={{ fontSize: "13px", color: "#64748b" }}
                        >
                          {(overviewPage - 1) * overviewPageSize + index + 1}
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
                        <Table.Td
                          style={{ fontSize: "13px", color: "#475569" }}
                        >
                          {roleTxt}
                        </Table.Td>
                        <Table.Td>
                          <SafeAvatar
                            src={row.avatarUrl}
                            fallback={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(row.studentId)}`}
                            radius="sm"
                            size="md"
                            alt={row.hoTen}
                          />
                        </Table.Td>
                        <Table.Td
                          style={{ fontSize: "13px", color: "#475569" }}
                        >
                          {getTranslatedKhu(row.khu)}
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          <Anchor
                            component="button"
                            fw={700}
                            c="#0369A1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatClick(row, "Vào");
                            }}
                            style={{
                              fontSize: "13px",
                              textDecoration:
                                isSelected && detailType === "Vào"
                                  ? "underline"
                                  : "none",
                            }}
                          >
                            {row.luotVao}
                          </Anchor>
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          <Anchor
                            component="button"
                            fw={700}
                            c="#B91C1C"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatClick(row, "Ra");
                            }}
                            style={{
                              fontSize: "13px",
                              textDecoration:
                                isSelected && detailType === "Ra"
                                  ? "underline"
                                  : "none",
                            }}
                          >
                            {row.luotRa}
                          </Anchor>
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          <Anchor
                            component="button"
                            fw={700}
                            c="#1A52C5"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatClick(row, "Tất cả");
                            }}
                            style={{
                              fontSize: "13px",
                              textDecoration:
                                isSelected && detailType === "Tất cả"
                                  ? "underline"
                                  : "none",
                            }}
                          >
                            {row.tongLuot}
                          </Anchor>
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          <Badge
                            color={row.trangThai === "Hợp lệ" ? "blue" : "red"}
                            variant="light"
                            size="xs"
                          >
                            {getTranslatedStatus(row.trangThai)}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                  {filteredOverview.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={10}>
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
              totalItems={filteredOverview.length}
              totalPages={totalOverviewPages}
              page={overviewPage}
              pageSize={overviewPageSize}
              setPage={setOverviewPage}
              setPageSize={setOverviewPageSize}
            />
          </Card>

          <Drawer
            opened={selectedStudent !== null}
            onClose={() => {
              setSelectedStudent(null);
              setDetailType(null);
            }}
            position="right"
            size="xl"
            padding="lg"
            title={<Title c="#0f172a">Chi tiết lịch sử ra vào</Title>}
            styles={{
              header: {
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "12px",
              },
            }}
          >
            {selectedStudent && (
              <Card
                withBorder={false}
                radius="lg"
                p="lg"
                style={{
                  // boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                  marginTop: 20,
                }}
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
                    {selectedStudent.hoTen.toUpperCase()} (
                    {selectedStudent.studentId})
                    {detailType &&
                      ` - ${t("detailTypeFilter").toUpperCase()}: ${detailType === "Vào" ? t("in").toUpperCase() : detailType === "Ra" ? t("out").toUpperCase() : t("all").toUpperCase()}`}
                  </Text>
                  {/* <Button
                    variant="subtle"
                    color="red"
                    size="xs"
                    onClick={() => {
                      setSelectedStudent(null);
                      setDetailType(null);
                    }}
                    style={{ fontFamily: "var(--font-readex-pro), sans-serif" }}
                  >
                    {t("closeDetail")}
                  </Button> */}
                </Group>

                <ScrollArea>
                  <Table
                    // verticalSpacing="sm"
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
                          {t("time")}
                        </Table.Th>
                        <Table.Th
                          style={{
                            color: "#475569",
                            fontWeight: 600,
                            fontSize: "12px",
                            textAlign: "center",
                          }}
                        >
                          {t("type")}
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
                          {t("room")} / {t("detectPosition")}
                        </Table.Th>
                        <Table.Th
                          style={{
                            color: "#475569",
                            fontWeight: 600,
                            fontSize: "12px",
                            textAlign: "center",
                          }}
                        >
                          {t("status")} / Camera
                        </Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {paginatedHistory.map((detail, index) => (
                        <Table.Tr
                          key={index}
                          style={{ borderBottom: "1px solid #f1f5f9" }}
                        >
                          <Table.Td
                            style={{ fontSize: "13px", color: "#64748b" }}
                          >
                            {(historyPage - 1) * historyPageSize + index + 1}
                          </Table.Td>
                          <Table.Td
                            style={{
                              fontSize: "13px",
                              color: "#1e293b",
                              fontWeight: 500,
                            }}
                          >
                            {detail.time}
                          </Table.Td>
                          <Table.Td style={{ textAlign: "center" }}>
                            <Badge
                              color={detail.type === "Vào" ? "blue" : "orange"}
                              size="sm"
                              radius="md"
                            >
                              {getTranslatedActionOrStatus(detail.type)}
                            </Badge>
                          </Table.Td>
                          <Table.Td
                            style={{ fontSize: "13px", color: "#475569" }}
                          >
                            {getTranslatedKhu(detail.ktx)}
                          </Table.Td>
                          <Table.Td
                            style={{ fontSize: "13px", color: "#475569" }}
                          >
                            {detail.room}
                          </Table.Td>
                          <Table.Td style={{ textAlign: "center" }}>
                            <Badge
                              color={
                                String(detail.status)
                                  .toLowerCase()
                                  .includes("vào") ||
                                String(detail.status)
                                  .toLowerCase()
                                  .includes("ra") ||
                                detail.status === "Hợp lệ" ||
                                String(detail.status)
                                  .toLowerCase()
                                  .includes("ghi nhận")
                                  ? "green"
                                  : "red"
                              }
                              variant="light"
                              size="sm"
                            >
                              {getTranslatedActionOrStatus(detail.status)}
                            </Badge>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                      {filteredHistoryList.length === 0 && (
                        <Table.Tr>
                          <Table.Td colSpan={6}>
                            <Text ta="center" c="dimmed" py="xl">
                              {t("detailTableNoData")}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      )}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>

                <CustomPagination
                  totalItems={filteredHistoryList.length}
                  totalPages={totalHistoryPages}
                  page={historyPage}
                  pageSize={historyPageSize}
                  setPage={setHistoryPage}
                  setPageSize={setHistoryPageSize}
                />
              </Card>
            )}
          </Drawer>
        </>
      )}

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={
          <Text
            fw={800}
            size="lg"
            c="#1f5ca9"
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontFamily: "var(--font-readex-pro), sans-serif",
            }}
          >
            {t("addModalTitle")}
          </Text>
        }
        centered
        radius="lg"
        size="lg"
        padding="xl"
        styles={{
          header: { borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" },
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFormSubmit();
          }}
        >
          <Grid gutter="md" mt="sm">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label={t("studentId")}
                placeholder={t("enterMssv")}
                required
                value={formMssv}
                onChange={(e) => handleMssvChange(e.currentTarget.value)}
                styles={{
                  label: {
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "#1e293b",
                    marginBottom: "4px",
                  },
                  input: { borderRadius: "8px", height: "40px" },
                }}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label={t("fullName")}
                placeholder={t("enterFullName")}
                value={formHoTen}
                onChange={(e) => setFormHoTen(e.currentTarget.value)}
                styles={{
                  label: {
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "#1e293b",
                    marginBottom: "4px",
                  },
                  input: { borderRadius: "8px", height: "40px" },
                }}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label={t("dormZone")}
                placeholder={t("selectDormZone")}
                required
                value={formKhuKtx}
                onChange={(val) => setFormKhuKtx(val || "")}
                data={[
                  { value: "Khu A", label: t("dormA") },
                  { value: "Khu B", label: t("dormB") },
                ]}
                styles={{
                  label: {
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "#1e293b",
                    marginBottom: "4px",
                  },
                  input: { borderRadius: "8px", height: "40px" },
                }}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label={t("room")}
                placeholder={t("selectRoom")}
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
                  label: {
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "#1e293b",
                    marginBottom: "4px",
                  },
                  input: { borderRadius: "8px", height: "40px" },
                }}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Radio.Group
                label={t("type")}
                required
                value={formLoai}
                onChange={setFormLoai}
                styles={{
                  label: {
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "#1e293b",
                    marginBottom: "8px",
                  },
                }}
              >
                <Group gap="xl" style={{ height: "40px" }}>
                  <Radio
                    value="Vào"
                    label={t("in")}
                    color="blue"
                    styles={{ label: { fontWeight: 500 } }}
                  />
                  <Radio
                    value="Ra"
                    label={t("out")}
                    color="blue"
                    styles={{ label: { fontWeight: 500 } }}
                  />
                </Group>
              </Radio.Group>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label={t("time")}
                type="datetime-local"
                required
                value={formThoiGian}
                onChange={(e) => setFormThoiGian(e.currentTarget.value)}
                styles={{
                  label: {
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "#1e293b",
                    marginBottom: "4px",
                  },
                  input: { borderRadius: "8px", height: "40px" },
                }}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Textarea
                label={t("note")}
                placeholder={t("enterNote")}
                value={formGhiChu}
                onChange={(e) => setFormGhiChu(e.currentTarget.value)}
                rows={2}
                styles={{
                  label: {
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "#1e293b",
                    marginBottom: "4px",
                  },
                  input: { borderRadius: "8px" },
                }}
              />
            </Grid.Col>
          </Grid>

          <Group justify="flex-end" mt="xl" gap="md">
            <Button
              variant="outline"
              color="gray"
              onClick={() => setModalOpened(false)}
              style={{
                width: 120,
                borderRadius: "8px",
                fontWeight: 600,
                height: "40px",
              }}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              style={{
                width: 120,
                borderRadius: "8px",
                backgroundColor: "#1f5ca9",
                fontWeight: 600,
                height: "40px",
              }}
            >
              {t("submit")}
            </Button>
          </Group>
        </form>
      </Modal>

      <style jsx>{`
        .inout-compact-filter__field {
          min-width: 0;
        }

        .inout-compact-filter__field :global(.mantine-DateInput-input) {
          min-width: 0;
        }

        .inout-compact-filter__control {
          min-width: 0;
        }

        .inout-compact-filter__toggle {
          display: flex;
          justify-content: flex-end;
          align-items: end;
        }

        .inout-advanced-filter__grid > :global(*) {
          min-width: 0;
        }

        .inout-advanced-filter__grid {
          min-width: 0;
        }

        .inout-advanced-filter__span-2 {
          grid-column: span 2;
          min-width: 0;
        }

        .inout-advanced-filter__span-3 {
          grid-column: span 3;
          min-width: 0;
        }

        .inout-advanced-filter__actions {
          justify-content: flex-end;
        }

        @media (max-width: 1180px) {
          .inout-compact-filter {
            gap: 8px !important;
            grid-template-columns:
              minmax(95px, 1fr)
              minmax(95px, 1fr)
              max-content
              max-content
              max-content
              max-content
              40px !important;
          }

          .inout-compact-filter__control :global(.mantine-Button-root) {
            min-width: 0 !important;
            padding-left: 12px;
            padding-right: 12px;
          }

          .inout-advanced-filter__grid {
            grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
          }

          .inout-advanced-filter__actions {
            grid-column: span 6 !important;
            justify-content: flex-start;
          }
        }

        @media (max-width: 980px) {
          .inout-advanced-filter__grid {
            grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
          }

          .inout-advanced-filter__span-2,
          .inout-advanced-filter__span-3 {
            grid-column: span 2;
          }

          .inout-advanced-filter__actions {
            grid-column: span 6 !important;
            justify-content: flex-start;
          }
        }

        @media (max-width: 768px) {
          .inout-advanced-filter__grid {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          }

          .inout-advanced-filter__span-2,
          .inout-advanced-filter__span-3 {
            grid-column: span 2;
          }

          .inout-advanced-filter__actions {
            grid-column: span 4 !important;
            width: 100%;
          }

          .inout-advanced-filter__actions :global(.mantine-Button-root),
          .inout-advanced-filter__actions :global(.mantine-ActionIcon-root) {
            flex: 1 1 calc(50% - 8px);
          }

          .inout-advanced-filter__actions :global(.mantine-ActionIcon-root) {
            min-width: 40px;
          }
        }

        @media (max-width: 520px) {
          .inout-advanced-filter__grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .inout-advanced-filter__span-2,
          .inout-advanced-filter__span-3 {
            grid-column: span 1;
          }

          .inout-advanced-filter__actions :global(.mantine-Button-root),
          .inout-advanced-filter__actions :global(.mantine-ActionIcon-root) {
            flex-basis: 100%;
          }
        }
      `}</style>
    </Stack>
  );
}
