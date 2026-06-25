export interface ChuPhuongTien {
  id?: string;
  hoVaTen?: string;
  soDienThoai?: string;
  email?: string;
  [key: string]: any;
}

export interface ChuPhuongTienPut {
  id?: string;
  [key: string]: any;
}

export interface ThongTinPhuongTien {
  id?: string;
  [key: string]: any;
}

export interface ChuPhuongTienImportExcelRequest {
  [key: string]: any;
}
