//src\services\role\roleService.ts
import API_URLS from "@/constants/apiUrls";
import { post, get, del, put } from "@/utils/axios";
import type { RoleDetailResponse, RolePaginateResponse } from "@/types/type-roles";

// lấy danh sách role paginate
export const fetchRolesPaginate = async (
  page: number = 1,
  pageSize: number = 20,
  keyWord: string = "*"
): Promise<RolePaginateResponse> => {
  try {
    const url = `${API_URLS.role.paginate}?page=${page}&pageSize=${pageSize}&keyWord=${encodeURIComponent(
      keyWord
    )}`;
    const res: RolePaginateResponse = await get(url);
    return res;
  } catch (error) {
    console.error("Error fetching roles paginate:", error);
    throw error;
  }
};
// Tạo vai trò mới
export const createRole = async (data: {
  roleName: string;
  roleDescription?: string;
}) => {
  try {
    const url = `${API_URLS.role.create}`;
    const res = await post(url, data);
    return res;
  } catch (error) {
    console.error("Error creating role:", error);
    throw error;
  }
};

// Cập nhật vai trò
export const updateRole = async (
  id: number,
  data: { roleName: string; roleDescription?: string }
) => {
  try {
    const url = `${API_URLS.role.update.replace("{id}", id.toString())}`;
    const res = await put(url, data);
    return res;
  } catch (error) {
    console.error("Error updating role:", error);
    throw error;
  }
};

// Xóa vai trò
export const deleteRole = async (roleId: number): Promise<any> => {
  try {
    const url = API_URLS.role.delete.replace("{id}", String(roleId)); 
    const res = await del(url);
    return res;
  } catch (error) {
    console.error("Error deleting role:", error);
    throw error;
  }
};


// Lấy thông tin chi tiết vai trò theo ID
export const fetchRoleById = async (roleId: number): Promise<RoleDetailResponse> => {
  try {
    const url = API_URLS.role.detailById.replace("{id}", String(roleId));
    const res: RoleDetailResponse = await get(url);
    return res;
  } catch (error) {
    console.error("Error fetching role by ID:", error);
    throw error;
  }
};


/**
 * Cập nhật (sync) vai trò của user trong tổ chức
 * @param organizationId ID tổ chức
 * @param accountId ID tài khoản (user)
 * @param roleIds Danh sách ID vai trò (số nguyên)
 */
export const updateOrganizationAccountRoles = async (
  organizationId: number,
  accountId: number,
  roleIds: number[]
): Promise<any> => {
  try {
    const url = `${API_URLS.role.organizationAccountRole}/${organizationId}/${accountId}/update`;
    const res = await put(url, roleIds);
    return res;
  } catch (error) {
    console.error(" Lỗi cập nhật vai trò người dùng:", error);
    throw error;
  }
};


/**
 * Thu hồi (xóa) vai trò của user trong tổ chức
 * @param organizationId ID tổ chức
 * @param accountId ID tài khoản (user)
 * @param roleIds Danh sách ID vai trò cần thu hồi
 */
// export const deleteOrganizationAccountRoles = async (
//   organizationId: number,
//   accountId: number,
//   roleIds: number[]
// ): Promise<any> => {
//   try {
//     const url = `${API_URLS.role.organizationAccountRole}/${organizationId}/${accountId}/delete`;
//     const res = await del(url, roleIds); // Gửi payload là mảng roleIds
//     return res;
//   } catch (error) {
//     console.error(" Lỗi thu hồi vai trò người dùng:", error);
//     throw error;
//   }
// };


import { axiosDeleteWithBody } from "@/utils/axiosDelete";

/**
 * Xóa (thu hồi) vai trò của user trong tổ chức
 */
export const deleteOrganizationAccountRoles = async (
  organizationId: number,
  accountId: number,
  roleIds: number[]
): Promise<any> => {
  try {
    const url = `${API_URLS.role.organizationAccountRole}/${organizationId}/${accountId}/delete`;
    const res = await axiosDeleteWithBody(url, roleIds); //  
    return res;
  } catch (error) {
    console.error(" Lỗi thu hồi vai trò người dùng:", error);
    throw error;
  }
};
