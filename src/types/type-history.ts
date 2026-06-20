export interface HistoryListRequest {
  mssv?: string;
  hoVaTen?: string;
  fromDate: string; // dd/MM/yyyy
  toDate: string;   // dd/MM/yyyy
  maKtx?: string;
  maPhong?: string;
  loai?: 'IN' | 'OUT' | 'ALL';
  trangThai?: string;
  loaiDoiTuong?: string;
}

export interface HistoryItem {
  id: string;
  thoiGian: string;
  mssv: string;
  hoVaTen: string;
  duongDanAnhDaiDien?: string;
  duongDanAnhChup?: string;
  loai: 'IN' | 'OUT';
  maKtx: string;
  tenKtx: string;
  maPhong: string;
  tenPhong: string;
  thietBi: string;
  ghiChu?: string;
  loaiDoiTuong?: string;
  trangThaiSinhVien?: 'BINH_THUONG' | 'NO_PHI' | 'BI_CAM';
  trangThaiHienDien?: 'CO_MAT' | 'VANG_MAT';
}

export interface HistoryListResponse {
  data?: any;
  history?: HistoryItem[];
  success?: boolean;
  message?: string;
  totalRecords?: number;
}

// Aliases for compatibility with Vietnamese nomenclature
export type LichSuRaVaoListRequest = HistoryListRequest;
export type LichSuRaVaoItem = HistoryItem;
export type LichSuRaVaoListResponse = HistoryListResponse;

export interface DanhMucPhong {
  id: string;
  guid?: string;
  maPhong: string;
  tenPhong: string;
  maKhu: string;
  tenKhu?: string;
  loaiPhong?: string;
  sucChua?: number;
  soNguoiHienTai?: number;
  ghiChu?: string;
}

export interface DanhMucNhomNguoiDung {
  id: string;
  guid?: string;
  maNhom: string;
  tenNhom: string;
  ghiChu?: string;
}

export interface DanhMucLoaiSuKien {
  id: string;
  guid?: string;
  maLoaiSuKien: string;
  tenLoaiSuKien: string;
  ghiChu?: string;
}

export interface DanhMucKhu {
  id: string;
  guid?: string;
  maKhu: string;
  tenKhu: string;
  ghiChu?: string;
}

export interface DanhMucCanBo {
  id: string;
  guid?: string;
  maCanBo: string;
  hoVaTen: string;
  chucVu?: string;
  soDienThoai?: string;
  email?: string;
  ghiChu?: string;
}

export interface DanhMucCamera {
  id: string;
  guid?: string;
  maCamera: string;
  tenCamera: string;
  viTri?: string;
  trangThai?: 'HOAT_DONG' | 'NGUNG_HOAT_DONG';
  ghiChu?: string;
}

export interface ThongKeSinhVienRequest {
  tuNgay?: string;
  denNgay?: string;
  mssv?: string;
}

export interface ThongKeSinhVienResponse {
  mssv: string;
  hoVaTen: string;
  luotRaVao: number;
}

export interface ThongKeKhuRequest {
  tuNgay?: string;
  denNgay?: string;
}

export interface ThongKeKhuResponse {
  maKhu: string;
  tenKhu: string;
  luotVao: number;
  luotRa: number;
}

export interface ThongKeLuotRaVaoRequest {
  tuNgay?: string;
  denNgay?: string;
  kieuThoiGian?: 'NGAY' | 'THANG' | 'NAM';
}

export interface ThongKeLuotRaVaoResponse {
  thoiGian: string;
  luotVao: number;
  luotRa: number;
}

export interface SyncUserRequest {
  id?: number;
  maso: string;
  hoten: string;
  laymau?: boolean;
  nhomma?: string;
  nhomten?: string;
}


