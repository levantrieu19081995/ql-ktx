// ===== Thông tin Chủ phương tiện =====
export interface ChuPhuongTienPut {
  keyword?: string;
  identifier?: string;
  ttcptTen?: string;
  ttcptDiachi?: string;
  ttcptMasothue?: string;
  ttcptCccd?: string;
  ttcptIsDoanhNghiep?: number;
  ttcptSodienthoai?: string;
  validMasothueWhenDoanhNghiep?: true;
  ttId?: number | null | undefined;
  bienKiemSoat?: string | number | null | undefined;
}

export interface ChuPhuongTienRequest {
  page?: number;
  pageSize?: number;
  filterWithHoTenOrBienKiemSoat?: string;
  filterWithCccdOrMst?: string;
  bienKiemSoat?: string;
  dmLptId?: number;
  dmPtId?: number;
  isDoanhNghiep?: number;
  ttId?: number | null;
}

export interface ThongTinPhuongTien {
  ttptId: number;
  ttcptId: number;
  ttptBienkiemsoat: string;
  dmLptId: number;
  dmPtId: number;
  dmLptTen: string;
  dmPtTen: string;
  // Cho phép thêm key khác nếu cần
  [key: string]: unknown;
}

export interface ChuPhuongTien {
  ttcptId?: number;
  ttcptTen?: string;
  ttcptDiachi?: string;
  ttcptMasothue?: string;
  ttcptCccd?: string;
  ttcptSodienthoai?: string;
  ttcptIsDoanhNghiep?: number; // 0 = Cá nhân, 1 = Doanh nghiệp
  dsThongtinPhuongtien?: ThongTinPhuongTien[];
  soLuongPhuongTien?: number;

  // Cho phép thêm key khác nếu cần
  [key: string]: unknown;
}

export interface ChuPhuongTienListResponse {
  [x: string]: any;
  numberOfElements?: number;
  currentPage?: number;
  totalPages?: number;
  totalElements?: number;
  size?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
  items?: ChuPhuongTien[];
}
export interface ChuPhuongTienResponse {
  time?: string;
  message?: string;
  status?: string;
  payload?: ChuPhuongTien;
}

export interface ChuPhuongTienImportExcelItem {
  ttcptTen: string;
  ttcptDiachi: string;
  ttId: number;
  ttcptIsDoanhNghiep: number;
  ttcptSodienthoai: string;
  ttptBienKiemSoat: string;
  dmLptId: number;
  dmPtId: number;
}

export type ChuPhuongTienImportExcelRequest = ChuPhuongTienImportExcelItem[];
