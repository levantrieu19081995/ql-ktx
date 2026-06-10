 

export interface InvoiceListRequest {
  pattern?: string;
  serial?: string;
  fromDate: string; // dd/MM/yyyy
  toDate: string;   // dd/MM/yyyy
}

export interface InvoiceItem {
  soHoaDon: string;
  ngayLap: string;
  maHangHoa: string;
  tenNguoiMua: string;
  maSoThue: string;
  hinhThucThanhToan: string;
  tongTienThanhToan: string;
  status: number;
  statusDescription: string;
}

export interface InvoiceListResponse {
  data?: any;
  invoices?: InvoiceItem[];
  success?: boolean;
  message?: string;
  totalInvoices?: number;
}
