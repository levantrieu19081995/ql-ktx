/* eslint-disable @typescript-eslint/ban-ts-comment */
import axios from "axios";
import { getSession } from "next-auth/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSessionStore } from "@/context/sessionStore";

const API_BASE_URL = typeof window === "undefined"
  ? (process.env.NEXT_PUBLIC_API_BASE_URL || "")
  : "/api/proxy";

// ================= DELETE CÓ BODY (RIÊNG BIỆT) =================
export const axiosDeleteWithBody = async <T = any>(
  url: string,
  data?: any,
  config: any = {}
): Promise<T> => {
  try {
    // Tạo instance riêng để inject token thủ công
    // const session = await getSession();
    const { accessToken } = useSessionStore.getState();
    console.log('axiosDelete.ts accessToken :>> ', accessToken);
    const fullUrl = url.startsWith("http")
      ? url
      : `${API_BASE_URL.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;

    const response = await axios.request<T>({
      method: "DELETE",
      url: fullUrl,
      data, // gửi mảng JSON
      headers: {
        "Content-Type": "application/json",
        // ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(config.headers || {}),
      },
      ...config,
    });

    return response.data;
  } catch (error: any) {
    // ================== Xử lý lỗi chung ==================
    if (error.response?.status === 401) {
       
       const { expired, setIsExpired } = useSessionStore.getState();

      // Kiểm tra đúng là token hết hạn
      if (expired && Date.now() > expired) {
        setIsExpired(true);   // 🔥 mở modal
      }
    }

    if (error.response) {
      const message = error.response.data?.message || "Có lỗi xảy ra!";
      toast.error(message);
    } else {
      toast.error("Không thể kết nối với server!");
    }

    console.error("axiosDeleteWithBody error:", error);
    throw error.response?.data || error;
  }
};
