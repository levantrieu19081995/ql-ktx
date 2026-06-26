export interface ThongTinPhiDangKiem {
  [key: string]: any;
}

export interface DanhMucPhuongTien {
  [key: string]: any;
}

export interface DanhMucPhuongTienListResponse {
  [key: string]: any;
}

export interface DanhMucPhuongTienRequest {
  page?: number;
  pageSize?: number;
  keyWord?: string;
  dmLptId?: any;
  [key: string]: any;
}

export interface DanhMucPhuongTienPut {
  [key: string]: any;
}

export interface DefaultAPIResponse<T> {
  success?: boolean;
  data?: T;
  [key: string]: any;
}

export interface DanhMucLoaiPhuongTienRequest {
  [key: string]: any;
}

export interface DanhMucLoaiPhuongTienListResponse {
  [key: string]: any;
}

export interface DanhMucLoaiPhuongTienResponse {
  [key: string]: any;
}

export interface DanhMucLoaiPhuongTienCreateRequest {
  [key: string]: any;
}

export interface DanhMucLoaiPhuongTienItem {
  [key: string]: any;
}

export interface DanhMucLoaiPhuongTienUpdate {
  [key: string]: any;
}

export interface HoSoPhiDichVuQuery {
  page?: number;
  pageSize?: number;
  userIdTiepNhan?: string;
  hsId?: number | string;
}

export interface HoSoPhiDichVuCreate {
  hsId?: string | number;
  pdvId?: string | number;
  phiThucTe?: number | string;
  tenPhi?: string | number;
  lanThu?: string | number;
  accountGuidThanhToan?: string | number;
  loaiPhiId?: number | string;
  trangThaiThanhToan?: boolean | number | string;
  hinhThucThanhToan?: boolean | number | string;
  trangThaiNo?: boolean;
}

export interface PhiDichVuItem {
  [key: string]: any;
}
