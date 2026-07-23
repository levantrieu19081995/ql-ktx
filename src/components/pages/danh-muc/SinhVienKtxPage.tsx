/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Group,
  Loader,
  Modal,
  Paper,
  Progress,
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
  IconCloudDownload,
  IconEye,
  IconRefresh,
  IconSearch,
  IconUsers,
} from "@tabler/icons-react";

import DanhMucFeaturePage from "./DanhMucFeaturePage";
import CustomPagination from "@/components/common/CustomPagination";
import { showNoti } from "@/components/common/showNoti";
import {
  type PagedFetchProgress,
  fetchAllDanhSachSinhVienKtx,
  fetchAllDanhSachSinhVienUiis,
  fetchDanhSachPhongKtx,
  fetchDanhSachSinhVienKtx,
  fetchDanhMucKhuKtx,
  syncDanhSachSinhVienUiis,
} from "@/services/danh-muc/danhMucKtxService";
import type { PhongKtx, SinhVienKtx } from "@/types/type-danh-muc-ktx";

type SelectOption = {
  value: string;
  label: string;
  khuId?: number;
  uiisKhuId?: number;
};

type SyncStatus = "SAME" | "CHANGED" | "NEW";
type PreviewFilter = "ALL" | SyncStatus;

type SyncPreviewRow = {
  stt: number;
  maSinhVien: string;
  uiis: {
    hoTen: string;
    lop: string;
    maPhong: string;
    maKhu: string;
  };
  current: {
    hoTen: string;
    lop: string;
    maPhong: string;
    maKhu: string;
  } | null;
  status: SyncStatus;
};

type UiisSinhVienItem = {
  ma_sinh_vien?: string;
  maSinhVien?: string;
  sv_tu_dien_sinh_vien_ma?: string;
  ho_ten?: string;
  hoTen?: string;
  sv_tu_dien_sinh_vien_ten?: string;
  lop?: string;
  f_tenlop?: string;
  ma_phong?: string;
  maPhong?: string;
  ktx_td_phong_ma?: string;
  ma_khu?: string;
  maKhu?: string;
  ktx_td_khu_ma?: string;
};

type PreviewFetchProgressState = {
  uiis: PagedFetchProgress | null;
  current: PagedFetchProgress | null;
};

const normalizeString = (value?: string | null) => (value ?? "").trim();
const displayText = (value?: string | null) => normalizeString(value) || "-";
const getUiisMaSinhVien = (item: UiisSinhVienItem) =>
  item.sv_tu_dien_sinh_vien_ma || item.ma_sinh_vien || item.maSinhVien;
const getUiisHoTen = (item: UiisSinhVienItem) =>
  item.sv_tu_dien_sinh_vien_ten || item.ho_ten || item.hoTen;
const getUiisLop = (item: UiisSinhVienItem) => item.f_tenlop || item.lop;
const getUiisMaPhong = (item: UiisSinhVienItem) =>
  item.ktx_td_phong_ma || item.ma_phong || item.maPhong;
const getUiisMaKhu = (item: UiisSinhVienItem) =>
  item.ktx_td_khu_ma || item.ma_khu || item.maKhu;

export default function SinhVienKtxPage() {
  const [items, setItems] = useState<SinhVienKtx[]>([]);
  const [dsKhu, setDsKhu] = useState<SelectOption[]>([]);
  const [dsPhong, setDsPhong] = useState<SelectOption[]>([]);

  const [maKhu, setMaKhu] = useState("");
  const [maPhong, setMaPhong] = useState("");
  const [maSinhVien, setMaSinhVien] = useState("");
  const [hoTen, setHoTen] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    maKhu: "-1",
    maPhong: "-1",
  });

  const [roomsList, setRoomsList] = useState<PhongKtx[]>([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [openedSync, setOpenedSync] = useState(false);
  const [namHoc, setNamHoc] = useState("2026");
  const [hocKy, setHocKy] = useState("1");
  const [syncMaKhu, setSyncMaKhu] = useState("-1");
  const [syncMaPhong, setSyncMaPhong] = useState("-1");
  const [syncPhongOptions, setSyncPhongOptions] = useState<SelectOption[]>([
    { value: "-1", label: "Tất cả" },
  ]);
  const [currentItems, setCurrentItems] = useState<SinhVienKtx[]>([]);
  const [uiisItems, setUiisItems] = useState<UiisSinhVienItem[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [confirmSyncLoading, setConfirmSyncLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activePreviewFilter, setActivePreviewFilter] =
    useState<PreviewFilter>("ALL");
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [previewFetchProgress, setPreviewFetchProgress] =
    useState<PreviewFetchProgressState>({
      uiis: null,
      current: null,
    });

  const mapPhongOptions = (rooms: PhongKtx[]): SelectOption[] => [
    { value: "-1", label: "Tất cả" },
    ...rooms.map((item) => ({
      value: item.maPhong || item.phongMa || "",
      label: item.tenPhong || item.phongMa || item.maPhong || "",
    })),
  ];

  const loadDanhMucKhu = async () => {
    try {
      const res = await fetchDanhMucKhuKtx();
      setDsKhu([
        { value: "-1", label: "Tất cả", khuId: 0 },
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

  const loadDanhMucPhong = async (khuValue: string) => {
    if (!khuValue || khuValue === "-1") {
      setDsPhong(mapPhongOptions(roomsList));
      return;
    }

    try {
      const res = await fetchDanhSachPhongKtx({
        page: 1,
        pageSize: 9999,
        maKhu: khuValue,
        maPhong: "-1",
      });

      setDsPhong(mapPhongOptions(res?.items || []));
    } catch (error) {
      console.error("Lỗi lấy danh mục phòng KTX:", error);
      setDsPhong([{ value: "-1", label: "Tất cả" }]);
    }
  };

  const loadSyncPhongOptions = async (khuValue: string) => {
    if (!khuValue || khuValue === "-1") {
      setSyncPhongOptions(mapPhongOptions(roomsList));
      return;
    }

    try {
      const res = await fetchDanhSachPhongKtx({
        page: 1,
        pageSize: 9999,
        maKhu: khuValue,
        maPhong: "-1",
      });

      setSyncPhongOptions(mapPhongOptions(res?.items || []));
    } catch (error) {
      console.error("Lỗi lấy phòng sync sinh viên KTX:", error);
      setSyncPhongOptions([{ value: "-1", label: "Tất cả" }]);
    }
  };

  const loadAllRooms = async () => {
    try {
      const res = await fetchDanhSachPhongKtx({
        page: 1,
        pageSize: 9999,
        maKhu: "-1",
        maPhong: "-1",
      });

      const allRooms = res?.items || [];
      setRoomsList(allRooms);

      if (!maKhu || maKhu === "-1") {
        setDsPhong(mapPhongOptions(allRooms));
      }
      setSyncPhongOptions(mapPhongOptions(allRooms));
    } catch (error) {
      console.error("Lỗi tải toàn bộ phòng KTX:", error);
      setRoomsList([]);
      setDsPhong([{ value: "-1", label: "Tất cả" }]);
      setSyncPhongOptions([{ value: "-1", label: "Tất cả" }]);
    }
  };

  const loadData = async (
    pageValue = page,
    pageSizeValue = pageSize,
    filters?: { maKhu?: string; maPhong?: string },
  ) => {
    try {
      const res = await fetchDanhSachSinhVienKtx({
        page: pageValue,
        pageSize: pageSizeValue,
        maKhu: filters?.maKhu ?? appliedFilters.maKhu,
        maPhong: filters?.maPhong ?? appliedFilters.maPhong,
        maSinhVien: maSinhVien.trim() || undefined,
        hoTen: hoTen.trim() || undefined,
      });

      setItems(res?.items || []);
      setTotalItems(res?.totalElements || 0);
      setTotalPages(res?.totalPages || 0);
    } catch (error) {
      console.error("Lỗi lấy danh sách sinh viên KTX:", error);
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
    setMaKhu("-1");
    setMaPhong("-1");
    setAppliedFilters({
      maKhu: "-1",
      maPhong: "-1",
    });
    setMaSinhVien("");
    setHoTen("");
    setPage(1);
    setDsPhong(mapPhongOptions(roomsList));

    try {
      const res = await fetchDanhSachSinhVienKtx({
        page: 1,
        pageSize,
        maKhu: "-1",
        maPhong: "-1",
        maSinhVien: undefined,
        hoTen: undefined,
      });

      setItems(res?.items || []);
      setTotalItems(res?.totalElements || 0);
      setTotalPages(res?.totalPages || 0);
    } catch (error) {
      console.error("Lỗi làm mới danh sách sinh viên KTX:", error);
      setItems([]);
      setTotalItems(0);
      setTotalPages(0);
    }
  };

  const handleOpenSync = () => {
    setOpenedSync(true);
    setShowPreview(false);
    setActivePreviewFilter("ALL");
    setPreviewFetchProgress({
      uiis: null,
      current: null,
    });
    setUiisItems([]);
    setCurrentItems([]);
    setSyncMaKhu(appliedFilters.maKhu || "-1");
    setSyncMaPhong(appliedFilters.maPhong || "-1");
  };

  const handleCloseSync = () => {
    setOpenedSync(false);
    setShowPreview(false);
    setActivePreviewFilter("ALL");
    setPreviewFetchProgress({
      uiis: null,
      current: null,
    });
    setUiisItems([]);
    setCurrentItems([]);
    setSyncMaKhu("-1");
    setSyncMaPhong("-1");
    setSyncPhongOptions(mapPhongOptions(roomsList));
  };

  const buildSyncPayload = () => {
    const matchedKhu = dsKhu.find((item) => item.value === syncMaKhu);

    return {
      nam_hoc: Number(namHoc) || 0,
      hoc_ky: Number(hocKy) || 0,
      ma_phong: syncMaPhong && syncMaPhong !== "-1" ? syncMaPhong : "",
      khu_id:
        syncMaKhu && syncMaKhu !== "-1"
          ? Number(matchedKhu?.uiisKhuId ?? matchedKhu?.khuId ?? 0)
          : 0,
    };
  };

  const handlePreviewSinhVienUiis = async () => {
    try {
      setPreviewLoading(true);
      setPreviewFetchProgress({
        uiis: null,
        current: null,
      });

      const payload = buildSyncPayload();
      const [uiisRes, currentRes] = await Promise.all([
        fetchAllDanhSachSinhVienUiis(payload, undefined, (progress) => {
          setPreviewFetchProgress((prev) => ({
            ...prev,
            uiis: progress,
          }));
        }),
        fetchAllDanhSachSinhVienKtx(
          {
            maKhu: syncMaKhu || "-1",
            maPhong: syncMaPhong || "-1",
            maSinhVien: undefined,
            hoTen: undefined,
          },
          undefined,
          (progress) => {
            setPreviewFetchProgress((prev) => ({
              ...prev,
              current: progress,
            }));
          },
        ),
      ]);

      setUiisItems(Array.isArray(uiisRes) ? uiisRes : []);
      setCurrentItems(currentRes || []);
      setActivePreviewFilter("ALL");
      setShowPreview(true);
    } catch (error) {
      console.error("Lỗi xem trước sync sinh viên UIIS:", error);
      showNoti("error", "Không lấy được dữ liệu UIIS để đối chiếu.");
      setShowPreview(false);
      setUiisItems([]);
      setCurrentItems([]);
      setPreviewFetchProgress({
        uiis: null,
        current: null,
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleConfirmSyncSinhVienUiis = async () => {
    try {
      setConfirmSyncLoading(true);
      await syncDanhSachSinhVienUiis(buildSyncPayload());

      showNoti("success", "Đồng bộ danh sách sinh viên từ UIIS thành công.");
      handleCloseSync();
      await loadAllRooms();
      await loadData(1, pageSize);
      setPage(1);
    } catch (error) {
      console.error("Lỗi đồng bộ sinh viên UIIS:", error);
      showNoti("error", "Đồng bộ danh sách sinh viên thất bại.");
    } finally {
      setConfirmSyncLoading(false);
    }
  };

  const previewRows = useMemo<SyncPreviewRow[]>(() => {
    return uiisItems.map((uiisItem, index) => {
      const maSinhVienUiis = normalizeString(getUiisMaSinhVien(uiisItem));
      const hoTenUiis = displayText(getUiisHoTen(uiisItem));
      const lopUiis = displayText(getUiisLop(uiisItem));
      const maPhongUiis = displayText(getUiisMaPhong(uiisItem));
      const maKhuUiis = displayText(getUiisMaKhu(uiisItem));

      const currentItem =
        currentItems.find(
          (item) =>
            normalizeString(item.maSinhVien || item.mssv || item.maso) ===
            maSinhVienUiis,
        ) || null;

      const isChanged =
        !!currentItem &&
        (normalizeString(currentItem.hoTen || currentItem.hoten) !==
          normalizeString(getUiisHoTen(uiisItem)) ||
          normalizeString(currentItem.lop) !==
            normalizeString(getUiisLop(uiisItem)) ||
          normalizeString(currentItem.maPhong) !==
            normalizeString(getUiisMaPhong(uiisItem)) ||
          normalizeString(currentItem.maKhu) !==
            normalizeString(getUiisMaKhu(uiisItem)));

      return {
        stt: index + 1,
        maSinhVien: maSinhVienUiis || "-",
        uiis: {
          hoTen: hoTenUiis,
          lop: lopUiis,
          maPhong: maPhongUiis,
          maKhu: maKhuUiis,
        },
        current: currentItem
          ? {
              hoTen: displayText(currentItem.hoTen || currentItem.hoten),
              lop: displayText(currentItem.lop),
              maPhong: displayText(currentItem.maPhong),
              maKhu: displayText(currentItem.maKhu),
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
    if (activePreviewFilter === "ALL") {
      return previewRows;
    }

    return previewRows.filter((row) => row.status === activePreviewFilter);
  }, [activePreviewFilter, previewRows]);

  useEffect(() => {
    if (!isFilterLoading) return;

    const frameId = window.requestAnimationFrame(() => {
      setIsFilterLoading(false);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [filteredPreviewRows, isFilterLoading]);

  const previewMessage = useMemo(() => {
    if (!showPreview) return null;
    if (previewSummary.totalUiis === 0) {
      return {
        color: "#64748b",
        text: "Không có dữ liệu sinh viên từ UIIS.",
      };
    }
    if (previewSummary.totalChanged > 0) {
      return {
        color: "#d97706",
        text: `Có ${previewSummary.totalChanged} sinh viên bị thay đổi so với dữ liệu hiện tại.`,
      };
    }
    if (previewSummary.totalNew > 0) {
      return {
        color: "#16a34a",
        text: `Có ${previewSummary.totalNew} sinh viên mới chưa có trong dữ liệu hiện tại.`,
      };
    }
    return {
      color: "#16a34a",
      text: "UIIS và dữ liệu hiện tại giống nhau, không có thay đổi.",
    };
  }, [previewSummary, showPreview]);

  const previewFilterStatusText = useMemo(() => {
    if (isFilterLoading) {
      return "Đang lọc danh sách sinh viên...";
    }

    if (activePreviewFilter === "ALL") {
      return `Đang hiển thị toàn bộ ${filteredPreviewRows.length} sinh viên.`;
    }

    return `Đang lọc ${filteredPreviewRows.length} sinh viên theo trạng thái ${activePreviewFilter}.`;
  }, [activePreviewFilter, filteredPreviewRows.length, isFilterLoading]);

  const getProgressPercent = (progress: PagedFetchProgress | null) => {
    if (!progress?.totalPages || progress.totalPages <= 0) {
      return progress ? 100 : 0;
    }

    return Math.min(
      100,
      Math.round((progress.currentPage / progress.totalPages) * 100),
    );
  };

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

  const handlePreviewFilterChange = (filter: PreviewFilter) => {
    setIsFilterLoading(true);
    setActivePreviewFilter((current) => (current === filter ? "ALL" : filter));
  };

  useEffect(() => {
    loadDanhMucKhu();
    loadAllRooms();
  }, []);

  useEffect(() => {
    setMaPhong("");
    loadDanhMucPhong(maKhu);
  }, [maKhu]);

  useEffect(() => {
    if (!maKhu || maKhu === "-1") {
      setDsPhong(mapPhongOptions(roomsList));
    }
  }, [roomsList, maKhu]);

  useEffect(() => {
    if (!openedSync) return;

    setSyncMaPhong("-1");
    loadSyncPhongOptions(syncMaKhu);
  }, [syncMaKhu, openedSync]);

  useEffect(() => {
    loadData(1, pageSize);
  }, []);

  const mappedItems = items.map((sv) => {
    if (sv.tenKhu || sv.maKhu) {
      return sv;
    }

    if (sv.maPhong) {
      const room = roomsList.find(
        (item) => item.phongMa === sv.maPhong || item.maPhong === sv.maPhong,
      );

      if (room) {
        return {
          ...sv,
          maKhu: room.maKhu || room.khuMa,
          tenKhu: room.tenKhu || room.khuTen,
        };
      }
    }

    return sv;
  });

  return (
    <>
      <DanhMucFeaturePage
        type="sinhVienKtx"
        title="Danh sách sinh viên ký túc xá"
        description="Quản lý và tra cứu danh sách sinh viên đang ở ký túc xá."
        items={mappedItems}
        page={page}
        pageSize={pageSize}
        icon={<IconUsers size={20} />}
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
                style={{ minWidth: 150, flexGrow: 1 }}
              />

              <Autocomplete
                label="Phòng"
                placeholder="Chọn phòng..."
                data={dsPhong
                  .map((item) => item.value)
                  .filter((value) => value && value !== "-1")}
                value={maPhong}
                onChange={setMaPhong}
                style={{ minWidth: 150, flexGrow: 1 }}
              />

              <TextInput
                label="Mã sinh viên"
                placeholder="Nhập mã sinh viên..."
                value={maSinhVien}
                onChange={(event) => setMaSinhVien(event.currentTarget.value)}
                style={{ minWidth: 180, flexGrow: 1 }}
              />

              <TextInput
                label="Họ tên"
                placeholder="Nhập họ tên..."
                value={hoTen}
                onChange={(event) => setHoTen(event.currentTarget.value)}
                style={{ minWidth: 200, flexGrow: 1 }}
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

              <Button
                leftSection={<IconCloudDownload size={18} />}
                color="green"
                radius="md"
                onClick={handleOpenSync}
              >
                Đồng bộ từ UIIS
              </Button>
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
        title="Đồng bộ danh sách sinh viên từ UIIS"
        centered
        size="80%"
        radius="lg"
      >
        <Stack gap="md">
          <Group align="end" grow>
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
              label="Khu"
              placeholder="Chọn khu"
              value={syncMaKhu}
              onChange={(value) => setSyncMaKhu(value || "-1")}
              data={dsKhu.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
            />

            <Select
              label="Phòng"
              placeholder="Chọn phòng"
              value={syncMaPhong}
              onChange={(value) => setSyncMaPhong(value || "-1")}
              data={syncPhongOptions.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
            />

            <Button
              color="blue"
              leftSection={<IconEye size={18} />}
              loading={previewLoading}
              onClick={handlePreviewSinhVienUiis}
            >
              Xem dữ liệu
            </Button>
          </Group>

          {previewLoading && (
            <Paper
              withBorder
              radius="md"
              p="md"
              style={{ background: "#f8fbff" }}
            >
              <Stack gap="sm">
                <Text fw={700} c="blue.7">
                  Đang tải dữ liệu đối chiếu...
                </Text>

                <Box>
                  <Group justify="space-between" mb={6}>
                    <Text size="sm" fw={600}>
                      UIIS
                    </Text>
                    <Text size="sm" c="dimmed">
                      {previewFetchProgress.uiis
                        ? `${previewFetchProgress.uiis.currentPage}/${previewFetchProgress.uiis.totalPages || previewFetchProgress.uiis.currentPage} trang`
                        : "Chưa bắt đầu"}
                    </Text>
                  </Group>
                  <Progress
                    value={getProgressPercent(previewFetchProgress.uiis)}
                    color="blue"
                    radius="xl"
                  />
                  {previewFetchProgress.uiis && (
                    <Text size="xs" c="dimmed" mt={4}>
                      Đã tải {previewFetchProgress.uiis.loadedItems} bản ghi
                    </Text>
                  )}
                </Box>

                <Box>
                  <Group justify="space-between" mb={6}>
                    <Text size="sm" fw={600}>
                      Dữ liệu KTX hiện tại
                    </Text>
                    <Text size="sm" c="dimmed">
                      {previewFetchProgress.current
                        ? `${previewFetchProgress.current.currentPage}/${previewFetchProgress.current.totalPages || previewFetchProgress.current.currentPage} trang`
                        : "Chưa bắt đầu"}
                    </Text>
                  </Group>
                  <Progress
                    value={getProgressPercent(previewFetchProgress.current)}
                    color="green"
                    radius="xl"
                  />
                  {previewFetchProgress.current && (
                    <Text size="xs" c="dimmed" mt={4}>
                      Đã tải {previewFetchProgress.current.loadedItems} bản ghi
                    </Text>
                  )}
                </Box>
              </Stack>
            </Paper>
          )}

          {showPreview && (
            <>
              <SimpleGrid cols={{ base: 1, md: 4 }} spacing="md">
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
                  style={{
                    borderColor: "#cce8d1",
                    background: "#f3fbf4",
                    cursor: "pointer",
                    boxShadow:
                      activePreviewFilter === "NEW"
                        ? "0 0 0 2px #86efac inset"
                        : undefined,
                  }}
                  onClick={() => handlePreviewFilterChange("NEW")}
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
                  style={{
                    borderColor: "#fde0b5",
                    background: "#fffaf1",
                    cursor: "pointer",
                    boxShadow:
                      activePreviewFilter === "CHANGED"
                        ? "0 0 0 2px #fdba74 inset"
                        : undefined,
                  }}
                  onClick={() => handlePreviewFilterChange("CHANGED")}
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
                  style={{
                    borderColor: "#e5e7eb",
                    background: "#fafafa",
                    cursor: "pointer",
                    boxShadow:
                      activePreviewFilter === "SAME"
                        ? "0 0 0 2px #d1d5db inset"
                        : undefined,
                  }}
                  onClick={() => handlePreviewFilterChange("SAME")}
                >
                  <Text size="sm" c="gray.6" fw={700}>
                    Không đổi
                  </Text>
                  <Text size="xl" fw={800} c="gray.7">
                    {previewSummary.totalSame}
                  </Text>
                </Paper>
              </SimpleGrid>

              <Text size="sm" c="dimmed">
                {previewFilterStatusText}
              </Text>

              <Text size="sm" c="dimmed" style={{ display: "none" }}>
                {isFilterLoading
                  ? "Đang lọc danh sách sinh viên..."
                  : activePreviewFilter === "ALL"
                    ? `Äang hiá»ƒn thá»‹ toĂ n bá»™ ${filteredPreviewRows.length} sinh viĂªn.`
                    : `Äang lá»c ${filteredPreviewRows.length} sinh viĂªn theo tráº¡ng thĂ¡i ${activePreviewFilter}.`}
              </Text>

              {isFilterLoading && (
                <Center py="xs">
                  <Group gap="xs">
                    <Loader size="sm" color="blue" />
                    <Text size="sm" c="dimmed">
                      Đang cập nhật danh sách...
                    </Text>
                    <Text size="sm" c="dimmed">
                      Đang cập nhật danh sách...
                    </Text>
                  </Group>
                </Center>
              )}

              <ScrollArea h={420}>
                <Table withColumnBorders highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th w={60} ta="center">
                        STT
                      </Table.Th>
                      <Table.Th w={140} ta="center">
                        Mã sinh viên
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
                        key={`${row.maSinhVien}-${row.stt}`}
                        style={{
                          background:
                            row.status === "NEW"
                              ? "rgba(34, 197, 94, 0.06)"
                              : row.status === "CHANGED"
                                ? "rgba(245, 158, 11, 0.08)"
                                : undefined,
                        }}
                      >
                        <Table.Td
                          ta="center"
                          style={{ verticalAlign: "middle" }}
                        >
                          {row.stt}
                        </Table.Td>

                        <Table.Td
                          ta="center"
                          style={{ verticalAlign: "middle" }}
                        >
                          <Text fw={700}>{row.maSinhVien}</Text>
                        </Table.Td>

                        <Table.Td>
                          <Text fw={700}>Họ tên: {row.uiis.hoTen}</Text>
                          <Text>Lớp: {row.uiis.lop}</Text>
                          <Text>Phòng: {row.uiis.maPhong}</Text>
                          <Text>Khu: {row.uiis.maKhu}</Text>
                        </Table.Td>

                        <Table.Td>
                          {row.current ? (
                            <>
                              <Text fw={700}>Họ tên: {row.current.hoTen}</Text>
                              <Text>Lớp: {row.current.lop}</Text>
                              <Text>Phòng: {row.current.maPhong}</Text>
                              <Text>Khu: {row.current.maKhu}</Text>
                            </>
                          ) : (
                            <Text c="green.7" fw={700}>
                              Chưa có trong KTX
                            </Text>
                          )}
                        </Table.Td>

                        <Table.Td
                          ta="center"
                          style={{ verticalAlign: "middle" }}
                        >
                          {renderStatusBadge(row.status)}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>

              <Divider />

              {previewMessage && (
                <Box>
                  <Text fw={600} c={previewMessage.color}>
                    {previewMessage.text}
                  </Text>
                </Box>
              )}
            </>
          )}
        </Stack>

        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={handleCloseSync}>
            Hủy
          </Button>

          {canConfirmSync && (
            <Button
              color="green"
              leftSection={<IconArrowsShuffle size={18} />}
              loading={confirmSyncLoading}
              onClick={handleConfirmSyncSinhVienUiis}
            >
              Xác nhận đồng bộ
            </Button>
          )}
        </Group>
      </Modal>
    </>
  );
}
