import API_URLS from "@/constants/apiUrls";
import { get, post, put, del } from "@/utils/axios";
import type {
  DanhMucThuTuc,
  DanhMucThuTucListResponse,
  DanhMucThuTucRequest,
  DanhMucThuTucPut,
  DefaultAPIResponse,
} from "@/types/global";

// Lấy danh sách phân trang 
export const fetchProcedureList = async (
  params: DanhMucThuTucRequest
): Promise<DanhMucThuTucListResponse> => {
  try {
    const response: DanhMucThuTucListResponse = await get(
      API_URLS.dmThuTuc.paginate,
      {  
          page: params.page,
          pageSize: params.pageSize,
          keyWord: params.keyWord ?? "*", 
      }
    );
    return response;
  } catch (error) {
    console.error("Error fetching DanhMucThuTuc list:", error);
    throw error;
  }
};


// Tạo mới
export const createProcedure = async (
  data: DanhMucThuTucPut
): Promise<DanhMucThuTuc> => {
  try {
    const response: DanhMucThuTuc = await post(
      API_URLS.dmThuTuc.create,
      data
    );
    return response;
  } catch (error) {
    console.error("Error creating DanhMucThuTuc:", error);
    throw error;
  }
};

// Cập nhật theo id
export const updateProcedure = async (
  id: number,
  data: DanhMucThuTucPut
): Promise<DanhMucThuTuc> => {
  try {
    const response: DanhMucThuTuc = await put(
      `${API_URLS.dmThuTuc.update}/${id}`,
      data
    );
    return response;
  } catch (error) {
    console.error(`Error updating DanhMucThuTuc id=${id}:`, error);
    throw error;
  }
};

// Xoá theo id 
export const deleteProcedure = async (
  id: number
): Promise<DefaultAPIResponse<null>> => {
  try {
    const response = await del<DefaultAPIResponse<null>>(
      `${API_URLS.dmThuTuc.delete}/${id}`
    );
    return response;
  } catch (error) {
    console.error(`Error deleting DanhMucThuTuc id=${id}:`, error);
    throw error;
  }
};


// Lấy chi tiết theo id
export const getProcedureDetail = async (
  id: number
): Promise<DanhMucThuTuc> => {
  try {
    const response: DanhMucThuTuc = await get(
      API_URLS.dmThuTuc.detail.replace("{id}", String(id))
    );
    return response;
  } catch (error) {
    console.error(`Error fetching DanhMucThuTuc detail id=${id}:`, error);
    throw error;
  }
};
