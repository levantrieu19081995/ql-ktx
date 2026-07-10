"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Group,
  Text,
  Button,
  Table,
  Avatar,
  Badge,
  Loader,
  Pagination,
  Portal,
  Notification,
} from "@mantine/core";
import { useTranslations } from "next-intl";
import {
  IconAlertTriangle,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { HistoryItem } from "../../../types/type-history";
import { dichVuNguoiLa } from "./strangerService";
import BoLocNguoiLa from "./BoLocNguoiLa";
import DrawerChiTietLichSu from "../history/DrawerChiTietLichSu";
import { xuatRaFileExcel } from "../history/excelHelper";

export default function StrangerWarningsPage() {
  const t = useTranslations("History");
  const [dangTai, setDangTai] = useState(false);
  const [danhSachCanhBao, setDanhSachCanhBao] = useState<HistoryItem[]>([]);

  // Trạng thái phân trang
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [tongSoTrang, setTongSoTrang] = useState(1);
  const [tongSoPhanTu, setTongSoPhanTu] = useState(0);
  const sizeTrang = 8;

  // Bộ lọc — bắt đầu rỗng để hiện toàn bộ dữ liệu
  const [boLoc, setBoLoc] = useState({
    tuNgay: "",
    denNgay: "",
    maKtx: "-1",
  });

  const [strangerDuocChon, setStrangerDuocChon] = useState<HistoryItem | null>(
    null,
  );
  const [thongBao, setThongBao] = useState<{
    tinNhan: string;
    kieu: "success" | "error";
  } | null>(null);

  const hienThongBao = (
    tinNhan: string,
    kieu: "success" | "error" = "success",
  ) => {
    setThongBao({ tinNhan, kieu });
  };

  useEffect(() => {
    if (thongBao) {
      const timer = setTimeout(() => setThongBao(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [thongBao]);

  const xuLyXuatExcel = () => {
    const duLieuXuat = danhSachCanhBao.map((h, i) => ({
      [t("table.no")]: i + 1,
      "Thời gian": h.thoiGian,
      "Đối tượng": h.loaiDoiTuong || "Người lạ",
      "Khu KTX": h.tenKtx || "N/A",
      "Thiết bị/Camera": h.thietBi || "N/A",
      "Ngày phát hiện": h.ngayNguoiLa || "",
      "Giờ phát hiện": h.gioNguoiLa || "",
    }));
    xuatRaFileExcel(
      duLieuXuat,
      `Danh_Sach_Nguoi_La_${new Date().toISOString().split("T")[0]}`,
      "Cảnh báo người lạ",
    );
    hienThongBao(t("messages.exportExcelSuccess"), "success");
  };

  const xuLyXuatPdf = () => {
    hienThongBao(t("messages.exportPdfSuccess"), "success");
  };

  const taiDuLieu = async () => {
    setDangTai(true);
    try {
      const response = await dichVuNguoiLa.layDanhSachNguoiLa({
        tuNgay: boLoc.tuNgay,
        denNgay: boLoc.denNgay,
        maKtx: boLoc.maKtx,
        page: trangHienTai,
        pageSize: sizeTrang,
      });

      if (response && response.items) {
        setDanhSachCanhBao(response.items);
        setTongSoTrang(response.totalPages);
        setTongSoPhanTu(response.totalElements);
      } else {
        setDanhSachCanhBao([]);
        setTongSoTrang(1);
        setTongSoPhanTu(0);
      }
    } catch (err) {
      console.error("Lỗi khi tải cảnh báo người lạ:", err);
      setDanhSachCanhBao([]);
      setTongSoTrang(1);
      setTongSoPhanTu(0);
    } finally {
      setDangTai(false);
    }
  };

  const datLaiBoLoc = () => {
    setBoLoc({
      tuNgay: "",
      denNgay: "",
      maKtx: "-1",
    });
    setTrangHienTai(1);
  };

  const datBoLocVaResetPage = (boLocMoi: any) => {
    setBoLoc((prev) => ({ ...prev, ...boLocMoi }));
    setTrangHienTai(1);
  };

  // Tự động tải lại dữ liệu khi bộ lọc hoặc số trang thay đổi
  useEffect(() => {
    taiDuLieu();
  }, [boLoc.tuNgay, boLoc.denNgay, boLoc.maKtx, trangHienTai]);

  return (
    <Box className="stranger-page-container">
      <div className="stranger-header-row">
        <h2 className="stranger-page-title">CẢNH BÁO NGƯỜI LẠ</h2>
      </div>

      <BoLocNguoiLa
        boLoc={boLoc}
        datBoLoc={datBoLocVaResetPage}
        datLaiBoLoc={datLaiBoLoc}
        khiTimKiem={taiDuLieu}
        khiXuatExcel={xuLyXuatExcel}
        khiXuatPdf={xuLyXuatPdf}
      />

      {/* HIỂN THỊ DỮ LIỆU */}
      {dangTai ? (
        <div className="loader-box">
          <Loader color="#1f5ca9" size="md" />
          <Text size="sm" c="dimmed" mt="sm">
            {t("warnings.scanning")}
          </Text>
        </div>
      ) : danhSachCanhBao.length === 0 ? (
        <Card className="empty-alert-card">
          <IconAlertTriangle size={48} className="empty-icon" />
          <Text fw={700} size="lg" mt="md" c="dimmed">
            {t("warnings.noStranger")}
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            {t("warnings.noStrangerDesc")}
          </Text>
        </Card>
      ) : (
        <div className="table-wrapper">
          <Table
            highlightOnHover
            verticalSpacing="md"
            className="stranger-table"
          >
            <Table.Thead className="table-thead">
              <Table.Tr>
                <Table.Th style={{ width: 60, textAlign: "center" }}>
                  {t("table.no")}
                </Table.Th>
                <Table.Th style={{ width: 200 }}>{t("table.time")}</Table.Th>
                <Table.Th style={{ width: 120, textAlign: "center" }}>
                  {t("table.image")}
                </Table.Th>
                <Table.Th>{t("warnings.camera")}</Table.Th>
                <Table.Th>{t("warnings.dorm")}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {danhSachCanhBao.map((banGhi, index) => (
                <Table.Tr
                  key={banGhi.id}
                  className="table-tr"
                  onClick={() => setStrangerDuocChon(banGhi)}
                  style={{ cursor: "pointer" }}
                >
                  <Table.Td style={{ textAlign: "center" }} className="td-stt">
                    {(trangHienTai - 1) * sizeTrang + index + 1}
                  </Table.Td>
                  <Table.Td className="td-highlight">
                    {dayjs(banGhi.thoiGian).format("DD/MM/YYYY HH:mm:ss")}
                  </Table.Td>
                  <Table.Td>
                    <Box style={{ display: "flex", justifyContent: "center" }}>
                      <Avatar
                        src={
                          banGhi.duongDanAnhChup || banGhi.duongDanAnhDaiDien
                        }
                        radius="md"
                        size={60}
                        className="avatar-warning"
                        styles={{ image: { objectFit: 'cover' } }}
                      />
                    </Box>
                  </Table.Td>
                  <Table.Td className="td-camera">{banGhi.thietBi}</Table.Td>
                  <Table.Td className="td-ktx">
                    <Badge color="#1f5ca9" variant="light" size="md">
                      {banGhi.tenKtx}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {tongSoTrang > 1 && (
        <div
          className="pagination-wrapper"
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "1.5rem",
          }}
        >
          <Pagination
            value={trangHienTai}
            onChange={setTrangHienTai}
            total={tongSoTrang}
            color="#1f5ca9"
            radius="md"
          />
        </div>
      )}

      {/* Drawer chi tiết người lạ */}
      <DrawerChiTietLichSu
        open={strangerDuocChon !== null}
        onClose={() => setStrangerDuocChon(null)}
        lichSuDuocChon={strangerDuocChon}
        isStranger={true}
      />

      {thongBao && (
        <Portal>
          <div className="fixed top-5 right-5 z-[9999] w-80 animate-fade-in shadow-lg">
            <Notification
              icon={
                thongBao.kieu === "success" ? (
                  <IconCheck size={18} />
                ) : (
                  <IconX size={18} />
                )
              }
              color={thongBao.kieu === "success" ? "teal" : "red"}
              title={
                thongBao.kieu === "success"
                  ? t("messages.success")
                  : t("messages.error")
              }
              onClose={() => setThongBao(null)}
            >
              {thongBao.tinNhan}
            </Notification>
          </div>
        </Portal>
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
    font-family: var(--font-readex-pro), sans-serif;
}

.stranger-header-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
}

.stranger-page-title {
    font-size: 1.125rem;
    font-weight: bold;
    color: #27272a;
    text-transform: uppercase;
    letter-spacing: -0.025em;
    margin: 0;
    font-family: var(--font-k2d), sans-serif;
}

.view-toggle-btn {
    border-radius: 0.5rem !important;
    font-weight: 600 !important;
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
    box-shadow: 0 10px 15px -3px rgba(31, 92, 169, 0.08), 0 4px 6px -2px rgba(31, 92, 169, 0.04);
    border-color: #00afef;
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
    gap: 0.5rem;
}

.detail-icon {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 0.375rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.icon-red {
    background-color: #eff6ff;
    color: #1f5ca9;
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
    background-color: #f0f7ff;
}

.td-stt {
    font-weight: 600;
    color: #64748b;
}

.avatar-warning {
    border: 2px solid #bfdbfe;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.td-highlight {
    font-weight: 700;
    color: #1f5ca9;
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
        box-shadow: 0 0 0 0 rgba(31, 92, 169, 0.4);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(31, 92, 169, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(31, 92, 169, 0);
    }
}
`;
