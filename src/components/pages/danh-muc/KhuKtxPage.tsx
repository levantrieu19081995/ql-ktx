/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Modal,
  Paper,
  ScrollArea,
  Select,
  SimpleGrid,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import {
  IconArrowsShuffle,
  IconCategory,
  IconCloudDownload,
  IconEye,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react";

import CustomPagination from "@/components/common/CustomPagination";
import DanhMucFeaturePage from "./DanhMucFeaturePage";
import {
  fetchDanhMucKhuKtx,
  fetchDanhSachKhuKtx,
  fetchDanhSachKhuUiis,
  syncDanhSachKhuUiis,
} from "@/services/danh-muc/danhMucKtxService";
import type { KhuKtx } from "@/types/type-danh-muc-ktx";

type SyncStatus = "SAME" | "CHANGED" | "NEW";

type SyncPreviewRow = {
  stt: number;
  maKhu: string;
  uiis: {
    tenKhu: string;
    soLuongPhong: string;
    moTa: string;
  };
  current: {
    tenKhu: string;
    soLuongPhong: string;
    moTa: string;
  } | null;
  status: SyncStatus;
};

type UiisKhuItem = {
  khu_id: string;
  ma_khu: string;
  ten_khu: string;
  so_luong_phong: string;
};

const normalizeString = (value?: string | null) => (value ?? "").trim();
const normalizeNumberText = (value?: string | number | null) =>
  String(value ?? "").trim();
const displayText = (value?: string | null) => normalizeString(value) || "-";

export default function KhuKtxPage() {
  const [items, setItems] = useState<KhuKtx[]>([]);
  const [dsKhu, setDsKhu] = useState<{ value: string; label: string }[]>([]);
  const [maKhu, setMaKhu] = useState<string | null>("-1");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [openedSync, setOpenedSync] = useState(false);
  const [namHoc, setNamHoc] = useState("2026");
  const [hocKy, setHocKy] = useState("1");
  const [currentItems, setCurrentItems] = useState<KhuKtx[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [confirmSyncLoading, setConfirmSyncLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [uiisItems, setUiisItems] = useState<UiisKhuItem[]>([]);

  const handleOpenSync = () => {
    setOpenedSync(true);
    setShowPreview(false);
    setUiisItems([]);
    setCurrentItems([]);
  };

  const handleCloseSync = () => {
    setOpenedSync(false);
    setShowPreview(false);
    setUiisItems([]);
    setCurrentItems([]);
  };

  const loadDanhMucKhu = async () => {
    try {
      const res = await fetchDanhMucKhuKtx();
      setDsKhu([
        { value: "-1", label: "Tất cả" },
        ...res.map((item) => ({
          value: item.khuMa || item.maKhu || "",
          label: item.khuTen || item.tenKhu || item.khuMa || item.maKhu || "",
        })),
      ]);
    } catch (error) {
      console.error("Loi lay danh muc khu KTX:", error);
      setDsKhu([{ value: "-1", label: "Tất cả" }]);
    }
  };

  const loadData = async (pageValue = page, pageSizeValue = pageSize) => {
    try {
      const res = await fetchDanhSachKhuKtx({
        page: pageValue,
        pageSize: pageSizeValue,
        maKhu: maKhu || "-1",
      });

      setItems(res?.items || []);
      setTotalItems(res?.totalElements || 0);
      setTotalPages(res?.totalPages || 0);
    } catch (error) {
      console.error("Loi lay danh sach khu KTX:", error);
      setItems([]);
      setTotalItems(0);
      setTotalPages(0);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadData(1, pageSize);
  };

  const handleReset = async () => {
    setMaKhu("-1");
    setPage(1);

    try {
      const res = await fetchDanhSachKhuKtx({
        page: 1,
        pageSize: pageSize,
        maKhu: "-1",
      });

      setItems(res?.items || []);
      setTotalItems(res?.totalElements || 0);
      setTotalPages(res?.totalPages || 0);
    } catch (error) {
      console.error("Lỗi làm mới danh sách khu KTX:", error);
      setItems([]);
      setTotalItems(0);
      setTotalPages(0);
    }
  };

  const handlePreviewKhuUiis = async () => {
    try {
      setPreviewLoading(true);

      const [uiisRes, currentRes] = await Promise.all([
        fetchDanhSachKhuUiis({
          nam_hoc: namHoc,
          hoc_ky: hocKy,
        }),
        fetchDanhSachKhuKtx({
          page: 1,
          pageSize: 9999,
          maKhu: "-1",
        }),
      ]);

      const uiisData = uiisRes?.payload?.data || [];

      setUiisItems(uiisData);
      setCurrentItems(currentRes?.items || []);
      setShowPreview(true);
    } catch (error) {
      console.error("Loi lay danh sach khu UIIS:", error);
      setShowPreview(false);
      setUiisItems([]);
      setCurrentItems([]);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleConfirmSyncKhuUiis = async () => {
    try {
      setConfirmSyncLoading(true);
      await syncDanhSachKhuUiis({
        nam_hoc: namHoc,
        hoc_ky: hocKy,
      });

      handleCloseSync();
      await loadDanhMucKhu();
      await loadData(1, pageSize);
      setPage(1);
    } catch (error) {
      console.error("Loi dong bo danh sach khu tu UIIS:", error);
    } finally {
      setConfirmSyncLoading(false);
    }
  };

  const previewRows = useMemo<SyncPreviewRow[]>(() => {
    return uiisItems.map((uiisItem, index) => {
      const currentItem =
        currentItems.find(
          (item: any) => String(item.uiisKhuId) === String(uiisItem.khu_id),
        ) || null;

      const isChanged =
        !!currentItem &&
        (normalizeString(currentItem.khuMa || currentItem.maKhu) !==
          normalizeString(uiisItem.ma_khu) ||
          normalizeString(currentItem.khuTen || currentItem.tenKhu) !==
            normalizeString(uiisItem.ten_khu) ||
          normalizeNumberText(currentItem.soLuongPhong) !==
            normalizeNumberText(uiisItem.so_luong_phong));

      return {
        stt: index + 1,
        maKhu: uiisItem.ma_khu || "-",
        uiis: {
          tenKhu: displayText(uiisItem.ten_khu),
          soLuongPhong: displayText(uiisItem.so_luong_phong),
          moTa: "-",
        },
        current: currentItem
          ? {
              tenKhu: displayText(currentItem.khuTen || currentItem.tenKhu),
              soLuongPhong: displayText(String(currentItem.soLuongPhong ?? "")),
              moTa: displayText(currentItem.moTa),
            }
          : null,
        status: !currentItem ? "NEW" : isChanged ? "CHANGED" : "SAME",
      };
    });
  }, [currentItems, uiisItems]);

  const previewSummary = useMemo(() => {
    const totalUiis = previewRows.length;
    const totalNew = previewRows.filter((row) => row.status === "NEW").length;
    const totalChanged = previewRows.filter(
      (row) => row.status === "CHANGED",
    ).length;
    const totalSame = previewRows.filter((row) => row.status === "SAME").length;

    return {
      totalUiis,
      totalNew,
      totalChanged,
      totalSame,
    };
  }, [previewRows]);

  const previewMessage = useMemo(() => {
    if (!showPreview) return null;
    if (previewSummary.totalUiis === 0) {
      return {
        color: "#64748b",
        text: "Không có dữ liệu từ UIIS.",
      };
    }
    if (previewSummary.totalChanged > 0) {
      return {
        color: "#d97706",
        text: `Có ${previewSummary.totalChanged} khu bị thay đổi so với dữ liệu hiện tại.`,
      };
    }
    if (previewSummary.totalNew > 0) {
      return {
        color: "#16a34a",
        text: `Có ${previewSummary.totalNew} khu mới hoàn toàn chưa có trong dữ liệu hiện tại.`,
      };
    }
    return {
      color: "#16a34a",
      text: "UIIS và dữ liệu hiện tại giống nhau, không có thay đổi.",
    };
  }, [previewSummary, showPreview]);

  const canConfirmSync =
    showPreview &&
    previewSummary.totalUiis > 0 &&
    (previewSummary.totalNew > 0 || previewSummary.totalChanged > 0);

  const renderStatusBadge = (status: SyncStatus) => {
    if (status === "NEW") {
      return (
        <Badge
          radius="xl"
          variant="light"
          color="green"
          styles={{ root: { textTransform: "none", fontWeight: 700 } }}
        >
          Hoàn toàn mới
        </Badge>
      );
    }

    if (status === "CHANGED") {
      return (
        <Badge
          radius="xl"
          variant="light"
          color="orange"
          styles={{ root: { textTransform: "none", fontWeight: 700 } }}
        >
          Có thay đổi
        </Badge>
      );
    }

    return (
      <Badge
        radius="xl"
        variant="light"
        color="gray"
        styles={{ root: { textTransform: "none", fontWeight: 700 } }}
      >
        Không đổi
      </Badge>
    );
  };

  useEffect(() => {
    loadDanhMucKhu();
    loadData(1, pageSize);
  }, []);

  return (
    <>
      <DanhMucFeaturePage
        type="khu"
        title="Lấy danh sách khu ký túc xá"
        description="Quản lý danh mục khu, dãy nhà trong ký túc xá."
        items={items}
        icon={<IconCategory size={20} />}
        searchControls={
          <>
            <div className="filter-inputs-custom">
              <Select
                label="Mã khu"
                placeholder="Chọn mã khu"
                clearable={false}
                style={{ minWidth: 200 }}
                value={maKhu}
                onChange={setMaKhu}
                data={dsKhu}
              />
            </div>

            <div className="filter-actions-custom">
              <Button
                leftSection={<IconSearch size={18} />}
                color="blue"
                radius="md"
                onClick={handleSearch}
              >
                Tìm kiếm
              </Button>

              <Button
                leftSection={<IconRefresh size={18} />}
                variant="default"
                radius="md"
                onClick={handleReset}
              >
                Làm mới
              </Button>

              <Button
                leftSection={<IconCloudDownload size={18} />}
                color="green"
                radius="md"
                onClick={handleOpenSync}
              >
                Đồng bộ từ UIIS
              </Button>
            </div>
          </>
        }
        pagination={
          <CustomPagination
            totalItems={totalItems}
            totalPages={totalPages}
            page={page}
            pageSize={pageSize}
            setPage={setPage}
            setPageSize={setPageSize}
            fetchData={loadData}
          />
        }
      />

      <Modal
        opened={openedSync}
        onClose={handleCloseSync}
        title="Đồng bộ danh sách từ UIIS"
        centered
        size="80%"
        radius="lg"
      >
        <Group align="end" grow mb="md">
          <TextInput
            label="Năm học"
            placeholder="Nhập năm học"
            value={namHoc}
            onChange={(e) => setNamHoc(e.currentTarget.value)}
          />

          <TextInput
            label="Học kỳ"
            placeholder="Nhập học kỳ"
            value={hocKy}
            onChange={(e) => setHocKy(e.currentTarget.value)}
          />

          <Button
            color="blue"
            leftSection={<IconEye size={18} />}
            loading={previewLoading}
            onClick={handlePreviewKhuUiis}
          >
            Xem dữ liệu
          </Button>
        </Group>

        {showPreview && (
          <>
            <SimpleGrid cols={{ base: 1, md: 4 }} spacing="md" mb="md">
              <Paper
                withBorder
                radius="md"
                p="md"
                style={{ borderColor: "#bfdbfe", background: "#f8fbff" }}
              >
                <Text size="sm" c="blue.6" fw={700}>
                  Trong UIIS
                </Text>
                <Text size="xl" fw={800} c="blue.7">
                  {previewSummary.totalUiis}
                </Text>
              </Paper>

              <Paper
                withBorder
                radius="md"
                p="md"
                style={{ borderColor: "#cce8d1", background: "#f3fbf4" }}
              >
                <Text size="sm" c="green.6" fw={700}>
                  Hoàn toàn mới
                </Text>
                <Text size="xl" fw={800} c="green.7">
                  {previewSummary.totalNew}
                </Text>
              </Paper>

              <Paper
                withBorder
                radius="md"
                p="md"
                style={{ borderColor: "#fde0b5", background: "#fffaf1" }}
              >
                <Text size="sm" c="orange.6" fw={700}>
                  Có thay đổi
                </Text>
                <Text size="xl" fw={800} c="orange.7">
                  {previewSummary.totalChanged}
                </Text>
              </Paper>

              <Paper
                withBorder
                radius="md"
                p="md"
                style={{ borderColor: "#e5e7eb", background: "#fafafa" }}
              >
                <Text size="sm" c="gray.6" fw={700}>
                  Không đổi
                </Text>
                <Text size="xl" fw={800} c="gray.7">
                  {previewSummary.totalSame}
                </Text>
              </Paper>
            </SimpleGrid>

            <ScrollArea h={420}>
              <Table withColumnBorders highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th w={60} ta="center">
                      STT
                    </Table.Th>

                    <Table.Th w={110} ta="center">
                      Mã khu
                    </Table.Th>

                    <Table.Th ta="center">Dữ liệu UIIS</Table.Th>

                    <Table.Th ta="center">Dữ liệu hiện tại</Table.Th>

                    <Table.Th w={150} ta="center">
                      Trạng thái
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                  {previewRows.map((row) => (
                    <Table.Tr
                      key={`${row.maKhu}-${row.stt}`}
                      style={{
                        background:
                          row.status === "NEW"
                            ? "rgba(34, 197, 94, 0.06)"
                            : row.status === "CHANGED"
                              ? "rgba(245, 158, 11, 0.08)"
                              : undefined,
                      }}
                    >
                      {/* STT */}
                      <Table.Td ta="center" style={{ verticalAlign: "middle" }}>
                        {row.stt}
                      </Table.Td>

                      {/* Mã khu */}
                      <Table.Td ta="center" style={{ verticalAlign: "middle" }}>
                        <Text fw={700}>{row.maKhu}</Text>
                      </Table.Td>

                      {/* Dữ liệu UIIS */}
                      <Table.Td>
                        <Text fw={700}>Tên khu: {row.uiis.tenKhu}</Text>
                        <Text>Số phòng: {row.uiis.soLuongPhong}</Text>
                        <Text>Mô tả: {row.uiis.moTa}</Text>
                      </Table.Td>

                      {/* Dữ liệu hiện tại */}
                      <Table.Td>
                        {row.current ? (
                          <>
                            <Text fw={700}>Tên khu: {row.current.tenKhu}</Text>
                            <Text>Số phòng: {row.current.soLuongPhong}</Text>
                            <Text>Mô tả: {row.current.moTa}</Text>
                          </>
                        ) : (
                          <Text c="green.7" fw={700}>
                            Chưa có trong KTX
                          </Text>
                        )}
                      </Table.Td>

                      {/* Trạng thái */}
                      <Table.Td ta="center" style={{ verticalAlign: "middle" }}>
                        {renderStatusBadge(row.status)}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            <Divider my="md" />

            {previewMessage && (
              <Box mb="md">
                <Text fw={600} c={previewMessage.color}>
                  {previewMessage.text}
                </Text>
              </Box>
            )}
          </>
        )}

        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={handleCloseSync}>
            Hủy
          </Button>

          {canConfirmSync && (
            <Button
              color="green"
              leftSection={<IconArrowsShuffle size={18} />}
              loading={confirmSyncLoading}
              onClick={handleConfirmSyncKhuUiis}
            >
              Xác nhận đồng bộ
            </Button>
          )}
        </Group>
      </Modal>
    </>
  );
}
