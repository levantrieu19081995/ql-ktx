<<<<<<< HEAD
'use client';

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
    });

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
=======
"use client";

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
import { useTranslations } from "next-intl";
import {
  IconAlertTriangle,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { HistoryItem } from "../../../types/type-history";
import { dichVuNguoiLa } from "./strangerService";
import BoLocNguoiLa from "./BoLocNguoiLa";
import DrawerChiTietLichSu from "../history/DrawerChiTietLichSu";
import { xuatRaFileExcel } from "../history/excelHelper";

export default function StrangerWarningsPage() {
  const t = useTranslations("History");
  const [dangTai, setDangTai] = useState(false);
  const [danhSachCanhBao, setDanhSachCanhBao] = useState<HistoryItem[]>([]);

  // Trạng thái phân trang
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [tongSoTrang, setTongSoTrang] = useState(1);
  const [tongSoPhanTu, setTongSoPhanTu] = useState(0);
  const sizeTrang = 8;

  // Bộ lọc — bắt đầu rỗng để hiện toàn bộ dữ liệu
  const [boLoc, setBoLoc] = useState({
    tuNgay: "",
    denNgay: "",
    maKtx: "-1",
  });

  const [strangerDuocChon, setStrangerDuocChon] = useState<HistoryItem | null>(
    null,
  );
  const [thongBao, setThongBao] = useState<{
    tinNhan: string;
    kieu: "success" | "error";
  } | null>(null);

  const hienThongBao = (
    tinNhan: string,
    kieu: "success" | "error" = "success",
  ) => {
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
      "Giờ phát hiện": h.gioNguoiLa || "",
    }));
    xuatRaFileExcel(
      duLieuXuat,
      `Danh_Sach_Nguoi_La_${new Date().toISOString().split("T")[0]}`,
      "Cảnh báo người lạ",
    );
    hienThongBao(t("messages.exportExcelSuccess"), "success");
  };

  const xuLyXuatPdf = () => {
    hienThongBao(t("messages.exportPdfSuccess"), "success");
  };

  const taiDuLieu = async () => {
    setDangTai(true);
    try {
      const response = await dichVuNguoiLa.layDanhSachNguoiLa({
        tuNgay: boLoc.tuNgay,
        denNgay: boLoc.denNgay,
        maKtx: boLoc.maKtx,
        page: trangHienTai,
        pageSize: sizeTrang,
      });

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
    } finally {
      setDangTai(false);
    }
  };

  const datLaiBoLoc = () => {
    setBoLoc({
      tuNgay: "",
      denNgay: "",
      maKtx: "-1",
    });
    setTrangHienTai(1);
  };

  const datBoLocVaResetPage = (boLocMoi: any) => {
    setBoLoc((prev) => ({ ...prev, ...boLocMoi }));
    setTrangHienTai(1);
  };

  // Tự động tải lại dữ liệu khi bộ lọc hoặc số trang thay đổi
  useEffect(() => {
    taiDuLieu();
  }, [boLoc.tuNgay, boLoc.denNgay, boLoc.maKtx, trangHienTai]);

  return (
    <Box className="stranger-page-container">
      <div className="stranger-header-row">
        <h2 className="stranger-page-title">CẢNH BÁO NGƯỜI LẠ</h2>
      </div>

      <BoLocNguoiLa
        boLoc={boLoc}
        datBoLoc={datBoLocVaResetPage}
        datLaiBoLoc={datLaiBoLoc}
        khiTimKiem={taiDuLieu}
        khiXuatExcel={xuLyXuatExcel}
        khiXuatPdf={xuLyXuatPdf}
      />

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
      ) : (
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
                <Table.Tr
                  key={banGhi.id}
                  className="table-tr"
                  onClick={() => setStrangerDuocChon(banGhi)}
                  style={{ cursor: "pointer" }}
                >
                  <Table.Td style={{ textAlign: "center" }} className="td-stt">
                    {(trangHienTai - 1) * sizeTrang + index + 1}
                  </Table.Td>
                  <Table.Td className="td-highlight">
                    {dayjs(banGhi.thoiGian).format("DD/MM/YYYY HH:mm:ss")}
                  </Table.Td>
                  <Table.Td>
                    <Box style={{ display: "flex", justifyContent: "center" }}>
                      <Avatar
                        src={
                          banGhi.duongDanAnhChup || banGhi.duongDanAnhDaiDien
                        }
                        radius="md"
                        size={60}
                        className="avatar-warning"
                        styles={{ image: { objectFit: 'cover' } }}
                      />
                    </Box>
                  </Table.Td>
                  <Table.Td className="td-camera">{banGhi.thietBi}</Table.Td>
                  <Table.Td className="td-ktx">
                    <Badge color="#1f5ca9" variant="light" size="md">
                      {banGhi.tenKtx}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {tongSoTrang > 1 && (
        <div
          className="pagination-wrapper"
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "1.5rem",
          }}
        >
          <Pagination
            value={trangHienTai}
            onChange={setTrangHienTai}
            total={tongSoTrang}
            color="#1f5ca9"
            radius="md"
          />
        </div>
      )}
>>>>>>> 15db144f5a0b64a9ab43f45e3084df6cc936fe08

      {/* Drawer chi tiết người lạ */}
      <DrawerChiTietLichSu
        open={strangerDuocChon !== null}
        onClose={() => setStrangerDuocChon(null)}
        lichSuDuocChon={strangerDuocChon}
        isStranger={true}
      />

<<<<<<< HEAD
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
                    <span style={{ fontWeight: 800, fontSize: 16, color: '#1f5ca9', fontFamily: 'var(--font-readex-pro), sans-serif', textTransform: 'uppercase' }}>
                        Chi tiết cảnh báo người lạ
                    </span>
                }
                position="right"
                size={400}
=======
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
>>>>>>> 15db144f5a0b64a9ab43f45e3084df6cc936fe08
            >
              {thongBao.tinNhan}
            </Notification>
          </div>
        </Portal>
      )}

<<<<<<< HEAD
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
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
    </Box>
  );
>>>>>>> 15db144f5a0b64a9ab43f45e3084df6cc936fe08
}

const pageStyles = `
.stranger-page-container {
    padding: 1.5rem;
    min-height: 100vh;
    background-color: #fcfdff;
    font-family: var(--font-readex-pro), sans-serif;
}

.stranger-header-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
}

.stranger-page-title {
    font-size: 1.125rem;
    font-weight: bold;
    color: #27272a;
    text-transform: uppercase;
    letter-spacing: -0.025em;
    margin: 0;
    font-family: var(--font-k2d), sans-serif;
}

.view-toggle-btn {
    border-radius: 0.5rem !important;
    font-weight: 600 !important;
}

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
    box-shadow: 0 10px 15px -3px rgba(31, 92, 169, 0.08), 0 4px 6px -2px rgba(31, 92, 169, 0.04);
    border-color: #00afef;
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
    gap: 0.5rem;
}

.detail-icon {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 0.375rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.icon-red {
    background-color: #eff6ff;
    color: #1f5ca9;
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
    border: 2px solid #bfdbfe;
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

@keyframes alertPulse {
    0% {
        box-shadow: 0 0 0 0 rgba(31, 92, 169, 0.4);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(31, 92, 169, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(31, 92, 169, 0);
    }
}
`;
