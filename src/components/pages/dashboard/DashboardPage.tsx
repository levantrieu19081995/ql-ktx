"use client";

import React, { useEffect, useState } from "react";
import { Stack, Title, Grid, Loader, Center, Group, Select } from "@mantine/core";
import { useTranslations } from "next-intl";
import dayjs from "dayjs";
import QuickStatsCards from "./QuickStatsCards";
import RecentHistoryTable from "./RecentHistoryTable";
import TimeInOutChart from "./TimeInOutChart";
import TopStudentsChart from "./TopStudentsChart";
import KtxInOutChart from "./KtxInOutChart";
import KtxDistributionChart from "./KtxDistributionChart";
import StrangerDetectionChart from "./StrangerDetectionChart";
import IntrusionAlertsChart from "./IntrusionAlertsChart";

import {
  fetchNguoiLaPaginate,
  fetchSinhVienPaginate,
  fetchPhongPaginate,
  fetchKhuPaginate,
  fetchThongKeLuotRaVao,
  fetchSuKienRaVaoPaginate,
  fetchDashboardSummary,
  fetchThongKeSvBiCamNoPhi,
  fetchSinhVienCamPaginate,
  fetchLichSuRaVaoTheoNgay,
  fetchThongKeTheoMaSo,
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

export default function DashboardPage() {
  const t = useTranslations("Dashboard");

  const [stats, setStats] = useState<QuickStat[]>(INITIAL_QUICK_STATS);
  const [timeData, setTimeData] = useState<TimeChartData[]>([]);
  const [strangerData, setStrangerData] =
    useState<StrangerDetection[]>([]);
  const [ktxInOutData, setKtxInOutData] =
    useState<KtxInOutData[]>([]);
  const [historyData, setHistoryData] =
    useState<InOutHistory[]>([]);
  const [ktxDistributionData, setKtxDistributionData] =
    useState<KtxDistribution[]>([]);
  const [intrusionData, setIntrusionData] =
    useState<IntrusionAlert[]>([]);
  const [topStudentsData, setTopStudentsData] =
    useState<StudentActivity[]>([]);


  // Dynamic Date and Time Unit states
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    new Date("2026-06-06"),
  );
  const [timeUnit, setTimeUnit] = useState<"day" | "month" | "year">("day");
  const [loading, setLoading] = useState(true);

  const [filterType, setFilterType] = useState<string>("all");
  const [rawStatsRes, setRawStatsRes] = useState<any>(null);
  const [rawStrangerStats, setRawStrangerStats] = useState<any[]>([]);
  const [rawTotalBanned, setRawTotalBanned] = useState<number>(0);
  const [rawBannedItems, setRawBannedItems] = useState<any[]>([]);
  const [rawZoneBannedCount, setRawZoneBannedCount] = useState<{ [key: string]: number }>({});
  const [rawTotalStudents, setRawTotalStudents] = useState<number>(0);
  const [rawZones, setRawZones] = useState<any[]>([]);
  const [rawStudentCache, setRawStudentCache] = useState<{ [key: string]: { tenKhu: string; tenPhong: string } }>({});
  const [rawHistoryItems, setRawHistoryItems] = useState<any[]>([]);
  const [rawTopStudents, setRawTopStudents] = useState<any[]>([]);


  // 1. Initial fetch of all raw data once on mount
  useEffect(() => {
    let active = true;

    async function fetchAllRawData() {
      setLoading(true);
      try {
        // Preload ALL students to build a complete local cache mapping maSinhVien -> { tenKhu, tenPhong }
        const studentCache: { [key: string]: { tenKhu: string; tenPhong: string } } = {};
        try {
          const allSvRes = await fetchSinhVienPaginate({
            page: "1",
            pageSize: "10000",
            maKhu: "-1",
            maPhong: "-1",
          });
          const svList = allSvRes?.payload?.items || [];
          svList.forEach((sv: any) => {
            if (sv.maSinhVien) {
              const tenKhu = sv.tenKhu || (sv.maKhu ? `Khu ${sv.maKhu}` : "Khu A");
              const tenPhong = sv.maPhong || sv.tenPhong || "Chưa rõ";
              studentCache[sv.maSinhVien] = { tenKhu, tenPhong };
            }
          });
        } catch (e) {
          console.error("Failed to preload all students for cache:", e);
        }

        // Fetch Students count
        let totalStudents = 0;
        try {
          const svRes = await fetchSinhVienPaginate({
            page: "1",
            pageSize: "10",
            maKhu: "-1",
            maPhong: "-1",
          });
          if (svRes && svRes.payload) {
            totalStudents = svRes.payload.totalElements ?? svRes.payload.items?.length ?? 0;
          }
        } catch (e) {
          console.error("Failed to fetch Sinh Vien pagination data", e);
        }
        if (active) setRawTotalStudents(totalStudents);

        // Fetch zones list
        let zones: any[] = [];
        try {
          const khuRes = await fetchKhuPaginate({
            page: "1",
            pageSize: "100",
            maKhu: "-1",
          });
          if (khuRes && khuRes.payload && Array.isArray(khuRes.payload.items)) {
            zones = khuRes.payload.items;
          }
        } catch (e) {
          console.error("Failed to fetch Khu pagination data", e);
        }
        if (active) setRawZones(zones);

        // Fetch Banned Students count & zones (preloaded from studentCache)
        let totalBanned = 0;
        let bannedItems: any[] = [];
        const zoneBannedCount: { [key: string]: number } = {};
        try {
          const bannedRes = await fetchSinhVienCamPaginate({
            page: "1",
            pageSize: "100",
            maSinhVien: "-1",
          });
          if (bannedRes && bannedRes.payload) {
            totalBanned = bannedRes.payload.totalElements ?? 0;
            bannedItems = bannedRes.payload.items ?? [];
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
          setRawBannedItems(bannedItems);
          setRawZoneBannedCount(zoneBannedCount);
        }

        // Fetch Stranger count & data for graph using fetchThongKeNguoiLa
        let strangerStats: any[] = [];
        try {
          const strangerRes = await fetchThongKeNguoiLa({
            tuNgay: "06/01/2026",
            denNgay: "06/06/2026",
            maKhu: "-1",
          });
          if (strangerRes && strangerRes.payload) {
            strangerStats = Array.isArray(strangerRes.payload) ? strangerRes.payload : [];
          }
        } catch (e) {
          console.error("Failed to fetch Stranger statistics data", e);
        }
        if (active) setRawStrangerStats(strangerStats);

        // Fetch stats for top students & recent history (06/01/2026 to today)
        let statsRes: any = null;
        try {
          const formatToday = dayjs().format("MM/DD/YYYY");
          statsRes = await fetchThongKeSvBiCamNoPhi({
            tuNgay: "06/01/2026",
            denNgay: "06/06/2026",
          });
        } catch (error) {
          console.error("Failed to load top students statistics:", error);
        }

        // Fetch lịch sử ra vào từ đúng API (theo từng ngày cụ thể)
        let historyItems: any[] = [];
        try {
          // Tạo danh sách ngày từ 01/06/2026 đến 06/06/2026 (dữ liệu có trong mock server)
          const danhSachNgay = [
            "06/01/2026", "06/02/2026", "06/03/2026",
            "06/04/2026", "06/05/2026", "06/06/2026",
          ];
          const allResults = await Promise.all(
            danhSachNgay.map((ngay) =>
              fetchLichSuRaVaoTheoNgay({ page: 1, pageSize: 100, ngay, maKhu: "-1", maNhom: "-1", keyword: "" })
            )
          );
          allResults.forEach((res) => {
            if (!res) return;
            const items =
              res.payload?.items ??
              res.payload?.content ??
              (Array.isArray(res.payload) ? res.payload : []);
            historyItems = [...historyItems, ...items];
          });
        } catch (e) {
          console.error("Failed to fetch lich su ra vao:", e);
        }

        // Calculate Top 10 most active masos from historyItems and fetch details using fetchThongKeTheoMaSo
        let topStudentsDataFetched: any[] = [];
        if (historyItems.length > 0) {
          const masoCounts: { [key: string]: number } = {};
          historyItems.forEach((item: any) => {
            const code = item.maso || item.maSinhVien || item.studentId;
            if (code) {
              masoCounts[code] = (masoCounts[code] || 0) + 1;
            }
          });
          const sortedMasos = Object.keys(masoCounts)
            .sort((a, b) => masoCounts[b] - masoCounts[a])
            .slice(0, 10);

          try {
            const details = await Promise.all(
              sortedMasos.map(async (code) => {
                try {
                  const res = await fetchThongKeTheoMaSo({
                    tuNgay: "06/01/2026",
                    denNgay: "06/06/2026",
                    maSo: code,
                  });
                  return res?.payload?.[0] || null;
                } catch (err) {
                  console.error(`Error fetching thong-ke/theo-ma-so for ${code}:`, err);
                  return null;
                }
              })
            );
            topStudentsDataFetched = details.filter(Boolean);
          } catch (e) {
            console.error("Failed to fetch thong ke theo ma so details:", e);
          }
        }

        if (active) {
          setRawStatsRes(statsRes);
          setRawStudentCache(studentCache);
          setRawHistoryItems(historyItems);
          setRawTopStudents(topStudentsDataFetched);
        }
      } catch (err) {
        console.error("Error fetching raw dashboard data:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchAllRawData();
    return () => {
      active = false;
    };
  }, []);

  // 2. Client-side dynamic filtering & grouping whenever dependencies change
  useEffect(() => {
    if (!rawStatsRes && rawStrangerStats.length === 0) return;

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
        return d.getMonth() === maxDate.getMonth() && d.getFullYear() === maxDate.getFullYear();
      }

      return true;
    };

    // Filter statsItems and count debt students
    let totalDebt = 0;
    const zoneDebtCount: { [key: string]: number } = {};

    if (rawStatsRes && Array.isArray(rawStatsRes.payload)) {
      const uniqueDebtSv = new Set<string>();

      rawStatsRes.payload.forEach((studentItem: any) => {
        const isDebt = studentItem.tongSoLanNoPhi > 0 || (studentItem.danhSachNoPhi && studentItem.danhSachNoPhi.length > 0);
        if (isDebt) {
          const code = studentItem.maSinhVien || studentItem.maSo || studentItem.maso;
          if (code) {
            uniqueDebtSv.add(code);
            const cached = rawStudentCache[code] || {};
            const rawKhu = cached.tenKhu || studentItem.tenKhu || (studentItem.maKhu ? `Khu ${studentItem.maKhu}` : null) || "Khu A";
            zoneDebtCount[rawKhu] = (zoneDebtCount[rawKhu] || 0) + 1;
          }
        }
      });

      totalDebt = uniqueDebtSv.size;
    }

    // Map Top Students Chart using rawTopStudents (from thong-ke/theo-ma-so API)
    const mappedTopStudents = (rawTopStudents || []).map((item: any) => ({
      name: item.hoTen || item.maSo || "Ẩn danh",
      count: item.tongLuot || 0,
    }));
    mappedTopStudents.sort((a, b) => b.count - a.count);
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
    const strangerVal = filteredStrangers.reduce((acc: number, curr: any) => acc + (curr.soLuong || 0), 0);

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

    // Map Intrusion Alerts Chart
    const combinedZoneCounts: { [key: string]: number } = {};
    Object.keys(rawZoneBannedCount).forEach((zone) => {
      combinedZoneCounts[zone] = (combinedZoneCounts[zone] || 0) + rawZoneBannedCount[zone];
    });
    Object.keys(zoneDebtCount).forEach((zone) => {
      combinedZoneCounts[zone] = (combinedZoneCounts[zone] || 0) + zoneDebtCount[zone];
    });

    const colorsAlerts = ['#e03131', '#f03e3e', '#fa5252', '#ff6b6b', '#ff8787'];
    const mappedIntrusions = Object.keys(combinedZoneCounts).map((name, idx) => ({
      ktx: name,
      count: combinedZoneCounts[name],
      color: colorsAlerts[idx % colorsAlerts.length],
    }));
    setIntrusionData(mappedIntrusions);

    // Map Check-in/out History List - dùng trực tiếp từ API lịch sử ra vào
    if (rawHistoryItems.length > 0) {
      const historyList = rawHistoryItems.map((item: any) => {
        const studentIdVal = item.maso || item.maSinhVien || item.studentId || "N/A";
        const cached = rawStudentCache[studentIdVal];
        const nhom = String(item.tennhom || "").toLowerCase();
        const isStudent = nhom.includes("sinh viên") || nhom.includes("sinhvien") || (!nhom.includes("cán bộ") && !nhom.includes("can bo") && !nhom.includes("người lạ") && !nhom.includes("nguoi la") && studentIdVal.startsWith("B"));

        let resolvedKhu = "KTX";
        let resolvedPhong = "Chưa rõ";

        if (isStudent) {
          resolvedKhu = cached?.tenKhu || item.tenKhu || item.khu || (item.maKhu ? `Khu ${item.maKhu}` : "KTX");
          resolvedPhong = cached?.tenPhong || item.tenPhong || item.phong || (item.maPhong ? `Phòng ${item.maPhong}` : "Chưa rõ");
        } else {
          // Cán bộ or Người lạ don't have KTX room
          resolvedKhu = item.tenKhu || item.khu || (item.maKhu ? `Khu ${item.maKhu}` : "KTX");
          resolvedPhong = "—";
        }

        return {
          timecheck: item.timecheck || item.thoiGian || item.checkTime,
          maSinhVien: studentIdVal,
          hoTen: item.hoten || item.hoTen || item.fullName || "Ẩn danh",
          avatarUrl: item.pathimage || item.imageUrl || item.avatar || null,
          cameraName: item.cameraName || item.loai || item.action || "",
          cameraIdId: item.cameraIdId,          // Truyền qua để mapSuKienRaVao dùng số phân loại chính xác
          tenKhu: resolvedKhu,
          maPhong: resolvedPhong,
        };
      });
      historyList.sort((a: any, b: any) => {
        const ta = typeof a.timecheck === "number" ? a.timecheck : new Date(a.timecheck).getTime() / 1000;
        const tb = typeof b.timecheck === "number" ? b.timecheck : new Date(b.timecheck).getTime() / 1000;
        return tb - ta;
      });
      setHistoryData(mapSuKienRaVao(historyList));
    }

    // Map Time In/Out Chart & KTX In/Out Chart
    const hourlyGroups: { [key: string]: { vao: number; ra: number } } = {};
    const hourBuckets = ["0h", "2h", "4h", "6h", "8h", "10h", "12h", "14h", "16h", "18h", "20h", "22h"];
    hourBuckets.forEach((h) => {
      hourlyGroups[h] = { vao: 0, ra: 0 };
    });

    const dailyGroups: { [key: string]: { vao: number; ra: number } } = {};
    const monthlyGroups: { [key: string]: { vao: number; ra: number } } = {};
    const ktxGroups: { [key: string]: { vao: number; ra: number } } = {};

    rawHistoryItems.forEach((scan: any) => {
      const rawTime = scan.timecheck ? scan.timecheck * 1000 : scan.time || scan.checkTime || scan.thoiGian;
      if (!rawTime) return;
      const d = new Date(rawTime);
      if (isNaN(d.getTime())) return;
      if (!isMatchFilter(d)) return;

      const isVao = String(scan.cameraName || "").toLowerCase().includes("vào") || scan.cameraIdId === 1 || scan.cameraIdId === "1";
      const code = scan.maso || scan.maSinhVien || scan.studentId;
      const cached = rawStudentCache[code] || {};
      const rawKhu = cached.tenKhu || scan.tenKhu || (scan.maKhu ? `Khu ${scan.maKhu}` : null) || "Khu A";

      if (!ktxGroups[rawKhu]) {
        ktxGroups[rawKhu] = { vao: 0, ra: 0 };
      }

      if (timeUnit === "day") {
        const hour = d.getHours();
        const bucketIndex = Math.floor(hour / 2);
        const bucketLabel = hourBuckets[bucketIndex] || "0h";
        if (isVao) {
          hourlyGroups[bucketLabel].vao += 1;
        } else {
          hourlyGroups[bucketLabel].ra += 1;
        }
      } else if (timeUnit === "month") {
        const dayLabel = dayjs(d).format("DD/MM");
        if (!dailyGroups[dayLabel]) {
          dailyGroups[dayLabel] = { vao: 0, ra: 0 };
        }
        if (isVao) {
          dailyGroups[dayLabel].vao += 1;
        } else {
          dailyGroups[dayLabel].ra += 1;
        }
      } else if (timeUnit === "year") {
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

    if (timeUnit === "day") {
      const mappedTimeData = hourBuckets.map((time) => ({
        time,
        vao: hourlyGroups[time].vao,
        ra: hourlyGroups[time].ra,
      }));
      setTimeData(mappedTimeData);
    } else if (timeUnit === "month") {
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
    } else if (timeUnit === "year") {
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
    const colorsDist = ['#4CAF50', '#1E88E5', '#FF9800', '#F44336', '#9C27B0', '#00BCD4'];
    const distributionPromise = async () => {
      try {
        const zoneCounts = await Promise.all(
          rawZones.map(async (zone: any) => {
            const khuMaVal = zone.khuMa ?? zone.maKhu;
            const khuTenVal = zone.khuTen ?? zone.tenKhu;
            try {
              const svRes = await fetchSinhVienPaginate({
                page: "1",
                pageSize: "1",
                maKhu: String(khuMaVal ?? "-1"),
                maPhong: "-1",
              });
              return {
                name: khuTenVal || `Khu ${khuMaVal}`,
                value: svRes?.payload?.totalElements || 0,
              };
            } catch (e) {
              return {
                name: khuTenVal || `Khu ${khuMaVal}`,
                value: 0,
              };
            }
          })
        );
        const sum = zoneCounts.reduce((acc, curr) => acc + curr.value, 0);
        const mappedDistribution = zoneCounts.map((item, idx) => {
          const pct = sum > 0 ? Math.round((item.value / sum) * 1000) / 10 : 0;
          return {
            name: item.name,
            value: item.value,
            percentage: pct,
            color: colorsDist[idx % colorsDist.length],
          };
        });
        setKtxDistributionData(mappedDistribution);
      } catch (error) {
        console.error("Failed to load KTX student distribution:", error);
      }
    };
    distributionPromise();
    // Map Stats Card
    const totalStudentsVal = rawTotalStudents;
    const presentVal = Math.round(totalStudentsVal * 0.67);
    const outVal = Math.round(totalStudentsVal * 0.33);
    const debtVal = totalDebt;
    const bannedVal = rawTotalBanned;
    const strangerValMapped = strangerVal;

    const mappedStats: QuickStat[] = INITIAL_QUICK_STATS.map((item: QuickStat) => {
      if (item.id === "total_sv") {
        return {
          ...item,
          value: totalStudentsVal.toLocaleString("vi-VN"),
          caption: "Tổng số sinh viên",
        };
      }
      if (item.id === "present") {
        const percent = totalStudentsVal > 0 ? ((presentVal / totalStudentsVal) * 100).toFixed(1) : "0.0";
        return {
          ...item,
          value: presentVal.toLocaleString("vi-VN"),
          caption: `${percent.replace(".", ",")}% tổng số SV`,
        };
      }
      if (item.id === "out") {
        const percent = totalStudentsVal > 0 ? ((outVal / totalStudentsVal) * 100).toFixed(1) : "0.0";
        return {
          ...item,
          value: outVal.toLocaleString("vi-VN"),
          caption: `${percent.replace(".", ",")}% tổng số SV`,
        };
      }
      if (item.id === "debt") {
        const percent = totalStudentsVal > 0 ? ((debtVal / totalStudentsVal) * 100).toFixed(1) : "0.0";
        return {
          ...item,
          value: debtVal.toLocaleString("vi-VN"),
          caption: `${percent.replace(".", ",")}% tổng số SV`,
        };
      }
      if (item.id === "banned") {
        const percent = totalStudentsVal > 0 ? ((bannedVal / totalStudentsVal) * 100).toFixed(1) : "0.0";
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
    });
    setStats(mappedStats);

  }, [filterType, rawStatsRes, rawStrangerStats, rawTotalBanned, rawBannedItems, rawZoneBannedCount, rawTotalStudents, rawZones, rawStudentCache, rawHistoryItems, rawTopStudents, timeUnit]);



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
        item.type || item.action || item.checkType || item.trangThai || item.cameraName || "",
      ).toLowerCase().trim();
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
        const rawTimeStr = item.time || item.checkTime || item.thoiGian || item.createdDate || "";
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
      const roomVal =
        item.room || item.phong || item.tenPhong || item.maPhong || student.phong || "Chưa rõ";

      // Parse avatar or generate custom DiceBear avatar based on name
      const avatarVal =
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

  return (
    <Stack
      gap="xl"
      p="sm"
      style={{ backgroundColor: "#fafbfd", minHeight: "100vh" }}
    >
      {/* Title with Select Filter on the right */}
      <Group justify="space-between" align="center">
        <Title order={2} fw={800} c="#1f5ca9" style={{ letterSpacing: "-0.5px", fontFamily: "var(--font-k2d), sans-serif" }}>
          {t("title")}
        </Title>
        <Select
          value={filterType}
          onChange={(val) => setFilterType(val || "all")}
          data={[
            { value: "all", label: "Tất cả" },
            { value: "week", label: "Theo tuần" },
            { value: "month", label: "Theo tháng" }
          ]}
          style={{ width: 160 }}
          radius="md"
        />
      </Group>

      {/* Quick Stats Grid */}
      <QuickStatsCards stats={stats} />

      {/* Recent History Table */}
      <RecentHistoryTable history={historyData} />

      {/* Charts Grid */}
      <Stack gap="lg">
        <Title
          order={3}
          fw={700}
          c="#1f5ca9"
          style={{ letterSpacing: "0.5px", textTransform: "uppercase", fontFamily: "var(--font-readex-pro), sans-serif", fontSize: "12px", marginTop: "10px" }}
        >
          {t("chartsTitle")}
        </Title>

        {/* Time In/Out Chart */}
        <TimeInOutChart
          data={timeData}
          date={selectedDate}
          onDateChange={setSelectedDate}
          timeUnit={timeUnit}
          onTimeUnitChange={setTimeUnit}
        />

        {/* Top 5 Students Chart */}
        <TopStudentsChart data={topStudentsData} />

        {/* Mid-Row: Ktx In/Out Chart & Ktx Distribution (Donut) */}
        <Grid gutter="xl" align="stretch">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <KtxInOutChart data={ktxInOutData} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <KtxDistributionChart data={ktxDistributionData} />
          </Grid.Col>
        </Grid>

        {/* Bottom-Row: Stranger Detections & Intrusion Alerts */}
        <Grid gutter="xl" align="stretch">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <StrangerDetectionChart data={strangerData} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <IntrusionAlertsChart data={intrusionData} />
          </Grid.Col>
        </Grid>
      </Stack>
    </Stack>
  );
}
