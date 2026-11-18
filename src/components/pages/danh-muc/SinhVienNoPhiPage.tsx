/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
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
  IconAlertTriangle,
} from "@tabler/icons-react";

import DanhMucFeaturePage from "./DanhMucFeaturePage";
import CustomPagination from "@/components/common/CustomPagination";
import { showNoti } from "@/components/common/showNoti";
import {
  type PagedFetchProgress,
  fetchAllDanhSachSinhVienNoPhiUiis,
  fetchDanhMucKhuKtx,
  fetchDanhSachPhongKtx,
  fetchDanhSachSinhVienNoPhi,
  fetchDanhSachSinhVienNoPhiPaginate,
  syncDanhSachSinhVienNoPhiUiis,
} from "@/services/danh-muc/danhMucKtxService";
import useAccountAccess from "@/hooks/useAccountAccess";
import type { PhongKtx, SinhVienNoPhi } from "@/types/type-danh-muc-ktx";

type SelectOption = {
  value: string;
  label: string;
  khuId?: number;
  uiisKhuId?: number;
};

type SyncStatus = "SAME" | "CHANGED" | "NEW";
type PreviewFilter = "ALL" | SyncStatus;

type UiisSinhVienNoPhiItem = {
  f_masv?: string;
  ma_sinh_vien?: string;
  maSinhVien?: string;
  ma_sv?: string;
  mssv?: string;
  maso?: string;
  sv_tu_dien_sinh_vien_ma?: string;
  ho_ten?: string;
  hoTen?: string;
  ho_ten_sv?: string;
  hoten?: string;
  ten_sv?: string;
  sv_tu_dien_sinh_vien_ten?: string;
  lop?: string;
  f_tenlop?: string;
  ten_lop?: string;
  tenLop?: string;
  ma_lop?: string;
  maLop?: string;
  ma_phong?: string;
  maPhong?: string;
  phong_ma?: string;
  phongMa?: string;
  ten_phong?: string;
  tenPhong?: string;
  ktx_td_phong_ma?: string;
  ma_khu?: string;
  maKhu?: string;
  khu_ma?: string;
  khuMa?: string;
  ktx_td_khu_ma?: string;
  so_tien?: string | number | null;
  soTien?: string | number | null;
  so_tien_no?: string | number | null;
  soTienNo?: string | number | null;
  tong_no?: string | number | null;
  tongNo?: string | number | null;
  tong_tien_no?: string | number | null;
  tongTienNo?: string | number | null;
  ten_loai_su_kien?: string;
  tenLoaiSuKien?: string;
  noi_dung?: string;
  noiDung?: string;
  ghi_chu?: string;
  ghiChu?: string;
  data?: UiisSinhVienNoPhiItem[];
};

type SyncPreviewRow = {
  stt: number;
  maSinhVien: string;
  uiis: {
    hoTen: string;
    lop: string;
    maPhong: string;
    maKhu: string;
    soTien: string;
    noiDung: string;
  };
  current: {
    hoTen: string;
    lop: string;
    maPhong: string;
    maKhu: string;
    soTien: string;
    noiDung: string;
  } | null;
  diffFields: string[];
  status: SyncStatus;
};

type PreviewFetchProgressState = {
  uiis: PagedFetchProgress | null;
};

const normalizeString = (value?: string | number | null) =>
  String(value ?? "").trim();
const displayText = (value?: string | number | null) =>
  normalizeString(value) || "-";

const formatMoney = (value?: string | number | null) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return "-";
  return `${numeric.toLocaleString("vi-VN")} đ`;
};

const isNumericValue = (value?: string | number | null) => {
  const normalized = normalizeString(value);
  if (!normalized) return false;

  return Number.isFinite(Number(normalized));
};

const getDebtReason = (item: SinhVienNoPhi) =>
  item.loaiSuKien?.tenLoai ||
  item.tenLoaiSuKien ||
  item.loaiSuKien?.moTa ||
  item.noiDung ||
  item.ghiChu ||
  "";

const pickFirstValue = (...values: Array<string | number | null | undefined>) =>
  values.find((value) => normalizeString(value) !== "");

const getUiisMaSinhVien = (item: UiisSinhVienNoPhiItem) =>
  pickFirstValue(
    item.f_masv,
    item.sv_tu_dien_sinh_vien_ma,
    item.ma_sinh_vien,
    item.maSinhVien,
    item.ma_sv,
    item.mssv,
    item.maso,
  );
const getUiisHoTen = (item: UiisSinhVienNoPhiItem) =>
  pickFirstValue(
    item.sv_tu_dien_sinh_vien_ten,
    item.ho_ten,
    item.hoTen,
    item.ho_ten_sv,
    item.hoten,
    item.ten_sv,
  );
const getUiisLop = (item: UiisSinhVienNoPhiItem) =>
  pickFirstValue(
    item.f_tenlop,
    item.lop,
    item.ten_lop,
    item.tenLop,
    item.ma_lop,
    item.maLop,
  );
const getUiisMaPhong = (item: UiisSinhVienNoPhiItem) =>
  pickFirstValue(
    item.ktx_td_phong_ma,
    item.ma_phong,
    item.maPhong,
    item.phong_ma,
    item.phongMa,
    item.ten_phong,
    item.tenPhong,
  );
const getUiisMaKhu = (item: UiisSinhVienNoPhiItem, rooms: PhongKtx[] = []) => {
  const directValue = pickFirstValue(
    item.ktx_td_khu_ma,
    item.ma_khu,
    item.maKhu,
    item.khu_ma,
    item.khuMa,
  );

  if (normalizeString(directValue) !== "") {
    return directValue;
  }

  const roomCode = normalizeString(getUiisMaPhong(item));
  if (!roomCode) return undefined;

  const matchedRoom = rooms.find(
    (room) =>
      normalizeString(room.maPhong || room.phongMa || room.tenPhong) ===
      roomCode,
  );

  return matchedRoom?.maKhu || matchedRoom?.khuMa || matchedRoom?.tenKhu;
};
const getUiisSoTien = (item: UiisSinhVienNoPhiItem) =>
  pickFirstValue(
    item.so_tien,
    item.soTien,
    item.so_tien_no,
    item.soTienNo,
    isNumericValue(item.tong_no) ? item.tong_no : undefined,
    isNumericValue(item.tongNo) ? item.tongNo : undefined,
    item.tong_tien_no,
    item.tongTienNo,
  );
const getUiisNoiDung = (item: UiisSinhVienNoPhiItem) => {
  const tongNoText = pickFirstValue(
    !isNumericValue(item.tong_no) ? item.tong_no : undefined,
    !isNumericValue(item.tongNo) ? item.tongNo : undefined,
  );

  return pickFirstValue(
    item.ten_loai_su_kien,
    item.tenLoaiSuKien,
    item.noi_dung,
    item.noiDung,
    item.ghi_chu,
    item.ghiChu,
    tongNoText,
  );
};

const enrichItemsWithRoomData = (items: SinhVienNoPhi[], rooms: PhongKtx[]) =>
  items.map((item) => {
    if ((item.tenKhu || item.maKhu) && (item.tenPhong || item.maPhong)) {
      return item;
    }

    const room = rooms.find(
      (entry) =>
        (entry.maPhong || entry.phongMa) === (item.maPhong || item.tenPhong),
    );

    if (!room) return item;

    return {
      ...item,
      maPhong: item.maPhong || room.maPhong || room.phongMa,
      tenPhong: item.tenPhong || room.tenPhong || room.phongMa,
      maKhu: item.maKhu || room.maKhu || room.khuMa,
      tenKhu: item.tenKhu || room.tenKhu || room.khuTen,
    };
  });

const mapPhongOptions = (rooms: PhongKtx[]): SelectOption[] => [
  { value: "-1", label: "Tất cả" },
  ...rooms.map((item) => ({
    value: item.maPhong || item.phongMa || "",
    label: item.tenPhong || item.phongMa || item.maPhong || "",
  })),
];

export default function SinhVienNoPhiPage() {
  const { isAdmin } = useAccountAccess();
  const [allItems, setAllItems] = useState<SinhVienNoPhi[]>([]);
  const [items, setItems] = useState<SinhVienNoPhi[]>([]);
  const [dsKhu, setDsKhu] = useState<SelectOption[]>([]);
  const [dsPhong, setDsPhong] = useState<SelectOption[]>([]);
  const [roomsList, setRoomsList] = useState<PhongKtx[]>([]);

  const [maKhu, setMaKhu] = useState("-1");
  const [maPhong, setMaPhong] = useState("-1");
  const [keyword, setKeyword] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    maKhu: "-1",
    maPhong: "-1",
    keyword: "",
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const [openedSync, setOpenedSync] = useState(false);
  const [namHoc, setNamHoc] = useState("2026");
  const [hocKy, setHocKy] = useState("1");
  const [syncMaKhu, setSyncMaKhu] = useState("A");
  const [syncMaPhong, setSyncMaPhong] = useState("-1");
  const [syncPhongOptions, setSyncPhongOptions] = useState<SelectOption[]>([
    { value: "-1", label: "Tất cả" },
  ]);
  const [currentItems, setCurrentItems] = useState<SinhVienNoPhi[]>([]);
  const [uiisItems, setUiisItems] = useState<UiisSinhVienNoPhiItem[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [confirmSyncLoading, setConfirmSyncLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activePreviewFilter, setActivePreviewFilter] =
    useState<PreviewFilter>("ALL");
  const [previewFetchProgress, setPreviewFetchProgress] =
    useState<PreviewFetchProgressState>({
      uiis: null,
    });

  const enrichedAllItems = useMemo(
    () => enrichItemsWithRoomData(allItems, roomsList),
    [allItems, roomsList],
  );

  const filterItems = (
    source: SinhVienNoPhi[],
    filters: { maKhu?: string; maPhong?: string; keyword?: string },
  ) => {
    const search = normalizeString(filters.keyword).toLowerCase();

    return source.filter((item) => {
      const itemMaKhu = normalizeString(item.maKhu || item.tenKhu);
      const itemMaPhong = normalizeString(item.maPhong || item.tenPhong);
      const matchesKhu =
        !filters.maKhu || filters.maKhu === "-1" || itemMaKhu === filters.maKhu;
      const matchesPhong =
        !filters.maPhong ||
        filters.maPhong === "-1" ||
        itemMaPhong === filters.maPhong;

      if (!matchesKhu || !matchesPhong) return false;

      if (!search) return true;

      const haystack = [
        item.maSinhVien,
        item.mssv,
        item.maso,
        item.hoTen,
        item.hoten,
        item.lop,
        item.maLop,
        item.tenPhong,
        item.maPhong,
        item.tenKhu,
        item.maKhu,
        item.dotTotNghiep,
        item.loaiSuKien?.maLoai,
        item.loaiSuKien?.tenLoai,
        item.loaiSuKien?.moTa,
        getDebtReason(item),
      ]
        .map((value) => normalizeString(value).toLowerCase())
        .join(" ");

      return haystack.includes(search);
    });
  };

  const loadData = (
    pageValue = page,
    pageSizeValue = pageSize,
    filters?: { maKhu?: string; maPhong?: string; keyword?: string },
    sourceItems?: SinhVienNoPhi[],
  ) => {
    const effectiveFilters = {
      maKhu: filters?.maKhu ?? appliedFilters.maKhu,
      maPhong: filters?.maPhong ?? appliedFilters.maPhong,
      keyword: filters?.keyword ?? appliedFilters.keyword,
    };

    const filtered = filterItems(
      sourceItems ?? enrichedAllItems,
      effectiveFilters,
    );
    const total = filtered.length;
    const pages = Math.ceil(total / pageSizeValue);
    const start = (pageValue - 1) * pageSizeValue;
    const nextItems = filtered.slice(start, start + pageSizeValue);

    setItems(nextItems);
    setTotalItems(total);
    setTotalPages(pages);
  };

  const loadDanhMucKhu = async () => {
    try {
      const res = await fetchDanhMucKhuKtx();
      setDsKhu([
        { value: "-1", label: "Tất cả", khuId: 0, uiisKhuId: 0 },
        ...res
          .filter((item) => (item.khuMa || item.maKhu) !== "-1")
          .map((item) => ({
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
      setDsPhong(mapPhongOptions(allRooms));
      setSyncPhongOptions(mapPhongOptions(allRooms));
    } catch (error) {
      console.error("Lỗi tải toàn bộ phòng KTX:", error);
      setRoomsList([]);
      setDsPhong([{ value: "-1", label: "Tất cả" }]);
      setSyncPhongOptions([{ value: "-1", label: "Tất cả" }]);
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
      console.error("Lỗi lấy phòng sync sinh viên nợ phí:", error);
      setSyncPhongOptions([{ value: "-1", label: "Tất cả" }]);
    }
  };

  const refreshData = async (
    pageValue = 1,
    pageSizeValue = pageSize,
    khuValue = appliedFilters.maKhu || "-1",
  ) => {
    try {
      setLoading(true);
      const res = await fetchDanhSachSinhVienNoPhiPaginate({
        page: pageValue,
        pageSize: pageSizeValue,
        keyWord: "",
        maKhu: khuValue || "-1",
        loaiSuKienId: -1,
      });
      const nextItems = Array.isArray(res?.items) ? res.items : [];
      setAllItems(nextItems);
      setItems(nextItems);
      setTotalItems(Number(res?.totalElements ?? nextItems.length ?? 0));
      setTotalPages(Number(res?.totalPages ?? 0));
      setPage(pageValue);
    } catch (error) {
      console.error("Lỗi lấy danh sách sinh viên nợ phí:", error);
      setAllItems([]);
      setItems([]);
      setTotalItems(0);
      setTotalPages(0);
      showNoti("error", "Không tải được danh sách sinh viên nợ phí.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const nextFilters = {
      maKhu: maKhu || "-1",
      maPhong: maPhong || "-1",
      keyword: keyword.trim(),
    };

    setAppliedFilters(nextFilters);
    setPage(1);
    refreshData(1, pageSize, nextFilters.maKhu);
  };

  const handleReset = () => {
    const nextFilters = {
      maKhu: "-1",
      maPhong: "-1",
      keyword: "",
    };

    setMaKhu("-1");
    setMaPhong("-1");
    setKeyword("");
    setAppliedFilters(nextFilters);
    setPage(1);
    setDsPhong(mapPhongOptions(roomsList));
    refreshData(1, pageSize, nextFilters.maKhu);
  };

  const handleOpenSync = () => {
    setOpenedSync(true);
    setShowPreview(false);
    setActivePreviewFilter("ALL");
    setPreviewFetchProgress({ uiis: null });
    setUiisItems([]);
    setCurrentItems([]);
    setSyncMaKhu(
      appliedFilters.maKhu && appliedFilters.maKhu !== "-1"
        ? appliedFilters.maKhu
        : "A",
    );
    setSyncMaPhong(appliedFilters.maPhong || "-1");
  };

  const handleCloseSync = () => {
    setOpenedSync(false);
    setShowPreview(false);
    setActivePreviewFilter("ALL");
    setPreviewFetchProgress({ uiis: null });
    setUiisItems([]);
    setCurrentItems([]);
    setSyncMaKhu("A");
    setSyncMaPhong("-1");
    setSyncPhongOptions(mapPhongOptions(roomsList));
  };

  const buildSyncPayload = () => {
    return {
      nam_hoc: Number(namHoc) || 0,
      hoc_ky: Number(hocKy) || 0,
      ma_khu: syncMaKhu && syncMaKhu !== "-1" ? syncMaKhu : undefined,
    };
  };

  const handlePreviewSinhVienNoPhiUiis = async () => {
    try {
      setPreviewLoading(true);
      setPreviewFetchProgress({ uiis: null });

      const payload = buildSyncPayload();
      const [uiisRes, currentRes] = await Promise.all([
        fetchAllDanhSachSinhVienNoPhiUiis(payload, undefined, (progress) => {
          setPreviewFetchProgress({ uiis: progress });
        }),
        fetchDanhSachSinhVienNoPhi(),
      ]);
      const enrichedCurrentItems = enrichItemsWithRoomData(
        Array.isArray(currentRes) ? currentRes : [],
        roomsList,
      );

      setUiisItems(
        Array.isArray(uiisRes) ? (uiisRes as UiisSinhVienNoPhiItem[]) : [],
      );
      setCurrentItems(
        filterItems(enrichedCurrentItems, {
          maKhu: syncMaKhu,
          maPhong: "-1",
          keyword: "",
        }),
      );
      setActivePreviewFilter("ALL");
      setShowPreview(true);
    } catch (error) {
      console.error("Lỗi xem trước sync sinh viên nợ phí UIIS:", error);
      showNoti("error", "Không lấy được dữ liệu UIIS để đối chiếu.");
      setShowPreview(false);
      setUiisItems([]);
      setCurrentItems([]);
      setPreviewFetchProgress({ uiis: null });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleConfirmSyncSinhVienNoPhiUiis = async () => {
    try {
      setConfirmSyncLoading(true);
      await syncDanhSachSinhVienNoPhiUiis(buildSyncPayload());
      showNoti(
        "success",
        "Đồng bộ danh sách sinh viên nợ phí từ UIIS thành công.",
      );
      handleCloseSync();
      await refreshData();
    } catch (error) {
      console.error("Lỗi đồng bộ sinh viên nợ phí UIIS:", error);
      showNoti("error", "Đồng bộ danh sách sinh viên nợ phí thất bại.");
    } finally {
      setConfirmSyncLoading(false);
    }
  };

  const previewRows = useMemo<SyncPreviewRow[]>(() => {
    return uiisItems.map((uiisItem, index) => {
      const maSinhVienUiis = normalizeString(getUiisMaSinhVien(uiisItem));
      const currentItem =
        currentItems.find(
          (item) =>
            normalizeString(item.maSinhVien || item.mssv || item.maso) ===
            maSinhVienUiis,
        ) || null;

      const uiisData = {
        hoTen: displayText(getUiisHoTen(uiisItem)),
        lop: displayText(getUiisLop(uiisItem)),
        maPhong: displayText(getUiisMaPhong(uiisItem)),
        maKhu: displayText(getUiisMaKhu(uiisItem, roomsList)),
        soTien: formatMoney(getUiisSoTien(uiisItem)),
        noiDung: displayText(getUiisNoiDung(uiisItem)),
      };

      const currentData = currentItem
        ? {
            hoTen: displayText(currentItem.hoTen || currentItem.hoten),
            lop: displayText(
              currentItem.lop || currentItem.maLop || currentItem.tenLop,
            ),
            maPhong: displayText(currentItem.maPhong || currentItem.tenPhong),
            maKhu: displayText(currentItem.maKhu || currentItem.tenKhu),
            soTien: formatMoney(
              currentItem.soTien ??
                currentItem.soTienNo ??
                currentItem.tongTienNo,
            ),
            noiDung: displayText(getDebtReason(currentItem)),
          }
        : null;

      const diffFields = currentData
        ? [
            currentData.hoTen !== uiisData.hoTen ? "Ho ten" : null,
            currentData.lop !== uiisData.lop ? "Lop" : null,
            currentData.maPhong !== uiisData.maPhong ? "Phong" : null,
            currentData.maKhu !== uiisData.maKhu ? "Khu" : null,
            // currentData.soTien !== uiisData.soTien ? "So tien no" : null,
            // currentData.noiDung !== uiisData.noiDung ? "Noi dung" : null,
          ].filter((field): field is string => Boolean(field))
        : [];
      const isChanged = diffFields.length > 0;

      return {
        stt: index + 1,
        maSinhVien: maSinhVienUiis || "-",
        uiis: uiisData,
        current: currentData,
        diffFields,
        status: !currentData ? "NEW" : isChanged ? "CHANGED" : "SAME",
      };
    });
  }, [currentItems, roomsList, uiisItems]);

  const previewSummary = useMemo(() => {
    const totalUiis = previewRows.length;
    const totalNew = previewRows.filter((row) => row.status === "NEW").length;
    const totalChanged = previewRows.filter(
      (row) => row.status === "CHANGED",
    ).length;
    const totalSame = previewRows.filter((row) => row.status === "SAME").length;

    return { totalUiis, totalNew, totalChanged, totalSame };
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
        text: "Không có dữ liệu sinh viên nợ phí từ UIIS.",
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
        <Badge radius="xl" variant="light" color="green">
          Hoàn toàn mới
        </Badge>
      );
    }

    if (status === "CHANGED") {
      return (
        <Badge radius="xl" variant="light" color="orange">
          Có thay đổi
        </Badge>
      );
    }

    return (
      <Badge radius="xl" variant="light" color="gray">
        Không đổi
      </Badge>
    );
  };

  useEffect(() => {
    loadDanhMucKhu();
    loadAllRooms();
  }, []);

  useEffect(() => {
    loadDanhMucPhong(maKhu);
    setMaPhong("-1");
  }, [maKhu]);

  useEffect(() => {
    if (!openedSync) return;
    setSyncMaPhong("-1");
    loadSyncPhongOptions(syncMaKhu);
  }, [syncMaKhu, openedSync]);

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <>
      <DanhMucFeaturePage
        type="sinhVienNoPhi"
        // title="Danh sách sinh viên nợ phí"
        title="Danh sách sinh viên vi phạm"
        description="Quản lý, tra cứu và đồng bộ danh sách sinh viên vi phạm từ UIIS."
        items={items}
        page={page}
        pageSize={pageSize}
        icon={<IconAlertTriangle size={20} />}
        searchControls={
          <Stack gap="md" w="100%">
            <Group align="end" style={{ flexGrow: 1, gap: "16px" }}>
              <Select
                label="Khu ký túc xá"
                placeholder="Chọn khu..."
                value={maKhu}
                onChange={(value) => setMaKhu(value || "-1")}
                data={dsKhu.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
                style={{ minWidth: 180, flexGrow: 1 }}
              />

              <Button
                leftSection={<IconSearch size={18} />}
                color="blue"
                radius="md"
                onClick={handleSearch}
                loading={loading}
              >
                Tìm kiếm
              </Button>

              <Button
                leftSection={<IconRefresh size={18} />}
                variant="default"
                radius="md"
                onClick={handleReset}
                disabled={loading}
              >
                Làm mới
              </Button>

              {isAdmin && (
                <Button
                  leftSection={<IconCloudDownload size={18} />}
                  color="green"
                  radius="md"
                  onClick={handleOpenSync}
                  disabled={loading}
                >
                  Đồng bộ từ UIIS
                </Button>
              )}
            </Group>

            {loading && (
              <Group gap="xs">
                <Loader size="sm" color="blue" />
                <Text size="sm" c="dimmed">
                  Đang tải dữ liệu danh sách sinh viên nợ phí...
                </Text>
              </Group>
            )}
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
            fetchData={(nextPage, nextPageSize) =>
              refreshData(nextPage, nextPageSize, appliedFilters.maKhu)
            }
          />
        }
      />

      <Modal
        opened={openedSync}
        onClose={handleCloseSync}
        title="Đồng bộ danh sách sinh viên nợ phí từ UIIS"
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
              onClick={handlePreviewSinhVienNoPhiUiis}
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
                  }}
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
                  style={{
                    borderColor: "#fde0b5",
                    background: "#fffaf1",
                    cursor: "pointer",
                  }}
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
                  style={{
                    borderColor: "#e5e7eb",
                    background: "#fafafa",
                    cursor: "pointer",
                  }}
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
                      <Table.Th w={140} ta="center">
                        Mã sinh viên
                      </Table.Th>
                      <Table.Th ta="center">Dữ liệu UIIS</Table.Th>
                      <Table.Th ta="center">Dữ liệu hiện tại</Table.Th>
                      <Table.Th w={220} ta="center">
                        Điểm khác
                      </Table.Th>
                      <Table.Th w={150} ta="center">
                        Trạng thái
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>
                    {filteredPreviewRows.map((row) => (
                      <Table.Tr key={`${row.maSinhVien}-${row.stt}`}>
                        <Table.Td ta="center">{row.stt}</Table.Td>
                        <Table.Td ta="center">
                          <Text fw={700}>{row.maSinhVien}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text fw={700}>Họ tên: {row.uiis.hoTen}</Text>
                          <Text>Lớp: {row.uiis.lop}</Text>
                          <Text>Phòng: {row.uiis.maPhong}</Text>
                          <Text>Khu: {row.uiis.maKhu}</Text>
                          <Text>Số tiền nợ: {row.uiis.soTien}</Text>
                          <Text>Nội dung: {row.uiis.noiDung}</Text>
                        </Table.Td>
                        <Table.Td>
                          {row.current ? (
                            <>
                              <Text fw={700}>Họ tên: {row.current.hoTen}</Text>
                              <Text>Lớp: {row.current.lop}</Text>
                              <Text>Phòng: {row.current.maPhong}</Text>
                              <Text>Khu: {row.current.maKhu}</Text>
                              <Text>Số tiền nợ: {row.current.soTien}</Text>
                              <Text>Nội dung: {row.current.noiDung}</Text>
                            </>
                          ) : (
                            <Text c="green.7" fw={700}>
                              Chưa có trong KTX
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          {!row.current ? (
                            <Text c="green.7" fw={700}>
                              Sinh viên mã
                            </Text>
                          ) : row.diffFields.length > 0 ? (
                            <Text>{row.diffFields.join(", ")}</Text>
                          ) : (
                            <Text c="gray.6">Không có</Text>
                          )}
                        </Table.Td>
                        <Table.Td ta="center">
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
              onClick={handleConfirmSyncSinhVienNoPhiUiis}
            >
              Xác nhận đồng bộ
            </Button>
          )}
        </Group>
      </Modal>
    </>
  );
}
