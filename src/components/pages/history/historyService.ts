/* eslint-disable prefer-const */
import { HistoryItem, HistoryPaginatedResponse } from '../../../types/type-history';
import dayjs from 'dayjs';


const AUTH_HEADER = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInR5cGUiOjEsImd1aWQiOiI5YTFiZTIzNS05OGJhLTQxOTYtOTMyYi0xMmY0NTc3NjNmYjQiLCJpZCI6MSwiaXNzIjoiaHR0cDovL2N1c2Nzb2Z0LmNvbS8iLCJpYXQiOjE3ODE3NDQ2NTQsImV4cCI6MjA5NzEwNDY1NH0.h70KwFf0rL5cSyyVlBHbadx5bl_7QXYN2VEIaC987lE';
const BASE_URL = 'https://qldaotaolaixe.cusc.vn/face-detect-service';

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
          'Authorization': AUTH_HEADER.startsWith('Bearer ') ? AUTH_HEADER : `Bearer ${AUTH_HEADER}`
        }
      });
      if (!res.ok) return [];
      const data = await res.json();
      if (data?.status && data.status !== 'OK') return [];
      const payload = data?.payload || data;
      return (Array.isArray(payload) ? payload : []) as KhuItem[];
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
          'Authorization': AUTH_HEADER.startsWith('Bearer ') ? AUTH_HEADER : `Bearer ${AUTH_HEADER}`
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
    ngay?: string;
    keyword?: string;
    page?: number;
    pageSize?: number;
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
  }): Promise<HistoryPaginatedResponse> => {
    /*
    // 1. Logic range ngĂ y cÅ© táº¡m giá»¯ láº¡i, hiá»‡n swagger chá»‰ dĂ¹ng 1 field `ngay`
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
    */

    const ngayTruyVan = boLoc?.ngay
      ? dayjs(boLoc.ngay).format('MM/DD/YYYY')
      : dayjs().format('MM/DD/YYYY');
    const datesToQuery = [ngayTruyVan];

    // 2. Map filters to API payload
    const maKhu = boLoc?.maKtx || "-1";
    const maNhom = boLoc?.maNhom || "-1";
    const page = boLoc?.page || 1;
    const pageSize = boLoc?.pageSize || 10;
    const keyword =
      boLoc?.keyword?.trim() ||
      boLoc?.mssv?.trim() ||
      boLoc?.hoVaTen?.trim() ||
      "";

    // 3. Query the endpoint for each day in parallel
    const apiResultsPromises = datesToQuery.map(async (dateStr) => {
      try {
        const response = await fetch(`${BASE_URL}/face-web-check-time/paginate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': AUTH_HEADER.startsWith('Bearer ') ? AUTH_HEADER : `Bearer ${AUTH_HEADER}`
          },
          body: JSON.stringify({
            page,
            pageSize,
            maNhom: maNhom,
            maKhu: maKhu,
            ngay: dateStr,
            keyword,
          })
        });

        if (!response.ok) {
          console.error(`API response error for date ${dateStr}: ${response.status}`);
          return { items: [], meta: null };
        }

        const data = await response.json();
        if (data?.status && data.status !== 'OK') {
          console.error(`API response status not OK for date ${dateStr}:`, data);
          return { items: [], meta: data?.payload || null };
        }

        const items = data?.payload?.items || data?.items || (Array.isArray(data) ? data : []);
        return {
          items: items.map((item: any): HistoryItem => {
          const isVao = item.cameraName?.toLowerCase().includes("vào") || item.cameraIdId === 1;
          const loai: 'IN' | 'OUT' = isVao ? "IN" : "OUT";
          const tennhom = item.tennhom || "Sinh viên";

          let trangThaiSinhVien: 'BINH_THUONG' | 'NO_PHI' | 'BI_CAM' = "BINH_THUONG";
          if (tennhom.toLowerCase().includes("nợ phí") || tennhom.toLowerCase().includes("no phi")) {
            trangThaiSinhVien = "NO_PHI";
          } else if (tennhom.toLowerCase().includes("cấm") || tennhom.toLowerCase().includes("cam")) {
            trangThaiSinhVien = "BI_CAM";
          }

          let duongDanAnh = item.pathimage || "";
          if (duongDanAnh && !duongDanAnh.startsWith("http") && !duongDanAnh.startsWith("data:")) {
            const cleanPath = duongDanAnh.startsWith("/") ? duongDanAnh : "/" + duongDanAnh;
            duongDanAnh = `${BASE_URL}${cleanPath}`;
          }

            return {
            id: String(item.id),
            thoiGian: item.timecheck ? dayjs.unix(item.timecheck).format("YYYY-MM-DD HH:mm:ss") : dayjs().format("YYYY-MM-DD HH:mm:ss"),
            mssv: item.maso || "",
            hoVaTen: item.hoten || "",
            duongDanAnhDaiDien: duongDanAnh || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
            duongDanAnhChup: duongDanAnh || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250",
            loai: loai,
            maKtx: item.maKhu || "",
            tenKtx: item.tenKhu || "",
            maPhong: item.maPhong || item.phongId || "",
            tenPhong: item.tenPhong || item.phong || item.donvi || item.tenDonVi || "",
            thietBi: item.cameraName || "",
            loaiDoiTuong: tennhom,
            trangThaiSinhVien,
            trangThaiHienDien: loai === "IN" ? "CO_MAT" : "VANG_MAT"
            };
          }),
          meta: data?.payload || null
        };
      } catch (err) {
        console.error(`Fetch error for date ${dateStr}:`, err);
        return { items: [], meta: null };
      }
    });

    const results2D = await Promise.all(apiResultsPromises);
    const allApiItems = results2D.flatMap((result) => result.items || []);
    const meta = results2D.find((result) => result.meta)?.meta;

    // 4. Keep API results as the source of truth for pagination, then append
    // locally-created records that match the same applied filters.
    const localFilteredItems = danhSachLichSuRaVaoCucBo.filter((h) => {
      if (keyword) {
        const lowerKeyword = keyword.toLowerCase();
        const trungKeyword =
          h.mssv.toLowerCase().includes(lowerKeyword) ||
          h.hoVaTen.toLowerCase().includes(lowerKeyword);
        if (!trungKeyword) return false;
      }
      if (maKhu !== "-1" && h.maKtx !== maKhu) return false;
      if (boLoc?.loai && boLoc.loai !== "ALL" && h.loai !== boLoc.loai) {
        return false;
      }
      return true;
    });

    const mergedItems = [...localFilteredItems, ...allApiItems];

    // 6. Sort results descending by time check
    const sortedItems = mergedItems.sort((a, b) => dayjs(b.thoiGian).unix() - dayjs(a.thoiGian).unix());

    return {
      items: sortedItems,
      currentPage: meta?.currentPage || page,
      totalPages:
        meta?.totalPages ||
        Math.ceil((allApiItems.length + localFilteredItems.length) / pageSize) ||
        1,
      totalElements:
        (meta?.totalElements || allApiItems.length) + localFilteredItems.length,
      size: meta?.size || pageSize,
    };
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


