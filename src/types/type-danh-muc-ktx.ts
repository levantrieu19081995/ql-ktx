export type TrangThaiDanhMucKtx = "HOAT_DONG" | "NGUNG_HOAT_DONG";
//
export interface DanhMucKhuKtxPaginateRequest {
  page?: number;
  pageSize?: number;
  maKhu?: string;
}

export interface KhuKtx {
  khuId?: number;
  maKhu?: string;
  tenKhu?: string;
  soLuongPhong?: string;
  moTa?: string | null;
  guid?: string;
  uiisKhuId?: number;
}

export interface DanhMucKtxPaginatePayload<T> {
  numberOfElements: number;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  items: T[];
}

export interface ApiResponse<T> {
  time: string;
  message: string;
  status: string;
  payload: T;
}
export interface DanhMucKhuKtxIndexResponse {
  time: string;
  message: string;
  status: string;
  payload: KhuKtx[];
}
//
export interface DanhMucKtxPaginateRequest {
  page?: number;
  pageSize?: number;
  keyword?: string;
  keyWord?: string;
}


 
export interface DanhMucKtxResponse<T> {
  status?: string;
  success?: boolean;
  message?: string;
  payload?: T;
}

 

export interface SinhVienKtx {
  id?: number | string;
  guid?: string;
  maso?: string;
  mssv?: string;
  hoten?: string;
  hoTen?: string;
  maKhu?: string;
  tenKhu?: string;
  maPhong?: string;
  tenPhong?: string;
  maNhom?: string;
  tenNhom?: string;
  trangThai?: TrangThaiDanhMucKtx | string;
  ghiChu?: string;
}

export interface PhongKtx {
  id?: number | string;
  guid?: string;
  maPhong?: string;
  tenPhong?: string;
  maKhu?: string;
  tenKhu?: string;
  sucChua?: number;
  soNguoiHienTai?: number;
  trangThai?: TrangThaiDanhMucKtx | string;
  ghiChu?: string;
}

 

export interface SinhVienBiCam {
  id?: number | string;
  guid?: string;
  maso?: string;
  mssv?: string;
  hoten?: string;
  hoTen?: string;
  lyDo?: string;
  tuNgay?: string;
  denNgay?: string;
  trangThai?: TrangThaiDanhMucKtx | string;
  ghiChu?: string;
}

export interface SinhVienBiCamRequest {
  id?: number | string;
  guid?: string;
  maso?: string;
  mssv?: string;
  hoten?: string;
  hoTen?: string;
  lyDo?: string;
  tuNgay?: string;
  denNgay?: string;
  ghiChu?: string;
}
