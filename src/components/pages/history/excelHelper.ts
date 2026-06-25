import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export type DongExcel = Record<string, string | number | boolean | null | undefined>;

export const xuatRaFileExcel = (duLieu: DongExcel[], tenFile: string, tenTrang: string = 'Sheet1') => {
  const loaiTep = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  const duoiTep = '.xlsx';

  const trangTinh = XLSX.utils.json_to_sheet(duLieu);
  const soTinh = { Sheets: { [tenTrang]: trangTinh }, SheetNames: [tenTrang] };
  const vungDemExcel = XLSX.write(soTinh, { bookType: 'xlsx', type: 'array' });
  const doiTuongBlob = new Blob([vungDemExcel], { type: loaiTep });
  saveAs(doiTuongBlob, tenFile + duoiTep);
};
