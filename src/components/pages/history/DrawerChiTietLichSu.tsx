'use client';

import React from 'react';
import { Card, Image, Button, Table, Drawer, Box, Badge } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { IconAlertTriangle } from '@tabler/icons-react';
import { HistoryItem } from '../../../types/type-history';

interface ThuocTinhDrawerChiTietLichSu {
    open: boolean;
    onClose: () => void;
    lichSuDuocChon: HistoryItem | null;
    khiPhanHoi?: (lichSu: HistoryItem) => void;
}

/**
 * Component Ngăn kéo hiển thị thông tin chi tiết lượt ra vào (DrawerChiTietLichSu).
 */
export const DrawerChiTietLichSu: React.FC<ThuocTinhDrawerChiTietLichSu> = ({
    open,
    onClose,
    lichSuDuocChon,
    khiPhanHoi,
}) => {
    const t = useTranslations('History');

    // Nếu không có bản ghi nào được chọn thì không hiển thị gì
    if (!lichSuDuocChon) {
        return null;
    }

    const laNguoiLa = lichSuDuocChon.mssv === "NguoiLa" || 
                      lichSuDuocChon.loaiDoiTuong?.toLowerCase().includes("người lạ") || 
                      lichSuDuocChon.loaiDoiTuong?.toLowerCase().includes("nguoi la");

    const drawerTitleText = laNguoiLa ? t("warnings.detailStranger") : t('drawer.detailTitle');
    const detailsCardTitleText = laNguoiLa ? t("warnings.detailStranger") : t('card.detailTitle');

    return (
        <Drawer
            opened={open}
            onClose={onClose}
            title={<span className="drawer-title">{drawerTitleText}</span>}
            position="right"
            size={420}
            styles={{
                header: {
                    borderBottom: '1px solid #f0f0f0',
                    padding: '12px 20px',
                    backgroundColor: '#fdfdfd',
                },
                body: {
                    padding: '12px 20px',
                },
            }}
        >
            <div className="drawer-body">
                {/* Ảnh chụp từ camera thực tế */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '25px' }}>
                    <Card
                        withBorder
                        radius="lg"
                        p="xs"
                        className="portrait-card"
                        style={{ maxWidth: '280px', width: '100%' }}
                    >
                        <span className="portrait-card-title" style={{ marginBottom: '4px' }}>{t('drawer.portraitCamera')}</span>
                        <Image
                            src={lichSuDuocChon.duongDanAnhChup || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250'}
                            alt="Camera chụp"
                            radius="md"
                            style={{ objectFit: 'contain', maxHeight: '220px', width: '100%' }}
                        />
                    </Card>
                </div>

                {/* Thông tin mô tả chi tiết của sự kiện ra vào */}
                <Card withBorder radius="lg" p="xs" className="details-table-card" style={{ marginTop: '25px' }}>
                    <h4 className="details-card-title" style={{ marginBottom: '6px', paddingBottom: '4px' }}>{detailsCardTitleText}</h4>
                    <Table verticalSpacing={1} striped highlightOnHover style={{ fontSize: '13px' }}>
                        <Table.Tbody>
                            <Table.Tr>
                                <Table.Td style={{ fontWeight: 600, width: '150px' }} className="th-label">{t('filter.studentId')}</Table.Td>
                                <Table.Td className="td-mono-val">{lichSuDuocChon.mssv}</Table.Td>
                            </Table.Tr>
                            {!laNguoiLa && (
                                <Table.Tr>
                                    <Table.Td style={{ fontWeight: 600 }} className="th-label">{t('table.fullName')}</Table.Td>
                                    <Table.Td className="td-bold-val">{lichSuDuocChon.hoVaTen}</Table.Td>
                                </Table.Tr>
                            )}
                            <Table.Tr>
                                <Table.Td style={{ fontWeight: 600 }} className="th-label">{t('drawer.dormLabel')}</Table.Td>
                                <Table.Td>{lichSuDuocChon.tenKtx}</Table.Td>
                            </Table.Tr>
                            {!laNguoiLa && (
                                <Table.Tr>
                                    <Table.Td style={{ fontWeight: 600 }} className="th-label">
                                        {lichSuDuocChon.loaiDoiTuong?.toLowerCase().includes("cán bộ") ||
                                         lichSuDuocChon.loaiDoiTuong?.toLowerCase().includes("can bo")
                                            ? t('drawer.unitLabel')
                                            : t('drawer.roomLabel')}
                                    </Table.Td>
                                    <Table.Td>{lichSuDuocChon.tenPhong || '-'}</Table.Td>
                                </Table.Tr>
                            )}
                            <Table.Tr>
                                <Table.Td style={{ fontWeight: 600 }} className="th-label">{t('drawer.eventLabel')}</Table.Td>
                                <Table.Td>
                                    {lichSuDuocChon.loai === 'IN' ? (
                                        <Badge color="green" size="sm" radius="xl">{t('filter.in').toUpperCase()}</Badge>
                                    ) : (
                                        <Badge color="blue" size="sm" radius="xl">{t('filter.out').toUpperCase()}</Badge>
                                    )}
                                </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td style={{ fontWeight: 600 }} className="th-label">{t('table.time')}</Table.Td>
                                <Table.Td>{lichSuDuocChon.thoiGian}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td style={{ fontWeight: 600 }} className="th-label">{t('drawer.deviceLabel')}</Table.Td>
                                <Table.Td>{lichSuDuocChon.thietBi}</Table.Td>
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </Card>

                {/* Nút đóng */}
                <Box style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                    {khiPhanHoi && (
                        <Button
                            variant="light"
                            color="red"
                            size="sm"
                            leftSection={<IconAlertTriangle size={15} />}
                            onClick={() => khiPhanHoi(lichSuDuocChon)}
                            className="btn-feedback"
                            styles={{ root: { borderRadius: '8px' } }}
                        >
                            {t('card.feedbackBtn')}
                        </Button>
                    )}
                    <Button variant="outline" color="gray" size="sm" onClick={onClose} className="btn-close">
                        {t('drawer.closeBtn')}
                    </Button>
                </Box>
            </div>
            <style dangerouslySetInnerHTML={{ __html: drawerDetailStyles }} />
        </Drawer>
    );
};

const drawerDetailStyles = `
.drawer-title {
    font-weight: bold;
    color: #27272a;
    font-family: var(--font-k2d), sans-serif;
}

.drawer-body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    font-family: var(--font-k2d), sans-serif;
}

.portrait-card {
    background-color: rgba(244, 244, 245, 0.5) !important;
    text-align: center;
}

.portrait-card-title {
    font-size: 0.75rem;
    font-weight: bold;
    color: #71717a;
    display: block;
    margin-bottom: 0.75rem;
    text-align: left;
}

.details-table-card {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
}

.details-card-title {
    font-size: 0.875rem;
    font-weight: bold;
    color: #3f3f46;
    margin-top: 0;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid #e4e4e7;
    padding-bottom: 0.25rem;
}

.th-label {
    color: #52525b;
}

.td-mono-val {
    font-family: monospace;
    font-weight: bold;
    color: #3f3f46;
}

.td-bold-val {
    font-weight: bold;
    color: #27272a;
}

.btn-close {
    border-radius: 0.5rem !important;
}
`;

export default DrawerChiTietLichSu;
