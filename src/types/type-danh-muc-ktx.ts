export type TrangThaiDanhMucKtx = "HOAT_DONG" | "NGUNG_HOAT_DONG";

export interface DanhMucKtxPaginateRequest {
  page?: number;
  pageSize?: number;
  keyword?: string;
  keyWord?: string;
}

export interface DanhMucKtxPaginatePayload<T> {
  items: T[];
  totalPages?: number;
  totalElements?: number;
  page?: number;
  pageSize?: number;
}

export interface DanhMucKtxResponse<T> {
  status?: string;
  success?: boolean;
  message?: string;
  payload?: T;
}

export type DanhMucKtxPaginateResponse<T> = DanhMucKtxResponse<
  DanhMucKtxPaginatePayload<T>
>;

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

export interface KhuKtx {
  id?: number | string;
  guid?: string;
  maKhu?: string;
  tenKhu?: string;
  diaChi?: string;
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
