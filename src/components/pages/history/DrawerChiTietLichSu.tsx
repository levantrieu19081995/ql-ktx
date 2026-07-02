<<<<<<< Updated upstream
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
=======
'use client';

import React from 'react';
import { Card, Image, Button, Drawer, Box, Badge } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { IconAlertTriangle } from '@tabler/icons-react';
import { HistoryItem } from '../../../types/type-history';

interface ThuocTinhDrawerChiTietLichSu {
    open: boolean;
    onClose: () => void;
    lichSuDuocChon: HistoryItem | null;
    isStranger?: boolean;
    khiPhanHoi?: (item: HistoryItem) => void;
}

/**
 * Component Ngăn kéo hiển thị thông tin chi tiết lượt ra vào (DrawerChiTietLichSu).
 */
export const DrawerChiTietLichSu: React.FC<ThuocTinhDrawerChiTietLichSu> = ({
    open,
    onClose,
    lichSuDuocChon,
    isStranger = false,
    khiPhanHoi,
}) => {
    const t = useTranslations('History');

    // Nếu không có bản ghi nào được chọn thì không hiển thị gì
    if (!lichSuDuocChon) {
        return null;
    }

    const laCanBo = lichSuDuocChon.loaiDoiTuong?.toLowerCase().includes("cán bộ") ||
                    lichSuDuocChon.loaiDoiTuong?.toLowerCase().includes("can bo");

    return (
        <Drawer
            opened={open}
            onClose={onClose}
            title={<span className="drawer-title">{isStranger ? t('drawer.detailTitleStranger') : t('drawer.detailTitle')}</span>}
            position="right"
            size={600}
            styles={{
                header: {
                    borderBottom: '1px solid #f0f0f0',
                    padding: '12px 20px',
                    backgroundColor: '#fdfdfd',
                },
                body: {
                    padding: '16px 20px',
                    overflow: 'hidden',
                },
            }}
        >
            <div className="drawer-body">
                {/* Chỉ hiển thị ảnh chụp từ camera thực tế */}
                <Card
                    withBorder
                    radius="lg"
                    p={0}
                    className="portrait-card-wrapper"
                >
                    <img
                        src={lichSuDuocChon.duongDanAnhChup || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250'}
                        alt="Camera chụp"
                        className="portrait-img-main"
                    />
                </Card>

                {/* Thông tin mô tả chi tiết của sự kiện ra vào dưới dạng lưới 2 cột */}
                <Card withBorder radius="lg" p="sm" className="details-table-card">
                    <h4 className="details-card-title">{t('card.detailTitle')}</h4>
                    <div className="details-grid">
                        {isStranger ? (
                            <>
                                <div className="details-item">
                                    <span className="details-label">{t('filter.studentId')}</span>
                                    <span className="details-val td-mono-val">{lichSuDuocChon.mssv || 'N/A'}</span>
                                </div>
                                <div className="details-item">
                                    <span className="details-label">LOẠI ĐỐI TƯỢNG</span>
                                    <span className="details-val td-bold-val">{lichSuDuocChon.loaiDoiTuong || 'N/A'}</span>
                                </div>
                                <div className="details-item">
                                    <span className="details-label">THỜI GIAN KIỂM TRA</span>
                                    <span className="details-val">{lichSuDuocChon.thoiGian || 'N/A'}</span>
                                </div>
                                <div className="details-item">
                                    <span className="details-label">NGÀY PHÁT HIỆN</span>
                                    <span className="details-val">{lichSuDuocChon.ngayNguoiLa || 'N/A'}</span>
                                </div>
                                <div className="details-item">
                                    <span className="details-label">GIỜ PHÁT HIỆN</span>
                                    <span className="details-val">{lichSuDuocChon.gioNguoiLa || 'N/A'}</span>
                                </div>
                                <div className="details-item">
                                    <span className="details-label">KHU KTX PHÁT HIỆN</span>
                                    <span className="details-val">{lichSuDuocChon.tenKtx || 'N/A'}</span>
                                </div>
                                <div className="details-item">
                                    <span className="details-label">THIẾT BỊ / CAMERA</span>
                                    <span className="details-val">{lichSuDuocChon.thietBi || 'N/A'}</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="details-item">
                                    <span className="details-label">{t('filter.studentId')}</span>
                                    <span className="details-val td-mono-val">{lichSuDuocChon.mssv || 'N/A'}</span>
                                </div>
                                <div className="details-item">
                                    <span className="details-label">{t('table.fullName')}</span>
                                    <span className="details-val td-bold-val">{lichSuDuocChon.hoVaTen}</span>
                                </div>
                                <div className="details-item">
                                    <span className="details-label">{t('table.time')}</span>
                                    <span className="details-val">{lichSuDuocChon.thoiGian}</span>
                                </div>
                                <div className="details-item">
                                    <span className="details-label">{t('drawer.dormLabel')}</span>
                                    <span className="details-val">{lichSuDuocChon.tenKtx || 'N/A'}</span>
                                </div>
                                <div className="details-item">
                                    <span className="details-label">
                                        {laCanBo ? t('table.unit') : t('drawer.roomLabel')}
                                    </span>
                                    <span className="details-val">{lichSuDuocChon.tenPhong || 'N/A'}</span>
                                </div>
                                <div className="details-item">
                                    <span className="details-label">{t('drawer.eventLabel')}</span>
                                    <div className="details-val">
                                        {lichSuDuocChon.loai === 'IN' ? (
                                            <Badge color="green" radius="xl" size="sm">{t('filter.in').toUpperCase()}</Badge>
                                        ) : (
                                            <Badge color="blue" radius="xl" size="sm">{t('filter.out').toUpperCase()}</Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="details-item">
                                    <span className="details-label">{t('drawer.deviceLabel')}</span>
                                    <span className="details-val">{lichSuDuocChon.thietBi || 'N/A'}</span>
                                </div>
                            </>
                        )}
                    </div>
                </Card>

                {/* Nút phản hồi và nút đóng */}
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '25px', width: '100%' }}>
                    {!isStranger && khiPhanHoi ? (
                        <Button
                            variant="light"
                            color="red"
                            leftSection={<IconAlertTriangle size={15} />}
                            onClick={() => khiPhanHoi(lichSuDuocChon)}
                            className="btn-feedback"
                            size="sm"
                        >
                            {t('card.feedbackBtn')}
                        </Button>
                    ) : (
                        <div />
                    )}
                    <Button variant="outline" color="gray" onClick={onClose} className="btn-close" size="sm">
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
    gap: 0.625rem;
    font-family: sans-serif;
    max-height: calc(100vh - 90px);
    overflow-y: auto;
    padding-right: 6px;
}

.portrait-card-wrapper {
    overflow: hidden !important;
    border-color: #e4e4e7 !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    background-color: rgba(244, 244, 245, 0.5) !important;
    width: 240px !important;
    height: 240px !important;
    margin: 25px auto 0 auto !important;
}

.portrait-img-main {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
}

.details-table-card {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
    border-color: #e4e4e7 !important;
    padding: 10px !important;
    margin-top: 25px !important;
}

.details-card-title {
    font-size: 0.825rem;
    font-weight: bold;
    color: #3f3f46;
    margin-top: 0;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid #e4e4e7;
    padding-bottom: 0.25rem;
}

.details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.375rem 1rem;
}

.details-item {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
}

.details-label {
    font-size: 9px;
    font-weight: bold;
    color: #71717a;
    text-transform: uppercase;
    letter-spacing: 0.025em;
}

.details-val {
    font-size: 0.825rem;
    color: #18181b;
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
}

.btn-close {
    border-radius: 0.5rem !important;
}

.btn-feedback {
    border-radius: 0.5rem !important;
}
`;

export default DrawerChiTietLichSu;
>>>>>>> Stashed changes
