import axios, { AxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.API_BASE_URL;

const axiosServer = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Hàm gọi chung, có thể thêm token thủ công
export async function serverGet<T>(url: string, token?: string, config?: AxiosRequestConfig): Promise<T> {
  const finalConfig: AxiosRequestConfig = {
    ...config,
    headers: {
      ...(config?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  const res = await axiosServer.get(url, finalConfig);
  return res.data;
}

export async function serverPost<T>(url: string, data: any, token?: string): Promise<T> {
  const res = await axiosServer.post(url, data, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}

export default axiosServer;
