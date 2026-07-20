// src/services/dashboard/dashboardService.ts
import API_URLS from "@/constants/apiUrls";
import { post, get, put } from "@/utils/axios";

export interface PaginateRequest {
  page: number | string;
  pageSize: number | string;
  keyWord?: string;
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  status?: string | number;
  payload?: {
    items: T[];
    totalPages: number;
    totalElements: number;
    size?: number;
    currentPage?: number;
  };
}

export interface LuotRaVaoRequest {
  tuNgay: string;
  denNgay: string;
  groupBy: string; // 'DAY' | 'HOUR' | 'MONTH' etc.
}

export interface LuotRaVaoItem {
  time?: string;
  thoiGian?: string;
  vao?: number;
  soLuotVao?: number;
  ra?: number;
  soLuotRa?: number;
  name?: string;
  [key: string]: any;
}

export interface StrangerItem {
  id?: string | number;
  detectTime?: string;
  image?: string;
  name?: string;
  createdDate?: string;
  [key: string]: any;
}

export interface NguoiLaPaginateRequest {
  page: string;
  pageSize: string;
  tuNgay: string;    // Format: MM/dd/yyyy
  denNgay: string;   // Format: MM/dd/yyyy
  maKhu: string;     // -1 = tất cả
}

export interface NguoiLaItem {
  id?: string | number;
  detectTime?: string;
  thoiGian?: string;
  image?: string;
  imageUrl?: string;
  maKhu?: string;
  tenKhu?: string;
  viTri?: string;
  cong?: string;
  trangThai?: string;
  [key: string]: any;
}

export interface NguoiLaPagedResponse {
  time?: string;
  message?: string;
  status?: string;
  payload?: {
    items?: NguoiLaItem[];
    content?: NguoiLaItem[];
    numberOfElements?: number;  //  API field
    totalElements?: number;     // Fallback
    totalPages?: number;
    size?: number;
    currentPage?: number;
    number?: number;
  };
}

// Paginate danh sách người lạ
export const fetchNguoiLaPaginate = async (params: NguoiLaPaginateRequest): Promise<NguoiLaPagedResponse> => {
  try {
    const res = await post<NguoiLaPagedResponse>(API_URLS.faceDetect.paginateNguoiLa, params);
    return res;
  } catch (error) {
    console.error("Error fetching stranger pagination:", error);
    throw error;
  }
};

// Lấy danh sách sinh viên ký túc xá
export const fetchSinhVienPaginate = async (params: PaginateRequest): Promise<PaginatedResponse<any>> => {
  try {
    const res = await post<PaginatedResponse<any>>(API_URLS.danhMucKtx.sinhVien.paginate, params);
    return res;
  } catch (error) {
    console.error("Error fetching sinh vien pagination:", error);
    throw error;
  }
};

// Lấy danh sách phòng ký túc xá
export const fetchPhongPaginate = async (params: PaginateRequest): Promise<PaginatedResponse<any>> => {
  try {
    const res = await post<PaginatedResponse<any>>(API_URLS.danhMucKtx.phong.paginate, params);
    return res;
  } catch (error) {
    console.error("Error fetching phong pagination:", error);
    throw error;
  }
};

// 4. Lấy danh sách khu trong ký túc xá
export const fetchKhuPaginate = async (params: PaginateRequest): Promise<PaginatedResponse<any>> => {
  try {
    const res = await post<PaginatedResponse<any>>(API_URLS.danhMucKtx.khu.paginate, params);
    return res;
  } catch (error) {
    console.error("Error fetching khu pagination:", error);
    throw error;
  }
};

// 5. Thống kê lượt ra vào
export const fetchThongKeLuotRaVao = async (params: LuotRaVaoRequest): Promise<any> => {
  try {
    const res = await post<any>(API_URLS.thongKeKtx.luotRaVao, params);
    return res;
  } catch (error) {
    console.error("Error fetching thong ke luot ra vao:", error);
    throw error;
  }
};

// 6. Lấy danh sách sự kiện ra vào
export const fetchSuKienRaVaoPaginate = async (page: number, pageSize: number): Promise<any> => {
  try {
    const res = await get<any>(API_URLS.thongKeKtx.suKienRaVaoPaginate, { page, pageSize });
    return res;
  } catch (error) {
    console.error("Error fetching su kien ra vao paginate:", error);
    throw error;
  }
};

// 6b. Lấy lịch sử ra vào theo từng ngày (API đúng để hiển thị bảng lịch sử Dashboard)
// End
// point: POST /face-detect-service/face-web-check-time/paginate
// Body: { page, pageSize, maNhom, maKhu, keyword, ngay }
export const fetchLichSuRaVaoTheoNgay = async (params: {
  page: number;
  pageSize: number;
  ngay: string;    // Ngày cụ thể, format: MM/DD/YYYY
  maKhu?: string;  // -1 = tất cả
  maNhom?: string; // -1 = tất cả
  keyword?: string;
}): Promise<any> => {
  try {
    const body = {
      page: params.page,
      pageSize: params.pageSize,
      ngay: params.ngay,
      maKhu: params.maKhu ?? "-1",
      maNhom: params.maNhom ?? "-1",
      keyword: params.keyword ?? "",
    };
    const res = await post<any>(API_URLS.faceDetect.paginateLichSuRaVao, body);
    return res;
  } catch (error) {
    console.error(`Error fetching lich su ra vao for ngay=${params.ngay}:`, error);
    return null;
  }
};

// 7. Lấy danh sách sinh viên bị cấm
export const fetchSinhVienCamPaginate = async (params: PaginateRequest): Promise<any> => {
  try {
    const res = await post<any>(API_URLS.danhMucKtx.sinhVienBiCam.paginate, params);
    return res;
  } catch (error) {
    console.error("Error fetching banned student pagination:", error);
    throw error;
  }
};

// 8. Thêm/sửa sinh viên bị cấm
export const createOrUpdateSinhVienCam = async (data: any, isUpdate = false): Promise<any> => {
  try {
    if (isUpdate) {
      // UPDATE: dùng PUT /ktx-sinh-vien-cam/{camId}
      const camId = data.camId;
      const res = await put<any>(`${API_URLS.danhMucKtx.sinhVienBiCam.update}/${camId}`, data);
      return res;
    } else {
      // CREATE: dùng POST /ktx-sinh-vien-cam/create
      const res = await post<any>(API_URLS.danhMucKtx.sinhVienBiCam.create, data);
      return res;
    }
  } catch (error) {
    console.error(`Error ${isUpdate ? 'updating' : 'creating'} banned student:`, error);
    throw error;
  }
};

// 9. Thống kê lượt ra vào sinh viên nợ học phí / bị cấm
export const fetchThongKeSvBiCamNoPhi = async (params: {
  tuNgay?: string;
  denNgay?: string;
  groupBy?: string;
  page?: number | string;
  pageSize?: number | string;
  keyWord?: string;
  " tuNgay"?: string;
  " denNgay"?: string;
  " groupBy"?: string;
}): Promise<any> => {
  try {
    const res = await post<any>(API_URLS.thongKeKtx.svBiCamNoPhi, params);
    return res;
  } catch (error) {
    console.error("Error fetching thong ke sv bi cam / no phi:", error);
    throw error;
  }
};

// 10. Thống kê theo mã số (Sinh viên hoặc cán bộ)
export const fetchThongKeTheoMaSo = async (params: { tuNgay: string; denNgay: string; maSo: string }): Promise<any> => {
  try {
    const res = await post<any>(API_URLS.thongKeKtx.theoMaSo, params);
    return res;
  } catch (error) {
    console.error("Error fetching thong ke theo ma so:", error);
    throw error;
  }
};

// 11. Thống kê lượt ra vào người lạ (POST)
export const fetchThongKeNguoiLa = async (params: { tuNgay: string; denNgay: string; maKhu: string }): Promise<any> => {
  try {
    const res = await post<any>(API_URLS.thongKeKtx.nguoiLa, params);
    return res;
  } catch (error) {
    console.error("Error fetching thong ke nguoi la:", error);
    throw error;
  }
};

// 12. Thống kê chi tiết người lạ (GET)
export const fetchThongKeChiTietNguoiLa = async (params: any): Promise<any> => {
  return get<any>(API_URLS.thongKeKtx.nguoiLa, params);
};

// 13. Dashboard summary (POST) - sử dụng endpoint thong-ke/luot-ra-vao để lấy tổng quan
export const fetchDashboardSummary = async (params: { tuNgay: string; denNgay: string }): Promise<any> => {
  try {
    const payload = {
      tuNgay: params.tuNgay,
      denNgay: params.denNgay,
      groupBy: "DAY",
    };
    const res = await post<any>(API_URLS.thongKeKtx.luotRaVao, payload);
    return res;
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    throw error;
  }
};


