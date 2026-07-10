import dayjs from 'dayjs';

const AUTH_HEADER = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInR5cGUiOjEsImd1aWQiOiI5YTFiZTIzNS05OGJhLTQxOTYtOTMyYi0xMmY0NTc3NjNmYjQiLCJpZCI6MSwiaXNzIjoiaHR0cDovL2N1c2Nzb2Z0LmNvbS8iLCJpYXQiOjE3ODE3NDQ2NTQsImV4cCI6MjA5NzEwNDY1NH0.h70KwFf0rL5cSyyVlBHbadx5bl_7QXYN2VEIaC987lE';
const BASE_URL = 'http://172.16.20.177:53009';

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

      const res = await fetch(`https://qldaotaolaixe.cusc.vn/ktx-service/ktx-dm-sinh-vien/paginate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': AUTH_HEADER
        },
        body: JSON.stringify(requestPayload)
      });
      if (!res.ok) return { items: [], totalElements: 0 };
      const data = await res.json();
      if (data?.status !== 'OK') return { items: [], totalElements: 0 };
      return {
        items: (data?.payload?.items || []) as SinhVienItem[],
        totalElements: data?.payload?.totalElements || 0
      };
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
      const res = await fetch(`${BASE_URL}/ktx-service/ktx-dm-phong/paginate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': AUTH_HEADER
        },
        body: JSON.stringify({
          page: String(body.page),
          pageSize: String(body.pageSize),
          maKhu: body.maKhu,
          maPhong: body.maPhong
        })
      });
      if (!res.ok) return { items: [], totalElements: 0 };
      const data = await res.json();
      if (data?.status !== 'OK') return { items: [], totalElements: 0 };
      return {
        items: (data?.payload?.items || []) as PhongItem[],
        totalElements: data?.payload?.totalElements || 0
      };
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
      const res = await fetch(`${BASE_URL}/ktx-service/ktx-dm-khu/paginate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': AUTH_HEADER
        },
        body: JSON.stringify({
          page: String(body.page),
          pageSize: String(body.pageSize),
          maKhu: body.maKhu
        })
      });
      if (!res.ok) return { items: [], totalElements: 0 };
      const data = await res.json();
      if (data?.status !== 'OK') return { items: [], totalElements: 0 };
      return {
        items: (data?.payload?.items || []) as KhuItem[],
        totalElements: data?.payload?.totalElements || 0
      };
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
      const res = await fetch(`${BASE_URL}/ktx-service/ktx-sinh-vien-cam/paginate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': AUTH_HEADER
        },
        body: JSON.stringify({
          page: String(body.page),
          pageSize: String(body.pageSize),
          maSinhVien: body.maSinhVien
        })
      });
      if (!res.ok) return { items: [], totalElements: 0 };
      const data = await res.json();
      if (data?.status !== 'OK') return { items: [], totalElements: 0 };
      return {
        items: (data?.payload?.items || []) as SinhVienCamItem[],
        totalElements: data?.payload?.totalElements || 0
      };
    } catch {
      return { items: [], totalElements: 0 };
    }
  }
};
