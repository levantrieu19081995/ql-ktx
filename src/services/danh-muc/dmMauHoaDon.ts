import API_URLS from "@/constants/apiUrls";
import { del, get, post, put } from "@/utils/axios";
import { MauHoaDonItem, MauHoaDonQueryParams, MauHoaDonResponse } from "@/types/type-mau-hoa-don";

/**
 * Gọi API lấy danh sách mẫu hoá đơn (phân trang)
 */
export const fetchMauHoaDonList = async (
  params: MauHoaDonQueryParams
): Promise<MauHoaDonResponse> => { 

  try {
    const response = await get<MauHoaDonResponse>(
      API_URLS.mauHoaDon.paginate,
      {
        page: params.page,
        pageSize: params.pageSize,
        keyWord: params.keyWord ?? "*",
      }
    );
    return response;
  } catch (error) {
    console.error(" Error fetching MauHoaDon list:", error);
    throw error;
  }
};

export const createMauHoaDon = async (data: MauHoaDonItem): Promise<MauHoaDonItem> => {
 

  try {
    const response = await post<MauHoaDonItem>(API_URLS.mauHoaDon.create, data);
    return response;
  } catch (error) {
    console.error("Error creating MauHoaDon:", error);
    throw error;
  }
};
export const updateMauHoaDon = async (
  id: number,
  data: Partial<MauHoaDonItem>
): Promise<MauHoaDonItem> => {
  const url = API_URLS.mauHoaDon.update.replace("{id}", String(id));
 

  try {
    const response = await put<MauHoaDonItem>(url, data);
    return response;
  } catch (error) {
    console.error("Error updating MauHoaDon:", error);
    throw error;
  }
};

export const deleteMauHoaDon = async (
  id: number
): Promise<MauHoaDonResponse> => {
  const url = API_URLS.mauHoaDon.delete.replace("{id}", String(id));
 

  try {
    const response = await del<MauHoaDonResponse>(url);
    return response;
  } catch (error) {
    console.error("Error deleting MauHoaDon:", error);
    throw error;
  }
};