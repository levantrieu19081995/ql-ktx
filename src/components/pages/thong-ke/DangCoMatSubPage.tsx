"use client";

// Danh sách sinh viên đang có mặt tại KTX.
// Chưa có API riêng "đang có mặt", nên tính từ log vào/ra: với mỗi sinh viên lấy lần quét CUỐI trong
// N ngày gần nhất; lần cuối là "vào" thì đang có mặt. Sinh viên không có lần quét nào trong khoảng này
// không được tính (không biết đang ở trong hay ngoài KTX).
import React, { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Badge,
  Box,
  Button,
  Card,
  Center,
  Group,
  Loader,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import {
  IconDownload,
  IconRefresh,
  IconSearch,
  IconUserCheck,
} from "@tabler/icons-react";
import PageSectionHeader from "@/components/common/PageSectionHeader";
import CustomPagination from "@/components/common/CustomPagination";
import ExcelExportForm from "@/components/common/excel/excelHelper";
import PdfExportForm from "@/components/common/pdf/pdfHelper";
import {
  fetchLichSuRaVaoTheoNgay,
  fetchSinhVienPaginate,
} from "@/services/dashboard/dashboardService";

const TOI_DA_TRANG_MOT_NGAY = 5; // 5 trang x 1000 bản ghi
const TU_LAM_MOI_MS = 60_000;

interface SvCoMat {
  ma: string;
  hoTen: string;
  khu: string;
  phong: string;
  thoiGianVao: Date;
  camera: string;
}

type DuLieuXuat = {
  title: string;
  fileName: string;
  columnLabels: string[];
  data: Record<string, string | number>[];
  sheetName?: string;
};

// Bản ghi lịch sử: BE dùng timeCheck (giây), direction ("in"/"out"), peopleId
const docBanGhi = (it: any) => {
  const ma = String(it?.maso ?? it?.peopleId ?? "").trim();
  const raw = it?.timeCheck ?? it?.timecheck;
  const n = Number(raw);
  if (!ma || !Number.isFinite(n) || n <= 0) return null;
  const huong = String(it?.direction ?? "").toLowerCase();
  const vao =
    huong === "in" ||
    (huong !== "out" &&
      (String(it?.cameraName || "")
        .toLowerCase()
        .includes("vào") ||
        it?.cameraIdId === 1));
  return {
    ma,
    t: n < 1e11 ? n * 1000 : n,
    vao,
    hoTen: String(it?.hoten ?? it?.hoTen ?? ""),
    khu: String(it?.tenKhu ?? it?.maKhu ?? ""),
    camera: String(it?.cameraName ?? ""),
    laSinhVien: String(it?.tennhom ?? "")
      .toLowerCase()
      .includes("sinh viên"),
  };
};

async function taiLichSuMotNgay(ngay: string): Promise<any[]> {
  const ketQua: any[] = [];
  for (let page = 1; page <= TOI_DA_TRANG_MOT_NGAY; page++) {
    const res = await fetchLichSuRaVaoTheoNgay({
      page,
      pageSize: 1000,
      ngay,
      maKhu: "-1",
      maNhom: "-1",
      keyword: "",
    });
    if (!res) break;
    const items =
      res.payload?.items ??
      res.payload?.content ??
      (Array.isArray(res.payload) ? res.payload : []);
    ketQua.push(...items);
    const tongTrang = Number(res.payload?.totalPages ?? 1);
    if (page >= tongTrang) break;
  }
  return ketQua;
}

const nhanLabel = {
  label: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#475569",
    marginBottom: "6px",
  },
  input: { borderRadius: "8px", height: "40px" },
} as const;

export default function DangCoMatSubPage() {
  const [soNgay, setSoNgay] = useState<string>("3");
  const [khuLoc, setKhuLoc] = useState<string>("ALL");
  const [tuKhoa, setTuKhoa] = useState("");
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState<string | null>(null);
  const [danhSach, setDanhSach] = useState<SvCoMat[]>([]);
  const [tongSinhVien, setTongSinhVien] = useState<number | null>(null);
  const [capNhatLuc, setCapNhatLuc] = useState<Date | null>(null);
  const [trang, setTrang] = useState(1);
  const [kichThuocTrang, setKichThuocTrang] = useState(10);
  const [xuatExcel, setXuatExcel] = useState<DuLieuXuat | null>(null);
  const [xuatPdf, setXuatPdf] = useState<DuLieuXuat | null>(null);

  const taiDuLieu = useCallback(
    async (hienLoading = true) => {
      if (hienLoading) setDangTai(true);
      setLoi(null);
      try {
        const n = Number(soNgay) || 1;
        const cacNgay = Array.from({ length: n }, (_, i) =>
          dayjs().subtract(i, "day").format("MM/DD/YYYY"),
        );

        const [lichSuTheoNgay, svRes] = await Promise.all([
          Promise.all(cacNgay.map((d) => taiLichSuMotNgay(d))),
          fetchSinhVienPaginate({
            page: "1",
            pageSize: "10000",
            maKhu: "-1",
            maPhong: "-1",
          }).catch(() => null),
        ]);

        // Danh sách sinh viên KTX để biết khu, phòng và loại bỏ cán bộ / người lạ
        const svMap = new Map<string, any>();
        const svList: any[] = svRes?.payload?.items ?? [];
        svList.forEach((sv: any) => {
          const ma = sv.maSinhVien ?? sv.maso ?? sv.mssv;
          if (ma) svMap.set(String(ma), sv);
        });
        setTongSinhVien(
          svRes?.payload?.totalElements ??
            (svList.length > 0 ? svList.length : null),
        );

        // Lần quét cuối của từng người
        const cuoi = new Map<
          string,
          NonNullable<ReturnType<typeof docBanGhi>>
        >();
        lichSuTheoNgay.flat().forEach((it) => {
          const b = docBanGhi(it);
          if (!b) return;
          if (svMap.size > 0 ? !svMap.has(b.ma) : !b.laSinhVien) return;
          const truoc = cuoi.get(b.ma);
          if (!truoc || b.t > truoc.t) cuoi.set(b.ma, b);
        });

        const ds: SvCoMat[] = [];
        cuoi.forEach((b) => {
          if (!b.vao) return;
          const sv = svMap.get(b.ma);
          ds.push({
            ma: b.ma,
            hoTen: String(sv?.hoTen ?? sv?.hoten ?? b.hoTen ?? ""),
            khu: String(sv?.tenKhu ?? b.khu ?? "") || "Chưa rõ",
            phong: String(sv?.maPhong ?? sv?.tenPhong ?? "") || "--",
            thoiGianVao: new Date(b.t),
            camera: b.camera,
          });
        });
        ds.sort((a, b) => b.thoiGianVao.getTime() - a.thoiGianVao.getTime());
        setDanhSach(ds);
        setCapNhatLuc(new Date());
      } catch (e: any) {
        setLoi(e?.message || "Không tải được dữ liệu vào/ra");
      } finally {
        setDangTai(false);
      }
    },
    [soNgay],
  );

  useEffect(() => {
    taiDuLieu(true);
  }, [taiDuLieu]);

  // Tự làm mới định kỳ khi tab đang được xem
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") taiDuLieu(false);
    }, TU_LAM_MOI_MS);
    return () => clearInterval(timer);
  }, [taiDuLieu]);

  const cacKhu = useMemo(
    () => Array.from(new Set(danhSach.map((x) => x.khu))).sort(),
    [danhSach],
  );

  const daLoc = useMemo(() => {
    const k = tuKhoa.trim().toLowerCase();
    return danhSach.filter(
      (x) =>
        (khuLoc === "ALL" || x.khu === khuLoc) &&
        (!k ||
          x.ma.toLowerCase().includes(k) ||
          x.hoTen.toLowerCase().includes(k)),
    );
  }, [danhSach, khuLoc, tuKhoa]);

  useEffect(() => setTrang(1), [khuLoc, tuKhoa, soNgay, kichThuocTrang]);

  const tongTrang = Math.max(1, Math.ceil(daLoc.length / kichThuocTrang));
  const hienThi = daLoc.slice(
    (trang - 1) * kichThuocTrang,
    trang * kichThuocTrang,
  );

  const dem = (khu: string) => danhSach.filter((x) => x.khu === khu).length;
  const tiLe =
    tongSinhVien && tongSinhVien > 0
      ? ((danhSach.length / tongSinhVien) * 100).toFixed(1).replace(".", ",")
      : null;

  const taoDuLieuXuat = (): DuLieuXuat => {
    const cot = [
      "STT",
      "Mã sinh viên",
      "Họ tên",
      "Khu KTX",
      "Phòng",
      "Thời gian vào gần nhất",
      "Cổng / camera",
    ];
    const data = daLoc.map((x, i) => ({
      [cot[0]]: i + 1,
      [cot[1]]: x.ma,
      [cot[2]]: x.hoTen,
      [cot[3]]: x.khu,
      [cot[4]]: x.phong,
      [cot[5]]: dayjs(x.thoiGianVao).format("DD/MM/YYYY HH:mm:ss"),
      [cot[6]]: x.camera,
    }));
    return {
      title: "Danh sách sinh viên đang có mặt tại KTX",
      fileName: `Danh_Sach_Sinh_Vien_Dang_Co_Mat_${dayjs().format("YYYY-MM-DD")}`,
      sheetName: "Đang có mặt",
      columnLabels: cot,
      data,
    };
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
        title="Sinh viên đang có mặt tại KTX"
        description="Danh sách sinh viên có lần quét gần nhất là lượt vào, tính từ log vào/ra."
        icon={<IconUserCheck size={20} color="#1f5ca9" />}
      />

      <Card withBorder radius="lg" p="md" style={{ borderColor: "#e2e8f0" }}>
        <Group align="end" gap="md" wrap="wrap">
          <Select
            label="Tính từ log vào/ra của"
            value={soNgay}
            onChange={(v) => v && setSoNgay(v)}
            allowDeselect={false}
            data={[
              { value: "1", label: "Hôm nay" },
              { value: "3", label: "3 ngày gần nhất" },
              { value: "7", label: "7 ngày gần nhất" },
            ]}
            styles={nhanLabel}
            w={200}
          />
          <Select
            label="Khu KTX"
            value={khuLoc}
            onChange={(v) => setKhuLoc(v || "ALL")}
            allowDeselect={false}
            data={[
              { value: "ALL", label: "Tất cả" },
              ...cacKhu.map((k) => ({ value: k, label: k })),
            ]}
            styles={nhanLabel}
            w={180}
          />
          <TextInput
            label="Mã hoặc họ tên"
            placeholder="Nhập để lọc..."
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
            styles={nhanLabel}
            w={240}
          />
          <Group gap={10} ml="auto" wrap="nowrap">
            <Button
              variant="outline"
              color="gray"
              leftSection={
                dangTai ? <Loader size={14} /> : <IconRefresh size={17} />
              }
              onClick={() => taiDuLieu(true)}
              disabled={dangTai}
              style={{ borderRadius: 10, height: 40, fontWeight: 600 }}
            >
              Làm mới
            </Button>
            <Button
              variant="outline"
              leftSection={<IconDownload size={17} />}
              onClick={() => setXuatExcel(taoDuLieuXuat())}
              disabled={daLoc.length === 0}
              style={{
                borderColor: "#1f5ca9",
                color: "#1f5ca9",
                borderRadius: 10,
                height: 40,
                fontWeight: 600,
              }}
            >
              Xuất Excel
            </Button>
            <Button
              variant="outline"
              leftSection={<IconDownload size={17} />}
              onClick={() => setXuatPdf(taoDuLieuXuat())}
              disabled={daLoc.length === 0}
              style={{
                borderColor: "#60a5fa",
                color: "#3b82f6",
                borderRadius: 10,
                height: 40,
                fontWeight: 600,
              }}
            >
              Xuất PDF
            </Button>
          </Group>
        </Group>
      </Card>

      {loi && (
        <Badge
          color="red"
          variant="light"
          size="lg"
          style={{ width: "100%", padding: 12, borderRadius: 8 }}
        >
          {loi}
        </Badge>
      )}

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <Card withBorder radius="lg" p="md" style={{ borderColor: "#e2e8f0" }}>
          <Text size="xs" fw={700} c="#1f5ca9">
            ĐANG CÓ MẶT
          </Text>
          <Text
            fw={800}
            fz={26}
            c="#1e293b"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {dangTai && danhSach.length === 0
              ? "…"
              : danhSach.length.toLocaleString("vi-VN")}
          </Text>
          <Text size="xs" c="dimmed">
            {tiLe
              ? `${tiLe}% tổng số sinh viên`
              : "Sinh viên có lần quét cuối là lượt vào"}
          </Text>
        </Card>
        <Card withBorder radius="lg" p="md" style={{ borderColor: "#e2e8f0" }}>
          <Text size="xs" fw={700} c="#1f5ca9">
            TỔNG SỐ SINH VIÊN KTX
          </Text>
          <Text
            fw={800}
            fz={26}
            c="#1e293b"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {tongSinhVien === null
              ? "--"
              : tongSinhVien.toLocaleString("vi-VN")}
          </Text>
          <Text size="xs" c="dimmed">
            {capNhatLuc
              ? `Cập nhật lúc ${dayjs(capNhatLuc).format("HH:mm:ss")} (tự làm mới mỗi phút)`
              : "Đang tải…"}
          </Text>
        </Card>
        <Card withBorder radius="lg" p="md" style={{ borderColor: "#e2e8f0" }}>
          <Text size="xs" fw={700} c="#1f5ca9">
            THEO KHU
          </Text>
          <Group gap="xs" mt={6}>
            {cacKhu.length === 0 ? (
              <Text size="sm" c="dimmed">
                --
              </Text>
            ) : (
              cacKhu.map((k) => (
                <Badge key={k} variant="light" size="lg">
                  {k}: {dem(k).toLocaleString("vi-VN")}
                </Badge>
              ))
            )}
          </Group>
        </Card>
      </SimpleGrid>

      <Card withBorder radius="lg" p="lg" style={{ borderColor: "#e2e8f0" }}>
        {dangTai && danhSach.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="sm">
              <Loader size="md" />
              <Text size="sm" c="dimmed">
                Đang tải dữ liệu vào/ra…
              </Text>
            </Stack>
          </Center>
        ) : (
          <>
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="sm" miw={820}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th w={60}>STT</Table.Th>
                    <Table.Th>Mã sinh viên</Table.Th>
                    <Table.Th>Họ tên</Table.Th>
                    <Table.Th>Khu KTX</Table.Th>
                    <Table.Th>Phòng</Table.Th>
                    <Table.Th>Vào gần nhất</Table.Th>
                    <Table.Th>Cổng / camera</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {hienThi.map((x, i) => (
                    <Table.Tr key={x.ma}>
                      <Table.Td>
                        {(trang - 1) * kichThuocTrang + i + 1}
                      </Table.Td>
                      <Table.Td>{x.ma}</Table.Td>
                      <Table.Td>{x.hoTen || "--"}</Table.Td>
                      <Table.Td>{x.khu}</Table.Td>
                      <Table.Td>{x.phong}</Table.Td>
                      <Table.Td>
                        {dayjs(x.thoiGianVao).format("DD/MM/YYYY HH:mm")}
                      </Table.Td>
                      <Table.Td>{x.camera || "--"}</Table.Td>
                    </Table.Tr>
                  ))}
                  {hienThi.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={7}>
                        <Text ta="center" c="dimmed" py="xl">
                          Không có sinh viên nào đang có mặt theo điều kiện lọc.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
            <Box mt="md">
              <CustomPagination
                totalItems={daLoc.length}
                totalPages={tongTrang}
                page={trang}
                pageSize={kichThuocTrang}
                setPage={setTrang}
                setPageSize={setKichThuocTrang}
              />
            </Box>
            <Text size="xs" c="dimmed" mt="sm">
              Lưu ý: tính từ lần quét cuối của từng sinh viên trong khoảng đã
              chọn. Sinh viên không có lần quét nào trong khoảng này không được
              tính vào danh sách.
            </Text>
          </>
        )}
      </Card>

      {xuatExcel && (
        <ExcelExportForm
          hidden
          autoExport
          title={xuatExcel.title}
          fileName={xuatExcel.fileName}
          sheetName={xuatExcel.sheetName}
          columnLabels={xuatExcel.columnLabels}
          data={xuatExcel.data}
          onExported={() => setXuatExcel(null)}
        />
      )}
      {xuatPdf && (
        <PdfExportForm
          hidden
          autoExport
          title={xuatPdf.title}
          fileName={xuatPdf.fileName}
          columnLabels={xuatPdf.columnLabels}
          data={xuatPdf.data}
          onExported={() => setXuatPdf(null)}
        />
      )}
    </Stack>
  );
}
