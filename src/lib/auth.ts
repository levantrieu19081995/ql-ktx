import { fetchUserAPI, verifyCredentialsAPI } from "../services/auth/authService";

export async function verifyCredentials(
  username: string,
  password: string,
  captchaGuid?: string,
  captchaCode?: string,
) {
  try {
    const tokenData = await verifyCredentialsAPI({
      username,
      password,
      captchaGuid,
      captchaCode,
    });

    if (!tokenData?.access_token) {
      throw new Error("Khong lay duoc access token");
    }

    const userInfo = await fetchUserAPI(tokenData.access_token);

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expired: tokenData.expired,
      user: userInfo,
    };
  } catch (error: any) {
    console.error(
      "Error verifying credentials:",
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.errors?.[0]?.message || "Dang nhap that bai",
    );
  }
}
