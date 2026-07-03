"use client";

import React, { useEffect, useState } from "react";
import { Stack, Title, Grid, Loader, Center } from "@mantine/core";
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
    new Date("2026-01-06"),
  );
  const [timeUnit, setTimeUnit] = useState<"day" | "month" | "year">("day");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDashboardData() {
      try {
        console.log(
          "Starting dashboard API connection with date:",
          selectedDate,
          "unit:",
          timeUnit,
        );

        let selDate = new Date();
        if (selectedDate) {
          const d = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
          if (!isNaN(d.getTime())) {
            selDate = d;
          }
        }

        // 1. Fetch Students count (original fallback/metadata)
        let totalStudents = 1256;
        try {
          const svRes = await fetchSinhVienPaginate({
            page: 1,
            pageSize: 1,
            maKhu: "-1",
            maPhong: "-1",
          });
          console.log("SV API Response:", svRes);
          if (svRes && svRes.payload) {
            totalStudents =
              svRes.payload.totalElements ??
              svRes.payload.items?.length ??
              totalStudents;
          }
        } catch (e) {
          console.error("Failed to fetch Sinh Vien pagination data", e);
        }

        // 2. Fetch Stranger count & data for graph (original fallback/metadata)
        let totalStrangers = 12;
        let strangerItems: any[] = [];
        try {
          const now = new Date();
          const mm = String(now.getMonth() + 1).padStart(2, "0");
          const dd = String(now.getDate()).padStart(2, "0");
          const yyyy = now.getFullYear();
          const strangerRes = await fetchNguoiLaPaginate({
            page: "1",
            pageSize: "100",
            tuNgay: `${mm}/01/${yyyy}`,
            denNgay: `${mm}/${dd}/${yyyy}`,
            maKhu: "-1",
          });
          console.log("Stranger API Response:", strangerRes);
          if (strangerRes && strangerRes.payload) {
            totalStrangers =
              strangerRes.payload.numberOfElements ??
              strangerRes.payload.totalElements ??
              strangerRes.payload.items?.length ??
              totalStrangers;
            strangerItems =
              strangerRes.payload.items ?? strangerRes.payload.content ?? [];
          }
        } catch (e) {
          console.error("Failed to fetch Stranger pagination data", e);
        }

        // 3. Fetch Rooms (for verification and logs)
        try {
          const roomRes = await fetchPhongPaginate({
            page: 1,
            pageSize: 1,
            maKhu: "-1",
            maPhong: "-1",
          });
          console.log("Room API Response:", roomRes);
        } catch (e) {
          console.error("Failed to fetch Phong pagination data", e);
        }

        // 4. Fetch Zones/Khu (for verification and logs)
        let zones: any[] = [];
        try {
          const zonesRes = await fetchKhuPaginate({
            page: 1,
            pageSize: 20,
            maKhu: "-1",
          });
          const payload: any = zonesRes?.payload;
          zones = payload?.items ?? payload?.content ?? (Array.isArray(payload) ? payload : []);
        } catch (e) {
          console.error("Failed to fetch Khu pagination data", e);
        }

        // Use unified statistics endpoint for charts and list history

        if (!active) return;

        // 6. Fetch stats for top students & recent history
        let statsRes: any = null;
        try {
          const mm = String(selDate.getMonth() + 1).padStart(2, "0");
          const yyyy = selDate.getFullYear();
          const formatTuNgay = `${mm}/01/${yyyy}`;
          const formatDenNgay = dayjs(selDate).format("MM/DD/YYYY");

          statsRes = await fetchThongKeSvBiCamNoPhi({
            tuNgay: formatTuNgay,
            denNgay: formatDenNgay,
            groupBy: "DAY",
            " tuNgay": formatTuNgay,
            " denNgay": formatDenNgay,
            " groupBy": "DAY",
          });
          console.log("Stats SV Bi Cam No Phi API Response:", statsRes);
          const statsItems = statsRes?.payload || [];
          if (Array.isArray(statsItems)) {
            const sorted = [...statsItems]
              .map((item: any) => ({
                name: item.hoTen || item.maSinhVien || "Ẩn danh",
                count: (item.tongSoLanBiCam || 0) + (item.tongSoLanNoPhi || 0),
              }))
              .sort((a, b) => b.count - a.count);
            setTopStudentsData(sorted.slice(0, 5));
          }
        } catch (error) {
          console.error("Failed to load top students statistics:", error);
        }

        // Build recent history list from statsRes payload to avoid CORS error on /ktx-su-kien-ra-vao/paginate
        let historyItems: any[] = [];
        if (statsRes && statsRes.payload && Array.isArray(statsRes.payload)) {
          const list: any[] = [];
          statsRes.payload.forEach((studentItem: any) => {
            const scans = studentItem.danhSachTatCa ?? [
              ...(studentItem.danhSachVao || []),
              ...(studentItem.danhSachRa || []),
            ];
            if (Array.isArray(scans)) {
              scans.forEach((scan: any) => {
                list.push({
                  timecheck: scan.timecheck,
                  maSinhVien: scan.maso || studentItem.maSinhVien,
                  hoTen: scan.hoten || studentItem.hoTen,
                  avatarUrl: scan.pathimage,
                  cameraName: scan.cameraName || (scan.cameraIdId === 1 ? "Camera vào" : "Camera ra"),
                  tenKhu: studentItem.maKhu || "Khu A",
                  maPhong: studentItem.maPhong || "P01",
                });
              });
            }
          });

          // Sort by timestamp descending
          list.sort((a, b) => (b.timecheck || 0) - (a.timecheck || 0));
          historyItems = list.slice(0, 20); // Keep only the latest 20 items
        }

        // 7. Call API 12: Dashboard Summary
        let totalStudentsVal = totalStudents;
        let presentVal = Math.round(totalStudentsVal * 0.67);
        let outVal = Math.round(totalStudentsVal * 0.33);
        let debtVal = 0;
        let bannedVal = 0;
        let strangerVal = totalStrangers;

        try {
          const formatNgay = selectedDate
            ? dayjs(selectedDate).format("MM/DD/YYYY")
            : dayjs().format("MM/DD/YYYY");
          const dashboardSummary = await fetchDashboardSummary({
            Ngay: formatNgay,
            ngay: formatNgay,
            tuNgay: formatNgay,
            denNgay: formatNgay,
            maKhu: "-1",
          });
          console.log("Dashboard Summary API response:", dashboardSummary);
          if (dashboardSummary && dashboardSummary.payload) {
            const payload = dashboardSummary.payload;
            const tinhTrang = payload.tinhTrangSinhVien || {};
            const tongQuan = payload.tongQuanHomNay || {};

            totalStudentsVal = tinhTrang.tongSinhVien ?? totalStudentsVal;
            bannedVal = tinhTrang.dangBiCam ?? 0;
            debtVal = tinhTrang.dangNoPhi ?? 0;
            strangerVal = tongQuan.soNguoiLa ?? strangerVal;

            const absentLongTime = tinhTrang.vangMatLauNgay ?? 0;
            presentVal = tinhTrang.dangCoMat ?? (totalStudentsVal - absentLongTime > 0 ? totalStudentsVal - absentLongTime : Math.round(totalStudentsVal * 0.67));
            outVal = tinhTrang.dangRaNgoai ?? (totalStudentsVal - presentVal > 0 ? totalStudentsVal - presentVal : Math.round(totalStudentsVal * 0.33));

            // Map Stranger Detection Line Chart from dashboard summary
            if (payload.nguoiLaTheoNgay && Array.isArray(payload.nguoiLaTheoNgay)) {
              const mappedStrangers = payload.nguoiLaTheoNgay.map((item: any) => ({
                date: item.ngay || "",
                count: item.soLuong ?? 0,
              }));
              setStrangerData(mappedStrangers);
            } else if (strangerItems.length > 0) {
              const groupedStrangers = mapStrangerDetections(strangerItems);
              setStrangerData(groupedStrangers);
            }

            // Map Intrusion Alerts Chart from top problem rooms
            if (payload.topPhongSuCo && Array.isArray(payload.topPhongSuCo)) {
              const zoneSuCo: { [key: string]: number } = {};
              payload.topPhongSuCo.forEach((item: any) => {
                const name = item.tenKhu || `Khu ${item.maKhu}` || "Chưa rõ";
                zoneSuCo[name] = (zoneSuCo[name] || 0) + (item.soSuCo || 0);
              });
              const colors = ['#1976D2', '#2196F3', '#03A9F4', '#00BCD4', '#009688'];
              const mappedIntrusions = Object.keys(zoneSuCo).map((name, idx) => ({
                ktx: name,
                count: zoneSuCo[name],
                color: colors[idx % colors.length],
              }));
              setIntrusionData(mappedIntrusions);
            }
          }
        } catch (e) {
          console.error("Failed to fetch dashboard summary:", e);
          if (strangerItems.length > 0) {
            const groupedStrangers = mapStrangerDetections(strangerItems);
            setStrangerData(groupedStrangers);
          }
        }

        // Map Stats Card
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
              value: strangerVal.toLocaleString("vi-VN"),
              caption: "Phát hiện hôm nay",
            };
          }
          return item;
        });
        setStats(mappedStats);

        // 8. Fetch KTX Student Distribution Chart (Donut)
        try {
          const colors = ['#4CAF50', '#1E88E5', '#FF9800', '#F44336', '#9C27B0', '#00BCD4'];
          const zoneCounts = await Promise.all(
            zones.map(async (zone: any) => {
              const khuMaVal = zone.khuMa ?? zone.maKhu;
              const khuTenVal = zone.khuTen ?? zone.tenKhu;
              try {
                const svRes = await fetchSinhVienPaginate({
                  page: 1,
                  pageSize: 1,
                  maKhu: khuMaVal ?? "-1",
                  maPhong: "-1",
                });
                return {
                  name: khuTenVal || `Khu ${khuMaVal}`,
                  value: svRes?.payload?.totalElements || 0,
                };
              } catch (e) {
                console.error(`Failed to fetch student count for zone ${khuMaVal}`, e);
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
              color: colors[idx % colors.length],
            };
          });
          setKtxDistributionData(mappedDistribution);
        } catch (error) {
          console.error("Failed to load KTX student distribution:", error);
        }

        // Map Time In/Out Chart & KTX In/Out Chart from statsRes payload (the same scans list)
        const hourlyGroups: { [key: string]: { vao: number; ra: number } } = {};
        const hourBuckets = ["0h", "2h", "4h", "6h", "8h", "10h", "12h", "14h", "16h", "18h", "20h", "22h"];
        hourBuckets.forEach((h) => {
          hourlyGroups[h] = { vao: 0, ra: 0 };
        });

        const dailyGroups: { [key: string]: { vao: number; ra: number } } = {};
        const monthlyGroups: { [key: string]: { vao: number; ra: number } } = {};

        const ktxGroups: { [key: string]: { vao: number; ra: number } } = {};

        if (statsRes && statsRes.payload && Array.isArray(statsRes.payload)) {
          statsRes.payload.forEach((studentItem: any) => {
            const scans = studentItem.danhSachTatCa ?? [
              ...(studentItem.danhSachVao || []),
              ...(studentItem.danhSachRa || []),
            ];
            
            const rawKhu = studentItem.tenKhu || (studentItem.maKhu ? `Khu ${studentItem.maKhu}` : null) || "";
            let zoneName = rawKhu;
            if (!zoneName && studentItem.maPhong) {
              const firstChar = String(studentItem.maPhong).charAt(0).toUpperCase();
              if (["A", "B", "C", "D"].includes(firstChar)) {
                zoneName = `Khu ${firstChar}`;
              } else {
                zoneName = "Khu Khác";
              }
            }
            if (!zoneName) zoneName = "Khu A";

            if (!ktxGroups[zoneName]) {
              ktxGroups[zoneName] = { vao: 0, ra: 0 };
            }

            if (Array.isArray(scans)) {
              scans.forEach((scan: any) => {
                const isVao = String(scan.cameraName || "").toLowerCase().includes("vào") || scan.cameraIdId === 1;
                
                if (scan.timecheck) {
                  const d = new Date(scan.timecheck * 1000);
                  
                  // 1. Time grouping based on unit selector
                  if (timeUnit === "day") {
                    // Only count scans on the selected day
                    const isSameDay = d.getDate() === selDate.getDate() && 
                                      d.getMonth() === selDate.getMonth() && 
                                      d.getFullYear() === selDate.getFullYear();
                    if (isSameDay) {
                      const hour = d.getHours();
                      const bucketIndex = Math.floor(hour / 2);
                      const bucketLabel = hourBuckets[bucketIndex] || "0h";
                      if (isVao) {
                        hourlyGroups[bucketLabel].vao += 1;
                      } else {
                        hourlyGroups[bucketLabel].ra += 1;
                      }
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
                }

                // 2. KTX bucketing
                if (isVao) {
                  ktxGroups[zoneName].vao += 1;
                } else {
                  ktxGroups[zoneName].ra += 1;
                }
              });
            }
          });
        }

        // Set time chart data based on timeUnit
        if (timeUnit === "day") {
          const mappedTimeData = hourBuckets.map((time) => ({
            time,
            vao: hourlyGroups[time].vao,
            ra: hourlyGroups[time].ra,
          }));
          setTimeData(mappedTimeData);
        } else if (timeUnit === "month") {
          const mappedTimeData = Object.keys(dailyGroups)
            .map((time) => ({
              time,
              vao: dailyGroups[time].vao,
              ra: dailyGroups[time].ra,
            }))
            .sort((a, b) => a.time.localeCompare(b.time));
          setTimeData(mappedTimeData);
        } else if (timeUnit === "year") {
          const monthOrder = Array.from({ length: 12 }, (_, i) => `T${i + 1}`);
          const mappedTimeData = monthOrder.map((time) => ({
            time,
            vao: monthlyGroups[time]?.vao || 0,
            ra: monthlyGroups[time]?.ra || 0,
          }));
          setTimeData(mappedTimeData);
        }

        // Convert ktxGroups to KtxInOutData[]
        const mappedKtxInOut = Object.keys(ktxGroups).map((name) => ({
          name,
          vao: ktxGroups[name].vao,
          ra: ktxGroups[name].ra,
        }));
        setKtxInOutData(mappedKtxInOut);

        // Map Check-in/out History List
        if (historyItems.length > 0) {
          const mappedHistory = mapSuKienRaVao(historyItems);
          setHistoryData(mappedHistory);
        }
      } catch (err) {
        console.error("General error loading dashboard data:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      active = false;
    };
  }, [selectedDate, timeUnit]);

  // Helper parser for stranger detections
  const mapStrangerDetections = (items: any[]): StrangerDetection[] => {
    const groups: { [key: string]: number } = {};
    items.forEach((item) => {
      const rawTime =
        item.detectTime || item.createdDate || item.time || item.checkTime;
      if (!rawTime) return;
      try {
        let dateLabel = "";
        if (typeof rawTime === "string") {
          const match = rawTime.match(/(\d{2})[\/\-](\d{2})/);
          if (match) {
            dateLabel = `${match[1]}/${match[2]}`;
          } else {
            const d = new Date(rawTime);
            if (!isNaN(d.getTime())) {
              const day = String(d.getDate()).padStart(2, "0");
              const month = String(d.getMonth() + 1).padStart(2, "0");
              dateLabel = `${day}/${month}`;
            }
          }
        }
        if (dateLabel) {
          groups[dateLabel] = (groups[dateLabel] || 0) + 1;
        }
      } catch (e) {
        console.warn("Date parse warn:", e);
      }
    });

    const result = Object.keys(groups)
      .map((date) => ({
        date,
        count: groups[date],
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return result.length > 0 ? result : [];
  };

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
      let typeVal: "Vào" | "Ra" = "Vào";
      const rawType = String(
        item.type || item.action || item.checkType || item.trangThai || item.cameraName || "",
      ).toLowerCase();
      if (
        rawType.includes("ra") ||
        rawType.includes("out") ||
        rawType === "0"
      ) {
        typeVal = "Ra";
      } else if (
        rawType.includes("vào") ||
        rawType.includes("in") ||
        rawType === "1"
      ) {
        typeVal = "Vào";
      }

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
        item.room || item.phong || item.tenPhong || student.phong || "Chưa rõ";

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
      {/* Title */}
      <Title order={2} fw={800} c="#0f172a" style={{ letterSpacing: "-0.5px" }}>
        {t("title")}
      </Title>

      {/* Quick Stats Grid */}
      <QuickStatsCards stats={stats} />

      {/* Recent History Table */}
      <RecentHistoryTable history={historyData} />

      {/* Charts Grid */}
      <Stack gap="lg">
        <Title
          order={3}
          fw={800}
          c="#0f172a"
          style={{ letterSpacing: "-0.25px", marginTop: "10px" }}
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
