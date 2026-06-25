// src/services/dashboard/dashboardService.ts
import { post, get } from "@/utils/axios";

export interface PaginateRequest {
  page: number;
  pageSize: number;
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

// 1. Paginate danh sách người lạ
export const fetchNguoiLaPaginate = async (params: PaginateRequest): Promise<PaginatedResponse<StrangerItem>> => {
  try {
    const res = await post<PaginatedResponse<StrangerItem>>("/face-detect-service/face-web-check-time/paginate-nguoi-la", params);
    return res;
  } catch (error) {
    console.error("Error fetching stranger pagination:", error);
    throw error;
  }
};

// 2. Lấy danh sách sinh viên ký túc xá
export const fetchSinhVienPaginate = async (params: PaginateRequest): Promise<PaginatedResponse<any>> => {
  try {
    const res = await post<PaginatedResponse<any>>("/ktx-service/ktx-dm-sinh-vien/paginate", params);
    return res;
  } catch (error) {
    console.error("Error fetching sinh vien pagination:", error);
    throw error;
  }
};

// 3. Lấy danh sách phòng ký túc xá
export const fetchPhongPaginate = async (params: PaginateRequest): Promise<PaginatedResponse<any>> => {
  try {
    const res = await post<PaginatedResponse<any>>("/ktx-service/ktx-dm-phong/paginate", params);
    return res;
  } catch (error) {
    console.error("Error fetching phong pagination:", error);
    throw error;
  }
};

// 4. Lấy danh sách khu trong ký túc xá
export const fetchKhuPaginate = async (params: PaginateRequest): Promise<PaginatedResponse<any>> => {
  try {
    const res = await post<PaginatedResponse<any>>("/ktx-service/ktx-dm-khu/paginate", params);
    return res;
  } catch (error) {
    console.error("Error fetching khu pagination:", error);
    throw error;
  }
};

// 5. Thống kê lượt ra vào
export const fetchThongKeLuotRaVao = async (params: LuotRaVaoRequest): Promise<any> => {
  try {
    const res = await post<any>("/ktx-service/thong-ke/luot-ra-vao", params);
    return res;
  } catch (error) {
    console.error("Error fetching thong ke luot ra vao:", error);
    throw error;
  }
};

// 6. Lấy danh sách sự kiện ra vào
export const fetchSuKienRaVaoPaginate = async (page: number, pageSize: number): Promise<any> => {
  try {
    const res = await get<any>("/ktx-su-kien-ra-vao/paginate", { page, pageSize });
    return res;
  } catch (error) {
    console.error("Error fetching su kien ra vao paginate:", error);
    throw error;
  }
};

