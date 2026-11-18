// src/services/camera/cameraService.ts
// Gọi service camera qua proxy cùng origin (/api/camera-service), token do server giữ.

const BASE = "/api/camera-service";

export type CameraStatus =
  | "Initializing"
  | "Connected"
  | "Running"
  | "Reconnecting"
  | string;

export interface CameraInfo {
  index: number;
  name: string;
  location: string | null;
  area_id: number | null;
  area: string | null;
  codec: string | null;
  fps: number | null;
  enabled: boolean;
  status: CameraStatus;
  capture_fps: number | null;
  faces_detected: number | null;
}

export interface UnknownGuess {
  person?: { id: string; name: string; enrolled?: boolean; score?: number; photos?: number } | null;
  confidence?: number;
  similarity?: number;
  closest?: { id: string; name: string; enrolled?: boolean; score?: number } | null;
}

export interface AttendanceSummary {
  records: number;
  people: number;
  unknown: number;
  first: string | null;
  ban_check?: { enabled: boolean; checked: number; banned: number };
}

/** Kết quả kiểm tra cấm/nợ phí gắn với một người (view=log, view=people). */
export interface BanInfo {
  checked: boolean;
  allowed: boolean | null;
  debt: number | null;
  reasons: string[];
  full_name?: string;
  class_name?: string;
  person_type?: string;
  error?: string;
  checked_at?: string;
}

export interface PersonRef {
  id: string;
  name: string;
  enrolled?: boolean;
}

export interface LogRecord {
  id: number;
  time: string;
  camera: { id: number; name: string };
  person: PersonRef | null; // null = khuôn mặt lạ (khi unknown=1)
  image: string | null;
  scores?: { confidence?: number; similarity?: number; method?: string; liveness?: string };
  ban?: BanInfo | null;
}

export interface LogResponse {
  summary: AttendanceSummary;
  total: number;
  offset: number;
  records: LogRecord[];
}

export interface PeopleItem {
  person: PersonRef;
  count: number;
  ban?: BanInfo | null;
  first?: LogRecord | null;
  last?: LogRecord | null;
}

export interface PeopleResponse {
  summary: AttendanceSummary;
  people: PeopleItem[];
}

export interface UnknownRecord {
  id: number;
  time: string; // ISO 8601
  camera: { id: number; name: string };
  person: null;
  image: string | null; // đã có tiền tố /api/images/...
  guess?: UnknownGuess | null;
  /** Khác null/undefined khi khuôn mặt này đã được thêm vào mẫu của một người. */
  enrolled?: unknown;
}

/** Sự kiện nhận diện realtime (GET /api/dashboard/recognitions). */
export interface SuKienTrucTiep {
  seq: number;
  /** recognized | ban_check | spoof | unknown | unknown_body (unknown* chỉ có khi gọi với unknown=1) */
  type: "recognized" | "ban_check" | "spoof" | "unknown" | "unknown_body" | string;
  time: string;
  camera: { index: number; name: string };
  person: { id: string; name: string } | null;
  match?: { method?: string; confidence?: number; similarity?: number };
  bbox?: number[];
  /** JPEG mã hoá base64 (không có tiền tố data:). Có thể rỗng. */
  face_image?: string;
  /** unknown_body: ảnh thân người (base64) khi không thấy mặt. */
  body_image?: string;
  /** unknown_body: lý do, ví dụ "no_face". */
  reason?: string;
  /** Đường dẫn ảnh đã lưu, ví dụ 2026/11/04/<mã>_<tên>/<hash>.jpg (gắn recognized với ban_check). */
  image_path?: string;
  track?: string;
  liveness?: string;
  /** ban_check: id bản ghi và kết quả kiểm tra cấm/nợ. */
  record_id?: number;
  result?: BanInfo;
  /** Do FE gắn vào dòng recognized khi nhận được ban_check tương ứng. */
  ban?: BanInfo;
  /** Do FE đóng dấu lúc nhận (ms, giờ trình duyệt), dùng để vẽ khung có thời hạn, tránh lệch đồng hồ với server. */
  nhanLuc?: number;
}

export interface TrucTiepResponse {
  stream_id: string;
  events: SuKienTrucTiep[];
  next_after: number;
  latest: number;
  missed: number;
}

export interface NhomNguoi {
  id: number;
  name: string;
  detail?: string;
  deleted?: boolean;
  people?: number;
}

export interface KhuVucCamera {
  id: number;
  name: string;
  detail?: string;
  cameras?: number;
  people?: number;
}

export interface DoGiongResponse {
  person_id: string;
  similarity: number;
  recognition_needs: number;
}

export interface UnknownResponse {
  summary?: AttendanceSummary;
  total: number;
  offset: number;
  records: UnknownRecord[];
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { cache: "no-store", signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

/**
 * Lấy câu báo lỗi từ phản hồi lỗi của service. BE trả mã lỗi kèm mô tả (description) khác nhau theo từng
 * trường hợp, nên ưu tiên description, rồi error / message / detail (FastAPI có thể là chuỗi hoặc mảng).
 */
/** Một ảnh mẫu của người dùng. url rỗng nếu BE không trả đường dẫn xem được. */
export interface AnhMau {
  id: string;
  url: string;
}

export interface ThongTinMau {
  id: string;
  ten: string;
  soAnh: number;
  /** Danh sách ảnh (có thể rỗng nếu BE chỉ trả số lượng). */
  anh: AnhMau[];
}

/**
 * Đọc phản hồi GET /api/people/{id}. Cấu trúc chính xác do BE quyết định nên đọc linh hoạt:
 * tên ở name / full_name / person.name; số ảnh ở photo_count / photos_count / count hoặc độ dài mảng ảnh;
 * mảng ảnh ở photos / images / samples; mỗi ảnh là chuỗi hoặc đối tượng {id, url|path|image}.
 */
function docThongTinMau(id: string, data: unknown): ThongTinMau {
  const d = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
  const nguoi = (d.person && typeof d.person === "object" ? d.person : d) as Record<string, unknown>;
  const chuoi = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

  const ten = chuoi(nguoi.name) ?? chuoi(nguoi.full_name) ?? chuoi(d.name) ?? "";
  const mang = [d.photos, d.images, d.samples, nguoi.photos, nguoi.images].find(Array.isArray) as
    | unknown[]
    | undefined;

  const anh: AnhMau[] = (mang ?? [])
    .map((x): AnhMau | null => {
      if (typeof x === "string") return { id: x.split("/").pop() || x, url: x };
      if (!x || typeof x !== "object") return null;
      const o = x as Record<string, unknown>;
      const ma = o.id ?? o.photo_id ?? o.filename ?? o.name;
      if (ma === undefined || ma === null) return null;
      return {
        id: String(ma),
        url: chuoi(o.url) ?? chuoi(o.path) ?? chuoi(o.image) ?? chuoi(o.src) ?? "",
      };
    })
    .filter((x): x is AnhMau => !!x);

  const soTuBe = [
    nguoi.photo_count,
    nguoi.photos_count,
    nguoi.num_photos,
    nguoi.count,
    d.photo_count,
    d.photos_count,
    d.num_photos,
    d.count,
  ].find((v) => typeof v === "number") as number | undefined;

  return { id: chuoi(nguoi.id) ?? id, ten, soAnh: soTuBe ?? anh.length, anh };
}

function layThongBaoLoi(data: unknown, status: number): string {
  const d = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;

  const chuoi = (v: unknown): string | undefined => {
    if (typeof v === "string") return v.trim() || undefined;
    if (Array.isArray(v)) {
      const ds = v
        .map((x) => (typeof x === "string" ? x : chuoi((x as Record<string, unknown>)?.msg)))
        .filter((x): x is string => !!x);
      return ds.length ? ds.join("; ") : undefined;
    }
    if (v && typeof v === "object") {
      const o = v as Record<string, unknown>;
      return chuoi(o.description) ?? chuoi(o.message) ?? chuoi(o.error);
    }
    return undefined;
  };

  const moTa =
    chuoi(d.description) ?? chuoi(d.error) ?? chuoi(d.message) ?? chuoi(d.detail);
  const maLoi =
    d.code ??
    d.error_code ??
    (d.error && typeof d.error === "object"
      ? (d.error as Record<string, unknown>).code
      : undefined);
  const ma =
    typeof maLoi === "string" || typeof maLoi === "number" ? ` (mã ${maLoi})` : "";

  return moTa ? `${moTa}${ma}` : `Lỗi HTTP ${status}${ma}`;
}

/** Camera đang chạy thực sự (có luồng hình để xem). */
export const laCameraDangChay = (cam: CameraInfo) =>
  cam.enabled && cam.status === "Running";

interface ThamSoChung {
  camera?: number;
  from: Date;
  to: Date;
  q?: string;
}

const taoQuery = (
  view: "people" | "log" | "unknown",
  p: ThamSoChung & {
    limit?: number;
    offset?: number;
    hideAdded?: boolean;
    kemMatLa?: boolean;
  },
) => {
  const q = new URLSearchParams({
    view,
    from: p.from.toISOString(), // dạng ...Z, có múi giờ
    to: p.to.toISOString(),
  });
  if (view !== "people") {
    q.set("limit", String(p.limit ?? 20));
    q.set("offset", String(p.offset ?? 0));
  }
  if (p.camera !== undefined) q.set("camera", String(p.camera));
  if (p.q?.trim()) q.set("q", p.q.trim());
  if (view === "unknown" && p.hideAdded) q.set("hide_added", "1");
  if (view === "log" && p.kemMatLa) q.set("unknown", "1");
  return q.toString();
};

export const dichVuCamera = {
  layDanhSach: (signal?: AbortSignal) =>
    getJson<CameraInfo[]>(`${BASE}/cameras`, signal),

  /** MJPEG một camera (dùng làm src của <img>). t chống cache. */
  urlLive: (index: number, fps = 12, width?: number, quality?: number) =>
    `${BASE}/cameras/${index}/live?fps=${fps}` +
    (width ? `&width=${width}` : "") +
    (quality ? `&quality=${quality}` : "") +
    `&bodies=1` + // BE vẽ khung thân người lên khung hình
    `&t=${Date.now()}`,

  /** Nhật ký nhận diện (view=log): người quen, có thể kèm mặt lạ (kemMatLa). */
  layNhatKy: (
    p: ThamSoChung & { limit?: number; offset?: number; kemMatLa?: boolean },
    signal?: AbortSignal,
  ) =>
    getJson<LogResponse>(`${BASE}/attendance?${taoQuery("log", p)}`, signal),

  /** Tổng hợp theo từng người (view=people): số lượt, lần đầu, lần cuối, trạng thái cấm/nợ. */
  layTheoNguoi: (p: ThamSoChung, signal?: AbortSignal) =>
    getJson<PeopleResponse>(`${BASE}/attendance?${taoQuery("people", p)}`, signal),

  /** Một khung ảnh JPEG (dùng cho lưới và nút Chụp ảnh). */
  urlSnapshot: (index: number) =>
    `${BASE}/cameras/${index}/snapshot?t=${Date.now()}`,

  /** Ảnh khuôn mặt: `image` từ /api/attendance có dạng /api/images/..., đổi sang proxy. */
  urlAnh: (image?: string | null) => {
    if (!image) return "";
    if (/^(https?:|data:)/.test(image)) return image;
    return `${BASE}/${image.replace(/^\/?api\//, "").replace(/^\/+/, "")}`;
  },

  /**
   * Luồng sự kiện realtime (long-poll). Không truyền `after` thì chỉ nhận mốc `next_after` hiện tại.
   * Có `after` + `wait` thì server giữ kết nối tối đa `wait` giây cho tới khi có sự kiện mới.
   */
  layTrucTiep: (
    p: { after?: number; wait?: number; limit?: number; unknown?: boolean },
    signal?: AbortSignal,
  ) => {
    const q = new URLSearchParams();
    if (p.after !== undefined) q.set("after", String(p.after));
    if (p.wait !== undefined) q.set("wait", String(p.wait));
    if (p.limit !== undefined) q.set("limit", String(p.limit));
    if (p.unknown) q.set("unknown", "1"); // gửi thêm sự kiện unknown / unknown_body
    return getJson<TrucTiepResponse>(
      `${BASE}/dashboard/recognitions?${q.toString()}`,
      signal,
    );
  },

  /** Độ giống giữa khuôn mặt của bản ghi và mẫu đã đăng ký của một người (xem trước khi lấy mẫu). */
  layDoGiong: async (recordId: number, personId: string, signal?: AbortSignal) => {
    const res = await fetch(
      `${BASE}/attendance/records/${recordId}/similarity?person_id=${encodeURIComponent(personId)}`,
      { cache: "no-store", signal },
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.error) {
      throw new Error(layThongBaoLoi(data, res.status));
    }
    return data as DoGiongResponse;
  },

  /** Lấy mẫu: thêm ảnh khuôn mặt của bản ghi vào mẫu của người. Mặt lạ bắt buộc có personId. */
  themMau: async (recordId: number, personId?: string) => {
    const res = await fetch(`${BASE}/attendance/records/${recordId}/enroll`, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(personId ? { person_id: personId } : {}),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.error) {
      throw new Error(layThongBaoLoi(data, res.status));
    }
    return data as Record<string, unknown>;
  },

  /** Danh mục nhóm người (Sinh viên, Cán bộ, Phụ huynh...) để chọn khi lấy mẫu. */
  layNhom: async (signal?: AbortSignal) => {
    const r = await getJson<{ groups: NhomNguoi[] }>(`${BASE}/people-groups`, signal);
    return (r.groups ?? []).filter((g) => !g.deleted);
  },

  /** Danh mục khu vực (KTX A...) để chọn khi lấy mẫu. */
  layKhuVuc: async (signal?: AbortSignal) => {
    const r = await getJson<{ areas: KhuVucCamera[] }>(`${BASE}/areas`, signal);
    return r.areas ?? [];
  },

  /**
   * Lấy mẫu người mới: POST /api/people (multipart/form-data).
   * Gửi ảnh (tối đa 20) HOẶC video; group_id và area_ids tuỳ chọn.
   */
  dangKyNguoi: async (p: {
    id: string;
    name: string;
    groupId?: string;
    areaIds?: string[];
    photos?: File[];
    video?: File | null;
  }) => {
    const fd = new FormData();
    fd.set("id", p.id);
    fd.set("name", p.name);
    if (p.groupId) fd.set("group_id", p.groupId);
    // area_ids: chuỗi cách nhau bởi dấu phẩy, ví dụ "1,2" (theo BE)
    if (p.areaIds?.length) fd.set("area_ids", p.areaIds.join(","));
    if (p.video) {
      fd.set("video", p.video);
    } else {
      (p.photos ?? []).forEach((f) => fd.append("photos", f));
    }
    const res = await fetch(`${BASE}/people`, { method: "POST", body: fd, cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.error) {
      throw new Error(layThongBaoLoi(data, res.status));
    }
    return data as Record<string, unknown>;
  },

  /** Bổ sung ảnh cho người đã có: POST /api/people/{id}/photos (multipart, tối đa 20 ảnh hoặc video). */
  themAnhChoNguoi: async (id: string, photos: File[], video?: File | null) => {
    const fd = new FormData();
    if (video) fd.set("video", video);
    else photos.forEach((f) => fd.append("photos", f));
    const res = await fetch(`${BASE}/people/${encodeURIComponent(id)}/photos`, {
      method: "POST",
      body: fd,
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.error) {
      throw new Error(layThongBaoLoi(data, res.status));
    }
    return data as Record<string, unknown>;
  },

  /** Thông tin và ảnh mẫu của một người: GET /api/people/{id}. */
  layThongTinNguoi: async (id: string, signal?: AbortSignal): Promise<ThongTinMau> => {
    const res = await fetch(`${BASE}/people/${encodeURIComponent(id)}`, {
      cache: "no-store",
      signal,
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 404) throw new Error("Không tìm thấy người có mã này");
    if (!res.ok || data?.error) throw new Error(layThongBaoLoi(data, res.status));
    return docThongTinMau(id, data);
  },

  /** Xóa người và toàn bộ ảnh mẫu: DELETE /api/people/{id}. Không hoàn tác. */
  xoaNguoi: async (id: string) => {
    const res = await fetch(`${BASE}/people/${encodeURIComponent(id)}`, {
      method: "DELETE",
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.error) throw new Error(layThongBaoLoi(data, res.status));
    return data as Record<string, unknown>;
  },

  /** Xóa một ảnh mẫu: DELETE /api/people/{id}/photos/{photo_id}. */
  xoaAnhNguoi: async (id: string, photoId: string) => {
    const res = await fetch(
      `${BASE}/people/${encodeURIComponent(id)}/photos/${encodeURIComponent(photoId)}`,
      { method: "DELETE", cache: "no-store" },
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.error) throw new Error(layThongBaoLoi(data, res.status));
    return data as Record<string, unknown>;
  },

  /** Ảnh theo image_path của sự kiện realtime (không có tiền tố /api/images). Mã hoá từng đoạn vì tên có dấu cách. */
  urlAnhTheoDuongDan: (imagePath?: string | null) =>
    imagePath
      ? `${BASE}/images/${imagePath.split("/").map(encodeURIComponent).join("/")}`
      : "",

  layNguoiLa: (
    tham_so: {
      camera?: number;
      from: Date;
      to: Date;
      limit?: number;
      offset?: number;
      hideAdded?: boolean;
      q?: string; // một phần ID hoặc tên
    },
    signal?: AbortSignal,
  ) => {
    const q = new URLSearchParams({
      view: "unknown",
      from: tham_so.from.toISOString(), // dạng ...Z, có múi giờ
      to: tham_so.to.toISOString(),
      limit: String(tham_so.limit ?? 20),
      offset: String(tham_so.offset ?? 0),
    });
    if (tham_so.camera !== undefined) q.set("camera", String(tham_so.camera));
    if (tham_so.hideAdded) q.set("hide_added", "1");
    if (tham_so.q?.trim()) q.set("q", tham_so.q.trim());
    return getJson<UnknownResponse>(`${BASE}/attendance?${q.toString()}`, signal);
  },

  /** Lấy toàn bộ bản ghi người lạ (cho xuất file): gọi lặp theo offset, mỗi lần tối đa 500. */
  layTatNguoiLa: async (
    tham_so: {
      camera?: number;
      from: Date;
      to: Date;
      hideAdded?: boolean;
      q?: string;
    },
    toiDa = 5000,
  ) => {
    const BUOC = 500; // giới hạn của API cho view=unknown
    const ketQua: UnknownRecord[] = [];
    let offset = 0;
    while (ketQua.length < toiDa) {
      const res = await dichVuCamera.layNguoiLa({
        ...tham_so,
        limit: BUOC,
        offset,
      });
      ketQua.push(...(res.records ?? []));
      offset += BUOC;
      if (!res.records?.length || offset >= res.total) break;
    }
    return ketQua.slice(0, toiDa);
  },
};
