"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Button,
  ThemeIcon,
  SimpleGrid,
  Loader,
  Center,
  Pagination,
  Paper,
  Box,
} from "@mantine/core";
import {
  IconSearch,
  IconRefresh,
  IconDownload,
  IconReportAnalytics,
  IconUser,
  IconChevronDown,
  IconId,
} from "@tabler/icons-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { fetchThongKeTheoMaSo, fetchSinhVienPaginate } from "@/services/dashboard/dashboardService";

export default function TheoMaSoSubPage() {
  const [hoTen, setHoTen] = useState("");
  const [mssv, setMssv] = useState("");
  const [tuNgay, setTuNgay] = useState<Date | null>(null);
  const [denNgay, setDenNgay] = useState<Date | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentSummary, setStudentSummary] = useState<any>(null);
  const [weeklyChartData, setWeeklyChartData] = useState<any[]>([]);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const pageSize = 10;

  // Autocomplete search states
  const [svSuggestions, setSvSuggestions] = useState<any[]>([]);
  const [svLoading, setSvLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleInputChange = (value: string, type: "hoTen" | "mssv") => {
    if (type === "hoTen") {
      setHoTen(value);
    } else {
      setMssv(value);
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setSvSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSvLoading(true);
      try {
        const params: any = {
          page: 1,
          pageSize: 20,
          maKhu: "-1",
          maPhong: "-1",
        };
        if (type === "hoTen") {
          params.hoTen = value.trim();
        } else {
          params.maSinhVien = value.trim();
        }

        const res = await fetchSinhVienPaginate(params);
        const items = res?.payload?.items || [];
        setSvSuggestions(items);
        setShowSuggestions(items.length > 0);
      } catch (err) {
        setSvSuggestions([]);
      } finally {
        setSvLoading(false);
      }
    }, 350);
  };

  const handleSelectSv = (sv: any) => {
    setMssv(sv.maSinhVien || sv.maSo || "");
    setHoTen(sv.hoTen || sv.ten || sv.hoVaTen || "");
    setShowSuggestions(false);
    setSvSuggestions([]);
  };

  const handleSearch = async () => {
    let targetMssv = mssv.trim();
    setError(null);

    // Nếu không có mssv nhưng có hoTen, tự động tra cứu để tìm mssv đầu tiên
    if (!targetMssv && hoTen.trim()) {
      setLoading(true);
      try {
        const svRes = await fetchSinhVienPaginate({
          page: 1,
          pageSize: 5,
          maKhu: "-1",
          maPhong: "-1",
          hoTen: hoTen.trim(),
        });
        const svList = svRes?.payload?.items || [];
        if (svList.length === 0) {
          setError("Không tìm thấy sinh viên nào khớp với họ tên đã nhập");
          setLoading(false);
          return;
        }
        targetMssv = svList[0].maSinhVien || svList[0].maSo || "";
        setMssv(targetMssv);
        setHoTen(svList[0].hoTen || svList[0].ten || svList[0].hoVaTen || "");
      } catch (err: any) {
        setError("Lỗi khi tìm kiếm sinh viên theo họ tên");
        setLoading(false);
        return;
      }
    }

    if (!targetMssv) {
      setError("Vui lòng nhập MSSV/Mã số hoặc Họ tên để tìm kiếm");
      return;
    }

    setHistoryPage(1);
    setLoading(true);
    setError(null);
    try {
      const formatDate = (dateVal: Date | null, isStart: boolean): string => {
        if (dateVal && !isNaN(dateVal.getTime())) {
          const mm = String(dateVal.getMonth() + 1).padStart(2, "0");
          const dd = String(dateVal.getDate()).padStart(2, "0");
          const yyyy = dateVal.getFullYear();
          return `${mm}/${dd}/${yyyy}`;
        }
        const now = new Date();
        if (isStart) {
          return `01/01/${now.getFullYear() - 1}`;
        } else {
          const mm = String(now.getMonth() + 1).padStart(2, "0");
          const dd = String(now.getDate()).padStart(2, "0");
          return `${mm}/${dd}/${now.getFullYear()}`;
        }
      };

      const res = await fetchThongKeTheoMaSo({
        maSo: targetMssv,
        tuNgay: formatDate(tuNgay, true),
        denNgay: formatDate(denNgay, false),
      });

      const payload = res?.payload;
      const item = Array.isArray(payload) && payload.length > 0 ? payload[0] : null;

      if (item) {
        setSelectedStudent({
          hoTen: item.hoTen,
          studentId: item.maSo,
          maNhom: item.maNhom
        });
        setStudentSummary({
          luotVao: item.luotVao || 0,
          luotRa: item.luotRa || 0,
          tongLuot: item.tongLuot || 0
        });

        // Compute weekly chart data based on the scans list
        const daysMap: { [key: number]: { name: string; "Lượt vào": number; "Lượt ra": number } } = {
          1: { name: "Thứ 2", "Lượt vào": 0, "Lượt ra": 0 },
          2: { name: "Thứ 3", "Lượt vào": 0, "Lượt ra": 0 },
          3: { name: "Thứ 4", "Lượt vào": 0, "Lượt ra": 0 },
          4: { name: "Thứ 5", "Lượt vào": 0, "Lượt ra": 0 },
          5: { name: "Thứ 6", "Lượt vào": 0, "Lượt ra": 0 },
          6: { name: "Thứ 7", "Lượt vào": 0, "Lượt ra": 0 },
          0: { name: "Chủ Nhật", "Lượt vào": 0, "Lượt ra": 0 },
        };

        const scans = item.danhSach || [];
        scans.forEach((scan: any) => {
          if (scan.timecheck) {
            const date = new Date(scan.timecheck * 1000);
            const dayOfWeek = date.getDay();
            const isVao = String(scan.cameraName || "").toLowerCase().includes("vào") || scan.cameraIdId === 1;
            if (isVao) {
              daysMap[dayOfWeek]["Lượt vào"]++;
            } else {
              daysMap[dayOfWeek]["Lượt ra"]++;
            }
          }
        });

        const weeklyChart = [
          daysMap[1],
          daysMap[2],
          daysMap[3],
          daysMap[4],
          daysMap[5],
          daysMap[6],
          daysMap[0]
        ];
        setWeeklyChartData(weeklyChart);

        // Map scan records to history list
        const mappedHistory = scans.map((scan: any) => {
          const isVao = String(scan.cameraName || "").toLowerCase().includes("vào") || scan.cameraIdId === 1;
          const formatTime = (timecheck: any) => {
            if (!timecheck) return "Chưa cập nhật";
            const d = new Date(timecheck * 1000);
            if (isNaN(d.getTime())) return "Chưa cập nhật";
            const dd = String(d.getDate()).padStart(2, "0");
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const yyyy = d.getFullYear();
            const hh = String(d.getHours()).padStart(2, "0");
            const min = String(d.getMinutes()).padStart(2, "0");
            const ss = String(d.getSeconds()).padStart(2, "0");
            return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
          };

          return {
            time: formatTime(scan.timecheck),
            type: isVao ? "Vào" : "Ra",
            ktx: scan.tenKhu || scan.maKhu || "Khu A",
            room: scan.maPhong || "--",
            status: scan.cameraName || (isVao ? "Camera vào" : "Camera ra"),
          };
        });

        setHistoryList(mappedHistory);
      } else {
        setError("Không tìm thấy thông tin cho mã số này");
        setSelectedStudent(null);
        setStudentSummary(null);
        setWeeklyChartData([]);
        setHistoryList([]);
      }
    } catch (err: any) {
      setError(err?.message || "Lỗi khi tải dữ liệu thống kê theo mã số");
      setSelectedStudent(null);
      setStudentSummary(null);
      setWeeklyChartData([]);
      setHistoryList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setHoTen("");
    setMssv("");
    setTuNgay(null);
    setDenNgay(null);
    setSelectedStudent(null);
    setStudentSummary(null);
    setWeeklyChartData([]);
    setHistoryList([]);
    setHistoryPage(1);
    setError(null);
  };

  const totalHistoryPages = Math.ceil(historyList.length / pageSize);
  const paginatedHistory = historyList.slice((historyPage - 1) * pageSize, historyPage * pageSize);

  return (
    <Stack gap="xl" p="sm" style={{ backgroundColor: "#fafbfd", minHeight: "100vh", fontFamily: "var(--font-readex-pro), sans-serif" }}>
      <Group gap="md">
        <ThemeIcon size={38} variant="light" color="blue" style={{ backgroundColor: "#e0f2fe" }}>
          <IconReportAnalytics size={20} color="#1f5ca9" />
        </ThemeIcon>
        <Title order={2} fw={800} c="#1f5ca9" style={{ letterSpacing: "-0.5px", fontFamily: "var(--font-readex-pro), sans-serif" }}>
          THỐNG KÊ THEO MÃ SỐ (SINH VIÊN / CÁN BỘ)
        </Title>
      </Group>

      <Card withBorder radius="lg" p="lg" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)", borderColor: "#e2e8f0" }}>
        <Stack gap="md" ref={searchRef} style={{ position: "relative" }}>
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <TextInput
                label="HỌ TÊN"
                placeholder="Nhập họ tên để lọc..."
                value={hoTen}
                onChange={(e) => handleInputChange(e.currentTarget.value, "hoTen")}
                styles={{
                  label: { fontSize: "11px", fontWeight: 700, color: "#1f5ca9", marginBottom: "6px", letterSpacing: "0.5px" },
                  input: { borderRadius: "8px", fontFamily: "var(--font-readex-pro), sans-serif" }
                }}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <TextInput
                label="MSSV / MÃ SỐ *"
                placeholder="Nhập MSSV hoặc mã số..."
                value={mssv}
                onChange={(e) => handleInputChange(e.currentTarget.value, "mssv")}
                styles={{
                  label: { fontSize: "11px", fontWeight: 700, color: "#1f5ca9", marginBottom: "6px", letterSpacing: "0.5px" },
                  input: { borderRadius: "8px", fontFamily: "var(--font-readex-pro), sans-serif" }
                }}
              />
            </Grid.Col>
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
          </Grid>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && svSuggestions.length > 0 && (
            <Paper
              shadow="md"
              radius="md"
              style={{
                position: "absolute",
                top: "70px",
                left: 0,
                right: 0,
                zIndex: 1000,
                maxHeight: 220,
                overflowY: "auto",
                border: "1px solid #e2e8f0",
                marginTop: 4,
              }}
            >
              {svSuggestions.map((sv, i) => (
                <Box
                  key={i}
                  onClick={() => handleSelectSv(sv)}
                  style={{
                    padding: "10px 14px",
                    cursor: "pointer",
                    borderBottom: i < svSuggestions.length - 1 ? "1px solid #f1f5f9" : "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f7ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <Group gap="xs">
                    <Text size="xs" fw={700} c="#1f5ca9" style={{ fontFamily: "monospace" }}>{sv.maSinhVien}</Text>
                    <Text size="xs" c="#475569">—</Text>
                    <Text size="xs" fw={500} c="#1e293b">{sv.hoTen || sv.ten || sv.hoVaTen}</Text>
                    {sv.maPhong && <Badge size="xs" variant="light" color="teal">{sv.maPhong}</Badge>}
                  </Group>
                </Box>
              ))}
            </Paper>
          )}

          <Group gap="xs" justify="flex-end" wrap="wrap" mt="xs">
            {svLoading && <Loader size="xs" color="blue" />}
            <Button
              leftSection={loading ? <Loader size={16} color="white" /> : <IconSearch size={16} />}
              style={{ backgroundColor: "#1f5ca9", fontFamily: "var(--font-readex-pro), sans-serif" }}
              onClick={handleSearch}
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
            <Text size="sm" c="dimmed">Đang tải báo cáo thống kê đối tượng...</Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap="md">
          {selectedStudent && studentSummary ? (
            <>
              <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md">
                {/* Personal Info Card */}
                <Card withBorder radius="lg" p="md" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)", borderColor: "#1f5ca9", height: "100%" }}>
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Stack gap={2}>
                      <Text size="xs" fw={700} c="#1f5ca9" style={{ textTransform: "uppercase" }}>Thông tin đối tượng</Text>
                      <Text size="sm" fw={800} c="#1e293b" style={{ fontSize: "16px" }}>{selectedStudent.hoTen}</Text>
                      <Text size="xs" c="dimmed" fw={500}>{selectedStudent.studentId} • {selectedStudent.maNhom}</Text>
                    </Stack>
                    <ThemeIcon size={38} style={{ background: "linear-gradient(135deg, #1f5ca9, #00afef)" }}>
                      <IconUser size={18} />
                    </ThemeIcon>
                  </Group>
                </Card>

                {/* Entry Count */}
                <Card withBorder radius="lg" p="md" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)", borderColor: "#e2e8f0", height: "100%" }}>
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Stack gap={2}>
                      <Text size="xs" fw={700} c="#1f5ca9" style={{ textTransform: "uppercase" }}>Lượt vào</Text>
                      <Text size="lg" fw={800} c="#1e293b" style={{ fontSize: "20px" }}>{studentSummary.luotVao} lượt</Text>
                      <Text size="xs" c="dimmed" fw={500}>Vào khu ký túc xá</Text>
                    </Stack>
                    <ThemeIcon size={38} color="teal" variant="light">
                      <IconChevronDown size={18} style={{ transform: "rotate(180deg)" }} />
                    </ThemeIcon>
                  </Group>
                </Card>

                {/* Exit Count */}
                <Card withBorder radius="lg" p="md" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)", borderColor: "#e2e8f0", height: "100%" }}>
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Stack gap={2}>
                      <Text size="xs" fw={700} c="#1f5ca9" style={{ textTransform: "uppercase" }}>Lượt ra</Text>
                      <Text size="lg" fw={800} c="#1e293b" style={{ fontSize: "20px" }}>{studentSummary.luotRa} lượt</Text>
                      <Text size="xs" c="dimmed" fw={500}>Ra khỏi ký túc xá</Text>
                    </Stack>
                    <ThemeIcon size={38} color="orange" variant="light">
                      <IconChevronDown size={18} />
                    </ThemeIcon>
                  </Group>
                </Card>

                {/* Total Scan Count */}
                <Card withBorder radius="lg" p="md" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)", borderColor: "#e2e8f0", height: "100%" }}>
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Stack gap={2}>
                      <Text size="xs" fw={700} c="#1f5ca9" style={{ textTransform: "uppercase" }}>Tổng lượt quét</Text>
                      <Text size="lg" fw={800} c="#1f5ca9" style={{ fontSize: "20px" }}>{studentSummary.tongLuot} lượt</Text>
                      <Text size="xs" c="dimmed" fw={500}>Lượt ra và vào cộng dồn</Text>
                    </Stack>
                    <ThemeIcon size={38} color="blue" variant="light">
                      <IconReportAnalytics size={18} />
                    </ThemeIcon>
                  </Group>
                </Card>
              </SimpleGrid>

              {weeklyChartData.length > 0 && (
                <Card withBorder radius="lg" p="lg" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)", borderColor: "#e2e8f0" }}>
                  <Text fw={700} size="sm" c="#1f5ca9" mb="md" style={{ letterSpacing: "0.5px" }}>
                    TẦN SUẤT RA VÀO TRONG TUẦN CỦA: {selectedStudent.hoTen.toUpperCase()} ({selectedStudent.studentId})
                  </Text>
                  <div style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Lượt vào" fill="#1f5ca9" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Lượt ra" fill="#00afef" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}

              <Card withBorder radius="lg" p="lg" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)", borderColor: "#e2e8f0" }}>
                <Group justify="space-between" mb="md">
                  <Text fw={800} size="md" c="#1e293b" style={{ letterSpacing: "0.25px" }}>
                    CHI TIẾT LỊCH SỬ RA VÀO - {selectedStudent.hoTen.toUpperCase()} ({selectedStudent.studentId})
                  </Text>
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
                        <Table.Th style={{ color: "#475569", fontWeight: 600, fontSize: "12px", textAlign: "center" }}>Trạng thái</Table.Th>
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
                                detail.status === "Hợp lệ" ? "green" : detail.status === "Nghi vấn" ? "yellow" : "red"
                              }
                              variant="light"
                              size="sm"
                            >
                              {detail.status}
                            </Badge>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                      {historyList.length === 0 && (
                        <Table.Tr>
                          <Table.Td colSpan={6}>
                            <Text ta="center" c="dimmed" py="xl">
                              Không có dữ liệu lịch sử ra vào chi tiết
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
                      size="sm"
                      radius="md"
                      withEdges
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
          ) : (
            <Card withBorder radius="lg" p="xl" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)", borderColor: "#e2e8f0", backgroundColor: "#f8fafc" }}>
              <Stack align="center" gap="sm" py="md">
                <ThemeIcon size={48} radius="xl" variant="light" style={{ backgroundColor: "#e0f2fe" }}>
                  <IconId size={24} color="#1f5ca9" />
                </ThemeIcon>
                <Text fw={700} size="md" c="#1f5ca9" ta="center">Xem chi tiết theo mã số</Text>
                <Text size="sm" c="dimmed" ta="center" style={{ maxWidth: 500 }}>
                  Vui lòng nhập MSSV hoặc mã số để tìm kiếm thông tin và xem báo cáo tần suất ra vào ký túc xá.
                </Text>
              </Stack>
            </Card>
          )}
        </Stack>
      )}
    </Stack>
  );
}
