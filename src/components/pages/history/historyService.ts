/* eslint-disable prefer-const */
import { HistoryItem } from '../../../types/type-history';
import dayjs from 'dayjs';


const AUTH_HEADER = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInR5cGUiOjEsImd1aWQiOiI5YTFiZTIzNS05OGJhLTQxOTYtOTMyYi0xMmY0NTc3NjNmYjQiLCJpZCI6MSwiaXNzIjoiaHR0cDovL2N1c2Nzb2Z0LmNvbS8iLCJpYXQiOjE3ODE3NDQ2NTQsImV4cCI6MjA5NzEwNDY1NH0.h70KwFf0rL5cSyyVlBHbadx5bl_7QXYN2VEIaC987lE';
const BASE_URL = 'http://172.16.20.177:53009';

const moPhongDoTre = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// --- LOCAL IN-MEMORY MOCKS DATABASE (for newly added records via UI) ---
let danhSachLichSuRaVaoCucBo: HistoryItem[] = [];

// --- KHU (ZONE) SERVICE ---
export interface KhuItem {
  id: number;
  maKhu: string;
  tenKhu: string;
}

export const dichVuDanhMucKhu = {
  layDanhSach: async (): Promise<KhuItem[]> => {
    try {
      const res = await fetch(`${BASE_URL}/face-web-ktx-khu/index`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': AUTH_HEADER
        }
      });
      if (!res.ok) return [];
      const data = await res.json();
      if (data?.status !== 'OK') return [];
      return (data?.payload || []) as KhuItem[];
    } catch {
      return [];
    }
  }
};

// --- NHOM (GROUP) SERVICE ---
export interface NhomItem {
  idNhom: number;
  maNhom: string;
  tenNhom: string;
}

export const dichVuDanhMucNhom = {
  layDanhSach: async (): Promise<NhomItem[]> => {
    try {
      const res = await fetch(`${BASE_URL}/face-web-ktx-nhom/index`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': AUTH_HEADER
        }
      });
      if (!res.ok) return [];
      const data = await res.json();
      if (data?.status !== 'OK') return [];
      // API trả về payload dạng paginate hoặc mảng thẳng
      const items = Array.isArray(data?.payload)
        ? data.payload
        : (data?.payload?.items || []);
      return items as NhomItem[];
    } catch {
      return [];
    }
  }
};

// --- ACCESS HISTORY SERVICE ---

export const dichVuLichSuRaVao = {

  layDanhSachLichSu: async (boLoc?: {
    tuNgay?: string;
    denNgay?: string;
    mssv?: string;
    hoVaTen?: string;
    maKtx?: string;
    maPhong?: string;
    loai?: 'IN' | 'OUT' | 'ALL';
    trangThai?: string;
    loaiDoiTuong?: string;
    maNhom?: string;
  }): Promise<HistoryItem[]> => {
    // 1. Determine dates to query
    const datesToQuery: string[] = [];
    if (boLoc?.tuNgay) {
      const start = dayjs(boLoc.tuNgay);
      const end = boLoc.denNgay ? dayjs(boLoc.denNgay) : start;
      let current = start;
      const maxDays = 31;
      let count = 0;
      while ((current.isBefore(end) || current.isSame(end, 'day')) && count < maxDays) {
        datesToQuery.push(current.format('MM/DD/YYYY'));
        current = current.add(1, 'day');
        count++;
      }
    } else {
      datesToQuery.push("06/01/2026");
    }

    // 2. Map filters to API payload
    const maKhu = boLoc?.maKtx || "-1";
    const maNhom = boLoc?.maNhom || "-1";
    const keyword = boLoc?.mssv || boLoc?.hoVaTen || "";

    // 3. Query the endpoint for each day in parallel
    const apiResultsPromises = datesToQuery.map(async (dateStr) => {
      try {
        const response = await fetch(`${BASE_URL}/face-web-check-time/paginate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': AUTH_HEADER
          },
          body: JSON.stringify({
            page: 1,
            pageSize: 1000,
            maNhom: maNhom,
            maKhu: maKhu,
            keyword: keyword,
            ngay: dateStr
          })
        });

        if (!response.ok) {
          console.error(`API response error for date ${dateStr}: ${response.status}`);
          return [];
        }

        const data = await response.json();
        if (data?.status !== 'OK') {
          console.error(`API response status not OK for date ${dateStr}:`, data);
          return [];
        }

        const items = data?.payload?.items || [];
        return items.map((item: any): HistoryItem => {
          const isVao = item.cameraName?.toLowerCase().includes("vào") || item.cameraIdId === 1;
          const loai: 'IN' | 'OUT' = isVao ? "IN" : "OUT";
          const tennhom = item.tennhom || "Sinh viên";

          let trangThaiSinhVien: 'BINH_THUONG' | 'NO_PHI' | 'BI_CAM' = "BINH_THUONG";
          if (tennhom.toLowerCase().includes("nợ phí") || tennhom.toLowerCase().includes("no phi")) {
            trangThaiSinhVien = "NO_PHI";
          } else if (tennhom.toLowerCase().includes("cấm") || tennhom.toLowerCase().includes("cam")) {
            trangThaiSinhVien = "BI_CAM";
          }

          return {
            id: String(item.id),
            thoiGian: item.timecheck ? dayjs.unix(item.timecheck).format("YYYY-MM-DD HH:mm:ss") : dayjs().format("YYYY-MM-DD HH:mm:ss"),
            mssv: item.maso || "",
            hoVaTen: item.hoten || "",
            duongDanAnhChup: item.pathimage || "",
            loai: loai,
            maKtx: item.maKhu || "",
            tenKtx: item.tenKhu || "",
            maPhong: "",
            tenPhong: "",
            thietBi: item.cameraName || "",
            loaiDoiTuong: tennhom,
            trangThaiSinhVien,
            trangThaiHienDien: loai === "IN" ? "CO_MAT" : "VANG_MAT"
          };
        });
      } catch (err) {
        console.error(`Fetch error for date ${dateStr}:`, err);
        return [];
      }
    });

    const results2D = await Promise.all(apiResultsPromises);
    const allApiItems = results2D.flat();

    // 4. Merge with local custom records (added via UI in-session)
    let mergedItems = [...danhSachLichSuRaVaoCucBo, ...allApiItems];

    // 5. Apply client-side filters for exact matches / UI filter consistency
    if (boLoc) {
      const { mssv, hoVaTen, maKtx, loai, loaiDoiTuong } = boLoc;

      if (mssv) {
        mergedItems = mergedItems.filter((h) => h.mssv.toLowerCase().includes(mssv.toLowerCase()));
      }
      if (hoVaTen) {
        mergedItems = mergedItems.filter((h) => h.hoVaTen.toLowerCase().includes(hoVaTen.toLowerCase()));
      }
      if (maKtx && maKtx !== '-1') {
        mergedItems = mergedItems.filter((h) => h.maKtx === maKtx);
      }
      if (loai && loai !== 'ALL') {
        mergedItems = mergedItems.filter((h) => h.loai === loai);
      }
      if (loaiDoiTuong && loaiDoiTuong !== 'ALL') {
        mergedItems = mergedItems.filter((h) =>
          h.loaiDoiTuong?.toLowerCase().includes(loaiDoiTuong.toLowerCase())
        );
      }
    }

    // 6. Sort results descending by time check
    return mergedItems.sort((a, b) => dayjs(b.thoiGian).unix() - dayjs(a.thoiGian).unix());
  },



  taoBanGhiLichSu: async (duLieuLichSu: Omit<HistoryItem, 'id' | 'thoiGian'>): Promise<HistoryItem> => {
    await moPhongDoTre(150);
    const banGhiLichSuMoi: HistoryItem = {
      ...duLieuLichSu,
      id: `H${String(danhSachLichSuRaVaoCucBo.length + 1).padStart(3, '0')}`,
      thoiGian: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      trangThaiHienDien: duLieuLichSu.loai === 'IN' ? 'CO_MAT' : 'VANG_MAT'
    };
    danhSachLichSuRaVaoCucBo = [banGhiLichSuMoi, ...danhSachLichSuRaVaoCucBo];
    return banGhiLichSuMoi;
  },

  xoaBanGhiLichSu: async (id: string): Promise<boolean> => {
    await moPhongDoTre(100);
    danhSachLichSuRaVaoCucBo = danhSachLichSuRaVaoCucBo.filter((h) => h.id !== id);
    return true;
  },

  layChiTietLichSu: async (id: string): Promise<HistoryItem> => {
    await moPhongDoTre(100);
    const item = danhSachLichSuRaVaoCucBo.find((h) => h.id === id);
    if (item) return item;
    throw new Error("Không tìm thấy bản ghi");
  },

  capNhatBanGhiLichSu: async (id: string, duLieu: Partial<HistoryItem>): Promise<HistoryItem> => {
    await moPhongDoTre(100);
    const existing = danhSachLichSuRaVaoCucBo.find((h) => h.id === id);
    if (!existing) throw new Error("Không tìm thấy bản ghi");
    const updated = { ...existing, ...duLieu } as HistoryItem;
    danhSachLichSuRaVaoCucBo = danhSachLichSuRaVaoCucBo.map((h) => h.id === id ? updated : h);
    return updated;
  },

  layTatCaLichSu: async (): Promise<HistoryItem[]> => {
    await moPhongDoTre(100);
    return danhSachLichSuRaVaoCucBo;
  },

  timLichSuTheoGuid: async (guid: string): Promise<HistoryItem> => {
    await moPhongDoTre(100);
    const item = danhSachLichSuRaVaoCucBo.find((h) => h.id === guid || (h as any).guid === guid);
    if (item) return item;
    throw new Error("Không tìm thấy bản ghi theo GUID");
  }
};
