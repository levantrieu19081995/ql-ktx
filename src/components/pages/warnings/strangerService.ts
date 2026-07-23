import { HistoryItem } from "../../../types/type-history";
import dayjs from "dayjs";
import { get, post } from "@/utils/axios";

export const dichVuNguoiLa = {
  layDanhSachNguoiLa: async (boLoc?: {
    ngay?: string;
    maKtx?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{
    items: HistoryItem[];
    totalPages: number;
    totalElements: number;
  }> => {
    try {
      const page = boLoc?.page || 1;
      const pageSize = boLoc?.pageSize || 10;
      const ngayStr = boLoc?.ngay
        ? dayjs(boLoc.ngay).format("MM/DD/YYYY")
        : dayjs().format("MM/DD/YYYY");
      const maKhu =
        boLoc?.maKtx && boLoc.maKtx !== "-1" && boLoc.maKtx !== ""
          ? boLoc.maKtx
          : "-1";

      const reqBody = {
        page,
        pageSize,
        ngay: ngayStr,
        maKhu,
      };
      console.log("layDanhSachNguoiLa Request Body:", reqBody);

      const res = await post<any>(
        "/face-detect-service/face-web-check-time/paginate-nguoi-la",
        reqBody,
      );

      if (res?.status !== "OK") {
        console.error("layDanhSachNguoiLa status not OK:", res);
        return { items: [], totalPages: 0, totalElements: 0 };
      }

      const items = res?.payload?.items || [];
      const mappedItems = items.map((item: any): HistoryItem => {
        const timeStr = item.timecheck
          ? dayjs(item.timecheck).format("YYYY-MM-DD HH:mm:ss")
          : `${dayjs(item.ngay, "DD/MM/YYYY").format("YYYY-MM-DD")} ${item.thoigian}`;

        return {
          id: `${item.pathImage}_${item.timecheck}_${Math.random()}`,
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
          cameraNguoiLa: item.camera || undefined,
        };
      });

      return {
        items: mappedItems,
        totalPages: res?.payload?.totalPages || 0,
        totalElements: res?.payload?.totalElements || 0,
      };
    } catch (err) {
      console.error("layDanhSachNguoiLa error:", err);
      return { items: [], totalPages: 0, totalElements: 0 };
    }
  },
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
      if (res?.status && res.status !== "OK") return [];
      const payload = res?.payload || res;
      return (Array.isArray(payload) ? payload : []) as KhuItem[];
    } catch {
      return [];
    }
  },
};
