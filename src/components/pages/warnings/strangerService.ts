import { HistoryItem } from '../../../types/type-history';
import dayjs from 'dayjs';
import { duLieuGiaLapLichSuRaVao } from '../history/history.mock';
import { get, post } from "@/utils/axios";

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
      const tuNgayStr = boLoc?.tuNgay ? dayjs(boLoc.tuNgay).format('MM/DD/YYYY') : "01/01/2025";
      const denNgayStr = boLoc?.denNgay ? dayjs(boLoc.denNgay).format('MM/DD/YYYY') : dayjs().format('MM/DD/YYYY');
      // Theo API spec: truyền "-1" để lấy tất cả các khu
      const maKhu = (boLoc?.maKtx && boLoc.maKtx !== "-1" && boLoc.maKtx !== "") ? boLoc.maKtx : "-1";

      const reqBody = {
        page: String(page),
        pageSize: String(pageSize),
        tuNgay: tuNgayStr,
        denNgay: denNgayStr,
        maKhu: maKhu
      };
      console.log("layDanhSachNguoiLa Request Body:", reqBody);

      const res = await post<any>("/face-detect-service/face-web-check-time/paginate-nguoi-la", reqBody);

      if (res?.status !== 'OK') {
        console.error(`layDanhSachNguoiLa status not OK:`, res);
        return { items: [], totalPages: 1, totalElements: 0 };
      }

      const items = res?.payload?.items || [];
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

      let finalItems = mappedItems;
      let finalTotalElements = res?.payload?.totalElements || 0;
      let finalTotalPages = res?.payload?.totalPages || 1;

      if (finalItems.length === 0) {
        const mockStrangers = duLieuGiaLapLichSuRaVao.filter(item => item.loaiDoiTuong === "Người lạ");
        
        let filteredMock = mockStrangers;
        if (boLoc?.maKtx && boLoc.maKtx !== "-1" && boLoc.maKtx !== "") {
          filteredMock = filteredMock.filter(item => item.maKtx === boLoc.maKtx);
        }
        
        const startIdx = (Number(page) - 1) * Number(pageSize);
        const endIdx = startIdx + Number(pageSize);
        finalItems = filteredMock.slice(startIdx, endIdx);
        finalTotalElements = filteredMock.length;
        finalTotalPages = Math.ceil(filteredMock.length / Number(pageSize)) || 1;
      }

      return {
        items: finalItems,
        totalPages: finalTotalPages,
        totalElements: finalTotalElements
      };
    } catch (err) {
      console.error(`layDanhSachNguoiLa error:`, err);
      return { items: [], totalPages: 1, totalElements: 0 };
    }
  }
};

export interface KhuItem {
  id: number;
  maKhu: string;
  tenKhu: string;
}

export const dichVuDanhMucKhu = {
  layDanhSach: async (): Promise<KhuItem[]> => {
    try {
      const res = await get<any>("/face-detect-service/face-web-ktx-khu/index");
      if (res?.status && res.status !== 'OK') return [];
      const payload = res?.payload || res;
      return (Array.isArray(payload) ? payload : []) as KhuItem[];
    } catch {
      return [];
    }
  }
};
