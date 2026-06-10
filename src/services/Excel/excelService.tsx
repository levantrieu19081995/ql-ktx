import axiosBlob from "@/utils/axiosBlob";
import API_URLS from "@/constants/apiUrls";

export function parseFilenameFromContentDisposition(cd?: string) {
  if (!cd) return "output_converted.xlsx";

  const m1 = cd.match(/filename\*\=UTF-8''([^;]+)/i);
  if (m1?.[1]) return decodeURIComponent(m1[1]);

  const m2 = cd.match(/filename="([^"]+)"/i);
  if (m2?.[1]) return m2[1];

  const m3 = cd.match(/filename=([^;]+)/i);
  if (m3?.[1]) return m3[1].trim();

  return "output_converted.xlsx";
}

export type ExcelConvertResult = {
  blob: Blob;
  filename: string;
  contentType: string;
  size: number;
  headers: Record<string, any>;
};

export const convertExcel = async (file: File): Promise<ExcelConvertResult> => {
  const fd = new FormData();
  fd.append("file", file);

  const res = await axiosBlob.post(API_URLS.excel.convert, fd, {
    headers: {
      Accept: "*/*",
      // KHÔNG set Content-Type
    },
  });

  const headers = res.headers || {};
  const cd = headers["content-disposition"] as string | undefined;
  const filename = parseFilenameFromContentDisposition(cd);

  const blob = res.data as Blob;

  return {
    blob,
    filename,
    contentType: blob.type || headers["content-type"] || "",
    size: blob.size || 0,
    headers,
  };
};
