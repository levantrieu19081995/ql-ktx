import { HistoryItem } from '../../../types/type-history';
import dayjs from 'dayjs';

const AUTH_HEADER = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInR5cGUiOjEsImd1aWQiOiI5YTFiZTIzNS05OGJhLTQxOTYtOTMyYi0xMmY0NTc3NjNmYjQiLCJpZCI6MSwiaXNzIjoiaHR0cDovL2N1c2Nzb2Z0LmNvbS8iLCJpYXQiOjE3ODE3NDQ2NTQsImV4cCI6MjA5NzEwNDY1NH0.h70KwFf0rL5cSyyVlBHbadx5bl_7QXYN2VEIaC987lE';
const BASE_URL = 'https://qldaotaolaixe.cusc.vn/face-detect-service';

export const dichVuNguoiLa = {
  layDanhSachNguoiLa: async (boLoc?: {
    tuNgay?: string;
    denNgay?: string;
    maKtx?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: HistoryItem[]; totalPages: number; totalElements: number }> => {
    try {
      const page = boLoc?.page || 1;
      const pageSize = boLoc?.pageSize || 10;
      const tuNgayStr = boLoc?.tuNgay ? dayjs(boLoc.tuNgay).format('MM/DD/YYYY') : "06/01/2026";
      const denNgayStr = boLoc?.denNgay ? dayjs(boLoc.denNgay).format('MM/DD/YYYY') : dayjs().format('MM/DD/YYYY');
      const maKhu = boLoc?.maKtx === "-1" ? "" : (boLoc?.maKtx || "");

      const res = await fetch(`${BASE_URL}/face-web-check-time/paginate-nguoi-la`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': AUTH_HEADER
        },
        body: JSON.stringify({
          page: Number(page),
          pageSize: Number(pageSize),
          tuNgay: tuNgayStr,
          denNgay: denNgayStr,
          maKhu: maKhu
        })
      });

      if (!res.ok) {
        console.error(`layDanhSachNguoiLa API error: ${res.status}`);
        return { items: [], totalPages: 1, totalElements: 0 };
      }

      const data = await res.json();
      if (data?.status !== 'OK') {
        console.error(`layDanhSachNguoiLa status not OK:`, data);
        return { items: [], totalPages: 1, totalElements: 0 };
      }

      const items = data?.payload?.items || [];
      const mappedItems = items.map((item: any): HistoryItem => {
        const timeStr = item.timecheck ? dayjs(item.timecheck).format("YYYY-MM-DD HH:mm:ss") : `${dayjs(item.ngay, "DD/MM/YYYY").format("YYYY-MM-DD")} ${item.thoigian}`;
        return {
          id: item.pathImage + '_' + item.timecheck + '_' + Math.random(),
          thoiGian: timeStr,
          mssv: "Người lạ",
          hoVaTen: "Người lạ",
          duongDanAnhChup: item.pathImage || "",
          duongDanAnhDaiDien: "",
          loai: "IN",
          maKtx: item.maKhu || "",
          tenKtx: item.tenKhu || "",
          maPhong: "",
          tenPhong: "",
          thietBi: item.cameraName || "",
          loaiDoiTuong: "Người lạ",
          trangThaiSinhVien: "BINH_THUONG",
          trangThaiHienDien: "CO_MAT",
          ngayNguoiLa: item.ngay || "",
          gioNguoiLa: item.thoigian || "",
          cameraNguoiLa: item.camera || undefined
        };
      });

      return {
        items: mappedItems,
        totalPages: data?.payload?.totalPages || 1,
        totalElements: data?.payload?.totalElements || 0
      };
    } catch (err) {
      console.error(`layDanhSachNguoiLa error:`, err);
      return { items: [], totalPages: 1, totalElements: 0 };
    }
  }
};
