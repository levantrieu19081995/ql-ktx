"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { Badge, Button, Card, Group, Stack, Text } from "@mantine/core";
import { IconFileTypePdf } from "@tabler/icons-react";
import jsPDF from "jspdf";

type GiaTriOPdf = string | number | boolean | null | undefined;
export type DongPdf = Record<string, GiaTriOPdf> | GiaTriOPdf[];

export type CotPdf = {
  key?: string;
  label: string;
};

type PdfExportOptions = {
  cot?: CotPdf[];
  soCot?: number;
  nhanCot?: string[];
  tieuDe?: string;
};

export type PdfExportFormProps = {
  title?: string;
  tieuDe?: string;
  columnCount?: number;
  soCot?: number;
  columnLabels?: string[];
  nhanCot?: string[];
  columns?: CotPdf[];
  cot?: CotPdf[];
  data?: DongPdf[];
  duLieu?: DongPdf[];
  fileName?: string;
  tenFile?: string;
  buttonLabel?: string;
  nhanNut?: string;
  disabled?: boolean;
  autoExport?: boolean;
  hidden?: boolean;
  onExported?: () => void;
};

const TIEU_DE_MAC_DINH = "BÁO CÁO DANH SÁCH LỊCH SỬ RA VÀO";
const TEN_FONT_THUONG = "ArialCustom";
const TEN_FONT_DAM = "ArialCustomBold";

let taiFontPdfPromise: Promise<{ thuong: string; dam: string }> | null = null;

const arrayBufferSangBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
};

const taiFontPdf = async () => {
  if (!taiFontPdfPromise) {
    taiFontPdfPromise = (async () => {
      const [fontThuong, fontDam] = await Promise.all([
        fetch("/fonts/arial.ttf").then((res) => res.arrayBuffer()),
        fetch("/fonts/arialbd.ttf").then((res) => res.arrayBuffer()),
      ]);

      return {
        thuong: arrayBufferSangBase64(fontThuong),
        dam: arrayBufferSangBase64(fontDam),
      };
    })();
  }

  return taiFontPdfPromise;
};

const chuanHoaTieuDePdf = (title?: string) => {
  const giaTri = title?.trim();

  if (!giaTri) {
    return TIEU_DE_MAC_DINH;
  }

  const tieuDeInHoa = giaTri.toLocaleUpperCase("vi-VN");
  return tieuDeInHoa.startsWith("BÁO CÁO")
    ? tieuDeInHoa
    : `BÁO CÁO ${tieuDeInHoa}`;
};

const taoDanhSachCotPdf = ({
  cot,
  soCot,
  nhanCot,
  duLieu,
}: {
  cot?: CotPdf[];
  soCot?: number;
  nhanCot?: string[];
  duLieu: DongPdf[];
}): CotPdf[] => {
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

const chuanHoaDuLieuPdf = (
  duLieu: DongPdf[],
  options?: PdfExportOptions,
): Record<string, GiaTriOPdf>[] => {
  const danhSachCot = taoDanhSachCotPdf({
    cot: options?.cot,
    soCot: options?.soCot,
    nhanCot: options?.nhanCot,
    duLieu,
  });

  if (danhSachCot.length === 0) {
    return duLieu.map((dong) =>
      Array.isArray(dong)
        ? dong.reduce<Record<string, GiaTriOPdf>>((ketQua, giaTri, index) => {
            ketQua[`Cột ${index + 1}`] = giaTri;
            return ketQua;
          }, {})
        : dong,
    );
  }

  return duLieu.map((dong) => {
    if (Array.isArray(dong)) {
      return danhSachCot.reduce<Record<string, GiaTriOPdf>>(
        (ketQua, cot, index) => {
          ketQua[cot.label] = dong[index];
          return ketQua;
        },
        {},
      );
    }

    return danhSachCot.reduce<Record<string, GiaTriOPdf>>((ketQua, cot) => {
      const key = cot.key ?? cot.label;
      ketQua[cot.label] = dong[key];
      return ketQua;
    }, {});
  });
};

const veHeaderBang = (
  pdf: jsPDF,
  nhanCot: string[],
  xBatDau: number,
  yBatDau: number,
  tongRong: number,
) => {
  const rongCot = tongRong / Math.max(nhanCot.length, 1);
  pdf.setFont(TEN_FONT_DAM, "bold");
  pdf.setFontSize(11);

  const nhanCotDaTach = nhanCot.map((nhan) =>
    pdf.splitTextToSize(nhan, Math.max(rongCot - 2, 8)),
  );
  const soDongLonNhat = Math.max(
    ...nhanCotDaTach.map((dong) => dong.length),
    1,
  );
  const chieuCao = Math.max(10, soDongLonNhat * 4.5 + 3);

  nhanCotDaTach.forEach((nhan, index) => {
    const x = xBatDau + index * rongCot;
    pdf.rect(x, yBatDau, rongCot, chieuCao);
    pdf.text(nhan, x + rongCot / 2, yBatDau + 4.5, { align: "center" });
  });

  return { rongCot, chieuCao };
};

const veThongTinDauTrang = (
  pdf: jsPDF,
  pageWidth: number,
  yBatDau: number,
) => {
  const khoiTraiX = 20;
  const khoiTraiW = 80;
  const khoiPhaiW = 110;
  const khoiPhaiX = pageWidth - khoiPhaiW - 20;

  pdf.setFont(TEN_FONT_DAM, "bold");
  pdf.setFontSize(15);
  pdf.text("ĐẠI HỌC CẦN THƠ", khoiTraiX + khoiTraiW / 2, yBatDau, {
    align: "center",
  });
  pdf.text(
    "PHÒNG CÔNG TÁC SINH VIÊN",
    khoiTraiX + khoiTraiW / 2,
    yBatDau + 8,
    {
      align: "center",
    },
  );

  pdf.text(
    "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
    khoiPhaiX + khoiPhaiW / 2,
    yBatDau,
    {
      align: "center",
    },
  );
  pdf.setFont(TEN_FONT_THUONG, "normal");
  pdf.setFontSize(13);
  pdf.text(
    "Độc lập - Tự do - Hạnh phúc",
    khoiPhaiX + khoiPhaiW / 2,
    yBatDau + 8,
    {
      align: "center",
    },
  );

  return yBatDau + 20;
};

export const xuatRaFilePdf = async (
  duLieu: DongPdf[],
  tenFile: string,
  options?: PdfExportOptions,
) => {
  const fontPdf = await taiFontPdf();
  const duLieuDaChuanHoa = chuanHoaDuLieuPdf(duLieu, options);
  const nhanCot =
    options?.cot?.map((item) => item.label) ||
    options?.nhanCot ||
    Object.keys(duLieuDaChuanHoa[0] || {});
  const tieuDe = chuanHoaTieuDePdf(options?.tieuDe);

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  pdf.addFileToVFS("arial.ttf", fontPdf.thuong);
  pdf.addFont("arial.ttf", TEN_FONT_THUONG, "normal");
  pdf.addFileToVFS("arialbd.ttf", fontPdf.dam);
  pdf.addFont("arialbd.ttf", TEN_FONT_DAM, "bold");
  pdf.setFont(TEN_FONT_THUONG, "normal");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginX = 10;
  const marginTop = 14;
  const marginBottom = 12;
  const tongRongBang = pageWidth - marginX * 2;

  let y = marginTop;

  const veTieuDe = (laTrangDau: boolean) => {
    y = laTrangDau ? veThongTinDauTrang(pdf, pageWidth, marginTop) : marginTop;
    pdf.setFont(TEN_FONT_DAM, "bold");
    pdf.setFontSize(18);
    pdf.text(tieuDe, pageWidth / 2, y, { align: "center" });
    y += 8;
    return veHeaderBang(pdf, nhanCot, marginX, y, tongRongBang);
  };

  let { rongCot, chieuCao } = veTieuDe(true);
  y += chieuCao;

  duLieuDaChuanHoa.forEach((dong) => {
    const noiDungDong = nhanCot.map((nhan) => String(dong[nhan] ?? ""));
    const dongDaTach = noiDungDong.map((giaTri) =>
      pdf.splitTextToSize(giaTri, Math.max(rongCot - 2, 8)),
    );
    const soDongMax = Math.max(...dongDaTach.map((item) => item.length), 1);
    const chieuCaoDong = Math.max(8, soDongMax * 5);

    if (y + chieuCaoDong > pageHeight - marginBottom) {
      pdf.addPage();
      pdf.setFont(TEN_FONT_THUONG, "normal");
      y = marginTop;
      ({ rongCot, chieuCao } = veTieuDe(false));
      y += chieuCao;
    }

    dongDaTach.forEach((giaTri, index) => {
      const x = marginX + index * rongCot;
      pdf.rect(x, y, rongCot, chieuCaoDong);
      pdf.setFont(TEN_FONT_THUONG, "normal");
      pdf.setFontSize(10);
      pdf.text(giaTri, x + 1.5, y + 4.8);
    });

    y += chieuCaoDong;
  });

  pdf.save(`${tenFile}.pdf`);
};

export default function PdfExportForm(props: PdfExportFormProps) {
  const daTuDongXuatRef = useRef<string | null>(null);
  const title = props.title || props.tieuDe || "Xuất PDF";
  const duLieu = useMemo(
    () => props.data || props.duLieu || [],
    [props.data, props.duLieu],
  );
  const cot = props.columns || props.cot;
  const nhanCot = props.columnLabels || props.nhanCot || [];
  const soCot =
    props.columnCount || props.soCot || cot?.length || nhanCot.length || 0;
  const tenFile = props.fileName || props.tenFile || "du_lieu_xuat";
  const nhanNut = props.buttonLabel || props.nhanNut || "Xuất PDF";

  const danhSachCot = taoDanhSachCotPdf({
    cot,
    soCot,
    nhanCot,
    duLieu,
  });

  const xuLyXuatFile = useCallback(async () => {
    await xuatRaFilePdf(duLieu, tenFile, {
      cot: danhSachCot,
      soCot,
      nhanCot: danhSachCot.map((item) => item.label),
      tieuDe: title,
    });

    props.onExported?.();
  }, [danhSachCot, duLieu, props, soCot, tenFile, title]);

  useEffect(() => {
    if (!props.autoExport || duLieu.length === 0) {
      return;
    }

    const khoaXuat = JSON.stringify({
      tenFile,
      soDong: duLieu.length,
      cot: danhSachCot.map((item) => item.label),
      title,
    });

    if (daTuDongXuatRef.current === khoaXuat) {
      return;
    }

    daTuDongXuatRef.current = khoaXuat;
    void xuLyXuatFile();
  }, [props.autoExport, duLieu, tenFile, danhSachCot, title, xuLyXuatFile]);

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
            leftSection={<IconFileTypePdf size={18} />}
            onClick={() => void xuLyXuatFile()}
            disabled={props.disabled || duLieu.length === 0}
            color="red"
            variant="light"
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
                <Badge key={`${item.label}-${index}`} color="red" variant="light">
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
