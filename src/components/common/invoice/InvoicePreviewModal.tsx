/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { showNoti } from "@/components/common/showNoti";
import { fetchMauHoaDonList } from "@/services/danh-muc/dmMauHoaDon";
// import { flushInvoice, postPublic } from "@/services/hoa-don/hoaDonService";
import { MauHoaDonItem } from "@/types/type-mau-hoa-don";
import {
  Modal,
  Grid,
  Card,
  Title,
  Flex,
  Text,
  Divider,
  Button,
  Table,
  Group,
  ScrollArea,
  ThemeIcon,
  Box,
} from "@mantine/core";
import { useEffect, useState } from "react";

interface InvoicePreviewModalProps {
  selectedRows?: any;
  opened: boolean;
  onClose: () => void;
  invoiceData: any;
  loading?: boolean;
  invoiceParams?: { hsId: number; pdvId: number[] } | null;
  onRefresh?: () => Promise<void>;
}

export default function InvoicePreviewModal({
  selectedRows,
  opened,
  onClose,
  invoiceData,
  loading = false,
  invoiceParams,
  onRefresh,
}: InvoicePreviewModalProps) {
  const danhSachHoaDon = invoiceData?.danhSach?.danhSachHoaDon || [];
  const [publishing, setPublishing] = useState(false);

  const hoaDon = danhSachHoaDon?.[0] || {}; // hóa đơn đầu tiên
  const thongTinChiTiet = hoaDon?.thongTinChiTiet || {};
  const thongTin = thongTinChiTiet?.noiDung || {};

  const nguoiBan = thongTin?.nguoiBan || {};
  const nguoiMua = thongTin?.nguoiMua || {};
  const thongTinChung = thongTinChiTiet?.thongTinChung || {};
  const danhSachSP = thongTin?.danhSachSanPham?.danhSach || [];
  const thanhToan = thongTin?.thanhToan || {};

  const [listMauHoaDon, setListMauHoaDon] = useState<MauHoaDonItem[]>([]);
  const [loadingMau, setLoadingMau] = useState<boolean>(false);
  const [selectedMau, setSelectedMau] = useState<string>("");
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const [isPublished, setIsPublished] = useState(false);

  const [tenNguoiMua, setTenNguoiMua] = useState<string>("");
  const [maSoThueNguoiMua, setMaSoThueNguoiMua] = useState<string>("");
  const [diaChiNguoiMua, setDiaChiNguoiMua] = useState<string>("");
  const [maDonViQHNS, setMaDonViQHNS] = useState<string>("");

  const [editableDanhSachSP, setEditableDanhSachSP] = useState<any[]>([]);

  const handlePublishInvoice = async () => {
    if (!selectedMau) {
      showNoti("warning", "Vui lòng chọn biểu mẫu hoá đơn!");
      return;
    }

    if (publishing) return; //   chặn double click

    try {
      setPublishing(true); //   START LOADING
      const danhSachHoaDon = invoiceData?.danhSach?.danhSachHoaDon || [];
      if (danhSachHoaDon.length === 0) {
        showNoti("warning", "Không có dữ liệu hoá đơn để xuất!");
        return;
      }

      const mauSelected = listMauHoaDon.find(
        (mau) => String(mau.mauHoadonId) === String(selectedMau),
      );
      if (!mauSelected) {
        showNoti("warning", "Không tìm thấy thông tin mẫu hoá đơn đã chọn!");
        return;
      }

      const hoaDon = danhSachHoaDon[0];
      const thongTinChiTiet = hoaDon?.thongTinChiTiet || {};

      const payload = {
        hsId: invoiceParams?.hsId || 0,
        pdvId: invoiceParams?.pdvId || [],
        danhSach: {
          danhSachHoaDon: [
            {
              thongTinChiTiet: {
                thongTinChung: thongTinChiTiet.thongTinChung,
                // noiDung: thongTinChiTiet.noiDung,
                noiDung: {
                  ...thongTinChiTiet.noiDung,
                  nguoiMua: {
                    ...(thongTinChiTiet.noiDung?.nguoiMua || {}),
                    ten: String(tenNguoiMua || ""),
                    maSoThue: String(maSoThueNguoiMua || ""),
                    diaChi: String(diaChiNguoiMua || ""),
                    maDonViQHNS: String(maDonViQHNS || ""),
                  },
                  danhSachSanPham: {
                    ...(thongTinChiTiet.noiDung?.danhSachSanPham || {}),
                    danhSach: editableDanhSachSP, //   lấy list user đã sửa
                  },
                },
              },
              fkey: hoaDon?.fkey || "",
            },
          ],
        },
        mauHoaDonKyHieu: mauSelected.mauHoadonKyhieu,
        mauHoaDonMauSo: mauSelected.mauHoadonMauso,
      };

      // const res = await postPublic(payload);
      // const res = await postPublic(payload);
      // if (res?.status === "OK" && res?.payload) {
      //   const { message, pattern, serial, publishedInvoices } = res.payload;
      //   const invoiceNumber = publishedInvoices?.[0]?.invoiceNumber || "—";

      //   showNoti(
      //     "success",
      //     `${message} — Số: ${invoiceNumber}, Mẫu: ${pattern}, Ký hiệu: ${serial}`,
      //   );

      //   //  Đánh dấu đã xuất thành công
      //   setIsPublished(true);

      //   if (onRefresh) await onRefresh();
      // } else {
      //   showNoti("warning", res?.message || "Không thể xuất hoá đơn.");
      //   setIsPublished(false);
      // }
    } catch (err) {
      console.error("Lỗi xuất hoá đơn:", err);
      showNoti("error", "Không thể kết nối tới máy chủ xuất hoá đơn.");
      setIsPublished(false);
    } finally {
      setPublishing(false); //   STOP LOADING
    }
  };

  const handleCloseInvoice = async () => {
    try {
      //  Nếu hóa đơn đã xuất thành công → chỉ đóng popup
      if (isPublished) {
        showNoti(
          "success",
          "Hóa đơn đã xuất thành công. Đóng cửa sổ xem trước.",
        );
        onClose();
        return;
      }

      //  Nếu chưa xuất → tiếp tục kiểm tra transactionId
      if (!transactionId) {
        showNoti("info", "Không tìm thấy hóa đơn tạm để xóa.");
        onClose();
        return;
      }

      // const res = await flushInvoice(Number(transactionId));
      // if (res?.status === "OK") {
      //   showNoti(
      //     "success",
      //     `Đã xóa hóa đơn tạm (transactionId: ${transactionId})`,
      //   );
      // } else {
      //   showNoti("warning", "Không thể xóa hóa đơn tạm.");
      // }
    } catch (error) {
      showNoti("error", "Lỗi khi gọi API flush invoice.");
      console.error(error);
    } finally {
      onClose();
    }
  };

  useEffect(() => {
    const loadMauHoaDon = async () => {
      setLoadingMau(true);
      try {
        const res = await fetchMauHoaDonList({
          page: 1,
          pageSize: 1000,
          keyWord: "*",
        });
        setListMauHoaDon(res?.payload?.items || []);
      } catch (err) {
        console.error("-----------------> Lỗi tải danh sách mẫu hoá đơn:", err);
      } finally {
        setLoadingMau(false);
      }
    };

    if (opened) loadMauHoaDon();
  }, [opened]);

  useEffect(() => {
    if (listMauHoaDon.length > 0 && !selectedMau) {
      setSelectedMau(String(listMauHoaDon[0].mauHoadonId));
    }
  }, [listMauHoaDon]);

  useEffect(() => {
    if (invoiceData?.transactionId) {
      setTransactionId(invoiceData.transactionId);
    }
  }, [invoiceData]);

  useEffect(() => {
    if (opened) setIsPublished(false);
  }, [opened]);

  useEffect(() => {
    if (opened) {
      setMaDonViQHNS(String(nguoiMua?.maDonViQHNS || ""));
      setTenNguoiMua(String(nguoiMua?.ten || ""));
      setMaSoThueNguoiMua(String(nguoiMua?.maSoThue || ""));
      setDiaChiNguoiMua(String(nguoiMua?.diaChi || ""));
      //
      setEditableDanhSachSP(Array.isArray(danhSachSP) ? danhSachSP : []);
    }
  }, [opened, invoiceData]);

  return (
    <Modal
      opened={opened}
      // onClose={onClose}
      onClose={handleCloseInvoice}
      title={
        <Box>
          <Title
            order={4}
            ta="center"
            c="#1047a7ff"
            style={{
              fontWeight: 700,
              letterSpacing: "0.3px",
            }}
            component="div"
          >
            Xem trước thông tin hóa đơn
          </Title>
        </Box>
      }
      size="70%"
      centered
      transitionProps={{
        transition: "pop",
        duration: 200,
        timingFunction: "ease",
      }}
      closeOnClickOutside={false}
      closeOnEscape={false}
      styles={{
        content: {
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.3))",
          backdropFilter: "blur(18px) saturate(180%)",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.35)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
          color: "#222",
          padding: 0,
          maxWidth: "900px",
          overflow: "hidden",
        },
        header: {
          background: "rgba(255, 255, 255, 0)",
          marginBottom: 0,
          padding: "20px 24px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.3)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        },
        body: {
          padding: 0,
        },
        close: { color: "#444" },
      }}
    >
      <ScrollArea
        style={{
          height: "calc(90vh - 225px)",
          padding: "24px 28px",
        }}
        scrollbarSize={0}
        styles={{
          viewport: {
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
          },
        }}
      >
        {loading ? (
          <Text ta="center" c="dimmed">
            Đang tải thông tin hóa đơn...
          </Text>
        ) : (
          <Grid gutter="md">
            {/* --- Người mua --- */}
            <Grid.Col span={12}>
              <Card shadow="md" padding="md" radius="lg" withBorder>
                <Title order={5}>Người mua</Title>
                <Flex direction="column" gap={4} mt={4}>
                  <Flex justify="space-between" align="center">
                    <Text size="sm">Tên:</Text>
                    <input
                      value={tenNguoiMua}
                      onChange={(e) => setTenNguoiMua(e.target.value)}
                      placeholder="Nhập tên người mua"
                      style={{
                        width: 420,
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: "1px solid #d0d0d0",
                        outline: "none",
                        fontSize: "0.9rem",
                        textAlign: "right",
                      }}
                    />
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Text size="sm">Mã số thuế:</Text>
                    <input
                      value={maSoThueNguoiMua}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const onlyNumber = raw.replace(/\D/g, "");
                        setMaSoThueNguoiMua(onlyNumber);
                      }}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={14} // MST VN thường 10 hoặc 13-14
                      placeholder="Nhập mã số thuế"
                      style={{
                        width: 220,
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: "1px solid #d0d0d0",
                        outline: "none",
                        fontSize: "0.9rem",
                        textAlign: "right",
                      }}
                    />
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Text size="sm">Địa chỉ:</Text>
                    <input
                      value={diaChiNguoiMua}
                      onChange={(e) => setDiaChiNguoiMua(e.target.value)}
                      placeholder="Nhập địa chỉ"
                      style={{
                        width: 520,
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: "1px solid #d0d0d0",
                        outline: "none",
                        fontSize: "0.9rem",
                        textAlign: "right",
                      }}
                    />
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Text size="sm">
                      Mã đơn vị có quan hệ ngân sách (Nếu có):
                    </Text>

                    <input
                      value={maDonViQHNS}
                      onChange={(e) => {
                        const raw = e.target.value;
                        // chỉ giữ lại chữ số
                        const onlyNumber = raw.replace(/\D/g, "");
                        setMaDonViQHNS(onlyNumber);
                      }}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      placeholder="VD: 1164681"
                      style={{
                        width: 220,
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: "1px solid #d0d0d0",
                        outline: "none",
                        fontSize: "0.9rem",
                        textAlign: "right",
                      }}
                    />
                  </Flex>
                </Flex>
              </Card>
            </Grid.Col>

            {/* --- Thông tin chung --- */}
            <Grid.Col span={12}>
              <Card shadow="md" padding="md" radius="lg" withBorder>
                <Title order={5}>Thông tin chung</Title>
                <Flex direction="column" gap={4} mt={4}>
                  <Flex justify="space-between">
                    <Text size="sm">Đơn vị tiền tệ:</Text>
                    <Text size="sm" fw={600}>
                      {thongTinChung.donViTienTe || "—"}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text size="sm">Tỷ giá:</Text>
                    <Text size="sm" fw={600}>
                      {thongTinChung.tyGia ?? "—"}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text size="sm">Hình thức thanh toán:</Text>
                    <Text size="sm" fw={600}>
                      {thongTinChung.hinhThucThanhToan || "—"}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text size="sm">Phòng ban:</Text>
                    <Text size="sm" fw={600}>
                      {thongTinChung.pban || "—"}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text size="sm">Hợp đồng chính:</Text>
                    <Text size="sm" fw={600}>
                      {thongTinChung.hdcttchinh || "—"}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text size="sm">Thỏa thuận đơn:</Text>
                    <Text size="sm" fw={600}>
                      {thongTinChung.thdon || "—"}
                    </Text>
                  </Flex>
                </Flex>
              </Card>
            </Grid.Col>

            {/* --- Danh sách sản phẩm / dịch vụ --- */}
            <Grid.Col span={12}>
              <Card shadow="md" padding="md" radius="lg" withBorder>
                <Title order={5}>Danh sách sản phẩm / dịch vụ</Title>
                <Table
                  striped
                  highlightOnHover
                  withColumnBorders
                  verticalSpacing="xs"
                  mt={6}
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>STT</Table.Th>
                      <Table.Th>Tên sản phẩm</Table.Th>
                      <Table.Th>Mã SP</Table.Th>
                      {/* <Table.Th>Số lượng</Table.Th> */}
                      <Table.Th>Thành tiền</Table.Th>
                      <Table.Th>Thuế suất</Table.Th>
                      <Table.Th>Tiền thuế</Table.Th>
                      <Table.Th>Thành tiền sau thuế</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {editableDanhSachSP.length > 0 ? (
                      editableDanhSachSP.map((sp: any, idx: number) => (
                        <Table.Tr key={idx}>
                          <Table.Td>{idx + 1}</Table.Td>

                          <Table.Td>
                            <input
                              value={sp.tenSanPham ?? ""}
                              onChange={(e) => {
                                const v = e.target.value;
                                setEditableDanhSachSP((prev) => {
                                  const next = [...prev];
                                  next[idx] = { ...next[idx], tenSanPham: v };
                                  return next;
                                });
                              }}
                              style={{
                                width: "100%",
                                padding: "4px 8px",
                                borderRadius: 8,
                                border: "1px solid #d0d0d0",
                                outline: "none",
                                fontSize: "0.9rem",
                                textAlign: "left",
                                background: "transparent",
                              }}
                            />
                          </Table.Td>

                          <Table.Td>
                            <input
                              value={sp.maSanPham ?? ""}
                              onChange={(e) => {
                                const v = e.target.value;
                                setEditableDanhSachSP((prev) => {
                                  const next = [...prev];
                                  next[idx] = { ...next[idx], maSanPham: v };
                                  return next;
                                });
                              }}
                              style={{
                                width: "100%",
                                padding: "4px 8px",
                                borderRadius: 8,
                                border: "1px solid #d0d0d0",
                                outline: "none",
                                fontSize: "0.9rem",
                                textAlign: "left",
                                background: "transparent",
                              }}
                            />
                          </Table.Td>
                          {/* <Table.Td>
                            <input
                              value={String(sp.sLuong ?? "")}
                              onChange={(e) => {
                                const raw = e.target.value;
                                const onlyNumber = raw.replace(/\D/g, "");
                                setEditableDanhSachSP((prev) => {
                                  const next = [...prev];
                                  next[idx] = {
                                    ...next[idx],
                                    // giữ string đúng yêu cầu
                                    sLuong: onlyNumber,
                                  };
                                  return next;
                                });
                              }}
                              inputMode="numeric"
                              pattern="[0-9]*"
                              placeholder="0"
                              style={{
                                width: "100%",
                                padding: "4px 8px",
                                borderRadius: 8,
                                border: "1px solid #d0d0d0",
                                outline: "none",
                                fontSize: "0.9rem",
                                textAlign: "left",
                                background: "transparent",
                              }}
                            />
                          </Table.Td> */}
                          <Table.Td align="right">
                            {Number(sp.thanhTien).toLocaleString()}
                          </Table.Td>
                          <Table.Td align="center">{sp.thueSuat}</Table.Td>
                          <Table.Td align="right">
                            {Number(sp.tienThue).toLocaleString()}
                          </Table.Td>
                          <Table.Td align="right">
                            {Number(sp.thanhTienSauThue).toLocaleString()}
                          </Table.Td>
                        </Table.Tr>
                      ))
                    ) : (
                      <Table.Tr>
                        <Table.Td colSpan={7} align="center">
                          <Text c="dimmed">Không có dữ liệu sản phẩm</Text>
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </Card>
            </Grid.Col>

            {/* --- Thông tin thanh toán --- */}
            <Grid.Col span={12}>
              <Card shadow="md" padding="md" radius="lg" withBorder>
                <Title order={5}>Thông tin thanh toán</Title>
                <Flex direction="column" gap={4} mt={4}>
                  <Flex justify="space-between">
                    <Text size="sm">Tổng tiền chưa thuế:</Text>
                    <Text size="sm" fw={600}>
                      {Number(thanhToan.tongTienChuaThue || 0).toLocaleString()}{" "}
                      VND
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text size="sm">Tiền thuế:</Text>
                    <Text size="sm" fw={600}>
                      {Number(thanhToan.tongTienThue || 0).toLocaleString()} VND
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text size="sm">Tổng cộng:</Text>
                    <Text size="sm" color="blue" fw={700}>
                      {Number(
                        thanhToan.tongTienThanhToan || 0,
                      ).toLocaleString()}{" "}
                      VND
                    </Text>
                  </Flex>
                  <Divider my="xs" />
                  <Text size="sm">
                    <b>Bằng chữ:</b> {thanhToan.tongTienBangChu}
                  </Text>

                  {thanhToan?.danhSachLePhi?.[0]?.danhSach?.length > 0 && (
                    <>
                      <Divider my="sm" />
                      <Title order={6} fw={600}>
                        Danh sách lệ phí
                      </Title>
                      {thanhToan.danhSachLePhi[0].danhSach.map(
                        (lp: any, idx: number) => (
                          <Flex key={idx} justify="space-between">
                            <Text size="sm">{lp.tenLePhi}</Text>
                            <Text size="sm" fw={600}>
                              {Number(lp.tienPhi || 0).toLocaleString()} VND
                            </Text>
                          </Flex>
                        ),
                      )}
                    </>
                  )}
                </Flex>
              </Card>
            </Grid.Col>

            {/* --- Biểu mẫu hóa đơn & Xuất hóa đơn --- */}
            <Grid.Col span={12}>
              <Card shadow="md" padding="md" radius="lg" withBorder>
                <Flex align="center" justify="space-between">
                  {/* Tiêu đề bên trái */}
                  <Title order={5} style={{ flexShrink: 0 }}>
                    Xuất hóa đơn
                  </Title>

                  {/*   Cảnh báo nằm cùng dòng với title */}
                  {(() => {
                    const pdvList = invoiceParams?.pdvId || [];
                    const onlyHas2 = pdvList.length === 1 && pdvList[0] === 2;
                    const onlyHas3 = pdvList.length === 1 && pdvList[0] === 3;
                    const noProduct = !danhSachSP || danhSachSP.length === 0;

                    let message = "";
                    if (onlyHas2) {
                      message =
                        "⚠ Bạn đang xuất hóa đơn chỉ bao gồm hồ sơ lưu trú! ";
                    } else if (onlyHas3 || noProduct) {
                      message = "⚠ Vui lòng nên chọn thêm hồ sơ phí nội trú.";
                    }

                    return (
                      message && (
                        <Text
                          size="sm"
                          fw={500}
                          fs="italic"
                          style={{
                            color: "rgba(173, 6, 6, 0.85)",
                            textAlign: "right",
                            marginLeft: "12px",
                            flexGrow: 1,
                          }}
                        >
                          {message}
                        </Text>
                      )
                    );
                  })()}
                </Flex>

                {/* --- Biểu mẫu chọn và nút xuất --- */}
                <Flex align="center" justify="space-between" mt="md" gap="md">
                  <Flex direction="column" style={{ flex: 1 }}>
                    <Text size="sm" fw={500} mb={4}>
                      Biểu mẫu hoá đơn
                    </Text>
                    <select
                      value={selectedMau}
                      onChange={(e) => setSelectedMau(e.target.value)}
                      disabled={loadingMau}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        outline: "none",
                        fontSize: "0.9rem",
                        background:
                          "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,240,240,0.9))",
                        color: "#222",
                      }}
                    >
                      {loadingMau ? (
                        <option value="">Đang tải...</option>
                      ) : listMauHoaDon.length > 0 ? (
                        <>
                          <option value="">-- Chọn mẫu hoá đơn --</option>
                          {listMauHoaDon.map((mau) => (
                            <option
                              key={mau.mauHoadonId}
                              value={mau.mauHoadonId}
                            >
                              {mau.mauHoadonMauso} - {mau.mauHoadonKyhieu} (
                              {mau.mauHoadonGhichu})
                            </option>
                          ))}
                        </>
                      ) : (
                        <option value="">Không có mẫu hoá đơn</option>
                      )}
                    </select>
                  </Flex>

                  <Button
                    loading={publishing} //   loading Mantine
                    disabled={publishing} //   khóa nút
                    variant="gradient"
                    gradient={{ from: "blue", to: "teal" }}
                    size="md"
                    radius="md"
                    mt={24}
                    style={{
                      minWidth: 160,
                      fontWeight: 600,
                      letterSpacing: "0.3px",
                      boxShadow: "0 3px 12px rgba(0, 0, 0, 0.15)",
                    }}
                    onClick={handlePublishInvoice}
                  >
                    Xuất hóa đơn
                  </Button>
                </Flex>

                {/* --- Thông báo thành công --- */}
                <Flex align="center" justify="space-between" mt="md" gap="md">
                  {isPublished ? (
                    <Text
                      size="sm"
                      fw={600}
                      c="green"
                      style={{
                        background: "rgba(0, 128, 0, 0.1)",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: "1px solid rgba(0,128,0,0.3)",
                      }}
                    >
                      Hóa đơn đã được xuất thành công!
                    </Text>
                  ) : (
                    <Text size="sm" fw={500} c="gray" fs="italic">
                      ⏳ Hóa đơn chưa được xuất.
                    </Text>
                  )}
                </Flex>
              </Card>
            </Grid.Col>

            {/* --- Nút đóng --- */}
            <Grid.Col span={12}>
              <Group justify="flex-end" mt="md" mb={"md"}>
                <Button
                  variant="outline"
                  color="gray.8"
                  onClick={handleCloseInvoice}
                  style={{
                    width: 120,
                    borderRadius: 12,
                    background:
                      "linear-gradient(145deg, rgba(255,255,255,0.88), rgba(255,255,255,0.88))",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.88)",
                  }}
                >
                  Đóng
                </Button>
              </Group>
            </Grid.Col>
          </Grid>
        )}
      </ScrollArea>

      {/* ----- Phần ghi chú nằm CỐ ĐỊNH BÊN DƯỚI ----- */}
      <div
        style={{
          position: "absolute",
          bottom: "15px",
          left: "24px",
          zIndex: 5, // ✅ nhỏ hơn header & close button
          width: "auto",
        }}
      >
        <div
          className="note-hover-trigger"
          style={{
            position: "relative",
            display: "inline-block",
          }}
        >
          <img
            src="/images/note3.PNG"
            alt="Ghi chú"
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget.nextSibling as HTMLElement).style.display =
                "block")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget.nextSibling as HTMLElement).style.display =
                "none")
            }
          />

          <div
            className="note-hover-box"
            style={{
              display: "none", //  chỉ hiện khi hover
              position: "absolute",
              bottom: "60px",
              left: "0",
              background: "rgba(255,255,255,0.96)",
              borderRadius: "12px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
              border: "1px solid rgba(0,0,0,0.1)",
              padding: "14px 18px",
              width: "350px", // thu gọn tránh đè vùng khác
              fontSize: "13px",
              color: "#333",
              lineHeight: "1.4",
              zIndex: 10,
            }}
          >
            <Text fw={600} size="sm" c="blue">
              Ghi chú
            </Text>
            <Text size="sm">
              <Text span c="red">
                *
              </Text>{" "}
              01 phương tiện có thể thu nhiều lần trong ngày.
            </Text>
            <Text size="sm">
              <Text span c="red">
                *
              </Text>{" "}
              In hoá đơn có thể in theo lần thu hoặc in tổng 01 phương tiện
              trong ngày.
            </Text>
            <Text size="sm">
              <Text span c="red">
                *
              </Text>{" "}
              Lưu lại được tất cả thông tin của phương tiện vào CSDL dùng cho
              lần sau.
            </Text>
            <Text
              size="sm"
              mt="xs"
              fs="italic"
              style={{ color: "rgba(173, 6, 6, 0.85)" }}
            >
              ⚠ Rà soát lại thông tin xuất hoá đơn. Nếu có sai sót, vui lòng
              liên hệ{" "}
              <Text span fw={600} c="dark">
                quản trị hệ thống
              </Text>
              .
            </Text>
          </div>
        </div>
      </div>
    </Modal>
  );
}
