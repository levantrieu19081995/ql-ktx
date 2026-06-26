/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { Button } from "@mantine/core";
import { useTranslations } from "next-intl";
import { HistoryItem } from "../../../types/type-history";
import { layNhanTrangThai } from "./BangLichSu";
import type { LoaiTabHienThi } from "./BangLichSu";
import dayjs from "dayjs";

// Định nghĩa giao diện thuộc tính cho Component Chi tiết lịch sử ra vào
interface ThuocTinhChiTietLichSuCard {
  // Bản ghi lịch sử ra vào đang được lựa chọn để xem chi tiết
  lichSuDuocChon: HistoryItem | null;

  // Loại tab hiện tại để xác định màu trạng thái
  loaiTab?: LoaiTabHienThi;

  // Hàm callback khi người dùng bấm nút Đóng
  khiDong: () => void;

  // Hàm callback khi người dùng bấm nút Phản hồi sai thông tin
  khiPhanHoi: (lichSu: HistoryItem) => void;
}

/**
 * Component Thẻ thông tin chi tiết quét thẻ ra vào (ChiTietLichSuCard).
 * Chức năng: Hiển thị ảnh chân dung lớn và thông tin cụ thể của bản ghi được chọn.
 */
export const ChiTietLichSuCard: React.FC<ThuocTinhChiTietLichSuCard> = ({
  lichSuDuocChon,
  loaiTab = "LICH_SU",
  khiDong,
  khiPhanHoi,
}) => {
  const t = useTranslations("History");
  // Nếu không có bản ghi nào được chọn, hiển thị thông báo rỗng
  if (!lichSuDuocChon) {
    return (
      <div className="empty-card">
        <p className="empty-text">{t("card.emptyText")}</p>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
      </div>
    );
  }

  // Xác định đường dẫn ảnh chân dung
  const duongDanAnh =
    lichSuDuocChon.duongDanAnhChup ||
    lichSuDuocChon.duongDanAnhDaiDien ||
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200";

  // Định dạng mốc thời gian hiển thị
  const thoiGianDinhDang = dayjs(lichSuDuocChon.thoiGian).format(
    "DD/MM/YYYY HH:mm:ss",
  );

  // Lấy nhãn và màu sắc trạng thái theo tab
  const { nhan: nhanTrangThai, mauSac } = layNhanTrangThai(
    lichSuDuocChon,
    loaiTab,
    t,
  );

  return (
    <div className="detail-card">
      {/* Tiêu đề */}
      <h3 className="detail-card-title">{t("card.detailTitle")}</h3>

      {/* Ảnh chân dung lớn */}
      <div className="image-container">
        <div className="image-wrapper">
          <img
            src={duongDanAnh}
            alt={lichSuDuocChon.hoVaTen}
            className="portrait-image"
          />
        </div>
      </div>

      {/* Danh sách thông tin chi tiết */}
      <div className="info-list">
        <div className="info-row">
          <span className="info-label">{t("filter.studentId")}:</span>
          <span className="info-value-strong">{lichSuDuocChon.mssv}</span>
        </div>

        <div className="info-row">
          <span className="info-label">{t("table.fullName")}:</span>
          <span className="info-value-strong">{lichSuDuocChon.hoVaTen}</span>
        </div>

        <div className="info-row">
          <span className="info-label">{t("card.dormitory")}</span>
          <span className="info-value">{lichSuDuocChon.tenKtx}</span>
        </div>

        <div className="info-row">
          <span className="info-label">{t("card.time")}</span>
          <span className="info-value">{thoiGianDinhDang}</span>
        </div>

        <div className="info-row">
          <span className="info-label">{t("card.room")}</span>
          <span className="info-value">{lichSuDuocChon.tenPhong}</span>
        </div>

        <div className="info-row">
          <span className="info-label">{t("card.status")}</span>
          <span className={`info-value-strong ${mauSac}`}>{nhanTrangThai}</span>
        </div>
      </div>

      {/* Nút thao tác */}
      <div className="button-container">
        <Button
          fullWidth
          onClick={() => khiPhanHoi(lichSuDuocChon)}
          className="action-button"
        >
          {t("card.feedbackBtn")}
        </Button>
      </div>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
    </div>
  );
};

const styles = `
.empty-card {
    background-color: #ffffff;
    border-radius: 0.75rem;
    border: 1px solid #e4e4e7;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 240px;
    color: #a1a1aa;
}

.empty-text {
    font-size: 0.75rem;
    font-weight: 500;
    text-align: center;
    font-family: sans-serif;
    margin: 0;
}

.detail-card {
    background-color: #ffffff;
    border-radius: 0.75rem;
    border: 1px solid #e4e4e7;
    padding: 0.75rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    height: 100%;
    font-family: sans-serif;
}

.detail-card-title {
    color: #00afef;
    font-weight: bold;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 0;
    margin-bottom: 0.5rem;
    padding-bottom: 0.25rem;
    border-bottom: 1px solid #f4f4f5;
}

.image-container {
    display: flex;
    justify-content: center;
    margin-bottom: 0.75rem;
}

.image-wrapper {
    position: relative;
    width: 100%;
    max-width: 180px;
    aspect-ratio: 3/4;
    border-radius: 0.5rem;
    overflow: hidden;
    border: 1px solid #e4e4e7;
    background-color: #fafafa;
}

.portrait-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
}

.info-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    font-size: 0.75rem;
    margin-bottom: 0.75rem;
}

.info-row {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
}

.info-label {
    color: #71717a;
    font-weight: 500;
    flex-shrink: 0;
    width: 5rem;
}

.info-value {
    color: #3f3f46;
    font-weight: 500;
}

.info-value-strong {
    color: #27272a;
    font-weight: 600;
}

.button-container {
    margin-top: auto;
    padding-top: 0.5rem;
    border-top: 1px solid #f4f4f5;
}

.action-button {
    background-color: #00afef !important;
    border: none !important;
    color: #ffffff !important;
    font-size: 0.75rem !important;
    font-weight: 600 !important;
    height: 2rem !important;
    border-radius: 0.375rem !important;
    transition: background-color 0.2s;
    cursor: pointer;
    width: 100%;
}

.action-button:hover {
    background-color: #0092c7 !important;
}
`;

export default ChiTietLichSuCard;
