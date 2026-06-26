// src\services\auth\authService.js
import axios from "axios";

import API_URLS from "@/constants/apiUrls";

export async function refreshTokenAPI(refreshToken) {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");

    const response = await axios.post(
      // `${API_BASE_URL}${API_URLS.auth.refreshToken}`,
      `${API_URLS.auth.refreshToken}`,
      { refreshToken },
    );

    console.log("refreshTokenAPI response :>> ", response.data);
    return response.data.payload;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
}

// Hàm verify credentials (lấy token) Quản lý Ký túc xá
export async function verifyCredentialsAPI({ username, password }) {
  const params = { captchaGuid: "", captchaCode: "", deviceToken: "", type: 1 };
  try {
    const API_BASE_URL = process.env.API_BASE_URL;
    if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");
    console.log(
      "verifyCredentialsAPI API_BASE_URL :>> ",
      API_BASE_URL + API_URLS.auth.authToken,
    );
    const payload = {
      captcha: {
        guid: params.captchaGuid,
        code: params.captchaCode,
      },
      username,
      password,
      deviceToken: params.deviceToken,
      type: params.type,
    };

    const response = await axios.post(
      // `${API_BASE_URL}${API_URLS.auth.authToken}`,
      `${API_URLS.auth.authToken}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    console.log("verifyCredentialsAPI response :>> ", response.data);
    return response.data.payload;
  } catch (error) {
    console.error(
      "Error verifying credentials:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

// Lấy thông tin user từ API /me
export async function fetchUserAPI(accessToken) {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");

    const response = await axios.get(
      // `${API_BASE_URL}${API_URLS.account.inforUser}`,
      `${API_URLS.account.inforUser}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    console.log("fetchUserAPI response :>> ", response.data);
    return response.data.payload;
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
}

export async function fetchUserPermissionsAPI(
  accessToken,
  acocuntId,
  organizationId,
) {
  try {
    if (!accessToken) throw new Error("Thiếu accessToken");
    if (!acocuntId || !organizationId)
      throw new Error("Thiếu accountId hoặc organizationId");

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");

    const url = `${API_BASE_URL}${API_URLS.permission.permissionsByAccountLimit}?acocuntId=${acocuntId}&organizationId=${organizationId}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "*/*",
      },
    });

    return response.data.payload;
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
}
