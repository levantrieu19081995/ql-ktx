// src/hooks/useSuKienTrucTiep.ts
//
// Nhận sự kiện nhận diện realtime bằng long-poll qua proxy cùng origin
// (GET /api/dashboard/recognitions?wait=10&unknown=1).
//   1. Gọi không có `after` để lấy mốc next_after hiện tại (không kéo lịch sử cũ).
//   2. Lặp: gọi after=<mốc>&wait=<giây>, server giữ kết nối tới khi có sự kiện mới.
// Lỗi mạng thì chờ rồi thử lại, không làm sập giao diện.
//
// Loại sự kiện: recognized, ban_check, spoof, unknown, unknown_body.
// ban_check không hiện thành dòng riêng: kết quả cấm/nợ được gắn vào dòng recognized
// có cùng image_path (ban_check luôn đến sau recognized).
import { useEffect, useRef, useState } from "react";
import { SuKienTrucTiep, dichVuCamera } from "@/services/camera/cameraService";

const TOI_DA_SU_KIEN = 60; // số sự kiện giữ lại trong bộ nhớ
const GIAY_CHO = 10; // thời gian giữ kết nối mỗi lần long-poll
const CHO_THU_LAI_MS = 3000;

export type TrangThaiTrucTiep = "idle" | "connecting" | "open" | "error";

/** Gộp một lô sự kiện mới (theo thứ tự seq tăng dần) vào danh sách hiện có (mới nhất đứng đầu). */
function gopSuKien(truoc: SuKienTrucTiep[], moi: SuKienTrucTiep[]): SuKienTrucTiep[] {
  let ds = truoc;
  const daCo = new Set(truoc.map((x) => x.seq));

  for (const e of moi) {
    if (e.type === "ban_check") {
      if (!e.result) continue;
      const ban = e.result;
      // ban_check của sự kiện đã trôi khỏi danh sách thì không khớp dòng nào và bị bỏ qua
      ds = ds.map((x) =>
        x.type === "recognized" &&
        ((e.image_path && x.image_path === e.image_path) ||
          (!e.image_path && x.person?.id === e.person?.id && x.camera?.index === e.camera?.index))
          ? { ...x, ban }
          : x,
      );
      continue;
    }
    if (daCo.has(e.seq)) continue;
    daCo.add(e.seq);
    ds = [e, ...ds];
  }
  return ds.slice(0, TOI_DA_SU_KIEN);
}

export function useSuKienTrucTiep(enabled: boolean, kemThanNguoi = false) {
  const [suKien, setSuKien] = useState<SuKienTrucTiep[]>([]);
  // unknown_body rất dày (người đi qua nhưng chưa thấy mặt): chỉ giữ khi được bật, không mở lại kết nối khi đổi
  const kemThanRef = useRef(kemThanNguoi);
  kemThanRef.current = kemThanNguoi;
  const [trangThai, setTrangThai] = useState<TrangThaiTrucTiep>("idle");

  useEffect(() => {
    if (!enabled) {
      setTrangThai("idle");
      return;
    }

    const ctrl = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let after: number | undefined;
    let streamId: string | undefined;

    const cho = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, ms);
      });

    const chay = async () => {
      setTrangThai("connecting");
      while (!ctrl.signal.aborted) {
        try {
          const r = await dichVuCamera.layTrucTiep(
            after === undefined
              ? { unknown: true }
              : { after, wait: GIAY_CHO, limit: 50, unknown: true },
            ctrl.signal,
          );
          if (ctrl.signal.aborted) return;
          // service khởi động lại → stream_id đổi, bộ đếm seq về từ đầu: lấy lại mốc mới
          if (streamId && r.stream_id !== streamId) {
            streamId = r.stream_id;
            after = undefined;
            continue;
          }
          streamId = r.stream_id;
          setTrangThai("open");
          if (after !== undefined && r.events?.length) {
            const bayGio = Date.now();
            const lo = r.events
              .filter((e) => kemThanRef.current || e.type !== "unknown_body")
              .sort((a, b) => a.seq - b.seq)
              .map((e) => ({ ...e, nhanLuc: bayGio }));
            if (lo.length) setSuKien((prev) => gopSuKien(prev, lo));
          }
          after = r.next_after;
        } catch {
          if (ctrl.signal.aborted) return;
          setTrangThai("error");
          await cho(CHO_THU_LAI_MS);
        }
      }
    };

    setSuKien([]);
    chay();

    return () => {
      ctrl.abort();
      if (timer) clearTimeout(timer);
    };
  }, [enabled]);

  return { suKien, trangThai };
}
