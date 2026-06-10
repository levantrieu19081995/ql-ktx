// src/types/organizations.ts

/** Request query khi lấy tổ chức theo account */
export interface GetOrganizationsByAccountRequest {
  /** Loại tổ chức, '*' để lấy tất cả */
  type?: string; // default: '*'
  /** ID của account (user) */
  acocuntId?: number;
  /** Có lấy kèm role của account trong từng tổ chức không */
  fetchOrganizationRole?: boolean; // default: true
}

/** Thông tin role của user trong một tổ chức */
export interface OrganizationRole {
  guid?: string;
  roleId: number;
  roleName: string;
  key?: string;
  roleDescription?: string;
}

/** Node tổ chức dạng cây */
export interface OrganizationNode {
  guid?: string;
  id: number;
  parentId?: number | null;
  code?: string | null;
  localCode?: string | null;
  slug?: string | null;
  name: string;
  type?: string; // ví dụ: 'DONVI'
  level?: number; // cấp độ trong cây
  treepath?: string; // ví dụ: '/1/6148/6150'
  primary?: boolean; // tổ chức chính của user?
  staticOrganizationGuid?: string | null;

  // quan trọng:
  roles?: OrganizationRole[]; // role của user trong org này
  children?: OrganizationNode[];
}

/** Response tổng quát từ gateway */
export interface ApiEnvelope<T> {
  time: string; // ISO hoặc 'YYYY-MM-DD HH:mm:ss'
  status: "OK" | "ERROR";
  message?: string;
  payload: T;
}

/** Response cụ thể cho API by-account */
export type GetOrganizationsByAccountResponse = ApiEnvelope<OrganizationNode[]>;

// src/types/type-organizations.ts
/** Request: lấy cây tổ chức (format tree) */
export interface GetOrganizationTreeRequest {
  /** ID gốc của cây (thường là 1) */
  id?: number;
  /** Loại tổ chức, mặc định "*" để lấy tất cả */
  type?: string;
}

/** Node tổ chức (1 đơn vị trong cây) */
export interface OrganizationTreeNode {
  guid: string;
  id: number;
  code?: string | null;
  name: string;
  slug?: string | null;
  type?: string | null; // Ví dụ: "DONVI"
  level?: number | null;
  parentId?: number | null;
  parentid?: number | null; // Một số API trả parentid thay vì parentId
  localcode?: string | null;
  localCode?: string | null;
  legacyDomain?: string | null;
  description?: string | null;
  fileImage?: string | null;
  urlImage?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  staticOrganization?: string | null;
  staticorganization?: string | null;
  treepath?: string | null;
  status?: number | string | null;
  children?: OrganizationTreeNode[]; // Danh sách con (đệ quy)
}

/** Response tổng quát từ API format/tree */
export interface GetOrganizationTreeResponse {
  time: string; // "2025-11-10 09:44:31"
  message: string; // "Thành công"
  status: "OK" | string;
  payload: OrganizationTreeNode;
}
