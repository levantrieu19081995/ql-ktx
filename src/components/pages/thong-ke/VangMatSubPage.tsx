"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DateInput } from "@mantine/dates";
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
  Select,
  Button,
  ThemeIcon,
  Loader,
  Center,
  Pagination,
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
} from "recharts";
import { fetchThongKeRaVao } from "@/services/dashboard/thongkeService";

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

const getDefaultDates = () => {
  const den = new Date();
  const tu = new Date();
  tu.setDate(tu.getDate() - 30); // 30 ngày trước
  return { tu, den };
};

export default function VangMatSubPage() {
  const [hoTen, setHoTen] = useState("");
  const [mssv, setMssv] = useState("");
  
  const [tuNgay, setTuNgay] = useState<Date | null>(() => getDefaultDates().tu);
  const [denNgay, setDenNgay] = useState<Date | null>(() => getDefaultDates().den);
  const [khuKtx, setKhuKtx] = useState("Tất cả");
  const [trangThai, setTrangThai] = useState("Tất cả");
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [absentList, setAbsentList] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadAbsentData = useCallback(async (overrides?: { tuNgay?: Date | null; denNgay?: Date | null }) => {
    setLoading(true);
    setError(null);
    try {
      const activeTu = (overrides && overrides.tuNgay !== undefined) ? overrides.tuNgay : tuNgay;
      const activeDen = (overrides && overrides.denNgay !== undefined) ? overrides.denNgay : denNgay;

      const formatDate = (dateVal: Date | null, defaultToToday: boolean): string => {
        if (dateVal && !isNaN(dateVal.getTime())) {
          const mm = String(dateVal.getMonth() + 1).padStart(2, "0");
          const dd = String(dateVal.getDate()).padStart(2, "0");
          const yyyy = dateVal.getFullYear();
          return `${mm}/${dd}/${yyyy}`;
        }
        const fallbackDate = defaultToToday ? getDefaultDates().den : getDefaultDates().tu;
        const mm = String(fallbackDate.getMonth() + 1).padStart(2, "0");
        const dd = String(fallbackDate.getDate()).padStart(2, "0");
        const yyyy = fallbackDate.getFullYear();
        return `${mm}/${dd}/${yyyy}`;
      };

      const res = await fetchThongKeRaVao({
        tuNgay: formatDate(activeTu, false),
        denNgay: formatDate(activeDen, true),
      });

      const list = res?.payload || [];
      const endTs = activeDen && !isNaN(activeDen.getTime()) ? activeDen.getTime() : Date.now();
      
      const mappedAbsent = list.map((item: any, index: number) => {
        let lastActiveTs = 0;
        
        // Tìm timestamp của lần quét thẻ gần nhất trong danh sách vào và ra
        if (Array.isArray(item.danhSachVao)) {
          item.danhSachVao.forEach((s: any) => {
            const tc = Number(s.timecheck);
            if (!isNaN(tc) && tc > 0) {
              const ms = tc < 10000000000 ? tc * 1000 : tc;
              if (ms > lastActiveTs) lastActiveTs = ms;
            }
          });
        }
        
        if (Array.isArray(item.danhSachRa)) {
          item.danhSachRa.forEach((s: any) => {
            const tc = Number(s.timecheck);
            if (!isNaN(tc) && tc > 0) {
              const ms = tc < 10000000000 ? tc * 1000 : tc;
              if (ms > lastActiveTs) lastActiveTs = ms;
            }
          });
        }

        // Tính số ngày vắng mặt
        let absentDays = 0;
        let lastScanStr = "Chưa quét";
        
        if (lastActiveTs > 0) {
          const diffMs = endTs - lastActiveTs;
          absentDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
          
          const d = new Date(lastActiveTs);
          const dd = String(d.getDate()).padStart(2, "0");
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const yyyy = d.getFullYear();
          lastScanStr = `${dd}/${mm}/${yyyy}`;
        } else {
          // Nếu chưa bao giờ quét thẻ trong kỳ, tính vắng từ ngày bắt đầu truy vấn
          const start = activeTu || getDefaultDates().tu;
          const diffMs = endTs - start.getTime();
          absentDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        }

        return {
          stt: index + 1,
          studentId: item.maSinhVien || item.maSo || `SV${index}`,
          hoTen: item.hoTen || "Chưa rõ",
          ktx: resolveKhu(item),
          room: item.maPhong || "--",
          absentDays,
          lastScan: lastScanStr,
          status: absentDays > 15 ? "Cảnh báo" : absentDays > 7 ? "Nghi vấn" : "Hợp lệ",
        };
      });

      setAbsentList(mappedAbsent);
      console.log("[VangMat] fetchThongKeRaVao payload sample:", list[0]);
    } catch (err: any) {
      setError(err?.message || "Lỗi khi tải dữ liệu sinh viên vắng mặt");
      setAbsentList([]);
    } finally {
      setLoading(false);
    }
  }, [tuNgay, denNgay]);

  useEffect(() => {
    loadAbsentData();
  }, [loadAbsentData]);

  const handleReset = () => {
    setHoTen("");
    setMssv("");
    const defaults = getDefaultDates();
    setTuNgay(defaults.tu);
    setDenNgay(defaults.den);
    setKhuKtx("Tất cả");
    setTrangThai("Tất cả");
    setCurrentPage(1);
    loadAbsentData({ tuNgay: defaults.tu, denNgay: defaults.den });
  };

  const normalizeKhu = (val: string | undefined | null): string => {
    if (!val) return "";
    const s = String(val).toLowerCase().replace(/[_\-\s]+/g, "");
    if (s.includes("a")) return "Khu A";
    if (s.includes("b")) return "Khu B";
    return val;
  };

  const filteredAbsent = absentList.filter((item) => {
    if (!item) return false;
    const name = item.hoTen || "";
    const id = item.studentId || "";
    const ktxStr = item.ktx || "";
    const statusStr = item.status || "";

    const matchName = name.toLowerCase().includes(hoTen.toLowerCase());
    const matchMssv = id.toLowerCase().includes(mssv.toLowerCase());
    const matchKhu = khuKtx === "Tất cả" || normalizeKhu(ktxStr) === khuKtx;
    const matchTrangThai = trangThai === "Tất cả" || statusStr === trangThai;
    return matchName && matchMssv && matchKhu && matchTrangThai;
  });

  const totalPages = Math.ceil(filteredAbsent.length / pageSize);
  const paginatedAbsent = filteredAbsent.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Calculate dynamic bar chart from data
  const chartData = filteredAbsent.length > 0
    ? [
        { name: "5-10 ngày", value: filteredAbsent.filter(s => s.absentDays <= 10).length },
        { name: "11-15 ngày", value: filteredAbsent.filter(s => s.absentDays > 10 && s.absentDays <= 15).length },
        { name: "Trên 15 ngày", value: filteredAbsent.filter(s => s.absentDays > 15).length }
      ]
    : [
        { name: "5-10 ngày", value: 0 },
        { name: "11-15 ngày", value: 0 },
        { name: "Trên 15 ngày", value: 0 }
      ];

  return (
    <Stack gap="xl" p="sm" style={{ backgroundColor: "#fafbfd", minHeight: "100vh", fontFamily: "var(--font-readex-pro), sans-serif" }}>
      <Group gap="md">
        <ThemeIcon size={38} variant="light" color="blue" style={{ backgroundColor: "#e0f2fe" }}>
          <IconReportAnalytics size={20} color="#1f5ca9" />
        </ThemeIcon>
        <Title order={2} fw={800} c="#1f5ca9" style={{ letterSpacing: "-0.5px", fontFamily: "var(--font-readex-pro), sans-serif" }}>
          THỐNG KÊ SINH VIÊN VẮNG MẶT LÂU NGÀY
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
                data={["Tất cả", "Cảnh báo", "Nghi vấn"]}
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

          {/* Advanced filters: Họ tên, MSSV */}
          {showAdvancedFilter && (
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6, md: 6 }}>
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
              <Grid.Col span={{ base: 12, sm: 6, md: 6 }}>
                <TextInput
                  label="MSSV / MÃ SỐ"
                  placeholder="Nhập MSSV..."
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
              onClick={() => loadAbsentData()}
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
            <Text size="sm" c="dimmed">Đang tải báo cáo vắng mặt...</Text>
          </Stack>
        </Center>
      ) : (
        <>
          <Grid gutter="md">
            <Grid.Col span={12}>
              <Card withBorder radius="lg" p="lg" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}>
                <Text fw={700} size="sm" c="dimmed" mb="md" style={{ letterSpacing: "0.5px" }}>
                  THỐNG KÊ SINH VIÊN VẮNG MẶT THEO SỐ NGÀY
                </Text>
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#fa5252" radius={[4, 4, 0, 0]} label={{ position: "top" }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Grid.Col>
          </Grid>

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
                  {paginatedAbsent.map((row, index) => (
                    <Table.Tr key={row.studentId || index} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <Table.Td style={{ fontSize: "13px", color: "#64748b" }}>
                        {(currentPage - 1) * pageSize + index + 1}
                      </Table.Td>
                      <Table.Td style={{ fontSize: "13px", color: "#64748b", fontFamily: "monospace" }}>{row.studentId}</Table.Td>
                      <Table.Td style={{ fontSize: "13px", color: "#1e293b", fontWeight: 600 }}>{row.hoTen}</Table.Td>
                      <Table.Td style={{ fontSize: "13px", color: "#475569" }}>{row.ktx}</Table.Td>
                      <Table.Td style={{ fontSize: "13px", color: "#475569" }}>{row.room}</Table.Td>
                      <Table.Td style={{ fontSize: "13px", color: "#e03131", fontWeight: 700, textAlign: "center" }}>{row.absentDays} ngày</Table.Td>
                      <Table.Td style={{ fontSize: "13px", color: "#475569" }}>{row.lastScan}</Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        <Badge color={row.status === "Cảnh báo" ? "red" : "yellow"} variant="light" size="sm">
                          {row.status}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  {paginatedAbsent.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={8}>
                        <Text ta="center" c="dimmed" py="xl">Không tìm thấy sinh viên vắng mặt lâu ngày phù hợp</Text>
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
                  styles={{
                    control: {
                      fontFamily: "var(--font-readex-pro), sans-serif",
                      "&[data-active]": {
                        backgroundColor: "#1f5ca9",
                      },
                    },
                  }}
                />
              </Group>
            )}
          </Card>
        </>
      )}
    </Stack>
  );
}
