"use client";

import React, { RefObject, useEffect, useMemo, useState } from "react";
import { SuKienTrucTiep } from "@/services/camera/cameraService";

// Vẽ khung khuôn mặt (bbox) lên video. BE chỉ gửi toạ độ, không vẽ vào khung hình.
// bbox = [x1, y1, x2, y2], chuẩn hoá 0..1 theo khung hình gốc.
// Sự kiện chỉ phát ra lúc nhận diện nên mỗi khung chỉ hiện ngắn rồi tắt.
const THOI_GIAN_HIEN_MS = 2000;
const CHU_KY_KIEM_TRA_MS = 400;

const mauKhung = (e: SuKienTrucTiep) => {
  if (e.type === "spoof") return "#e11d48";
  if (!e.person) return "#f59e0b";
  if (e.ban && e.ban.allowed === false) return "#e11d48";
  if (e.ban?.debt && e.ban.debt > 0) return "#f59e0b";
  return "#22c55e";
};

const nhanKhung = (e: SuKienTrucTiep) => {
  if (e.type === "spoof") return "Nghi giả mạo";
  if (!e.person) return "Người lạ";
  const ten = e.ban?.full_name?.trim() || e.person.name;
  return `${ten} (${e.person.id})`;
};

interface Props {
  /** Phần tử <img> đang hiển thị video (để biết vùng ảnh thật sự sau object-fit: contain). */
  anhRef: RefObject<HTMLImageElement | null>;
  cameraIndex: number;
  suKien: SuKienTrucTiep[];
}

export default function LopKhungNhanDien({ anhRef, cameraIndex, suKien }: Props) {
  const [vung, setVung] = useState<{ l: number; t: number; w: number; h: number } | null>(null);
  const [bayGio, setBayGio] = useState(() => Date.now());

  // Vùng ảnh thật sự hiển thị trong <img> (object-fit: contain có thể chừa viền đen)
  useEffect(() => {
    const img = anhRef.current;
    if (!img) return;
    const tinh = () => {
      const W = img.clientWidth;
      const H = img.clientHeight;
      if (!W || !H) return;
      const tiLe = (img.naturalWidth || 16) / (img.naturalHeight || 9);
      let w = W;
      let h = W / tiLe;
      if (h > H) {
        h = H;
        w = H * tiLe;
      }
      setVung({ l: (W - w) / 2, t: (H - h) / 2, w, h });
    };
    tinh();
    const ro = new ResizeObserver(tinh);
    ro.observe(img);
    img.addEventListener("load", tinh);
    return () => {
      ro.disconnect();
      img.removeEventListener("load", tinh);
    };
  }, [anhRef]);

  // Làm tươi định kỳ để khung hết hạn thì biến mất
  useEffect(() => {
    const timer = setInterval(() => setBayGio(Date.now()), CHU_KY_KIEM_TRA_MS);
    return () => clearInterval(timer);
  }, []);

  const khung = useMemo(() => {
    const daCo = new Set<string>();
    const ds: SuKienTrucTiep[] = [];
    // suKien: mới nhất đứng đầu → mỗi track chỉ giữ khung mới nhất
    for (const e of suKien) {
      if (e.camera?.index !== cameraIndex) continue;
      if (!Array.isArray(e.bbox) || e.bbox.length !== 4) continue;
      if (bayGio - (e.nhanLuc ?? 0) > THOI_GIAN_HIEN_MS) continue;
      const k = e.track ?? String(e.seq);
      if (daCo.has(k)) continue;
      daCo.add(k);
      ds.push(e);
    }
    return ds;
  }, [suKien, cameraIndex, bayGio]);

  if (!vung || khung.length === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {khung.map((e) => {
        const [x1, y1, x2, y2] = e.bbox as number[];
        const mau = mauKhung(e);
        const top = vung.t + y1 * vung.h;
        const nhanTrenKhung = top >= 22; // đủ chỗ phía trên khung thì đặt ngoài, không thì đặt trong khung
        return (
          <div
            key={e.seq}
            style={{
              position: "absolute",
              left: vung.l + x1 * vung.w,
              top: vung.t + y1 * vung.h,
              width: Math.max((x2 - x1) * vung.w, 2),
              height: Math.max((y2 - y1) * vung.h, 2),
              border: `2px solid ${mau}`,
              borderRadius: 4,
              boxShadow: "0 0 0 1px rgba(0,0,0,.35)",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: -2,
                ...(nhanTrenKhung ? { bottom: "100%" } : { top: 0 }),
                background: mau,
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                lineHeight: "20px",
                padding: "0 6px",
                borderRadius: 3,
                whiteSpace: "nowrap",
                maxWidth: 260,
                overflow: "hidden",
                textOverflow: "ellipsis",
                textShadow: "0 1px 1px rgba(0,0,0,.4)",
              }}
            >
              {nhanKhung(e)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
