"use client";

import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";

import {
  Button,
  Table,
  FileInput,
  Stack,
  Group,
  ThemeIcon,
  Title,
  Card,
  Select,
  Skeleton,
  Modal,
  Pagination,
  Text,
  Divider,
  Box,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconHelp,
  IconTableImport,
  IconUpload,
  IconEdit,
  IconDownload,
  IconRefresh,
  IconFilter,
} from "@tabler/icons-react";

import ImportHelpDrawer from "./import/ImportHelpDrawer";

import { convertExcel } from "@/services/Excel/excelService";
import { fetchLoaiPhuongTienList } from "@/services/danh-muc/dmLoaiPhuongTienService";
import { fetchPhuongTienList } from "@/services/danh-muc/dmPhuongTienService";
import { importChuPhuongTienExcel } from "@/services/chu-phuong-tien/chuPhuongTienService";
import { showNoti } from "@/components/common/showNoti";
import { ChuPhuongTienImportExcelRequest } from "@/types/type-chu-phuong-tien";

/* ================= Types ================= */
type Preview = {
  filename: string;
  rows: any[][];
  sheetName: string;
};

const thuTucList = [
  { value: "1", label: "Đăng kiểm PTCG đường bộ" },
  { value: "3", label: "Thu phí khác" },
  { value: "6", label: "Thu phí PT thủy nội địa" },
  { value: "7", label: "Thủ tục thu phí phương tiện máy chuyên dùng" },
  { value: "8", label: "Thủ tục kiểm định ATLĐ" },
  { value: "9", label: "Thủ tục chứng nhận cải tạo" },
];

/* ================= Helpers ================= */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function blobToPreview(blob: Blob, filename: string): Promise<Preview> {
  const ab = await blob.arrayBuffer();
  const wb = XLSX.read(ab, { type: "array" });

  const sheetName = wb.SheetNames[0] || "Sheet1";
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

  return { filename, rows, sheetName };
}

async function fileToRows(file: File): Promise<any[][]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
  return json;
}

/* ================= Component ================= */
export default function SettingExcelConvertPage() {
  const router = useRouter();

  /* ===== Convert states ===== */
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [convertLoading, setConvertLoading] = useState(false);

  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [convertedFilename, setConvertedFilename] = useState(
    "output_converted.xlsx",
  );
  const [preview, setPreview] = useState<Preview | null>(null);

  /* ===== Import table states ===== */
  const PAGE_SIZE = 50;

  const [helpOpened, setHelpOpened] = useState(false);
  const [thuTuc, setThuTuc] = useState("1"); // mặc định = 1

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<any[]>([]);
  const [extras, setExtras] = useState<any[]>([]);
  const [ptCache, setPtCache] = useState<Record<string, any[]>>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  const [loaiPhuongTien, setLoaiPhuongTien] = useState<any[]>([]);
  const ownerTypes = ["Cá nhân", "Doanh nghiệp"];

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pagedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return rows.slice(start, end);
  }, [rows, page]);

  const showPhuongTienCols = thuTuc !== "1"; // bạn đang dùng logic ngược: nếu !=1 thì ẩn cột, mình giữ y như bạn
  const fileInfo = useMemo(() => {
    if (!rawFile) return "Chưa có";
    return `${rawFile.name} (${rawFile.size.toLocaleString()} bytes)`;
  }, [rawFile]);

  /* ================= BIỂN SỐ – GIỮ NGUYÊN CSS CŨ ================= */
  const getPlateTextColor = (plate: string) => {
    if (!plate) return "#000";
    const lastChar = plate.trim().slice(-1).toLowerCase();
    if (lastChar === "x") return "#fff";
    if (lastChar === "v") return "#000";
    return "#000";
  };

  const getPlateColor = (plate: string) => {
    if (!plate) return "white";
    const lastChar = plate.trim().slice(-1).toLowerCase();
    if (lastChar === "t") return "white";
    if (lastChar === "x") return "#1556ceff";
    if (lastChar === "v") return "#F2C94C";
    return "white";
  };

  const BienSoBox = ({ value }: { value: string }) => {
    const bgColor = getPlateColor(value);
    const textColor = getPlateTextColor(value);

    return (
      <div
        className="plate-box"
        style={{
          display: "inline-flex", // đổi từ inline-block → inline-flex
          alignItems: "center",
          justifyContent: "center",

          width: 110, // 👈 cố định chiều ngang (bạn chỉnh số này)
          height: 28, // (tuỳ chọn) cố định chiều cao

          padding: "4px 12px", // có thể giữ hoặc bỏ vì đã có width
          background: bgColor,
          borderRadius: "6px",
          border: "2px solid #000",
          fontWeight: 700,
          fontSize: "13px",
          letterSpacing: "1px",
          boxShadow:
            "0 2px 6px rgba(0,0,0,0.15), inset 0 0 2px rgba(0,0,0,0.25)",
          transition: "all 0.25s ease",
          userSelect: "none",
          color: textColor,

          whiteSpace: "nowrap", // 👈 không xuống dòng
          overflow: "hidden", // 👈 nếu quá dài thì cắt
          textOverflow: "ellipsis", // 👈 hiện ...
        }}
      >
        {value}
      </div>
    );
  };

  const mapOwnerTypeFromExcel = (val: any) => {
    if (String(val) === "2") return "Doanh nghiệp";
    return "Cá nhân";
  };

  const ensurePTList = async (dmLptId: string) => {
    if (!dmLptId) return;
    if (ptCache[dmLptId]) return;

    const res = await fetchPhuongTienList({
      page: 1,
      pageSize: 500,
      keyWord: "*",
      dmLptId: Number(dmLptId),
    });

    const list =
      res.payload?.items?.map((i: any) => ({
        value: String(i.dmPtId),
        label: i.dmPtTen,
      })) || [];

    setPtCache((p) => ({ ...p, [dmLptId]: list }));
  };

  /* ================= Load danh mục ================= */
  useEffect(() => {
    (async () => {
      try {
        // danh mục Loại phương tiện

        const res = await fetchLoaiPhuongTienList(1, 500, "*");

        const lpt =
          res.payload?.items?.map((i: any) => ({
            value: String(i.dmLptId),
            label: i.dmLptTen,
          })) || [];

        setLoaiPhuongTien(lpt);

        // preload cache default
        await ensurePTList("1");
      } catch (e) {
        console.error(e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= Nạp dữ liệu vào bảng từ 2D rows ================= */
  const hydrateTableFrom2D = async (json2D: any[][]) => {
    // json2D = [headerRow, ...dataRows]
    const [, ...dataRows] = json2D;

    const mapped = dataRows
      .filter((r) => r && r.length) // bỏ dòng rỗng
      .map((r) => ({
        ttptBienKiemSoat: String(r[0] ?? ""),
        ttcptTen: String(r[1] ?? ""),
        ttcptDiachi: String(r[2] ?? ""),
        ttcptSodienthoai: String(r[3] ?? ""),
        ttcptLcptId: String(r[4] ?? ""),
        ttcptTtId: Number(r[5] ?? 0), // thủ tục từ excel
      }));

    setRows(mapped);

    setExtras(
      dataRows.map((r) => {
        const ownerType = mapOwnerTypeFromExcel(r?.[4]);

        return {
          ownerType,
          loaiPT: "1",
          phuongTien: "15",
        };
      }),
    );

    setPage(1);
    await ensurePTList("1");
  };

  /* ================= Import trực tiếp file excel (không convert) ================= */
  const handleExcelUpload = async (file: File | null) => {
    if (!file) return;
    try {
      await new Promise(requestAnimationFrame);
      const json2D = await fileToRows(file);
      await hydrateTableFrom2D(json2D);
      showNoti("success", "Đã nạp dữ liệu từ file Excel.");
    } catch (e) {
      console.error(e);
      showNoti("error", "Không đọc được file Excel.");
    }
  };

  /* ================= Convert bằng server rồi nạp vào bảng ================= */
  const onConvertServer = async () => {
    if (!rawFile) {
      showNoti("error", "Chưa chọn file Excel thô để chuyển đổi.");
      return;
    }

    try {
      setConvertLoading(true);
      setConvertedBlob(null);
      setPreview(null);

      const result = await convertExcel(rawFile);

      // LOG
      console.log("converted blob:", result.blob);
      console.log("content-type:", result.contentType, "size:", result.size);
      console.log("filename:", result.filename);
      console.log("headers:", result.headers);

      setConvertedBlob(result.blob);
      setConvertedFilename(result.filename);

      const pv = await blobToPreview(result.blob, result.filename);
      setPreview(pv);

      // quan trọng: dùng preview.rows (2D) để nạp bảng import luôn
      await hydrateTableFrom2D(pv.rows);

      showNoti("success", "Chuyển đổi thành công và đã nạp dữ liệu vào bảng.");
    } catch (e: any) {
      console.error(e);
      showNoti("error", e?.message ?? "Chuyển đổi thất bại.");
    } finally {
      setConvertLoading(false);
    }
  };

  // ===== rules lọc biển số (bạn chỉnh theo ý) =====
  const normalizePlate = (s: any) =>
    String(s ?? "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, ""); // bỏ khoảng trắng

  const isBadPlate = (raw: any) => {
    const plate = normalizePlate(raw);

    if (!plate) return true;

    //   LOẠI HẾT biển bắt đầu bằng chữ cái
    if (/^[A-Z]/.test(plate)) return true;

    // giữ lại các biển bắt đầu bằng số
    return false;
  };

  const filterBadPlates = () => {
    if (!rows.length) return;

    const keptRows: any[] = [];
    const keptExtras: any[] = [];
    let removed = 0;

    rows.forEach((r, idx) => {
      const plate = r?.ttptBienKiemSoat;
      if (isBadPlate(plate)) {
        removed++;
        return;
      }
      keptRows.push(r);
      keptExtras.push(extras[idx]);
    });

    setRows(keptRows);
    setExtras(keptExtras);
    setPage(1);

    showNoti(
      "success",
      `Đã lọc ${removed} biển số không hợp lệ. Còn lại ${keptRows.length} dòng.`,
    );
  };

  /* ================= Export JSON (Import backend) ================= */
  const exportJson = async () => {
    if (!rows.length) return;

    setImportLoading(true);
    try {
      const payload: ChuPhuongTienImportExcelRequest = rows.map((r, i) => {
        const isThuTuc1 = thuTuc === "1";

        return {
          ...r,
          ttId: r.ttcptTtId,
          ttcptIsDoanhNghiep: extras[i]?.ownerType === "Doanh nghiệp" ? 1 : 0,
          dmLptId: isThuTuc1 ? 1 : 0,
          dmPtId: isThuTuc1 ? 15 : 0,
        };
      });

      console.log("[RUN_LOG] ===> exportJson payload:", payload);

      await importChuPhuongTienExcel(payload);
      showNoti("success", "Import thành công!");
    } catch (e) {
      console.error(e);
      showNoti("error", "Import thất bại!");
    } finally {
      setImportLoading(false);
    }
  };

  const resetAll = () => {
    setRawFile(null);
    setConvertLoading(false);

    setConvertedBlob(null);
    setConvertedFilename("output_converted.xlsx");
    setPreview(null);

    setRows([]);
    setExtras([]);
    setPtCache({}); // nếu muốn clear luôn cache PT
    setEditingIndex(null);

    setPage(1);
    setThuTuc("1");

    setImportLoading(false);

    showNoti("success", "Đã làm mới dữ liệu (reset về trạng thái ban đầu).");
  };

  return (
    <Stack gap="xl">
      {/* HEADER */}
      <Group>
        <ThemeIcon size={38} variant="light">
          <IconTableImport size={20} />
        </ThemeIcon>
        <Title order={3}>Nhập dữ liệu phương tiện từ Excel</Title>
      </Group>

      {/* ACTIONS */}
      <Card withBorder radius="lg" p="lg">
        <Stack gap="md">
          <Group align="flex-end" gap="md">
            <Button
              variant="light"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => router.back()}
            >
              Trở về
            </Button>
            <Button
              variant="outline"
              leftSection={<IconHelp size={16} />}
              onClick={() => setHelpOpened(true)}
            >
              Hướng dẫn & Dữ liệu mẫu
            </Button>
            <Select
              placeholder="Chọn thủ tục"
              data={thuTucList}
              value={thuTuc}
              onChange={(v) => setThuTuc(v!)}
              w={260}
            />
            <FileInput
              accept=".xlsx, .xls"
              placeholder="Chọn file Excel thô (cần chuyển đổi)"
              value={rawFile}
              onChange={(f) => {
                setRawFile(f);
                setConvertedBlob(null);
                setPreview(null);
              }}
              style={{ flex: 1 }}
            />
            <Button
              color="indigo"
              leftSection={<IconRefresh size={16} />}
              loading={convertLoading}
              disabled={!rawFile}
              onClick={onConvertServer}
            >
              Chuyển đổi (server)
            </Button>
            <Button
              variant="outline"
              leftSection={<IconDownload size={16} />}
              disabled={!convertedBlob}
              onClick={() => {
                if (convertedBlob)
                  downloadBlob(convertedBlob, convertedFilename);
              }}
            >
              Tải file đã chuyển đổi
            </Button>
          </Group>

          <Divider />

          <Text size="sm" c="dimmed">
            File thô: <b>{fileInfo}</b>
            {convertedBlob ? (
              <>
                {" "}
                • Đã convert: <b>{convertedFilename}</b>
              </>
            ) : null}
          </Text>

          {/* ==== IMPORT DIRECT BLOCK (optional) ==== */}
          <Group align="flex-end" gap="md">
            <FileInput
              accept=".xlsx, .xls"
              placeholder="Hoặc chọn file Excel để nạp trực tiếp (không qua server)"
              onChange={handleExcelUpload}
              style={{ flex: 1 }}
            />

            <Button
              variant="outline"
              color="gray"
              leftSection={<IconRefresh size={16} />}
              disabled={importLoading || convertLoading}
              onClick={resetAll}
            >
              Làm mới
            </Button>
            <Button
              variant="outline"
              leftSection={<IconFilter size={16} />}
              disabled={!rows.length}
              onClick={filterBadPlates}
            >
              Lọc biển số
            </Button>
            <Button
              color="blue"
              leftSection={<IconUpload size={16} />}
              disabled={!rows.length || importLoading || convertLoading}
              loading={importLoading}
              onClick={exportJson}
            >
              Cập nhật dữ liệu
            </Button>
          </Group>

          {preview ? (
            <Text size="sm">
              Preview (sheet: <b>{preview.sheetName}</b>) — Đã nạp dữ liệu vào
              bảng phía dưới.
            </Text>
          ) : null}
        </Stack>
      </Card>

      {/* TABLE */}
      {rows.length ? (
        <Card withBorder radius="lg" p="lg">
          <Table striped highlightOnHover withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: "5%", textAlign: "center" }}>
                  STT
                </Table.Th>
                <Table.Th style={{ width: "12%", textAlign: "center" }}>
                  Biển kiểm soát
                </Table.Th>
                <Table.Th style={{ width: "15%" }}>Tên chủ PT</Table.Th>
                <Table.Th style={{ width: "12%", textAlign: "center" }}>
                  Điện thoại
                </Table.Th>
                <Table.Th style={{ width: "12%", textAlign: "center" }}>
                  Loại chủ PT
                </Table.Th>
                <Table.Th style={{ width: "12%", textAlign: "center" }}>
                  Thủ tục
                </Table.Th>
                {!showPhuongTienCols && (
                  <>
                    <Table.Th style={{ width: "15%", textAlign: "center" }}>
                      Loại PT
                    </Table.Th>
                    <Table.Th style={{ width: "15%", textAlign: "center" }}>
                      Phương tiện
                    </Table.Th>
                  </>
                )}
                <Table.Th style={{ width: "8%" }}></Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {pagedRows.map((row, i) => {
                const idx = (page - 1) * PAGE_SIZE + i;
                const ex = extras[idx] || {};

                return (
                  <Table.Tr
                    key={idx}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={(e) => {
                      const tr = e.currentTarget;
                      tr.style.background = "rgba(230,240,255,0.55)";
                      tr.style.boxShadow = "0 2px 6px rgba(0,0,0,0.08)";
                      const plate = tr.querySelector(
                        ".plate-box",
                      ) as HTMLElement;
                      if (plate) plate.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      const tr = e.currentTarget;
                      tr.style.background = "transparent";
                      tr.style.boxShadow = "none";
                      const plate = tr.querySelector(
                        ".plate-box",
                      ) as HTMLElement;
                      if (plate) plate.style.transform = "scale(1)";
                    }}
                  >
                    <Table.Td style={{ textAlign: "center" }}>
                      {idx + 1}
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      <BienSoBox value={row.ttptBienKiemSoat} />
                    </Table.Td>
                    <Table.Td>{row.ttcptTen}</Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      {row.ttcptSodienthoai}
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      {ex.ownerType}
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      {row.ttcptTtId}
                    </Table.Td>

                    {!showPhuongTienCols && (
                      <>
                        <Table.Td style={{ textAlign: "center" }}>
                          {
                            loaiPhuongTien.find((l) => l.value === ex.loaiPT)
                              ?.label
                          }
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          {
                            ptCache[ex.loaiPT]?.find(
                              (p) => p.value === ex.phuongTien,
                            )?.label
                          }
                        </Table.Td>
                      </>
                    )}

                    <Table.Td>
                      <Button
                        size="xs"
                        leftSection={<IconEdit size={14} />}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setEditingIndex(idx);
                          ensurePTList(ex.loaiPT);
                        }}
                      >
                        Sửa
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>

          <Group justify="center" mt="md">
            <Pagination total={totalPages} value={page} onChange={setPage} />
          </Group>
        </Card>
      ) : (
        <Card withBorder radius="lg" p="lg" shadow="sm">
          <Table withColumnBorders striped="even">
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: "5%", textAlign: "center" }}>
                  STT
                </Table.Th>
                <Table.Th>Biển kiểm soát</Table.Th>
                <Table.Th>Chủ phương tiện</Table.Th>
                <Table.Th>Địa chỉ</Table.Th>
                <Table.Th>Điện thoại</Table.Th>
                <Table.Th>Loại hình</Table.Th>
                <Table.Th>Thủ tục</Table.Th>
                <Table.Th>Hành động</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {[1, 2].map((i) => (
                <Table.Tr key={i}>
                  <Table.Td>
                    <Skeleton height={14} />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={14} />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={14} />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={14} />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={14} />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={32} />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={32} />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={32} />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}

      {/* MODAL EDIT */}
      <Modal
        opened={editingIndex !== null}
        onClose={() => setEditingIndex(null)}
        title={
          <Box>
            <Title
              order={4}
              ta="center"
              c="#1047a7ff"
              component="div"
              style={{
                fontWeight: 700,
                letterSpacing: "0.3px",
              }}
            >
              Chỉnh sửa thông tin phương tiện
            </Title>
          </Box>
        }
        centered
        size="lg"
      >
        {editingIndex !== null && extras[editingIndex] && (
          <Card withBorder radius="md" p="md">
            <Stack gap="sm">
              <Select
                label="Loại chủ PT"
                data={ownerTypes}
                value={extras[editingIndex].ownerType}
                onChange={(v) =>
                  setExtras((p) => {
                    const c = [...p];
                    c[editingIndex].ownerType = v;
                    return c;
                  })
                }
              />

              <Select
                label="Loại phương tiện"
                data={loaiPhuongTien}
                value={extras[editingIndex].loaiPT}
                onChange={async (v) => {
                  if (!v) return;
                  await ensurePTList(v);
                  setExtras((p) => {
                    const c = [...p];
                    c[editingIndex].loaiPT = v;
                    c[editingIndex].phuongTien = null;
                    return c;
                  });
                }}
              />

              <Select
                label="Phương tiện"
                data={ptCache[extras[editingIndex].loaiPT] || []}
                value={extras[editingIndex].phuongTien}
                onChange={(v) =>
                  setExtras((p) => {
                    const c = [...p];
                    c[editingIndex].phuongTien = v;
                    return c;
                  })
                }
              />
            </Stack>
          </Card>
        )}
      </Modal>

      <ImportHelpDrawer
        opened={helpOpened}
        onClose={() => setHelpOpened(false)}
      />
    </Stack>
  );
}
