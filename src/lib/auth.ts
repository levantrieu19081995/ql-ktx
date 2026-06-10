// src\lib\auth.ts
import { verifyCredentialsAPI, fetchUserAPI, fetchUserPermissionsAPI } from "../services/auth/authService";

export async function verifyCredentials(username: string, password: string) {
  try {
    // Gọi API login để lấy token
    const tokenData = await verifyCredentialsAPI({ username, password });

    if (!tokenData?.access_token) {
      throw new Error("Không lấy được access token");
    }

    // Gọi API user info bằng access token
    const userInfo = await fetchUserAPI(tokenData.access_token);
    console.log('============== > verifyCredentials userInfo :>> ', userInfo);
    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expired: tokenData.expired, 
      // // gán luôn user info
      user: userInfo,  
    };
  } catch (error: any) {
    console.error("Error verifying credentials:", error.response?.data || error.message);
    throw new Error(error.response?.data?.errors?.[0]?.message || "Đăng nhập thất bại");
  }
}
