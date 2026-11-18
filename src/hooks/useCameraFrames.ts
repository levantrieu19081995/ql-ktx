// src/hooks/useCameraFrames.ts
//
// Nhận video dạng lưới từ /api/camera-service/frames: server nối WebSocket /api/frames của service camera
// (có token) rồi đẩy khung ảnh xuống trình duyệt qua MỘT kết nối HTTP. Nhờ vậy không cần nginx chuyển tiếp
// WebSocket, chạy được cả khi dev local, và token không lộ ra trình duyệt.
//
// Luồng nhị phân gồm các khung nối tiếp nhau:
//   [0..4)  uint32 BE  index camera
//   [4..8)  uint32 BE  size (độ dài JPEG)
//   [8..16) float64 BE thời điểm gửi (Unix, giây)
//   [16..)  JPEG (size byte)
import { useEffect, useRef, useState } from "react";

export type TrangThaiFrames = "idle" | "connecting" | "open" | "failed";

const MAX_LAN_THU_LAI = 2; // quá số lần này mà chưa nhận được khung nào thì coi như không dùng được
const CHO_NOI_LAI_MS = 1500;
const DO_DAI_DAU_KHUNG = 16;

export interface TuyChonKhung {
  width?: number; // độ phân giải (px), BE giới hạn theo camera
  quality?: number; // chất lượng JPEG
}

function taoUrl(indexes: number[], fps: number, tuyChon?: TuyChonKhung) {
  return (
    `/api/camera-service/frames?streams=${indexes.join(",")}&fps=${fps}` +
    (tuyChon?.width ? `&width=${tuyChon.width}` : "") +
    (tuyChon?.quality ? `&quality=${tuyChon.quality}` : "") +
    `&bodies=1`
  );
}

function noiMang(a: Uint8Array, b: Uint8Array) {
  if (a.length === 0) return b;
  const r = new Uint8Array(a.length + b.length);
  r.set(a, 0);
  r.set(b, a.length);
  return r;
}

export function useCameraFrames(
  indexes: number[],
  enabled: boolean,
  fps = 10,
  tuyChon?: TuyChonKhung,
) {
  const [frames, setFrames] = useState<Record<number, string>>({});
  const [trangThai, setTrangThai] = useState<TrangThaiFrames>("idle");
  const urlsRef = useRef<Record<number, string>>({});

  // key ổn định để không mở lại luồng khi mảng indexes chỉ đổi tham chiếu
  const key = indexes.join(",");
  const width = tuyChon?.width;
  const quality = tuyChon?.quality;

  useEffect(() => {
    const giaiPhong = () => {
      Object.values(urlsRef.current).forEach((u) => URL.revokeObjectURL(u));
      urlsRef.current = {};
      setFrames({});
    };

    if (!enabled || indexes.length === 0) {
      setTrangThai("idle");
      giaiPhong();
      return;
    }

    const ctrl = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let soLanLoi = 0;
    let daNhanKhung = false;

    const cho = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, ms);
      });

    const doc = async () => {
      while (!ctrl.signal.aborted) {
        setTrangThai("connecting");
        try {
          const res = await fetch(taoUrl(indexes, fps, { width, quality }), {
            cache: "no-store",
            signal: ctrl.signal,
          });
          if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

          const reader = res.body.getReader();
          let buf: Uint8Array<ArrayBufferLike> = new Uint8Array(0);

          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            if (!value) continue;
            buf = noiMang(buf, value);

            const capNhat: Record<number, string> = {};
            let off = 0;
            while (buf.length - off >= DO_DAI_DAU_KHUNG) {
              const dv = new DataView(buf.buffer, buf.byteOffset + off, DO_DAI_DAU_KHUNG);
              const index = dv.getUint32(0, false);
              const size = dv.getUint32(4, false);
              if (buf.length - off - DO_DAI_DAU_KHUNG < size) break; // chưa đủ dữ liệu, chờ thêm
              const jpeg = buf.slice(
                off + DO_DAI_DAU_KHUNG,
                off + DO_DAI_DAU_KHUNG + size,
              );
              const url = URL.createObjectURL(new Blob([jpeg], { type: "image/jpeg" }));
              const cu = urlsRef.current[index] ?? capNhat[index];
              if (cu) URL.revokeObjectURL(cu);
              urlsRef.current[index] = url;
              capNhat[index] = url;
              off += DO_DAI_DAU_KHUNG + size;
            }
            buf = buf.subarray(off);

            if (Object.keys(capNhat).length > 0) {
              daNhanKhung = true;
              soLanLoi = 0;
              setTrangThai("open");
              setFrames((prev) => ({ ...prev, ...capNhat }));
            }
          }
          // luồng kết thúc bình thường (server đóng) → nối lại
        } catch {
          if (ctrl.signal.aborted) return;
        }

        if (ctrl.signal.aborted) return;
        soLanLoi += 1;
        if (!daNhanKhung && soLanLoi >= MAX_LAN_THU_LAI) {
          setTrangThai("failed");
          return;
        }
        setTrangThai("connecting");
        await cho(CHO_NOI_LAI_MS);
      }
    };

    doc();

    return () => {
      ctrl.abort();
      if (timer) clearTimeout(timer);
      giaiPhong();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled, fps, width, quality]);

  return { frames, trangThai };
}
