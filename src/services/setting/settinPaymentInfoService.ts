//src\services\role\roleService.ts
import API_URLS from "@/constants/apiUrls";
import { post, get, del, put } from "@/utils/axios";
import type { ConfigPayMentResponse, ConfigPaymentUpdateRequest, ConfigSystemRequest, ConfigSystemResponse, ConfigSystemUpdateRequest } from "@/types/global";

// Function to get  connfig Payment
export const fetchConfigPayment = async (
  params: ConfigSystemRequest = { group: "*", keyword: "*", organizationId: 1 }
): Promise<ConfigPayMentResponse> => {
  try { 
    const response: ConfigPayMentResponse = await get(
      `${API_URLS.SettingPayment.configOrganizationSimple}?group=${params.group}&keyword=${params.keyword}&organizationId=${params.organizationId}`
    );
    
    return response || { payload: [] };
  } catch (error) {
    console.error("Error fetching config system", error);
    throw error;
  }
};

// Hàm gửi yêu cầu PUT để cập nhật cấu hình hệ thống
export const updateConfigPayment = async (
  data: ConfigPaymentUpdateRequest[]
) => {
  try {
    const response = await put(API_URLS.SettingPayment.configOrganizationUpdate, data);
    return response;
  } catch (error) {
    console.error("Error updating config system", error);
    throw error;
  }
};