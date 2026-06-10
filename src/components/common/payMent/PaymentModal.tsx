/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useEffect } from "react";
import {
  Modal,
  Grid,
  Card,
  Title,
  Flex,
  Text,
  Divider,
  Tooltip,
  Loader,
  Button,
  Box,
  Group,
} from "@mantine/core";
import { IconCheck, IconPrinter } from "@tabler/icons-react";
// import QRCode from "react-qr-code";

import { QRCode } from "react-qrcode-logo";
import Image from "next/image";
import { showNoti } from "@/components/common/showNoti";
const robotoFont = "/font/Roboto-Regular.ttf";

import jsPDF from "jspdf";
import {
  clearDisplay,
  pushQRToDisplay,
  successDisplay,
  terminalId,
} from "@/utils/QR/openTab";
export default function PaymentModal({
  opened,
  onClose,
  paymentInfo,
  payment,
  paymentStatus,
  loading,
  loadingModalPayment,
  handleClosePaymentModal,
  refreshListThuPhi,
  bienSo,
}: any) {
  const dongThanhToan = () => {
    console.log("[RUN_LOG] ===>  dongThanhToan : ");
    clearDisplay(terminalId);
    handleClosePaymentModal();
    refreshListThuPhi();
  };

  const dongThanhToan1 = () => {
    clearDisplay(terminalId);
    onClose();
  };

  const onPrintQRFullPDF = async () => {
    try {
      const wrapper = document.getElementById("qr-print-area");
      const canvas = wrapper?.querySelector("canvas") as HTMLCanvasElement;

      if (!canvas) {
        showNoti("warning", "Không tìm thấy mã QR để in!");
        return;
      }

      // Lấy ảnh QR từ canvas
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageW = pdf.internal.pageSize.getWidth();
      let y = 30;

      /* ===== TIÊU ĐỀ ===== */
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text("MÃ QR THANH TOÁN", pageW / 2, y, { align: "center" });

      y += 15;

      /* ===== QR ===== */
      const qrSize = 100;
      pdf.addImage(imgData, "PNG", (pageW - qrSize) / 2, y, qrSize, qrSize);

      y += qrSize + 20;

      /* ===== FOOTER (tuỳ chọn) ===== */
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      window.open(pdf.output("bloburl"), "_blank");
    } catch (err: any) {
      console.error("PDF QR ERROR:", err);
      showNoti("error", "Không thể tạo PDF QR!");
    }
  };

  const hasValidQR =
    !loadingModalPayment &&
    paymentStatus !== "SUCCESS" &&
    !!paymentInfo?.qrCode &&
    paymentInfo.qrCode !== "ERROR" &&
    paymentInfo.qrCode.trim() !== "";

  useEffect(() => {
    if (!hasValidQR) return;

    pushQRToDisplay(
      terminalId,
      paymentInfo?.qrCode ?? "",
      paymentInfo?.tongTien ?? 0,
      bienSo ?? "",
    );
  }, [hasValidQR, paymentInfo?.qrCode, paymentInfo?.tongTien]);

  useEffect(() => {
    if (paymentStatus === "SUCCESS") {
      successDisplay(terminalId);
    }
  }, [paymentStatus]);

  return (
    <Modal
      opened={opened}
      // onClose={onClose}
      onClose={dongThanhToan1}
      title={
        <Box>
          <Title
            component="div"
            order={4}
            ta="center"
            c="#1047a7ff"
            style={{
              fontWeight: 700,
              letterSpacing: "0.3px",
            }}
          >
            Thông tin xác nhận thanh toán
          </Title>
        </Box>
      }
      size="lg"
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
          padding: 0,
          border: "1px solid rgba(255, 255, 255, 0.35)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
          color: "#222",
          overflow: "hidden",
        },
        header: {
          background: "rgba(255, 255, 255, 0)",
          marginBottom: "12px",
          padding: "20px 24px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.3)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        },
        body: {
          padding: 0,
        },
        close: {
          color: "#444",
        },
      }}
    >
      <Grid gutter="md" p={28}>
        {/* --- Thông tin phí --- */}
        <Grid.Col span={12}>
          <Card
            shadow="md"
            padding="md"
            radius="lg"
            style={{
              background:
                "linear-gradient(145deg, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.88))",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.88)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              color: "#222",
            }}
          >
            <Title
              order={5}
              style={{
                fontWeight: 600,
                fontSize: 16,
                marginBottom: 6,
              }}
            >
              Thông tin phí
            </Title>
            <Flex direction="column" gap="xs">
              {paymentInfo.listPhi.length > 0 ? (
                paymentInfo.listPhi.map((item: any, idx: number) => (
                  <Flex key={idx} align="center" justify="space-between">
                    <Text size="sm" color="gray.8">
                      {item.tenPhi}
                    </Text>
                    <Flex align="center" gap={6}>
                      <Text size="sm" fw={600}>
                        {(item.soTien ?? 0).toLocaleString()} VNĐ
                      </Text>

                      {item.trangThaiThanhToan === true ? (
                        <Tooltip label="Đã thanh toán" withArrow>
                          <IconCheck size={16} color="green" />
                        </Tooltip>
                      ) : (
                        <Tooltip label="Chưa thanh toán" withArrow>
                          <Text c={"rgba(255, 255, 255, 0.88)"}>{"C"}</Text>
                        </Tooltip>
                      )}
                    </Flex>
                  </Flex>
                ))
              ) : (
                <Text size="sm" c="dimmed">
                  Không có dữ liệu phí
                </Text>
              )}

              <Divider my="xs" />

              <Flex align="center" justify="space-between">
                <Text size="sm" fw={600}>
                  Tổng phí cần thanh toán:
                </Text>
                <Text size="sm" color="blue" fw={700}>
                  {paymentInfo.tongTien.toLocaleString()} VNĐ
                </Text>
              </Flex>
            </Flex>
          </Card>
        </Grid.Col>

        {/* --- Tài khoản thụ hưởng --- */}
        <Grid.Col span={12}>
          <Card
            shadow="md"
            padding="md"
            radius="lg"
            style={{
              background:
                "linear-gradient(145deg, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.88))",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.88)",
              color: "#222",
            }}
          >
            <Title
              order={5}
              style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}
            >
              Tài khoản thụ hưởng
            </Title>
            <Flex direction="column" gap="xs">
              <Flex align="center" justify="space-between">
                <Text size="sm" color="gray.8">
                  Tên:
                </Text>
                <Text size="sm" fw={600}>
                  {payment?.hoTenTaiKhoanThuHuong?.value || ""}
                </Text>
              </Flex>
              <Flex align="center" justify="space-between">
                <Text size="sm" color="gray.8">
                  Số tài khoản:
                </Text>
                <Text size="sm" fw={600}>
                  {payment?.soTaiKhoanThuHuong?.value || ""}
                </Text>
              </Flex>
              <Flex align="center" justify="space-between">
                <Text size="sm" color="gray.8">
                  Mã ngân hàng:
                </Text>
                <Text size="sm" fw={600}>
                  {payment?.maNganHang?.value || ""}
                </Text>
              </Flex>
            </Flex>
          </Card>
        </Grid.Col>

        {/* --- Mã QR --- */}
        <Grid.Col span={12}>
          <Card
            shadow="md"
            padding="md"
            radius="lg"
            style={{
              background:
                "linear-gradient(145deg, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.88))",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.88)",
            }}
          >
            <Flex align="center" justify="space-between" mb={8}>
              <Title order={5} style={{ fontWeight: 600, fontSize: 16 }}>
                Mã QR thanh toán
              </Title>
              {hasValidQR && (
                <Tooltip label="In mã QR" withArrow>
                  <Button
                    variant="subtle"
                    color="blue"
                    p={6}
                    radius="md"
                    onClick={() => {
                      onPrintQRFullPDF();
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconPrinter size={20} stroke={1.5} />
                  </Button>
                </Tooltip>
              )}
            </Flex>

            <Box
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 16,
              }}
            >
              {loadingModalPayment ? (
                <Loader color="blue" size="lg" type="dots" />
              ) : paymentStatus === "SUCCESS" ? (
                <Text ta="center" fw={700} color="teal" size="lg">
                  ✅ Chúc mừng bạn đã thanh toán thành công!
                </Text>
              ) : !paymentInfo?.qrCode ||
                paymentInfo?.qrCode === "ERROR" ||
                paymentInfo?.qrCode?.trim() === "" ? (
                //   Trường hợp QR lỗi hoặc không có dữ liệu
                <Box ta="center">
                  <Image
                    src="/images/QRError.PNG"
                    alt="QR code lỗi"
                    width={160}
                    height={160}
                    style={{
                      objectFit: "contain",
                      opacity: 0.9,
                    }}
                    priority // cho hiển thị nhanh hơn nếu cần
                  />
                  <Text mt="xs" size="sm" c="red" fw={600}>
                    Không thể tạo mã QR. Vui lòng thử lại sau.
                  </Text>
                </Box>
              ) : (
                //  QR hợp lệ
                <div id="qr-print-area">
                  <QRCode
                    value={paymentInfo.qrCode}
                    size={220}
                    qrStyle="dots"
                    eyeRadius={10}
                    fgColor="#1047a7"
                    bgColor="#ffffff"
                    logoImage="/images/LogoCUSC.png"
                    logoWidth={50}
                    logoPadding={8}
                    logoPaddingStyle="circle"
                    quietZone={12}
                    ecLevel="H" // Mức sửa lỗi cao nhất
                  />
                </div>
              )}
            </Box>
          </Card>
        </Grid.Col>

        {/* --- Nút đóng --- */}
        <Grid.Col span={12}>
          <Group justify="flex-end" mt="md">
            <Button
              variant="outline"
              color="gray.8"
              onClick={dongThanhToan}
              disabled={loading}
              style={{
                width: 120,
                borderRadius: 12,
                background:
                  "linear-gradient(145deg, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.88))",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.88)",
              }}
            >
              Đóng
            </Button>
          </Group>
        </Grid.Col>
      </Grid>
    </Modal>
  );
}
