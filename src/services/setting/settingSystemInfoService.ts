//src\services\role\roleService.ts
import API_URLS from "@/constants/apiUrls";
import { post, get, del, put } from "@/utils/axios";
import type { ConfigSystemRequest, ConfigSystemResponse, ConfigSystemUpdateRequest } from "@/types/global";

// Function to get  connfig system
export const fetchConfigSystem = async (
  params: ConfigSystemRequest = { group: "*", keyword: "*" }
): Promise<ConfigSystemResponse> => {
  try {
    const response: ConfigSystemResponse = await get(
      `${API_URLS.settingSystem.configSystemIndex}?group=${params.group}&keyword=${params.keyword}`,{}
    );
    
    return response || { payload: [] };
  } catch (error) {
    console.error("Error fetching config system", error);
    throw error;
  }
};

// Hàm gửi yêu cầu PUT để cập nhật cấu hình hệ thống
export const updateConfigSystem = async (
  data: ConfigSystemUpdateRequest[]
) => {
  try {
    const response = await put(API_URLS.settingSystem.configSystemUpdate, data);
    return response;
  } catch (error) {
    console.error("Error updating config system", error);
    throw error;
  }
};