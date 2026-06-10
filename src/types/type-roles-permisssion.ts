 
export interface RolePermissionUpdateRequest {
  roleId: number;        // ID vai trò cần cập nhật
  permissionIds: number[]; // Danh sách ID quyền được chọn
}

export interface ApiResponse<T = any> {
  time: string;
  message: string;
  status: string;
  payload: T;
}

export interface RolePermissionDeleteRequest {
  roleId: number;
  permissionIds: number[]; // danh sách psId cần xóa
}