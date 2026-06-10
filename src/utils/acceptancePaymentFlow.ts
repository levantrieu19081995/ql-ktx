import { showNoti } from "@/components/common/showNoti";
import { generateThanhToan } from "@/services/thanh-toan/thanhToanService";
import { fetchConfigPayment } from "@/services/setting/settinPaymentInfoService";
import { getInfor } from "@/services/hoa-don/hoaDonService";
import { HoSoPhiDichVuItem } from "@/types/global";

export const createThanhToan = ({
  result,
  setPaymentInfo,
  setOpenedModalPayment,
  setLoadingModalPayment,
  handlePayment,
}: any) => {
  setLoadingModalPayment(true); 
  const selectedRows = (result?.listHoSoPhiDichVu || []).filter(
    (item: HoSoPhiDichVuItem) =>
      result?.selected?.includes(`${item.pdvId}-${item.lanThu}`)
  );

  if (selectedRows.length === 0) {
    showNoti("warning", "Vui lòng chọn ít nhất một dòng để thanh toán.");
    setLoadingModalPayment(false);
    return;
  }

  const allNo = selectedRows.every((item: any) => item.trangThaiNo === true);
  const allNotNo = selectedRows.every(
    (item: any) => item.trangThaiNo !== true
  );

  if (!allNo && !allNotNo) {
    showNoti(
      "warning",
      "Không thể thanh toán đồng thời các khoản ghi nợ và không ghi nợ."
    );
    setLoadingModalPayment(false);
    return;
  }

  const listPhi = selectedRows.map((item: HoSoPhiDichVuItem) => ({
    tenPhi: item.tenPhi,
    soTien: item.phiThucTe || 0,
    trangThaiThanhToan: item.trangThaiThanhToan || null,
    trangThaiNo: item.trangThaiNo || null,
  }));

  const tongTien = selectedRows.reduce(
    (acc: number, cur: HoSoPhiDichVuItem) =>
      cur.trangThaiThanhToan ? acc : acc + (cur.phiThucTe || 0),
    0
  );

  const danhSachPdv = selectedRows
    .filter((item: HoSoPhiDichVuItem) => !item.trangThaiThanhToan)
    .map((item: HoSoPhiDichVuItem) => ({
      pdvId: item.pdvId,
      lanThu: Number(item.lanThu) || 1,
    }));

  setPaymentInfo({ listPhi, tongTien, qrCode: "" });
  setOpenedModalPayment(true);
  handlePayment(danhSachPdv);
};

export const previewInvoice = async ({
  result,
  selectedPreview,
  setInvoiceParams,
  setSelectedRows,
  setInvoiceData,
  setOpenedPreview,
}: any) => { 
  const selectedRows = (result?.listHoSoPhiDichVu || []).filter(
    (item: HoSoPhiDichVuItem) =>
      selectedPreview.includes(`${item.pdvId}-${item.lanThu}`)
  );

  if (selectedRows.length === 0) {
    showNoti("warning", "Vui lòng chọn ít nhất một dòng để xem trước hóa đơn.");
    return;
  }

  const payload = {
    hsId: Number(result.hsId),
    danhSachPdv: selectedRows.map((item: any) => ({
      pdvId: Number(item.pdvId),
      lanThu: Number(item.lanThu),
    })),
  };

  const res = await getInfor(payload);

  if (!res?.payload?.danhSach?.danhSachHoaDon?.length) {
    showNoti("warning", "Không tìm thấy thông tin hóa đơn.");
    return;
  }

  setInvoiceParams({
    hsId: Number(result.hsId),
    pdvId: selectedRows.map((item: any) => item.pdvId),
  });
  setSelectedRows(selectedRows);
  setInvoiceData(res.payload);
  setOpenedPreview(true);
};

export const doPayment = async ({
  danhSachPdv,
  result,
  payment,
  paymentInfo,
  setPaymentInfo,
  setTransactionId,
  connect,
  setLoadingModalPayment,
}: any) => {
  try { 
    const selectedRows = (result?.listHoSoPhiDichVu || []).filter(
      (item: HoSoPhiDichVuItem) =>
        result?.selected?.includes(`${item.pdvId}-${item.lanThu}`)
    );

    const isNo = selectedRows.every((item: any) => item.trangThaiNo === true);

    const params = {
      maNganHang: payment.maNganHang.value,
      soTaiKhoanThuHuong: payment.soTaiKhoanThuHuong.value,
      hoTenTaiKhoanThuHuong: payment.hoTenTaiKhoanThuHuong.value,
      soTienCanThanhToan: String(paymentInfo.tongTien),
      hsId: result.hsId,
      danhSachPdv,
      isHoSoNo: isNo,
    };

    const res = await generateThanhToan(params);

    setPaymentInfo((prev: any) => ({
      ...prev,
      qrCode: res?.payload?.qrCode || "",
    }));
    setTransactionId(res?.payload?.transactionId);
    connect();
  } catch {
    showNoti("warning", "Không thể kết nối tới máy chủ.");
  } finally {
    // await new Promise((r) => setTimeout(r, 5000));
    setLoadingModalPayment(false);
  }
};

export const fetchPaymentConfigSimple = async (setPayment: any) => {
  try { 
    const configPaymentData = await fetchConfigPayment();

    const filteredData = configPaymentData.payload.reduce(
      (acc: any, item: any) => {
        if (!item?.key) return acc;
        const value = item.value ?? "";

        switch (item.key) {
          case "qldk.ho-ten-chu-tai-khoan":
            acc.hoTenTaiKhoanThuHuong = { configId: item.configId, value };
            break;
          case "qldk.so-tai-khoan-ngan-hang":
            acc.soTaiKhoanThuHuong = { configId: item.configId, value };
            break;
          case "qldk.ma-bin-ngan-hang":
            acc.maNganHang = { configId: item.configId, value };
            break;
          case "qldk.dia-chi-mac-dinh":
            acc.chiNhanhNganHang = { configId: item.configId, value };
            break;
        }
        return acc;
      },
      {}
    );

    setPayment(filteredData);
  } catch (e) {
    console.error("Lỗi khi lấy config thanh toán:", e);
  }
};
