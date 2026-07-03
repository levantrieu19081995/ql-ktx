// src/app/api/auth/permissions/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions"; 
import { fetchPermissionsByAccountLimit } from "@/services/permission/permissionService";

export async function GET() {
  const session: any = await getServerSession(authOptions);
console.log('permissions/route.ts session :>> ', session);
  // Kiểm tra session
  if (!session?.accessToken || !session?.user?.id) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Lấy accountId và orgId
    const accountId = session.user.id ?? 1;
    const orgId = session.user?.organizationId ?? 6148;
    const access_token = session.accessToken
 

    // Gọi API quyền (token tự động được interceptor thêm)
    const raw = await fetchPermissionsByAccountLimit(accountId, orgId, access_token);  
     
    // Chuẩn hóa dữ liệu trả về
    const permissions: any[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.payload)
      ? raw.payload
      : Array.isArray(raw?.items)
      ? raw.items
      : [];

    // Tạo response JSON
    const res = NextResponse.json({ ok: true, permissions }); 
    return res;
  } catch (e: any) {
    console.error("Permission fetch error (falling back to mock permissions):", e.response?.data || e.message);
    
    // Trả về danh sách quyền giả lập tối thiểu để giao diện chạy thử không bị trắng trang khi backend lỗi
    const fallbackPermissions = [
      {
        dmcnSlug: "/dashboard",
        listPermission: [
          { psName: "VIEW", allowed: true }
        ]
      }
    ];
    
    return NextResponse.json({ ok: true, permissions: fallbackPermissions });
  }
}
