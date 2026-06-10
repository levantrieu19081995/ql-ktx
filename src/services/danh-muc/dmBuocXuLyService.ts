import API_URLS from "@/constants/apiUrls";
import { get, post, put, del } from "@/utils/axios";
import type {
  BuocXuLy,
  BuocXuLyRequest,
  BuocXuLyListResponse,
  BuocXuLyResponse,
} from "@/types/global";

// Lấy danh sách phân trang
export const fetchBuocXuLyList = async (
  page: number,
  pageSize: number,
  keyWord: string = "*"
): Promise<BuocXuLyListResponse> => { 
  try {
    const response: BuocXuLyListResponse = await get(
      API_URLS.dmBuocXuLy.paginate,
      { page, pageSize, keyWord }
    );
    return (
      response || {
        payload: { items: [], totalPages: 1, totalElements: 0 },
      }
    );
  } catch (error) {
    console.error("Error fetching BuocXuLy list:", error);
    throw error;
  }
};

// Tạo mới
export const createBuocXuLy = async (
  data: BuocXuLyRequest
): Promise<BuocXuLyResponse> => {
  try {
    const response: BuocXuLyResponse = await post(
      API_URLS.dmBuocXuLy.create,
      data
    );
    return response;
  } catch (error) {
    console.error("Error creating BuocXuLy:", error);
    throw error;
  }
};

// Cập nhật theo id
export const updateBuocXuLy = async (
  id: number,
  data: BuocXuLyRequest
): Promise<BuocXuLyResponse> => {
  try {
    const response: BuocXuLyResponse = await put(
      API_URLS.dmBuocXuLy.update.replace("{id}", String(id)),
      data
    );
    return response;
  } catch (error) {
    console.error(`Error updating BuocXuLy id=${id}:`, error);
    throw error;
  }
};

// Xoá theo id
export const deleteBuocXuLy = async (
  id: number
): Promise<BuocXuLyResponse> => {
  try {
    const response: BuocXuLyResponse = await del(
      API_URLS.dmBuocXuLy.delete.replace("{id}", String(id))
    );
    return response;
  } catch (error) {
    console.error(`Error deleting BuocXuLy id=${id}:`, error);
    throw error;
  }
};

// Lấy chi tiết theo id
export const getBuocXuLyDetail = async (
  id: number
): Promise<BuocXuLyResponse> => {
  try {
    const response: BuocXuLyResponse = await get(
      API_URLS.dmBuocXuLy.detail.replace("{id}", String(id))
    );
    return response;
  } catch (error) {
    console.error(`Error fetching BuocXuLy detail id=${id}:`, error);
    throw error;
  }
};
