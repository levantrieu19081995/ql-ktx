import dayjs from 'dayjs';
import { post } from '@/utils/axios';
import API_URLS from '@/constants/apiUrls';

// Gọi paginate qua axios dùng chung (proxy + token + API_BASE_URL từ .env.local)
async function paginate<T>(url: string, payload: Record<string, any>) {
  try {
    const data = await post<any>(url, payload);
    if (data?.status !== 'OK') return { items: [] as T[], totalElements: 0 };
    return {
      items: (data?.payload?.items || []) as T[],
      totalElements: data?.payload?.totalElements || 0,
    };
  } catch {
    return { items: [] as T[], totalElements: 0 };
  }
}

export interface SinhVienItem {
  sinhVienId: number;
  maSinhVien: string;
  hoTen: string;
  lop: string;
  maPhong: string;
  maKhu: string;
  tenKhu: string;
}

export interface PhongItem {
  phongId: number;
  khuId: number;
  phongMa: string;
  sucChua: number;
  soChoDangCo: string;
  maKhu: string;
  tenKhu: string;
}

export interface KhuItem {
  khuId: number;
  khuTen: string;
  khuMa: string;
  soLuongPhong: string;
  guid: string;
  moTa?: string;
}

export interface SinhVienCamItem {
  camId: number;
  sinhVienId: number;
  lyDo: string;
  ngayBatDau: number;
  ngayKetThuc: number | null;
  maSinhVien: string;
}

export const categoryService = {
  layDanhSachSinhVien: async (body: {
    page: number;
    pageSize: number;
    maKhu: string;
    maPhong: string;
    maSinhVien?: string;
    hoTen?: string;
  }) => {
    try {
      const requestPayload: any = {
        page: String(body.page),
        pageSize: String(body.pageSize),
        maKhu: body.maKhu || "-1",
        maPhong: body.maPhong || "-1",
      };
      if (body.maSinhVien && body.maSinhVien.trim() !== '') {
        requestPayload.maSinhVien = body.maSinhVien.trim();
      }
      if (body.hoTen && body.hoTen.trim() !== '') {
        requestPayload.hoTen = body.hoTen.trim();
      }

      return await paginate<SinhVienItem>(API_URLS.danhMucKtx.sinhVien.paginate, requestPayload);
    } catch {
      return { items: [], totalElements: 0 };
    }
  },

  layDanhSachPhong: async (body: {
    page: number;
    pageSize: number;
    maKhu: string;
    maPhong: string;
  }) => {
    try {
      return await paginate<PhongItem>(API_URLS.danhMucKtx.phong.paginate, {
        page: String(body.page),
        pageSize: String(body.pageSize),
        maKhu: body.maKhu,
        maPhong: body.maPhong,
      });
    } catch {
      return { items: [], totalElements: 0 };
    }
  },

  layDanhSachKhu: async (body: {
    page: number;
    pageSize: number;
    maKhu: string;
  }) => {
    try {
      return await paginate<KhuItem>(API_URLS.danhMucKtx.khu.paginate, {
        page: String(body.page),
        pageSize: String(body.pageSize),
        maKhu: body.maKhu,
      });
    } catch {
      return { items: [], totalElements: 0 };
    }
  },

  layDanhSachSinhVienCam: async (body: {
    page: number;
    pageSize: number;
    maSinhVien: string;
  }) => {
    try {
      return await paginate<SinhVienCamItem>(API_URLS.danhMucKtx.sinhVienBiCam.paginate, {
        page: String(body.page),
        pageSize: String(body.pageSize),
        maSinhVien: body.maSinhVien,
      });
    } catch {
      return { items: [], totalElements: 0 };
    }
  }
};
