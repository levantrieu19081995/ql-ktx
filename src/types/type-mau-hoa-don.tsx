/* -------------------------------
  Request params
---------------------------------*/
export interface MauHoaDonQueryParams {
  page: number;
  pageSize: number;
  keyWord?: string;
}

/* -------------------------------
  Item trong danh sách
---------------------------------*/
export interface MauHoaDonItem {
  status?: string;
  mauHoadonId?: number;
  mauHoadonMauso?: string;
  mauHoadonKyhieu?: string;
  mauHoadonGhichu?: string;
  mauHoaDonGhiChu?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
}
export interface MauHoaDonItem {
  mauHoadonId?: number;
  mauHoadonMauso?: string;
  mauHoadonKyhieu?: string;
  mauHoadonGhichu?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
}

/* -------------------------------
   Cấu trúc response tổng thể
---------------------------------*/
export interface MauHoaDonResponse {
  time: string;
  message: string;
  status: string;
  payload: {
    numberOfElements: number;
    currentPage: number;
    totalPages: number;
    totalElements: number;
    size: number;
    first: boolean;
    last: boolean;
    empty: boolean;
    items: MauHoaDonItem[];
  };
}
