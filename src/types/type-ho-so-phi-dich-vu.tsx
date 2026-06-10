// types/type-ho-so-phi-dich-vu.ts
export interface DeleteHoSoPhiDichVuResponse {
  time: string;
  message: string;
  status: string;
  payload?: any;
  metadata?: Record<string, any>;
}
// ===== XÓA MỀM HỒ SƠ PHÍ DỊCH VỤ =====
export interface SoftDeleteHoSoPhiDichVuResponse {
  time: string;
  message: string;
  status: string;
  payload?: Record<string, any>;
  metadata?: Record<string, any>;
}
