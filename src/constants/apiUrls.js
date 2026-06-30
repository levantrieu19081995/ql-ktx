// src\constants\apiUrls.js
import { generateKey } from "crypto";
import {
  USER_SERVICE,
  QLDK_SERVICE,
  FILE_SERVICE,
  GATEWAY_SERVICE,
} from "./servicePaths";
import SettingPaymentInfo from "@/components/pages/settings/SettingPaymentInfo";
const API_URLS = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    register: "/auth/register",
    forgotPassword: "/auth/forgot-password",
    token: "/auth/token",
    refreshToken: `${USER_SERVICE}/auth/refresh-token`,
    authToken: `${USER_SERVICE}/auth/token`,
    // authToken: `/auth/token`,
  },

  account: {
    paginate: "/account/paginate",
    create: "/account/create",
    update: "/account/{id}",
    delete: `${USER_SERVICE}/account/{id}`,
    detail: "/account/{id}",
    inforUser: `${USER_SERVICE}/account/find-current-account`,
    paginateByOrganizationId: `${USER_SERVICE}/account/paginate`,
    findByGuid: `${USER_SERVICE}/account/find-by-guid`,
    findByGuid: `${USER_SERVICE}/account/find-by-guid`,
  },

  media: {
    upload: "/media/upload",
    delete: "/media/delete",
    list: "/media/list",
  },

  // DiaPhuong: {
  //   TINH_THANH: DM_SERVICE + "/tinh-thanh",
  //   QUAN_HUYEN: DM_SERVICE + "/quan-huyen",
  //   PHUONG_XA: DM_SERVICE + "/phuong-xa",
  //   GET_QUAN_HUYEN_BY_TINH_THANH:
  //     DM_SERVICE + "/quan-huyen/find-quan-huyen-by-tinh-thanh-id",
  //   GET_PHUONG_XA_BY_QUAN_HUYEN:
  //     DM_SERVICE + "/phuong-xa/find-by-quan-huyen-id",
  //   GET_DIA_PHUONG: DM_SERVICE + "/dia-phuong/index",
  //   DIA_PHUONG: DM_SERVICE + "/dia-phuong",
  //   CREATE: DM_SERVICE + "/dia-phuong/create",
  //   PAGINATE: DM_SERVICE + "/dia-phuong/paginate",
  //   QUOC_TICH: DM_SERVICE + "/dia-phuong/find-all-quoc-tich",
  //   FIND_BY_MA: DM_SERVICE + "/dia-phuong/find-by-ma",
  //   FIND_BY_IDs: DM_SERVICE + "/dia-phuong/find-by-ids",
  // },

  CaNhan: {
    caNhan: `${USER_SERVICE}/account`,
    validate: `${USER_SERVICE}/ca-nhan/validate`,
    register: `${USER_SERVICE}/ca-nhan/register`,
    create: `${USER_SERVICE}/ca-nhan/create`,
    dsCaNhan: `${USER_SERVICE}/ca-nhan/danh-sach-ca-nhan`,
    findFullById: `${USER_SERVICE}/ca-nhan/find-by-id`,
    findByMaDinhDanh: `${USER_SERVICE}/ca-nhan/find-by-madinhdanh`,
  },

  role: {
    paginate: `${USER_SERVICE}/role/paginate`,
    create: `${USER_SERVICE}/role/create`,
    update: `${USER_SERVICE}/role/{id}`,
    delete: `${USER_SERVICE}/role/{id}`,
    detail: `${USER_SERVICE}/role/find-by-id/{id}`,
    detailById: `${USER_SERVICE}/role/{id}`,
    organizationAccountRole: `${USER_SERVICE}/organization-account-role`,
  },

  permission: {
    paginate: `${USER_SERVICE}/permission/paginate`,
    create: `${USER_SERVICE}/permission/create`,
    update: `${USER_SERVICE}/permission/{id}`,
    delete: `${USER_SERVICE}/permission/{id}`,
    detail: `${USER_SERVICE}/permission/find-by-id/{id}`,
    index: `${USER_SERVICE}/permission/find-by-role`,
    permissionsByAccountLimit: `${USER_SERVICE}/permission/permissions-by-account/limit`,
  },

  organizations: {
    organizationByAccount: `${USER_SERVICE}/organizations/organizations-by-account`,
    organizationFormatTree: `${USER_SERVICE}/organizations`,
    organizationDeleteUser: `${USER_SERVICE}/organization-account`,
    updateOrganizationsByAccount: `${USER_SERVICE}/organization-account/account`,
  },

  rolePermission: {
    update: `${USER_SERVICE}/role-permission/{roleId}/update`,
    delete: `${USER_SERVICE}/role-permission/{roleId}/delete`,
    create: `${USER_SERVICE}/role-permission/{roleId}/create`,
  },

  // danh mục
  dmBuocXuLy: {
    create: `${QLDK_SERVICE}/buoc-xu-ly/create`,
    update: `${QLDK_SERVICE}/buoc-xu-ly/{id}`,
    delete: `${QLDK_SERVICE}/buoc-xu-ly/{id}`,
    detail: `${QLDK_SERVICE}/buoc-xu-ly/find-by-id/{id}`,
    paginate: `${QLDK_SERVICE}/buoc-xu-ly/find-all/paginate`,
  },

  dmLoaiPhuongTien: {
    create: `${QLDK_SERVICE}/danh-muc-loai-phuong-tien/create`,
    update: `${QLDK_SERVICE}/danh-muc-loai-phuong-tien`,
    delete: `${QLDK_SERVICE}/danh-muc-loai-phuong-tien`,
    detail: `${QLDK_SERVICE}/danh-muc-loai-phuong-tien/find-by-id`,
    paginate: `${QLDK_SERVICE}/danh-muc-loai-phuong-tien/find-all/paginate`,
  },

  dmPhuongTien: {
    create: `${QLDK_SERVICE}/danh-muc-phuong-tien/create`,
    update: `${QLDK_SERVICE}/danh-muc-phuong-tien/`,
    delete: `${QLDK_SERVICE}/danh-muc-phuong-tien`,
    detail: `${QLDK_SERVICE}/danh-muc-phuong-tien/find-by-id`,
    paginate: `${QLDK_SERVICE}/danh-muc-phuong-tien/find-all/paginate`,
  },
  dmThuTuc: {
    create: `${QLDK_SERVICE}/danh-muc-thu-tuc/create`,
    update: `${QLDK_SERVICE}/danh-muc-thu-tuc/`,
    delete: `${QLDK_SERVICE}/danh-muc-thu-tuc`,
    detail: `${QLDK_SERVICE}/danh-muc-thu-tuc/find-by-id`,
    paginate: `${QLDK_SERVICE}/danh-muc-thu-tuc/find-all/paginate`,
  },

  dmPhiDichVu: {
    create: `${QLDK_SERVICE}/phi-dich-vu/create`,
    update: `${QLDK_SERVICE}/phi-dich-vu`,
    delete: `${QLDK_SERVICE}/phi-dich-vu`,
    detail: `${QLDK_SERVICE}/phi-dich-vu/find-by-id`,
    paginate: `${QLDK_SERVICE}/phi-dich-vu/find-all`,
  },

  dmLoaiPhi: {
    create: `${QLDK_SERVICE}/danh-muc-loai-phi/create`,
    update: `${QLDK_SERVICE}/danh-muc-loai-phi`,
    delete: `${QLDK_SERVICE}/danh-muc-loai-phi`,
    detail: `${QLDK_SERVICE}/danh-muc-loai-phi/find-by-id`,
    paginate: `${QLDK_SERVICE}/danh-muc-loai-phi/find-all/paginate`,
  },

  danhMucKtx: {
    sinhVien: {
      paginate: `/ktx-service/ktx-dm-sinh-vien/paginate`,
    },
    phong: {
      paginate: `/ktx-service/ktx-dm-phong/paginate`,
    },
    khu: {
      paginate: `/ktx-service/ktx-dm-khu/paginate`,
    },
    sinhVienBiCam: {
      paginate: `/ktx-service/ktx-sinh-vien-cam/paginate`,
      create: `/ktx-service/ktx-sinh-vien-cam/create`,
      update: `/ktx-service/ktx-sinh-vien-cam/update`,
    },
  },

  thongTinPhuongTien: {
    create: `${QLDK_SERVICE}/thong-tin-phuong-tien/create`,
    updateThongTinPhuongTien: `${QLDK_SERVICE}/thong-tin-phuong-tien/{id}`,
    update: `${QLDK_SERVICE}/danh-muc-phuong-tien/{id}`,
    delete: `${QLDK_SERVICE}/danh-muc-phuong-tien/{id}`,
    detail: `${QLDK_SERVICE}/danh-muc-phuong-tien/find-by-id/{id}`,
    paginate: `${QLDK_SERVICE}/danh-muc-phuong-tien/find-all/paginate`,
  },

  chuPhuongTien: {
    create: `${QLDK_SERVICE}/thong-tin-chu-phuong-tien/create`,
    update: `${QLDK_SERVICE}/thong-tin-chu-phuong-tien/{id}`,
    delete: `${QLDK_SERVICE}/thong-tin-chu-phuong-tien/{id}`,
    detail: `${QLDK_SERVICE}/thong-tin-chu-phuong-tien/find-by-id/{id}`,
    paginate: `${QLDK_SERVICE}/thong-tin-chu-phuong-tien/find-all/paginate`,
    import: `${QLDK_SERVICE}/thong-tin-chu-phuong-tien/import-excel`,
  },

  ThongKeTongQuan: {
    thongKeDashboard: `${QLDK_SERVICE}/thong-ke/thong-ke-dashboard`,
    thongKePhiDichVu: `${QLDK_SERVICE}/thong-ke/thong-ke-phi-dich-vu`,
    thongKeChiTietPhiDichVu: `${QLDK_SERVICE}/thong-ke/thong-ke-phi-dich-vu-chi-tiet`,
    thongKeHoaDon: `${QLDK_SERVICE}/thong-ke/thong-ke-hoa-don`,
    thongKeLePhiTheoNgay: `${QLDK_SERVICE}/thong-ke/thong-ke-le-phi-theo-ngay`,
    exportExcel: `${QLDK_SERVICE}/thong-ke/thong-ke-le-phi-theo-ngay/export-excel`,
  },

  hoSoDangKiem: {
    create: `${QLDK_SERVICE}/ho-so/create`,
    update: `${QLDK_SERVICE}/ho-so`,
    delete: `${QLDK_SERVICE}/ho-so/{id}`,
    detail: `${QLDK_SERVICE}/ho-so/find-by-id/{id}`,
    paginate: `${QLDK_SERVICE}/ho-so/get-ho-so-by-user-tiep-nhan/paginate`,
    HoaDonpaginate: `${QLDK_SERVICE}/ho-so/get-danh-sach-hoa-don/paginate`,
  },

  hoSoPhiDichVu: {
    create: `${QLDK_SERVICE}/ho-so-phi-dich-vu/create`,
    update: `${QLDK_SERVICE}/ho-so-phi-dich-vu`,
    delete: `${QLDK_SERVICE}/ho-so-phi-dich-vu`,
    softdelete: `${QLDK_SERVICE}/ho-so-phi-dich-vu/delete`,
    detail: `${QLDK_SERVICE}/ho-so-phi-dich-vu/find-by-id/{id}`,
    paginate: `${QLDK_SERVICE}/ho-so-phi-dich-vu/get-ho-so-phi-dich-vu-by-hs-id/paginate`,
  },

  thanhToan: {
    generate: `${QLDK_SERVICE}/thanh-toan/vietqr/generate`,
    notification: `${QLDK_SERVICE}/thanh-toan/test/notification`,
    callBack: `${QLDK_SERVICE}/thanh-toan/pvcb/call-back`,
    image: `${QLDK_SERVICE}/thanh-toan/generate/image`,
  },

  settingSystem: {
    configSystemIndex: `${USER_SERVICE}/config-system/index`,
    configSystemUpdate: `${USER_SERVICE}/config-system/update`,
  },

  SettingPayment: {
    configOrganizationSimple: `${USER_SERVICE}/config-organization/simple`,
    configOrganizationUpdate: `${USER_SERVICE}/config-organization/update`,
  },

  SettingFee: {
    configOrganizationSimple: `${USER_SERVICE}/config-organization/simple`,
    configOrganizationUpdate: `${USER_SERVICE}/config-organization/update`,
  },

  hoaDon: {
    getInfor: `${QLDK_SERVICE}/api/v1/invoices/get-info`,
    publish: `${QLDK_SERVICE}/api/v1/invoices/publish`,
    download: `${QLDK_SERVICE}/api/v1/invoices/download/file`,
    flush: `${QLDK_SERVICE}/api/v1/invoices/invoice/flush`,
    exportExcel: `${QLDK_SERVICE}/api/v1/invoices/export/excel`,
    listInvoiceDetails: `${QLDK_SERVICE}/api/v1/invoices/list/details`,
  },

  mauHoaDon: {
    paginate: `${QLDK_SERVICE}/danh-muc-mau-hoa-don/find-all/paginate`,
    create: `${QLDK_SERVICE}/danh-muc-mau-hoa-don/create`,
    update: `${QLDK_SERVICE}/danh-muc-mau-hoa-don/{id}`,
    delete: `${QLDK_SERVICE}/danh-muc-mau-hoa-don/{id}`,
  },

  vnuConverter: {
    convert: `${QLDK_SERVICE}/convert-font/convert`,
  },
  excel: {
    convert: `${QLDK_SERVICE}/api/excel/convert`,
  },

  // Add other URLs here as needed
};

export default API_URLS;
