/* eslint-disable react/jsx-key */
"use client";

// import {
//   GetThongKeChiTietPhiDichVu,
//   GetThongKeDashBoard,
//   GetThongKePhiDichVu,
// } from "@/services/thong-ke/thongKeService";
import {
  Box,
  Card,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Table,
  Badge,
  Modal,
  Divider,
  Button,
  Flex,
} from "@mantine/core";
import {
  IconCircleCheck,
  IconCurrencyDong,
  IconCar,
  IconAlertTriangle,
  IconSearch,
  IconUser,
  IconNotes,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useMediaQuery } from "@mantine/hooks";
import { Skeleton } from "@mantine/core";
import "@mantine/dates/styles.css";
import DateFilterInput from "@/components/common/DateRangeFilter";
// import { ThongKePhiDichVuItem } from "@/types/global";
import CustomPagination from "@/components/common/CustomPagination";
import BienSoComponent from "./BienSoComponent";
import DateButtonPicker from "./DateButtonPicker";
import dayjs from "dayjs";
import { ThuTucSelect } from "./ThuTucSelect";
import RecentPaymentsCard from "./RecentPaymentsCard";
function StatCard({
  icon,
  title,
  value,
  caption,
  iconBg,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  caption: string;
  iconBg: string;
}) {
  return (
    <Card withBorder radius="lg" p="lg">
      <Group align="flex-start" gap="md">
        <Box
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            display: "grid",
            placeItems: "center",
            background: iconBg,
          }}
        >
          {icon}
        </Box>
        <Stack gap={6} style={{ flex: 1 }}>
          <Text c="dimmed" fw={600}>
            {title}
          </Text>
          <Title order={2}>{value}</Title>
          <Text size="sm" c="teal.6" fw={600}>
            {caption}
          </Text>
        </Stack>
      </Group>
    </Card>
  );
}
const colors = [
  "#E800C8",
  "#C9522F",
  "#10B981",
  "#F59E0B",
  "#6557FF",
  "#1A0891",
];
const colorsBarChar = [
  "#10B981",
  "#6557FF",
  "#1A0891",
  "#E800C8",
  "#C9522F",
  "#F59E0B",
];
export default function DashboardPage() {
  //-- biến khởi tạo hằng số
  const isMobile = useMediaQuery("(max-width: 768px)");
  //--- useState ------
  const [dashboard, setDashboard] = useState<any>(null);
  // const [dataPhiDichVu, setDataPhiDichVu] = useState<ThongKePhiDichVuItem[]>(
  //   [],
  // );
  const [dataPhiDichVu, setDataPhiDichVu] = useState<any[]>([]);
  const [selectedPhiDichVu, setSelectedPhiDichVu] = useState<any>(null);
  const [opened, setOpened] = useState(false);
  const [openedListXe, setOpenedListXe] = useState(false);
  const [openedListXeByDangKiem, setOpenedListXeByDangKiem] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- Thêm useState cho paginate ---
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  // const [paginatedData, setPaginatedData] = useState<ThongKePhiDichVuItem[]>(
  //   [],
  // );
  const [paginatedData, setPaginatedData] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // --- Hàm xử lý cắt dữ liệu full thành paginated ---
  const handlePaginate = (
    // fullData: ThongKePhiDichVuItem[],
    fullData: any[],
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

  // const fetchThongKeDashBoard = async () => {
  //   try {
  //     //  Chuẩn hóa 100% trước khi gọi API
  //     const tuNgay = normalizeDateForApi(filtersDate.fromDate, "01/01/2025");
  //     const denNgay = normalizeDateForApi(filtersDate.toDate, "12/31/2025");

  //     const res = await GetThongKeDashBoard({
  //       tuNgay,
  //       denNgay,
  //     });

  //     const payload = res.payload;

  //     payload.danhSachPhuongTienDangKiemThangHienTai =
  //       payload?.danhSachPhuongTienDangKiemThangHienTai?.map(
  //         (item: any, idx: number) => ({
  //           ...item,
  //           lptTen: item.lptTen || "Không xác định",
  //           color: colorsBarChar[idx % colorsBarChar.length],
  //         }),
  //       );
  //     setDashboard(payload);
  //     return res;
  //   } catch (err) {
  //     console.error("Fetch dashboard error:", err);
  //   }
  // };

  // const fetchThongKePhiDichVu = async () => {
  //   try {
  //     const tuNgay = normalizeDateForApi(filtersDate.fromDate, "01/01/2025");
  //     const denNgay = normalizeDateForApi(filtersDate.toDate, "12/31/2025");

  //     const res = await GetThongKePhiDichVu({
  //       tuNgay: tuNgay,
  //       denNgay: denNgay,
  //     });

  //     // setDataPhiDichVu(res.payload);
  //     setDataPhiDichVu(res.payload || []);
  //     return res;
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  // const fetchChiTietPhiDichVu = async (hsId: number, row: any) => {
  //   const tuNgay = normalizeDateForApi(filtersDate.fromDate, "01/01/2025");
  //   const denNgay = normalizeDateForApi(filtersDate.toDate, "12/31/2025");

  //   const res = await GetThongKeChiTietPhiDichVu({
  //     tuNgay: tuNgay,
  //     denNgay: denNgay,
  //     hsId,
  //   });
  //   const chiTiet = res.payload[0];
  //   setSelectedPhiDichVu({
  //     ...row,
  //     danhSachPhiDichVu: chiTiet?.danhSachPhiDichVu ?? [],
  //   });
  //   setOpened(true);
  // };

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
    // handleFetchThongKe();
  }, []);

  // const handleFetchThongKe = async () => {
  //   setLoading(true);
  //   try {
  //     await Promise.all([fetchThongKeDashBoard(), fetchThongKePhiDichVu()]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    // if (dataPhiDichVu.length > 0) {
    //   handlePaginate(dataPhiDichVu, 1, pageSize);
    // }
  }, [dataPhiDichVu, pageSize]);

  const handleOpenModal = () => {
    setOpenedListXe(true);
  };
  const handleOpenModalByDangKiem = () => {
    setOpenedListXeByDangKiem(true);
  };

  // Hàm đóng modal
  const handleCloseModal = () => {
    setOpenedListXe(false);
  };
  const handleCloseModalByDangKiem = () => {
    setOpenedListXeByDangKiem(false);
  };

  return (
    <Stack gap="xl">
      {/* Thẻ thống kê */}
      <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={120} radius="lg" />
          ))
        ) : (
          <>
            <StatCard
              icon={<IconCar size={18} color="#6E7CF6" />}
              title="Tổng phương tiện đăng kiểm"
              value={dashboard?.tongXeDangKiemThangHienTai?.toString() ?? "--"}
              caption="Trong tháng hiện tại"
              iconBg="linear-gradient(135deg,#E9EBFF,#F3F5FF)"
            />
            <StatCard
              icon={<IconCircleCheck size={18} color="#2FBF71" />}
              title="Phương tiện đạt đăng kiểm"
              value={dashboard?.soLuongXeDangKiemDat?.toString() ?? "--"}
              caption={`Tỉ lệ ${(dashboard?.tiLeDangKiemDat * 100 || 0).toFixed(
                1,
              )}%`}
              iconBg="linear-gradient(135deg,#E8FFF3,#F6FFF9)"
            />
            <StatCard
              icon={<IconAlertTriangle size={18} color="#D6AC00" />}
              title="Phương tiện không đạt"
              value={dashboard?.soLuongXeDangKiemKhongDat?.toString() ?? "--"}
              caption={`Tỉ lệ ${(
                dashboard?.tiLeDangKiemKhongDat * 100 || 0
              ).toFixed(1)}%`}
              iconBg="linear-gradient(135deg,#FFF9E6,#FFFBF0)"
            />
            <StatCard
              icon={<IconCurrencyDong size={18} color="#8B5CF6" />}
              title="Tổng thu phí"
              value={`${
                dashboard?.tongPhiDangKiemThangHienTai?.toLocaleString() || 0
              } đ`}
              caption="Trong tháng hiện tại"
              iconBg="linear-gradient(135deg,#F5E9FF,#FBF6FF)"
            />
          </>
        )}
      </SimpleGrid>

      {/* Bộ lọc */}
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

              <Box w={150}>
                <DateButtonPicker
                  label="Đến ngày"
                  value={filtersDate.toDate}
                  valueFormat="DD/MM/YYYY"
                  onChange={(date: any) =>
                    setFiltersDate((prev) => ({ ...prev, toDate: date }))
                  }
                  title="Đến ngày"
                />
              </Box>
            </Flex>

            {/* THỦ TỤC – ĂN HẾT PHẦN CÒN LẠI */}
            <Box style={{ flex: 1, minWidth: 280 }}>
              <ThuTucSelect
                value={filtersDate.thuTuc}
                onChange={(v: any) =>
                  setFiltersDate((prev) => ({ ...prev, thuTuc: v }))
                }
              />
            </Box>

            {/* BUTTON – WIDTH CỐ ĐỊNH, KHÔNG ĐÈ */}
            <Box
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Button
                // onClick={handleFetchThongKe}
                onClick={() => {}}
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
          </Flex>
        )}
      </>

      {/* Biểu đồ */}
      <Grid gutter="xl" align="stretch">
        {/* Cột trái */}
        <Grid.Col span={{ base: 12, lg: 7 }}>
          {loading ? (
            <Skeleton height={360} radius="lg" />
          ) : (
            <Card withBorder radius="lg" p="lg" style={{ height: 450 }}>
              <Title order={4} mb="md">
                Lượt đăng kiểm theo loại phương tiện
              </Title>
              <Box h="100%" px="sm">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={
                      dashboard?.danhSachPhuongTienDangKiemThangHienTai ?? []
                    }
                    barCategoryGap="20%"
                    barGap={5}
                    margin={{ top: 30, left: 20, right: 0, bottom: 30 }}
                  >
                    <XAxis
                      dataKey="lptTen"
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fontSize: 12,
                        fill: "#374151",
                        textAnchor: "end",
                      }}
                      angle={0} // độ nghiên cửa lable
                      interval={0}
                      height={60}
                      // tickFormatter={(v) =>
                      //   v.length > 10 ? v.slice(0, 10) + "..." : v
                      // }

                      tickFormatter={(v) => {
                        if (!v) return "Không xác định";
                        return v.length > 10 ? v.slice(0, 10) + "..." : v;
                      }}
                    />
                    <Tooltip
                      labelFormatter={() => "  "}
                      cursor={{
                        fill: "transparent",
                        width: 40,
                      }}
                      contentStyle={{
                        borderRadius: "10px",
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                      formatter={(value, name, props) => {
                        const item = props?.payload;
                        const tongXe =
                          dashboard?.tongXeDangKiemThangHienTai || 1;
                        const tiLe = (
                          (item?.soLuotDangKiem / tongXe) *
                          100
                        ).toFixed(1);
                        return [
                          <span
                            style={{
                              wordWrap: "break-word",
                              whiteSpace: "normal",
                              maxWidth: "220px",
                              display: "block",
                              lineHeight: "1.6",
                              color: "#222",
                            }}
                          >
                            <strong style={{ color: "#6E7CF6" }}>
                              {item?.lptTen}
                            </strong>
                            <br />
                            Số lượt đăng kiểm: {item?.soLuotDangKiem ?? 0}
                            <br />
                            Tỷ trọng: {tiLe}%
                          </span>,
                        ];
                      }}
                    />
                    <Bar
                      dataKey="soLuotDangKiem"
                      radius={[8, 8, 0, 0]}
                      isAnimationActive={false}
                    >
                      {dashboard?.danhSachPhuongTienDangKiemThangHienTai?.map(
                        (entry: any, idx: number) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ),
                      )}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>{" "}
              <Box
                mt="md"
                style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
              >
                <IconNotes
                  size={24}
                  color="#6E7CF6"
                  style={{ cursor: "pointer" }}
                  onClick={handleOpenModalByDangKiem}
                />
              </Box>
            </Card>
          )}
        </Grid.Col>

        {/* Cột phải */}
        <Grid.Col span={{ base: 12, lg: 5 }}>
          {loading ? (
            <Skeleton height={360} radius="lg" />
          ) : (
            <Card withBorder radius="lg" p="lg" style={{ height: 450 }}>
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
              </Box>{" "}
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
            </Card>
          )}
        </Grid.Col>
      </Grid>

      {/* Danh sách */}
      <Grid gutter="xl">
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
              // fetchChiTietPhiDichVu={fetchChiTietPhiDichVu}
              fetchChiTietPhiDichVu={() => {}}
              fetchData={_fetchListHoSoDangKiem}
            />
          )}
        </Grid.Col>
      </Grid>

      {/* Modal hiển thị chi tiết */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={
          <Box>
            <Title order={3} c="#0b0f1a" component="div">
              Chi tiết phí dịch vụ
            </Title>
          </Box>
        }
        centered
        radius="lg"
        size={isMobile ? "95%" : "70%"}
      >
        {selectedPhiDichVu ? (
          <Stack gap="md">
            {/* --- Phần TT PDV --- */}
            <Box
              p="md"
              style={{
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
            </Box>

            {/* --- Phần DS PDV --- */}
            <Box>
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
            </Box>
          </Stack>
        ) : (
          <Text c="dimmed">Đang tải dữ liệu...</Text>
        )}
      </Modal>

      {/* Modal hiển thị danh sách phương tiện Tỷ trọng theo loại phương tiện*/}
      <Modal
        opened={openedListXe} // Điều kiện hiển thị modal
        onClose={handleCloseModal} // Đóng modal khi nhấn close
        title={
          <Box>
            <Title order={4} component="div">
              Danh sách phương tiện theo loại
            </Title>
          </Box>
        }
        centered
        radius="lg"
        size="lg"
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
      </Modal>

      {/* Modal hiển thị danh sách phương tiện Lượt đăng kiểm theo loại phương tiện*/}
      <Modal
        opened={openedListXeByDangKiem} // Điều kiện hiển thị modal
        onClose={handleCloseModalByDangKiem} // Đóng modal khi nhấn close
        title={
          <Box>
            <Title order={4} component="div">
              Danh sách phương tiện theo loại
            </Title>
          </Box>
        }
        centered
        radius="lg"
        size="lg"
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
      </Modal>
    </Stack>
  );
}
