import API_URLS from "@/constants/apiUrls";
import { GetOrganizationsByAccountRequest, GetOrganizationsByAccountResponse, GetOrganizationTreeRequest, GetOrganizationTreeResponse } from "@/types/type-organizations";
import { FindByRoleResponse } from "@/types/type-permissions";
import { get, post, put, del } from "@/utils/axios"; 

// Danh sách tổ chức
/**
 * Lấy cây tổ chức theo account + (tuỳ chọn) kèm role của user trong từng tổ chức
 */
export async function fetchOrganizationsByAccount(
  params: GetOrganizationsByAccountRequest
): Promise<GetOrganizationsByAccountResponse> {
  const {
    type = "*",
    acocuntId ,
    fetchOrganizationRole = true,
  } = params;

  const qs = new URLSearchParams({
    type,
    acocuntId : String(acocuntId ),
    fetchOrganizationRole: String(fetchOrganizationRole),
  }).toString();

  const url = `${API_URLS.organizations.organizationByAccount}?${qs}`;
  return await get(url);
}

// Tạo mới


// Cập nhật
  export async function updateOrganizationsByAccount(
    accountId: number,
    orgIds: number[]
  ): Promise<any> {
    const url = `${API_URLS.organizations.updateOrganizationsByAccount}/${accountId}/update`;
    return await put(url, orgIds);
  }

// Xóa

/**
 * Lấy toàn bộ cây tổ chức (format tree)
 * @param id ID gốc (thường là 1)
 * @param params Tham số lọc (type: string)
 */
export async function __organizationsFormatTree(
  id?: number,
  params?: GetOrganizationTreeRequest
): Promise<GetOrganizationTreeResponse> {
  const type = params?.type ?? "*";

  //   Ghép thủ công phần đuôi `/id/format/tree`
  const url = `${API_URLS.organizations.organizationFormatTree}/${id}/format/tree?type=${type}`;

  const res = await get(url);
  return res as GetOrganizationTreeResponse;
}


import { axiosDeleteWithBody } from "@/utils/axiosDelete";

/**
 * Xóa (detach) tài khoản ra khỏi tổ chức
 * @param organizationId ID tổ chức (ví dụ: 6150)
 * @param accountIds Mảng ID tài khoản cần xóa khỏi tổ chức
 */
export async function deleteAccountsFromOrganization(
  organizationId: number,
  accountIds: number[]
): Promise<any> {
  try {
    const url = `${API_URLS.organizations.organizationDeleteUser}/${organizationId}/delete`;
    const res = await axiosDeleteWithBody(url, accountIds);
    return res;
  } catch (error) {
    console.error("Lỗi khi xóa tài khoản khỏi tổ chức:", error);
    throw error;
  }
}