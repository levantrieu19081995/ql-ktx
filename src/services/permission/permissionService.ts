import API_URLS from "@/constants/apiUrls";
import { FindByRoleResponse } from "@/types/type-permissions";
import { get, post, put, del } from "@/utils/axios";
import { serverGet } from "@/utils/axios.server";
// Danh sách phân trang
export const fetchPermissionsPaginate = async (
  page: number,
  size: number,
  keyword: string
): Promise<any> => {
  const url = `${API_URLS.permission.paginate}?page=${page}&size=${size}&keyword=${keyword}`;
  return await get(url);
};

// Tạo mới
export const createPermission = async (data: any): Promise<any> => {
  return await post(API_URLS.permission.create, data);
};

// Cập nhật
export const updatePermission = async (id: number, data: any): Promise<any> => {
  const url = API_URLS.permission.update.replace("{id}", String(id));
  return await put(url, data);
};

// Xóa
export const deletePermission = async (id: number): Promise<any> => {
  const url = API_URLS.permission.delete.replace("{id}", String(id));
  return await del(url);
};

// Lấy danh sách chức năng & quyền theo vai trò
export const fetchPermissionsByRole = async (
  roleId: number
): Promise<FindByRoleResponse> => {
  const url = `${API_URLS.permission.index}?roleId=${roleId}`;
  return await get(url);
};


// ======================== LẤY QUYỀN THEO ACCOUNT ========================
export const fetchPermissionsByAccountLimit = async (
  accountId: number,
  organizationId: number,
  token?: string
): Promise<any> => {
  const url = `${API_URLS.permission.permissionsByAccountLimit}?acocuntId=${accountId}&organizationId=${organizationId}`;  
  return await serverGet(url, token);
};