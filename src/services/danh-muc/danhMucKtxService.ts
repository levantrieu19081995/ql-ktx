import API_URLS from "@/constants/apiUrls";
import { get, post } from "@/utils/axios";
import type {
  DanhMucKtxPaginateRequest,
  DanhMucKtxPaginateResponse,
  DanhMucKtxResponse,
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

export const fetchDanhSachSinhVienKtx = async (
  params?: DanhMucKtxPaginateRequest,
): Promise<DanhMucKtxPaginateResponse<SinhVienKtx>> => {
  try {
    return await get(API_URLS.danhMucKtx.sinhVien.paginate, taoThamSoPhanTrang(params));
  } catch (error) {
    console.error("Error fetching dormitory student list:", error);
    throw error;
  }
};

export const fetchDanhSachPhongKtx = async (
  params?: DanhMucKtxPaginateRequest,
): Promise<DanhMucKtxPaginateResponse<PhongKtx>> => {
  try {
    return await get(API_URLS.danhMucKtx.phong.paginate, taoThamSoPhanTrang(params));
  } catch (error) {
    console.error("Error fetching dormitory room list:", error);
    throw error;
  }
};

export const fetchDanhSachKhuKtx = async (
  params?: DanhMucKtxPaginateRequest,
): Promise<DanhMucKtxPaginateResponse<KhuKtx>> => {
  try {
    return await get(API_URLS.danhMucKtx.khu.paginate, taoThamSoPhanTrang(params));
  } catch (error) {
    console.error("Error fetching dormitory area list:", error);
    throw error;
  }
};

export const fetchDanhSachSinhVienBiCam = async (
  params?: DanhMucKtxPaginateRequest,
): Promise<DanhMucKtxPaginateResponse<SinhVienBiCam>> => {
  try {
    return await get(
      API_URLS.danhMucKtx.sinhVienBiCam.paginate,
      taoThamSoPhanTrang(params),
    );
  } catch (error) {
    console.error("Error fetching banned student list:", error);
    throw error;
  }
};

export const createSinhVienBiCam = async (
  data: SinhVienBiCamRequest,
): Promise<DanhMucKtxResponse<SinhVienBiCam>> => {
  try {
    return await post(API_URLS.danhMucKtx.sinhVienBiCam.create, data);
  } catch (error) {
    console.error("Error creating banned student:", error);
    throw error;
  }
};

export const updateSinhVienBiCam = async (
  data: SinhVienBiCamRequest,
): Promise<DanhMucKtxResponse<SinhVienBiCam>> => {
  try {
    return await post(API_URLS.danhMucKtx.sinhVienBiCam.update, data);
  } catch (error) {
    console.error("Error updating banned student:", error);
    throw error;
  }
};
