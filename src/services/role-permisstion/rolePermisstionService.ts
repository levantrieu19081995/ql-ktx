//src\services\role\roleService.ts
import API_URLS from "@/constants/apiUrls";
import { ApiResponse } from "@/types/type-roles-permisssion";
import axios, { post, get, del, put } from "@/utils/axios";

/**
 * Cập nhật danh sách quyền cho vai trò
 * @param roleId ID của vai trò
 * @param permissionIds Mảng các psId (ID quyền)
 */
export const updateRolePermissions = async (
  roleId: number,
  permissionIds: number[]
): Promise<ApiResponse> => {
  try {
    const url = API_URLS.rolePermission.update.replace("{roleId}", String(roleId));
    const res: ApiResponse = await put(url, permissionIds);
    return res;
  } catch (error) {
    console.error("Error updating role permissions:", error);
    throw error;
  }
};


// /**
//  * Xóa một hoặc nhiều quyền khỏi vai trò
//  * @param roleId ID của vai trò
//  * @param permissionIds Mảng psId quyền cần xóa
//  */ 
export const deleteRolePermissions = async (
  roleId: number,
  permissionIds: number[]
): Promise<ApiResponse> => {
  try {
    const url = API_URLS.rolePermission.delete.replace("{roleId}", String(roleId));
    const res = await axios.delete(url, {
      data: permissionIds, //  payload thật trong body
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (error) {
    console.error("Error deleting role permissions:", error);
    throw error;
  }
};

/**
 * Tạo (thêm mới) quyền cho vai trò
 * @param roleId ID của vai trò
 * @param permissionIds Mảng psId quyền cần thêm
 */
export const createRolePermissions = async (
  roleId: number,
  permissionIds: number[]
): Promise<ApiResponse> => {
  try {
    // Ghép URL chuẩn theo cấu hình trong constants
    const url = API_URLS.rolePermission.create.replace("{roleId}", String(roleId));

    // Gọi API POST dùng axios wrapper
    const res: ApiResponse = await post(url, permissionIds);

    return res;
  } catch (error) {
    console.error("Error creating role permissions:", error);
    throw error;
  }
};