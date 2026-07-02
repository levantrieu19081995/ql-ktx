'use client';

<<<<<<< Updated upstream
<<<<<<< HEAD
import React, { useState, useEffect, useMemo } from 'react';
import { Box, Card, Group, Text, Button, Select, Table, Avatar, Badge, Loader, Drawer, Stack } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useTranslations } from 'next-intl';
import {
    IconAlertTriangle,
    IconSearch,
    IconRefresh,
    IconLayoutGrid,
    IconList,
    IconCamera,
    IconMapPin,
    IconClock,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { HistoryItem } from '../../../types/type-history';
import { dichVuDanhMucKhu, KhuItem } from '../history/historyService';
import { dichVuCanhBaoNguoiLa } from './warningService';
import CustomPagination from '@/components/common/CustomPagination';

export default function StrangerWarningsPage() {
    const t = useTranslations('History');
    const [dangTai, setDangTai] = useState(false);
    const [danhSachCanhBao, setDanhSachCanhBao] = useState<HistoryItem[]>([]);
    const [danhSachKhu, setDanhSachKhu] = useState<KhuItem[]>([]);
    const [dangLieu, datDangLieu] = useState<'GRID' | 'TABLE'>('GRID');
    const [canhBaoDuocChon, datCanhBaoDuocChon] = useState<HistoryItem | null>(null);

    const [boLoc, setBoLoc] = useState({
        tuNgay: '2026-06-01',
        denNgay: '2026-06-06',
        maKtx: '-1',
=======
=======
>>>>>>> Stashed changes
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Group,
  Text,
  Button,
  Table,
  Avatar,
  Badge,
  Loader,
  Pagination,
  Portal,
  Notification,
} from "@mantine/core";
<<<<<<< Updated upstream
import { DatePickerInput } from "@mantine/dates";
=======
>>>>>>> Stashed changes
import { useTranslations } from "next-intl";
import {
  IconAlertTriangle,
  IconLayoutGrid,
  IconList,
  IconCamera,
  IconMapPin,
  IconClock,
<<<<<<< Updated upstream
  IconFileSpreadsheet,
  IconFileTypePdf,
  IconPlus,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { HistoryItem } from "../../../types/type-history";
import {
  dichVuCanhBaoNguoiLa,
  dichVuDanhMucKhu,
  KhuItem,
} from "../history/historyService";
import { DrawerChiTietLichSu } from "../history/DrawerChiTietLichSu";
=======
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { HistoryItem } from "../../../types/type-history";
import { dichVuNguoiLa } from "./strangerService";
import BoLocNguoiLa from "./BoLocNguoiLa";
import DrawerChiTietLichSu from "../history/DrawerChiTietLichSu";
import { xuatRaFileExcel } from "../history/excelHelper";

const MOCK_STRANGERS: HistoryItem[] = [
  {
    id: "mock-stranger-1",
    thoiGian: "2026-06-03 08:20:00",
    mssv: "Người lạ",
    hoVaTen: "Người lạ",
    duongDanAnhChup: "http://172.16.10.208:8001/images/db_json/2026/6/3/no_data/384117_1_08_20_00.jpg",
    duongDanAnhDaiDien: "",
    loai: "IN",
    maKtx: "A",
    tenKtx: "Ký túc xá A",
    maPhong: "",
    tenPhong: "",
    thietBi: "Camera vào",
    loaiDoiTuong: "Người lạ",
    trangThaiSinhVien: "BINH_THUONG",
    trangThaiHienDien: "CO_MAT",
    ngayNguoiLa: "03/06/2026",
    gioNguoiLa: "08:20:00",
    cameraNguoiLa: 1
  },
  {
    id: "mock-stranger-2",
    thoiGian: "2026-06-03 06:58:07",
    mssv: "Người lạ",
    hoVaTen: "Người lạ",
    duongDanAnhChup: "http://172.16.10.208:8001/images/db_json/2026/6/3/no_data/514905_1_06_58_07.jpg",
    duongDanAnhDaiDien: "",
    loai: "IN",
    maKtx: "A",
    tenKtx: "Ký túc xá A",
    maPhong: "",
    tenPhong: "",
    thietBi: "Camera vào",
    loaiDoiTuong: "Người lạ",
    trangThaiSinhVien: "BINH_THUONG",
    trangThaiHienDien: "CO_MAT",
    ngayNguoiLa: "03/06/2026",
    gioNguoiLa: "06:58:07",
    cameraNguoiLa: 1
  },
  {
    id: "mock-stranger-3",
    thoiGian: "2026-06-02 21:15:30",
    mssv: "Người lạ",
    hoVaTen: "Người lạ",
    duongDanAnhChup: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    duongDanAnhDaiDien: "",
    loai: "IN",
    maKtx: "B",
    tenKtx: "Ký túc xá B",
    maPhong: "",
    tenPhong: "",
    thietBi: "Camera sảnh",
    loaiDoiTuong: "Người lạ",
    trangThaiSinhVien: "BINH_THUONG",
    trangThaiHienDien: "CO_MAT",
    ngayNguoiLa: "02/06/2026",
    gioNguoiLa: "21:15:30",
    cameraNguoiLa: 2
  }
];
>>>>>>> Stashed changes

export default function StrangerWarningsPage() {
  const t = useTranslations("History");
  const [dangTai, setDangTai] = useState(false);
  const [danhSachCanhBao, setDanhSachCanhBao] = useState<HistoryItem[]>([]);
  const [dangLieu, datDangLieu] = useState<"GRID" | "TABLE">("GRID");
  
  // Trạng thái phân trang
  const [trangHienTai, datTrangHienTai] = useState(1);
  const [soDongTrenTrang, datSoDongTrenTrang] = useState(12);
  const [tongSoTrang, datTongSoTrang] = useState(0);
  const [tongSoBanGhi, datTongSoBanGhi] = useState(0);

  // Bộ lọc
  const [boLoc, setBoLoc] = useState({
    tuNgay: dayjs().subtract(7, "day").format("YYYY-MM-DD"),
    denNgay: dayjs().format("YYYY-MM-DD"),
    maKtx: "-1",
    loai: "ALL" as "IN" | "OUT" | "ALL",
  });

<<<<<<< Updated upstream
  // Bản ghi được chọn để xem chi tiết
  const [lichSuDuocChon, setLichSuDuocChon] = useState<HistoryItem | null>(null);

  useEffect(() => {
    dichVuDanhMucKhu.layDanhSach().then(setDanhSachKhu);
    taiDuLieu(1);
  }, []);

  const optionsKhu = [
    { value: "-1", label: t("filter.all") },
    ...danhSachKhu.map((k) => ({ value: k.maKhu, label: k.tenKhu })),
  ];

  const taiDuLieu = async (trangMoi: number = trangHienTai) => {
    setDangTai(true);
    try {
      const res = await dichVuCanhBaoNguoiLa.layDanhSachCanhBao({
        page: trangMoi,
        pageSize: soDongTrenTrang,
=======
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [tongSoTrang, setTongSoTrang] = useState(1);
  const [tongSoPhanTu, setTongSoPhanTu] = useState(0);
  const sizeTrang = 8;

  const [strangerDuocChon, setStrangerDuocChon] = useState<HistoryItem | null>(null);
  const [thongBao, setThongBao] = useState<{ tinNhan: string; kieu: "success" | "error" } | null>(null);

  const hienThongBao = (tinNhan: string, kieu: "success" | "error" = "success") => {
    setThongBao({ tinNhan, kieu });
  };

  useEffect(() => {
    if (thongBao) {
      const timer = setTimeout(() => setThongBao(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [thongBao]);

  const xuLyXuatExcel = () => {
    const duLieuXuat = danhSachCanhBao.map((h, i) => ({
      [t("table.no")]: i + 1,
      "Thời gian": h.thoiGian,
      "Đối tượng": h.loaiDoiTuong || "Người lạ",
      "Khu KTX": h.tenKtx || "N/A",
      "Thiết bị/Camera": h.thietBi || "N/A",
      "Ngày phát hiện": h.ngayNguoiLa || "",
      "Giờ phát hiện": h.gioNguoiLa || ""
    }));
    xuatRaFileExcel(
      duLieuXuat,
      `Danh_Sach_Nguoi_La_${new Date().toISOString().split("T")[0]}`,
      "Cảnh báo người lạ"
    );
    hienThongBao(t("messages.exportExcelSuccess"), "success");
  };

  const xuLyXuatPdf = () => {
    hienThongBao(t("messages.exportPdfSuccess"), "success");
  };

  useEffect(() => {
    taiDuLieu();
  }, []);

  const taiDuLieu = async () => {
    setDangTai(true);
    try {
      const response = await dichVuNguoiLa.layDanhSachNguoiLa({
>>>>>>> Stashed changes
        tuNgay: boLoc.tuNgay,
        denNgay: boLoc.denNgay,
        maKtx: boLoc.maKtx,
        page: trangHienTai,
        pageSize: sizeTrang
      });

<<<<<<< Updated upstream
      // Lọc theo trạng thái Vào/Ra tại Client nếu có
      let filteredItems = res.items;
      if (boLoc.loai && boLoc.loai !== "ALL") {
        filteredItems = filteredItems.filter((item) => item.loai === boLoc.loai);
      }

      setDanhSachCanhBao(filteredItems);
      datTongSoTrang(res.totalPages);
      datTongSoBanGhi(res.totalElements);
      datTrangHienTai(trangMoi);
    } catch (err) {
      console.error("Lỗi khi tải cảnh báo người lạ:", err);
=======
      if (response && response.items) {
        setDanhSachCanhBao(response.items);
        setTongSoTrang(response.totalPages);
        setTongSoPhanTu(response.totalElements);
      } else {
        setDanhSachCanhBao([]);
        setTongSoTrang(1);
        setTongSoPhanTu(0);
      }
    } catch (err) {
      console.error("Lỗi khi tải cảnh báo người lạ:", err);
      setDanhSachCanhBao([]);
      setTongSoTrang(1);
      setTongSoPhanTu(0);
>>>>>>> Stashed changes
    } finally {
      setDangTai(false);
    }
  };

  const datLaiBoLoc = () => {
    setBoLoc({
      tuNgay: dayjs().subtract(7, "day").format("YYYY-MM-DD"),
      denNgay: dayjs().format("YYYY-MM-DD"),
      maKtx: "-1",
      loai: "ALL",
>>>>>>> 226c8f8 (Cập nhật chức năng history)
    });
<<<<<<< Updated upstream

<<<<<<< HEAD
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        dichVuDanhMucKhu.layDanhSach().then(setDanhSachKhu);
    }, []);

    const optionsKhu = [
        { value: '-1', label: t('filter.all') },
        ...danhSachKhu.map((k) => ({ value: k.maKhu, label: k.tenKhu }))
    ];

    const taiDuLieu = async (trang = page, kichThuoc = pageSize) => {
        setDangTai(true);
        try {
            const data = await dichVuCanhBaoNguoiLa.layDanhSachCanhBaoNguoiLa({
                tuNgay: boLoc.tuNgay,
                denNgay: boLoc.denNgay,
                maKtx: boLoc.maKtx,
                page: trang,
                pageSize: kichThuoc,
            });
            setDanhSachCanhBao(data.items);
            setTotalItems(data.totalElements);
        } catch (err) {
            console.error('Lỗi khi tải cảnh báo:', err);
        } finally {
            setDangTai(false);
        }
    };

    const datLaiBoLoc = () => {
        setBoLoc({
            tuNgay: '2026-06-01',
            denNgay: '2026-06-06',
            maKtx: '-1',
        });
        setPage(1);
    };

    // Auto load when page or pageSize changes
    useEffect(() => {
        taiDuLieu(page, pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize]);

    // Reset page and reload when filters change
    useEffect(() => {
        setPage(1);
        if (page === 1) {
            taiDuLieu(1, pageSize);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [boLoc.tuNgay, boLoc.denNgay, boLoc.maKtx]);

    return (
        <Box className="stranger-page-container">
            {/* TIÊU ĐỀ HỆ THỐNG CẢNH BÁO */}
            <div className="alert-header">
                <div className="alert-title-wrapper">
                    <div className="pulse-alert-icon">
                        <IconAlertTriangle size={24} />
                    </div>
                    <div>
                        <h2 className="alert-title">HỆ THỐNG CẢNH BÁO NGƯỜI LẠ</h2>
                        <p className="alert-subtitle">Giám sát và phát hiện xâm nhập trái phép thời gian thực</p>
                    </div>
                </div>

                {/* Chế độ xem */}
                <Group gap="xs">
                    <Button
                        variant={dangLieu === 'GRID' ? 'filled' : 'outline'}
                        color="blue"
                        onClick={() => datDangLieu('GRID')}
                        className="view-toggle-btn"
                    >
                        <IconLayoutGrid size={16} style={{ marginRight: 6 }} /> Grid Feed
                    </Button>
                    <Button
                        variant={dangLieu === 'TABLE' ? 'filled' : 'outline'}
                        color="blue"
                        onClick={() => datDangLieu('TABLE')}
                        className="view-toggle-btn"
                    >
                        <IconList size={16} style={{ marginRight: 6 }} /> Table List
                    </Button>
                </Group>
            </div>

            {/* BỘ LỌC CẢNH BÁO */}
            <div className="alert-filter-bar">
                <div className="filter-grid">
                    {/* Từ ngày */}
                    <div className="filter-col">
                        <label className="filter-label">TỪ NGÀY</label>
                        <DateInput
                            placeholder="mm/dd/yyyy"
                            valueFormat="DD/MM/YYYY"
                            value={boLoc.tuNgay ? dayjs(boLoc.tuNgay).toDate() : null}
                            onChange={(ngay) =>
                                setBoLoc(prev => ({ ...prev, tuNgay: ngay ? dayjs(ngay).format('YYYY-MM-DD') : '' }))
                            }
                            size="sm"
                            radius="md"
                            styles={{ input: { height: '38px', borderColor: '#f1f5f9' } }}
                        />
                    </div>

                    {/* Đến ngày */}
                    <div className="filter-col">
                        <label className="filter-label">ĐẾN NGÀY</label>
                        <DateInput
                            placeholder="mm/dd/yyyy"
                            valueFormat="DD/MM/YYYY"
                            value={boLoc.denNgay ? dayjs(boLoc.denNgay).toDate() : null}
                            onChange={(ngay) =>
                                setBoLoc(prev => ({ ...prev, denNgay: ngay ? dayjs(ngay).format('YYYY-MM-DD') : '' }))
                            }
                            size="sm"
                            radius="md"
                            styles={{ input: { height: '38px', borderColor: '#f1f5f9' } }}
                        />
                    </div>

                    {/* Khu KTX */}
                    <div className="filter-col">
                        <label className="filter-label">KHU KTX PHÁT HIỆN</label>
                        <Select
                            value={boLoc.maKtx}
                            onChange={(val) => setBoLoc(prev => ({ ...prev, maKtx: val || '-1' }))}
                            size="sm"
                            radius="md"
                            styles={{ input: { height: '38px', borderColor: '#f1f5f9' } }}
                            data={optionsKhu}
                            placeholder="Tất cả"
                        />
                    </div>
                </div>

                <div className="filter-actions">
                    <Button onClick={() => taiDuLieu(1)} color="blue" leftSection={<IconSearch size={15} />} className="btn-alert-search">
                        Tìm kiếm
                    </Button>
                    <Button variant="subtle" color="gray" onClick={datLaiBoLoc} leftSection={<IconRefresh size={15} />}>
                        Làm mới
                    </Button>
                </div>
            </div>

            {/* HIỂN THỊ DỮ LIỆU */}
            {dangTai ? (
                <div className="loader-box">
                    <Loader color="blue" size="md" />
                    <Text size="sm" c="dimmed" mt="sm">Đang quét dữ liệu lịch sử...</Text>
                </div>
            ) : danhSachCanhBao.length === 0 ? (
                <Card className="empty-alert-card">
                    <IconAlertTriangle size={48} className="empty-icon" />
                    <Text fw={700} size="lg" mt="md" c="dimmed">Không phát hiện người lạ</Text>
                    <Text size="sm" c="dimmed" mt={4}>Hệ thống hiện tại chưa ghi nhận sự xâm nhập nào phù hợp với bộ lọc.</Text>
                </Card>
            ) : dangLieu === 'GRID' ? (
                /* HIỂN THỊ DẠNG LƯỚI CARD FEED */
                <div className="stranger-grid">
                    {danhSachCanhBao.map((banGhi) => (
                        <Card
                            key={banGhi.id}
                            className="stranger-card"
                            radius="lg"
                            withBorder
                            onClick={() => datCanhBaoDuocChon(banGhi)}
                            style={{ cursor: 'pointer' }}
                        >
                            {/* Hình chụp */}
                            <div className="image-wrapper">
                                <img
                                    src={banGhi.duongDanAnhChup || banGhi.duongDanAnhDaiDien || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400'}
                                    alt="Stranger Intrusion"
                                    className="stranger-img"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400';
                                    }}
                                />
                                <Badge color="cyan" variant="filled" className="warning-badge">
                                    CẢNH BÁO XÂM NHẬP
                                </Badge>
                            </div>

                            {/* Thông tin chi tiết */}
                            <div className="card-details">
                                {/* Giờ phát hiện */}
                                <div className="detail-item">
                                    <IconClock size={16} className="detail-icon icon-red" />
                                    <div>
                                        <Text size="xs" c="dimmed" fw={600}>GIỜ PHÁT HIỆN</Text>
                                        <Text size="sm" fw={700}>
                                            {dayjs(banGhi.thoiGian).format('DD/MM/YYYY HH:mm:ss')}
                                        </Text>
                                    </div>
                                </div>

                                {/* Camera phát hiện */}
                                <div className="detail-item">
                                    <IconCamera size={16} className="detail-icon icon-blue" />
                                    <div>
                                        <Text size="xs" c="dimmed" fw={600}>CAMERA PHÁT HIỆN</Text>
                                        <Text size="sm" fw={700} className="text-truncate">
                                            {banGhi.thietBi || 'N/A'}
                                        </Text>
                                    </div>
                                </div>

                                {/* Khu KTX phát hiện */}
                                <div className="detail-item">
                                    <IconMapPin size={16} className="detail-icon icon-emerald" />
                                    <div>
                                        <Text size="xs" c="dimmed" fw={600}>KHU KTX PHÁT HIỆN</Text>
                                        <Text size="sm" fw={700}>
                                            {banGhi.tenKtx || 'N/A'}
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                /* HIỂN THỊ DẠNG BẢNG LOG TABLE */
                <div className="table-wrapper">
                    <Table highlightOnHover verticalSpacing="md" className="stranger-table">
                        <Table.Thead className="table-thead">
                            <Table.Tr>
                                <Table.Th style={{ width: 60, textAlign: 'center' }}>STT</Table.Th>
                                <Table.Th style={{ width: 120, textAlign: 'center' }}>Hình ảnh</Table.Th>
                                <Table.Th>Giờ phát hiện</Table.Th>
                                <Table.Th>Camera phát hiện</Table.Th>
                                <Table.Th>Khu KTX phát hiện</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {danhSachCanhBao.map((banGhi, index) => (
                                <Table.Tr
                                    key={banGhi.id}
                                    className="table-tr"
                                    onClick={() => datCanhBaoDuocChon(banGhi)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <Table.Td style={{ textAlign: 'center' }} className="td-stt">
                                        {index + 1}
                                    </Table.Td>
                                    <Table.Td>
                                        <Box style={{ display: 'flex', justifyContent: 'center' }}>
                                            <Avatar
                                                src={banGhi.duongDanAnhChup || banGhi.duongDanAnhDaiDien}
                                                radius="md"
                                                size={56}
                                                className="avatar-warning"
                                                onError={(e) => {
                                                    console.log('Error load image');
                                                }}
                                            />
                                        </Box>
                                    </Table.Td>
                                    <Table.Td className="td-highlight">
                                        {dayjs(banGhi.thoiGian).format('DD/MM/YYYY HH:mm:ss')}
                                    </Table.Td>
                                    <Table.Td className="td-camera">
                                        {banGhi.thietBi}
                                    </Table.Td>
                                    <Table.Td className="td-ktx">
                                        <Badge color="blue" variant="light" size="md">
                                            {banGhi.tenKtx}
                                        </Badge>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </div>
            )}

            {/* PHÂN TRANG */}
            <Box mt="md" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <CustomPagination
                    totalItems={totalItems}
                    page={page}
                    pageSize={pageSize}
                    setPage={setPage}
                    setPageSize={setPageSize}
                />
            </Box>

            {/* DRAWER CHI TIẾT CẢNH BÁO */}
            <Drawer
                opened={!!canhBaoDuocChon}
                onClose={() => datCanhBaoDuocChon(null)}
                title={
                    <span style={{ fontWeight: 800, fontSize: 16, color: '#1f5ca9', fontFamily: 'var(--font-k2d), sans-serif', textTransform: 'uppercase' }}>
                        Chi tiết cảnh báo người lạ
                    </span>
                }
                position="right"
                size={400}
            >
                {canhBaoDuocChon && (
                    <Stack gap="lg" p="sm" style={{ fontFamily: 'var(--font-readex-pro), sans-serif' }}>
                        {/* Ảnh chụp người lạ */}
                        <Box
                            style={{
                                width: '100%',
                                height: 260,
                                borderRadius: 8,
                                border: '1px solid #e2e8f0',
                                backgroundColor: '#f8fafc',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                overflow: 'hidden'
                            }}
                        >
                            <img
                                src={canhBaoDuocChon.duongDanAnhChup || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400'}
                                alt="Stranger Intrusion"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain'
                                }}
                            />
                        </Box>

                        {/* Danh sách thông tin tối giản, dễ nhìn */}
                        <Stack gap="sm" mt="xs">
                            {/* Đối tượng */}
                            <Box 
                                style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderBottom: '1px solid #f1f5f9', 
                                    paddingBottom: 12 
                                }}
                            >
                                <Text size="sm" c="dimmed" fw={600}>ĐỐI TƯỢNG</Text>
                                <Badge color="cyan" variant="filled">Người lạ</Badge>
                            </Box>

                            {/* Giờ phát hiện */}
                            <Box 
                                style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderBottom: '1px solid #f1f5f9', 
                                    paddingBottom: 12 
                                }}
                            >
                                <Text size="sm" c="dimmed" fw={600}>GIỜ PHÁT HIỆN</Text>
                                <Text size="sm" fw={700} style={{ color: '#1e293b' }}>
                                    {dayjs(canhBaoDuocChon.thoiGian).format('DD/MM/YYYY HH:mm:ss')}
                                </Text>
                            </Box>

                            {/* Camera phát hiện */}
                            <Box 
                                style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderBottom: '1px solid #f1f5f9', 
                                    paddingBottom: 12 
                                }}
                            >
                                <Text size="sm" c="dimmed" fw={600}>CAMERA PHÁT HIỆN</Text>
                                <Text size="sm" fw={700} style={{ color: '#1e293b' }}>
                                    {canhBaoDuocChon.thietBi || 'N/A'}
                                </Text>
                            </Box>

                            {/* Khu vực phát hiện */}
                            <Box 
                                style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderBottom: '1px solid #f1f5f9', 
                                    paddingBottom: 12 
                                }}
                            >
                                <Text size="sm" c="dimmed" fw={600}>KHU VỰC PHÁT HIỆN</Text>
                                <Text size="sm" fw={700} style={{ color: '#1e293b' }}>
                                    {canhBaoDuocChon.tenKtx || 'N/A'}
                                </Text>
                            </Box>
                        </Stack>

                        <Button
                            color="blue"
                            onClick={() => datCanhBaoDuocChon(null)}
                            mt="lg"
                            fullWidth
                            size="md"
                            radius="md"
                            style={{
                                backgroundColor: '#1f5ca9',
                                fontWeight: 700
                            }}
                        >
                            Đóng cửa sổ
                        </Button>
                    </Stack>
                )}
            </Drawer>

            <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
        </Box>
    );
=======
  const khiXuatExcel = () => {
    alert("Xuất dữ liệu Excel cảnh báo người lạ thành công!");
  };

  const khiXuatPdf = () => {
    alert("Xuất dữ liệu PDF cảnh báo người lạ thành công!");
  };

  const khiThemDuLieu = () => {
    alert("Chức năng thêm dữ liệu cảnh báo thủ công đang phát triển!");
  };

  // Tự động tải lại dữ liệu khi đổi trang hoặc đổi số dòng/trang
  useEffect(() => {
    taiDuLieu(trangHienTai);
  }, [soDongTrenTrang]);

  // Tạo mảng số trang hiển thị dạng "1 2 3 4 ... 52"
  const taoSoTrangHienThi = (): (number | "...")[] => {
    if (tongSoTrang <= 5) {
      return Array.from({ length: tongSoTrang }, (_, i) => i + 1);
    }
    const trang: (number | "...")[] = [1, 2, 3, 4];
    if (trangHienTai > 4 && trangHienTai < tongSoTrang - 1) {
      trang.push("...");
      trang.push(trangHienTai);
    }
    trang.push("...");
    trang.push(tongSoTrang);
    return trang;
  };

  const chiSoBatDau = (trangHienTai - 1) * soDongTrenTrang;
  const chiSoKetThuc = trangHienTai * soDongTrenTrang;
=======
    setTrangHienTai(1);
  };

  const datBoLocVaResetPage = (boLocMoi: any) => {
    setBoLoc((prev) => ({ ...prev, ...boLocMoi }));
    setTrangHienTai(1);
  };

  // Auto load when filters or page changes
  useEffect(() => {
    taiDuLieu();
  }, [boLoc.tuNgay, boLoc.denNgay, boLoc.maKtx, trangHienTai]);
>>>>>>> Stashed changes

  return (
    <Box className="stranger-page-container">
      {/* TIÊU ĐỀ CẢNH BÁO NGƯỜI LẠ */}
      <div className="alert-header">
        <div className="alert-title-wrapper">
          <div>
            <h2 className="alert-title">{t("warnings.title")}</h2>
            <p className="alert-subtitle">
              {t("warnings.subtitle")}
            </p>
          </div>
        </div>

        {/* Chế độ xem */}
        <Group gap="xs">
          <Button
            variant={dangLieu === "GRID" ? "filled" : "outline"}
            color="#1f5ca9"
            onClick={() => datDangLieu("GRID")}
            className="view-toggle-btn"
          >
            <IconLayoutGrid size={16} style={{ marginRight: 6 }} /> {t("warnings.gridFeed")}
          </Button>
          <Button
            variant={dangLieu === "TABLE" ? "filled" : "outline"}
            color="#1f5ca9"
            onClick={() => datDangLieu("TABLE")}
            className="view-toggle-btn"
          >
            <IconList size={16} style={{ marginRight: 6 }} /> {t("warnings.tableList")}
          </Button>
        </Group>
      </div>

<<<<<<< Updated upstream
      {/* BỘ LỌC CẢNH BÁO (LƯỢC BỚT CÒN 4 TRƯỜNG VÀ CÁC NÚT) */}
      <div className="alert-filter-bar">
        <div className="filter-grid">
          {/* Từ ngày */}
          <div className="filter-col">
            <label className="filter-label">{t("filter.fromDate").toUpperCase()}</label>
            <DatePickerInput
              placeholder="DD/MM/YYYY"
              valueFormat="DD/MM/YYYY"
              value={boLoc.tuNgay ? dayjs(boLoc.tuNgay).toDate() : null}
              onChange={(ngay) =>
                setBoLoc((prev) => ({
                  ...prev,
                  tuNgay: ngay ? dayjs(ngay).format("YYYY-MM-DD") : "",
                }))
              }
              size="sm"
              radius="md"
              styles={{ input: { height: "38px", borderColor: "#e2e8f0" } }}
            />
          </div>

          {/* Đến ngày */}
          <div className="filter-col">
            <label className="filter-label">{t("filter.toDate").toUpperCase()}</label>
            <DatePickerInput
              placeholder="DD/MM/YYYY"
              valueFormat="DD/MM/YYYY"
              value={boLoc.denNgay ? dayjs(boLoc.denNgay).toDate() : null}
              onChange={(ngay) =>
                setBoLoc((prev) => ({
                  ...prev,
                  denNgay: ngay ? dayjs(ngay).format("YYYY-MM-DD") : "",
                }))
              }
              size="sm"
              radius="md"
              styles={{ input: { height: "38px", borderColor: "#e2e8f0" } }}
            />
          </div>

          {/* Khu KTX */}
          <div className="filter-col">
            <label className="filter-label">{t("filter.dormitory").toUpperCase()}</label>
            <Select
              value={boLoc.maKtx}
              onChange={(val) =>
                setBoLoc((prev) => ({ ...prev, maKtx: val || "-1" }))
              }
              size="sm"
              radius="md"
              styles={{ input: { height: "38px", borderColor: "#e2e8f0" } }}
              data={optionsKhu}
              placeholder={t("filter.all")}
            />
          </div>

          {/* Trạng thái (Vào/Ra/Tất cả) */}
          <div className="filter-col">
            <label className="filter-label">{t("filter.status").toUpperCase()}</label>
            <Select
              value={boLoc.loai}
              onChange={(val) =>
                setBoLoc((prev) => ({
                  ...prev,
                  loai: (val as "IN" | "OUT" | "ALL") || "ALL",
                }))
              }
              size="sm"
              radius="md"
              styles={{ input: { height: "38px", borderColor: "#e2e8f0" } }}
              data={[
                { value: "ALL", label: t("filter.all") },
                { value: "IN", label: t("filter.in") },
                { value: "OUT", label: t("filter.out") },
              ]}
              placeholder={t("filter.all")}
            />
          </div>
        </div>

        {/* Cụm nút hành động đầy đủ giống hệt Lịch sử ra vào */}
        <div className="filter-actions-group">
          <Button
            onClick={() => taiDuLieu(1)}
            color="#1f5ca9"
            leftSection={<IconSearch size={15} />}
            className="btn-action btn-search-warning"
          >
            {t("filter.search")}
          </Button>

          <Button
            onClick={datLaiBoLoc}
            leftSection={<IconRefresh size={15} />}
            variant="outline"
            className="btn-action btn-reset"
          >
            {t("filter.reset")}
          </Button>

          <Button
            onClick={khiXuatExcel}
            leftSection={<IconFileSpreadsheet size={15} />}
            variant="outline"
            className="btn-action btn-excel"
          >
            {t("filter.exportExcel")}
          </Button>

          <Button
            onClick={khiXuatPdf}
            leftSection={<IconFileTypePdf size={15} />}
            variant="outline"
            className="btn-action btn-pdf"
          >
            {t("filter.exportPdf")}
          </Button>

          <Button
            onClick={khiThemDuLieu}
            leftSection={<IconPlus size={15} />}
            className="btn-action btn-add-data"
          >
            {t("filter.addData")}
          </Button>
        </div>
      </div>
=======
      {/* BỘ LỌC CẢNH BÁO NGƯỜI LẠ CHUYÊN BIỆT */}
      <BoLocNguoiLa
        boLoc={boLoc}
        datBoLoc={datBoLocVaResetPage}
        datLaiBoLoc={datLaiBoLoc}
        khiTimKiem={taiDuLieu}
        khiXuatExcel={xuLyXuatExcel}
        khiXuatPdf={xuLyXuatPdf}
      />
>>>>>>> Stashed changes

      {/* HIỂN THỊ DỮ LIỆU */}
      {dangTai ? (
        <div className="loader-box">
          <Loader color="#1f5ca9" size="md" />
          <Text size="sm" c="dimmed" mt="sm">
            {t("warnings.scanning")}
          </Text>
        </div>
      ) : danhSachCanhBao.length === 0 ? (
        <Card className="empty-alert-card">
          <IconAlertTriangle size={48} className="empty-icon" />
          <Text fw={700} size="lg" mt="md" c="dimmed">
            {t("warnings.noStranger")}
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            {t("warnings.noStrangerDesc")}
          </Text>
        </Card>
      ) : dangLieu === "GRID" ? (
        /* HIỂN THỊ DẠNG LƯỚI CARD FEED */
        <div className="stranger-grid">
          {danhSachCanhBao.map((banGhi) => (
            <Card
              key={banGhi.id}
              className="stranger-card"
              radius="lg"
              withBorder
<<<<<<< Updated upstream
              onClick={() => setLichSuDuocChon(banGhi)}
=======
              onClick={() => setStrangerDuocChon(banGhi)}
>>>>>>> Stashed changes
              style={{ cursor: "pointer" }}
            >
              {/* Hình chụp */}
              <div className="image-wrapper">
                <img
                  src={
                    banGhi.duongDanAnhChup ||
                    banGhi.duongDanAnhDaiDien ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400"
                  }
                  alt="Stranger Intrusion"
                  className="stranger-img"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400";
                  }}
                />
                <Badge color="#1f5ca9" variant="filled" className="warning-badge">
<<<<<<< Updated upstream
                  {t("warnings.alertIntrusion")}
=======
                  CẢNH BÁO XÂM NHẬP
>>>>>>> Stashed changes
                </Badge>
              </div>

              {/* Thông tin chi tiết */}
              <div className="card-details">
                {/* Giờ phát hiện */}
                <div className="detail-item">
                  <IconClock size={16} className="detail-icon icon-red" />
                  <div>
                    <Text size="xs" c="dimmed" fw={600}>
                      {t("warnings.timeDetect")}
                    </Text>
                    <Text size="sm" fw={700}>
                      {dayjs(banGhi.thoiGian).format("DD/MM/YYYY HH:mm:ss")}
                    </Text>
                  </div>
                </div>

                {/* Camera phát hiện */}
                <div className="detail-item">
                  <IconCamera size={16} className="detail-icon icon-blue" />
                  <div>
                    <Text size="xs" c="dimmed" fw={600}>
                      {t("warnings.cameraDetect")}
                    </Text>
                    <Text size="sm" fw={700} className="text-truncate">
                      {banGhi.thietBi || "N/A"}
                    </Text>
                  </div>
                </div>

                {/* Khu KTX phát hiện */}
                <div className="detail-item">
                  <IconMapPin size={16} className="detail-icon icon-emerald" />
                  <div>
                    <Text size="xs" c="dimmed" fw={600}>
                      {t("warnings.dormDetect")}
                    </Text>
                    <Text size="sm" fw={700}>
                      {banGhi.tenKtx || "N/A"}
                    </Text>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* HIỂN THỊ DẠNG BẢNG LOG TABLE */
        <div className="table-wrapper">
          <Table
            highlightOnHover
            verticalSpacing="md"
            className="stranger-table"
          >
            <Table.Thead className="table-thead">
              <Table.Tr>
                <Table.Th style={{ width: 60, textAlign: "center" }}>
                  {t("table.no")}
                </Table.Th>
                <Table.Th style={{ width: 200 }}>{t("table.time")}</Table.Th>
                <Table.Th style={{ width: 120, textAlign: "center" }}>
                  {t("table.image")}
                </Table.Th>
                <Table.Th>{t("warnings.camera")}</Table.Th>
                <Table.Th>{t("warnings.dorm")}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {danhSachCanhBao.map((banGhi, index) => (
<<<<<<< Updated upstream
                <Table.Tr
                  key={banGhi.id}
                  className="table-tr"
                  onClick={() => setLichSuDuocChon(banGhi)}
                  style={{ cursor: "pointer" }}
                >
                  <Table.Td style={{ textAlign: "center" }} className="td-stt">
                    {chiSoBatDau + index + 1}
                  </Table.Td>
                  <Table.Td className="td-highlight">
                    {dayjs(banGhi.thoiGian).format("DD/MM/YYYY HH:mm:ss")}
=======
                <Table.Tr key={banGhi.id} className="table-tr" onClick={() => setStrangerDuocChon(banGhi)} style={{ cursor: "pointer" }}>
                  <Table.Td style={{ textAlign: "center" }} className="td-stt">
                    {(trangHienTai - 1) * sizeTrang + index + 1}
>>>>>>> Stashed changes
                  </Table.Td>
                  <Table.Td>
                    <Box style={{ display: "flex", justifyContent: "center" }}>
                      <Avatar
                        src={
                          banGhi.duongDanAnhChup || banGhi.duongDanAnhDaiDien
                        }
                        radius="md"
                        size={56}
                        className="avatar-warning"
                      />
                    </Box>
                  </Table.Td>
                  <Table.Td className="td-camera">{banGhi.thietBi}</Table.Td>
                  <Table.Td className="td-ktx">
<<<<<<< Updated upstream
                    <Badge color="blue" variant="light" size="md">
=======
                    <Badge color="#1f5ca9" variant="light" size="md">
>>>>>>> Stashed changes
                      {banGhi.tenKtx}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      )}

<<<<<<< Updated upstream
      {/* THANH PHÂN TRANG CHO TRANG CẢNH BÁO */}
      {!dangTai && danhSachCanhBao.length > 0 && (
        <div className="pagination-bar">
          <div className="pagination-info">
            {t("table.paginationInfo", {
              start: chiSoBatDau + 1,
              end: Math.min(chiSoKetThuc, tongSoBanGhi),
              total: tongSoBanGhi,
            })}
          </div>

          <div className="pagination-buttons">
            <button
              onClick={() => taiDuLieu(trangHienTai - 1)}
              disabled={trangHienTai === 1}
              className="btn-page"
            >
              &lt;
            </button>

            {taoSoTrangHienThi().map((soTrang, idx) => {
              if (soTrang === "...") {
                return (
                  <span key={`dots-${idx}`} style={{ padding: "0 8px", color: "#94a3b8" }}>
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={`page-${soTrang}`}
                  onClick={() => taiDuLieu(soTrang)}
                  className={`btn-page ${trangHienTai === soTrang ? "btn-page-active" : ""}`}
                >
                  {soTrang}
                </button>
              );
            })}

            <button
              onClick={() => taiDuLieu(trangHienTai + 1)}
              disabled={trangHienTai === tongSoTrang}
              className="btn-page"
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      {/* DRAWER CHI TIẾT NGƯỜI LẠ KHI CLICK */}
      <DrawerChiTietLichSu
        open={lichSuDuocChon !== null}
        onClose={() => setLichSuDuocChon(null)}
        lichSuDuocChon={lichSuDuocChon}
      />

=======
      {/* Pagination */}
      {tongSoTrang > 1 && (
        <div className="pagination-wrapper" style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
          <Pagination
            value={trangHienTai}
            onChange={setTrangHienTai}
            total={tongSoTrang}
            color="#1f5ca9"
            radius="md"
          />
        </div>
      )}

      {/* Drawer chi tiết người lạ */}
      <DrawerChiTietLichSu
        open={strangerDuocChon !== null}
        onClose={() => setStrangerDuocChon(null)}
        lichSuDuocChon={strangerDuocChon}
        isStranger={true}
      />

      {/* THÔNG BÁO DẠNG TOAST */}
      {thongBao && (
        <Portal>
          <div className="fixed top-5 right-5 z-[9999] w-80 animate-fade-in shadow-lg">
            <Notification
              icon={
                thongBao.kieu === "success" ? (
                  <IconCheck size={18} />
                ) : (
                  <IconX size={18} />
                )
              }
              color={thongBao.kieu === "success" ? "teal" : "red"}
              title={
                thongBao.kieu === "success"
                  ? t("messages.success")
                  : t("messages.error")
              }
              onClose={() => setThongBao(null)}
            >
              {thongBao.tinNhan}
            </Notification>
          </div>
        </Portal>
      )}

>>>>>>> Stashed changes
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
    </Box>
  );
>>>>>>> 226c8f8 (Cập nhật chức năng history)
}

const pageStyles = `
.stranger-page-container {
    padding: 1.5rem;
    min-height: 100vh;
    background-color: #fcfdff;
    font-family: var(--font-readex-pro), sans-serif;
}

.alert-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.alert-title-wrapper {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.pulse-alert-icon {
<<<<<<< Updated upstream
<<<<<<< HEAD
    background-color: #e0f2fe;
    border: 1px solid #bae6fd;
    color: #00afef;
=======
    background-color: rgba(31, 92, 169, 0.08);
    border: 1px solid rgba(31, 92, 169, 0.15);
    color: #1f5ca9;
>>>>>>> 226c8f8 (Cập nhật chức năng history)
=======
    background-color: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #1f5ca9;
>>>>>>> Stashed changes
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
<<<<<<< Updated upstream
<<<<<<< HEAD
    box-shadow: 0 0 0 0 rgba(0, 175, 239, 0.4);
=======
    box-shadow: 0 0 0 0 rgba(31, 92, 169, 0.4);
>>>>>>> Stashed changes
    animation: alertPulse 1.5s infinite;
}

.alert-title {
    margin: 0;
<<<<<<< Updated upstream
    font-size: 1.5rem;
    font-weight: 800;
    color: #1f5ca9;
    letter-spacing: -0.02em;
=======
}

.alert-title {
=======
>>>>>>> Stashed changes
    font-size: 1.125rem;
    font-weight: bold;
    color: #27272a;
    text-transform: uppercase;
    letter-spacing: -0.025em;
<<<<<<< Updated upstream
    margin-top: 0;
    margin-bottom: 1rem;
    font-family: var(--font-k2d), sans-serif;
>>>>>>> 226c8f8 (Cập nhật chức năng history)
=======
    font-family: var(--font-k2d);
>>>>>>> Stashed changes
}

.alert-subtitle {
    margin: 0.25rem 0 0 0;
    font-size: 0.875rem;
    color: #64748b;
    font-weight: 500;
}

.view-toggle-btn {
    border-radius: 0.5rem !important;
    font-weight: 600 !important;
}

<<<<<<< Updated upstream
.alert-filter-bar {
    background-color: #ffffff;
    border-radius: 1rem;
    border: 1px solid #e2e8f0;
    padding: 1.25rem 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.01), 0 2px 4px -1px rgba(0, 0, 0, 0.005);
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.filter-grid {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 1rem;
    width: 100%;
}

@media (min-width: 640px) {
    .filter-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (min-width: 1024px) {
    .filter-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
}

.filter-col {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.filter-label {
    font-size: 11px;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.filter-actions-group {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.btn-action {
    height: 38px !important;
<<<<<<< HEAD
    background-color: #1f5ca9 !important;
    color: #ffffff !important;
=======
    font-size: 13px !important;
>>>>>>> 226c8f8 (Cập nhật chức năng history)
    font-weight: 600 !important;
    border-radius: 0.5rem !important;
    transition: all 0.2s ease !important;
    cursor: pointer !important;
}

.btn-search-warning {
    background-color: #1f5ca9 !important;
    color: #ffffff !important;
    border: none !important;
    padding-left: 1.5rem !important;
    padding-right: 1.5rem !important;
}

<<<<<<< HEAD
.btn-alert-search:hover {
    background-color: #154580 !important;
=======
.btn-search-warning:hover {
    background-color: #16437d !important;
    box-shadow: 0 4px 8px rgba(31, 92, 169, 0.2) !important;
}

.btn-reset {
    background-color: #ffffff !important;
    border: 1px solid #d4d4d8 !important;
    color: #4b5563 !important;
    padding-left: 1rem !important;
    padding-right: 1rem !important;
}

.btn-reset:hover {
    background-color: #f4f4f5 !important;
    color: #111827 !important;
}

.btn-excel {
    background-color: #ffffff !important;
    border: 1px solid #0f766e !important;
    color: #0f766e !important;
    padding-left: 1rem !important;
    padding-right: 1rem !important;
}

.btn-excel:hover {
    background-color: rgba(15, 118, 110, 0.04) !important;
    box-shadow: 0 4px 8px rgba(15, 118, 110, 0.1) !important;
}

.btn-pdf {
    background-color: #ffffff !important;
    border: 1px solid #be123c !important;
    color: #be123c !important;
    padding-left: 1rem !important;
    padding-right: 1rem !important;
}

.btn-pdf:hover {
    background-color: rgba(190, 18, 60, 0.04) !important;
    box-shadow: 0 4px 8px rgba(190, 18, 60, 0.1) !important;
}

.btn-add-data {
    background: linear-gradient(135deg, #00afef 0%, #1f5ca9 100%) !important;
    color: #ffffff !important;
    border: none !important;
    padding-left: 1.25rem !important;
    padding-right: 1.25rem !important;
}

.btn-add-data:hover {
    opacity: 0.95 !important;
    box-shadow: 0 4px 10px rgba(0, 175, 239, 0.25) !important;
>>>>>>> 226c8f8 (Cập nhật chức năng history)
}

=======
>>>>>>> Stashed changes
.loader-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 40vh;
}

.empty-alert-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1.5rem;
    text-align: center;
    border-radius: 1rem;
    background-color: #ffffff;
    border: 1px dashed #cbd5e1;
}

.empty-icon {
    color: #94a3b8;
}

/* Stranger Grid */
.stranger-grid {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 1.25rem;
}

@media (min-width: 640px) {
    .stranger-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (min-width: 1024px) {
    .stranger-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (min-width: 1280px) {
    .stranger-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
}

.stranger-card {
    background-color: #ffffff;
    border-color: #e2e8f0;
    transition: all 0.25s ease;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.01), 0 2px 4px -1px rgba(0, 0, 0, 0.005);
}

.stranger-card:hover {
    transform: translateY(-4px);
<<<<<<< Updated upstream
    box-shadow: 0 10px 15px -3px rgba(31, 92, 169, 0.05), 0 4px 6px -2px rgba(31, 92, 169, 0.03);
<<<<<<< HEAD
    border-color: #93c5fd;
=======
    border-color: #00afef;
>>>>>>> 226c8f8 (Cập nhật chức năng history)
=======
    box-shadow: 0 10px 15px -3px rgba(31, 92, 169, 0.08), 0 4px 6px -2px rgba(31, 92, 169, 0.04);
    border-color: #00afef;
>>>>>>> Stashed changes
}

.image-wrapper {
    position: relative;
    width: 100%;
    height: 180px;
    background-color: #f8fafc;
    overflow: hidden;
    border-radius: 0.5rem;
}

.stranger-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
}

.stranger-card:hover .stranger-img {
    transform: scale(1.05);
}

.warning-badge {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    font-size: 10px;
    font-weight: 700;
}

.card-details {
    padding-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.detail-icon {
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.icon-red {
<<<<<<< Updated upstream
<<<<<<< HEAD
    background-color: #e0f2fe;
    color: #00afef;
=======
    background-color: rgba(31, 92, 169, 0.08);
    color: #1f5ca9;
>>>>>>> 226c8f8 (Cập nhật chức năng history)
=======
    background-color: #eff6ff;
    color: #1f5ca9;
>>>>>>> Stashed changes
}

.icon-blue {
    background-color: #eff6ff;
    color: #3b82f6;
}

.icon-emerald {
    background-color: #ecfdf5;
    color: #10b981;
}

.text-truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
}

/* Stranger Table */
.table-wrapper {
    background-color: #ffffff;
    border-radius: 1rem;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.01);
}

.stranger-table {
    min-width: 600px;
}

.table-thead {
    background-color: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
}

.table-thead th {
    font-weight: 700;
    color: #475569;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.table-tr {
    transition: background-color 150ms;
}

.table-tr:hover {
    background-color: #f0f7ff;
}

.td-stt {
    font-weight: 600;
    color: #64748b;
}

.avatar-warning {
<<<<<<< Updated upstream
<<<<<<< HEAD
    border: 2px solid #bfdbfe;
=======
    border: 2px solid rgba(31, 92, 169, 0.15);
>>>>>>> 226c8f8 (Cập nhật chức năng history)
=======
    border: 2px solid #bfdbfe;
>>>>>>> Stashed changes
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.td-highlight {
    font-weight: 700;
    color: #1f5ca9;
}

.td-camera {
    font-weight: 600;
    color: #334155;
}

.td-ktx {
    font-weight: 600;
}

<<<<<<< HEAD
@keyframes alertPulse {
    0% {
<<<<<<< Updated upstream
        box-shadow: 0 0 0 0 rgba(0, 175, 239, 0.4);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(0, 175, 239, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(0, 175, 239, 0);
=======
        box-shadow: 0 0 0 0 rgba(31, 92, 169, 0.4);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(31, 92, 169, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(31, 92, 169, 0);
>>>>>>> Stashed changes
    }
=======
/* Pagination */
.pagination-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
}

.pagination-info {
    font-size: 13px;
    color: #64748b;
    font-weight: 500;
}

.pagination-buttons {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.btn-page {
    height: 32px;
    min-width: 32px;
    padding: 0 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    border: 1px solid #cbd5e1;
    background-color: #ffffff;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
    background-color: #f1f5f9;
    border-color: #94a3b8;
    color: #1e293b;
}

.btn-page:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.btn-page-active {
    background-color: #1f5ca9 !important;
    border-color: #1f5ca9 !important;
    color: #ffffff !important;
>>>>>>> 226c8f8 (Cập nhật chức năng history)
}
`;
