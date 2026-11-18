"use client";

import React, { useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";

// Easing mềm (ease-out-quart) dùng chung cho mọi chuyển động của dashboard
export const EASE_MEM = [0.22, 1, 0.36, 1] as const;

/** Thuộc tính hoạt ảnh dùng cho biểu đồ Recharts; tắt khi người dùng bật "giảm chuyển động". */
export function useChartAnimation(delayMs = 250, durationMs = 1600) {
  const giamChuyenDong = useReducedMotion();
  return {
    isAnimationActive: !giamChuyenDong,
    animationBegin: delayMs,
    animationDuration: durationMs,
    animationEasing: "ease-out" as const,
  };
}

/** Khoảng cách giữa hai khối liên tiếp trong chuỗi xuất hiện (giây). */
export const BUOC_XUAT_HIEN = 0.14;
/** Sau khoảng này kể từ lúc mở trang, khối mới lọt vào màn hình (do cuộn) chỉ lệch nhẹ theo cột. */
const CUA_SO_MO_TRANG_MS = 2500;

interface RevealProps {
  children: React.ReactNode;
  /**
   * Số thứ tự trong chuỗi xuất hiện (0, 1, 2, ...): theo thứ tự đọc, hàng trên trước,
   * trong cùng hàng thì trái trước. Độ trễ = thứ tự × BUOC_XUAT_HIEN.
   */
  order?: number;
  /** Thời điểm mở trang (ms). Dùng để biết khối xuất hiện lúc mở trang hay do cuộn tới sau đó. */
  mocMo?: number;
  /** Cột trong hàng (0 trái, 1 phải) – chỉ dùng khi khối xuất hiện do cuộn. */
  cot?: number;
  /** Quãng dịch dọc ban đầu (px). */
  y?: number;
  /** Chỉ dựng nội dung khi cuộn tới (biểu đồ vẽ đúng lúc người dùng nhìn thấy). */
  lazy?: boolean;
  /** Giữ chỗ khi lazy để bố cục không bị nhảy. */
  minHeight?: number | string;
  style?: React.CSSProperties;
}

/**
 * Hiện dần (fade + translateY) một lần duy nhất, theo thứ tự đã đánh số.
 * Khối nằm trong màn hình lúc mở trang xuất hiện lần lượt theo `order`;
 * khối ở phía dưới, khi cuộn tới thì hiện ngay (chỉ lệch nhẹ theo cột).
 */
export default function Reveal({
  children,
  order = 0,
  mocMo,
  cot = 0,
  y = 28,
  lazy = false,
  minHeight,
  style,
}: RevealProps) {
  const giamChuyenDong = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const trongTamNhin = useInView(ref, { once: true, amount: 0.15 });
  const [hien, setHien] = useState(false);
  const doTre = React.useRef(0);

  React.useEffect(() => {
    if (!trongTamNhin || hien) return;
    const troiQua = mocMo === undefined ? 0 : Date.now() - mocMo;
    doTre.current =
      troiQua <= CUA_SO_MO_TRANG_MS
        ? order * BUOC_XUAT_HIEN
        : cot * 0.12;
    setHien(true);
  }, [trongTamNhin, hien, mocMo, order, cot]);

  if (giamChuyenDong) {
    return <div style={{ minHeight, ...style }}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={hien ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.9, delay: doTre.current, ease: EASE_MEM }}
      style={{ minHeight, ...style }}
    >
      {!lazy || hien ? children : null}
    </motion.div>
  );
}

/** Số đếm mượt tới giá trị đích. Giữ nguyên độ rộng (tabular-nums + minWidth) để không giật layout. */
export function SoDem({ value }: { value: string | number }) {
  const giamChuyenDong = useReducedMotion();
  const chuoi = String(value);
  const laSo = /^[\d.,]+$/.test(chuoi);
  const dich = laSo ? Number(chuoi.replace(/[.,]/g, "")) : NaN;
  const [hienThi, setHienThi] = useState<number>(giamChuyenDong || !laSo ? dich : 0);
  const truoc = React.useRef(0);

  React.useEffect(() => {
    if (!laSo || Number.isNaN(dich)) return;
    if (giamChuyenDong) {
      setHienThi(dich);
      return;
    }
    const dieuKhien = animate(truoc.current, dich, {
      duration: 1,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      onUpdate: (v) => {
        truoc.current = v;
        setHienThi(Math.round(v));
      },
    });
    return () => dieuKhien.stop();
  }, [dich, laSo, giamChuyenDong]);

  if (!laSo) return <>{chuoi}</>;
  return (
    <span
      style={{
        display: "inline-block",
        minWidth: `${chuoi.length}ch`,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {hienThi.toLocaleString("vi-VN")}
    </span>
  );
}
