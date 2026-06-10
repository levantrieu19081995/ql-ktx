// src/types/global.d.ts

declare module "*"; //Khi mọi import đều chấp nhận, không bị TS chặn.

//-- type user
export interface CaNhan {
  ten?: string;
  email?: string;
  sdt?: string;
}

export interface Organization {
  id?: number;
  name?: string;
}

export interface User {
  departments?: string[];
  role?: any;
  platformPerms?: any;
  id?: number;
  username?: string;
  email?: string;
  avatar?: string | null |undefined;
  caNhan?: CaNhan;
  organizations?: Organization[];
  avatar?: string | null | undefined; 
}

// ===== User Management =====
export type Platform =
  | "facebook"
  | "instagram"
  | "linkedin"
  | "x"
  | "tiktok"
  | "youtube"
  | "zalo";

export type Role =
  | "Admin"
  | "Editor"
  | "Author"
  | "Contributor"
  | "Reviewer"
  | "Publisher"
  | "Viewer"
  | "Writer"
  | "Approver";

export type Status = "active" | "inactive" | "pending";

// Quyền theo nền tảng
export type Permission = "view" | "post" | "admin";

// Role từ API
export interface UserRole {
  id: number | string;
  name: string;
  description?: string | null;
}

// Connector từ API
export interface Connector {
  id: number | string;
  accountId: number | string;
  socialTypeId: number | string;
  socialType?: string | null;
  name: string;
  config: string; // JSON string
  status: number;
  statusObject?: {
    id: number | string;
    name: string;
  };
}

// User object
export interface User {
  id: string | number;
  username: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string | null;

  // mapped data
  platforms: Platform[];
  platformDetails: { platform: Platform; displayName: string }[]; // để hiển thị tên trang
  // platforms: string[];
  // platformPerms: Partial<Record<Platform, Permission>>;

  // system role (đã chuẩn hoá sang Role)
  roles: string[];
  // system status
  status: Status;

  // raw data
  roles?: UserRole[];
  metadata?: {
    connectors: Connector[];
  };

  password?: string;
  rawPassword?: string;
}

// API Response chuẩn cho fetchUsers
export type UserResponse = {
  status?: string;
  payload?: {
    items: User[];
    totalPages: number;
    totalElements: number;
    status?: number;
  };
};

export type UserDetailResponse = {
  payload?: User;
};





// ===== Danh mục Bước Xử Lý =====
export interface BuocXuLy {
  bxlId: any;
  id: number;
  bxlTen: string;
  bxlGhiChu?: string;
}

export type BuocXuLyResponse = {
  payload?: BuocXuLy;
  status?: string;
  time?: string;
};

export type BuocXuLyListResponse = {
  payload?: {
    items: BuocXuLy[];
    totalPages: number;
    totalElements: number;
  };
  status?: string;
  time?: string;
};
 
export interface BuocXuLyRequest {
  bxlTen: string;
  bxlGhiChu?: string;
}


// ===== Danh mục Loại phương tiện =====
export interface DanhMucLoaiPhuongTien {
  used: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
  dmLptGhiChu: string | null;
  dmLptId:number;
  dmLptTen: string | null;
 
}

export interface DanhMucLoaiPhuongTienRequest {
  dmPtTen: string;
  dmPtGhiChu: string;
  dmUptId: number;
}
export interface DanhMucLoaiPhuongTienUpdate {
  
  dmLptTen: string;
  dmLptGhiChu: string; 
}

export interface DanhMucLoaiPhuongTienListResponse {
  payload: {
    items: DanhMucLoaiPhuongTien[];
    totalPages: number;
    totalElements: number;
  };
}

export interface DanhMucLoaiPhuongTienResponse {
  payload: DanhMucLoaiPhuongTien;
}

 
export interface DanhMucLoaiPhuongTienCreateRequest {
  dmLptTen: string;
  dmLptGhiChu: string;
}

export interface DanhMucLoaiPhuongTienItem {
  dmLptId: number| null;
  dmLptTen:  string | null;
  dmLptGhiChu: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
  used: boolean;
  [key: string]: unknown;
}

 // ===== Danh mục  phương tiện ===== 
export interface DanhMucPhuongTienPut {
  dmPtTen: string;        // Tên phương tiện (Ô tô, Xe tải, Xe máy...)
  dmLptId: number;        // ID loại phương tiện (liên kết với bảng loại phương tiện)
  dmPtGhiChu?: string;    // Ghi chú (có thể null hoặc optional)
}


export interface DanhMucPhuongTien {
  used: any;
  dmPtId: number;         // ID phương tiện
  dmPtTen: string;        // Tên phương tiện
  dmLptId: number;        // ID loại phương tiện
  dmPtGhiChu?: string;    // Ghi chú
}
 
export interface DanhMucPhuongTienListResponse {
  payload: any;
  numberOfElements: number;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  items: DanhMucPhuongTien[];
}
 
export interface DanhMucPhuongTienRequest {
  page: number;
  pageSize: number;
  keyWord?: string;
  dmLptId?: number;
}

 // ===== Danh mục  Thủ tục ===== 
export interface DanhMucThuTucPut {
  ttTen: string;             
  ttGhiChu?: string;     
}


export interface DanhMucThuTuc {
  ttId?: number;          
  ttTen?: string;           
  ttGhichu?: string;    
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
  used?: boolean;
  [key: string]: unknown;

}

export interface DanhMucThuTucListResponse {
  payload: any;
  numberOfElements: number;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  items: DanhMucThuTuc[];
}
 
export interface DanhMucThuTucRequest {
  page: number;
  pageSize: number;
  keyWord?: string;
  dmLptId?: number;
}



 

// ===== Thông tin Thống kê ===== 
export interface ThongKeDashBoardPut {
  tuNgay: string;     // "01/01/2025"
  denNgay: string;    // "10/10/2025"
}
export interface ThongKeBieuDoDangKiemThanhCongItem {
  ttpt: string;
  soLuongXe: number;
}

export interface ThongKeDashBoardResponse {
  time: string;
  message: string;
  status: string;
  payload: {
    tongXeDangKiemThangHienTai: number;
    soLuongXeDangKiemDat: number;
    soLuongXeDangKiemKhongDat: number;
    tiLeDangKiemDat: number;
    tiLeDangKiemKhongDat: number;
    tongPhiDangKiemThangHienTai: number;
    danhSachPhuongTienDangKiemThangHienTai: {
      lptId: number;
      lptTen: string;
      soLuotDangKiem: number;
    }[];
  };
}

// Một bản ghi phí dịch vụ đơn lẻ
export interface ThongKePhiDichVuItem {
  bienKiemSoat: string;   // Biển kiểm soát
  lptId: number;          // ID loại phương tiện
  lptTen: string;         // Tên loại phương tiện
  tongPhiDichVu: number;  // Tổng số tiền phí dịch vụ
  hsId: number;           // Hồ sơ ID
}

// Response từ API Thống kê phí dịch vụ
export interface ThongKePhiDichVuResponse {
  time: string;                          // "2025-10-20 09:21:38"
  message: string;                       // "Thành công"
  status: "OK" | "ERROR";                // Trạng thái phản hồi
  payload: ThongKePhiDichVuItem[];       // Danh sách kết quả
}

//  Body gửi lên API thống kê phí dịch vụ
export interface ThongKePhiDichVuPut {
  tuNgay: string;
  denNgay: string;
}

// export interface PhiDichVuResponse {
//   time: string;
//   message: string;
//   status: string;
//   payload: PhiDichVuItem[];
// }

export interface ThongKeHoaDonRequest {
  tuNgay: string;    // "01/01/2025"
  denNgay: string;   // "12/31/2025"
}


export interface ThongKeHoaDonPayload {
  tongSoHoaDon: number;
  tongDoanhThu: number;
  tongHoSo: number;
  tongHoSoDaThanhToan: number;
  tongHoSoChuaThanhToan: number;
}

export interface ThongKeHoaDonResponse {
  time: string;              // "2025-11-25 07:28:59"
  message: string;           // "Thành công"
  status: string;            // "OK"
  payload: ThongKePayload;
}


export interface ThongKeChiTietPhiDichVuPut {
  tuNgay: string;   // "01/01/2025"
  denNgay: string;  // "10/10/2025"
  hsId: number;     // ID hồ sơ (0, 7, v.v.)
}

export interface ChiTietPhiDichVuItem {
  danhSachPhiDichVu: never[];
  maDichVu: string;
  tenDichVu: string;
  giaTien: number;
  daThanhToan: boolean;
  phuongThucThanhToan: string | null;
  tenNhanVienThuPhi: string | null;
  ghiChu?: string | null;
  trangThaiThanhToan?: string | null;
}

export interface ChiTietPhiDichVuResponse {
  time: string;
  message: string;
  payload: ChiTietPhiDichVuItem[];
}

// ----- Thông tin phương tiện
export interface ThongTinPhuongTienCreate {
  ttcptId ?: string; 
  ttptBienkiemsoat ?:string; 
  dmPtId?: number;
  dmLptId?: number; 
}

// -- Thông tin đăng kiêm-------------
export interface ThongTinPhiDangKiem {
  tenChuXe?: string;
  ttptBienkiemsoat?: string|number;  
  ngayTiepNhan?: string|number; 
  soBienNhan?: string|number; 
  lanThu?: string|number; 
  mucThu?: string|number; 
  thueSuat?: string|number; 
  giaKD?: string|number; 
  giaCoVAT?: string|number; 
  tienThue?: string|number; 
  ngayTiepNhan?: loaiPhuongTien |number ; 
  ttcptId?: loaiPhuongTien |number ; 
  ttptId?: loaiPhuongTien | number; 

  dmLptId?: string|number; 
  dmLptTen?: string|number; 
  dmPtId?: string|number; 
  dmPtTen?: string|number; 
        
  // Cho phép thêm key khác nếu cần
  [key: string]: unknown;
};


// -- Hồ sơ đăng kiêm-------------
export interface HoSoDangKiemCreate {
  hsTenDangKiem?: string|number; 
  hsNgaytiepnhan?: string|number; 
  hsMa?: string|number; 
  bxlId?: string|number;
  ttHsId?: string|number;
  ttptId?: string|number;
  ttcptId?: string | number;
  // Cho phép thêm key khác nếu cần
  [key: string]: unknown;
};

export interface HoSoDangKiemRequest {
  page?: number;              
  pageSize?: number;         
  userIdTiepNhan?: string;   
  userIdThuPhi?: string;   
  trangThaiId?: string|number;       
  bxlId?: string|number;       
  keyWord?: string|number;           
  ttHsId?: string|number;           
  ttId?: string|number;           
  userIdThuPhi?: string|number;           
  hsLydoHuy?: string|number;           
  hsLydoBosung?: string|number;           
  version?: number;     
  tuNgay?: string;   
  denNgay?: string;  
}

export interface RepoIn<T> {
  totalItems: number;
  numberOfElements: number;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  items: HoSoDangKiem[];
}

//ádasd
export interface HoSoDangKiem {
  ttId?: number;
  ttHsTen: string;
  ttptTen: string;
  hsId: number;                    // ID hồ sơ
  hsTenDangKiem: string;           // Tên đăng kiểm
  hsNgaytiepnhan: string;          // Ngày tiếp nhận (ISO string, ví dụ: "2025-09-23")
  hsMa: string;                    // Mã hồ sơ
  bxlId: number;                   // ID bưu xếp loại hoặc quy trình
  ttHsId: number;                  // ID trạng thái hồ sơ
  userIdTiepNhan: string;          // ID người tiếp nhận
  userIdThuPhi: string;            // ID người thu phí
  ttptBienkiemsoat: string;        // Biển kiểm soát phương tiện
  ttcptTen: string;                // Tên chủ phương tiện
  ttcptCccd: string;               // CCCD chủ phương tiện
  version: number | null;          // Phiên bản dữ liệu (nếu có)
  capNhatThanhCong: boolean;       // Trạng thái cập nhật thành công hay không
  hsLyDoHuy: string | null;        // Lý do hủy (nếu có)
  hsLyDoBoSung: string | null;     // Lý do bổ sung (nếu có)
  hinhThucThanhToan?: string | null;      
  soTien?: string | number| null;      
  ttcptSodienthoai?: string | number| null;      
  ttcptMasothue?: string | number| null;      
  trangThaiNo?: boolean |string | number| null;      
}
 
export interface HoSoDangKiemResponse<T> {
  payload: RepoIn<T>;
}

// -- Hồ sơ phí dịch vụ -------------
export interface HoSoPhiDichVuCreate {
  hsId ?: string|number; 
  pdvId?: string|number; 
  phiThucTe?: number |string; 
  tenPhi?: string|number; 
  lanThu?: string|number; 
  accountGuidThanhToan?: string|number; 
  loaiPhiId?: number |string; 
  trangThaiThanhToan?: boolean |number|string; 
  hinhThucThanhToan?:boolean|number |string; 
  trangThaiNo?:boolean; 
  
};


export interface HoSoPhiDichVuQuery {
  page?: number; // Trang hiện tại (VD: 1)
  pageSize?: number; // Kích thước trang (VD: 20)
  userIdTiepNhan?: string; // GUID người tiếp nhận
  hsId?: number | string; // ID hồ sơ đăng kiểm
}

export interface HoSoPhiDichVuItem {
  fkey?: any;
  hsId: number;
  pdvId: number;
  phiThucTe: number;
  trangThaiThanhToan: boolean | number | null;
  thoiGianThanhToan: string | null;
  hinhThucThanhToan: number | null;
  hinhThucThanhToanTen: string | null;
  tenPhi: string;
  lanThu: string | number;
  loaiPhiId: number | null;
  trangThaiPhatHanhHoaDon: boolean | number | null;
  thoiGianPhatHanhHoaDon: string | null;
  loaiPhiTen: string | null;
  trangThaiNo: boolean | number | null;
}

export interface HoSoPhiDichVuResponse {
  payload?: {
    [key: string]: unknown 
    items: HoSoPhiDichVuItem[];
  };
  status?: string;
  numberOfElements: number;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  items: HoSoPhiDichVuItem[];
}


// -- Phí dịch vụ -------------------------
export interface PhiDichVuRequest {
  page: number;        // Số trang hiện tại
  pageSize: number;    // Số phần tử mỗi trang
  keyWord: string;     // Từ khóa tìm kiếm, có thể là '*'
  dmLptId: number;     // ID loại phương tiện
  dmLpId: number;      // ID loại phí
  [key: string]: unknown 
}

export interface PhiDichVuCreate { 
  pdvChiphi?: number;       
  [key: string]: unknown;  
  pdvNoidung: string;               // Tên phí dịch vụ
  pdvKhoanphi: string;              // Khoản phí sau thuế
  pdvKhoanphiTruocthue: string;     // Khoản phí trước thuế
  pdvThue: string;                  // Thuế %
  pdvTuychinh: boolean;             // Trạng thái tùy chỉnh
  pdvGhichu?: string | null;        // Ghi chú
  organizationGuid: string;         // GUID đơn vị
  dmLpId: number;                   // ID loại phí
  dmLptId: number;          
}

export interface PhiDichVuResponse {
  time?: string;
  message?: string;
  status?: string;
  payload: {
    numberOfElements: number;
    currentPage: number;
    totalPages: number;
    totalElements: number;
    size: number;
    first: boolean;
    last: boolean;
    empty: boolean;
    items?: PhiDichVuItem[];
    [key: string]: unknown 
  };
}

export interface PhiDichVuItem {
  pdvId?: number;
  pdvNoidung?: string;
  pdvKhoanphi?: string;
  pdvTuychinh?: boolean;
  pdvChiphi?: number;
  organizationGuid?: string;
  dmLpId?: number;
  dmLptId?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
  used?: boolean;
  pdvGhichu?:string | null;
  dmLpTen ?:string | null;
  pdvKhoanphiTruocthue ?:string | null;
  pdvThue ?:string | null;
  [key: string]: unknown 
}

// -- Danh mục loại phí-------------------------
export interface LoaiPhiRequest {
  page: number;        // Số trang hiện tại
  pageSize: number;    // Số phần tử mỗi trang
  keyWord: string;     // Từ khóa tìm kiếm, có thể là '*' 
  [key: string]: unknown 
}

export interface LoaiPhiCreateRequest {
  loaiPhiTen: string;
  loaiPhiGhiChu: string;
}

 export interface DefaultAPIResponse<T = any> {
  time: string;
  message: string;
  status: string;
  payload: T;
}


// Response type
export interface LoaiPhiResponse {
  payload: {
    numberOfElements: number;
    currentPage: number;
    totalPages: number;
    totalElements: number;
    size: number;
    first: boolean;
    last: boolean;
    empty: boolean;
    items: LoaiPhiItem[];
    [key: string]: unknown;
  };
}

// Item type
export interface LoaiPhiItem {
  loaiPhiId: number;
  loaiPhiTen: string;
  loaiPhiGhiChu: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
  used: boolean;
  [key: string]: unknown;
}


// -- Thanh toán VietQR -------------------------
export interface ThanhToanRequest {
  maNganHang: string;
  soTaiKhoanThuHuong: string;
  soTienCanThanhToan: string;
  hoTenTaiKhoanThuHuong: string;
  hsId: number;
  pdvId?: number[];
  danhSachPdv?: {
      pdvId: number,
      lanThu: number
  }[];
  isHoSoNo?: boolean;
}

// -- Setting System Info -------------------------
export interface ConfigSystemRequest {
  group: string;  // group: nhóm tìm kiếm, ví dụ "app", "email_template"
  keyword: string; // keyword: tìm theo key, ví dụ "app.name", "smtp.email.smtp-server"
  [key: string]: unknown;
}

export interface ConfigSystemResponse {
  time: string;  // Thời gian trả về
  message: string;  // Thông báo
  status: string;  // Trạng thái
  payload: ConfigItem[];  // Mảng các đối tượng config
}

export interface ConfigItem {
  level: string;  // Mức độ của cấu hình (SYSTEM, USER, ...)
  value: string;  // Giá trị cấu hình (ví dụ: Tên đơn vị, Địa chỉ email)
  config: ConfigDetail;  // Thông tin chi tiết của config
}

export interface ConfigDetail {
  id: number;  // ID của cấu hình
  guid: string;  // GUID của cấu hình
  key: string;  // Khóa cấu hình (ví dụ: app.name, smtp.email.smtp-server)
  type: string;  // Kiểu dữ liệu (text-input, check-box, img, file-input, ...)
  meta: any;  // Metadata, nếu có
  description: string;  // Mô tả cấu hình
  group: string;  // Nhóm cấu hình (ví dụ: app, email_template, zalo, ...)
}
export type ConfigSystemUpdateRequest = {
  configId: number; // ID của cấu hình
  value: string;    // Giá trị mới của cấu hình
  [key: string]: unknown;
};

export interface ViewConfigData {
  title: string;
  color: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  logo: string;
  [key: string]: unknown;
}

// -- Setting System Info -------------------------
export interface ConfigPayMentRequest {
  group: string;  // group: nhóm tìm kiếm, ví dụ "app", "email_template"
  keyword: string; // keyword: tìm theo key, ví dụ "app.name", "smtp.email.smtp-server"
  organizationId: number; // keyword: tìm theo key, ví dụ "app.name", "smtp.email.smtp-server"
  [key: string]: unknown;
}
export interface ConfigPayMentResponse {
  time: string;   
  message: string;   
  status: string;   
  payload: ConfigPaymentItem[];   
  [key: string]: unknown;
}

export interface ConfigPaymentItem {
  value: string;   
  key: string;   
  featureId: string;  
  config: number;   
  [key: string]: unknown;
}

export type ConfigPaymentUpdateRequest = {
  configId: number; // ID của cấu hình
  value: string;    // Giá trị mới của cấu hình
  organizationId:number
  [key: string]: unknown;
};

// -- Setting Fee Info -------------------------
export interface ConfigFeeRequest {
  group: string;  // group: nhóm tìm kiếm, ví dụ "app", "email_template"
  keyword: string; // keyword: tìm theo key, ví dụ "app.name", "smtp.email.smtp-server"
  organizationId: number; // keyword: tìm theo key, ví dụ "app.name", "smtp.email.smtp-server"
  [key: string]: unknown;
}
export interface ConfigFeeResponse {
  time: string;   
  message: string;   
  status: string;   
  payload: ConfigFeeItem[];   
  [key: string]: unknown;
}

export interface ConfigFeeItem {
  value: string;   
  key: string;   
  featureId: string;  
  config: number;   
  [key: string]: unknown;
}

export type ConfigFeeUpdateRequest = {
  configId: number; // ID của cấu hình
  value: string;    // Giá trị mới của cấu hình
  organizationId:number
  [key: string]: unknown;
};

 // ============================
// REQUEST USER TYPE
// ============================
export interface FetchUsersRequest {
  page: number;
  pageSize: number;
  organizationId: number;
  roleId?: number;
  tuNgay?: string;
  denNgay?: string;
  thanhphoId?: number;
  huyenId?: number;
  phuongId?: number;
  accountType?: number;
  status?: number;
  filter?: string;
  fetchMetadata?: boolean;
  fetchOrganization?: boolean;
  fetchRecursive?: boolean;
  inOrganization?: number;
}

export interface RoleOfUser {
  guid: string;
  roleId: number;
  roleName: string;
  roleDescription: string;
  key: string | null;
}

export interface OrganizationOfUser {
  guid: string;
  id: number;
  slug: string;
  name: string;
  code: string | null;
  localCode: string | null;
  level: number;
  parentId: number;
  type: string;
  primary: boolean;
  treepath: string;
  staticOrganizationGuid: string | null;
  children: OrganizationOfUser[] | null;
  roles: RoleOfUser[];
}

export interface CaNhan {
  id: number;
  cccd: string | null;
  cmnd: string | null;
  diaChiChiTiet: string | null;
  diaChi: string | null;
  thanhPhoId: number;
  huyenId: number;
  phuongId: number;
  ten: string;
  gioiTinh: number;
  ngaySinh: string | null;
  email: string;
  sdt: string | null;
  accountId: number;
  maso: string | null;
  qtMa: string | null;
  dtMa: string | null;
}

export interface UserItem {
  guid: string;
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  type: number;
  status: number;
  requireUpdate: boolean;
  caNhan: CaNhan | null;
  toChuc: any;
  thongTinBoSung: any;
  organizations: OrganizationOfUser[];
  vnconnectSub: any;
}

export interface UserOrganizationsPagination {
  numberOfElements: number;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  items: UserItem[];
}

export interface UserByOrganizationsResponse {
  time: string;
  message: string;
  status: string;
  payload: UserOrganizationsPagination;
}

// =============================
// USER DETAIL RESPONSE BY GUID
// =============================
export interface AccountDetailResponse {
  time: string;
  message: string;
  status: string;
  payload: AccountDetailPayload;
}

export interface AccountDetailPayload {
  guid: string;
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  type: number;
  status: number;
  requireUpdate: boolean;
  caNhan: {
    id: number;
    cccd: string | null;
    cmnd: string | null;
    diaChiChiTiet: string | null;
    diaChi: string | null;
    thanhPhoId: number;
    huyenId: number;
    phuongId: number;
    ten: string;
    gioiTinh: number; // 0 = Nam, 1 = Nữ (có thể tùy backend)
    ngaySinh: string | null;
    email: string | null;
    sdt: string | null;
    accountId: number;
    maso: string | null;
    qtMa: string | null;
    dtMa: string | null;
  };
  toChuc: any | null;
  thongTinBoSung: any | null;
  organizations: {
    guid: string;
    id: number;
    slug: string;
    name: string;
    code: string | null;
    localCode: string | null;
    level: number;
    parentId: number;
    type: string;
    primary: boolean;
    treepath: string;
    staticOrganizationGuid: string | null;
    children: any[] | null;
    roles: { roleName: string }[] | null;
  }[];
  vnconnectSub: any | null;
}
// src/types/hoadon.ts

export interface HoaDonPaginateRequest {
  page: number;
  pageSize: number;

  trangThaiId?: number;
  bxlId?: number;
  ttId?: number;
  tttld?: number;

  isPublishedInvoice?: number;
  keyWord?: string;

  tuNgay: string;   // YYYY-MM-DD
  denNgay: string;  // YYYY-MM-DD
}
export interface ThongTinHoaDonXuat {
  ttNguoiMuaHoTen: string | null;
  tsiThoiGianPhatHanhHoaDon: string | null;
  createdAt: number | null;
  trangThaiPhatHanhHoaDon: string | null;
  fkey: string | null;
}
export interface HoaDonItem {
  hsId: number;
  hsTenDangKiem: string | null;
  hsNgaytiepnhan: string | null;
  hsMa: string | null;

  bxlId: number | null;
  ttHsId: number | null;
  ttId: number | null;
  dmPtId: number | null;

  ttptId: number | null;
  ttcptId: number | null;

  ttptTen: string | null;
  ttHsTen: string | null;

  userIdTiepNhan: string | null;
  userIdThuPhi: string | null;

  ttptBienkiemsoat: string | null;
  ttcptTen: string | null;

  ttcptCccd: string | null;
  ttcptSodienthoai: string | null;
  ttcptMasothue: string | null;

  organizationGuid: string | null;

  version: number | null;
  capNhatThanhCong: boolean;
  hsLyDoHuy: string | null;
  hsLyDoBoSung: string | null;

  danhSachPhi: any | null;

  thongTinHoaDonXuat: ThongTinHoaDonXuat[];
}
export interface PaginateResponse<T> {
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
export interface HoaDonPaginateResponse {
  time: string;
  message: string;
  status: string;
  payload: PaginateResponse<HoaDonItem>;
}