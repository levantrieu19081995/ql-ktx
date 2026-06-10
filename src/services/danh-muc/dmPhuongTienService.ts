import API_URLS from "@/constants/apiUrls";
import { get, post, put, del } from "@/utils/axios";
import type {
  DanhMucPhuongTien,
  DanhMucPhuongTienListResponse,
  DanhMucPhuongTienRequest,
  DanhMucPhuongTienPut,
  DefaultAPIResponse,
} from "@/types/global";

// Lấy danh sách phân trang
export const fetchPhuongTienList = async (
  params: DanhMucPhuongTienRequest
): Promise<DanhMucPhuongTienListResponse> => {
  console.log("fetchPhuongTienList API_URLS :", API_URLS.dmPhuongTien.paginate);
  try {
    const response: DanhMucPhuongTienListResponse = await get(
      API_URLS.dmPhuongTien.paginate,
      {  page:params.page,
        pageSize: params.pageSize,
        keyWord: params.keyWord,
        dmLptId: params.dmLptId
      }
    );
    return response;
  } catch (error) {
    console.error("Error fetching DanhMucPhuongTien list:", error);
    throw error;
  }
};

// Tạo mới
export const createPhuongTien = async (
  data: DanhMucPhuongTienPut
): Promise<DanhMucPhuongTien> => {
  try {
    const response: DanhMucPhuongTien = await post(
      API_URLS.dmPhuongTien.create,
      data
    );
    return response;
  } catch (error) {
    console.error("Error creating DanhMucPhuongTien:", error);
    throw error;
  }
};

// Cập nhật theo id
export const updatePhuongTien = async (
  id: number,
  data: DanhMucPhuongTienPut
): Promise<DanhMucPhuongTien> => {
  try {
    const response: DanhMucPhuongTien = await put(
      `${API_URLS.dmPhuongTien.update}/${id}`,
      data
    );
    return response;
  } catch (error) {
    console.error(`Error updating DanhMucPhuongTien id=${id}:`, error);
    throw error;
  }
};

// Xoá theo id
 
export const deletePhuongTien = async (
  id: number
): Promise<DefaultAPIResponse<null>> => {
  try {
    const response = await del<DefaultAPIResponse<null>>(
      `${API_URLS.dmPhuongTien.delete}/${id}`
    );
    return response;
  } catch (error) {
    console.error(`Error deleting DanhMucPhuongTien id=${id}:`, error);
    throw error;
  }
};


// Lấy chi tiết theo id
export const getPhuongTienDetail = async (
  id: number
): Promise<DanhMucPhuongTien> => {
  try {
    const response: DanhMucPhuongTien = await get(
      API_URLS.dmPhuongTien.detail.replace("{id}", String(id))
    );
    return response;
  } catch (error) {
    console.error(`Error fetching DanhMucPhuongTien detail id=${id}:`, error);
    throw error;
  }
};


export interface UpdateThongTinPhuongTienRequest {
  ttcptId: number;
  ttptBienkiemsoat: string;
  dmPtId: number;
  dmLptId: number;
}

/**
 * Cập nhật thông tin phương tiện theo ID
 * @param id ID của phương tiện
 * @param data Dữ liệu cập nhật
 * @returns Response từ server
 */
export const updateThongTinPhuongTien = async (
  id: number,
  data: UpdateThongTinPhuongTienRequest
) => {
  try {
    const response = await put(
      API_URLS.thongTinPhuongTien.updateThongTinPhuongTien.replace("{id}", String(id)),
      data
    );
    return response;
  } catch (error) {
    console.error(`Error updating ThongTinPhuongTien id=${id}:`, error);
    throw error;
  }
};