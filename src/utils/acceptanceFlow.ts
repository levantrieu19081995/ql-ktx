// src/utils/acceptanceFlow.ts

export type ValidateParams = {
  fromStep: number;
  toStep: number;
  result: any;
  isThuPhiDaThanhToan: () => boolean;
  showNoti: (type: any, msg: string) => void;
};
 
export const getStepFromBxl = (bxlId?: number | string) => {
  const id = Number(bxlId);
  if (id === 6) return 2;
  if (id === 3) return 1;
  return 0;
};


export const validateAndGoStep = ({
  fromStep,
  toStep,
  result,
  isThuPhiDaThanhToan,
  showNoti,
}: ValidateParams): boolean => {
  // Không cho lùi step
  if (toStep < fromStep) return true;

  // ===== STEP 0 → STEP 1: kiểm tra thông tin tiếp nhận =====
  if (fromStep === 0 && toStep >= 1) {
    const ok =
      result?.tenChuXe &&
      result?.ttcptSodienthoai &&
      // result?.ttptBienkiemsoat &&
      result?.ngayTiepNhan;

    if (!ok) {
      showNoti("warning", "Vui lòng nhập đầy đủ thông tin tiếp nhận!");
      return false;
    }
  }

  // ===== STEP 1 → STEP 2: kiểm tra phí =====
  // if (fromStep === 1 && toStep >= 2) {
  //   const list = result?.listHoSoPhiDichVu || [];

  //   if (!list.length) {
  //     showNoti("warning", "Vui lòng thêm ít nhất một phí dịch vụ!");
  //     return false;
  //   }

  //   // Nếu tất cả đều là ghi nợ → cho qua
  //   const allNo = list.every((i: any) => i.trangThaiNo === true);

  //   if (!allNo) {
  //     const hasUnpaid = list.some(
  //       (i: any) =>
  //         i.trangThaiThanhToan === null || i.trangThaiThanhToan === false
  //     );

  //     if (hasUnpaid) {
  //       showNoti("warning", "Vẫn còn phí/nợ chưa thanh toán!");
  //       return false;
  //     }
  //   }
  // }

    // ===== STEP 1 → STEP 2: kiểm tra phí =====
    if (fromStep === 1 && toStep >= 2) {
      const list = result?.listHoSoPhiDichVu || [];

      if (!list.length) {
        showNoti("warning", "Vui lòng thêm ít nhất một phí dịch vụ!");
        return false;
      }

      const hasInvalid = list.some(
        (i: any) =>
          i.trangThaiNo === true ||
          i.trangThaiThanhToan === null ||
          i.trangThaiThanhToan === false
      );

      if (hasInvalid) {
        showNoti(
          "warning",
          "Vẫn còn phí đang ghi nợ hoặc chưa thanh toán, không thể tiếp tục!"
        );
        return false;
      }
    }


  return true;
};
