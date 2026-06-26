import { showNoti } from "@/components/common/showNoti";
import { HoSoPhiDichVuItem } from "@/types/global";

export function acceptanceCoGioiFlow(step: number, result: any): boolean {
  if (!result) return true;

  // Nếu hồ sơ đã huỷ → cho qua
  if (Number(result?.bxlId) === 1002) return true;

  const list: HoSoPhiDichVuItem[] = result?.listHoSoPhiDichVu || [];

  switch (step) {
    // ===== STEP 0: Tiếp nhận =====
    case 0: {
      const { tenChuXe, ttptBienkiemsoat, ngayTiepNhan } = result || {};
      if (!tenChuXe || !ttptBienkiemsoat || !ngayTiepNhan) {
        showNoti(
          "warning",
          "Vui lòng nhập đầy đủ Tên chủ phương tiện, Biển số và Ngày tiếp nhận!"
        );
        return false;
      }
      return true;
    }

    // ===== STEP 1: Phí ký túc xá =====
    case 1: {
      if (!list.length) {
        showNoti("warning", "Vui lòng thêm ít nhất một phí ký túc xá!");
        return false;
      }

      const allNo = list.every((i) => i.trangThaiNo === true);

      if (allNo) return true;

      const hasUnpaid = list.some(
        (i) =>
          i.trangThaiNo !== true &&
          (i.trangThaiThanhToan === null ||
            i.trangThaiThanhToan === false)
      );

      if (hasUnpaid) {
        showNoti("warning", "Vẫn còn phí ký túc xá chưa thanh toán!");
        return false;
      }

      return true;
    }

    // ===== STEP 2: Phí tem & GCN =====
    case 2: {
      if (!list.length) {
        showNoti("warning", "Chưa có phí tem & GCN!");
        return false;
      }

      const hasInvalid = list.some(
        (i) =>
          i.trangThaiNo === true ||
          i.trangThaiThanhToan === null ||
          i.trangThaiThanhToan === false
      );

      if (hasInvalid) {
        showNoti(
          "warning",
          "Phải thanh toán hết và không còn nợ trước khi cấp tem & GCN!"
        );
        return false;
      }

      return true;
    }

    // ===== STEP 3: Xuất hoá đơn =====
    case 3: {
      const hasInvalid = list.some(
        (i) =>
          i.trangThaiNo === true ||
          i.trangThaiThanhToan === null ||
          i.trangThaiThanhToan === false
      );

      if (hasInvalid) {
        showNoti(
          "warning",
          "Vẫn còn phí chưa thanh toán hoặc đang ghi nợ!"
        );
        return false;
      }
      return true;
    }

    default:
      return true;
  }
}
