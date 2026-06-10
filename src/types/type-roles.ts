export interface RoleItem {
  guid: string;
  roleId: number;
  roleName: string;
  roleDescription?: string | null;
  createdDate?: string | null;
}

export interface RolePaginateResponse {
  time?: string;
  message?: string;
  status?: string;
  payload: {
    items: RoleItem[];
    numberOfElements: number;
    currentPage: number;
    totalPages: number;
    totalElements: number;
    size: number;
    first: boolean;
    last?: boolean;
  };
}


// ======================== ROLE TYPES ========================

// Thông tin 1 vai trò
export interface RoleDetail {
  guid: string;
  roleId: number;
  roleName: string;
  roleDescription: string;
}

// Response trả về khi gọi API /role/{id}
export interface RoleDetailResponse {
  time: string;
  message: string;
  status: string;
  payload: RoleDetail;
}

