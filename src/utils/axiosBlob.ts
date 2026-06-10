import axios from "axios";
import { getSession } from "next-auth/react";
import { useSessionStore } from "@/context/sessionStore";

// Lấy base URL từ .env
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Instance chuyên cho tải file (PDF, Excel, ZIP…)
const axiosBlob = axios.create({
  baseURL: API_BASE_URL,
  responseType: "blob", // luôn mặc định trả về blob
});

// Interceptor thêm token tự động
axiosBlob.interceptors.request.use(
  async (config) => {
    // const session = await getSession();  
    // if (session?.accessToken) {
    //   config.headers["Authorization"] = `Bearer ${session.accessToken}`;
    // }
    const { accessToken } = useSessionStore.getState();
    console.log('axiosBlob.ts accessToken :>> ', accessToken);
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý lỗi chung (ví dụ: hết hạn token)
axiosBlob.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
       const { expired, setIsExpired } = useSessionStore.getState();

      // Kiểm tra đúng là token hết hạn
      if (expired && Date.now() > expired) {
        setIsExpired(true);   //   mở modal
      }
    }
    return Promise.reject(error);
  }
);

export default axiosBlob;
