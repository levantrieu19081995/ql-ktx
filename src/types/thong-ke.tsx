// ====================== THỐNG KÊ LỆ PHÍ THEO NGÀY ======================

export interface ThongKeLePhiTheoNgayRequest {
  tuNgay: string; // "11/01/2025"
  denNgay: string; // "12/12/2025"
  hinhThucThanhToanId: number; // 0 = tất cả
  trangThaiThanhToan: number; // 0 = tất cả
  trangThaiNo: number; // 0 = tất cả
  loaiPhiId?: number; // 0 = tất cả
  loaiPhiIds?: number[]; // 0 = tất cả "loaiPhiIds": [0]
}

export interface LePhiChiTietItem {
  hsId: number;
  hsMa: string;
  tenPhi: string;
  phiThucTe: number;
  thoiGianThanhToan: string | null;
  trangThaiThanhToan: boolean;
  trangThaiNo: boolean;
  hinhThucThanhToanId: number;
  hinhThucThanhToan: string;
  loaiPhiId: number;
  loaiPhiTen: string;
}

export interface ThongKeLePhiTheoNgayPayload {
  tongHoSo: number;
  tongTienThuTrongNgay: number;
  tongHoSoNo: number;
  tongPhiNo: number;
  tongHoSoDaThu: number;
  tongPhiDaThu: number;
  tongHoSoChuaThu: number;
  tongPhiChuaThu: number;
  danhSachLePhiChiTiets: LePhiChiTietItem[];
}

export interface ThongKeLePhiTheoNgayResponse {
  time: string;
  message: string;
  status: string;
  payload: ThongKeLePhiTheoNgayPayload;
}
