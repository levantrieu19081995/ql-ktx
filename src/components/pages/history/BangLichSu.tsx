'use client';

import React from 'react';
import { Table, Avatar, Box } from '@mantine/core';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';

import { HistoryItem } from '../../../types/type-history';

export type LoaiTabHienThi =
  | 'LICH_SU'
  | 'CO_MAT'
  | 'VANG_MAT'
  | 'CANH_BAO'
  | 'CAN_BO'
  | 'SINH_VIEN';

interface ThuocTinhBangLichSu {
  duLieu: HistoryItem[];
  dangTai?: boolean;
  loaiTab?: LoaiTabHienThi;
  lichSuDuocChon: HistoryItem | null;
  datLichSuDuocChon: (lichSu: HistoryItem | null) => void;
  tabActive?: string;
}

export const layNhanTrangThai = (
  banGhi: HistoryItem,
  loaiTab: LoaiTabHienThi,
  t: any,
): { nhan: string; mauSac: string } => {
  if (loaiTab === 'CO_MAT') return { nhan: t('filter.present'), mauSac: 'status-emerald' };
  if (loaiTab === 'VANG_MAT') return { nhan: t('filter.absent'), mauSac: 'status-amber' };
  if (banGhi.loaiDoiTuong === 'NgÆ°á»i láº¡') return { nhan: t('filter.stranger'), mauSac: 'status-red' };
  if (banGhi.trangThaiSinhVien === 'NO_PHI') return { nhan: t('filter.unpaid'), mauSac: 'status-blue' };
  if (banGhi.trangThaiSinhVien === 'BI_CAM') return { nhan: t('filter.banned'), mauSac: 'status-orange' };
  if (banGhi.loai === 'IN') return { nhan: t('filter.in'), mauSac: 'status-blue' };
  return { nhan: t('filter.out'), mauSac: 'status-emerald' };
};

export default function BangLichSu({
  duLieu,
  dangTai = false,
  lichSuDuocChon,
  datLichSuDuocChon,
  tabActive = 'LICH_SU',
}: ThuocTinhBangLichSu) {
  const t = useTranslations('History');

  return (
    <div className="history-table-wrapper">
      <div className="scroll-container">
        <Table
          highlightOnHover
          verticalSpacing="md"
          horizontalSpacing="md"
          className="history-table"
        >
          <Table.Thead className="table-header">
            <Table.Tr>
              <Table.Th style={{ width: 60, textAlign: 'center' }}>{t('table.no')}</Table.Th>
              <Table.Th style={{ width: 180 }}>{t('table.time')}</Table.Th>
              <Table.Th style={{ width: 220 }}>{t('table.fullName')}</Table.Th>
              <Table.Th style={{ width: 160, textAlign: 'center' }}>{t('table.image')}</Table.Th>
              <Table.Th style={{ width: 200 }}>{t('table.device')}</Table.Th>
              <Table.Th style={{ width: 150 }}>{t('table.group')}</Table.Th>
              <Table.Th style={{ width: 120 }}>{t('table.dormitory')}</Table.Th>
              {tabActive !== 'LICH_SU' && (
                <Table.Th style={{ width: 110 }}>
                  {tabActive === 'CAN_BO' ? t('table.unit') : t('table.room')}
                </Table.Th>
              )}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {dangTai ? (
              <Table.Tr>
                <Table.Td colSpan={tabActive === 'LICH_SU' ? 7 : 8} className="table-cell-empty">
                  {t('table.loading')}
                </Table.Td>
              </Table.Tr>
            ) : duLieu.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={tabActive === 'LICH_SU' ? 7 : 8} className="table-cell-empty">
                  {t('table.noData')}
                </Table.Td>
              </Table.Tr>
            ) : (
              duLieu.map((banGhi, index) => {
                const laDuocChon = lichSuDuocChon?.id === banGhi.id;
                return (
                  <Table.Tr
                    key={banGhi.id}
                    onClick={() => datLichSuDuocChon(banGhi)}
                    className={`table-row ${laDuocChon ? 'table-row-selected' : ''}`}
                  >
                    <Table.Td style={{ textAlign: 'center' }} className="cell-stt">
                      {index + 1}
                    </Table.Td>
                    <Table.Td className="cell-time">
                      {dayjs(banGhi.thoiGian).format('DD/MM/YYYY HH:mm:ss')}
                    </Table.Td>
                    <Table.Td className="cell-name">{banGhi.hoVaTen}</Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <Box style={{ display: 'flex', justifyContent: 'center' }}>
                        <Avatar
                          src={banGhi.duongDanAnhChup || banGhi.duongDanAnhDaiDien}
                          radius="sm"
                          size={60}
                          className="avatar-image"
                          styles={{ image: { objectFit: 'cover' } }}
                        />
                      </Box>
                    </Table.Td>
                    <Table.Td
                      className={`${banGhi.loai === 'IN' ? 'status-blue' : 'status-emerald'} cell-text-medium`}
                    >
                      {banGhi.thietBi || 'N/A'}
                    </Table.Td>
                    <Table.Td className="cell-text-medium">
                      {banGhi.loaiDoiTuong || 'N/A'}
                    </Table.Td>
                    <Table.Td className="cell-text-medium">{banGhi.tenKtx}</Table.Td>
                    {tabActive !== 'LICH_SU' && (
                      <Table.Td className="cell-text-medium">{banGhi.tenPhong}</Table.Td>
                    )}
                  </Table.Tr>
                );
              })
            )}
          </Table.Tbody>
        </Table>
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
`;
