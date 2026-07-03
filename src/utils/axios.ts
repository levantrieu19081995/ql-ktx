 

// src/utils/axios.ts
import axios from "axios";
import { useSessionStore } from "@/context/sessionStore";

const axiosInstance = axios.create({
  baseURL: typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_API_BASE_URL
    : "/api/proxy",
});

// luôn lấy token mới nhất
axiosInstance.interceptors.request.use((config) => {
  const token = useSessionStore.getState().accessToken;
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
if (err.response?.status === 401) {
  const url = err?.config?.url;

  // Bỏ qua NextAuth API
  if (url?.startsWith("/api/auth")) {
    return Promise.reject(err);
  }

  const { expired } = useSessionStore.getState();

  console.log(">>> AXIOS 401 → check token expired");

  //  expiredAt là milisecond (ms), so sánh phải dùng Date.now()
  if (expired && Date.now() > expired) {
    console.log(">>> Token hết hạn → mở modal");
    useSessionStore.getState().setIsExpired(true);
  }

  return Promise.reject(err);
}

    return Promise.reject(err);
  }
);

export default axiosInstance;
// export const get = (url:any, params:any) => axiosInstance.get(url, { params }).then(r => r.data);
// export const post = (url:any, data:any) => axiosInstance.post(url, data).then(r => r.data);
// export const put = (url:any, data:any) => axiosInstance.put(url, data).then(r => r.data);
// export const del = (url:any, params:any) => axiosInstance.delete(url, { params }).then(r => r.data);

export const get = async <T = any>(url: string, params?: any): Promise<T> => {
  return axiosInstance.get(url, { params }).then((r) => r.data);
};

export const post = async <T = any>(url: string, data?: any): Promise<T> => {
  return axiosInstance.post(url, data).then((r) => r.data);
};

export const put = async <T = any>(url: string, data: any): Promise<T> => {
  return axiosInstance.put(url, data).then((r) => r.data);
};

export const del = async <T = any>(url: string, params?: any): Promise<T> => {
  return axiosInstance.delete(url, { params }).then((r) => r.data);
};