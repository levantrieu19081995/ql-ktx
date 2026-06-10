//src\services\role\roleService.ts
import API_URLS from "@/constants/apiUrls";
import { post, get, del, put } from "@/utils/axios";
import type { ConfigFeeRequest, ConfigFeeResponse, ConfigFeeUpdateRequest, ConfigPayMentResponse, ConfigPaymentUpdateRequest, ConfigSystemRequest, ConfigSystemResponse, ConfigSystemUpdateRequest } from "@/types/global";

// Function to get  connfig Payment
export const fetchConfigFee = async (
  params: ConfigFeeRequest= { group: "*", keyword: "*", organizationId: 1 }
): Promise<ConfigFeeResponse> => {
  try {
    const response: ConfigFeeResponse = await get(
      `${API_URLS.SettingFee.configOrganizationSimple}?group=${params.group}&keyword=${params.keyword}&organizationId=${params.organizationId}`
    );
    
    return response || { payload: [] };
  } catch (error) {
    console.error("Error fetching config system", error);
    throw error;
  }
};

// Hàm gửi yêu cầu PUT để cập nhật cấu hình hệ thống
export const updateConfigFee = async (
  data: ConfigFeeUpdateRequest[]
) => {
  try {
    const response = await put(API_URLS.SettingFee.configOrganizationUpdate, data);
    return response;
  } catch (error) {
    console.error("Error updating config system", error);
    throw error;
  }
};