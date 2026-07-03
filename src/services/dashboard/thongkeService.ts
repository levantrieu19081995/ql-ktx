import { post } from "@/utils/axios";

export interface ThongKeRequest {
  tuNgay?: string;
  denNgay?: string;
  groupBy?: string;
}

export const fetchThongKeRaVao = async (params: ThongKeRequest) => {
  const payload = {
    tuNgay: params.tuNgay,
    denNgay: params.denNgay,
    groupBy: params.groupBy || "DAY",
  };
  const response = await post<any>("/ktx-service/thong-ke/luot-ra-vao", payload);
  return response;
};

export interface SinhVienCamRequest {
  page: string;
  pageSize: string;
  maSinhVien: string;
}

export const fetchSinhVienCamPaginate = async (params: SinhVienCamRequest) => {
  const response = await post<any>("/ktx-service/ktx-sinh-vien-cam/paginate", params);
  return response;
};