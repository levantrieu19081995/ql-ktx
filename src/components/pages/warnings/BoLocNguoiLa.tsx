'use client';

import React, { useState, useEffect } from 'react';
import { Select, Button } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useTranslations } from 'next-intl';
import { IconSearch, IconRefresh, IconFileSpreadsheet, IconFileTypePdf } from '@tabler/icons-react';
import dayjs from 'dayjs';
// Import services and interfaces
import { dichVuDanhMucKhu, KhuItem } from './strangerService';

interface ThuocTinhBoLocNguoiLa {
    boLoc: {
        tuNgay?: string;
        denNgay?: string;
        maKtx?: string;
    };
    datBoLoc: (boLocMoi: {
        tuNgay?: string;
        denNgay?: string;
        maKtx?: string;
    }) => void;
    datLaiBoLoc: () => void;
    khiTimKiem: () => void;
    khiXuatExcel?: () => void;
    khiXuatPdf?: () => void;
}

export const BoLocNguoiLa: React.FC<ThuocTinhBoLocNguoiLa> = ({
    boLoc,
    datBoLoc,
    datLaiBoLoc,
    khiTimKiem,
    khiXuatExcel,
    khiXuatPdf,
}) => {
    const t = useTranslations('History');
    const [danhSachKhu, setDanhSachKhu] = useState<KhuItem[]>([]);

    useEffect(() => {
        dichVuDanhMucKhu.layDanhSach().then(setDanhSachKhu);
    }, []);

    const optionsKhu = [
        { value: '-1', label: t('filter.all') },
        ...danhSachKhu.map((k) => ({ value: k.maKhu, label: k.tenKhu }))
    ];

    return (
        <div className="modern-filter-container">
            <div className="filter-content-wrapper">
                <div className="nguoi-la-filter-wrapper">
                    <div className="filter-row-1">
                        <div className="filter-inputs-group-row-1 stranger-fields">
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

                            {/* Khu KTX phát hiện */}
                            <div className="filter-field">
                                <label className="filter-label">KHU KTX</label>
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
                        </div>

                        {/* Nhóm button tìm kiếm */}
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
                                Làm mới
                            </Button>

                            {khiXuatExcel && (
                                <Button
                                    onClick={khiXuatExcel}
                                    leftSection={<IconFileSpreadsheet size={15} />}
                                    variant="outline"
                                    className="btn-action btn-excel"
                                >
                                    {t('filter.exportExcel')}
                                </Button>
                            )}

                            {khiXuatPdf && (
                                <Button
                                    onClick={khiXuatPdf}
                                    leftSection={<IconFileTypePdf size={15} />}
                                    variant="outline"
                                    className="btn-action btn-pdf"
                                >
                                    {t('filter.exportPdf')}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
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
    font-family: var(--font-k2d), sans-serif;
}

.filter-content-wrapper {
    display: flex;
    flex-direction: column;
}

.filter-row-1 {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1.25rem;
    width: 100%;
}

.filter-field {
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
}

.filter-inputs-group-row-1.stranger-fields {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 1rem;
    flex: 1;
    min-width: 280px;
}

@media (min-width: 640px) {
    .filter-inputs-group-row-1.stranger-fields {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
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
    border: 1px solid #1f5ca9 !important;
    color: #1f5ca9 !important;
    padding-left: 1rem !important;
    padding-right: 1rem !important;
}

.btn-excel:hover {
    background-color: rgba(31, 92, 169, 0.04) !important;
    box-shadow: 0 4px 8px rgba(31, 92, 169, 0.1) !important;
}

.btn-pdf {
    background-color: #ffffff !important;
    border: 1px solid #00afef !important;
    color: #00afef !important;
    padding-left: 1rem !important;
    padding-right: 1rem !important;
}

.btn-pdf:hover {
    background-color: rgba(0, 175, 240, 0.04) !important;
    box-shadow: 0 4px 8px rgba(0, 175, 240, 0.1) !important;
}
`;

export default BoLocNguoiLa;
