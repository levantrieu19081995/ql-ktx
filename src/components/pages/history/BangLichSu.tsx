'use client';

import React, { useState } from 'react';
import { Table, Avatar, Select, Box } from '@mantine/core';
import { useTranslations } from 'next-intl';
import {
    IconArrowRight,
    IconArrowLeft,
    IconCircleX,
    IconUser,
    IconBan,
    IconCircleCheck,
    IconClock,
} from '@tabler/icons-react';
import { HistoryItem } from '../../../types/type-history';
import dayjs from 'dayjs';

// Kiểu Tab hiển thị để quyết định cột Loại render như thế nào
export type LoaiTabHienThi = 'LICH_SU' | 'CO_MAT' | 'VANG_MAT' | 'CANH_BAO' | 'CAN_BO' | 'SINH_VIEN';

// Định nghĩa giao diện thuộc tính cho Component Bảng lịch sử ra vào
interface ThuocTinhBangLichSu {
    // Mảng dữ liệu lịch sử ra vào
    duLieu: HistoryItem[];

    // Trạng thái đang tải dữ liệu từ API
    dangTai?: boolean;

    // Loại tab hiện tại để điều chỉnh cột Loại
    loaiTab?: LoaiTabHienThi;

    // Bản ghi lịch sử đang được lựa chọn để xem chi tiết
    lichSuDuocChon: HistoryItem | null;

    // Hàm thiết lập bản ghi lịch sử đang được lựa chọn
    datLichSuDuocChon: (lichSu: HistoryItem | null) => void;

    // Active tab in main page
    tabActive?: string;
}

/**
 * Hàm render badge cột Loại tuỳ theo dữ liệu và tab đang active.
 * Chức năng: Hiển thị đúng nhãn trạng thái theo ảnh mockup.
 */
const renderCotLoai = (banGhi: HistoryItem, loaiTab: LoaiTabHienThi, t: any) => {
    // Ưu tiên hiển thị theo tab
    if (loaiTab === 'CO_MAT') {
        return (
            <span className="badge-status status-emerald">
                <IconCircleCheck size={14} /> {t('filter.present')}
            </span>
        );
    }

    if (loaiTab === 'VANG_MAT') {
        return (
            <span className="badge-status status-amber">
                <IconClock size={14} /> {t('filter.absent')}
            </span>
        );
    }

    // Tab LICH_SU hoặc CANH_BAO: hiển thị theo phân loại của bản ghi
    if (banGhi.loaiDoiTuong === 'Người lạ') {
        return (
            <span className="badge-status status-red">
                <IconCircleX size={14} /> {t('filter.stranger')}
            </span>
        );
    }

    if (banGhi.trangThaiSinhVien === 'NO_PHI') {
        return (
            <span className="badge-status status-blue">
                <IconUser size={14} /> {t('filter.unpaid')}
            </span>
        );
    }

    if (banGhi.trangThaiSinhVien === 'BI_CAM') {
        return (
            <span className="badge-status status-orange">
                <IconBan size={14} /> {t('filter.banned')}
            </span>
        );
    }

    // Sinh viên bình thường: hiển thị hướng di chuyển Vào / Ra
    const laVao = banGhi.loai === 'IN';
    return (
        <span
            className={`badge-status ${laVao ? 'status-blue' : 'status-emerald'}`}
        >
            {laVao ? (
                <>
                    <IconArrowRight size={14} /> {t('filter.in')}
                </>
            ) : (
                <>
                    <IconArrowLeft size={14} /> {t('filter.out')}
                </>
            )}
        </span>
    );
};

/**
 * Hàm lấy nhãn trạng thái hiện diện cho bảng Thông tin chi tiết.
 */
export const layNhanTrangThai = (banGhi: HistoryItem, loaiTab: LoaiTabHienThi, t: any): { nhan: string; mauSac: string } => {
    if (loaiTab === 'CO_MAT') return { nhan: t('filter.present'), mauSac: 'status-emerald' };
    if (loaiTab === 'VANG_MAT') return { nhan: t('filter.absent'), mauSac: 'status-amber' };
    if (banGhi.loaiDoiTuong === 'Người lạ') return { nhan: t('filter.stranger'), mauSac: 'status-red' };
    if (banGhi.trangThaiSinhVien === 'NO_PHI') return { nhan: t('filter.unpaid'), mauSac: 'status-blue' };
    if (banGhi.trangThaiSinhVien === 'BI_CAM') return { nhan: t('filter.banned'), mauSac: 'status-orange' };
    if (banGhi.loai === 'IN') return { nhan: t('filter.in'), mauSac: 'status-blue' };
    return { nhan: t('filter.out'), mauSac: 'status-emerald' };
};

/**
 * Component Bảng hiển thị nhật ký ra vào ký túc xá (BangLichSu).
 * Chức năng: Render bảng danh sách lịch sử với cột Loại linh hoạt theo tab.
 */
export default function BangLichSu({
    duLieu,
    dangTai = false,
    loaiTab = 'LICH_SU',
    lichSuDuocChon,
    datLichSuDuocChon,
    tabActive = 'LICH_SU',
}: ThuocTinhBangLichSu) {
    const t = useTranslations('History');
    // Trạng thái phân trang cục bộ
    const [trangHienTai, datTrangHienTai] = useState<number>(1);
    const [soDongTrenTrang, datSoDongTrenTrang] = useState<number>(5);

    // Tính toán danh sách trang hiện tại
    const chiSoBatDau = (trangHienTai - 1) * soDongTrenTrang;
    const chiSoKetThuc = chiSoBatDau + soDongTrenTrang;
    const danhSachHienThi = duLieu.slice(chiSoBatDau, chiSoKetThuc);
    const tongSoTrang = Math.ceil(duLieu.length / soDongTrenTrang);

    // Hàm xử lý chuyển trang
    const xuLyChuyenTrang = (soTrangMoi: number) => {
        if (soTrangMoi >= 1 && soTrangMoi <= tongSoTrang) {
            datTrangHienTai(soTrangMoi);
        }
    };

    // Tạo mảng số trang hiển thị dạng "1 2 3 4 ... 52"
    const taoSoTrangHienThi = (): (number | '...')[] => {
        if (tongSoTrang <= 5) {
            return Array.from({ length: tongSoTrang }, (_, i) => i + 1);
        }
        const trang: (number | '...')[] = [1, 2, 3, 4];
        if (trangHienTai > 4 && trangHienTai < tongSoTrang - 1) {
            trang.push('...');
            trang.push(trangHienTai);
        }
        trang.push('...');
        trang.push(tongSoTrang);
        return trang;
    };

    return (
        <div className="history-table-wrapper">
            {/* BẢNG DỮ LIỆU */}
            <div className="scroll-container">
                <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md" className="history-table">
                    <Table.Thead className="table-header">
                        <Table.Tr>
                            <Table.Th style={{ width: 48, textAlign: 'center' }}>{t('table.no')}</Table.Th>
                            <Table.Th style={{ width: 145 }}>{t('table.time')}</Table.Th>
                            <Table.Th style={{ width: 155 }}>{t('table.fullName')}</Table.Th>
                            <Table.Th style={{ width: 80, textAlign: 'center' }}>{t('table.image')}</Table.Th>
                            <Table.Th style={{ width: 110 }}>{t('table.type')}</Table.Th>
                            <Table.Th style={{ width: 75 }}>{t('table.dormitory')}</Table.Th>
                            {tabActive !== 'LICH_SU' && (
                                <Table.Th style={{ width: 80 }}>
                                    {tabActive === 'CAN_BO' ? t('table.unit') : t('table.room')}
                                </Table.Th>
                            )}
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {dangTai ? (
                            <Table.Tr>
                                <Table.Td colSpan={tabActive === 'LICH_SU' ? 6 : 7} className="table-cell-empty">
                                    {t('table.loading')}
                                </Table.Td>
                            </Table.Tr>
                        ) : danhSachHienThi.length === 0 ? (
                            <Table.Tr>
                                <Table.Td colSpan={tabActive === 'LICH_SU' ? 6 : 7} className="table-cell-empty">
                                    {t('table.noData')}
                                </Table.Td>
                            </Table.Tr>
                        ) : (
                            danhSachHienThi.map((banGhi, index) => {
                                const laDuocChon = lichSuDuocChon?.id === banGhi.id;
                                return (
                                    <Table.Tr
                                        key={banGhi.id}
                                        onClick={() => datLichSuDuocChon(banGhi)}
                                        className={`table-row ${laDuocChon ? 'table-row-selected' : ''}`}
                                    >
                                        <Table.Td style={{ textAlign: 'center' }} className="cell-stt">
                                            {chiSoBatDau + index + 1}
                                        </Table.Td>
                                        <Table.Td className="cell-time">
                                            {dayjs(banGhi.thoiGian).format('DD/MM/YYYY HH:mm:ss')}
                                        </Table.Td>
                                        <Table.Td className="cell-name">
                                            {banGhi.hoVaTen}
                                        </Table.Td>
                                        <Table.Td style={{ textAlign: 'center' }}>
                                            <Box style={{ display: 'flex', justifyContent: 'center' }}>
                                                <Avatar
                                                    src={banGhi.duongDanAnhChup || banGhi.duongDanAnhDaiDien}
                                                    radius="sm"
                                                    size={44}
                                                    className="avatar-image"
                                                />
                                            </Box>
                                        </Table.Td>
                                        <Table.Td>{renderCotLoai(banGhi, loaiTab, t)}</Table.Td>
                                        <Table.Td className="cell-text-medium">
                                            {banGhi.tenKtx}
                                        </Table.Td>
                                        {tabActive !== 'LICH_SU' && (
                                            <Table.Td className="cell-text-medium">
                                                {banGhi.tenPhong}
                                            </Table.Td>
                                        )}
                                    </Table.Tr>
                                );
                            })
                        )}
                    </Table.Tbody>
                </Table>
            </div>

            {/* THANH PHÂN TRANG THEO MOCKUP */}
            <div className="pagination-bar">
                {/* Thông tin số bản ghi */}
                <div className="pagination-info">
                    {t('table.paginationInfo', {
                        start: duLieu.length === 0 ? 0 : chiSoBatDau + 1,
                        end: Math.min(chiSoKetThuc, duLieu.length),
                        total: duLieu.length
                    })}
                </div>

                {/* Nút phân trang */}
                <div className="pagination-buttons">
                    {/* Nút về trang trước */}
                    <button
                        onClick={() => xuLyChuyenTrang(trangHienTai - 1)}
                        disabled={trangHienTai === 1}
                        className="btn-page"
                    >
                        {'<'}
                    </button>

                    {/* Danh sách trang */}
                    {taoSoTrangHienThi().map((item, idx) => {
                        if (item === '...') {
                            return (
                                <span key={`ellipsis-${idx}`} className="page-ellipsis">
                                    ...
                                </span>
                            );
                        }
                        const soTrang = item as number;
                        const laHienTai = soTrang === trangHienTai;
                        return (
                            <button
                                key={soTrang}
                                onClick={() => xuLyChuyenTrang(soTrang)}
                                className={`btn-page ${laHienTai ? 'btn-page-active' : ''}`}
                            >
                                {soTrang}
                            </button>
                        );
                    })}

                    {/* Nút đến trang sau */}
                    <button
                        onClick={() => xuLyChuyenTrang(trangHienTai + 1)}
                        disabled={trangHienTai === tongSoTrang || tongSoTrang === 0}
                        className="btn-page"
                    >
                        {'>'}
                    </button>
                </div>

                {/* Bộ chọn số dòng/trang */}
                <Select
                    value={soDongTrenTrang.toString()}
                    onChange={(giaTri) => {
                        datSoDongTrenTrang(Number(giaTri || '5'));
                        datTrangHienTai(1);
                    }}
                    size="xs"
                    radius="md"
                    style={{ width: 110 }}
                    data={[
                        { value: '5', label: t('table.rowsPerPage', { count: 5 }) },
                        { value: '10', label: t('table.rowsPerPage', { count: 10 }) },
                    ]}
                />
            </div>
            <style dangerouslySetInnerHTML={{ __html: tableStyles }} />
        </div>
    );
}

const tableStyles = `
.history-table-wrapper {
    background-color: #ffffff;
    border-radius: 0.75rem;
    border: 1px solid #e4e4e7;
    overflow: hidden;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.scroll-container {
    overflow-x: auto;
}

.history-table {
    min-width: 600px;
    font-size: 0.875rem;
}

.table-header {
    background-color: #fafafa;
    border-bottom: 1px solid #e4e4e7;
}

.table-cell-empty {
    text-align: center;
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
    color: #71717a;
}

.table-row {
    cursor: pointer;
    transition: background-color 150ms;
}

.table-row:hover {
    background-color: #fafafa;
}

.table-row-selected {
    background-color: rgba(239, 246, 255, 0.7) !important;
}

.cell-stt {
    font-weight: 500;
    color: #52525b;
    font-size: 0.875rem;
}

.cell-time {
    color: #3f3f46;
    font-size: 0.875rem;
}

.cell-name {
    font-weight: 500;
    color: #27272a;
    font-size: 0.875rem;
}

.cell-text-medium {
    color: #3f3f46;
    font-size: 0.875rem;
    font-weight: 500;
}

.avatar-image {
    border: 1px solid #f4f4f5;
    flex-shrink: 0;
}

/* Badge status */
.badge-status {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
}

.status-emerald {
    color: #059669 !important;
}

.status-amber {
    color: #d97706 !important;
}

.status-red {
    color: #ef4444 !important;
}

.status-blue {
    color: #2563eb !important;
}

.status-orange {
    color: #ea580c !important;
}

/* Pagination bar */
.pagination-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.75rem 1.25rem;
    border-top: 1px solid #e4e4e7;
    background-color: #ffffff;
}

.pagination-info {
    color: #52525b;
    font-size: 0.875rem;
    white-space: nowrap;
}

.pagination-buttons {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.btn-page {
    width: 1.75rem;
    height: 1.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.25rem;
    border: 1px solid #d4d4d8;
    background-color: #ffffff;
    color: #71717a;
    font-size: 0.875rem;
    transition: all 150ms;
    cursor: pointer;
}

.btn-page:hover:not(:disabled) {
    border-color: #00afef;
    color: #00afef;
}

.btn-page:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.btn-page-active {
    background-color: #ffffff !important;
    color: #00afef !important;
    border-color: #00afef !important;
    font-weight: 600 !important;
}

.page-ellipsis {
    width: 1.75rem;
    height: 1.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #a1a1aa;
    font-size: 0.875rem;
}
`;
;


