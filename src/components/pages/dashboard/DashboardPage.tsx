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
} from "@/services/dashboard/dashboardService";

import {
  QUICK_STATS,
  TIME_CHART_DATA,
  STRANGER_DETECTION,
  KTX_IN_OUT_DATA,
  IN_OUT_HISTORY,
  QuickStat,
  TimeChartData,
  StrangerDetection,
  KtxInOutData,
  InOutHistory,
} from "./mockDashboardData";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");

  const [stats, setStats] = useState<QuickStat[]>(QUICK_STATS);
  const [timeData, setTimeData] = useState<TimeChartData[]>(TIME_CHART_DATA);
  const [strangerData, setStrangerData] =
    useState<StrangerDetection[]>(STRANGER_DETECTION);
  const [ktxInOutData, setKtxInOutData] =
    useState<KtxInOutData[]>(KTX_IN_OUT_DATA);
  const [historyData, setHistoryData] =
    useState<InOutHistory[]>(IN_OUT_HISTORY);

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

        // 1. Fetch Students count
        let totalStudents = 1256;
        try {
          const svRes = await fetchSinhVienPaginate({ page: 1, pageSize: 1 });
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

        // 2. Fetch Stranger count & data for graph
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
            // API thực tế trả về numberOfElements
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
          const roomRes = await fetchPhongPaginate({ page: 1, pageSize: 1 });
          console.log("Room API Response:", roomRes);
        } catch (e) {
          console.error("Failed to fetch Phong pagination data", e);
        }

        // 4. Fetch Zones/Khu (for verification and logs)
        try {
          const khuRes = await fetchKhuPaginate({ page: 1, pageSize: 1 });
          console.log("Khu API Response:", khuRes);
        } catch (e) {
          console.error("Failed to fetch Khu pagination data", e);
        }

        // 5. Fetch In/Out stats
        let inOutRawData: any = null;
        try {
          const dateStr = selectedDate
            ? dayjs(selectedDate).format("DD/MM/YYYY")
            : dayjs().format("DD/MM/YYYY");
          inOutRawData = await fetchThongKeLuotRaVao({
            tuNgay: dateStr,
            denNgay: dateStr,
            groupBy: timeUnit.toUpperCase(),
          });
          console.log("In/Out Stats API Response:", inOutRawData);
        } catch (e) {
          console.error("Failed to fetch In/Out stats data", e);
        }

        // 6. Fetch check-in/out event history list (latest student records)
        let historyItems: any[] = [];
        try {
          const historyRes = await fetchSuKienRaVaoPaginate(1, 20);
          console.log("Check-in/out History API Response:", historyRes);
          if (historyRes && historyRes.payload) {
            historyItems = historyRes.payload.items || [];
          }
        } catch (e) {
          console.error(
            "Failed to fetch KTX su kien ra vao pagination data",
            e,
          );
        }

        if (!active) return;

        // Map Stats Card
        setStats((prev) =>
          prev.map((item) => {
            if (item.id === "total_sv") {
              return { ...item, value: totalStudents };
            }
            if (item.id === "stranger") {
              return { ...item, value: totalStrangers };
            }
            return item;
          }),
        );

        // Map Stranger Detection Line Chart
        if (strangerItems.length > 0) {
          const groupedStrangers = mapStrangerDetections(strangerItems);
          setStrangerData(groupedStrangers);
        }

        // Map Time In/Out Chart
        if (inOutRawData) {
          const mappedTimeData = mapTimeInOut(inOutRawData);
          setTimeData(mappedTimeData);

          const mappedKtxInOut = mapKtxInOut(inOutRawData);
          setKtxInOutData(mappedKtxInOut);
        } else {
          setTimeData(TIME_CHART_DATA);
          setKtxInOutData(KTX_IN_OUT_DATA);
        }

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

    return result.length > 0 ? result : STRANGER_DETECTION;
  };

  // Helper parser for Time In/Out
  const mapTimeInOut = (apiData: any): TimeChartData[] => {
    const items = Array.isArray(apiData)
      ? apiData
      : apiData.payload && Array.isArray(apiData.payload)
        ? apiData.payload
        : null;

    if (!items) return TIME_CHART_DATA;
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

    if (!items) return KTX_IN_OUT_DATA;
    if (items.length === 0) return [];

    const hasKtx = items.some(
      (item: any) => item.ktx || item.building || item.area || item.tenKhu,
    );
    if (!hasKtx) return KTX_IN_OUT_DATA;

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
        item.type || item.action || item.checkType || item.trangThai || "",
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
      let timeStr =
        item.time || item.checkTime || item.thoiGian || item.createdDate || "";
      if (timeStr) {
        try {
          const d = new Date(timeStr);
          if (!isNaN(d.getTime())) {
            const day = String(d.getDate()).padStart(2, "0");
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const hours = String(d.getHours()).padStart(2, "0");
            const minutes = String(d.getMinutes()).padStart(2, "0");
            timeStr = `${day}/${month} ${hours}:${minutes}`;
          }
        } catch (e) {
          console.warn("Time parse error", e);
        }
      } else {
        timeStr = "Vừa xong";
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
        <TopStudentsChart />

        {/* Mid-Row: Ktx In/Out Chart & Ktx Distribution (Donut) */}
        <Grid gutter="xl" align="stretch">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <KtxInOutChart data={ktxInOutData} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <KtxDistributionChart />
          </Grid.Col>
        </Grid>

        {/* Bottom-Row: Stranger Detections & Intrusion Alerts */}
        <Grid gutter="xl" align="stretch">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <StrangerDetectionChart data={strangerData} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <IntrusionAlertsChart />
          </Grid.Col>
        </Grid>
      </Stack>
    </Stack>
  );
}
