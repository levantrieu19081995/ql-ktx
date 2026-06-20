'use client';

import React from 'react';
import { Card, Image, Button, Table, Drawer, SimpleGrid, Box, Badge } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { HistoryItem } from '../../../types/type-history';

interface ThuocTinhDrawerChiTietLichSu {
    open: boolean;
    onClose: () => void;
    lichSuDuocChon: HistoryItem | null;
}

/**
 * Component Ngăn kéo hiển thị thông tin chi tiết lượt ra vào (DrawerChiTietLichSu).
 */
export const DrawerChiTietLichSu: React.FC<ThuocTinhDrawerChiTietLichSu> = ({
    open,
    onClose,
    lichSuDuocChon,
}) => {
    const t = useTranslations('History');

    // Nếu không có bản ghi nào được chọn thì không hiển thị gì
    if (!lichSuDuocChon) {
        return null;
    }

    return (
        <Drawer
            opened={open}
            onClose={onClose}
            title={<span className="drawer-title">{t('drawer.detailTitle')}</span>}
            position="right"
            size={600}
            styles={{
                header: {
                    borderBottom: '1px solid #f0f0f0',
                    padding: '16px 24px',
                    backgroundColor: '#fdfdfd',
                },
                body: {
                    padding: '24px',
                },
            }}
        >
            <div className="drawer-body">
                {/* Phần so sánh ảnh chân dung giữa hồ sơ và camera thực tế */}
                <SimpleGrid cols={2} spacing="md">
                    <Card
                        withBorder
                        radius="lg"
                        p="md"
                        className="portrait-card"
                    >
                        <span className="portrait-card-title">{t('drawer.portraitRecord')}</span>
                        <Image
                            src={lichSuDuocChon.duongDanAnhDaiDien || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250'}
                            alt="Hồ sơ"
                            radius="md"
                            style={{ objectFit: 'cover', maxHeight: '180px', margin: '0 auto' }}
                        />
                    </Card>

                    <Card
                        withBorder
                        radius="lg"
                        p="md"
                        className="portrait-card"
                    >
                        <span className="portrait-card-title">{t('drawer.portraitCamera')}</span>
                        <Image
                            src={lichSuDuocChon.duongDanAnhChup || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250'}
                            alt="Camera chụp"
                            radius="md"
                            style={{ objectFit: 'cover', maxHeight: '180px', margin: '0 auto' }}
                        />
                    </Card>
                </SimpleGrid>

                {/* Thông tin mô tả chi tiết của sự kiện ra vào */}
                <Card withBorder radius="lg" p="lg" className="details-table-card">
                    <h4 className="details-card-title">{t('card.detailTitle')}</h4>
                    <Table verticalSpacing="xs" striped highlightOnHover>
                        <Table.Tbody>
                            <Table.Tr>
                                <Table.Td style={{ fontWeight: 600, width: '180px' }} className="th-label">{t('filter.studentId')}</Table.Td>
                                <Table.Td className="td-mono-val">{lichSuDuocChon.mssv}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td style={{ fontWeight: 600 }} className="th-label">{t('table.fullName')}</Table.Td>
                                <Table.Td className="td-bold-val">{lichSuDuocChon.hoVaTen}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td style={{ fontWeight: 600 }} className="th-label">{t('drawer.dormLabel')}</Table.Td>
                                <Table.Td>{lichSuDuocChon.tenKtx}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td style={{ fontWeight: 600 }} className="th-label">{t('drawer.roomLabel')}</Table.Td>
                                <Table.Td>{lichSuDuocChon.tenPhong}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td style={{ fontWeight: 600 }} className="th-label">{t('drawer.eventLabel')}</Table.Td>
                                <Table.Td>
                                    {lichSuDuocChon.loai === 'IN' ? (
                                        <Badge color="green" radius="xl">{t('filter.in').toUpperCase()}</Badge>
                                    ) : (
                                        <Badge color="blue" radius="xl">{t('filter.out').toUpperCase()}</Badge>
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
                            <Table.Tr>
                                <Table.Td style={{ fontWeight: 600 }} className="th-label">{t('drawer.systemNoteLabel')}</Table.Td>
                                <Table.Td className="td-note">
                                    {lichSuDuocChon.ghiChu || t('drawer.noNotes')}
                                </Table.Td>
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </Card>

                {/* Nút đóng */}
                <Box style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                    <Button variant="outline" color="gray" onClick={onClose} className="btn-close">
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
    font-family: sans-serif;
}

.drawer-body {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    font-family: sans-serif;
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
    margin-bottom: 1rem;
    border-bottom: 1px solid #e4e4e7;
    padding-bottom: 0.5rem;
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

.td-note {
    color: #71717a;
    font-style: italic;
    font-size: 0.75rem;
}

.btn-close {
    border-radius: 0.5rem !important;
}
`;

export default DrawerChiTietLichSu;
