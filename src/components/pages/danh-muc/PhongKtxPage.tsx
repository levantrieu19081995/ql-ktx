/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  Group,
  Loader,
  Modal,
  Paper,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import {
  IconArrowsShuffle,
  IconBuildingTunnel,
  IconCloudDownload,
  IconEye,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react";

import DanhMucFeaturePage from "./DanhMucFeaturePage";
import CustomPagination from "@/components/common/CustomPagination";
import {
  fetchDanhMucKhuKtx,
  fetchDanhSachPhongKtx,
  fetchDanhSachPhongUiis,
  fetchSinhVienTheoMaPhong,
  syncDanhSachPhongUiis,
} from "@/services/danh-muc/danhMucKtxService";
import type { PhongKtx, SinhVienKtx } from "@/types/type-danh-muc-ktx";
import useAccountAccess from "@/hooks/useAccountAccess";

type SyncStatus = "SAME" | "CHANGED" | "NEW";
type PreviewFilter = "ALL" | SyncStatus;

type SyncPreviewRow = {
  stt: number;
  maPhong: string;
  uiis: {
    maKhu: string;
    tenPhong: string;
    sucChua: string;
  };
  current: {
    maPhong: string;
    maKhu: string;
    tenPhong: string;
    sucChua: string;
  } | null;
  status: SyncStatus;
};

type UiisPhongItem = {
  phong_id?: string | number;
  uiis_phong_id?: string | number;
  ktx_td_phong_id?: string | number;
  ma_phong?: string;
  phong_ma?: string;
  ktx_td_phong_ma?: string;
  ten_phong?: string;
  phong_ten?: string;
  ktx_td_phong_ten?: string;
  suc_chua?: string | number;
  so_luong_cho?: string | number;
  ktx_td_phong_suc_chua?: string | number;
  khu_id?: string | number;
  ma_khu?: string;
  khu_ma?: string;
};

type KhuOption = {
  value: string;
  label: string;
  khuId: number;
  uiisKhuId?: number;
};

const normalizeString = (value?: string | number | null) =>
  String(value ?? "").trim();

const displayText = (value?: string | number | null) =>
  normalizeString(value) || "-";

const getUiisPhongId = (item: UiisPhongItem) =>
  item.ktx_td_phong_id ?? item.phong_id ?? item.uiis_phong_id;

const getUiisMaPhong = (item: UiisPhongItem) =>
  item.ktx_td_phong_ma || item.ma_phong || item.phong_ma;

const getUiisTenPhong = (item: UiisPhongItem) =>
  item.ktx_td_phong_ten ||
  item.ten_phong ||
  item.phong_ten ||
  item.ktx_td_phong_ma ||
  item.ma_phong;

const getUiisSucChua = (item: UiisPhongItem) =>
  item.ktx_td_phong_suc_chua || item.suc_chua || item.so_luong_cho;

export default function PhongKtxPage() {
  const { isAdmin } = useAccountAccess();
  const [items, setItems] = useState<PhongKtx[]>([]);
  const [dsKhu, setDsKhu] = useState<KhuOption[]>([]);
  const [dsPhong, setDsPhong] = useState<{ value: string; label: string }[]>(
    [],
  );

  const [maKhu, setMaKhu] = useState("");
  const [maPhong, setMaPhong] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    maKhu: "-1",
    maPhong: "-1",
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [openedSync, setOpenedSync] = useState(false);
  const [namHoc, setNamHoc] = useState("2026");
  const [hocKy, setHocKy] = useState("1");
  const [syncMaKhu, setSyncMaKhu] = useState("-1");
  const [currentItems, setCurrentItems] = useState<PhongKtx[]>([]);
  const [uiisItems, setUiisItems] = useState<UiisPhongItem[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [confirmSyncLoading, setConfirmSyncLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activePreviewFilter, setActivePreviewFilter] =
    useState<PreviewFilter>("ALL");
  const [selectedRoom, setSelectedRoom] = useState<PhongKtx | null>(null);
  const [roomDrawerOpened, setRoomDrawerOpened] = useState(false);
  const [roomStudents, setRoomStudents] = useState<SinhVienKtx[]>([]);
  const [roomStudentsLoading, setRoomStudentsLoading] = useState(false);

  const handleOpenSync = () => {
    setSyncMaKhu(appliedFilters.maKhu || "-1");
    setOpenedSync(true);
    setShowPreview(false);
    setActivePreviewFilter("ALL");
    setUiisItems([]);
    setCurrentItems([]);
  };

  const handleCloseSync = () => {
    setOpenedSync(false);
    setShowPreview(false);
    setActivePreviewFilter("ALL");
    setUiisItems([]);
    setCurrentItems([]);
  };

  const handleOpenRoomDrawer = async (room: PhongKtx) => {
    const roomCode = room.phongMa || room.maPhong || "";
    if (!roomCode) return;

    setSelectedRoom(room);
    setRoomDrawerOpened(true);
    setRoomStudents([]);

    try {
      setRoomStudentsLoading(true);
      const students = await fetchSinhVienTheoMaPhong(roomCode);
      setRoomStudents(Array.isArray(students) ? students : []);
    } catch (error) {
      console.error("Lỗi lấy danh sách sinh viên theo mã phòng:", error);
      setRoomStudents([]);
    } finally {
      setRoomStudentsLoading(false);
    }
  };

  const buildSyncPayload = () => {
    const matchedKhu = dsKhu.find((item) => item.value === syncMaKhu);

    return {
      nam_hoc: Number(namHoc) || 0,
      hoc_ky: Number(hocKy) || 0,
      khu_id:
        syncMaKhu && syncMaKhu !== "-1"
          ? Number(matchedKhu?.uiisKhuId ?? matchedKhu?.khuId ?? 0)
          : 0,
    };
  };

  const loadDanhMucKhu = async () => {
    try {
      const res = await fetchDanhMucKhuKtx();
      setDsKhu([
        ...res.map((item) => ({
          value: item.khuMa || item.maKhu || "",
          label: item.khuTen || item.tenKhu || item.khuMa || item.maKhu || "",
          khuId: Number(item.khuId ?? item.uiisKhuId ?? 0),
          uiisKhuId: Number(item.uiisKhuId ?? 0),
        })),
      ]);
    } catch (error) {
      console.error("Lỗi lấy danh mục khu KTX:", error);
      setDsKhu([{ value: "-1", label: "Tất cả", khuId: 0 }]);
    }
  };

  const loadDanhMucPhongOptions = async (khuValue: string) => {
    try {
      const res = await fetchDanhSachPhongKtx({
        page: 1,
        pageSize: 9999,
        maKhu: khuValue || "-1",
        maPhong: "-1",
      });

      // setDsPhong([
      //   { value: "-1", label: "Tất cả" },
      //   ...(res?.items || []).map((item: PhongKtx) => ({
      //     value: item.maPhong || item.phongMa || "",
      //     label: item.tenPhong || item.phongMa || item.maPhong || "",
      //   })),
      // ]);

      const uniqueRooms = Array.from(
        new Map(
          (res?.items || [])
            .map((item: PhongKtx) => {
              const value = String(item.maPhong || item.phongMa || "").trim();

              return [
                value,
                {
                  value,
                  label: item.tenPhong || item.phongMa || item.maPhong || value,
                },
              ] as const;
            })
            .filter(([value]) => value),
        ).values(),
      );

      setDsPhong([{ value: "-1", label: "Tất cả" }, ...uniqueRooms]);
    } catch (error) {
      console.error("Lỗi lấy danh mục phòng KTX:", error);
      setDsPhong([{ value: "-1", label: "Tất cả" }]);
    }
  };

  const loadData = async (
    pageValue = page,
    pageSizeValue = pageSize,
    filters?: { maKhu?: string; maPhong?: string },
  ) => {
    try {
      const res = await fetchDanhSachPhongKtx({
        page: pageValue,
        pageSize: pageSizeValue,
        maKhu: filters?.maKhu ?? appliedFilters.maKhu,
        maPhong: filters?.maPhong ?? appliedFilters.maPhong,
      });

      setItems(res?.items || []);
      setTotalItems(res?.totalElements || 0);
      setTotalPages(res?.totalPages || 0);
    } catch (error) {
      console.error("Lỗi lấy danh sách phòng KTX:", error);
      setItems([]);
      setTotalItems(0);
      setTotalPages(0);
    }
  };

  const handleSearch = () => {
    const effectiveMaKhu = maKhu.trim() || "-1";
    const effectiveMaPhong = maPhong.trim() || "-1";

    setAppliedFilters({
      maKhu: effectiveMaKhu,
      maPhong: effectiveMaPhong,
    });
    setPage(1);
    loadData(1, pageSize, {
      maKhu: effectiveMaKhu,
      maPhong: effectiveMaPhong,
    });
  };

  const handleReset = async () => {
    setMaKhu("");
    setMaPhong("");
    setAppliedFilters({
      maKhu: "-1",
      maPhong: "-1",
    });
    setPage(1);

    try {
      const res = await fetchDanhSachPhongKtx({
        page: 1,
        pageSize: pageSize,
        maKhu: "-1",
        maPhong: "-1",
      });

      setItems(res?.items || []);
      setTotalItems(res?.totalElements || 0);
      setTotalPages(res?.totalPages || 0);
    } catch (error) {
      console.error("Lỗi làm mới danh sách phòng KTX:", error);
      setItems([]);
      setTotalItems(0);
      setTotalPages(0);
    }
  };

  const handlePreviewPhongUiis = async () => {
    try {
      setPreviewLoading(true);

      const [uiisRes, currentRes] = await Promise.all([
        fetchDanhSachPhongUiis(buildSyncPayload()),
        fetchDanhSachPhongKtx({
          page: 1,
          pageSize: 9999,
          maKhu: syncMaKhu || "-1",
          maPhong: "-1",
        }),
      ]);

      const uiisPayload = uiisRes?.payload || {};
      const uiisData = uiisPayload?.data || [];

      setActivePreviewFilter("ALL");
      setUiisItems(Array.isArray(uiisData) ? uiisData : []);
      setCurrentItems(currentRes?.items || []);
      setShowPreview(true);
    } catch (error) {
      console.error("Lỗi xem trước sync phòng UIIS:", error);
      setShowPreview(false);
      setUiisItems([]);
      setCurrentItems([]);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleConfirmSyncPhongUiis = async () => {
    try {
      setConfirmSyncLoading(true);

      await syncDanhSachPhongUiis(buildSyncPayload());

      handleCloseSync();
      await loadDanhMucPhongOptions(appliedFilters.maKhu);
      await loadData(1, pageSize);
      setPage(1);
    } catch (error) {
      console.error("Lỗi đồng bộ phòng từ UIIS:", error);
    } finally {
      setConfirmSyncLoading(false);
    }
  };

  const previewRows = useMemo<SyncPreviewRow[]>(() => {
    return uiisItems.map((uiisItem, index) => {
      const uiisPhongId = getUiisPhongId(uiisItem);
      const uiisMaPhong = displayText(getUiisMaPhong(uiisItem));
      const uiisTenPhong = displayText(getUiisTenPhong(uiisItem));
      const uiisSucChua = displayText(getUiisSucChua(uiisItem));
      const uiisMaKhu = displayText(uiisItem.ma_khu || uiisItem.khu_ma);

      const currentItem =
        currentItems.find((item) => {
          if (uiisPhongId && item.uiisPhongId) {
            return String(item.uiisPhongId) === String(uiisPhongId);
          }

          return normalizeString(item.phongMa || item.maPhong) === uiisMaPhong;
        }) || null;

      const isChanged =
        !!currentItem &&
        normalizeString(currentItem.phongMa || currentItem.maPhong) !==
          uiisMaPhong;

      // const isChanged =
      //   !!currentItem &&
      //   (normalizeString(currentItem.phongMa || currentItem.maPhong) !==
      //     uiisMaPhong ||
      //     normalizeString(currentItem.tenPhong || currentItem.maPhong) !==
      //       uiisTenPhong);
      // ||
      // normalizeString(currentItem.sucChua) !== uiisSucChua);
      // ||
      // normalizeString(currentItem.khuMa || currentItem.maKhu) !==
      //   uiisMaKhu);

      return {
        stt: index + 1,
        maPhong: uiisMaPhong,
        uiis: {
          maKhu: uiisMaKhu,
          tenPhong: uiisTenPhong,
          sucChua: uiisSucChua,
        },
        current: currentItem
          ? {
              maKhu: displayText(currentItem.khuMa || currentItem.maKhu),
              maPhong: displayText(currentItem.phongMa || currentItem.maPhong),
              tenPhong: displayText(
                currentItem.tenPhong || currentItem.maPhong,
              ),
              sucChua: displayText(currentItem.sucChua),
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

  const filteredPreviewRows = useMemo(() => {
    if (activePreviewFilter === "ALL") return previewRows;
    return previewRows.filter((row) => row.status === activePreviewFilter);
  }, [activePreviewFilter, previewRows]);

  const previewMessage = useMemo(() => {
    if (!showPreview) return null;
    if (previewSummary.totalUiis === 0) {
      return {
        color: "#64748b",
        text: "Không có dữ liệu phòng từ UIIS.",
      };
    }
    if (previewSummary.totalChanged > 0) {
      return {
        color: "#d97706",
        text: `Có ${previewSummary.totalChanged} phòng bị thay đổi so với dữ liệu hiện tại.`,
      };
    }
    if (previewSummary.totalNew > 0) {
      return {
        color: "#16a34a",
        text: `Có ${previewSummary.totalNew} phòng mới hoàn toàn chưa có trong dữ liệu hiện tại.`,
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

  const getSummaryCardStyles = (
    filter: PreviewFilter,
    borderColor: string,
    background: string,
  ) => ({
    borderColor,
    background,
    cursor: "pointer",
    transition: "all 0.15s ease",
    boxShadow:
      activePreviewFilter === filter
        ? `0 0 0 2px ${borderColor} inset`
        : undefined,
  });

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
  }, []);

  useEffect(() => {
    setMaPhong("");
    loadDanhMucPhongOptions(maKhu);
  }, [maKhu]);

  useEffect(() => {
    loadData(1, pageSize);
  }, []);

  const selectedRoomAvailableSlots = Number(selectedRoom?.soChoDangCo);
  const remainingRoomSlots = Number.isFinite(selectedRoomAvailableSlots)
    ? Math.max(selectedRoomAvailableSlots - roomStudents.length, 0)
    : null;

  return (
    <>
      <DanhMucFeaturePage
        type="phongKtx"
        title="Danh sách phòng ký túc xá"
        description="Quản lý danh mục phòng theo khu ký túc xá."
        items={items}
        page={page}
        pageSize={pageSize}
        onSelectRoom={handleOpenRoomDrawer}
        icon={<IconBuildingTunnel size={20} />}
        searchControls={
          <Stack gap="md" w="100%">
            <Group align="end" style={{ flexGrow: 1, gap: "16px" }}>
              <Autocomplete
                label="Khu ký túc xá"
                placeholder="Chọn khu..."
                data={dsKhu
                  .map((item) => item.value)
                  .filter((value) => value && value !== "-1")}
                value={maKhu}
                onChange={setMaKhu}
                style={{ minWidth: 180, flex: 1 }}
              />
              <Autocomplete
                label="Phòng"
                placeholder="Chọn phòng..."
                data={dsPhong
                  .map((item) => item.value)
                  .filter((value) => value && value !== "-1")}
                value={maPhong}
                onChange={setMaPhong}
                style={{ minWidth: 180, flex: 1 }}
              />
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
              {isAdmin && (
                <Button
                  leftSection={<IconCloudDownload size={18} />}
                  color="green"
                  radius="md"
                  onClick={handleOpenSync}
                >
                  Đồng bộ từ UIIS
                </Button>
              )}
            </Group>
          </Stack>
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
        title="Đồng bộ danh sách phòng từ UIIS"
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

          <Select
            label="Khu ký túc xá"
            placeholder="Chọn khu"
            data={dsKhu.map((item) => ({
              value: item.value,
              label: item.label,
            }))}
            value={syncMaKhu}
            onChange={(value) => setSyncMaKhu(value || "-1")}
          />

          <Button
            color="blue"
            leftSection={<IconEye size={18} />}
            loading={previewLoading}
            onClick={handlePreviewPhongUiis}
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
                style={getSummaryCardStyles("ALL", "#bfdbfe", "#f8fbff")}
                onClick={() => setActivePreviewFilter("ALL")}
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
                style={getSummaryCardStyles("NEW", "#cce8d1", "#f3fbf4")}
                onClick={() => setActivePreviewFilter("NEW")}
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
                style={getSummaryCardStyles("CHANGED", "#fde0b5", "#fffaf1")}
                onClick={() => setActivePreviewFilter("CHANGED")}
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
                style={getSummaryCardStyles("SAME", "#e5e7eb", "#fafafa")}
                onClick={() => setActivePreviewFilter("SAME")}
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
                    <Table.Th w={120} ta="center">
                      Mã phòng
                    </Table.Th>
                    <Table.Th ta="center">Dữ liệu UIIS</Table.Th>
                    <Table.Th ta="center">Dữ liệu hiện tại</Table.Th>
                    <Table.Th w={150} ta="center">
                      Trạng thái
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                  {filteredPreviewRows.map((row) => (
                    <Table.Tr
                      key={`${row.maPhong}-${row.stt}`}
                      style={{
                        background:
                          row.status === "NEW"
                            ? "rgba(34, 197, 94, 0.06)"
                            : row.status === "CHANGED"
                              ? "rgba(245, 158, 11, 0.08)"
                              : undefined,
                      }}
                    >
                      <Table.Td ta="center" style={{ verticalAlign: "middle" }}>
                        {row.stt}
                      </Table.Td>

                      <Table.Td ta="center" style={{ verticalAlign: "middle" }}>
                        <Text fw={700}>{row.maPhong}</Text>
                      </Table.Td>

                      <Table.Td>
                        {/* <Text fw={700}>Khu: {row.uiis.maKhu}</Text> */}
                        {/* <Text>Tên phòng: {row.uiis.tenPhong}</Text>
                        <Text>Sức chứa: {row.uiis.sucChua}</Text> */}
                        <Text>Mã phòng: {row.maPhong}</Text>
                      </Table.Td>

                      <Table.Td>
                        {row.current ? (
                          <>
                            {/* <Text fw={700}>Khu: {row.current.maKhu}</Text> */}
                            {/* <Text>Tên phòng: {row.current.tenPhong}</Text>
                            <Text>Sức chứa: {row.current.sucChua}</Text> */}
                            <Text>Mã phòng: {row.current.maPhong}</Text>
                          </>
                        ) : (
                          <Text c="green.7" fw={700}>
                            Chưa có trong KTX
                          </Text>
                        )}
                      </Table.Td>

                      <Table.Td ta="center" style={{ verticalAlign: "middle" }}>
                        {renderStatusBadge(row.status)}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  {filteredPreviewRows.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={5} ta="center">
                        Không có dữ liệu phù hợp với trạng thái đang chọn.
                      </Table.Td>
                    </Table.Tr>
                  )}
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
              onClick={handleConfirmSyncPhongUiis}
            >
              Xác nhận đồng bộ
            </Button>
          )}
        </Group>
      </Modal>

      <Drawer
        opened={roomDrawerOpened}
        onClose={() => setRoomDrawerOpened(false)}
        position="right"
        size="lg"
        title={`Thông tin phòng ${selectedRoom?.phongMa || selectedRoom?.maPhong || ""}`}
      >
        <Stack gap="md">
          <Paper withBorder radius="md" p="md">
            <SimpleGrid cols={2} spacing="md">
              <Box>
                <Text size="sm" c="dimmed">
                  Mã phòng
                </Text>
                <Text fw={700}>
                  {selectedRoom?.phongMa || selectedRoom?.maPhong || "-"}
                </Text>
              </Box>
              <Box>
                <Text size="sm" c="dimmed">
                  Khu
                </Text>
                <Text fw={700}>
                  {selectedRoom?.tenKhu ||
                    selectedRoom?.khuTen ||
                    selectedRoom?.maKhu ||
                    "-"}
                </Text>
              </Box>
            </SimpleGrid>

            <Divider my="md" />

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <Box>
                <Text size="sm" c="dimmed">
                  Sức chứa tối đa
                </Text>
                <Text fw={700}>{selectedRoom?.sucChua ?? "-"}</Text>
              </Box>
              <Box>
                <Text size="sm" c="dimmed">
                  Số sinh viên hiện tại
                </Text>
                <Text fw={700}>
                  {roomStudentsLoading ? "Đang tải..." : roomStudents.length}
                </Text>
              </Box>
              <Box>
                <Text size="sm" c="dimmed">
                  Số chỗ còn trống
                </Text>
                <Text fw={700}>
                  {roomStudentsLoading
                    ? "Đang tải..."
                    : (remainingRoomSlots ?? "-")}
                </Text>
              </Box>
            </SimpleGrid>
          </Paper>

          <Box>
            <Text fw={700} mb="sm">
              Danh sách sinh viên trong phòng
            </Text>

            {roomStudentsLoading ? (
              <Group justify="center" py="xl">
                <Loader size="sm" />
              </Group>
            ) : (
              <ScrollArea h={420}>
                <Table withColumnBorders highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th w={60} ta="center">
                        STT
                      </Table.Th>
                      <Table.Th>Mã sinh viên</Table.Th>
                      <Table.Th>Họ tên</Table.Th>
                      <Table.Th>Lớp</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {roomStudents.length > 0 ? (
                      roomStudents.map((student, index) => (
                        <Table.Tr
                          key={
                            student.sinhVienId ||
                            student.id ||
                            student.maSinhVien ||
                            index
                          }
                        >
                          <Table.Td ta="center">{index + 1}</Table.Td>
                          <Table.Td>
                            {student.maSinhVien ||
                              student.mssv ||
                              student.maso ||
                              "-"}
                          </Table.Td>
                          <Table.Td>
                            {student.hoTen || student.hoten || "-"}
                          </Table.Td>
                          <Table.Td>{student.lop || "-"}</Table.Td>
                        </Table.Tr>
                      ))
                    ) : (
                      <Table.Tr>
                        <Table.Td colSpan={4} ta="center">
                          Chưa có sinh viên trong phòng.
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            )}
          </Box>
        </Stack>
      </Drawer>
    </>
  );
}
