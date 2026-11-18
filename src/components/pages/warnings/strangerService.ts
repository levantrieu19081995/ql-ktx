import { HistoryItem } from "../../../types/type-history";
import dayjs from "dayjs";
import {
  CameraInfo,
  UnknownRecord,
  dichVuCamera,
} from "@/services/camera/cameraService";

// Danh sách người lạ lấy từ service camera (/api/attendance?view=unknown) qua proxy cùng origin.

export interface BoLocNguoiLaApi {
  ngay?: string; // YYYY-MM-DD
  camera?: string; // index camera, "-1" hoặc rỗng = tất cả
  q?: string;
  hideAdded?: boolean;
}

/** Khoảng thời gian của một ngày theo giờ trình duyệt (gửi dạng ISO có múi giờ). */
const khoangTheoNgay = (ngay?: string) => {
  const d = ngay ? dayjs(ngay) : dayjs();
  return {
    from: d.startOf("day").toDate(),
    to: d.add(1, "day").startOf("day").toDate(),
  };
};

const layIndexCamera = (camera?: string) =>
  camera && camera !== "-1" && !Number.isNaN(Number(camera))
    ? Number(camera)
    : undefined;

const anhXaBanGhi = (
  r: UnknownRecord,
  mapCamera: Map<number, CameraInfo>,
): HistoryItem => {
  const thoiGian = dayjs(r.time);
  const cam = mapCamera.get(r.camera?.id);
  const anh = dichVuCamera.urlAnh(r.image);
  return {
    id: String(r.id),
    thoiGian: thoiGian.format("YYYY-MM-DD HH:mm:ss"),
    mssv: "Người lạ",
    hoVaTen: "Người lạ",
    duongDanAnhChup: anh,
    duongDanAnhDaiDien: "",
    loai: "IN",
    maKtx: cam?.area ?? "",
    tenKtx: cam?.area ?? "",
    maPhong: "",
    tenPhong: "",
    thietBi: r.camera?.name ?? "",
    loaiDoiTuong: "Người lạ",
    trangThaiSinhVien: "BINH_THUONG",
    trangThaiHienDien: "CO_MAT",
    ngayNguoiLa: thoiGian.format("DD/MM/YYYY"),
    gioNguoiLa: thoiGian.format("HH:mm:ss"),
    cameraNguoiLa: r.camera?.id,
    duDoan: r.guess?.person
      ? {
          ten: r.guess.person.name,
          ma: r.guess.person.id,
          doTinCay: r.guess.confidence,
          doTuongDong: r.guess.similarity,
          gnhat: r.guess.closest
            ? {
                ten: r.guess.closest.name,
                ma: r.guess.closest.id,
                diem: r.guess.closest.score,
              }
            : null,
        }
      : null,
  };
};

const layMapCamera = async () => {
  try {
    const ds = await dichVuCamera.layDanhSach();
    return new Map<number, CameraInfo>(ds.map((c) => [c.index, c]));
  } catch {
    return new Map<number, CameraInfo>();
  }
};

export const dichVuNguoiLa = {
  layDanhSachNguoiLa: async (
    boLoc?: BoLocNguoiLaApi & { page?: number; pageSize?: number },
  ): Promise<{
    items: HistoryItem[];
    totalPages: number;
    totalElements: number;
  }> => {
    const page = Math.max(boLoc?.page || 1, 1);
    // view=unknown của API tối đa 500 bản ghi / lần
    const pageSize = Math.min(Math.max(boLoc?.pageSize || 10, 1), 500);
    const { from, to } = khoangTheoNgay(boLoc?.ngay);

    const [res, mapCamera] = await Promise.all([
      dichVuCamera.layNguoiLa({
        camera: layIndexCamera(boLoc?.camera),
        from,
        to,
        q: boLoc?.q,
        hideAdded: boLoc?.hideAdded,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }),
      layMapCamera(),
    ]);

    const total = res.total ?? 0;
    return {
      items: (res.records ?? []).map((r) => anhXaBanGhi(r, mapCamera)),
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
      totalElements: total,
    };
  },

  /** Toàn bộ kết quả theo bộ lọc (dùng cho xuất Excel/PDF). */
  layTatCaNguoiLa: async (boLoc?: BoLocNguoiLaApi): Promise<HistoryItem[]> => {
    const { from, to } = khoangTheoNgay(boLoc?.ngay);
    const [records, mapCamera] = await Promise.all([
      dichVuCamera.layTatNguoiLa({
        camera: layIndexCamera(boLoc?.camera),
        from,
        to,
        q: boLoc?.q,
        hideAdded: boLoc?.hideAdded,
      }),
      layMapCamera(),
    ]);
    return records.map((r) => anhXaBanGhi(r, mapCamera));
  },
};

export interface CameraOption {
  value: string;
  label: string;
}

export const dichVuDanhMucCamera = {
  layDanhSach: async (): Promise<CameraOption[]> => {
    try {
      const ds = await dichVuCamera.layDanhSach();
      return ds.map((c) => ({
        value: String(c.index),
        label: c.area ? `${c.name} (${c.area})` : c.name,
      }));
    } catch {
      return [];
    }
  },
};
