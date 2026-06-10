import API_URLS from "@/constants/apiUrls";
import { post, get, del, put } from "@/utils/axios"; 

/**
 * Cập nhật thông tin cán bộ (Cá nhân)
 * @param id ID của cán bộ (cá nhân)
 * @param data Dữ liệu cập nhật (account + caNhan)
 * @param response Callback khi thành công
 * @param error Callback khi lỗi
 */
export const __updateUserById = async (
  id: number,
  data: {
    account: {
      avatar: string | null;
      email: string;
    };
    caNhan: {
      ten: string;
      cmnd?: string;
      cccd?: string;
      diaChi?: string;
      gioiTinh: number;
      sdt?: string;
      thanhPhoId?: number;
      huyenId?: number;
      phuongId?: number;
      ngaySinh?: string;
      maso?: string;
      dtMa?: string;
      qtMa?: string;
    };
  },
  response: (res: any) => void,
  error?: (err: any) => void
) => {
  try {
    // Dùng helper put từ "@/utils/axios"
    const res = await put(`${API_URLS.CaNhan.caNhan}/${id}`, data);
    response(res);
  } catch (err) {
    if (error) error(err);
  }
};
