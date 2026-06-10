// ======================== PERMISSION TYPES ======================== 
// Quyền (Permission)
export interface Permission {
  psId: number;
  psName: string;
  psDescription: string;
  dmcnId: number;
  checked: boolean;
  guid?: string;
}

// Chức năng (Function/Module)
export interface FunctionPermission {
  dmcnId: number;
  dmcnCode: string;
  dmcnName: string;
  dmcnDescription: string;
  dmcnSlug: string;
  guid?: string;
  listPermission: Permission[];
}

// Request param khi gọi API find-by-role
export interface FindByRoleRequest {
  roleId: number;
}

// Response trả về từ API find-by-role
export interface FindByRoleResponse {
  time: string;
  message: string;
  status: string; // ví dụ: "OK"
  payload: FunctionPermission[];
}
