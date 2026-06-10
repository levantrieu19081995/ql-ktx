import API_URLS from "@/constants/apiUrls";
import { get, post, put, del } from "@/utils/axios";
import type {
  DanhMucLoaiPhuongTienRequest,
  DanhMucLoaiPhuongTienListResponse,
  DanhMucLoaiPhuongTienResponse,
  DanhMucLoaiPhuongTienCreateRequest,
  DefaultAPIResponse,
  DanhMucLoaiPhuongTienItem,
  DanhMucLoaiPhuongTienUpdate,
} from "@/types/global";

// Lấy danh sách phân trang
export const fetchLoaiPhuongTienList = async (
  page: number,
  pageSize: number,
  keyWord: string = "*"
): Promise<DanhMucLoaiPhuongTienListResponse> => { 
  try {
    const response: DanhMucLoaiPhuongTienListResponse = await get(
      API_URLS.dmLoaiPhuongTien.paginate,
      { page, pageSize, keyWord }
    );
    return (
      response || {
        payload: { items: [], totalPages: 1, totalElements: 0 },
      }
    );
  } catch (error) {
    console.error("Error fetching DanhMucLoaiPhuongTien list:", error);
    throw error;
  }
};

// Tạo mới 


 export const createLoaiPhuongTien = async (
  data: DanhMucLoaiPhuongTienCreateRequest
): Promise<DefaultAPIResponse<DanhMucLoaiPhuongTienItem>> => {
  try {
    const response: DefaultAPIResponse<DanhMucLoaiPhuongTienItem> = await post(
      API_URLS.dmLoaiPhuongTien.create,
      data
    );
    return response;
  } catch (error) {
    console.error("Error creating LoaiPhi:", error);
    throw error;
  }
};

// Cập nhật theo id
export const updateLoaiPhuongTien = async (
  id: number| null,
  data: DanhMucLoaiPhuongTienUpdate
): Promise<DefaultAPIResponse<DanhMucLoaiPhuongTienItem>>=> {
  try {
    const response = await put(
      `${API_URLS.dmLoaiPhuongTien.update}/${id}`,
      data
    ) as DefaultAPIResponse<DanhMucLoaiPhuongTienItem>;
    return response;
  } catch (error) {
    console.error(`Error updating DanhMucLoaiPhuongTien id=${id}:`, error);
    throw error;
  }
};

// Xoá theo id
export const deleteLoaiPhuongTien = async (
  id: number|null
): Promise<DanhMucLoaiPhuongTienResponse> => {
  try { 
    const response: DanhMucLoaiPhuongTienResponse = await del( 
      `${API_URLS.dmLoaiPhuongTien.delete}/${id}`
    );
    return response;
  } catch (error) {
    console.error(`Error deleting DanhMucLoaiPhuongTien id=${id}:`, error);
    throw error;
  }
};


// Lấy chi tiết theo id
export const getLoaiPhuongTienDetail = async (
  id: number
): Promise<DanhMucLoaiPhuongTienResponse> => {
  try {
    const response: DanhMucLoaiPhuongTienResponse = await get(
      API_URLS.dmLoaiPhuongTien.detail.replace("{id}", String(id))
    );
    return response;
  } catch (error) {
    console.error(`Error fetching DanhMucLoaiPhuongTien detail id=${id}:`, error);
    throw error;
  }
};