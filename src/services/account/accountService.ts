 // src/services/account/accountService.ts
import API_URLS from "@/constants/apiUrls";
import { post, get, del, put } from "@/utils/axios";
import { fetchOrganizationsByAccount } from "@/services/organizations/OrganizationsService";
import type {
  User,
  UserResponse,
  UserDetailResponse,
  UserByOrganizationsResponse,
  FetchUsersRequest,
  AccountDetailResponse,
} from "@/types/global";
//  
// Function to get paginated user data
export const fetchUsers = async (
  page: number,
  pageSize: number
): Promise<UserResponse> => {
  try {
    const response: UserResponse = await get(API_URLS.account.paginate, {
      page,
      pageSize,
    });
    return response || { payload: { items: [], totalPages: 1, totalElements: 0 } };
  } catch (error) {
    console.error("Error fetching users", error);
    throw error;
  }
};

// Function to get paginated user data (dùng POST thay vì GET)
export const fetchUsers_post = async (
  page: number,
  pageSize: number,
  filters?: {
    name?: string;
    email?: string;
    roleIds?: number[];
    status?: number;
  }
): Promise<UserResponse> => {
  try {
    const body = {
      page,
      pageSize,
      ...filters, // merge thêm filter
    };

    const response: UserResponse = await post(API_URLS.account.paginate, body);
    return (
      response || { payload: { items: [], totalPages: 1, totalElements: 0 } }
    );
  } catch (error) {
    console.error("Error fetching users", error);
    throw error;
  }
};

export const fetchUsersByOrganizationId= async (
 params: Partial<FetchUsersRequest>  
): Promise<UserByOrganizationsResponse> => {
  try {
    const query = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      organizationId: String(params.organizationId),
      roleId: String(params.roleId ?? 0),
      tuNgay: params.tuNgay ?? "",
      denNgay: params.denNgay ?? "",
      thanhphoId: String(params.thanhphoId ?? 0),
      huyenId: String(params.huyenId ?? 0),
      phuongId: String(params.phuongId ?? 0),
      accountType: String(params.accountType ?? 1),
      status: String(params.status ?? 1),
      filter: params.filter ?? "",
      fetchMetadata: String(params.fetchMetadata ?? true),
      fetchOrganization: String(params.fetchOrganization ?? true),
      fetchRecursive: String(params.fetchRecursive ?? false),
      inOrganization: String(params.inOrganization ?? -1),
    }).toString();
    const url = `${API_URLS.account.paginateByOrganizationId}?${query}`;
    const response = await get<UserByOrganizationsResponse>(url);
     
    return (
      response || {
        time: "",
        message: "",
        status: "ERROR",
        payload: {
          numberOfElements: 0,
          currentPage: 1,
          totalPages: 1,
          totalElements: 0,
          size: 50,
          first: true,
          last: true,
          empty: true,
          items: [],
        },
      }
    );
  } catch (error) {
    console.error("Error fetching users", error);
    throw error;
  }
};


// Function to create a new user
export const createUser = async (
  userData: Partial<User>
): Promise<UserResponse> => {
  try {
    const response: UserResponse = await post(API_URLS.account.create, userData);
    return response;
  } catch (error) {
    console.error("Error creating user", error);
    throw error;
  }
};

// Function to delete a user by id
export const deleteUser = async (
  id: number | string
): Promise<UserResponse> => {
  try {
    const url = `${API_URLS.account.delete.replace("{id}", String(id))}`; 
    const response: UserResponse = await del(url);
    return response;
  } catch (error) {
    console.error("Error deleting user", error);
    throw error;
  }
};

// Function to update a user by id
export const updateUser = async (
  id: number | string,
  userData: Partial<User>
): Promise<UserResponse> => {
  try {
    const url = `${API_URLS.account.update.replace("{id}", String(id))}`;
    const response: UserResponse = await put(url, userData);
    return response;
  } catch (error) {
    console.error("Error updating user", error);
    throw error;
  }
};

// Function to get detail of user by id 

export const fetchUserDetails = async (id: string | number): Promise<UserDetailResponse> => {
  try {
    const url = API_URLS.account.detail.replace("{id}", String(id));
    const response = await get(url);
    return response as UserDetailResponse; 
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết người dùng", error);
    throw error;
  }
};

// -------------------- GET ACCOUNT DETAIL BY GUID   --------------------
// export async function getAccountDetailByGuid(guid: string) {
//   // return fetch(`/account/find-by-guid/${guid}`).then(r => r.json()); lấy biến findByGuid
//   // TẠM: mô phỏng payload
//   return {
//     payload: {
//       guid,
//       name: "Nguyễn Văn A",
//       username: "vana",
//       email: "vana@example.com",
//       phone: "0900000000",
//       status: 1,
//       avatar: null,
//       organizations: [
//         { name: "Sở Thông tin và Truyền thông", roles: [{ roleName: "Cán bộ quản trị" }] },
//         { name: "Sở Công Thương", roles: [{ roleName: "Cán bộ quản trị" }] },
//       ],
//     },
//   };
// }

export async function getAccountDetailByGuid(guid: string): Promise<AccountDetailResponse> {
  try { 
    const url = `${API_URLS.account.findByGuid}/${guid}`;
    const response = await get<AccountDetailResponse>(url);
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết người dùng bằng GUID:", error);
    throw error;
  }
}

export type AccountRoleInfo = {
  organizationId: number;
  organizationName: string;
  roleName: string;
};

export async function fetchAccountRolesByGuid(
  guid: string
): Promise<AccountRoleInfo[]> {
  const accountDetail = await getAccountDetailByGuid(guid);
  const accountId = Number(accountDetail?.payload?.id ?? 0);

  if (!accountId) {
    return [];
  }

  const response = await fetchOrganizationsByAccount({
    acocuntId: accountId,
    fetchOrganizationRole: true,
  });
  const organizations = Array.isArray(response?.payload)
    ? response.payload
    : [];

  return organizations.flatMap((organization) =>
    (organization.roles || []).map((role) => ({
      organizationId: Number(organization.id ?? 0),
      organizationName: organization.name || "",
      roleName: role.roleName || "",
    }))
  );
}

export const __findAccountByUsernameAndType = async (
  guid: string
): Promise<AccountDetailResponse> => {
  try {
    console.log("__findAccountByUsernameAndType :>> ", guid);

    // Gọi đúng endpoint find-by-guid trong API_URLS
    const url = `${API_URLS.account.findByGuid}/${guid}`;

    const response = await get<AccountDetailResponse>(url);

    // Kiểm tra payload hợp lệ trước khi trả về
    if (!response || !response.payload) {
      console.warn("Không có dữ liệu payload hợp lệ cho GUID:", guid);
      return {
        time: "",
        message: "Không tìm thấy dữ liệu cán bộ.",
        status: "ERROR",
        payload: {} as any,
      };
    }

    return response;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin tài khoản bằng GUID:", error);
    throw error;
  }
};

