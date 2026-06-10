import { convertFont } from "@/services/cover-vnu-unicode/coverVnutoUnicode";

  export const convertVNUorTCVN3ToUnicode = async (keyword: string) => {
    if (!keyword) return keyword;

    const s = keyword.replace(/\u00A0/g, " ").trim();
    if (!s) return "";

    try {
      const res = await convertFont(s); 

      return (res ?? s).toString();
    } catch {
      return s;
    }
  };