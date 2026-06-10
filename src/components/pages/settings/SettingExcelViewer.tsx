"use client";

import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
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
  Box,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconHelp,
  IconTableImport,
  IconUpload,
  IconEdit,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import ImportHelpDrawer from "./import/ImportHelpDrawer";

import { fetchLoaiPhuongTienList } from "@/services/danh-muc/dmLoaiPhuongTienService";
import { fetchPhuongTienList } from "@/services/danh-muc/dmPhuongTienService";
import { importChuPhuongTienExcel } from "@/services/chu-phuong-tien/chuPhuongTienService";
import { showNoti } from "@/components/common/showNoti";
import { ChuPhuongTienImportExcelRequest } from "@/types/type-chu-phuong-tien";

const PAGE_SIZE = 50;

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
        display: "inline-block",
        padding: "4px 12px",
        background: bgColor,
        borderRadius: "6px",
        border: "2px solid #000",
        fontWeight: 700,
        fontSize: "13px",
        letterSpacing: "1px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15), inset 0 0 2px rgba(0,0,0,0.25)",
        transition: "all 0.25s ease",
        userSelect: "none",
        color: textColor,
      }}
    >
      {value}
    </div>
  );
};

/* ================= MAIN COMPONENT ================= */
export default function SettingExcelViewer() {
  const router = useRouter();

  const [rows, setRows] = useState<any[]>([]);
  const [extras, setExtras] = useState<any[]>([]);
  const [helpOpened, setHelpOpened] = useState(false);

  const [page, setPage] = useState(1);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const ownerTypes = ["Cá nhân", "Doanh nghiệp"];
  const [loaiPhuongTien, setLoaiPhuongTien] = useState<any[]>([]);
  const [ptCache, setPtCache] = useState<Record<string, any[]>>({});

  /* ================= PAGINATION ================= */
  const pagedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, page]);

  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
  const [thuTuc, setThuTuc] = useState("1"); // mặc định = 1
  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetchLoaiPhuongTienList(1, 100, "*").then((res) => {
      const list =
        res.payload?.items?.map((i: any) => ({
          value: String(i.dmLptId),
          label: i.dmLptTen,
        })) || [];
      setLoaiPhuongTien(list);
    });
  }, []);

  const ensurePTList = async (dmLptId: string) => {
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

  const mapOwnerTypeFromExcel = (val: any) => {
    if (String(val) === "2") return "Doanh nghiệp";
    return "Cá nhân";
  };

  /* ================= EXCEL ================= */
  const handleExcelUpload = async (file: File | null) => {
    if (!file) return;
    await new Promise(requestAnimationFrame);

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    const [, ...dataRows] = json;

    const mapped = dataRows.map((r) => ({
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
        const ownerType = mapOwnerTypeFromExcel(r[4]);

        // const isCaNhan = ownerType === "Cá nhân";
        const isCaNhan = String(r[4]) === "1";

        return {
          ownerType,
          loaiPT: "1",
          phuongTien: "15",
        };
      }),
    );

    await ensurePTList("1");
  };

  const thuTucList = [
    { value: "1", label: "Đăng kiểm PTCG đường bộ" },
    { value: "3", label: "Thu phí khác" },
    { value: "6", label: "Thu phí PT thủy nội địa" },
    { value: "7", label: "Thủ tục thu phí phương tiện máy chuyên dùng" },
    { value: "8", label: "Thủ tục kiểm định ATLĐ" },
    { value: "9", label: "Thủ tục chứng nhận cải tạo" },
  ];

  /* ================= EXPORT ================= */
  const exportJson = async () => {
    const payload: ChuPhuongTienImportExcelRequest = rows.map((r, i) => {
      const isThuTuc1 = thuTuc === "1";

      return {
        ...r,
        ttId: r.ttcptTtId,

        ttcptIsDoanhNghiep: extras[i].ownerType === "Doanh nghiệp" ? 1 : 0,

        dmLptId: isThuTuc1 ? 1 : 0,
        dmPtId: isThuTuc1 ? 15 : 0,
      };
    });

    try {
      await importChuPhuongTienExcel(payload);
      showNoti("success", "Import thành công!");
    } catch {
      showNoti("error", "Import thất bại!");
    }
  };

  const showPhuongTienCols = thuTuc !== "1";

  /* ================= UI ================= */
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
          />

          <FileInput
            accept=".xlsx, .xls"
            placeholder="Chọn file Excel"
            onChange={handleExcelUpload}
            style={{ flex: 1 }}
          />

          <Button
            color="blue"
            leftSection={<IconUpload size={16} />}
            disabled={!rows.length}
            onClick={exportJson}
          >
            Cập nhật dữ liệu
          </Button>
        </Group>
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
                const ex = extras[idx];

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
                        onClick={() => {
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
        {editingIndex !== null && (
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
                  await ensurePTList(v!);
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
