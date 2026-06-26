'use client';

import React, { useState, useEffect } from 'react';
import { Box, Card, Tabs, Table, Select, TextInput, Button, Group, Text, Drawer, Stack, Loader, Badge, Avatar } from '@mantine/core';
import { IconCategory, IconBuilding, IconDoor, IconUsers, IconBan, IconSearch, IconRefresh } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import CustomPagination from '@/components/common/CustomPagination';
import { categoryService, SinhVienItem, PhongItem, KhuItem, SinhVienCamItem } from './categoryService';

export default function CategoryManagementPage() {
    const t = useTranslations('History');
    const [activeTab, setActiveTab] = useState<string>('KHU');
    const [dangTai, setDangTai] = useState<boolean>(false);

    // Lists and Pagination states
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [totalItems, setTotalItems] = useState<number>(0);

    const [danhSachKhu, setDanhSachKhu] = useState<KhuItem[]>([]);
    const [danhSachPhong, setDanhSachPhong] = useState<PhongItem[]>([]);
    const [danhSachSinhVien, setDanhSachSinhVien] = useState<SinhVienItem[]>([]);
    const [danhSachSinhVienCam, setDanhSachSinhVienCam] = useState<SinhVienCamItem[]>([]);

    // Details Drawer states
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // Filters options
    const [optionsKhu, setOptionsKhu] = useState<{ value: string; label: string }[]>([]);
    const [optionsPhong, setOptionsPhong] = useState<{ value: string; label: string }[]>([]);

    // Filters states
    const [maKhuFilter, setMaKhuFilter] = useState<string>('-1');
    const [maPhongFilter, setMaPhongFilter] = useState<string>('-1');
    const [maSinhVienFilter, setMaSinhVienFilter] = useState<string>('');

    // Load filter options (Khu and Phong list)
    useEffect(() => {
        const taiDanhMucBoLoc = async () => {
            const zonesRes = await categoryService.layDanhSachKhu({ page: 1, pageSize: 1000, maKhu: '-1' });
            setOptionsKhu([
                { value: '-1', label: 'Tất cả Khu' },
                ...zonesRes.items.map(z => ({ value: z.khuMa, label: z.khuTen }))
            ]);

            const roomsRes = await categoryService.layDanhSachPhong({ page: 1, pageSize: 1000, maKhu: '-1', maPhong: '-1' });
            setOptionsPhong([
                { value: '-1', label: 'Tất cả Phòng' },
                ...roomsRes.items.map(r => ({ value: r.phongMa, label: r.phongMa }))
            ]);
        };
        taiDanhMucBoLoc();
    }, []);

    // Load list data based on active tab, page, pageSize, and filters
    const taiDuLieu = async () => {
        setDangTai(true);
        try {
            if (activeTab === 'KHU') {
                const res = await categoryService.layDanhSachKhu({
                    page,
                    pageSize,
                    maKhu: maKhuFilter
                });
                setDanhSachKhu(res.items);
                setTotalItems(res.totalElements);
            } else if (activeTab === 'PHONG') {
                const res = await categoryService.layDanhSachPhong({
                    page,
                    pageSize,
                    maKhu: maKhuFilter,
                    maPhong: maPhongFilter
                });
                setDanhSachPhong(res.items);
                setTotalItems(res.totalElements);
            } else if (activeTab === 'SINH_VIEN') {
                const res = await categoryService.layDanhSachSinhVien({
                    page,
                    pageSize,
                    maKhu: maKhuFilter,
                    maPhong: maPhongFilter
                });
                setDanhSachSinhVien(res.items);
                setTotalItems(res.totalElements);
            } else if (activeTab === 'CAM') {
                const res = await categoryService.layDanhSachSinhVienCam({
                    page,
                    pageSize,
                    maSinhVien: maSinhVienFilter || '-1'
                });
                setDanhSachSinhVienCam(res.items);
                setTotalItems(res.totalElements);
            }
        } catch (err) {
            console.error('Lỗi khi tải danh mục:', err);
        } finally {
            setDangTai(false);
        }
    };

    // Reload when tab, page, or pageSize changes
    useEffect(() => {
        taiDuLieu();
    }, [activeTab, page, pageSize]);

    // Reset pagination when filters change and trigger fetch
    const xuLyTimKiem = () => {
        setPage(1);
        taiDuLieu();
    };

    const datLaiBoLoc = () => {
        setMaKhuFilter('-1');
        setMaPhongFilter('-1');
        setMaSinhVienFilter('');
        setPage(1);
    };

    return (
        <Box p="lg" style={{ fontFamily: 'var(--font-readex-pro), sans-serif' }}>
            {/* Header */}
            <Group mb="lg" gap="xs">
                <IconCategory size={28} color="#1f5ca9" />
                <Box>
                    <h2 style={{ margin: 0, fontSize: 20, color: '#1f5ca9', fontWeight: 800 }}>
                        QUẢN LÝ DANH MỤC HỆ THỐNG KÝ TÚC XÁ
                    </h2>
                    <Text size="xs" c="dimmed">
                        Quản lý chi tiết danh mục khu, phòng, sinh viên và danh sách sinh viên bị cấm
                    </Text>
                </Box>
            </Group>

            <Card withBorder radius="md" p="md" shadow="sm">
                <Tabs value={activeTab} onChange={(val) => {
                    setActiveTab(val || 'KHU');
                    setPage(1);
                    setSelectedItem(null);
                    datLaiBoLoc();
                }}>
                    <Tabs.List mb="md">
                        <Tabs.Tab value="KHU" leftSection={<IconBuilding size={16} />}>Khu KTX</Tabs.Tab>
                        <Tabs.Tab value="PHONG" leftSection={<IconDoor size={16} />}>Phòng KTX</Tabs.Tab>
                        <Tabs.Tab value="SINH_VIEN" leftSection={<IconUsers size={16} />}>Sinh viên KTX</Tabs.Tab>
                        <Tabs.Tab value="CAM" leftSection={<IconBan size={16} />}>Sinh viên bị cấm</Tabs.Tab>
                    </Tabs.List>

                    {/* Filter bar */}
                    <Box mb="md" p="sm" style={{ backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <Group align="flex-end" gap="sm">
                            {activeTab !== 'CAM' && (
                                <Select
                                    label="KHU KTX"
                                    value={maKhuFilter}
                                    onChange={(val) => setMaKhuFilter(val || '-1')}
                                    data={optionsKhu}
                                    w={180}
                                    size="sm"
                                />
                            )}

                            {(activeTab === 'PHONG' || activeTab === 'SINH_VIEN') && (
                                <Select
                                    label="PHÒNG"
                                    value={maPhongFilter}
                                    onChange={(val) => setMaPhongFilter(val || '-1')}
                                    data={optionsPhong}
                                    w={180}
                                    size="sm"
                                />
                            )}

                            {activeTab === 'CAM' && (
                                <TextInput
                                    label="MÃ SINH VIÊN"
                                    placeholder="Nhập mã sinh viên..."
                                    value={maSinhVienFilter}
                                    onChange={(e) => setMaSinhVienFilter(e.target.value)}
                                    w={220}
                                    size="sm"
                                />
                            )}

                            <Button color="blue" leftSection={<IconSearch size={15} />} onClick={xuLyTimKiem} size="sm">
                                Tìm kiếm
                            </Button>
                            <Button variant="subtle" color="gray" onClick={datLaiBoLoc} leftSection={<IconRefresh size={15} />} size="sm">
                                Làm mới
                            </Button>
                        </Group>
                    </Box>

                    {/* Data Display */}
                    {dangTai ? (
                        <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                            <Loader color="blue" size="md" />
                            <Text size="sm" c="dimmed" mt="xs">Đang tải dữ liệu danh mục...</Text>
                        </Box>
                    ) : (
                        <Box style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                                <Table.Thead style={{ backgroundColor: '#f8fafc' }}>
                                    {activeTab === 'KHU' && (
                                        <Table.Tr>
                                            <Table.Th style={{ width: 60, textAlign: 'center' }}>STT</Table.Th>
                                            <Table.Th>Mã khu</Table.Th>
                                            <Table.Th>Tên khu</Table.Th>
                                            <Table.Th style={{ textAlign: 'center' }}>Số lượng phòng</Table.Th>
                                            <Table.Th>Mô tả</Table.Th>
                                        </Table.Tr>
                                    )}
                                    {activeTab === 'PHONG' && (
                                        <Table.Tr>
                                            <Table.Th style={{ width: 60, textAlign: 'center' }}>STT</Table.Th>
                                            <Table.Th>Khu</Table.Th>
                                            <Table.Th>Mã phòng</Table.Th>
                                            <Table.Th style={{ textAlign: 'center' }}>Sức chứa</Table.Th>
                                            <Table.Th style={{ textAlign: 'center' }}>Số chỗ đang có</Table.Th>
                                        </Table.Tr>
                                    )}
                                    {activeTab === 'SINH_VIEN' && (
                                        <Table.Tr>
                                            <Table.Th style={{ width: 60, textAlign: 'center' }}>STT</Table.Th>
                                            <Table.Th>Khu</Table.Th>
                                            <Table.Th>Phòng</Table.Th>
                                            <Table.Th>Mã sinh viên</Table.Th>
                                            <Table.Th>Họ tên</Table.Th>
                                            <Table.Th>Lớp</Table.Th>
                                        </Table.Tr>
                                    )}
                                    {activeTab === 'CAM' && (
                                        <Table.Tr>
                                            <Table.Th style={{ width: 60, textAlign: 'center' }}>STT</Table.Th>
                                            <Table.Th>Mã sinh viên</Table.Th>
                                            <Table.Th>Lý do cấm</Table.Th>
                                            <Table.Th>Ngày bắt đầu</Table.Th>
                                            <Table.Th>Ngày kết thúc</Table.Th>
                                        </Table.Tr>
                                    )}
                                </Table.Thead>
                                <Table.Tbody>
                                    {activeTab === 'KHU' && danhSachKhu.map((item, index) => (
                                        <Table.Tr key={item.khuId} onClick={() => setSelectedItem({ type: 'KHU', data: item })} style={{ cursor: 'pointer' }}>
                                            <Table.Td style={{ textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{(page - 1) * pageSize + index + 1}</Table.Td>
                                            <Table.Td style={{ fontWeight: 700, color: '#1f5ca9' }}>{item.khuMa}</Table.Td>
                                            <Table.Td style={{ fontWeight: 600 }}>{item.khuTen}</Table.Td>
                                            <Table.Td style={{ textAlign: 'center', fontWeight: 700 }}>{item.soLuongPhong}</Table.Td>
                                            <Table.Td c="dimmed">{item.moTa || 'Không có mô tả'}</Table.Td>
                                        </Table.Tr>
                                    ))}

                                    {activeTab === 'PHONG' && danhSachPhong.map((item, index) => (
                                        <Table.Tr key={item.phongId} onClick={() => setSelectedItem({ type: 'PHONG', data: item })} style={{ cursor: 'pointer' }}>
                                            <Table.Td style={{ textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{(page - 1) * pageSize + index + 1}</Table.Td>
                                            <Table.Td style={{ fontWeight: 600 }}>{item.tenKhu || `Khu ${item.maKhu}`}</Table.Td>
                                            <Table.Td style={{ fontWeight: 700, color: '#0f766e' }}>{item.phongMa}</Table.Td>
                                            <Table.Td style={{ textAlign: 'center', fontWeight: 600 }}>{item.sucChua}</Table.Td>
                                            <Table.Td style={{ textAlign: 'center', fontWeight: 600 }}>
                                                <Badge color={Number(item.soChoDangCo) === 0 ? 'red' : 'teal'} variant="light">
                                                    {item.soChoDangCo}
                                                </Badge>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}

                                    {activeTab === 'SINH_VIEN' && danhSachSinhVien.map((item, index) => (
                                        <Table.Tr key={item.sinhVienId} onClick={() => setSelectedItem({ type: 'SINH_VIEN', data: item })} style={{ cursor: 'pointer' }}>
                                            <Table.Td style={{ textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{(page - 1) * pageSize + index + 1}</Table.Td>
                                            <Table.Td style={{ fontWeight: 600 }}>{item.tenKhu || `Khu ${item.maKhu}`}</Table.Td>
                                            <Table.Td style={{ fontWeight: 600 }}>{item.maPhong}</Table.Td>
                                            <Table.Td style={{ fontWeight: 700, color: '#2563eb' }}>{item.maSinhVien}</Table.Td>
                                            <Table.Td style={{ fontWeight: 700 }}>{item.hoTen}</Table.Td>
                                            <Table.Td>{item.lop}</Table.Td>
                                        </Table.Tr>
                                    ))}

                                    {activeTab === 'CAM' && danhSachSinhVienCam.map((item, index) => (
                                        <Table.Tr key={item.camId} onClick={() => setSelectedItem({ type: 'CAM', data: item })} style={{ cursor: 'pointer' }}>
                                            <Table.Td style={{ textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{(page - 1) * pageSize + index + 1}</Table.Td>
                                            <Table.Td style={{ fontWeight: 700, color: '#dc2626' }}>{item.maSinhVien}</Table.Td>
                                            <Table.Td style={{ fontWeight: 600 }}>{item.lyDo}</Table.Td>
                                            <Table.Td>{item.ngayBatDau ? dayjs(item.ngayBatDau).format('DD/MM/YYYY') : 'N/A'}</Table.Td>
                                            <Table.Td>{item.ngayKetThuc ? dayjs(item.ngayKetThuc).format('DD/MM/YYYY') : 'Vô thời hạn'}</Table.Td>
                                        </Table.Tr>
                                    ))}

                                    {totalItems === 0 && (
                                        <Table.Tr>
                                            <Table.Td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>
                                                Không tìm thấy dữ liệu nào phù hợp.
                                            </Table.Td>
                                        </Table.Tr>
                                    )}
                                </Table.Tbody>
                            </Table>
                        </Box>
                    )}

                    {/* Pagination */}
                    <Box mt="md" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <CustomPagination
                            totalItems={totalItems}
                            page={page}
                            pageSize={pageSize}
                            setPage={setPage}
                            setPageSize={setPageSize}
                        />
                    </Box>
                    </Tabs>
                </Card>

            {/* DETAILS DRAWER */}
            <Drawer
                opened={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                title={
                    <span style={{ fontWeight: 800, fontSize: 16, color: '#1f5ca9', textTransform: 'uppercase' }}>
                        {selectedItem?.type === 'KHU' && 'CHI TIẾT KHU KÝ TÚC XÁ'}
                        {selectedItem?.type === 'PHONG' && 'CHI TIẾT PHÒNG KÝ TÚC XÁ'}
                        {selectedItem?.type === 'SINH_VIEN' && 'CHI TIẾT SINH VIÊN KÝ TÚC XÁ'}
                        {selectedItem?.type === 'CAM' && 'CHI TIẾT SINH VIÊN BỊ CẤM'}
                    </span>
                }
                position="right"
                size={400}
            >
                {selectedItem && (
                    <Stack gap="md" p="xs">
                        {/* Avatar / Icon Placeholder */}
                        <Box
                            style={{
                                width: '100%',
                                height: 180,
                                borderRadius: 8,
                                border: '1px solid #e2e8f0',
                                backgroundColor: '#f8fafc',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            {(selectedItem.type === 'SINH_VIEN' || selectedItem.type === 'CAM') ? (
                                <Avatar
                                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${selectedItem.data.maSinhVien}`}
                                    size={120}
                                    radius="100%"
                                />
                            ) : selectedItem.type === 'KHU' ? (
                                <IconBuilding size={80} color="#1f5ca9" />
                            ) : (
                                <IconDoor size={80} color="#0f766e" />
                            )}
                        </Box>

                        {/* Details rows based on type */}
                        <Stack gap="xs" mt="sm">
                            {selectedItem.type === 'KHU' && (
                                <>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                                        <Text size="sm" c="dimmed" fw={600}>MÃ KHU</Text>
                                        <Text size="sm" fw={700} color="blue">{selectedItem.data.khuMa}</Text>
                                    </Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                                        <Text size="sm" c="dimmed" fw={600}>TÊN KHU</Text>
                                        <Text size="sm" fw={700}>{selectedItem.data.khuTen}</Text>
                                    </Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                                        <Text size="sm" c="dimmed" fw={600}>SỐ LƯỢNG PHÒNG</Text>
                                        <Text size="sm" fw={700}>{selectedItem.data.soLuongPhong}</Text>
                                    </Box>
                                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        <Text size="sm" c="dimmed" fw={600}>MÔ TẢ</Text>
                                        <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{selectedItem.data.moTa || 'Không có mô tả chi tiết.'}</Text>
                                    </Box>
                                </>
                            )}

                            {selectedItem.type === 'PHONG' && (
                                <>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                                        <Text size="sm" c="dimmed" fw={600}>MÃ PHÒNG</Text>
                                        <Text size="sm" fw={700} color="teal">{selectedItem.data.phongMa}</Text>
                                    </Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                                        <Text size="sm" c="dimmed" fw={600}>THUỘC KHU</Text>
                                        <Text size="sm" fw={700}>{selectedItem.data.tenKtx || `Khu ${selectedItem.data.maKhu}`}</Text>
                                    </Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                                        <Text size="sm" c="dimmed" fw={600}>SỨC CHỨA</Text>
                                        <Text size="sm" fw={700}>{selectedItem.data.sucChua} Sinh viên</Text>
                                    </Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                                        <Text size="sm" c="dimmed" fw={600}>SỐ CHỖ CÒN LẠI</Text>
                                        <Text size="sm" fw={700}>{selectedItem.data.soChoDangCo}</Text>
                                    </Box>
                                </>
                            )}

                            {selectedItem.type === 'SINH_VIEN' && (
                                <>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                                        <Text size="sm" c="dimmed" fw={600}>MÃ SINH VIÊN</Text>
                                        <Text size="sm" fw={700} color="blue">{selectedItem.data.maSinhVien}</Text>
                                    </Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                                        <Text size="sm" c="dimmed" fw={600}>HỌ VÀ TÊN</Text>
                                        <Text size="sm" fw={700}>{selectedItem.data.hoTen}</Text>
                                    </Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                                        <Text size="sm" c="dimmed" fw={600}>LỚP</Text>
                                        <Text size="sm" fw={700}>{selectedItem.data.lop}</Text>
                                    </Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                                        <Text size="sm" c="dimmed" fw={600}>KHU KÝ TÚC XÁ</Text>
                                        <Text size="sm" fw={700}>{selectedItem.data.tenKhu || `Khu ${selectedItem.data.maKhu}`}</Text>
                                    </Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                                        <Text size="sm" c="dimmed" fw={600}>PHÒNG Ở</Text>
                                        <Text size="sm" fw={700}>{selectedItem.data.maPhong}</Text>
                                    </Box>
                                </>
                            )}

                            {selectedItem.type === 'CAM' && (
                                <>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                                        <Text size="sm" c="dimmed" fw={600}>MÃ SINH VIÊN</Text>
                                        <Text size="sm" fw={700} color="red">{selectedItem.data.maSinhVien}</Text>
                                    </Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                                        <Text size="sm" c="dimmed" fw={600}>NGÀY BẮT ĐẦU CẤM</Text>
                                        <Text size="sm" fw={700}>
                                            {selectedItem.data.ngayBatDau ? dayjs(selectedItem.data.ngayBatDau).format('DD/MM/YYYY HH:mm:ss') : 'N/A'}
                                        </Text>
                                    </Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                                        <Text size="sm" c="dimmed" fw={600}>NGÀY KẾT THÚC CẤM</Text>
                                        <Text size="sm" fw={700}>
                                            {selectedItem.data.ngayKetThuc ? dayjs(selectedItem.data.ngayKetThuc).format('DD/MM/YYYY HH:mm:ss') : 'Vô thời hạn'}
                                        </Text>
                                    </Box>
                                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        <Text size="sm" c="dimmed" fw={600}>LÝ DO CẤM</Text>
                                        <Text size="sm" style={{ fontWeight: 600, color: '#dc2626' }}>{selectedItem.data.lyDo}</Text>
                                    </Box>
                                </>
                            )}
                        </Stack>

                        <Button
                            color="blue"
                            onClick={() => setSelectedItem(null)}
                            mt="md"
                            fullWidth
                        >
                            Đóng
                        </Button>
                    </Stack>
                )}
            </Drawer>
        </Box>
    );
}
