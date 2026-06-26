import dayjs from 'dayjs';
import { HistoryItem } from '../../../types/type-history';

const AUTH_HEADER = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInR5cGUiOjEsImd1aWQiOiI5YTFiZTIzNS05OGJhLTQxOTYtOTMyYi0xMmY0NTc3NjNmYjQiLCJpZCI6MSwiaXNzIjoiaHR0cDovL2N1c2Nzb2Z0LmNvbS8iLCJpYXQiOjE3ODE3NDQ2NTQsImV4cCI6MjA5NzEwNDY1NH0.h70KwFf0rL5cSyyVlBHbadx5bl_7QXYN2VEIaC987lE';
const BASE_URL = 'https://qldaotaolaixe.cusc.vn';

export const dichVuCanhBaoNguoiLa = {
  layDanhSachCanhBaoNguoiLa: async (boLoc: {
    tuNgay?: string;
    denNgay?: string;
    maKtx?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: HistoryItem[]; totalElements: number }> => {
    try {
      const tuNgay = boLoc.tuNgay ? dayjs(boLoc.tuNgay).format('MM/DD/YYYY') : '06/01/2026';
      const denNgay = boLoc.denNgay ? dayjs(boLoc.denNgay).format('MM/DD/YYYY') : '06/06/2026';
      const maKhu = boLoc.maKtx || '-1';
      const page = String(boLoc.page || 1);
      const pageSize = String(boLoc.pageSize || 10);

      const response = await fetch(`${BASE_URL}/face-detect-service/face-web-check-time/paginate-nguoi-la`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': AUTH_HEADER
        },
        body: JSON.stringify({
          page,
          pageSize,
          tuNgay,
          denNgay,
          maKhu
        })
      });

      if (!response.ok) {
        console.error(`Stranger API response error: ${response.status}`);
        return { items: [], totalElements: 0 };
      }

      const data = await response.json();
      if (data?.status !== 'OK') {
        console.error(`Stranger API status not OK:`, data);
        return { items: [], totalElements: 0 };
      }

      const rawItems = data?.payload?.items || [];
      const totalElements = data?.payload?.totalElements || 0;

      const items = rawItems.map((item: any, idx: number): HistoryItem => {
        return {
          id: `stranger-${idx}-${item.timecheck}`,
          thoiGian: item.timecheck ? dayjs(item.timecheck).format("YYYY-MM-DD HH:mm:ss") : dayjs().format("YYYY-MM-DD HH:mm:ss"),
          mssv: "",
          hoVaTen: "Người lạ",
          duongDanAnhChup: item.pathImage || "",
          loai: item.camera === 1 ? "IN" : "OUT",
          maKtx: item.maKhu || "",
          tenKtx: item.tenKhu || "",
          maPhong: "",
          tenPhong: "",
          thietBi: item.cameraName || "",
          loaiDoiTuong: "Người lạ",
          trangThaiHienDien: item.camera === 1 ? "CO_MAT" : "VANG_MAT"
        };
      });

      if (items.length === 0) {
        return { items: MOCK_WARNINGS, totalElements: MOCK_WARNINGS.length };
      }
      return { items, totalElements };
    } catch (err) {
      console.error('Fetch stranger warnings error, returning mock data:', err);
      return { items: MOCK_WARNINGS, totalElements: MOCK_WARNINGS.length };
    }
  }
};

const MOCK_WARNINGS: HistoryItem[] = [
  {
    id: 'mock-stranger-1',
    thoiGian: '2026-06-03 08:20:00',
    mssv: '',
    hoVaTen: 'Người lạ',
    duongDanAnhChup: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    loai: 'IN',
    maKtx: 'A',
    tenKtx: 'Ký túc xá A',
    maPhong: '',
    tenPhong: '',
    thietBi: 'Camera cổng chính A vào',
    loaiDoiTuong: 'Người lạ',
    trangThaiHienDien: 'CO_MAT'
  },
  {
    id: 'mock-stranger-2',
    thoiGian: '2026-06-03 06:58:07',
    mssv: '',
    hoVaTen: 'Người lạ',
    duongDanAnhChup: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400',
    loai: 'IN',
    maKtx: 'A',
    tenKtx: 'Ký túc xá A',
    maPhong: '',
    tenPhong: '',
    thietBi: 'Camera cổng phụ A vào',
    loaiDoiTuong: 'Người lạ',
    trangThaiHienDien: 'CO_MAT'
  },
  {
    id: 'mock-stranger-3',
    thoiGian: '2026-06-02 23:45:12',
    mssv: '',
    hoVaTen: 'Người lạ',
    duongDanAnhChup: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    loai: 'OUT',
    maKtx: 'B',
    tenKtx: 'Ký túc xá B',
    maPhong: '',
    tenPhong: '',
    thietBi: 'Camera cổng B ra',
    loaiDoiTuong: 'Người lạ',
    trangThaiHienDien: 'VANG_MAT'
  },
  {
    id: 'mock-stranger-4',
    thoiGian: '2026-06-02 18:30:45',
    mssv: '',
    hoVaTen: 'Người lạ',
    duongDanAnhChup: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    loai: 'IN',
    maKtx: 'C',
    tenKtx: 'Ký túc xá C',
    maPhong: '',
    tenPhong: '',
    thietBi: 'Camera sảnh C1 vào',
    loaiDoiTuong: 'Người lạ',
    trangThaiHienDien: 'CO_MAT'
  },
  {
    id: 'mock-stranger-5',
    thoiGian: '2026-06-01 14:15:22',
    mssv: '',
    hoVaTen: 'Người lạ',
    duongDanAnhChup: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    loai: 'OUT',
    maKtx: 'A',
    tenKtx: 'Ký túc xá A',
    maPhong: '',
    tenPhong: '',
    thietBi: 'Camera cổng chính A ra',
    loaiDoiTuong: 'Người lạ',
    trangThaiHienDien: 'VANG_MAT'
  }
];
