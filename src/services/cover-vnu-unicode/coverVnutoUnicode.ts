import API_URLS from "@/constants/apiUrls";
import { post } from "@/utils/axios";

export type ConvertFontRequest = {
  duLieu: string; //  đúng theo BE validate field "duLieu"
};

export type ConvertFontResponse = {
  time?: string;
  status?: string;   // "OK" | "BAD_REQUEST" ...
  message?: string;  // "Thành công" | "Thất bại" ...
  code?: number;     // 1003 ...
  payload?: any;  // text sau convert
  errors?: Array<{ field?: string; message?: string }>;
};

export async function convertFont(input: string): Promise<string> {
  const url = API_URLS.vnuConverter.convert;

  const text = (input ?? "").toString().trim();
  if (!text) return "";

  try {
    const res = (await post(url, { duLieu: text } as ConvertFontRequest)) as ConvertFontResponse;

    // chuẩn hoá output
    const converted = (res?.payload ?? "").toString();

    // nếu BE trả OK nhưng payload rỗng thì fallback về input
    if (!converted) return text;

    return converted;
  } catch (err: any) {
    const data = err?.response?.data as ConvertFontResponse | undefined;

    const msg =
      data?.message ||
      data?.errors?.[0]?.message ||
      err?.message ||
      "Convert font request failed";

    console.error("[convertFont] error:", {
      url,
      status: err?.response?.status,
      message: msg,
      data,
    });

    // tuỳ bạn: có thể throw để UI showNoti, hoặc fail-safe return input
    throw err;
    // return text;
  }
}
