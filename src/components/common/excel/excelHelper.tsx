"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { Badge, Button, Card, Group, Stack, Text } from "@mantine/core";
import { IconFileSpreadsheet } from "@tabler/icons-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export type GiaTriOExcel = string | number | boolean | null | undefined;
export type DongExcel = Record<string, GiaTriOExcel> | GiaTriOExcel[];

export type CotExcel = {
  key?: string;
  label: string;
};

type ExcelExportOptions = {
  tenFile?: string;
  tenTrang?: string;
  cot?: CotExcel[];
  soCot?: number;
  nhanCot?: string[];
  tieuDe?: string;
};

export type ExcelExportFormProps = {
  title?: string;
  tieuDe?: string;
  columnCount?: number;
  soCot?: number;
  columnLabels?: string[];
  nhanCot?: string[];
  columns?: CotExcel[];
  cot?: CotExcel[];
  data?: DongExcel[];
  duLieu?: DongExcel[];
  fileName?: string;
  tenFile?: string;
  sheetName?: string;
  tenTrang?: string;
  buttonLabel?: string;
  nhanNut?: string;
  disabled?: boolean;
  autoExport?: boolean;
  hidden?: boolean;
  onExported?: () => void;
};

const LOAI_TEP_EXCEL =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const DUOI_TEP_EXCEL = ".xlsx";
const TIEU_DE_MAC_DINH = "BÁO CÁO DANH SÁCH LỊCH SỬ RA VÀO";

const chuanHoaTieuDeBaoCao = (title?: string) => {
  const giaTri = title?.trim();

  if (!giaTri) {
    return TIEU_DE_MAC_DINH;
  }

  const tieuDeInHoa = giaTri.toLocaleUpperCase("vi-VN");

  if (tieuDeInHoa.startsWith("BÁO CÁO")) {
    return tieuDeInHoa;
  }

  return `BÁO CÁO ${tieuDeInHoa}`;
};

const taoDanhSachCot = ({
  cot,
  soCot,
  nhanCot,
  duLieu,
}: {
  cot?: CotExcel[];
  soCot?: number;
  nhanCot?: string[];
  duLieu: DongExcel[];
}): CotExcel[] => {
  if (cot && cot.length > 0) {
    return cot;
  }

  const dongDauTien = duLieu[0];
  const tongSoCot =
    soCot ??
    nhanCot?.length ??
    (Array.isArray(dongDauTien)
      ? dongDauTien.length
      : dongDauTien
        ? Object.keys(dongDauTien).length
        : 0);

  return Array.from({ length: tongSoCot }, (_, index) => ({
    key: Array.isArray(dongDauTien)
      ? String(index)
      : dongDauTien
        ? Object.keys(dongDauTien)[index]
        : undefined,
    label: nhanCot?.[index] || `Cột ${index + 1}`,
  }));
};

const chuanHoaDuLieuExcel = (
  duLieu: DongExcel[],
  options?: ExcelExportOptions,
): Record<string, GiaTriOExcel>[] => {
  const danhSachCot = taoDanhSachCot({
    cot: options?.cot,
    soCot: options?.soCot,
    nhanCot: options?.nhanCot,
    duLieu,
  });

  if (danhSachCot.length === 0) {
    return duLieu.map((dong) =>
      Array.isArray(dong)
        ? dong.reduce<Record<string, GiaTriOExcel>>((ketQua, giaTri, index) => {
            ketQua[`Cột ${index + 1}`] = giaTri;
            return ketQua;
          }, {})
        : dong,
    );
  }

  return duLieu.map((dong) => {
    if (Array.isArray(dong)) {
      return danhSachCot.reduce<Record<string, GiaTriOExcel>>(
        (ketQua, cot, index) => {
          ketQua[cot.label] = dong[index];
          return ketQua;
        },
        {},
      );
    }

    return danhSachCot.reduce<Record<string, GiaTriOExcel>>((ketQua, cot) => {
      const key = cot.key ?? cot.label;
      ketQua[cot.label] = dong[key];
      return ketQua;
    }, {});
  });
};

export const xuatRaFileExcel = (
  duLieu: DongExcel[],
  tenFile: string,
  tenTrang: string = "Sheet1",
  options?: Omit<ExcelExportOptions, "tenFile" | "tenTrang">,
) => {
  const duLieuDaChuanHoa = chuanHoaDuLieuExcel(duLieu, {
    ...options,
    tenFile,
    tenTrang,
  });

  const tieuDeExcel = chuanHoaTieuDeBaoCao(options?.tieuDe);
  const nhanCot =
    options?.cot?.map((item) => item.label) ||
    options?.nhanCot ||
    Object.keys(duLieuDaChuanHoa[0] || {});
  const duLieuBang = duLieuDaChuanHoa.map((dong) =>
    nhanCot.map((nhan) => dong[nhan]),
  );

  const soCotKhoiTieuNgu = 5;
  const soCotDuLieuHieuLuc = Math.max(nhanCot.length, 7);
  const soCotBaoCao = soCotDuLieuHieuLuc + soCotKhoiTieuNgu;
  const cotBatDauKhoiTrai = 1;
  const cotKetThucKhoiTrai = cotBatDauKhoiTrai + soCotKhoiTieuNgu - 3;
  const cotBatDauKhoiPhai = Math.max(soCotDuLieuHieuLuc - 2, 0);
  const cotKetThucKhoiPhai = cotBatDauKhoiPhai + soCotKhoiTieuNgu - 1;
  const cotCuoiTieuDe = Math.max(soCotBaoCao - 4, soCotDuLieuHieuLuc - 1);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(tenTrang);

  const merge = (
    rowStart: number,
    colStart: number,
    rowEnd: number,
    colEnd: number,
  ) => {
    worksheet.mergeCells(rowStart, colStart, rowEnd, colEnd);
  };

  merge(1, cotBatDauKhoiTrai + 1, 1, cotKetThucKhoiTrai + 1);
  merge(1, cotBatDauKhoiPhai + 1, 1, cotKetThucKhoiPhai + 1);
  merge(2, 2, 2, 6);
  merge(6, 2, 6, cotCuoiTieuDe + 1);

  const taoStyleCanGiua = (fontSize: number, bold: boolean = true) => ({
    font: { name: "Times New Roman", size: fontSize, bold },
    alignment: {
      horizontal: "center" as const,
      vertical: "middle" as const,
      wrapText: true,
    },
  });

  worksheet.getCell(1, 2).value = `ĐẠI HỌC CẦN THƠ
PHÒNG CÔNG TÁC SINH VIÊN`;
  worksheet.getCell(1, 2).style = taoStyleCanGiua(16, true);

  worksheet.getCell(1, cotBatDauKhoiPhai + 1).value =
    `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc`;
  worksheet.getCell(1, cotBatDauKhoiPhai + 1).style = taoStyleCanGiua(16, true);

  worksheet.getCell(2, 3).value = "Số:      /BC - P.CTSV";
  worksheet.getCell(2, 3).style = taoStyleCanGiua(14, false);

  worksheet.getCell(6, 2).value = tieuDeExcel;
  worksheet.getCell(6, 2).style = taoStyleCanGiua(18, true);

  worksheet.getRow(1).height = 40;
  worksheet.getRow(2).height = 24;
  worksheet.getRow(3).height = 12;
  worksheet.getRow(4).height = 22;
  worksheet.getRow(5).height = 12;
  worksheet.getRow(6).height = 28;
  worksheet.getRow(7).height = 22;

  const doRongCot = [4, 18, 16, 18, 22, 10, 14, 16, 12, 8, 20, 14, 14, 14, 14];
  for (let index = 0; index < soCotBaoCao; index += 1) {
    worksheet.getColumn(index + 1).width = doRongCot[index] ?? 14;
  }

  const dongHeader = worksheet.getRow(7);
  const vienBangMong = {
    top: { style: "thin" as const },
    left: { style: "thin" as const },
    bottom: { style: "thin" as const },
    right: { style: "thin" as const },
  };

  nhanCot.forEach((nhan, index) => {
    const cell = dongHeader.getCell(index + 1);
    cell.value = nhan;
    cell.font = { name: "Times New Roman", bold: true, size: 12 };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = vienBangMong;
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEFEFEF" },
    };
  });

  duLieuBang.forEach((dong, dongIndex) => {
    const row = worksheet.getRow(8 + dongIndex);
    dong.forEach((giaTri, cotIndex) => {
      const cell = row.getCell(cotIndex + 1);
      cell.value = giaTri === null || giaTri === undefined ? "" : giaTri;
      cell.border = vienBangMong;
      cell.alignment = { vertical: "middle" };
      cell.font = { name: "Times New Roman", size: 11 };
    });
  });

  void workbook.xlsx.writeBuffer().then((buffer) => {
    const doiTuongBlob = new Blob([buffer], { type: LOAI_TEP_EXCEL });
    saveAs(doiTuongBlob, `${tenFile}${DUOI_TEP_EXCEL}`);
  });
};

export default function ExcelExportForm(props: ExcelExportFormProps) {
  const daTuDongXuatRef = useRef<string | null>(null);
  const title = props.title || props.tieuDe || "Xuất Excel";
  const duLieu = useMemo(
    () => props.data || props.duLieu || [],
    [props.data, props.duLieu],
  );
  const cot = props.columns || props.cot;
  const nhanCot = props.columnLabels || props.nhanCot || [];
  const soCot =
    props.columnCount || props.soCot || cot?.length || nhanCot.length || 0;
  const tenFile = props.fileName || props.tenFile || "du_lieu_xuat";
  const tenTrang = props.sheetName || props.tenTrang || "Sheet1";
  const nhanNut = props.buttonLabel || props.nhanNut || "Xuất Excel";

  const danhSachCot = taoDanhSachCot({
    cot,
    soCot,
    nhanCot,
    duLieu,
  });

  const xuLyXuatFile = useCallback(() => {
    xuatRaFileExcel(duLieu, tenFile, tenTrang, {
      cot: danhSachCot,
      soCot,
      nhanCot: danhSachCot.map((item) => item.label),
      tieuDe: title,
    });

    props.onExported?.();
  }, [danhSachCot, duLieu, props, soCot, tenFile, tenTrang, title]);

  useEffect(() => {
    if (!props.autoExport || duLieu.length === 0) {
      return;
    }

    const khoaXuat = JSON.stringify({
      tenFile,
      tenTrang,
      soDong: duLieu.length,
      cot: danhSachCot.map((item) => item.label),
    });

    if (daTuDongXuatRef.current === khoaXuat) {
      return;
    }

    daTuDongXuatRef.current = khoaXuat;
    xuLyXuatFile();
  }, [props.autoExport, duLieu, tenFile, tenTrang, danhSachCot, xuLyXuatFile]);

  if (props.hidden) {
    return null;
  }

  return (
    <Card withBorder radius="md" padding="lg">
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <div>
            <Text fw={700} size="lg">
              {title}
            </Text>
            <Text c="dimmed" size="sm">
              {`Số cột: ${soCot} | Số dòng: ${duLieu.length}`}
            </Text>
          </div>
          <Button
            leftSection={<IconFileSpreadsheet size={18} />}
            onClick={xuLyXuatFile}
            disabled={props.disabled || duLieu.length === 0}
          >
            {nhanNut}
          </Button>
        </Group>

        <Stack gap="xs">
          <Text fw={600} size="sm">
            Nhãn cột
          </Text>
          <Group gap="xs">
            {danhSachCot.length > 0 ? (
              danhSachCot.map((item, index) => (
                <Badge key={`${item.label}-${index}`} variant="light">
                  {item.label}
                </Badge>
              ))
            ) : (
              <Text size="sm" c="dimmed">
                Chưa có cấu hình cột để xuất file.
              </Text>
            )}
          </Group>
        </Stack>
      </Stack>
    </Card>
  );
}
