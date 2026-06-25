"use client";

<<<<<<< HEAD
import {
  GetThongKeChiTietPhiDichVu,
  GetThongKeDashBoard,
  GetThongKePhiDichVu,
} from "@/services/thong-ke/thongKeService";
=======
import React, { useEffect, useState } from 'react';
import { Stack, Title, Grid, Loader, Center } from '@mantine/core';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import QuickStatsCards from './QuickStatsCards';
import RecentHistoryTable from './RecentHistoryTable';
import TimeInOutChart from './TimeInOutChart';
import TopStudentsChart from './TopStudentsChart';
import KtxInOutChart from './KtxInOutChart';
import KtxDistributionChart from './KtxDistributionChart';
import StrangerDetectionChart from './StrangerDetectionChart';
import IntrusionAlertsChart from './IntrusionAlertsChart';

import {
  fetchNguoiLaPaginate,
  fetchSinhVienPaginate,
  fetchPhongPaginate,
  fetchKhuPaginate,
  fetchThongKeLuotRaVao,
  fetchSuKienRaVaoPaginate
} from '@/services/dashboard/dashboardService';

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
  InOutHistory
} from './mockDashboardData';

export default function DashboardPage() {
  const t = useTranslations("Dashboard");

  const [stats, setStats] = useState<QuickStat[]>(QUICK_STATS);
  const [timeData, setTimeData] = useState<TimeChartData[]>(TIME_CHART_DATA);
  const [strangerData, setStrangerData] = useState<StrangerDetection[]>(STRANGER_DETECTION);
  const [ktxInOutData, setKtxInOutData] = useState<KtxInOutData[]>(KTX_IN_OUT_DATA);
  const [historyData, setHistoryData] = useState<InOutHistory[]>(IN_OUT_HISTORY);

  // Dynamic Date and Time Unit states
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date('2026-01-06'));
  const [timeUnit, setTimeUnit] = useState<'day' | 'month' | 'year'>('day');
  const [loading, setLoading] = useState(true);

<<<<<<< HEAD
  // --- Thêm useState cho paginate ---
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [paginatedData, setPaginatedData] = useState<ThongKePhiDichVuItem[]>(
    [],
  );
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // --- Hàm xử lý cắt dữ liệu full thành paginated ---
  const handlePaginate = (
    fullData: ThongKePhiDichVuItem[],
    page: number,
    pageSize: number,
  ) => {
    const total = fullData.length;
    const totalP = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const slice = fullData.slice(start, end);

    setPaginatedData(slice);
    setTotalItems(total);
    setTotalPages(totalP);
  };

  // --- Giả lập fetchData truyền cho component paginate ---
  const _fetchListHoSoDangKiem = (page: number, pageSize: number) => {
    handlePaginate(dataPhiDichVu, page, pageSize);
  };

  // const [filtersDate, setFiltersDate] = useState<{
  //   fromDate: string | null;
  //   toDate: string | null;
  //   thuTuc: string | null;
  // }>({
  //   fromDate: "01/01/2025",
  //   toDate: "12/31/2025",
  //   thuTuc: "",
  // });
  const getToday = () => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };

  const getStartOfYear = () => {
    const yyyy = new Date().getFullYear();
    return `01/01/${yyyy}`;
  };

  const [filtersDate, setFiltersDate] = useState<{
    fromDate: string | null;
    toDate: string | null;
    thuTuc: string | null;
  }>({
    fromDate: getStartOfYear(),
    toDate: getToday(),
    thuTuc: "",
  });

  // --- Call API ------

  // ép mọi kiểu (string DD/MM/YYYY, string ISO, Date object) → MM/DD/YYYY
  const normalizeDateForApi = (input: any, fallback: string) => {
    if (!input) return fallback;

    const d = dayjs(input, ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"], true);

    if (!d.isValid()) return fallback;

    return d.format("MM/DD/YYYY");
  };

  const fetchThongKeDashBoard = async () => {
    try {
      //  Chuẩn hóa 100% trước khi gọi API
      const tuNgay = normalizeDateForApi(filtersDate.fromDate, "01/01/2025");
      const denNgay = normalizeDateForApi(filtersDate.toDate, "12/31/2025");

      const res = await GetThongKeDashBoard({
        tuNgay,
        denNgay,
      });

      const payload = res.payload;

      payload.danhSachPhuongTienDangKiemThangHienTai =
        payload?.danhSachPhuongTienDangKiemThangHienTai?.map(
          (item: any, idx: number) => ({
            ...item,
            lptTen: item.lptTen || "Không xác định",
            color: colorsBarChar[idx % colorsBarChar.length],
          }),
        );
      setDashboard(payload);
      return res;
    } catch (err) {
      console.error("Fetch dashboard error:", err);
    }
  };

  const fetchThongKePhiDichVu = async () => {
    try {
      const tuNgay = normalizeDateForApi(filtersDate.fromDate, "01/01/2025");
      const denNgay = normalizeDateForApi(filtersDate.toDate, "12/31/2025");

      const res = await GetThongKePhiDichVu({
        tuNgay: tuNgay,
        denNgay: denNgay,
      });

      // setDataPhiDichVu(res.payload);
      setDataPhiDichVu(res.payload || []);
      return res;
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChiTietPhiDichVu = async (hsId: number, row: any) => {
    const tuNgay = normalizeDateForApi(filtersDate.fromDate, "01/01/2025");
    const denNgay = normalizeDateForApi(filtersDate.toDate, "12/31/2025");

    const res = await GetThongKeChiTietPhiDichVu({
      tuNgay: tuNgay,
      denNgay: denNgay,
      hsId,
    });
    const chiTiet = res.payload[0];
    setSelectedPhiDichVu({
      ...row,
      danhSachPhiDichVu: chiTiet?.danhSachPhiDichVu ?? [],
    });
    setOpened(true);
  };

  // -- render component local
  // function RecentPaymentsCard() {
  //   const getFeeColor = (value: number) => {
  //     if (value > 1_000_000) return "grape";
  //     if (value > 700_000) return "blue";
  //     if (value > 400_000) return "teal";
  //     return "gray";
  //   };

  //   return (
  //     <>
  //       <style>
  //         {`
  //       /* Ánh sáng quét qua biển kiểm soát */
  //       @keyframes shine {
  //         0% { left: -100%; }
  //         100% { left: 100%; }
  //       }

  //       /* Hiệu ứng ripple click */
  //       @keyframes ripple-effect {
  //         to {
  //           width: 200%;
  //           height: 200%;
  //           opacity: 0;
  //         }
  //       }

  //       .ripple::after {
  //         content: "";
  //         position: absolute;
  //         left: 50%;
  //         top: 50%;
  //         width: 0;
  //         height: 0;
  //         background: rgba(110, 124, 246, 0.3);
  //         border-radius: 50%;
  //         transform: translate(-50%, -50%);
  //         animation: ripple-effect 0.6s ease-out;
  //         pointer-events: none;
  //       }
  //     `}
  //       </style>

  //       <Card
  //         withBorder
  //         radius="lg"
  //         p="lg"
  //         style={{
  //           background: "linear-gradient(145deg, #fdfdfd, #fafafa)",
  //           boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  //         }}
  //       >
  //         <Title order={4} mb="md" style={{ color: "#222" }}>
  //           Danh sách thu phí dịch vụ
  //         </Title>

  //         <Table
  //           highlightOnHover
  //           verticalSpacing="sm"
  //           style={{ borderRadius: 12 }}
  //         >
  //           <Table.Thead>
  //             <Table.Tr>
  //               <Table.Th>Mã kiểm soát</Table.Th>
  //               <Table.Th>Phương tiện</Table.Th>
  //               <Table.Th>Tổng phí dịch vụ</Table.Th>
  //               <Table.Th style={{ width: "15%", textAlign: "center" }}>
  //                 Thao tác
  //               </Table.Th>
  //             </Table.Tr>
  //           </Table.Thead>

  //           <Table.Tbody>
  //             {paginatedData.map((row, idx) => (
  //               <Table.Tr
  //                 key={idx}
  //                 onClick={(e) => {
  //                   fetchChiTietPhiDichVu(row.hsId, row);
  //                   const tr = e.currentTarget as HTMLElement;
  //                   tr.classList.add("ripple");
  //                   setTimeout(() => tr.classList.remove("ripple"), 600);
  //                 }}
  //                 style={{
  //                   cursor: "pointer",
  //                   position: "relative",
  //                   transition: "all 0.25s ease",
  //                 }}
  //                 onMouseEnter={(e) => {
  //                   const tr = e.currentTarget as HTMLElement;
  //                   tr.style.background = "rgba(230,240,255,0.5)";
  //                   tr.style.boxShadow = "0 2px 6px rgba(0,0,0,0.08)";

  //                   const plate = tr.querySelector(".plate-box") as HTMLElement;
  //                   if (plate) {
  //                     plate.style.transform = "scale(1.03)";
  //                     plate.style.boxShadow =
  //                       "0 4px 10px rgba(0,0,0,0.25), inset 0 0 3px rgba(0,0,0,0.25)";
  //                   }

  //                   const badge = tr.querySelector(
  //                     ".detail-badge"
  //                   ) as HTMLElement;
  //                   if (badge)
  //                     badge.style.boxShadow =
  //                       "0 0 10px rgba(45, 212, 191, 0.6)";
  //                 }}
  //                 onMouseLeave={(e) => {
  //                   const tr = e.currentTarget as HTMLElement;
  //                   tr.style.background = "transparent";
  //                   tr.style.boxShadow = "none";

  //                   const plate = tr.querySelector(".plate-box") as HTMLElement;
  //                   if (plate) {
  //                     plate.style.transform = "scale(1)";
  //                     plate.style.boxShadow =
  //                       "0 2px 6px rgba(0,0,0,0.15), inset 0 0 2px rgba(0,0,0,0.25)";
  //                   }

  //                   const badge = tr.querySelector(
  //                     ".detail-badge"
  //                   ) as HTMLElement;
  //                   if (badge) badge.style.boxShadow = "none";
  //                 }}
  //               >
  //                 {/* Biển kiểm soát */}
  //                 <Table.Td>
  //                   <BienSoComponent value={row.bienKiemSoat} />
  //                 </Table.Td>

  //                 {/* Phương tiện */}
  //                 <Table.Td>{row.lptTen}</Table.Td>

  //                 {/* Tổng phí */}
  //                 <Table.Td>
  //                   <Badge
  //                     variant="gradient"
  //                     gradient={{ from: "#6E7CF6", to: "#8B5CF6", deg: 90 }}
  //                     color={getFeeColor(row.tongPhiDichVu || 0)}
  //                     size="lg"
  //                     radius="sm"
  //                     px="xs"
  //                   >
  //                     {row.tongPhiDichVu?.toLocaleString() ?? 0} đ
  //                   </Badge>
  //                 </Table.Td>

  //                 {/* Thao tác */}
  //                 <Table.Td style={{ width: "15%", textAlign: "center" }}>
  //                   <Badge
  //                     color="teal"
  //                     variant="light"
  //                     className="detail-badge"
  //                     style={{
  //                       transition: "all 0.25s ease",
  //                     }}
  //                   >
  //                     Chi tiết
  //                   </Badge>
  //                 </Table.Td>
  //               </Table.Tr>
  //             ))}
  //           </Table.Tbody>
  //         </Table>

  //         <Group justify="right" mt="md">
  //           <CustomPagination
  //             totalItems={totalItems}
  //             totalPages={totalPages}
  //             page={page}
  //             pageSize={pageSize}
  //             setPage={setPage}
  //             setPageSize={setPageSize}
  //             fetchData={_fetchListHoSoDangKiem}
  //           />
  //         </Group>
  //       </Card>
  //     </>
  //   );
  // }

  const pieDataDynamic =
    dashboard?.danhSachPhuongTienDangKiemThangHienTai?.map(
      (item: any, idx: number) => {
        const tongXe = dashboard?.tongXeDangKiemThangHienTai || 1;
        return {
          name: item.lptTen,
          value: Number(((item.soLuotDangKiem / tongXe) * 100).toFixed(1)), // % tỷ trọng
          color: colors[idx % colors.length],
        };
      },
    ) ?? [];

  const tongXe = dashboard?.tongXeDangKiemThangHienTai ?? 0;

  useEffect(() => {
    handleFetchThongKe();
  }, []);

  const handleFetchThongKe = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchThongKeDashBoard(), fetchThongKePhiDichVu()]);
    } finally {
      setLoading(false);
    }
  };

=======
>>>>>>> 11f35a4 (Hoàn thành giao diện trang dashboard)
useEffect(() => {
  let active = true;

  async function loadDashboardData() {
    try {
      console.log("Starting dashboard API connection with date:", selectedDate, "unit:", timeUnit);

      // 1. Fetch Students count
      let totalStudents = 1256;
      try {
        const svRes = await fetchSinhVienPaginate({ page: 1, pageSize: 1 });
        console.log("SV API Response:", svRes);
        if (svRes && svRes.payload) {
          totalStudents = svRes.payload.totalElements ?? svRes.payload.items?.length ?? totalStudents;
        }
      } catch (e) {
        console.error("Failed to fetch Sinh Vien pagination data", e);
      }

      // 2. Fetch Stranger count & data for graph
      let totalStrangers = 12;
      let strangerItems: any[] = [];
      try {
        const strangerRes = await fetchNguoiLaPaginate({ page: 1, pageSize: 100 });
        console.log("Stranger API Response:", strangerRes);
        if (strangerRes && strangerRes.payload) {
          totalStrangers = strangerRes.payload.totalElements ?? strangerRes.payload.items?.length ?? totalStrangers;
          strangerItems = strangerRes.payload.items || [];
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
        const dateStr = selectedDate ? dayjs(selectedDate).format("DD/MM/YYYY") : dayjs().format("DD/MM/YYYY");
        inOutRawData = await fetchThongKeLuotRaVao({
          tuNgay: dateStr,
          denNgay: dateStr,
          groupBy: timeUnit.toUpperCase()
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
        console.error("Failed to fetch KTX su kien ra vao pagination data", e);
      }

      if (!active) return;

      // Map Stats Card
      setStats(prev => prev.map(item => {
        if (item.id === 'total_sv') {
          return { ...item, value: totalStudents };
        }
        if (item.id === 'stranger') {
          return { ...item, value: totalStrangers };
        }
        return item;
      }));

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
  items.forEach(item => {
    const rawTime = item.detectTime || item.createdDate || item.time || item.checkTime;
    if (!rawTime) return;
    try {
      let dateLabel = '';
      if (typeof rawTime === 'string') {
        const match = rawTime.match(/(\d{2})[\/\-](\d{2})/);
        if (match) {
          dateLabel = `${match[1]}/${match[2]}`;
        } else {
          const d = new Date(rawTime);
          if (!isNaN(d.getTime())) {
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
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

  const result = Object.keys(groups).map(date => ({
    date,
    count: groups[date]
  })).sort((a, b) => a.date.localeCompare(b.date));

  return result.length > 0 ? result : STRANGER_DETECTION;
};

// Helper parser for Time In/Out
const mapTimeInOut = (apiData: any): TimeChartData[] => {
  const items = Array.isArray(apiData)
    ? apiData
    : (apiData.payload && Array.isArray(apiData.payload) ? apiData.payload : null);

  if (!items) return TIME_CHART_DATA;
  if (items.length === 0) return [];

  const mapped = items.map((item: any) => {
    const timeVal = item.time || item.thoiGian || item.hour || item.label || '0h';
    const vaoVal = typeof item.vao === 'number' ? item.vao : (typeof item.soLuotVao === 'number' ? item.soLuotVao : 0);
    const raVal = typeof item.ra === 'number' ? item.ra : (typeof item.soLuotRa === 'number' ? item.soLuotRa : 0);
    return {
      time: String(timeVal),
      vao: vaoVal,
      ra: raVal
    };
  });
  return mapped;
};

// Helper parser for KTX Building In/Out
const mapKtxInOut = (apiData: any): KtxInOutData[] => {
  const items = Array.isArray(apiData)
    ? apiData
    : (apiData.payload && Array.isArray(apiData.payload) ? apiData.payload : null);

  if (!items) return KTX_IN_OUT_DATA;
  if (items.length === 0) return [];

  const hasKtx = items.some((item: any) => item.ktx || item.building || item.area || item.tenKhu);
  if (!hasKtx) return KTX_IN_OUT_DATA;

  return items.map((item: any) => {
    const nameVal = item.ktx || item.building || item.area || item.tenKhu || 'KTX';
    const vaoVal = typeof item.vao === 'number' ? item.vao : (typeof item.soLuotVao === 'number' ? item.soLuotVao : 0);
    const raVal = typeof item.ra === 'number' ? item.ra : (typeof item.soLuotRa === 'number' ? item.soLuotRa : 0);
    return {
      name: String(nameVal),
      vao: vaoVal,
      ra: raVal
    };
  });
};

// Helper parser for su-kien-ra-vao items list
const mapSuKienRaVao = (items: any[]): InOutHistory[] => {
  return items.map((item: any, idx: number) => {
    const student = item.sinhVien || item.student || item.caNhan || {};
    const studentIdVal = item.maSinhVien || student.maSinhVien || student.studentId || item.studentId || 'N/A';
    const fullNameVal = item.hoTen || student.hoTen || student.ten || student.fullName || item.fullName || 'Ẩn danh';

    // Parse direction: Vào / Ra
    let typeVal: 'Vào' | 'Ra' = 'Vào';
    const rawType = String(item.type || item.action || item.checkType || item.trangThai || '').toLowerCase();
    if (rawType.includes('ra') || rawType.includes('out') || rawType === '0') {
      typeVal = 'Ra';
    } else if (rawType.includes('vào') || rawType.includes('in') || rawType === '1') {
      typeVal = 'Vào';
    }

    // Parse timestamp
    let timeStr = item.time || item.checkTime || item.thoiGian || item.createdDate || '';
    if (timeStr) {
      try {
        const d = new Date(timeStr);
        if (!isNaN(d.getTime())) {
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const hours = String(d.getHours()).padStart(2, '0');
          const minutes = String(d.getMinutes()).padStart(2, '0');
          timeStr = `${day}/${month} ${hours}:${minutes}`;
        }
      } catch (e) {
        console.warn("Time parse error", e);
      }
    } else {
      timeStr = 'Vừa xong';
    }

    // Parse location
    const ktxVal = item.ktx || item.building || item.khu || item.tenKhu || student.khu || 'KTX';
    const roomVal = item.room || item.phong || item.tenPhong || student.phong || 'Chưa rõ';

    // Parse avatar or generate custom DiceBear avatar based on name
    const avatarVal = item.avatarUrl || item.imageUrl || student.avatar || student.linkAnh ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullNameVal)}`;

    return {
      stt: idx + 1,
      time: String(timeStr),
      studentId: String(studentIdVal),
      avatarUrl: avatarVal,
      fullName: String(fullNameVal),
      type: typeVal,
      ktx: String(ktxVal),
      room: String(roomVal)
    };
  });
};

return (
  <Stack gap="xl" p="sm" style={{ backgroundColor: '#fafbfd', minHeight: '100vh' }}>
    {/* Title */}
    <Title order={2} fw={800} c="#0f172a" style={{ letterSpacing: '-0.5px' }}>
      {t("title")}
    </Title>

<<<<<<< HEAD
{/* Bộ lọc */ }
{/* <>
        {loading ? (
          <Skeleton height={80} radius="lg" />
        ) : (
          <Grid gutter="md" align="center">
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Grid gutter="md" align="center">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DateButtonPicker
                    label="Từ ngày"
                    value={filtersDate.fromDate}
                    valueFormat="DD/MM/YYYY"
                    onChange={(date: any) =>
                      setFiltersDate((prev) => ({ ...prev, fromDate: date }))
                    }
                    title="Từ ngày"
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DateButtonPicker
                    label="Đến ngày"
                    value={filtersDate.toDate}
                    valueFormat="DD/MM/YYYY"
                    onChange={(date: any) =>
                      setFiltersDate((prev) => ({ ...prev, toDate: date }))
                    }
                    title="Đến ngày"
                  />
                </Grid.Col>
              </Grid>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 7 }}>
              <ThuTucSelect
                value={filtersDate.thuTuc}
                onChange={(v: any) =>
                  setFiltersDate((prev) => ({ ...prev, thuTuc: v }))
                }
              />
            </Grid.Col>

            <Grid.Col
              span={{ base: 12, md: 2 }}
              style={{ display: "flex", justifyContent: "flex-end" }}
            >
              <Button
                onClick={handleFetchThongKe}
                leftSection={<IconSearch size={16} />}
                size="md"
                radius="lg"
                style={{
                  background: "linear-gradient(135deg, #6EA8FF, #4E7BFA)",
                  boxShadow:
                    "0px 4px 12px rgba(78, 123, 250, 0.35), inset 0px -2px 4px rgba(255,255,255,0.3)",
                  backdropFilter: "blur(6px)",
                  color: "white",
                  fontWeight: 600,
                  paddingInline: 24,
                  transition: "0.25s ease",
                  width: "100%",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0px 6px 18px rgba(78, 123, 250, 0.45)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0px 4px 12px rgba(78, 123, 250, 0.35)";
                }}
              >
                Tìm kiếm
              </Button>
            </Grid.Col>
          </Grid>
        )}
      </> */}

<>
  {loading ? (
    <Skeleton height={80} radius="lg" />
  ) : (
    <Flex gap="md" align="stretch" wrap="wrap">
      {/* CỤM NGÀY – WIDTH CỐ ĐỊNH */}
      <Flex gap="md">
        <Box w={150}>
          <DateButtonPicker
            label="Từ ngày"
            value={filtersDate.fromDate}
            valueFormat="DD/MM/YYYY"
            onChange={(date: any) =>
              setFiltersDate((prev) => ({ ...prev, fromDate: date }))
            }
            title="Từ ngày"
          />
        </Box>
=======
      {/* Quick Stats Grid */}
        <QuickStatsCards stats={stats} />
>>>>>>> 11f35a4 (Hoàn thành giao diện trang dashboard)

        {/* Recent History Table */}
        <RecentHistoryTable history={historyData} />

        {/* Charts Grid */}
        <Stack gap="lg">
          <Title order={3} fw={800} c="#0f172a" style={{ letterSpacing: '-0.25px', marginTop: '10px' }}>
            {t("chartsTitle")}
          </Title>

<<<<<<< HEAD
{/* BUTTON – WIDTH CỐ ĐỊNH, KHÔNG ĐÈ */ }
<Box
  style={{
    display: "flex",
    alignItems: "center",
  }}
>
  <Button
    onClick={handleFetchThongKe}
    leftSection={<IconSearch size={16} />}
    size="md"
    radius="lg"
    style={{
      background: "linear-gradient(135deg, #6EA8FF, #4E7BFA)",
      boxShadow:
        "0px 4px 12px rgba(78, 123, 250, 0.35), inset 0px -2px 4px rgba(255,255,255,0.3)",
      backdropFilter: "blur(6px)",
      color: "white",
      fontWeight: 600,
      transition: "0.25s ease",
      minWidth: "auto",
    }}
  >
    Tìm kiếm
  </Button>
</Box>
          </Flex >
        )}
      </>
=======
        {/* Time In/Out Chart */}
        <TimeInOutChart
          data={timeData}
          date={selectedDate}
          onDateChange={setSelectedDate}
          timeUnit={timeUnit}
          onTimeUnitChange={setTimeUnit}
        />
>>>>>>> 11f35a4 (Hoàn thành giao diện trang dashboard)

  {/* Top 5 Students Chart */ }
  < TopStudentsChart />

  {/* Mid-Row: Ktx In/Out Chart & Ktx Distribution (Donut) */ }
  < Grid gutter = "xl" align = "stretch" >
          <Grid.Col span={{ base: 12, md: 6 }}>
            <KtxInOutChart data={ktxInOutData} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <KtxDistributionChart />
          </Grid.Col>
        </Grid >

<<<<<<< HEAD
  {/* Cột phải */ }
  < Grid.Col span = {{ base: 12, lg: 5 }}>
  {
    loading?(
            <Skeleton height = { 360} radius = "lg" />
          ): (
        <Card withBorder radius = "lg" p = "lg" style = {{ height: 450 }} >
              <Title order={4} mb="sm">
                Tỷ trọng theo loại phương tiện
              </Title>
              <Text size="sm" c="dimmed" mb="md">
                Tổng số phương tiện: <strong>{tongXe}</strong>
              </Text>
              <Box h="calc(100% - 60px)">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, right: 60, bottom: 0, left: 60 }}>
                    <Pie
                      data={pieDataDynamic}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={100}
                      labelLine={false}
                      label={({ value }) => `${value}%`}
                    >
                      {pieDataDynamic.map((entry: any, idx: number) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        border: "none",
                        borderRadius: "10px",
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        padding: "8px 12px",
                      }}
                      formatter={(value, name, props) => [
                        <span
                          style={{
                            wordWrap: "break-word",
                            whiteSpace: "normal",
                            maxWidth: "180px",
                          }}
                        >
                          <strong style={{ color: "#6E7CF6" }}>
                            {props?.payload?.name || "Loại phương tiện"}
                          </strong>
                          <br />
                          Tỷ trọng: {`${value}%`}
                        </span>,
                      ]}
                      wrapperStyle={{ maxWidth: "180px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>{ " " }
<Box
  mt="md"
  style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
>
  <IconNotes
    size={24}
    color="#6E7CF6"
    style={{ cursor: "pointer" }}
    onClick={handleOpenModal}
  />
</Box>
            </Card >
          )}
        </Grid.Col >
      </Grid >

  {/* Danh sách */ }
  < Grid gutter = "xl" >
    <Grid.Col span={{ base: 12 }}>
      {loading ? (
        <Card withBorder radius="lg" p="lg">
          <Skeleton height={30} width="40%" mb="md" />
          <Skeleton height={180} radius="md" />
        </Card>
      ) : (
        <RecentPaymentsCard
          paginatedData={paginatedData}
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          setPage={setPage}
          setPageSize={setPageSize}
          fetchChiTietPhiDichVu={fetchChiTietPhiDichVu}
          fetchData={_fetchListHoSoDangKiem}
        />
      )}
    </Grid.Col>
      </Grid >

  {/* Modal hiển thị chi tiết */ }
  < Modal
opened = { opened }
onClose = {() => setOpened(false)}
title = {
          < Box >
  <Title order={3} c="#0b0f1a" component="div">
    Chi tiết phí dịch vụ
  </Title>
          </Box >
        }
centered
radius = "lg"
size = { isMobile? "95%": "70%" }
  >
{
  selectedPhiDichVu?(
          <Stack gap = "md" >
      {/* --- Phần TT PDV --- */ }
      < Box
              p = "md"
              style = {{
      borderRadius: 12,
      border: "1px solid #dee2e6",
      background: "#f9fafb",
    }}
  >
              <Title order={5} mb="sm">
                Thông tin phí dịch vụ
              </Title>
              <Group justify="space-between" mb="xs">
                <Text fw={600}>Biển kiểm soát:</Text>
                <Text>{selectedPhiDichVu.bienKiemSoat}</Text>
              </Group>
              <Group justify="space-between" mb="xs">
                <Text fw={600}>Tên phương tiện:</Text>
                <Text>{selectedPhiDichVu.lptTen}</Text>
              </Group>
              <Divider my="xs" />
              <Group justify="space-between">
                <Text fw={600}>Tổng phí:</Text>
                <Text fz="lg" fw={700} c="teal">
                  {selectedPhiDichVu.tongPhiDichVu?.toLocaleString()} đ
                </Text>
              </Group>
            </Box >

  {/* --- Phần DS PDV --- */ }
  < Box >
              <Title order={5} mb="sm">
                Danh sách phí dịch vụ
              </Title>
              <Table
                // withTableBorder
                highlightOnHover
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Tên phí</Table.Th>
                    <Table.Th>Giá tiền</Table.Th>
                    <Table.Th
                      style={{
                        textAlign: "center",
                      }}
                    >
                      Trạng thái thanh toán
                    </Table.Th>
                    <Table.Th
                      style={{
                        textAlign: "center",
                      }}
                    >
                      Hình thức thanh toán
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {selectedPhiDichVu?.danhSachPhiDichVu.length > 0 ? (
                    selectedPhiDichVu.danhSachPhiDichVu.map(
                      (phi: any, idx: number) => (
                        <Table.Tr key={idx}>
                          <Table.Td>{phi.tenPhi}</Table.Td>
                          <Table.Td>
                            {phi.phiThucTe?.toLocaleString() ?? 0} đ
                          </Table.Td>
                          <Table.Td
                            style={{
                              textAlign: "center",
                            }}
                          >
                            {phi.trangThaiThanhToan ? (
                              <Badge color="teal">Đã thanh toán</Badge>
                            ) : (
                              <Badge color="orange">Chưa thanh toán</Badge>
                            )}
                          </Table.Td>
                          <Table.Td
                            style={{
                              textAlign: "center",
                            }}
                          >
                            {phi.hinhThucThanhToan === 1 ? (
                              <Badge color="green">Trực tuyến</Badge>
                            ) : (
                              <Badge color="violet">Trực tiếp</Badge>
                            )}
                          </Table.Td>
                        </Table.Tr>
                      ),
                    )
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={4}>
                        <Text c="dimmed" ta="center">
                          Không có dữ liệu phí dịch vụ
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </Box >
          </Stack >
        ) : (
  <Text c="dimmed">Đang tải dữ liệu...</Text>
)}
      </Modal >

  {/* Modal hiển thị danh sách phương tiện Tỷ trọng theo loại phương tiện*/ }
  < Modal
opened = { openedListXe } // Điều kiện hiển thị modal
onClose = { handleCloseModal } // Đóng modal khi nhấn close
title = {
          < Box >
  <Title order={4} component="div">
    Danh sách phương tiện theo loại
  </Title>
          </Box >
        }
centered
radius = "lg"
size = "lg"
  >
  <Flex
    direction="column"
    wrap="wrap"
    gap="sm"
    mt="sm"
    style={{ alignItems: "flex-start" }}
  >
    {pieDataDynamic.map((item: any, idx: any) => (
      <Flex
        key={idx}
        style={{
          width: "100%",
          justifyContent: "flex-start",
        }}
      >
        <Box
          style={{
            width: 15,
            height: 15,
            // borderRadius: "50%",
            backgroundColor: item.color,
            marginRight: 15,
            marginTop: 5,
          }}
        />
        <span>
          <Text size="sm" c="#353636f5" mr={6}>
            {item.value}%
          </Text>
          <Text size="sm" c="#6E7CF6">
            {item.name}
          </Text>
        </span>
      </Flex>
    ))}
  </Flex>
      </Modal >

  {/* Modal hiển thị danh sách phương tiện Lượt đăng kiểm theo loại phương tiện*/ }
  < Modal
opened = { openedListXeByDangKiem } // Điều kiện hiển thị modal
onClose = { handleCloseModalByDangKiem } // Đóng modal khi nhấn close
title = {
          < Box >
  <Title order={4} component="div">
    Danh sách phương tiện theo loại
  </Title>
          </Box >
        }
centered
radius = "lg"
size = "lg"
  >
  <Flex direction="column" gap="xs" mt="sm">
    {dashboard?.danhSachPhuongTienDangKiemThangHienTai?.map(
      (item: any, idx: number) => (
        <Flex
          key={idx}
          style={{
            width: "100%",
            justifyContent: "flex-start",
          }}
        >
          <Box
            style={{
              width: 15,
              height: 15,
              // borderRadius: "50%",
              backgroundColor: item.color,
              marginRight: 15,
              marginTop: 5,
            }}
          />
          <span>
            <Text size="sm" c="#353636f5" mr={6}>
              {item.soLuotDangKiem}
              {" Xe"}
            </Text>
            <Text size="sm" c="#6E7CF6">
              {item.lptTen}
            </Text>
          </span>
        </Flex>
      ),
    )}
  </Flex>
      </Modal >
=======
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
>>>>>>> 11f35a4 (Hoàn thành giao diện trang dashboard)
    </Stack >
  );
}
