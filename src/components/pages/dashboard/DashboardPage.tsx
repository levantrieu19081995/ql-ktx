"use client";

import React, { useEffect, useState } from "react";
import {
  Stack,
  Title,
  Grid,
  Loader,
  Center,
  Group,
  Select,
  Card,
  Text,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useTranslations } from "next-intl";
import dayjs from "dayjs";
import QuickStatsCards from "./QuickStatsCards";
import Reveal from "./Reveal";
import RecentHistoryTable from "./RecentHistoryTable";
import TimeInOutChart from "./TimeInOutChart";
import TopStudentsChart from "./TopStudentsChart";
import KtxInOutChart from "./KtxInOutChart";
import KtxDistributionChart from "./KtxDistributionChart";
import StrangerDetectionChart from "./StrangerDetectionChart";
import IntrusionAlertsChart from "./IntrusionAlertsChart";

import {
  fetchSinhVienPaginate,
  fetchKhuPaginate,
  fetchThongKeSvBiCamNoPhi,
  fetchSinhVienCamPaginate,
  fetchLichSuRaVaoTheoNgay,
  fetchThongKeNguoiLa,
} from "@/services/dashboard/dashboardService";

import {
  QuickStat,
  TimeChartData,
  StrangerDetection,
  KtxInOutData,
  InOutHistory,
  KtxDistribution,
  IntrusionAlert,
  StudentActivity,
  INITIAL_QUICK_STATS,
} from "./dashboardTypes";
import { IconReportAnalytics } from "@tabler/icons-react";
import PageSectionHeader from "@/components/common/PageSectionHeader";

// Bộ nhớ tạm lịch sử ra vào theo ngày (sống suốt phiên làm việc của trang).
const boNhoLichSuNgay = new Map<string, { t: number; items: any[] }>();
const BO_NHO_NGAY_CU_MS = 10 * 60 * 1000; // ngày đã qua: ít thay đổi
const BO_NHO_HOM_NAY_MS = 60 * 1000; // hôm nay: dữ liệu còn mới liên tục

// BE trả bản ghi lịch sử với tên trường mới (timeCheck, direction, peopleId...).
// Chuẩn hóa về tên trường cũ (timecheck, cameraIdId, maso) để mọi phần phía sau dùng chung.
const chuanHoaLuotRaVao = (item: any) => {
  if (!item) return item;
  const huong = String(item.direction ?? "").toLowerCase();
  return {
    ...item,
    timecheck: item.timecheck ?? item.timeCheck,
    maso: item.maso ?? item.peopleId,
    cameraIdId:
      huong === "in" ? 1 : huong === "out" ? 2 : item.cameraIdId,
  };
};

// Đọc thời điểm của một lượt ra vào: hỗ trợ giây, mili-giây, hoặc chuỗi ngày giờ.
const docThoiGianLuot = (item: any): Date | null => {
  const raw =
    item?.timeCheck ?? item?.timecheck ?? item?.time ?? item?.checkTime ?? item?.thoiGian ?? null;
  if (raw === null || raw === undefined || raw === "") return null;
  let d: Date;
  if (typeof raw === "number" || /^\d+(\.\d+)?$/.test(String(raw))) {
    const n = Number(raw);
    d = new Date(n < 1e11 ? n * 1000 : n);
  } else {
    const p = dayjs(String(raw), [
      "YYYY-MM-DD HH:mm:ss",
      "DD/MM/YYYY HH:mm:ss",
      "YYYY-MM-DDTHH:mm:ss",
    ]);
    d = p.isValid() ? p.toDate() : new Date(String(raw));
  }
  return Number.isNaN(d.getTime()) ? null : d;
};

export default function DashboardPage() {
  const t = useTranslations("Dashboard");

  const [stats, setStats] = useState<QuickStat[]>(INITIAL_QUICK_STATS);
  const [timeData, setTimeData] = useState<TimeChartData[]>([]);
  const [strangerData, setStrangerData] = useState<StrangerDetection[]>([]);
  const [ktxInOutData, setKtxInOutData] = useState<KtxInOutData[]>([]);
  const [historyData, setHistoryData] = useState<InOutHistory[]>([]);
  const [ktxDistributionData, setKtxDistributionData] = useState<
    KtxDistribution[]
  >([]);
  const [intrusionData, setIntrusionData] = useState<IntrusionAlert[]>([]);
  const [intrusionFilterType, setIntrusionFilterType] = useState<
    "area" | "time"
  >("area");
  const [topStudentsData, setTopStudentsData] = useState<StudentActivity[]>([]);

  const [timeChartFromDate, setTimeChartFromDate] = useState<Date | null>(
    dayjs().subtract(6, "day").startOf("day").toDate(),
  );
  const [timeChartToDate, setTimeChartToDate] = useState<Date | null>(
    new Date(),
  );

  const mocMo = React.useRef(Date.now()).current;
  const [dangTaiLanDau, setDangTaiLanDau] = useState(true);
  const [dangTaiKhoang, setDangTaiKhoang] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [rawStatsRes, setRawStatsRes] = useState<any>(null);
  const [rawStrangerStats, setRawStrangerStats] = useState<any[]>([]);
  const [rawTotalBanned, setRawTotalBanned] = useState<number>(0);
  const [rawZoneBannedCount, setRawZoneBannedCount] = useState<{
    [key: string]: number;
  }>({});
  const [rawTotalStudents, setRawTotalStudents] = useState<number>(0);
  const [rawZones, setRawZones] = useState<any[]>([]);
  const [rawZoneStudentCount, setRawZoneStudentCount] = useState<{
    [key: string]: number;
  }>({});
  const [rawStudentCache, setRawStudentCache] = useState<{
    [key: string]: { tenKhu: string; tenPhong: string };
  }>({});
  const [rawHistoryItems, setRawHistoryItems] = useState<any[]>([]);

  const normalizeDateInputValue = (value: unknown): Date | null => {
    if (!value) return null;
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }

    const parsed = new Date(value as string | number);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const formatDateForApi = (value: Date | null, fallback: Date) => {
    const target = value && !isNaN(value.getTime()) ? value : fallback;
    return dayjs(target).format("MM/DD/YYYY");
  };

  // 1. Initial fetch of all raw data once on mount
  useEffect(() => {
    let active = true;

    async function fetchAllRawData() {
      // Ba request độc lập: khởi chạy cùng lúc thay vì chờ từng cái.
      const svP = fetchSinhVienPaginate({
        page: "1",
        pageSize: "10000",
        maKhu: "-1",
        maPhong: "-1",
      });
      const khuP = fetchKhuPaginate({ page: "1", pageSize: "100", maKhu: "-1" });
      const bannedP = fetchSinhVienCamPaginate({
        page: "1",
        pageSize: "100",
        maSinhVien: "-1",
      });
      // tránh cảnh báo unhandled rejection; lỗi vẫn được bắt khi await bên dưới
      [svP, khuP, bannedP].forEach((p) => p.catch(() => undefined));
      try {
        // Preload ALL students to build a complete local cache mapping maSinhVien -> { tenKhu, tenPhong }
        const studentCache: {
          [key: string]: { tenKhu: string; tenPhong: string };
        } = {};
        const zoneStudentCount: { [key: string]: number } = {};
        let totalStudents = 0;
        try {
          const allSvRes = await svP;
          const svList = allSvRes?.payload?.items || [];
          totalStudents =
            allSvRes?.payload?.totalElements ??
            allSvRes?.payload?.items?.length ??
            0;
          svList.forEach((sv: any) => {
            if (sv.maSinhVien) {
              const tenKhu =
                sv.tenKhu || (sv.maKhu ? `Khu ${sv.maKhu}` : "Khu A");
              const tenPhong = sv.maPhong || sv.tenPhong || "Chưa rõ";
              studentCache[sv.maSinhVien] = { tenKhu, tenPhong };
              zoneStudentCount[tenKhu] = (zoneStudentCount[tenKhu] || 0) + 1;
            }
          });
        } catch (e) {
          console.error("Failed to preload all students for cache:", e);
        }
        if (active) setRawTotalStudents(totalStudents);
        if (active) setRawZoneStudentCount(zoneStudentCount);

        // Fetch zones list
        let zones: any[] = [];
        try {
          const khuRes = await khuP;
          if (khuRes && khuRes.payload && Array.isArray(khuRes.payload.items)) {
            zones = khuRes.payload.items;
          }
        } catch (e) {
          console.error("Failed to fetch Khu pagination data", e);
        }
        if (active) setRawZones(zones);

        // Fetch Banned Students count & zones (preloaded from studentCache)
        let totalBanned = 0;
        const zoneBannedCount: { [key: string]: number } = {};
        try {
          const bannedRes = await bannedP;
          if (bannedRes && bannedRes.payload) {
            totalBanned = bannedRes.payload.totalElements ?? 0;
            const bannedItems = bannedRes.payload.items ?? [];
            bannedItems.forEach((item: any) => {
              const cached = studentCache[item.maSinhVien];
              const zoneName = cached?.tenKhu || "Khu A";
              zoneBannedCount[zoneName] = (zoneBannedCount[zoneName] || 0) + 1;
            });
          }
        } catch (e) {
          console.error("Failed to fetch banned student pagination data", e);
        }
        if (active) {
          setRawTotalBanned(totalBanned);
          setRawZoneBannedCount(zoneBannedCount);
        }

        if (active) {
          setRawStudentCache(studentCache);
        }
      } catch (err) {
        console.error("Error fetching raw dashboard data:", err);
      }
    }

    fetchAllRawData();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function fetchRangeRawData() {
      setDangTaiKhoang(true);
      try {
        const defaultTo = new Date();
        const defaultFrom = dayjs(defaultTo).subtract(6, "day").toDate();
        const tuNgay = formatDateForApi(timeChartFromDate, defaultFrom);
        const denNgay = formatDateForApi(timeChartToDate, defaultTo);

        // Ba nguồn dữ liệu độc lập nên chạy đồng thời (trước đây chạy nối đuôi nhau).
        const taiNguoiLa = async (): Promise<any[]> => {
          try {
            const res = await fetchThongKeNguoiLa({ tuNgay, denNgay, maKhu: "-1" });
            return Array.isArray(res?.payload) ? res.payload : [];
          } catch (e) {
            console.error("Failed to fetch Stranger statistics data", e);
            return [];
          }
        };

        const taiThongKe = async (): Promise<any> => {
          try {
            return await fetchThongKeSvBiCamNoPhi({ tuNgay, denNgay });
          } catch (error) {
            console.error("Failed to load top students statistics:", error);
            return null;
          }
        };

        // Lịch sử ra vào: API chỉ nhận một ngày nên gọi cho từng ngày (tối đa 31 ngày gần nhất).
        // Kết quả được nhớ tạm theo ngày để đổi khoảng ngày không phải tải lại phần đã có.
        const taiLichSu = async (): Promise<any[]> => {
          try {
            const batDau = dayjs(timeChartFromDate ?? defaultFrom).startOf("day");
            const ketThuc = dayjs(timeChartToDate ?? defaultTo).startOf("day");
            const tongNgay = Math.max(1, ketThuc.diff(batDau, "day") + 1);
            const soNgay = Math.min(tongNgay, 31);
            const homNay = dayjs().startOf("day");
            const ketQua = await Promise.all(
              Array.from({ length: soNgay }, (_, i) => {
                const d = ketThuc.subtract(i, "day");
                const ngay = d.format("MM/DD/YYYY");
                const ttl = d.isSame(homNay, "day")
                  ? BO_NHO_HOM_NAY_MS
                  : BO_NHO_NGAY_CU_MS;
                const daCo = boNhoLichSuNgay.get(ngay);
                if (daCo && Date.now() - daCo.t < ttl) {
                  return Promise.resolve(daCo.items);
                }
                return fetchLichSuRaVaoTheoNgay({
                  page: 1,
                  pageSize: 1000,
                  ngay,
                  maKhu: "-1",
                  maNhom: "-1",
                  keyword: "",
                }).then((result) => {
                  if (!result) return [] as any[]; // lỗi: không nhớ tạm
                  const items: any[] = (
                    result.payload?.items ??
                    result.payload?.content ??
                    (Array.isArray(result.payload) ? result.payload : [])
                  ).map(chuanHoaLuotRaVao);
                  boNhoLichSuNgay.set(ngay, { t: Date.now(), items });
                  return items;
                });
              }),
            );
            return ketQua.flat();
          } catch (e) {
            console.error("Failed to fetch lich su ra vao:", e);
            return [];
          }
        };

        const [strangerStats, statsRes, historyItems] = await Promise.all([
          taiNguoiLa(),
          taiThongKe(),
          taiLichSu(),
        ]);

        if (active) {
          setRawStrangerStats(strangerStats);
          setRawStatsRes(statsRes);
          setRawHistoryItems(historyItems);
        }
      } catch (err) {
        console.error("Error fetching dashboard range data:", err);
      } finally {
        if (active) {
          setDangTaiKhoang(false);
          setDangTaiLanDau(false);
        }
      }
    }

    fetchRangeRawData();
    return () => {
      active = false;
    };
  }, [timeChartFromDate, timeChartToDate]);

  // 2. Client-side dynamic filtering & grouping whenever dependencies change
  useEffect(() => {

    // Detect max date in dataset
    let maxDate = new Date();
    let foundMax = false;

    if (rawStatsRes && Array.isArray(rawStatsRes.payload)) {
      rawStatsRes.payload.forEach((studentItem: any) => {
        const scans = studentItem.danhSachTatCa ?? [
          ...(studentItem.danhSachVao || []),
          ...(studentItem.danhSachRa || []),
        ];
        if (Array.isArray(scans)) {
          scans.forEach((scan: any) => {
            if (scan.timecheck) {
              const d = new Date(scan.timecheck * 1000);
              if (!foundMax || d > maxDate) {
                maxDate = d;
                foundMax = true;
              }
            }
          });
        }
      });
    }

    if (!foundMax && rawStrangerStats.length > 0) {
      rawStrangerStats.forEach((item: any) => {
        const parts = (item.ngay || "").split("/");
        if (parts.length === 3) {
          const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          if (!isNaN(d.getTime())) {
            if (!foundMax || d > maxDate) {
              maxDate = d;
              foundMax = true;
            }
          }
        }
      });
    }

    // Filter helper
    const isMatchFilter = (d: Date) => {
      if (filterType === "all") return true;
      if (!foundMax) return true;

      if (filterType === "week") {
        const diffTime = maxDate.getTime() - d.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }

      if (filterType === "month") {
        return (
          d.getMonth() === maxDate.getMonth() &&
          d.getFullYear() === maxDate.getFullYear()
        );
      }

      return true;
    };

    // Filter statsItems and count debt students
    let totalDebt = 0;
    const zoneDebtCount: { [key: string]: number } = {};

    if (rawStatsRes && Array.isArray(rawStatsRes.payload)) {
      const uniqueDebtSv = new Set<string>();

      rawStatsRes.payload.forEach((studentItem: any) => {
        const isDebt =
          studentItem.tongSoLanNoPhi > 0 ||
          (studentItem.danhSachNoPhi && studentItem.danhSachNoPhi.length > 0);
        if (isDebt) {
          const code =
            studentItem.maSinhVien || studentItem.maSo || studentItem.maso;
          if (code) {
            uniqueDebtSv.add(code);
            const cached = rawStudentCache[code] || {};
            const rawKhu =
              cached.tenKhu ||
              studentItem.tenKhu ||
              (studentItem.maKhu ? `Khu ${studentItem.maKhu}` : null) ||
              "Khu A";
            zoneDebtCount[rawKhu] = (zoneDebtCount[rawKhu] || 0) + 1;
          }
        }
      });

      totalDebt = uniqueDebtSv.size;
    }

    // Map Top Students Chart directly from preloaded history data
    const topStudentCounts: {
      [key: string]: { count: number; name: string; studentId: string };
    } = {};
    rawHistoryItems.forEach((item: any) => {
      const d = docThoiGianLuot(item);
      const studentId =
        item.maso || item.maSinhVien || item.studentId || item.maSo;
      if (!d || !studentId) return;
      if (!isMatchFilter(d)) return;

      const current = topStudentCounts[studentId] || {
        count: 0,
        name: item.hoten || item.hoTen || item.fullName || String(studentId),
        studentId: String(studentId),
      };
      current.count += 1;
      topStudentCounts[studentId] = current;
    });

    const mappedTopStudents = Object.values(topStudentCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((item) => ({
        name: item.name || "Ẩn danh",
        studentId: item.studentId,
        displayLabel: `${item.name || "Ẩn danh"} - ${item.studentId}`,
        count: item.count,
      }));
    setTopStudentsData(mappedTopStudents);

    // Filter stranger stats by dynamic date filter
    const filteredStrangers = rawStrangerStats.filter((item: any) => {
      const parts = (item.ngay || "").split("/");
      if (parts.length === 3) {
        const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        if (!isNaN(d.getTime())) {
          return isMatchFilter(d);
        }
      }
      return true;
    });
    const strangerVal = filteredStrangers.reduce(
      (acc: number, curr: any) => acc + (curr.soLuong || 0),
      0,
    );

    // Map Stranger Detection Line Chart using pre-grouped stats
    const groupedStrangers = filteredStrangers.map((item: any) => {
      let dateLabel = item.ngay || "";
      if (dateLabel.length >= 5) {
        const parts = dateLabel.split("/");
        if (parts.length >= 2) {
          dateLabel = `${parts[0]}/${parts[1]}`;
        }
      }
      return {
        date: dateLabel,
        count: item.soLuong || 0,
      };
    });
    groupedStrangers.sort((a, b) => {
      const [da, ma] = a.date.split("/").map(Number);
      const [db, mb] = b.date.split("/").map(Number);
      return ma !== mb ? ma - mb : da - db;
    });
    setStrangerData(groupedStrangers);

    // Map Intrusion Alerts Chart (Only if filter type is area)
    if (intrusionFilterType === "area") {
      const combinedZoneCounts: { [key: string]: number } = {};
      Object.keys(rawZoneBannedCount).forEach((zone) => {
        combinedZoneCounts[zone] =
          (combinedZoneCounts[zone] || 0) + rawZoneBannedCount[zone];
      });
      Object.keys(zoneDebtCount).forEach((zone) => {
        combinedZoneCounts[zone] =
          (combinedZoneCounts[zone] || 0) + zoneDebtCount[zone];
      });

      const colorsAlerts = [
        "#e03131",
        "#f03e3e",
        "#fa5252",
        "#ff6b6b",
        "#ff8787",
      ];
      const mappedIntrusions = Object.keys(combinedZoneCounts).map(
        (name, idx) => ({
          label: name,
          count: combinedZoneCounts[name],
          color: colorsAlerts[idx % colorsAlerts.length],
        }),
      );
      setIntrusionData(mappedIntrusions);
    }

    // Map Check-in/out History List - dĂ¹ng trá»±c tiáº¿p tá»« API lá»‹ch sá»­ ra vĂ o
    if (rawHistoryItems.length > 0) {
      const historyList = rawHistoryItems.map((item: any) => {
        const studentIdVal =
          item.maso || item.maSinhVien || item.studentId || "N/A";
        const cached = rawStudentCache[studentIdVal];
        const nhom = String(item.tennhom || "").toLowerCase();
        const isStudent =
          nhom.includes("sinh viên") ||
          nhom.includes("sinhvien") ||
          (!nhom.includes("cán bộ") &&
            !nhom.includes("can bo") &&
            !nhom.includes("người lạ") &&
            !nhom.includes("nguoi la") &&
            studentIdVal.startsWith("B"));

        let resolvedKhu = "KTX";
        let resolvedPhong = "Chưa rõ";

        if (isStudent) {
          resolvedKhu =
            cached?.tenKhu ||
            item.tenKhu ||
            item.khu ||
            (item.maKhu ? `Khu ${item.maKhu}` : "KTX");
          resolvedPhong =
            cached?.tenPhong ||
            item.tenPhong ||
            item.phong ||
            (item.maPhong ? `Phòng ${item.maPhong}` : "Chưa rõ");
        } else {
          // Cán bộ hoặc người lạ không có thông tin phòng KTX
          resolvedKhu =
            item.tenKhu ||
            item.khu ||
            (item.maKhu ? `Khu ${item.maKhu}` : "KTX");
          resolvedPhong = "-";
        }

        return {
          timecheck: item.timecheck || item.thoiGian || item.checkTime,
          maSinhVien: studentIdVal,
          hoTen: item.hoten || item.hoTen || item.fullName || "Ẩn danh",
          avatarUrl:
            item.pathImage ||
            item.pathimage ||
            item.imageUrl ||
            item.avatar ||
            null,
          cameraName: item.cameraName || item.loai || item.action || "",
          cameraIdId: item.cameraIdId, // Truyá»n qua Ä‘á»ƒ mapSuKienRaVao dĂ¹ng sá»‘ phĂ¢n loáº¡i chĂ­nh xĂ¡c
          tenKhu: resolvedKhu,
          maPhong: resolvedPhong,
        };
      });
      historyList.sort((a: any, b: any) => {
        const ta =
          typeof a.timecheck === "number"
            ? a.timecheck
            : new Date(a.timecheck).getTime() / 1000;
        const tb =
          typeof b.timecheck === "number"
            ? b.timecheck
            : new Date(b.timecheck).getTime() / 1000;
        return tb - ta;
      });
      setHistoryData(mapSuKienRaVao(historyList));
    }

    // Map Time In/Out Chart & KTX In/Out Chart
    const hourlyGroups: { [key: string]: { vao: number; ra: number } } = {};
    const hourBuckets = [
      "0h",
      "2h",
      "4h",
      "6h",
      "8h",
      "10h",
      "12h",
      "14h",
      "16h",
      "18h",
      "20h",
      "22h",
    ];
    hourBuckets.forEach((h) => {
      hourlyGroups[h] = { vao: 0, ra: 0 };
    });

    const activeFromDate =
      timeChartFromDate && !isNaN(timeChartFromDate.getTime())
        ? timeChartFromDate
        : dayjs().subtract(6, "day").toDate();
    const activeToDate =
      timeChartToDate && !isNaN(timeChartToDate.getTime())
        ? timeChartToDate
        : new Date();
    const rangeStart = new Date(activeFromDate);
    rangeStart.setHours(0, 0, 0, 0);
    const rangeEnd = new Date(activeToDate);
    rangeEnd.setHours(23, 59, 59, 999);
    const diffDays = Math.max(
      1,
      Math.ceil(
        (rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1,
    );
    const timeGrouping: "day" | "month" | "year" =
      diffDays <= 1 ? "day" : diffDays <= 31 ? "month" : "year";

    const dailyGroups: { [key: string]: { vao: number; ra: number } } = {};
    const monthlyGroups: { [key: string]: { vao: number; ra: number } } = {};
    const ktxGroups: { [key: string]: { vao: number; ra: number } } = {};

    let boQuaKhongGio = 0;
    let boQuaNgoaiKhoang = 0;
    rawHistoryItems.forEach((scan: any) => {
      const d = docThoiGianLuot(scan);
      if (!d) {
        boQuaKhongGio += 1;
        return;
      }
      if (!isMatchFilter(d)) return;
      if (d < rangeStart || d > rangeEnd) {
        boQuaNgoaiKhoang += 1;
        return;
      }

      const isVao =
        String(scan.cameraName || "")
          .toLowerCase()
          .includes("vào") ||
        scan.cameraIdId === 1 ||
        scan.cameraIdId === "1";
      const code = scan.maso || scan.maSinhVien || scan.studentId;
      const cached = rawStudentCache[code] || {};
      const rawKhu =
        cached.tenKhu ||
        scan.tenKhu ||
        (scan.maKhu ? `Khu ${scan.maKhu}` : null) ||
        "Khu A";

      if (!ktxGroups[rawKhu]) {
        ktxGroups[rawKhu] = { vao: 0, ra: 0 };
      }

      if (timeGrouping === "day") {
        const hour = d.getHours();
        const bucketIndex = Math.floor(hour / 2);
        const bucketLabel = hourBuckets[bucketIndex] || "0h";
        if (isVao) {
          hourlyGroups[bucketLabel].vao += 1;
        } else {
          hourlyGroups[bucketLabel].ra += 1;
        }
      } else if (timeGrouping === "month") {
        const dayLabel = dayjs(d).format("DD/MM");
        if (!dailyGroups[dayLabel]) {
          dailyGroups[dayLabel] = { vao: 0, ra: 0 };
        }
        if (isVao) {
          dailyGroups[dayLabel].vao += 1;
        } else {
          dailyGroups[dayLabel].ra += 1;
        }
      } else if (timeGrouping === "year") {
        const monthLabel = `T${d.getMonth() + 1}`;
        if (!monthlyGroups[monthLabel]) {
          monthlyGroups[monthLabel] = { vao: 0, ra: 0 };
        }
        if (isVao) {
          monthlyGroups[monthLabel].vao += 1;
        } else {
          monthlyGroups[monthLabel].ra += 1;
        }
      }

      if (isVao) {
        ktxGroups[rawKhu].vao += 1;
      } else {
        ktxGroups[rawKhu].ra += 1;
      }
    });

    if (rawHistoryItems.length > 0) {
      console.info("[Dashboard] lượt ra vào:", {
        tong: rawHistoryItems.length,
        boQuaKhongGio,
        boQuaNgoaiKhoang,
        khoang: [rangeStart.toISOString(), rangeEnd.toISOString()],
        mau: rawHistoryItems[0],
      });
    }

    if (timeGrouping === "day") {
      const mappedTimeData = hourBuckets.map((time) => ({
        time,
        vao: hourlyGroups[time].vao,
        ra: hourlyGroups[time].ra,
      }));
      setTimeData(mappedTimeData);
    } else if (timeGrouping === "month") {
      const sortedDays = Object.keys(dailyGroups).sort((a, b) => {
        const [da, ma] = a.split("/").map(Number);
        const [db, mb] = b.split("/").map(Number);
        return ma !== mb ? ma - mb : da - db;
      });
      const mappedTimeData = sortedDays.map((day) => ({
        time: day,
        vao: dailyGroups[day].vao,
        ra: dailyGroups[day].ra,
      }));
      setTimeData(mappedTimeData);
    } else if (timeGrouping === "year") {
      const sortedMonths = Object.keys(monthlyGroups).sort((a, b) => {
        const ma = Number(a.replace("T", ""));
        const mb = Number(b.replace("T", ""));
        return ma - mb;
      });
      const mappedTimeData = sortedMonths.map((month) => ({
        time: month,
        vao: monthlyGroups[month].vao,
        ra: monthlyGroups[month].ra,
      }));
      setTimeData(mappedTimeData);
    }

    const mappedKtxInOut = Object.keys(ktxGroups).map((name) => ({
      name,
      vao: ktxGroups[name].vao,
      ra: ktxGroups[name].ra,
    }));
    setKtxInOutData(mappedKtxInOut);
    // KTX Student Distribution Chart (Donut)
    const colorsDist = [
      "#4CAF50",
      "#1E88E5",
      "#FF9800",
      "#F44336",
      "#9C27B0",
      "#00BCD4",
    ];
    const zoneCounts = rawZones.length
      ? rawZones.map((zone: any) => {
          const khuMaVal = zone.khuMa ?? zone.maKhu;
          const khuTenVal = zone.khuTen ?? zone.tenKhu;
          const zoneName = khuTenVal || `Khu ${khuMaVal}`;
          return {
            name: zoneName,
            value: rawZoneStudentCount[zoneName] || 0,
          };
        })
      : Object.keys(rawZoneStudentCount).map((name) => ({
          name,
          value: rawZoneStudentCount[name] || 0,
        }));
    const sum = zoneCounts.reduce((acc, curr) => acc + curr.value, 0);
    const mappedDistribution = zoneCounts.map((item, idx) => ({
      name: item.name,
      value: item.value,
      percentage: sum > 0 ? Math.round((item.value / sum) * 1000) / 10 : 0,
      color: colorsDist[idx % colorsDist.length],
    }));
    setKtxDistributionData(mappedDistribution);
    // Map Stats Card
    const totalStudentsVal = rawTotalStudents;
    // Có mặt / ra ngoài: dựa trên lần quét CUỐI của từng sinh viên trong log vào/ra đã tải
    // (tính đến cuối khoảng ngày đang chọn). Sinh viên chưa có lần quét nào trong khoảng thì không tính vào hai số này.
    const lanQuetCuoi = new Map<string, { t: number; vao: boolean }>();
    const coDanhSachSv = Object.keys(rawStudentCache).length > 0;
    rawHistoryItems.forEach((scan: any) => {
      const ma = scan.maso || scan.maSinhVien || scan.studentId;
      if (!ma || (coDanhSachSv && !rawStudentCache[ma])) return; // chỉ tính sinh viên, bỏ cán bộ / người lạ
      const d = docThoiGianLuot(scan);
      if (!d) return;
      const huong = String(scan.direction ?? "").toLowerCase();
      const vao =
        huong === "in" ||
        (huong !== "out" &&
          (String(scan.cameraName || "").toLowerCase().includes("vào") ||
            scan.cameraIdId === 1 ||
            scan.cameraIdId === "1"));
      const truoc = lanQuetCuoi.get(ma);
      if (!truoc || d.getTime() > truoc.t) {
        lanQuetCuoi.set(ma, { t: d.getTime(), vao });
      }
    });
    let presentVal = 0;
    let outVal = 0;
    lanQuetCuoi.forEach((v) => {
      if (v.vao) presentVal += 1;
      else outVal += 1;
    });
    const debtVal = totalDebt;
    const bannedVal = rawTotalBanned;
    const strangerValMapped = strangerVal;

    const mappedStats: QuickStat[] = INITIAL_QUICK_STATS.map(
      (item: QuickStat) => {
        if (item.id === "total_sv") {
          return {
            ...item,
            value: totalStudentsVal.toLocaleString("vi-VN"),
            caption: "Tổng số sinh viên",
          };
        }
        if (item.id === "present") {
          const percent =
            totalStudentsVal > 0
              ? ((presentVal / totalStudentsVal) * 100).toFixed(1)
              : "0.0";
          return {
            ...item,
            value: presentVal.toLocaleString("vi-VN"),
            caption: `${percent.replace(".", ",")}% tổng số SV`,
          };
        }
        if (item.id === "out") {
          const percent =
            totalStudentsVal > 0
              ? ((outVal / totalStudentsVal) * 100).toFixed(1)
              : "0.0";
          return {
            ...item,
            value: outVal.toLocaleString("vi-VN"),
            caption: `${percent.replace(".", ",")}% tổng số SV`,
          };
        }
        if (item.id === "debt") {
          const percent =
            totalStudentsVal > 0
              ? ((debtVal / totalStudentsVal) * 100).toFixed(1)
              : "0.0";
          return {
            ...item,
            value: debtVal.toLocaleString("vi-VN"),
            caption: `${percent.replace(".", ",")}% tổng số SV`,
          };
        }
        if (item.id === "banned") {
          const percent =
            totalStudentsVal > 0
              ? ((bannedVal / totalStudentsVal) * 100).toFixed(1)
              : "0.0";
          return {
            ...item,
            value: bannedVal.toLocaleString("vi-VN"),
            caption: `${percent.replace(".", ",")}% tổng số SV`,
          };
        }
        if (item.id === "stranger") {
          return {
            ...item,
            value: strangerValMapped.toLocaleString("vi-VN"),
            caption: t("strangerChartSubtitle"),
          };
        }
        return item;
      },
    );
    setStats(mappedStats);
  }, [
    filterType,
    rawStatsRes,
    rawStrangerStats,
    rawTotalBanned,
    rawZoneBannedCount,
    rawTotalStudents,
    rawZones,
    rawZoneStudentCount,
    rawStudentCache,
    rawHistoryItems,
    timeChartFromDate,
    timeChartToDate,
    t,
  ]);

  // 3. Dynamic range effect for Risk Alerts Chart (NgĂ y/ThĂ¡ng)
  useEffect(() => {
    let active = true;

    async function loadIntrusionDataByRange() {
      if (intrusionFilterType !== "time") {
        return;
      }
      try {
        const defaultTo = new Date();
        const defaultFrom = dayjs(defaultTo).subtract(6, "day").toDate();
        const startDate =
          timeChartFromDate && !isNaN(timeChartFromDate.getTime())
            ? new Date(timeChartFromDate)
            : new Date(defaultFrom);
        const endDate =
          timeChartToDate && !isNaN(timeChartToDate.getTime())
            ? new Date(timeChartToDate)
            : new Date(defaultTo);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        const groupedCounts: { [key: string]: number } = {};
        const cursor = new Date(startDate);

        while (cursor <= endDate) {
          const dateStr = dayjs(cursor).format("MM/DD/YYYY");
          const statsRes = await fetchThongKeSvBiCamNoPhi({
            tuNgay: dateStr,
            denNgay: dateStr,
          });

          const countForDay = Array.isArray(statsRes?.payload)
            ? statsRes.payload.filter((studentItem: any) => {
                const isBanned =
                  studentItem.tongSoLanCamRaVao > 0 ||
                  studentItem.daCam ||
                  studentItem.tongSoLanBiCam > 0;
                const isDebt =
                  studentItem.tongSoLanNoPhi > 0 ||
                  (studentItem.danhSachNoPhi &&
                    studentItem.danhSachNoPhi.length > 0);

                return isBanned || isDebt;
              }).length
            : 0;

          groupedCounts[dayjs(cursor).format("DD/MM")] = countForDay;
          cursor.setDate(cursor.getDate() + 1);
        }

        if (!active) return;

        const colorsAlerts = [
          "#e03131",
          "#f03e3e",
          "#fa5252",
          "#ff6b6b",
          "#ff8787",
        ];
        const mappedIntrusions = Object.keys(groupedCounts).map(
          (name, idx) => ({
            label: name,
            count: groupedCounts[name],
            color: colorsAlerts[idx % colorsAlerts.length],
          }),
        );

        setIntrusionData(mappedIntrusions);
      } catch (e) {
        console.error("Failed to load intrusion data by range", e);
        if (active) setIntrusionData([]);
      }
    }

    loadIntrusionDataByRange();

    return () => {
      active = false;
    };
  }, [intrusionFilterType, timeChartFromDate, timeChartToDate]);

  // Helper parser for Time In/Out
  const mapTimeInOut = (apiData: any): TimeChartData[] => {
    const items = Array.isArray(apiData)
      ? apiData
      : apiData.payload && Array.isArray(apiData.payload)
        ? apiData.payload
        : null;

    if (!items) return [];
    if (items.length === 0) return [];

    const mapped = items.map((item: any) => {
      const timeVal =
        item.time || item.thoiGian || item.hour || item.label || "0h";
      const vaoVal =
        typeof item.vao === "number"
          ? item.vao
          : typeof item.soLuotVao === "number"
            ? item.soLuotVao
            : 0;
      const raVal =
        typeof item.ra === "number"
          ? item.ra
          : typeof item.soLuotRa === "number"
            ? item.soLuotRa
            : 0;
      return {
        time: String(timeVal),
        vao: vaoVal,
        ra: raVal,
      };
    });
    return mapped;
  };

  // Helper parser for KTX Building In/Out
  const mapKtxInOut = (apiData: any): KtxInOutData[] => {
    const items = Array.isArray(apiData)
      ? apiData
      : apiData.payload && Array.isArray(apiData.payload)
        ? apiData.payload
        : null;

    if (!items) return [];
    if (items.length === 0) return [];

    const hasKtx = items.some(
      (item: any) => item.ktx || item.building || item.area || item.tenKhu,
    );
    if (!hasKtx) return [];

    return items.map((item: any) => {
      const nameVal =
        item.ktx || item.building || item.area || item.tenKhu || "KTX";
      const vaoVal =
        typeof item.vao === "number"
          ? item.vao
          : typeof item.soLuotVao === "number"
            ? item.soLuotVao
            : 0;
      const raVal =
        typeof item.ra === "number"
          ? item.ra
          : typeof item.soLuotRa === "number"
            ? item.soLuotRa
            : 0;
      return {
        name: String(nameVal),
        vao: vaoVal,
        ra: raVal,
      };
    });
  };

  // Helper parser for su-kien-ra-vao items list
  const mapSuKienRaVao = (items: any[]): InOutHistory[] => {
    return items.map((item: any, idx: number) => {
      const student = item.sinhVien || item.student || item.caNhan || {};
      const studentIdVal =
        item.maSinhVien ||
        student.maSinhVien ||
        student.studentId ||
        item.studentId ||
        "N/A";
      const fullNameVal =
        item.hoTen ||
        student.hoTen ||
        student.ten ||
        student.fullName ||
        item.fullName ||
        "Ẩn danh";

      // Parse direction: Vào / Ra
      const rawType = String(
        item.type ||
          item.action ||
          item.checkType ||
          item.trangThai ||
          item.cameraName ||
          "",
      )
        .toLowerCase()
        .trim();
      const isVao =
        rawType.includes("vào") ||
        rawType === "in" ||
        rawType.includes("check in") ||
        item.cameraIdId === 1 ||
        item.cameraIdId === "1";
      const typeVal: "Vào" | "Ra" = isVao ? "Vào" : "Ra";

      // Parse timestamp
      let timeStr = "";
      if (item.timecheck) {
        try {
          const d = new Date(item.timecheck * 1000);
          if (!isNaN(d.getTime())) {
            const day = String(d.getDate()).padStart(2, "0");
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const hours = String(d.getHours()).padStart(2, "0");
            const minutes = String(d.getMinutes()).padStart(2, "0");
            timeStr = `${day}/${month} ${hours}:${minutes}`;
          }
        } catch (e) {
          timeStr = "Vừa xong";
        }
      } else {
        const rawTimeStr =
          item.time ||
          item.checkTime ||
          item.thoiGian ||
          item.createdDate ||
          "";
        if (rawTimeStr) {
          try {
            const d = new Date(rawTimeStr);
            if (!isNaN(d.getTime())) {
              const day = String(d.getDate()).padStart(2, "0");
              const month = String(d.getMonth() + 1).padStart(2, "0");
              const hours = String(d.getHours()).padStart(2, "0");
              const minutes = String(d.getMinutes()).padStart(2, "0");
              timeStr = `${day}/${month} ${hours}:${minutes}`;
            } else {
              timeStr = rawTimeStr;
            }
          } catch (e) {
            timeStr = rawTimeStr;
          }
        } else {
          timeStr = "Vừa xong";
        }
      }

      // Parse location
      const ktxVal =
        item.ktx ||
        item.building ||
        item.khu ||
        item.tenKhu ||
        student.khu ||
        "KTX";
      const rawRoomVal =
        item.room ||
        item.phong ||
        item.tenPhong ||
        item.maPhong ||
        student.phong ||
        "Chưa rõ";
      const roomVal =
        rawRoomVal === "â€”" || rawRoomVal === "—" ? "-" : rawRoomVal;

      // Parse avatar or generate custom DiceBear avatar based on name
      const avatarVal =
        item.pathImage ||
        item.pathimage ||
        item.avatarUrl ||
        item.imageUrl ||
        student.avatar ||
        student.linkAnh ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullNameVal)}`;

      return {
        stt: idx + 1,
        time: String(timeStr),
        studentId: String(studentIdVal),
        avatarUrl: avatarVal,
        fullName: String(fullNameVal),
        type: typeVal,
        ktx: String(ktxVal),
        room: String(roomVal),
      };
    });
  };

  // Khung chứa biểu đồ: hiện dần theo thứ tự đọc (order), khung hiện ngay, dữ liệu về thì cột/đường/vòng vẽ lên.
  const khungBieuDo = (
    order: number,
    cot: number,
    minHeight: number,
    node: React.ReactNode,
  ) => (
    <Reveal lazy order={order} cot={cot} mocMo={mocMo} minHeight={minHeight}>
      {node}
    </Reveal>
  );

  return (
    <Stack
      gap="xl"
      p="sm"
      style={{ backgroundColor: "#fafbfd", minHeight: "100vh" }}
    >
      {/* Header */}
      <Reveal order={0} mocMo={mocMo}>
      <Group justify="space-between" align="end" wrap="wrap" gap="md">
        <PageSectionHeader
          title={t("title")}
          description={t("title")}
          icon={<IconReportAnalytics size={20} color="#1f5ca9" />}
          rightSection={<></>}
        />

        <Group gap="xs" wrap="wrap">
          <DateInput
            value={timeChartFromDate}
            onChange={(value) =>
              setTimeChartFromDate(normalizeDateInputValue(value))
            }
            valueFormat="DD/MM/YYYY"
            placeholder="Từ ngày"
            label="Từ ngày"
            clearable={false}
            styles={{
              label: {
                fontSize: "11px",
                fontWeight: 600,
                color: "#64748b",
                marginBottom: "6px",
              },
              input: {
                height: "36px",
                minWidth: "150px",
                borderRadius: "8px",
              },
            }}
          />
          <DateInput
            value={timeChartToDate}
            onChange={(value) =>
              setTimeChartToDate(normalizeDateInputValue(value))
            }
            valueFormat="DD/MM/YYYY"
            placeholder="Đến ngày"
            label="Đến ngày"
            clearable={false}
            styles={{
              label: {
                fontSize: "11px",
                fontWeight: 600,
                color: "#64748b",
                marginBottom: "6px",
              },
              input: {
                height: "36px",
                minWidth: "150px",
                borderRadius: "8px",
              },
            }}
          />
        </Group>
      </Group>
      </Reveal>

      <Text fz="xs" c="dimmed" style={{ minHeight: 18 }}>
        {dangTaiKhoang
          ? "Đang tải dữ liệu…"
          : rawHistoryItems.length > 0
          ? `Đã tải ${rawHistoryItems.length.toLocaleString("vi-VN")} lượt ra vào trong khoảng ${dayjs(timeChartFromDate ?? undefined).format("DD/MM/YYYY")} – ${dayjs(timeChartToDate ?? undefined).format("DD/MM/YYYY")}`
          : `Không có lượt ra vào nào trong khoảng ${dayjs(timeChartFromDate ?? undefined).format("DD/MM/YYYY")} – ${dayjs(timeChartToDate ?? undefined).format("DD/MM/YYYY")}. Hãy chọn khoảng ngày có dữ liệu.`}
      </Text>

      {/* Quick Stats Grid */}
      <QuickStatsCards stats={stats} mocMo={mocMo} />

      {/* Charts Grid */}
      <Stack gap="lg">
        <Title
          order={3}
          fw={700}
          c="#1f5ca9"
          style={{
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            fontFamily: "var(--font-readex-pro), sans-serif",
            fontSize: "12px",
            marginTop: "10px",
          }}
        >
          {t("chartsTitle")}
        </Title>

        {/* Time In/Out Chart */}
        {khungBieuDo(7, 0, 430, <TimeInOutChart data={timeData} />)}

        {/* Mid-Row: Ktx In/Out Chart & Ktx Distribution (Donut) */}
        <Grid gutter="xl" align="stretch">
          <Grid.Col span={{ base: 12, md: 6 }}>
            {khungBieuDo(8, 0, 400, <KtxInOutChart data={ktxInOutData} />)}
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            {khungBieuDo(9, 1, 400, <KtxDistributionChart data={ktxDistributionData} />)}
          </Grid.Col>
        </Grid>

        {/* Top 5 Students Chart */}
        {khungBieuDo(10, 0, 420, <TopStudentsChart data={topStudentsData} />)}

        {/* Bottom-Row: Stranger Detections & Intrusion Alerts */}
        <Grid gutter="xl" align="stretch">
          <Grid.Col span={{ base: 12, md: 6 }}>
            {khungBieuDo(11, 0, 400, <StrangerDetectionChart data={strangerData} />)}
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            {khungBieuDo(
              12,
              1,
              400,
              <IntrusionAlertsChart
                data={intrusionData}
                filterType={intrusionFilterType}
                setFilterType={setIntrusionFilterType}
              />,
            )}
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Recent History Table */}
      <Reveal lazy order={13} mocMo={mocMo} minHeight={300}>
        <RecentHistoryTable history={historyData} />
      </Reveal>
    </Stack>
  );
}
