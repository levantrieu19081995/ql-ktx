import API_URLS from "@/constants/apiUrls";
import { get, post, put, del } from "@/utils/axios";
import type { DefaultAPIResponse, PhiDichVuCreate, PhiDichVuItem, PhiDichVuResponse } from "@/types/global";

// Lấy danh sách phân trang
export const fetchPhiDichVu = async (
  page: number,
  pageSize: number,
  keyWord: string = "*",
  dmLptId:  number|null,
  dmLpId:  number,
  isDeleted:  number,
): Promise<PhiDichVuResponse> => { 
  try { 
    const response: PhiDichVuResponse = await get(
      API_URLS.dmPhiDichVu.paginate,
      { page, pageSize, keyWord,dmLptId,dmLpId,isDeleted }
    );
    return (
     response || {
        payload: {
          numberOfElements: 0,
          currentPage: page,
          totalPages: 1,
          totalElements: 0,
          size: pageSize,
          first: true,
          last: true,
          empty: true,
          items: [],
        },
      }
    );
  } catch (error) {
    console.error("Error fetching DanhMucLoaiPhuongTien list:", error);
    throw error;
  }
};
 

export const createPhiDichVu = async (
  data: PhiDichVuCreate
): Promise<PhiDichVuItem | null> => {
  try {
    const response: DefaultAPIResponse<PhiDichVuItem> = await post(
      API_URLS.dmPhiDichVu.create,
      data
    );

    if (response?.payload) { 
      return response.payload;
    }
    return null;
  } catch (error: any) {
    console.error("Lỗi khi tạo phí dịch vụ:", error); 
    throw error;
  }
};

export const updatePhiDichVu = async (
  id: number,
  data: PhiDichVuCreate
): Promise<PhiDichVuItem | null> => {
  try {
    const response: DefaultAPIResponse<PhiDichVuItem> = await put(
      `${API_URLS.dmPhiDichVu.update}/${id}`,
      data
    );

    if (response?.payload) {
      return response.payload;
    }

    return null;
  } catch (error: any) {
    console.error("Lỗi khi cập nhật phí dịch vụ:", error);
    throw error;
  }
};


export const deletePhiDichVu = async (id: number): Promise<PhiDichVuItem | null> => {
  try {
    const response: DefaultAPIResponse<PhiDichVuItem> = await del(
      `${API_URLS.dmPhiDichVu.delete}/${id}`
    );

    if (response?.payload) {
      return response.payload;
    }

    return null;
  } catch (error: any) {
    console.error("Lỗi khi xóa phí dịch vụ:", error);
    throw error;
  }
};
