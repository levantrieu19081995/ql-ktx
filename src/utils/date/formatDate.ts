// src/utils/date/formatDate.ts

/**
 * 🗓️ Chuyển chuỗi ngày sang định dạng MM/dd/YYYY
 * @param dateString - chuỗi ngày (ISO string hoặc "YYYY-MM-DD")
 * @returns Chuỗi định dạng "MM/dd/YYYY"
 */
export const formatToMMDDYYYY = (dateString: string | null): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};
