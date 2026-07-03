'use client';

import React, { useState, useEffect } from 'react';
import { TextInput, Select, Button } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useTranslations } from 'next-intl';
import {
    IconSearch,
    IconRefresh,
    IconPlus,
    IconChevronDown,
    IconChevronUp,
    IconFileSpreadsheet,
    IconFileTypePdf,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { dichVuDanhMucKhu, dichVuDanhMucNhom, KhuItem, NhomItem } from './historyService';

interface ThuocTinhBoLocLichSu {
    boLoc: {
        tuNgay?: string;
        denNgay?: string;
        mssv?: string;
        hoVaTen?: string;
        maKtx?: string;
        maPhong?: string;
        loai?: 'IN' | 'OUT' | 'ALL';
        trangThai?: string;
        loaiDoiTuong?: string;
        maNhom?: string;
    };
    datBoLoc: (boLocMoi: {
        tuNgay?: string;
        denNgay?: string;
        mssv?: string;
        hoVaTen?: string;
        maKtx?: string;
        maPhong?: string;
        loai?: 'IN' | 'OUT' | 'ALL';
        trangThai?: string;
        loaiDoiTuong?: string;
        maNhom?: string;
    }) => void;
    datLaiBoLoc: () => void;
    khiTimKiem: () => void;
    khiXuatExcel: () => void;
    khiXuatPdf: () => void;
    khiThemDuLieu: () => void;
}

export const BoLocLichSu: React.FC<ThuocTinhBoLocLichSu> = ({
    boLoc,
    datBoLoc,
    datLaiBoLoc,
    khiTimKiem,
    khiXuatExcel,
    khiXuatPdf,
    khiThemDuLieu,
}) => {
    const t = useTranslations('History');
    const [moRong, datMoRong] = useState(false);
    const [danhSachKhu, setDanhSachKhu] = useState<KhuItem[]>([]);
    const [danhSachNhom, setDanhSachNhom] = useState<NhomItem[]>([]);

    useEffect(() => {
        dichVuDanhMucKhu.layDanhSach().then(setDanhSachKhu);
        dichVuDanhMucNhom.layDanhSach().then(setDanhSachNhom);
    }, []);

    const optionsKhu = [
        { value: '-1', label: t('filter.all') },
        ...danhSachKhu.map((k) => ({ value: k.maKhu, label: k.tenKhu }))
    ];

    const optionsNhom = [
        { value: '-1', label: t('filter.all') },
        ...danhSachNhom.map((n) => ({ value: n.maNhom, label: n.tenNhom }))
    ];

    return (
        <div className="modern-filter-container">
            <div className="filter-content-wrapper">
                {/* HÀNG 1: Họ tên + MSSV + Nhóm nút hành động */}
                <div className="filter-row-1">
                    <div className="filter-field-group text-inputs">
                        {/* Họ tên */}
                        <div className="filter-field w-50">
                            <label className="filter-label">{t('filter.fullName').toUpperCase()}</label>
                            <TextInput
                                placeholder="Nhập họ tên..."
                                value={boLoc.hoVaTen || ''}
                                onChange={(e) => datBoLoc({ hoVaTen: e.target.value })}
                                size="sm"
                                radius="md"
                                styles={{ input: { height: '38px', borderColor: '#e4e4e7' } }}
                            />
                        </div>

                        {/* MSSV */}
                        <div className="filter-field w-50">
                            <label className="filter-label">{t('filter.studentId').toUpperCase()}</label>
                            <TextInput
                                placeholder="Nhập MSSV..."
                                value={boLoc.mssv || ''}
                                onChange={(e) => datBoLoc({ mssv: e.target.value })}
                                size="sm"
                                radius="md"
                                styles={{ input: { height: '38px', borderColor: '#e4e4e7', fontFamily: 'monospace' } }}
                            />
                        </div>
                    </div>

                    {/* Nút hành động hàng 1 */}
                    <div className="filter-actions-group">
                        <Button
                            onClick={khiTimKiem}
                            leftSection={<IconSearch size={15} />}
                            className="btn-action btn-search"
                        >
                            {t('filter.search')}
                        </Button>

                        <Button
                            onClick={datLaiBoLoc}
                            leftSection={<IconRefresh size={15} />}
                            variant="outline"
                            className="btn-action btn-reset"
                        >
                            {t('filter.reset')}
                        </Button>

                        <Button
                            onClick={khiXuatExcel}
                            leftSection={<IconFileSpreadsheet size={15} />}
                            variant="outline"
                            className="btn-action btn-excel"
                        >
                            {t('filter.exportExcel')}
                        </Button>

                        <Button
                            onClick={khiXuatPdf}
                            leftSection={<IconFileTypePdf size={15} />}
                            variant="outline"
                            className="btn-action btn-pdf"
                        >
                            {t('filter.exportPdf')}
                        </Button>

                        <Button
                            onClick={khiThemDuLieu}
                            leftSection={<IconPlus size={15} />}
                            className="btn-action btn-add-data"
                        >
                            {t('filter.addData')}
                        </Button>

                        {/* Nút mở rộng/thu gọn */}
                        <Button
                            variant="subtle"
                            onClick={() => datMoRong(!moRong)}
                            className="btn-toggle-expand"
                            title={moRong ? t('filter.collapse') : t('filter.expand')}
                        >
                            {moRong ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
                        </Button>
                    </div>
                </div>

                {/* HÀNG 2: Xuất hiện khi bấm Mở rộng bộ lọc */}
                {moRong && (
                    <div className="filter-row-2">
                        {/* Từ ngày */}
                        <div className="filter-field">
                            <label className="filter-label">{t('filter.fromDate').toUpperCase()}</label>
                            <DateInput
                                placeholder="mm/dd/yyyy"
                                valueFormat="DD/MM/YYYY"
                                value={boLoc.tuNgay ? dayjs(boLoc.tuNgay).toDate() : null}
                                onChange={(ngay) =>
                                    datBoLoc({ tuNgay: ngay ? dayjs(ngay).format('YYYY-MM-DD') : '' })
                                }
                                size="sm"
                                radius="md"
                                styles={{ input: { height: '38px', borderColor: '#e4e4e7' } }}
                            />
                        </div>

                        {/* Đến ngày */}
                        <div className="filter-field">
                            <label className="filter-label">{t('filter.toDate').toUpperCase()}</label>
                            <DateInput
                                placeholder="mm/dd/yyyy"
                                valueFormat="DD/MM/YYYY"
                                value={boLoc.denNgay ? dayjs(boLoc.denNgay).toDate() : null}
                                onChange={(ngay) =>
                                    datBoLoc({ denNgay: ngay ? dayjs(ngay).format('YYYY-MM-DD') : '' })
                                }
                                size="sm"
                                radius="md"
                                styles={{ input: { height: '38px', borderColor: '#e4e4e7' } }}
                            />
                        </div>

                        {/* Khu KTX */}
                        <div className="filter-field">
                            <label className="filter-label">{t('filter.dormitory').toUpperCase()}</label>
                            <Select
                                value={boLoc.maKtx || '-1'}
                                onChange={(giaTri) => datBoLoc({ maKtx: giaTri || '-1' })}
                                size="sm"
                                radius="md"
                                styles={{ input: { height: '38px', borderColor: '#e4e4e7' } }}
                                data={optionsKhu}
                                placeholder="Tất cả"
                            />
                        </div>

                        {/* Trạng thái (Action: IN/OUT/ALL) */}
                        <div className="filter-field">
                            <label className="filter-label">{t('filter.status').toUpperCase()}</label>
                            <Select
                                value={boLoc.loai || 'ALL'}
                                onChange={(giaTri) => datBoLoc({ loai: (giaTri as 'IN' | 'OUT' | 'ALL') || 'ALL' })}
                                size="sm"
                                radius="md"
                                styles={{ input: { height: '38px', borderColor: '#e4e4e7' } }}
                                data={[
                                    { value: 'ALL', label: t('filter.all') },
                                    { value: 'IN', label: t('filter.in') },
                                    { value: 'OUT', label: t('filter.out') },
                                ]}
                                placeholder="Tất cả"
                            />
                        </div>

                        {/* Loại đối tượng (Nhóm) */}
                        <div className="filter-field">
                            <label className="filter-label">{t('filter.objectType').toUpperCase()}</label>
                            <Select
                                value={boLoc.maNhom || '-1'}
                                onChange={(giaTri) => datBoLoc({ maNhom: giaTri || '-1' })}
                                size="sm"
                                radius="md"
                                styles={{ input: { height: '38px', borderColor: '#e4e4e7' } }}
                                data={optionsNhom}
                                placeholder="Tất cả"
                            />
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{ __html: filterStyles }} />
        </div>
    );
};

const filterStyles = `
.modern-filter-container {
    background-color: #f8fafc;
    border-radius: 0.75rem;
    border: 1px solid #e2e8f0;
    padding: 1.25rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
    margin-bottom: 1.25rem;
    font-family: var(--font-readex-pro), sans-serif;
}

.filter-content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.filter-row-1 {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
    width: 100%;
}

.filter-field-group.text-inputs {
    display: flex;
    flex: 1;
    min-width: 280px;
    gap: 0.75rem;
}

.filter-field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.filter-field.w-50 {
    flex: 1;
    min-width: 130px;
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
}

.btn-action {
    height: 38px !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    border-radius: 0.5rem !important;
    transition: all 0.2s ease !important;
    cursor: pointer !important;
}

.btn-search {
    background-color: #1f5ca9 !important;
    color: #ffffff !important;
    border: none !important;
    padding-left: 1.25rem !important;
    padding-right: 1.25rem !important;
}

.btn-search:hover {
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
}

.btn-toggle-expand {
    height: 38px !important;
    width: 38px !important;
    min-width: 38px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 !important;
    border-radius: 0.5rem !important;
    border: 1px solid #e2e8f0 !important;
    background-color: #ffffff !important;
    color: #64748b !important;
    cursor: pointer !important;
}

.btn-toggle-expand:hover {
    background-color: #f1f5f9 !important;
    color: #1e293b !important;
    border-color: #cbd5e1 !important;
}

.filter-row-2 {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 0.75rem;
    border-top: 1px dashed #cbd5e1;
    padding-top: 1rem;
    animation: slideDown 0.2s ease-out;
}

@media (min-width: 640px) {
    .filter-row-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (min-width: 1024px) {
    .filter-row-2 {
        grid-template-columns: repeat(5, minmax(0, 1fr));
    }
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
`;

export default BoLocLichSu;
