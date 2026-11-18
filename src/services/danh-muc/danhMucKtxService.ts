 
import API_URLS from "@/constants/apiUrls";
import { get, post, put } from "@/utils/axios";
import type {
  ApiResponse,
  DanhMucKhuKtxIndexResponse,
  DanhMucKhuKtxPaginateRequest,
  DanhMucKtxPaginatePayload,
  DanhMucKtxPaginateRequest,
 
  DanhMucKtxResponse,
  DanhSachLoaiSuKienKtxRequest,
  DanhSachSinhVienBiCamRequest,
  DanhSachSinhVienKtxRequest,
  KhuKtx,
  LoaiSuKienKtx,
  PhongKtx,
  SinhVienBiCam, 
  SinhVienBiCamRequest, 
  SinhVienKtx,
  SinhVienNoPhi,
  UiisKhuPayload,
  UiisPhongPayload,
  UiisSinhVienPayload,
  UiisSinhVienNoPhiPayload,
} from "@/types/type-danh-muc-ktx";

const taoThamSoPhanTrang = ({
  page = 1,
  pageSize = 20,
  keyword,
  keyWord,
}: DanhMucKtxPaginateRequest = {}) => ({
  page,
  pageSize,
  keyword: keyword ?? keyWord ?? "",
});

 

export const fetchDanhSachSinhVienKtx = async (
  params?: DanhSachSinhVienKtxRequest
): Promise<DanhMucKtxPaginatePayload<SinhVienKtx>> => {
  const res = await post<ApiResponse<DanhMucKtxPaginatePayload<SinhVienKtx>>>(
    API_URLS.danhMucKtx.sinhVien.paginate,
    {
      page: String(params?.page ?? 1),
      pageSize: String(params?.pageSize ?? 20),
      maKhu: params?.maKhu ?? "-1",
      maPhong: params?.maPhong ?? "-1",
      maSinhVien: params?.maSinhVien || undefined,
      hoTen: params?.hoTen || undefined,
    }
  );

  return res.payload;
};

export const fetchSinhVienTheoMaPhong = async (
  maPhong: string
): Promise<SinhVienKtx[]> => {
  const res = await get<ApiResponse<SinhVienKtx[]>>(
    `${API_URLS.danhMucKtx.sinhVien.findByMaPhong}/${encodeURIComponent(maPhong)}`
  );

  return res?.payload || [];
};

export const fetchDanhSachSinhVienNoPhi = async (): Promise<SinhVienNoPhi[]> => {
  try {
    const res = await get<ApiResponse<SinhVienNoPhi[]>>(
      API_URLS.danhMucKtx.sinhVienNoPhi.index
    );

    return res?.payload || [];
  } catch (error) {
    console.error("Error fetching debt student list:", error);
    throw error;
  }
};

export interface DanhSachSinhVienNoPhiPaginateRequest {
  page?: number;
  pageSize?: number;
  keyWord?: string;
  maKhu?: string;
  loaiSuKienId?: number;
}

export const fetchDanhSachSinhVienNoPhiPaginate = async (
  params?: DanhSachSinhVienNoPhiPaginateRequest
): Promise<DanhMucKtxPaginatePayload<SinhVienNoPhi>> => {
  try {
    const res = await post<ApiResponse<DanhMucKtxPaginatePayload<SinhVienNoPhi>>>(
      API_URLS.danhMucKtx.sinhVienNoPhi.paginate,
      {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 9999,
        keyWord: params?.keyWord ?? "",
        maKhu: params?.maKhu ?? "-1",
        loaiSuKienId: params?.loaiSuKienId ?? 0,
      }
    );

    return res?.payload;
  } catch (error) {
    console.error("Error fetching debt student list:", error);
    throw error;
  }
};

export interface DanhSachPhongKtxRequest {
  page?: number;
  pageSize?: number;
  maKhu?: string;
  maPhong?: string;
}

export const fetchDanhSachPhongKtx = async (
  params?: DanhSachPhongKtxRequest
): Promise<DanhMucKtxPaginatePayload<PhongKtx>> => {
  try {
    const res = await post<
      ApiResponse<DanhMucKtxPaginatePayload<PhongKtx>>
    >(API_URLS.danhMucKtx.phong.paginate, {
      page: String(params?.page ?? 1),
      pageSize: String(params?.pageSize ?? 20),
      maKhu: params?.maKhu || "-1",
      maPhong: params?.maPhong || "-1",
    });

    return res.payload;
  } catch (error) {
    console.error("Error fetching dormitory room list:", error);
    throw error;
  }
};

export const fetchDanhSachPhongUiis = async (data: UiisPhongPayload) => {
  return await post(API_URLS.danhMucKtx.phong.uiisDanhSach, data);
};

export const syncDanhSachPhongUiis = async (data: UiisPhongPayload) => {
  return await post(API_URLS.danhMucKtx.phong.uiisSync, data);
};

export const fetchDanhSachKhuKtx = async (
  params?: DanhMucKhuKtxPaginateRequest
): Promise<DanhMucKtxPaginatePayload<KhuKtx>> => {
  try {
    const res = await post<
      ApiResponse<DanhMucKtxPaginatePayload<KhuKtx>>
    >(API_URLS.danhMucKtx.khu.paginate, {
      page: String(params?.page ?? 1),
      pageSize: String(params?.pageSize ?? 20),
      maKhu: params?.maKhu ?? "-1",
    });

    return res.payload;
  } catch (error) {
    console.error("Error fetching dormitory area list:", error);
    throw error;
  }
};

export const fetchDanhMucKhuKtx = async (): Promise<KhuKtx[]> => {
  try {
    const res = await get<DanhMucKhuKtxIndexResponse>(
      API_URLS.danhMucKtx.khu.index
    );

    return res?.payload || [];
  } catch (error) {
    console.error("Error fetching dormitory area index:", error);
    throw error;
  }
};


// SINH VIÊN BỊ CẤM
export const fetchDanhSachSinhVienBiCam = async (
  params?: DanhSachSinhVienBiCamRequest
): Promise<DanhMucKtxPaginatePayload<SinhVienBiCam>> => {
  try {
    const res = await post<
      ApiResponse<DanhMucKtxPaginatePayload<SinhVienBiCam>>
    >(API_URLS.danhMucKtx.sinhVienBiCam.paginate, {
      page: String(params?.page ?? 1),
      pageSize: String(params?.pageSize ?? 20),
      maSinhVien: params?.maSinhVien || "-1",
    });

    return res.payload;
  } catch (error) {
    console.error("Error fetching banned student list:", error);
    throw error;
  }
};

export const createSinhVienBiCam = async (
  data: SinhVienBiCamRequest
): Promise<DanhMucKtxResponse<SinhVienBiCam>> => {
  try {
    return await post(
      API_URLS.danhMucKtx.sinhVienBiCam.create,
      data
    );
  } catch (error) {
    console.error("Error creating banned student:", error);
    throw error;
  }
};
export const fetchChiTietSinhVienBiCam = async (
  id: number | string
): Promise<SinhVienBiCam> => {
  try {
    const res = await get<ApiResponse<SinhVienBiCam>>(
      `${API_URLS.danhMucKtx.sinhVienBiCam.detail}/${id}`
    );

    return res.payload;
  } catch (error) {
    console.error("Error fetching banned student detail:", error);
    throw error;
  }
};

export const updateSinhVienBiCam = async (
  id: number | string,
  data: SinhVienBiCamRequest
): Promise<ApiResponse<SinhVienBiCam>> => {
  try {
    return await put<ApiResponse<SinhVienBiCam>>(
      `${API_URLS.danhMucKtx.sinhVienBiCam.update}/${id}`,
      data
    );
  } catch (error) {
    console.error("Error updating banned student:", error);
    throw error;
  }
};


// === Loại sự kiện ===
 export const fetchDanhSachLoaiSuKienKtx = async (
  params?: DanhSachLoaiSuKienKtxRequest
): Promise<DanhMucKtxPaginatePayload<LoaiSuKienKtx>> => {
  const res = await get<ApiResponse<DanhMucKtxPaginatePayload<LoaiSuKienKtx>>>(
    API_URLS.danhMucKtx.loaiSuKien.paginate,
    {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
      keyword: params?.keyword || undefined,
    }
  );

  return res.payload;
};

// SYNC - ĐỒNG BỘ DANH SÁCH SINH VIÊN
export const fetchDanhSachKhuUiis = async (data: UiisKhuPayload) => {
  return await post(API_URLS.danhMucKtx.khu.uiisDanhSach, data);
};

export const syncDanhSachKhuUiis = async (data: UiisKhuPayload) => {
  return await post(API_URLS.danhMucKtx.khu.uiisSync, data);
};

export const fetchDanhSachSinhVienUiis = async (data: UiisSinhVienPayload) => {
  return await post(API_URLS.danhMucKtx.sinhVien.uiisDanhSach, data);
};

export const fetchDanhSachSinhVienNoPhiUiis = async (
  data: UiisSinhVienNoPhiPayload
) => {
  return await post(API_URLS.danhMucKtx.sinhVienNoPhi.uiisDanhSach, data);
};

const DEFAULT_UIIS_PAGE_SIZE = 200;
const DEFAULT_KTX_PAGE_SIZE = 200;

export type PagedFetchProgress = {
  currentPage: number;
  totalPages?: number;
  loadedItems: number;
  pageSize: number;
};

const extractPagedItems = <T>(payload: any): T[] => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  return [];
};

const extractTotalPages = (payload: any, pageSize: number, itemCount: number) => {
  const rawTotalPages = Number(payload?.totalPages ?? payload?.pageCount);
  if (Number.isFinite(rawTotalPages) && rawTotalPages > 0) {
    return rawTotalPages;
  }

  const rawTotalElements = Number(
    payload?.totalElements ?? payload?.totalItems ?? payload?.count
  );
  if (Number.isFinite(rawTotalElements) && rawTotalElements >= 0 && pageSize > 0) {
    return Math.max(1, Math.ceil(rawTotalElements / pageSize));
  }

  if (itemCount < pageSize) {
    return 1;
  }

  return undefined;
};

export const fetchAllDanhSachSinhVienUiis = async (
  data: UiisSinhVienPayload,
  pageSize = DEFAULT_UIIS_PAGE_SIZE,
  onProgress?: (progress: PagedFetchProgress) => void
) => {
  const allItems: any[] = [];
  let page = 1;
  let totalPages: number | undefined;

  while (true) {
    const res = await fetchDanhSachSinhVienUiis({
      ...data,
      page,
      pageSize,
    });

    const payload = res?.payload ?? res;
    const items = extractPagedItems(payload);
    const isLastPage = Boolean(payload?.last);

    allItems.push(...items);

    totalPages =
      totalPages ?? extractTotalPages(payload, pageSize, items.length);

    onProgress?.({
      currentPage: page,
      totalPages,
      loadedItems: allItems.length,
      pageSize,
    });

    if (isLastPage) break;
    if (totalPages && page >= totalPages) break;
    if (items.length === 0) break;
    if (!totalPages && items.length < pageSize) break;

    page += 1;
  }

  return allItems;
};

export const fetchAllDanhSachSinhVienNoPhiUiis = async (
  data: UiisSinhVienNoPhiPayload,
  _pageSize = DEFAULT_UIIS_PAGE_SIZE,
  onProgress?: (progress: PagedFetchProgress) => void
) => {
  const res = await fetchDanhSachSinhVienNoPhiUiis(data);
  const payload = res?.payload ?? res;
  const items = extractPagedItems(payload);

  onProgress?.({
    currentPage: 1,
    totalPages: 1,
    loadedItems: items.length,
    pageSize: items.length || _pageSize,
  });

  return items;
};

export const fetchAllDanhSachSinhVienKtx = async (
  params?: DanhSachSinhVienKtxRequest,
  pageSize = DEFAULT_KTX_PAGE_SIZE,
  onProgress?: (progress: PagedFetchProgress) => void
): Promise<SinhVienKtx[]> => {
  const allItems: SinhVienKtx[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const res = await fetchDanhSachSinhVienKtx({
      ...params,
      page,
      pageSize,
    });

    allItems.push(...(res?.items || []));
    totalPages = Math.max(res?.totalPages || 1, 1);
    onProgress?.({
      currentPage: page,
      totalPages,
      loadedItems: allItems.length,
      pageSize,
    });
    page += 1;
  } while (page <= totalPages);

  return allItems;
};

export const syncDanhSachSinhVienUiis = async (data: UiisSinhVienPayload) => {
  return await post(API_URLS.danhMucKtx.sinhVien.uiisSync, data);
};

export const syncDanhSachSinhVienNoPhiUiis = async (
  data: UiisSinhVienNoPhiPayload
) => {
  return await post(API_URLS.danhMucKtx.sinhVienNoPhi.uiisSync, data);
};
