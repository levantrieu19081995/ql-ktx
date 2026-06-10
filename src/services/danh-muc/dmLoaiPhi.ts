import API_URLS from "@/constants/apiUrls";
import { get, post, put, del } from "@/utils/axios";
import type {   DefaultAPIResponse, LoaiPhiCreateRequest, LoaiPhiItem, LoaiPhiResponse } from "@/types/global";

// Lấy danh sách phân trang
export const fetchLoaiPhi = async (
  page: number,
  pageSize: number,
  keyWord: string = "*", 
): Promise<LoaiPhiResponse> => { 
  try {
    const response: LoaiPhiResponse = await get(
      API_URLS.dmLoaiPhi.paginate,
      { page, pageSize, keyWord }
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

 export const createLoaiPhi = async (
  data: LoaiPhiCreateRequest
): Promise<DefaultAPIResponse<LoaiPhiItem>> => {
  try {
    const response: DefaultAPIResponse<LoaiPhiItem> = await post(
      API_URLS.dmLoaiPhi.create,
      data
    );
    return response;
  } catch (error) {
    console.error("Error creating LoaiPhi:", error);
    throw error;
  }
};

export const deleteLoaiPhi = async (
  id: number
): Promise<DefaultAPIResponse<null>> => {
  try {
    const response: DefaultAPIResponse<null> = await del(
      `${API_URLS.dmLoaiPhi.delete}/${id}`
    );
    return response;
  } catch (error) {
    console.error("Error deleting LoaiPhi:", error);
    throw error;
  }
};

export const updateLoaiPhi = async (
  id: number,
  data: LoaiPhiCreateRequest
): Promise<DefaultAPIResponse<LoaiPhiItem>> => {
  try {
    const response = await put(
      `${API_URLS.dmLoaiPhi.update}/${id}`,
      data
    ) as DefaultAPIResponse<LoaiPhiItem>;

    return response;
  } catch (error) {
    console.error("Error updating LoaiPhi:", error);
    throw error;
  }
};