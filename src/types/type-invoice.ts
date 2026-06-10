// export interface InvoiceRequest {
//   hsId: number;
//   pdvId: number[];
// }
export interface InvoiceRequest {
  hsId?: number;
  pdvId?: number[];
  danhSachPdv?: {
    pdvId: number;
    lanThu: number;
  }[];
}


export interface InvoiceResponse {
  code?: number;
  errors?: any;
  time?: string;
  message?: string;
  status?: string;
  payload?: InvoicePayload;
}

export interface InvoicePayload {
  danhSach: {
    danhSachHoaDon: InvoiceItem[];
  };
}

export interface InvoiceItem {
  thongTinChiTiet: {
    thongTinChung: InvoiceGeneralInfo;
    noiDung: InvoiceContent;
  };
  fkey: string;
}

export interface InvoiceGeneralInfo {
  donViTienTe: string;
  tyGia: string | null;
  hinhThucThanhToan: string;
  pban: string | null;
  thdon: string | null;
  hdcttchinh: string | null;
}

export interface InvoiceContent {
  nguoiBan: SellerInfo;
  nguoiMua: BuyerInfo;
  danhSachSanPham: ProductList;
  thanhToan: PaymentSummary;
}

export interface SellerInfo {
  soTaiKhoan: string;
  tenNganHang: string;
  mchang: string;
  tchang: string;
}

export interface BuyerInfo {
  ten: string;
  maSoThue: string;
  diaChi: string;
  soDienThoai: string | null;
}

export interface ProductList {
  danhSach: ProductItem[];
}

export interface ProductItem {
  tinhChat: number;
  maSanPham: string;
  tenSanPham: string;
  thanhTien: string;
  thueSuat: string;
  tienThue: string;
  thanhTienSauThue: string;
}

export interface PaymentSummary {
  danhSachThue: {
    danhSach: TaxItem[];
  };
  tongTienChuaThue: string;
  tongTienThue: string;
  tongTienThanhToan: string;
  tongTienBangChu: string;
  danhSachLePhi: {
    danhSach: FeeItem[];
  }[];
}

export interface TaxItem {
  thueSuat: string;
  thanhTien: string;
  tienThue: string;
}

export interface FeeItem {
  tenLePhi: string;
  tienPhi: string;
  kieuDuLieu: string | null;
}


export interface InvoiceDownloadRequest {
  fkey: string;
}

export interface InvoiceDownloadResponse {
  status: string;
  message?: string;
  fileName?: string;
  fileType?: string;
  fileData?: Blob;  
}
