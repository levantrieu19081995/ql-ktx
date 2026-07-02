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

const MOCK_STRANGER_WARNINGS: HistoryItem[] = [
  {
    id: "MOCK_WARN_1",
    thoiGian: "2026-06-27 08:20:00",
    mssv: "NguoiLa",
    hoVaTen: "Người lạ",
    duongDanAnhDaiDien: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    duongDanAnhChup: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
    loai: "IN",
    maKtx: "A",
    tenKtx: "Ký túc xá A",
    maPhong: "",
    tenPhong: "",
    thietBi: "Camera vào A1",
    loaiDoiTuong: "Người lạ",
    trangThaiSinhVien: "BINH_THUONG",
    trangThaiHienDien: "VANG_MAT"
  },
  {
    id: "MOCK_WARN_2",
    thoiGian: "2026-06-27 08:35:12",
    mssv: "NguoiLa",
    hoVaTen: "Người lạ",
    duongDanAnhDaiDien: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    duongDanAnhChup: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
    loai: "IN",
    maKtx: "B",
    tenKtx: "Ký túc xá B",
    maPhong: "",
    tenPhong: "",
    thietBi: "Camera vào B2",
    loaiDoiTuong: "Người lạ",
    trangThaiSinhVien: "BINH_THUONG",
    trangThaiHienDien: "VANG_MAT"
  },
  {
    id: "MOCK_WARN_3",
    thoiGian: "2026-06-28 09:12:44",
    mssv: "NguoiLa",
    hoVaTen: "Người lạ",
    duongDanAnhDaiDien: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    duongDanAnhChup: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
    loai: "OUT",
    maKtx: "A",
    tenKtx: "Ký túc xá A",
    maPhong: "",
    tenPhong: "",
    thietBi: "Camera ra A1",
    loaiDoiTuong: "Người lạ",
    trangThaiSinhVien: "BINH_THUONG",
    trangThaiHienDien: "VANG_MAT"
  },
  {
    id: "MOCK_WARN_4",
    thoiGian: "2026-06-28 10:05:19",
    mssv: "NguoiLa",
    hoVaTen: "Người lạ",
    duongDanAnhDaiDien: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    duongDanAnhChup: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
    loai: "IN",
    maKtx: "C",
    tenKtx: "Ký túc xá C",
    maPhong: "",
    tenPhong: "",
    thietBi: "Camera vào C1",
    loaiDoiTuong: "Người lạ",
    trangThaiSinhVien: "BINH_THUONG",
    trangThaiHienDien: "VANG_MAT"
  },
  {
    id: "MOCK_WARN_5",
    thoiGian: "2026-06-29 11:20:30",
    mssv: "NguoiLa",
    hoVaTen: "Người lạ",
    duongDanAnhDaiDien: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
    duongDanAnhChup: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300",
    loai: "OUT",
    maKtx: "B",
    tenKtx: "Ký túc xá B",
    maPhong: "",
    tenPhong: "",
    thietBi: "Camera ra B1",
    loaiDoiTuong: "Người lạ",
    trangThaiSinhVien: "BINH_THUONG",
    trangThaiHienDien: "VANG_MAT"
  },
  {
    id: "MOCK_WARN_6",
    thoiGian: "2026-06-30 14:15:02",
    mssv: "NguoiLa",
    hoVaTen: "Người lạ",
    duongDanAnhDaiDien: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
    duongDanAnhChup: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300",
    loai: "IN",
    maKtx: "A",
    tenKtx: "Ký túc xá A",
    maPhong: "",
    tenPhong: "",
    thietBi: "Camera vào A2",
    loaiDoiTuong: "Người lạ",
    trangThaiSinhVien: "BINH_THUONG",
    trangThaiHienDien: "VANG_MAT"
  },
  {
    id: "MOCK_WARN_7",
    thoiGian: "2026-07-01 15:40:55",
    mssv: "NguoiLa",
    hoVaTen: "Người lạ",
    duongDanAnhDaiDien: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150",
    duongDanAnhChup: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300",
    loai: "OUT",
    maKtx: "C",
    tenKtx: "Ký túc xá C",
    maPhong: "",
    tenPhong: "",
    thietBi: "Camera ra C2",
    loaiDoiTuong: "Người lạ",
    trangThaiSinhVien: "BINH_THUONG",
    trangThaiHienDien: "VANG_MAT"
  },
  {
    id: "MOCK_WARN_8",
    thoiGian: "2026-07-01 16:02:11",
    mssv: "NguoiLa",
    hoVaTen: "Người lạ",
    duongDanAnhDaiDien: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
    duongDanAnhChup: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300",
    loai: "IN",
    maKtx: "B",
    tenKtx: "Ký túc xá B",
    maPhong: "",
    tenPhong: "",
    thietBi: "Camera vào B1",
    loaiDoiTuong: "Người lạ",
    trangThaiSinhVien: "BINH_THUONG",
    trangThaiHienDien: "VANG_MAT"
  },
  {
    id: "MOCK_WARN_9",
    thoiGian: "2026-07-02 17:18:33",
    mssv: "NguoiLa",
    hoVaTen: "Người lạ",
    duongDanAnhDaiDien: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
    duongDanAnhChup: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300",
    loai: "OUT",
    maKtx: "A",
    tenKtx: "Ký túc xá A",
    maPhong: "",
    tenPhong: "",
    thietBi: "Camera ra A2",
    loaiDoiTuong: "Người lạ",
    trangThaiSinhVien: "BINH_THUONG",
    trangThaiHienDien: "VANG_MAT"
  },
  {
    id: "MOCK_WARN_10",
    thoiGian: "2026-07-02 18:05:40",
    mssv: "NguoiLa",
    hoVaTen: "Người lạ",
    duongDanAnhDaiDien: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150",
    duongDanAnhChup: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300",
    loai: "IN",
    maKtx: "C",
    tenKtx: "Ký túc xá C",
    maPhong: "",
    tenPhong: "",
    thietBi: "Camera vào C1",
    loaiDoiTuong: "Người lạ",
    trangThaiSinhVien: "BINH_THUONG",
    trangThaiHienDien: "VANG_MAT"
  }
];

export const dichVuCanhBaoNguoiLa = {
  layDanhSachCanhBao: async (params: {
    page: number;
    pageSize: number;
    tuNgay?: string;
    denNgay?: string;
    maKtx?: string;
  }): Promise<{ items: HistoryItem[]; totalPages: number; totalElements: number }> => {
    try {
      let formattedTuNgay = "";
      let formattedDenNgay = "";
      
      if (params.tuNgay) {
        formattedTuNgay = dayjs(params.tuNgay).format("MM/DD/YYYY");
      } else {
        formattedTuNgay = dayjs().subtract(7, 'day').format("MM/DD/YYYY");
      }
      
      if (params.denNgay) {
        formattedDenNgay = dayjs(params.denNgay).format("MM/DD/YYYY");
      } else {
        formattedDenNgay = dayjs().format("MM/DD/YYYY");
      }

      const requestBody = {
        page: String(params.page),
        pageSize: String(params.pageSize),
        tuNgay: formattedTuNgay,
        denNgay: formattedDenNgay,
        maKhu: params.maKtx && params.maKtx !== "-1" ? params.maKtx : "-1"
      };

      let items: HistoryItem[] = [];

      try {
        const res = await fetch(`https://qldaotaolaixe.cusc.vn/face-detect-service/face-web-check-time/paginate-nguoi-la`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': AUTH_HEADER
          },
          body: JSON.stringify(requestBody)
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.status === 'OK') {
            const payload = data.payload || {};
            const apiItems = payload.items || [];
            items = apiItems.map((item: any, index: number) => {
              const isVao = item.cameraName?.toLowerCase().includes("vào") || item.camera === 1;
              const loai: 'IN' | 'OUT' = isVao ? "IN" : "OUT";
              
              let duongDanAnh = item.pathImage || "";
              if (duongDanAnh && !duongDanAnh.startsWith("http") && !duongDanAnh.startsWith("data:")) {
                const cleanPath = duongDanAnh.startsWith("/") ? duongDanAnh : "/" + duongDanAnh;
                duongDanAnh = `${BASE_URL}${cleanPath}`;
              }

              return {
                id: `WARNING_${item.id || index}_${item.timecheck}`,
                thoiGian: item.timecheck ? dayjs(item.timecheck).format("YYYY-MM-DD HH:mm:ss") : dayjs().format("YYYY-MM-DD HH:mm:ss"),
                mssv: "NguoiLa",
                hoVaTen: "Người lạ",
                duongDanAnhDaiDien: duongDanAnh || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
                duongDanAnhChup: duongDanAnh || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250",
                loai: loai,
                maKtx: item.maKhu || "",
                tenKtx: item.tenKhu || "",
                maPhong: "",
                tenPhong: "",
                thietBi: item.cameraName || "",
                loaiDoiTuong: "Người lạ",
                trangThaiSinhVien: "BINH_THUONG",
                trangThaiHienDien: "VANG_MAT"
              };
            });
          }
        }
      } catch (apiErr) {
        console.warn("Lỗi API warnings, sử dụng giả lập:", apiErr);
      }

      // Merge mock data and API data
      let mergedItems = [...MOCK_STRANGER_WARNINGS, ...items];

      // Apply client-side filters on mock/merged database for consistency
      if (params.maKtx && params.maKtx !== "-1") {
        mergedItems = mergedItems.filter(item => item.maKtx === params.maKtx);
      }
      if (params.tuNgay) {
        const afterDate = dayjs(params.tuNgay).startOf('day');
        mergedItems = mergedItems.filter(item => dayjs(item.thoiGian).isAfter(afterDate) || dayjs(item.thoiGian).isSame(afterDate));
      }
      if (params.denNgay) {
        const beforeDate = dayjs(params.denNgay).endOf('day');
        mergedItems = mergedItems.filter(item => dayjs(item.thoiGian).isBefore(beforeDate) || dayjs(item.thoiGian).isSame(beforeDate));
      }

      // Local pagination slice
      const startIdx = (params.page - 1) * params.pageSize;
      const endIdx = params.page * params.pageSize;
      const paginatedItems = mergedItems.slice(startIdx, endIdx);
      const totalElements = mergedItems.length;
      const totalPages = Math.ceil(totalElements / params.pageSize);

      return {
        items: paginatedItems,
        totalPages,
        totalElements
      };
    } catch (error) {
      console.error("Lỗi khi tải danh sách cảnh báo người lạ:", error);
      return { items: [], totalPages: 0, totalElements: 0 };
    }
  }
};
