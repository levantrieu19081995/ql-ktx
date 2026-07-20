export type TrangThaiDanhMucKtx = "HOAT_DONG" | "NGUNG_HOAT_DONG";
// KHU
export interface DanhMucKhuKtxPaginateRequest {
  page?: number;
  pageSize?: number;
  maKhu?: string;
}

export interface KhuKtx {
  khuId?: number;
  maKhu?: string;
  tenKhu?: string;
  khuTen: string | undefined;
  khuMa: string | undefined;
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

// SINH VIÊN BỊ CẤM
export interface DanhSachSinhVienBiCamRequest {
  page?: number;
  pageSize?: number;
  maSinhVien?: string;
}

export interface SinhVienBiCam {
  camId?: number;
  sinhVienId?: number;
  lyDo?: string;
  ngayBatDau?: number | null;
  ngayKetThuc?: number | null;
  loaiSuKienId?: number;
  maSinhVien?: string;
}

export interface SinhVienBiCamRequest {
  sinhVienId?: number;
  lyDo?: string;
  ngayBatDau?: string;
  ngayKetThuc?: string | null;
  loaiSuKienId?: number;
  maSinhVien?: string;
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


  //
  sinhVienId?: number;
  userId?: number | null;
  maSinhVien?: string;
  lop?: string; 
  maPhongCu?: string | null;

}

export interface PhongKtx {
  khuTen: string | undefined;
  khuMa: string | undefined;
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

  phongId?: number;
  uiisPhongId?: number;
  khuId?: number;
  phongMa?: string;
  soChoDangCo?: string | number;
  loaiPhong?: string | null;
}

// === LOẠI SỰ KIỆN ===
 export interface LoaiSuKienKtx {
  loaiSuKienId?: number;
  maLoai?: string;
  tenLoai?: string;
  moTa?: string | null;
  trangThai?: string;
  guid?: string;
}

export interface DanhSachLoaiSuKienKtxRequest {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

//
export interface DanhSachSinhVienKtxRequest {
  page?: number;
  pageSize?: number;
  keyword?: string;
  maKhu?: string;
  maPhong?: string;
  maSinhVien?: string;
  hoTen?: string;
}


// === SYNC - ĐỒNG BỘ DANH SÁCH  SINH VIÊN
export type UiisKhuPayload = {
  nam_hoc: string;
  hoc_ky: string;
};

export type UiisSinhVienPayload = {
  nam_hoc: number;
  hoc_ky: number;
  ma_phong?: string;
  khu_id?: number;
  page?: number;
  pageSize?: number;
};

export type UiisPhongPayload = {
  nam_hoc: number;
  hoc_ky: number;
  khu_id: number;
};
 
