import axios from "axios";

import API_URLS from "@/constants/apiUrls";

const AUTH_TIMEOUT_MS = 8000;

function buildApiUrl(baseUrl, path) {
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function getAuthErrorMessage(error) {
  if (error.code === "ECONNABORTED") {
    return "Khong ket noi duoc may chu dang nhap. Vui long thu lai sau.";
  }

  if (!error.response) {
    return "Khong ket noi duoc may chu dang nhap. Kiem tra lai dia chi API hoac mang.";
  }

  return (
    error.response?.data?.errors?.[0]?.message ||
    error.response?.data?.message ||
    "Dang nhap that bai"
  );
}

export async function refreshTokenAPI(refreshToken) {
  try {
    const API_BASE_URL = typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_API_BASE_URL
      : "/api/proxy";
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

export async function fetchCaptchaAPI() {
  try {
    const API_BASE_URL = typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_API_BASE_URL
      : "/api/proxy";
    if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");

    const response = await axios.get(
      buildApiUrl(API_BASE_URL, API_URLS.auth.captchaGenerate),
      { timeout: AUTH_TIMEOUT_MS },
    );

    return response.data.payload;
  } catch (error) {
    console.error(
      "Error fetching captcha:",
      error.response?.data || error.message,
    );
    throw new Error(getAuthErrorMessage(error));
  }
}

export async function verifyCredentialsAPI({
  username,
  password,
  captchaGuid,
  captchaCode,
}) {
  const params = {
    captchaGuid: captchaGuid || "",
    captchaCode: captchaCode || "",
    deviceToken: "",
    type: 1,
  };

  try {
    const API_BASE_URL = process.env.API_BASE_URL;
    if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");

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

export async function fetchUserAPI(accessToken) {
  try {
    const API_BASE_URL = typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_API_BASE_URL
      : "/api/proxy";
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
    if (!accessToken) throw new Error("Thieu accessToken");
    if (!acocuntId || !organizationId) {
      throw new Error("Thieu accountId hoac organizationId");
    }

    const API_BASE_URL = typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_API_BASE_URL
      : "/api/proxy";
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
