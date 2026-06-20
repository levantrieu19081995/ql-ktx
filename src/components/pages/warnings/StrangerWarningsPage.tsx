'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Card, Group, Text, Button, Select, Table, Avatar, Badge, Loader } from '@mantine/core';
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
import { dichVuLichSuRaVao, dichVuDanhMucKhu, KhuItem } from '../history/historyService';

export default function StrangerWarningsPage() {
    const t = useTranslations('History');
    const [dangTai, setDangTai] = useState(false);
    const [danhSachCanhBao, setDanhSachCanhBao] = useState<HistoryItem[]>([]);
    const [danhSachKhu, setDanhSachKhu] = useState<KhuItem[]>([]);
    const [dangLieu, datDangLieu] = useState<'GRID' | 'TABLE'>('GRID');

    const [boLoc, setBoLoc] = useState({
        tuNgay: '',
        denNgay: '',
        maKtx: '-1',
    });

    useEffect(() => {
        dichVuDanhMucKhu.layDanhSach().then(setDanhSachKhu);
        taiDuLieu();
    }, []);

    const optionsKhu = [
        { value: '-1', label: t('filter.all') },
        ...danhSachKhu.map((k) => ({ value: k.maKhu, label: k.tenKhu }))
    ];

    const taiDuLieu = async () => {
        setDangTai(true);
        try {
            const data = await dichVuLichSuRaVao.layDanhSachLichSu({
                tuNgay: boLoc.tuNgay,
                denNgay: boLoc.denNgay,
                maKtx: boLoc.maKtx === '-1' ? undefined : boLoc.maKtx,
            });

            // Lọc chỉ lấy người lạ
            const strangers = data.filter(
                (h) =>
                    h.loaiDoiTuong?.toLowerCase().includes('người lạ') ||
                    h.loaiDoiTuong?.toLowerCase().includes('nguoi la') ||
                    h.loaiDoiTuong?.toLowerCase().includes('stranger')
            );
            setDanhSachCanhBao(strangers);
        } catch (err) {
            console.error('Lỗi khi tải cảnh báo:', err);
        } finally {
            setDangTai(false);
        }
    };

    const datLaiBoLoc = () => {
        setBoLoc({
            tuNgay: '',
            denNgay: '',
            maKtx: '-1',
        });
    };

    // Auto load when filters change
    useEffect(() => {
        taiDuLieu();
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
                        color="red"
                        onClick={() => datDangLieu('GRID')}
                        className="view-toggle-btn"
                    >
                        <IconLayoutGrid size={16} style={{ marginRight: 6 }} /> Grid Feed
                    </Button>
                    <Button
                        variant={dangLieu === 'TABLE' ? 'filled' : 'outline'}
                        color="red"
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
                    <Button onClick={taiDuLieu} color="red" leftSection={<IconSearch size={15} />} className="btn-alert-search">
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
                    <Loader color="red" size="md" />
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
                        <Card key={banGhi.id} className="stranger-card" radius="lg" withBorder>
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
                                <Badge color="red" variant="filled" className="warning-badge">
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
                                <Table.Tr key={banGhi.id} className="table-tr">
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
                                        <Badge color="red" variant="light" size="md">
                                            {banGhi.tenKtx}
                                        </Badge>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
        </Box>
    );
}

const pageStyles = `
.stranger-page-container {
    padding: 1.5rem;
    min-height: 100vh;
    background-color: #fcfdff;
    font-family: var(--font-k2d), sans-serif;
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
    background-color: #fef2f2;
    border: 1px solid #fee2e2;
    color: #ef4444;
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
    animation: alertPulse 1.5s infinite;
}

.alert-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 800;
    color: #991b1b;
    letter-spacing: -0.02em;
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

@media (min-width: 768px) {
    .alert-filter-bar {
        flex-direction: row;
        align-items: flex-end;
    }
}

.filter-grid {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 1rem;
    width: 100%;
}

@media (min-width: 640px) {
    .filter-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
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
}

.filter-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: flex-end;
    flex-shrink: 0;
}

.btn-alert-search {
    height: 38px !important;
    background-color: #be123c !important;
    color: #ffffff !important;
    font-weight: 600 !important;
    border-radius: 0.5rem !important;
    padding-left: 1.5rem !important;
    padding-right: 1.5rem !important;
}

.btn-alert-search:hover {
    background-color: #9f1239 !important;
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
    box-shadow: 0 10px 15px -3px rgba(153, 27, 27, 0.05), 0 4px 6px -2px rgba(153, 27, 27, 0.03);
    border-color: #fca5a5;
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
    background-color: #fef2f2;
    color: #ef4444;
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
    background-color: #fef2f2;
}

.td-stt {
    font-weight: 600;
    color: #64748b;
}

.avatar-warning {
    border: 2px solid #fee2e2;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.td-highlight {
    font-weight: 700;
    color: #991b1b;
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
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
    }
}
`;
