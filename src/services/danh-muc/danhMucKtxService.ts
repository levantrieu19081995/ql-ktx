 
import API_URLS from "@/constants/apiUrls";
import { get, post, put } from "@/utils/axios";
import type {
  ApiResponse,
  DanhMucKhuKtxIndexResponse,
  DanhMucKhuKtxPaginateRequest,
  DanhMucKtxPaginatePayload,
  DanhMucKtxPaginateRequest,
 
  DanhMucKtxResponse,
  DanhSachSinhVienBiCamRequest,
  KhuKtx,
  PhongKtx,
  SinhVienBiCam, 
  SinhVienBiCamRequest, 
  SinhVienKtx,
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

// export const fetchDanhSachSinhVienKtx = async (
//   params?: DanhMucKtxPaginateRequest,
// ): Promise<DanhMucKtxPaginateResponse<SinhVienKtx>> => {
//   try {
//     return await get(API_URLS.danhMucKtx.sinhVien.paginate, taoThamSoPhanTrang(params));
//   } catch (error) {
//     console.error("Error fetching dormitory student list:", error);
//     throw error;
//   }
// };

// export const fetchDanhSachPhongKtx = async (
//   params?: DanhMucKtxPaginateRequest,
// ): Promise<DanhMucKtxPaginateResponse<PhongKtx>> => {
//   try {
//     return await get(API_URLS.danhMucKtx.phong.paginate, taoThamSoPhanTrang(params));
//   } catch (error) {
//     console.error("Error fetching dormitory room list:", error);
//     throw error;
//   }
// };

export const fetchDanhSachKhuKtx = async (
  params?: DanhMucKhuKtxPaginateRequest
): Promise<DanhMucKtxPaginatePayload<KhuKtx>> => {
  try {
    const res = await post<
      ApiResponse<DanhMucKtxPaginatePayload<KhuKtx>>
    >(API_URLS.danhMucKtx.khu.paginate, {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
      maKhu: params?.maKhu || undefined,
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
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
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
// export const updateSinhVienBiCam = async (
//   data: SinhVienBiCamRequest,
// ): Promise<DanhMucKtxResponse<SinhVienBiCam>> => {
//   try {
//     return await post(API_URLS.danhMucKtx.sinhVienBiCam.update, data);
//   } catch (error) {
//     console.error("Error updating banned student:", error);
//     throw error;
//   }
// };
