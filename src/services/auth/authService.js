// src\services\auth\authService.js
import axios from "axios";

import API_URLS from "@/constants/apiUrls";

const AUTH_TIMEOUT_MS = 8000;

function buildApiUrl(baseUrl, path) {
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function getAuthErrorMessage(error) {
  if (error.code === "ECONNABORTED") {
    return "Không kết nối được máy chủ đăng nhập. Vui lòng thử lại sau.";
  }

  if (!error.response) {
    return "Không kết nối được máy chủ đăng nhập. Kiểm tra lại địa chỉ API hoặc mạng.";
  }

  return (
    error.response?.data?.errors?.[0]?.message ||
    error.response?.data?.message ||
    "Đăng nhập thất bại"
  );
}

export async function refreshTokenAPI(refreshToken) {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");

    const response = await axios.post(
      buildApiUrl(API_BASE_URL, API_URLS.auth.refreshToken),
      { refreshToken },
      { timeout: AUTH_TIMEOUT_MS },
    );

    console.log("refreshTokenAPI response :>> ", response.data);
    return response.data.payload;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
}

// Hàm verify credentials (lấy token) Quản lý ký túc xá
export async function verifyCredentialsAPI({ username, password }) {
  const params = { captchaGuid: "", captchaCode: "", deviceToken: "", type: 1 };
  try {
    const API_BASE_URL = process.env.API_BASE_URL;
    if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");
    console.log(
      "verifyCredentialsAPI API_BASE_URL :>> ",
      buildApiUrl(API_BASE_URL, API_URLS.auth.authToken),
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
      buildApiUrl(API_BASE_URL, API_URLS.auth.authToken),
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: AUTH_TIMEOUT_MS,
      },
    );

    console.log("verifyCredentialsAPI response :>> ", response.data);
    return response.data.payload;
  } catch (error) {
    console.error(
      "Error verifying credentials:",
      error.response?.data || error.message,
    );
    throw new Error(getAuthErrorMessage(error));
  }
}

// Lấy thông tin user từ API /me
export async function fetchUserAPI(accessToken) {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");

    const response = await axios.get(
      buildApiUrl(API_BASE_URL, API_URLS.account.inforUser),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: AUTH_TIMEOUT_MS,
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

    const url = `${buildApiUrl(API_BASE_URL, API_URLS.permission.permissionsByAccountLimit)}?acocuntId=${acocuntId}&organizationId=${organizationId}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "*/*",
      },
      timeout: AUTH_TIMEOUT_MS,
    });

    return response.data.payload;
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
}
