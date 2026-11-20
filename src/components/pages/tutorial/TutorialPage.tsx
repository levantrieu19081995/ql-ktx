"use client";

// Trang hướng dẫn sử dụng, chia 5 cụm xếp dọc, mỗi cụm chiếm một màn hình:
//   1. Bìa: logo và tên trang
//   2. Mục tiêu của hệ thống
//   3. Công nghệ và sơ đồ kết nối
//   4. Các nhóm chức năng
//   5. Timeline bên trái + khung "slide" bên phải
// Nội dung nằm trong tutorialContent.ts.
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
// Font duy nhất của trang hướng dẫn (đã kèm bộ chữ tiếng Việt, chạy được khi không có Internet)
import "@fontsource-variable/readex-pro";
import { useLocale } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  IconArrowLeft,
  IconArrowRight,
  IconArrowsExchange,
  IconBan,
  IconBuilding,
  IconCategory,
  IconChartBar,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconCurrencyDong,
  IconDeviceCctv,
  IconDoor,
  IconExternalLink,
  IconFaceId,
  IconHistory,
  IconLayoutDashboard,
  IconListDetails,
  IconMap2,
  IconPhoto,
  IconPlayerPlay,
  IconSchool,
  IconSettings,
  IconShield,
  IconShieldLock,
  IconUserCheck,
  IconUserOff,
  IconUserQuestion,
  IconUsers,
  IconVideo,
  IconX,
} from "@tabler/icons-react";
import {
  IMAGE_SIZE,
  TUTORIAL_GOAL,
  TUTORIAL_GROUPS,
  TUTORIAL_TEAM,
  TUTORIAL_TECH,
  TutorialGroup,
  TutorialIcon,
  TutorialItem,
  TutorialMark,
} from "./tutorialContent";
import { DIAGRAM_EDGES, DIAGRAM_NODES, DIAGRAM_SIZE } from "./tutorialDiagram";

const EASE = [0.22, 1, 0.36, 1] as const;

const ICONS: Record<TutorialIcon, React.ComponentType<{ size?: number; stroke?: number }>> = {
  overview: IconLayoutDashboard,
  monitor: IconDeviceCctv,
  category: IconCategory,
  statistics: IconChartBar,
  admin: IconShieldLock,
  history: IconHistory,
  stranger: IconUserQuestion,
  camera: IconVideo,
  sample: IconFaceId,
  student: IconSchool,
  debt: IconCurrencyDong,
  room: IconDoor,
  area: IconBuilding,
  banned: IconBan,
  inout: IconArrowsExchange,
  present: IconUserCheck,
  absent: IconUserOff,
  settings: IconSettings,
  users: IconUsers,
  roles: IconShield,
};

function Icon({ name, size = 18 }: { name: TutorialIcon; size?: number }) {
  const Cmp = ICONS[name];
  return <Cmp size={size} stroke={1.7} />;
}

type FlatItem = { group: TutorialGroup; item: TutorialItem };

const FLAT: FlatItem[] = TUTORIAL_GROUPS.flatMap((group) =>
  group.items.map((item) => ({ group, item })),
);

const chiSoTheoId = (id: string) => FLAT.findIndex((f) => f.item.id === id);

const indexTuHash = (hash: string) => {
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  return id ? chiSoTheoId(id) : -1;
};

const CHIEU_CAO_THANH = 190; // khoảng 5 cm trên màn hình 96 dpi

/**
 * Thanh cuộn tự vẽ: một vạch xanh mảnh, cao cố định, thay cho thanh cuộn mặc định (đã ẩn bằng CSS).
 * nguon = "trang" cho cuộn của cả trang, hoặc ref của phần tử có overflow-y: auto.
 */
function ThanhCuon({ nguon }: { nguon: "trang" | React.RefObject<HTMLElement | null> }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [st, setSt] = useState({ hien: false, top: 0, cao: CHIEU_CAO_THANH });
  const [dangKeo, setDangKeo] = useState(false);
  const keo = useRef<{ y0: number; top0: number } | null>(null);
  const trang = nguon === "trang";

  const layEl = useCallback(
    () =>
      trang
        ? document.scrollingElement
        : (nguon as React.RefObject<HTMLElement | null>).current,
    [nguon, trang],
  );

  const capNhat = useCallback(() => {
    const el = layEl();
    const track = trackRef.current;
    if (!el || !track) return;
    const khung = trang ? window.innerHeight : el.clientHeight;
    const may = el.scrollHeight - khung;
    if (may <= 1) {
      setSt((x) => (x.hien ? { ...x, hien: false } : x));
      return;
    }
    const dai = track.clientHeight;
    const cao = Math.min(CHIEU_CAO_THANH, dai * 0.7);
    const top = (el.scrollTop / may) * (dai - cao);
    setSt((x) => (x.hien && x.top === top && x.cao === cao ? x : { hien: true, top, cao }));
  }, [layEl, trang]);

  useEffect(() => {
    const el = layEl();
    if (!el) return;
    let raf = 0;
    const lenLich = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(capNhat);
    };
    const nguonSuKien: EventTarget = trang ? window : el;
    nguonSuKien.addEventListener("scroll", lenLich, { passive: true });
    window.addEventListener("resize", lenLich);
    const ro = new ResizeObserver(lenLich);
    ro.observe(trang ? document.body : el);
    let mo: MutationObserver | undefined;
    if (!trang) {
      mo = new MutationObserver(lenLich);
      mo.observe(el, { childList: true, subtree: true });
    }
    lenLich();
    return () => {
      cancelAnimationFrame(raf);
      nguonSuKien.removeEventListener("scroll", lenLich);
      window.removeEventListener("resize", lenLich);
      ro.disconnect();
      mo?.disconnect();
    };
  }, [capNhat, layEl, trang]);

  const cuonToi = (top: number) => {
    const el = layEl();
    const track = trackRef.current;
    if (!el || !track) return;
    const khung = trang ? window.innerHeight : el.clientHeight;
    const may = el.scrollHeight - khung;
    const khoang = track.clientHeight - st.cao;
    if (khoang <= 0) return;
    const t = Math.min(Math.max(top, 0), khoang);
    el.scrollTop = (t / khoang) * may;
  };

  const batDauKeo = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    keo.current = { y0: e.clientY, top0: st.top };
    setDangKeo(true);
  };
  const dangDi = (e: React.PointerEvent<HTMLDivElement>) => {
    if (keo.current) cuonToi(keo.current.top0 + (e.clientY - keo.current.y0));
  };
  const thaKeo = (e: React.PointerEvent<HTMLDivElement>) => {
    keo.current = null;
    setDangKeo(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };
  // Bấm vào đường ray thì nhảy tới vị trí đó
  const bamNen = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    cuonToi(e.clientY - rect.top - st.cao / 2);
  };

  return (
    <div
      ref={trackRef}
      className={`tut-bar${trang ? " is-page" : ""}`}
      aria-hidden="true"
      onPointerDown={bamNen}
      style={{ visibility: st.hien ? "visible" : "hidden" }}
    >
      <div
        className={`tut-bar-thumb${dangKeo ? " is-drag" : ""}`}
        style={{ height: st.cao, top: st.top }}
        onPointerDown={batDauKeo}
        onPointerMove={dangDi}
        onPointerUp={thaKeo}
        onPointerCancel={thaKeo}
      />
    </div>
  );
}

/** Video hướng dẫn nằm trong public/tutorial, mở được không cần đăng nhập. */
const VIDEO_HUONG_DAN = "/tutorial/huong-dan-ktx.mp4";

const TEN_CUM = ["Giới thiệu", "Mục tiêu", "Công nghệ", "Chức năng", "Hướng dẫn"];
// Thứ tự các cụm trên trang (trùng thứ tự TEN_CUM và mảng cumRef)
const CUM = { bia: 0, mucTieu: 1, kyThuat: 2, nhom: 3, huongDan: 4 } as const;

/** Độ dài đường đi (chỉ gồm lệnh M, H, V như trong tutorialDiagram.ts), để các điểm sáng chạy cùng tốc độ. */
function doDaiDuong(d: string): number {
  let x = 0;
  let y = 0;
  let tong = 0;
  const re = /([MHV])\s*(-?\d+(?:\.\d+)?)(?:[\s,]+(-?\d+(?:\.\d+)?))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(d))) {
    const a = parseFloat(m[2]);
    if (m[1] === "M") {
      x = a;
      y = parseFloat(m[3]);
    } else if (m[1] === "H") {
      tong += Math.abs(a - x);
      x = a;
    } else {
      tong += Math.abs(a - y);
      y = a;
    }
  }
  return tong;
}

const TOC_DO_DIEM_SANG = 85; // điểm ảnh mỗi giây

/** Sơ đồ các phần của hệ thống nối với nhau thế nào (dữ liệu ở tutorialDiagram.ts). */
function SoDoKetNoi() {
  const giamChuyenDong = useReducedMotion();
  return (
    <div className="tut-diagram">
      <svg
        viewBox={`0 0 ${DIAGRAM_SIZE.width} ${DIAGRAM_SIZE.height}`}
        role="img"
        aria-label="Sơ đồ kết nối: camera gửi hình tới dịch vụ nhận diện Python, dịch vụ này gửi kết quả cho máy chủ nghiệp vụ Java, Java đọc ghi cơ sở dữ liệu và nhận danh mục đồng bộ từ UIIS. Người dùng mở giao diện web Next.js, giao diện web gọi Java để lấy dữ liệu nghiệp vụ."
      >
        <defs>
          <marker
            id="tut-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 z" fill="#d4d4d4" />
          </marker>
        </defs>
        {DIAGRAM_EDGES.map((e) => (
          <g key={e.id}>
            <path
              d={e.d}
              className="tut-edge"
              markerEnd="url(#tut-arrow)"
              markerStart={e.both ? "url(#tut-arrow)" : undefined}
            />
            <text x={e.label.x} y={e.label.y} textAnchor={e.label.anchor ?? "middle"} className="tut-edge-label">
              {e.label.text}
            </text>
          </g>
        ))}
        {/* Điểm sáng nhỏ chạy dọc các cạnh để mô tả luồng dữ liệu (tắt khi người dùng giảm chuyển động) */}
        {!giamChuyenDong &&
          DIAGRAM_EDGES.map((e, i) => {
            const dai = Math.max(doDaiDuong(e.d), 1);
            const dur = `${(dai / TOC_DO_DIEM_SANG).toFixed(2)}s`;
            const dotLech = `${((i * 0.55) % 2).toFixed(2)}s`;
            return (
              <g key={`flow-${e.id}`} className="tut-flow" aria-hidden="true">
                <circle r={4} className="tut-flow-dot">
                  <animateMotion path={e.d} dur={dur} begin={dotLech} repeatCount="indefinite" />
                </circle>
                {e.both && (
                  <circle r={4} className="tut-flow-dot is-back">
                    <animateMotion
                      path={e.d}
                      dur={dur}
                      begin={`${((i * 0.55 + dai / TOC_DO_DIEM_SANG / 2) % 4).toFixed(2)}s`}
                      repeatCount="indefinite"
                      keyPoints="1;0"
                      keyTimes="0;1"
                      calcMode="linear"
                    />
                  </circle>
                )}
              </g>
            );
          })}
        {DIAGRAM_NODES.map((n) => (
          <g key={n.id} className="tut-node-box">
            <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={12} />
            <text x={n.x + n.w / 2} y={n.y + 28} textAnchor="middle" className="l1">
              {n.line1}
            </text>
            <text x={n.x + n.w / 2} y={n.y + 48} textAnchor="middle" className="l2">
              {n.line2}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/**
 * Ảnh chụp màn hình rộng hết chiều ngang khung. Nếu ảnh cao hơn chỗ trống thì cắt bớt phần đáy
 * (hoặc đầu) sao cho các chấm số luôn nằm trong vùng nhìn thấy.
 */
function KhungAnh({
  src,
  alt,
  marks,
  diemNhan,
  rong,
}: {
  src: string;
  alt: string;
  marks: TutorialMark[];
  diemNhan: number | null;
  rong: boolean;
}) {
  const khungRef = useRef<HTMLDivElement>(null);
  const [kt, setKt] = useState({ w: 0, vh: 0, mayTinh: true });
  useEffect(() => {
    const el = khungRef.current;
    // Đo bề ngang của cả slide (khung ảnh có thể được thu nhỏ nên không đo chính nó)
    const goc = el?.closest<HTMLElement>(".tut-slide");
    if (!el || !goc) return;
    const capNhat = () =>
      setKt((c) => {
        const mayTinh = window.matchMedia("(min-width: 861px)").matches;
        const w = goc.clientWidth;
        const vh = window.innerHeight;
        return c.w === w && c.vh === vh && c.mayTinh === mayTinh ? c : { w, vh, mayTinh };
      });
    capNhat();
    const ro = new ResizeObserver(capNhat);
    ro.observe(goc);
    window.addEventListener("resize", capNhat);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", capNhat);
    };
  }, []);

  // Chỗ trống theo chiều cao (phần còn lại của khung sau tiêu đề, nhãn, nút)
  const khaDung = Math.max(kt.vh - (rong ? 312 : 470), 220);
  const minY = marks.length ? marks.reduce((a, m) => Math.min(a, m.y), IMAGE_SIZE.height) : 0;
  const maxY = marks.length ? marks.reduce((a, m) => Math.max(a, m.y), 0) : 0;
  const dau = Math.max(0, minY - 60); // điểm bắt đầu vùng cần thấy (tính theo ảnh gốc)
  const can = Math.min(IMAGE_SIZE.height, maxY + 44) - dau; // chiều cao cần thấy để đủ các chấm số

  let tyLe = kt.w / IMAGE_SIZE.width;
  let cat = false;
  let dich = 0;
  if (kt.mayTinh && kt.w > 0 && tyLe * IMAGE_SIZE.height > khaDung) {
    cat = true;
    // Nếu cắt rồi mà vẫn không đủ chỗ cho các chấm số thì thu nhỏ ảnh lại một chút
    if (can > 0) tyLe = Math.min(tyLe, khaDung / can);
    const cuaSo = khaDung / tyLe;
    dich = Math.min(Math.max(0, maxY + 44 - cuaSo), Math.max(0, IMAGE_SIZE.height - cuaSo));
    if (cuaSo >= can) dich = Math.min(dich, dau);
  }
  const rongAnh = kt.mayTinh && kt.w > 0 ? tyLe * IMAGE_SIZE.width : undefined;

  return (
    <div
      ref={khungRef}
      className="tut-shot-frame"
      style={cat ? { height: khaDung, width: rongAnh } : undefined}
    >
      <div className="tut-shot-inner" style={cat ? { transform: `translateY(${-dich * tyLe}px)` } : undefined}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} width={IMAGE_SIZE.width} height={IMAGE_SIZE.height} draggable={false} />
        {marks.map((m, n) => (
          <span
            key={n}
            className={`tut-mark${diemNhan === n ? " is-on" : ""}`}
            style={{
              left: `${(m.x / IMAGE_SIZE.width) * 100}%`,
              top: `${(m.y / IMAGE_SIZE.height) * 100}%`,
            }}
            aria-hidden="true"
          >
            {n + 1}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function TutorialPage() {
  const locale = useLocale();
  const giamChuyenDong = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [huong, setHuong] = useState(1);
  const [moMucLuc, setMoMucLuc] = useState(false);
  const [diemNhan, setDiemNhan] = useState<number | null>(null);
  // true: khung nội dung mở rộng, danh sách bên trái thu thành bản đồ nhỏ ở góc trái màn hình
  const [moRong, setMoRong] = useState(false);
  const [moVideo, setMoVideo] = useState(false);
  const moVideoRef = useRef(false);
  moVideoRef.current = moVideo;
  // Bản đồ nhỏ khi mở rộng: nổi lên ít giây rồi tự ẩn; rê chuột hoặc bấm vào biểu tượng thì hiện lại
  const [hienBanDo, setHienBanDo] = useState(false);
  const henGio = useRef<ReturnType<typeof setTimeout> | null>(null);
  const huyHen = useCallback(() => {
    if (henGio.current) {
      clearTimeout(henGio.current);
      henGio.current = null;
    }
  }, []);
  const henAn = useCallback(() => {
    huyHen();
    henGio.current = setTimeout(() => setHienBanDo(false), 4000);
  }, [huyHen]);
  const hienBanDoLai = useCallback(
    (giuLai: boolean) => {
      setHienBanDo(true);
      if (giuLai) huyHen();
      else henAn();
    },
    [henAn, huyHen],
  );
  useEffect(() => {
    if (moRong) {
      setHienBanDo(true);
      henAn();
    } else {
      setHienBanDo(false);
      huyHen();
    }
    return huyHen;
  }, [moRong, henAn, huyHen]);
  const [cumHienTai, setCumHienTai] = useState(0);

  const cumRef = [
    useRef<HTMLElement>(null),
    useRef<HTMLElement>(null),
    useRef<HTMLElement>(null),
    useRef<HTMLElement>(null),
    useRef<HTMLElement>(null),
  ];
  const khungRef = useRef<HTMLElement>(null);
  const cuonRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const daMoTrang = useRef(false);

  const hienTai = FLAT[index];
  const tong = FLAT.length;

  const denCum = useCallback(
    (n: number) => {
      cumRef[n].current?.scrollIntoView({
        block: "start",
        behavior: giamChuyenDong ? "auto" : "smooth",
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [giamChuyenDong],
  );

  const chon = useCallback(
    (i: number, opts?: { denCum3?: boolean }) => {
      if (i < 0 || i >= tong) return;
      if (i !== index) {
        setHuong(i > index ? 1 : -1);
        setIndex(i);
        try {
          window.history.replaceState(null, "", `#${FLAT[i].item.id}`);
        } catch {}
      }
      setMoMucLuc(false);
      if (opts?.denCum3) denCum(CUM.huongDan);
    },
    [denCum, index, tong],
  );

  // Mở thẳng một mục qua đường dẫn dạng /tutorial#camera
  useEffect(() => {
    const doc = (cuon: boolean) => {
      const i = indexTuHash(window.location.hash);
      if (i < 0) return;
      setIndex(i);
      if (cuon) requestAnimationFrame(() => denCum(CUM.huongDan));
    };
    doc(true);
    const onHash = () => doc(true);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cụm nào đang nằm trong màn hình
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const n = cumRef.findIndex((r) => r.current === e.target);
            if (n >= 0) setCumHienTai(n);
          }
        });
      },
      { threshold: 0.55 },
    );
    cumRef.forEach((r) => r.current && obs.observe(r.current));
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Đổi mục thì đưa khung nội dung về đầu
  useEffect(() => {
    if (!daMoTrang.current) {
      daMoTrang.current = true;
      return;
    }
    const el = khungRef.current;
    if (!el) return;
    if (cuonRef.current) cuonRef.current.scrollTop = 0;
    if (el.getBoundingClientRect().top < 0) {
      el.scrollIntoView({ block: "start", behavior: giamChuyenDong ? "auto" : "smooth" });
    }
  }, [hienTai.item.id, giamChuyenDong]);

  // Esc đóng cửa sổ video
  useEffect(() => {
    if (!moVideo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoVideo(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moVideo]);

  // Máy tính: mỗi lần lăn chuột chuyển đúng một trang (cụm). Vùng có thanh cuộn riêng
  // (danh sách, khung nội dung) vẫn cuộn bình thường cho tới khi hết rồi mới sang trang.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 861px)");
    let khoaDen = 0;
    const trangHienTai = () => {
      let tot = 0;
      let kc = Infinity;
      cumRef.forEach((r, i) => {
        const top = r.current?.getBoundingClientRect().top;
        if (top === undefined) return;
        const d = Math.abs(top);
        if (d < kc) {
          kc = d;
          tot = i;
        }
      });
      return tot;
    };
    const conCuonDuoc = (goc: EventTarget | null, dy: number) => {
      let el = goc instanceof HTMLElement ? goc : null;
      while (el && el !== document.body) {
        const oy = getComputedStyle(el).overflowY;
        if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 1) {
          if (dy > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
          if (dy < 0 && el.scrollTop > 0) return true;
        }
        el = el.parentElement;
      }
      return false;
    };
    const onWheel = (e: WheelEvent) => {
      if (moVideoRef.current) { e.preventDefault(); return; }
      if (!mq.matches || e.ctrlKey || Math.abs(e.deltaY) < 4 || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (conCuonDuoc(e.target, e.deltaY)) return;
      e.preventDefault();
      const now = Date.now();
      if (now < khoaDen) return;
      const hien = trangHienTai();
      const dich = hien + (e.deltaY > 0 ? 1 : -1);
      if (dich < 0 || dich >= cumRef.length) return;
      khoaDen = now + 900;
      denCum(dich);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [denCum]);

  // Phím mũi tên trái / phải chuyển mục khi đang ở cụm hướng dẫn
  useEffect(() => {
    if (cumHienTai !== CUM.huongDan) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "ArrowRight") chon(index + 1);
      if (e.key === "ArrowLeft") chon(index - 1);
      if (e.key === "Escape") setMoRong(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chon, cumHienTai, index]);

  const chiSoDauNhom = useMemo(() => {
    const map: Record<string, number> = {};
    FLAT.forEach((f, i) => {
      if (map[f.group.id] === undefined) map[f.group.id] = i;
    });
    return map;
  }, []);

  const { group, item } = hienTai;
  const duongDan = item.path ? `/${locale}${item.path}` : null;

  const nutHanhDong = (trongDock: boolean) =>
    duongDan || item.image ? (
      <div className="tut-actions">
          {duongDan && (
            <a
              className="tut-open"
              href={duongDan}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Mở trang này"
              title="Mở trang này"
            >
              <span className="tut-open-label">Mở trang này</span>
              <IconExternalLink size={16} />
            </a>
          )}
          {item.image && !trongDock && (
            <a
              className="tut-open is-ghost"
              href={item.image}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Xem hình ảnh"
              title="Xem hình ảnh"
            >
              <span className="tut-open-label">Xem hình ảnh</span>
              <IconPhoto size={16} />
            </a>
          )}
          <button
            type="button"
            className="tut-open is-ghost tut-expand"
            onClick={() => setMoRong((v) => !v)}
            aria-pressed={moRong}
            aria-label={moRong ? "Thu nhỏ khung nội dung" : "Mở rộng khung nội dung"}
            title={moRong ? "Thu nhỏ (Esc)" : "Mở rộng"}
          >
            {moRong ? (
              <>
                <IconChevronRight size={18} />
                <IconChevronLeft size={18} />
              </>
            ) : (
              <>
                <IconChevronLeft size={18} />
                <IconChevronRight size={18} />
              </>
            )}
          </button>
        </div>
    ) : null;

  const slide = giamChuyenDong
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.01 },
      }
    : {
        initial: { opacity: 0, x: 28 * huong },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -28 * huong },
        transition: { duration: 0.28, ease: EASE },
      };

  return (
    <div className="tut-root">

      {/* Điều hướng nhanh giữa 3 cụm */}
      <nav className="tut-side" aria-label="Các phần của trang">
        {TEN_CUM.map((ten, n) => (
          <button
            key={ten}
            type="button"
            className={`tut-side-btn${cumHienTai === n ? " is-active" : ""}`}
            onClick={() => denCum(n)}
            aria-label={ten}
            aria-current={cumHienTai === n ? "true" : undefined}
          >
            <span className="tut-side-tip">{ten}</span>
          </button>
        ))}
      </nav>

      {/* ───────── Cụm 1: Bìa ───────── */}
      <section ref={cumRef[CUM.bia]} className="tut-screen tut-s0" aria-label="Giới thiệu">
        <div className="tut-s0-body">
        <header className="tut-top">
          <Image
            src="/images/logo.png"
            alt="Đại học Cần Thơ"
            width={192}
            height={192}
            className="tut-logo"
          />
          <div>
            <p className="tut-eyebrow">Quản lý ký túc xá</p>
            <h1 className="tut-title">Hướng dẫn sử dụng hệ thống</h1>
            <button type="button" className="tut-video-btn" onClick={() => setMoVideo(true)}>
              <IconPlayerPlay size={20} />
              Xem video hướng dẫn
            </button>
          </div>
        </header>
        </div>
        <button type="button" className="tut-next" onClick={() => denCum(CUM.mucTieu)}>
          Xem mục tiêu
          <IconChevronDown size={18} />
        </button>

        <aside className="tut-team" aria-label={TUTORIAL_TEAM.title}>
          <p className="tut-team-title">{TUTORIAL_TEAM.title}</p>
          {TUTORIAL_TEAM.groups.map((g) => (
            <div key={g.name} className="tut-team-group">
              <p className="tut-team-name">{g.name}</p>
              <ul>
                {g.members.map((m) => (
                  <li key={m.name}>
                    <span>{m.name}</span>
                    <span className="tut-team-role">{m.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>
      </section>

      {/* ───────── Cụm 2: Mục tiêu ───────── */}
      <section ref={cumRef[CUM.mucTieu]} className="tut-screen tut-s1" aria-labelledby="tut-goal-title">
        <div className="tut-s1-body">
          <h2 id="tut-goal-title" className="tut-hero-title">
            {TUTORIAL_GOAL.title}
          </h2>
          <p className="tut-hero-lead">{TUTORIAL_GOAL.lead}</p>
          <ul className="tut-goal-grid">
            {TUTORIAL_GOAL.points.map((p, n) => (
              <li key={p} className="tut-card tut-goal-card">
                <span className="tut-goal-no">{String(n + 1).padStart(2, "0")}</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <button type="button" className="tut-next" onClick={() => denCum(CUM.kyThuat)}>
          Xem công nghệ
          <IconChevronDown size={18} />
        </button>
      </section>

      {/* ───────── Cụm 3: Công nghệ và sơ đồ kết nối ───────── */}
      <section
        ref={cumRef[CUM.kyThuat]}
        className="tut-screen tut-tech"
        aria-labelledby="tut-tech-title"
      >
        <div className="tut-tech-body">
          <h2 id="tut-tech-title" className="tut-hero-title">
            {TUTORIAL_TECH.title}
          </h2>
          <p className="tut-hero-lead">{TUTORIAL_TECH.lead}</p>

          <div className="tut-stack-grid">
            {TUTORIAL_TECH.stacks.map((st) => (
              <article key={st.id} className="tut-card tut-stack">
                <div className="tut-stack-head">
                  <h3 className="tut-stack-name">{st.name}</h3>
                  <ul className="tut-chips">
                    {st.tech.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
                <p className="tut-stack-label">Dùng để</p>
                <p className="tut-stack-purpose">{st.purpose}</p>
              </article>
            ))}
          </div>

          <SoDoKetNoi />
        </div>

        <button type="button" className="tut-next" onClick={() => denCum(CUM.nhom)}>
          Xem các chức năng
          <IconChevronDown size={18} />
        </button>
      </section>

      {/* ───────── Cụm 4: Các nhóm chức năng ───────── */}
      <section ref={cumRef[CUM.nhom]} className="tut-screen tut-s2" aria-labelledby="tut-func-title">
        <div className="tut-s2-body">
          <h2 id="tut-func-title" className="tut-hero-title">
            Các nhóm chức năng
          </h2>
          <p className="tut-hero-lead">
            Hệ thống có {TUTORIAL_GROUPS.length} nhóm với {tong} chức năng.
          </p>

          <div className="tut-groups">
            {TUTORIAL_GROUPS.map((g) => {
              const dangChon = g.id === group.id;
              return (
                <article key={g.id} className={`tut-card tut-gcard${dangChon ? " is-active" : ""}`}>
                  <button
                    type="button"
                    className="tut-gcard-head"
                    onClick={() => chon(chiSoDauNhom[g.id], { denCum3: true })}
                  >
                    <span className="tut-group-icon">
                      <Icon name={g.icon} size={24} />
                    </span>
                    <span className="tut-group-name">{g.title}</span>
                    <span className="tut-group-count">{g.items.length} mục</span>
                  </button>
                  <p className="tut-group-sum">{g.summary}</p>
                  <ul className="tut-gcard-list">
                    {g.items.map((it) => (
                      <li key={it.id} className="tut-gcard-item">
                        <span className="tut-dot" aria-hidden="true" />
                        <span>{it.title}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>

        <button type="button" className="tut-next" onClick={() => denCum(CUM.huongDan)}>
          Bắt đầu xem hướng dẫn
          <IconChevronDown size={18} />
        </button>
      </section>

      {/* ───────── Cụm 5: Timeline + slide ───────── */}
      <section ref={cumRef[CUM.huongDan]} className={`tut-screen tut-s3${moRong ? " has-dock" : ""}`} aria-label="Hướng dẫn từng chức năng">
        <div className={`tut-main${moRong ? " is-wide" : ""}`}>
          <aside className="tut-rail tut-card" data-open={moMucLuc} inert={moRong}>
            <div ref={railRef} className="tut-scroll tut-rail-in">
            <button
              type="button"
              className="tut-rail-toggle"
              onClick={() => setMoMucLuc((v) => !v)}
              aria-expanded={moMucLuc}
            >
              <IconListDetails size={18} />
              <span>
                {index + 1}/{tong} · {item.title}
              </span>
              <IconChevronDown size={18} className="tut-rail-chevron" />
            </button>

            <nav aria-label="Danh sách chức năng" className="tut-tree">
              {TUTORIAL_GROUPS.map((g) => (
                <div key={g.id} className="tut-tree-group">
                  <button
                    type="button"
                    className={`tut-tree-head${g.id === group.id ? " is-active" : ""}`}
                    onClick={() => chon(chiSoDauNhom[g.id])}
                  >
                    <Icon name={g.icon} size={16} />
                    <span>{g.title}</span>
                  </button>
                  <ol className="tut-tree-list">
                    {g.items.map((it) => {
                      const i = chiSoTheoId(it.id);
                      const dangChon = i === index;
                      return (
                        <li key={it.id}>
                          <button
                            type="button"
                            className={`tut-node${dangChon ? " is-active" : ""}`}
                            aria-current={dangChon ? "step" : undefined}
                            onClick={() => chon(i)}
                          >
                            <span className="tut-dot" aria-hidden="true" />
                            <span>{it.title}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              ))}
            </nav>
            </div>
            <ThanhCuon nguon={railRef} />
          </aside>

          <section ref={khungRef} className="tut-panel tut-card" aria-live="polite">
            <div ref={cuonRef} className="tut-scroll tut-panel-in">
            <AnimatePresence mode="wait" initial={false}>
              <motion.article key={item.id} {...slide} className={`tut-slide${moRong ? " is-wide" : ""}`}>
                <p className="tut-crumb">
                  <Icon name={group.icon} size={15} />
                  {group.title}
                </p>
                <div className="tut-slide-head">
                  <span className="tut-slide-icon">
                    <Icon name={item.icon} size={26} />
                  </span>
                  <h2 className="tut-slide-title">{item.title}</h2>
                </div>
                <p className="tut-summary">{item.tagline ?? item.summary}</p>

                {item.image && (
                  <figure className="tut-shot">
                    <KhungAnh
                      src={item.image}
                      alt={`Màn hình ${item.title}`}
                      marks={item.marks ?? []}
                      diemNhan={diemNhan}
                      rong={moRong}
                    />
                    {item.marks && item.marks.length > 0 && (
                      <ol className="tut-legend">
                        {item.marks.map((m, n) => (
                          <li
                            key={n}
                            onMouseEnter={() => setDiemNhan(n)}
                            onMouseLeave={() => setDiemNhan(null)}
                          >
                            <span className="tut-legend-no">{n + 1}</span>
                            {m.label}
                          </li>
                        ))}
                      </ol>
                    )}
                  </figure>
                )}

                <details key={`ct-${item.id}`} className="tut-more">
                  <summary>Chi tiết cách dùng</summary>
                  {item.menu && (
                    <p className="tut-menu">
                      <span>Vị trí trong menu</span>
                      {item.menu}
                    </p>
                  )}
                  <p className="tut-more-sum">{item.summary}</p>
                  <ol className="tut-steps">
                    {item.steps.map((s, n) => (
                      <li key={n} className="tut-step">
                        <span className="tut-step-no">{n + 1}</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                  {item.notes && item.notes.length > 0 && (
                    <div className="tut-notes">
                      <p className="tut-notes-title">Lưu ý</p>
                      <ul>
                        {item.notes.map((n) => (
                          <li key={n}>{n}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </details>

                {!moRong && nutHanhDong(false)}
              </motion.article>
            </AnimatePresence>
            </div>
            <ThanhCuon nguon={cuonRef} />
          </section>
        </div>

        {moRong ? (
          /* Cột điều khiển bên phải khi mở rộng: chuyển mục (dọc), nút biểu tượng, bản đồ nhỏ */
          cumHienTai === CUM.huongDan && (
            <>
            <motion.div
              className="tut-vbar"
              initial={giamChuyenDong ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: giamChuyenDong ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="tut-dock-nav" role="group" aria-label="Chuyển mục">
                  <button
                    type="button"
                    className="tut-dock-step"
                    onClick={() => chon(index - 1)}
                    disabled={index === 0}
                    aria-label="Chức năng trước"
                    title="Trước"
                  >
                    <IconChevronLeft size={20} />
                  </button>
                  <span className="tut-dock-count" aria-label={`Mục ${index + 1} trên ${tong}`}>
                    {index + 1}/{tong}
                  </span>
                  <button
                    type="button"
                    className="tut-dock-step"
                    onClick={() => chon(index + 1)}
                    disabled={index === tong - 1}
                    aria-label="Chức năng sau"
                    title="Sau"
                  >
                    <IconChevronRight size={20} />
                  </button>
                </div>
                {nutHanhDong(true)}
                <button
                  type="button"
                  className="tut-open is-ghost tut-mapbtn"
                  aria-label="Bản đồ các chức năng"
                  aria-expanded={hienBanDo}
                  title="Bản đồ"
                  onPointerEnter={() => hienBanDoLai(true)}
                  onPointerLeave={henAn}
                  onClick={() => hienBanDoLai(false)}
                >
                  <IconMap2 size={20} />
                </button>
            </motion.div>
            <AnimatePresence>
            {hienBanDo && (
            <motion.div
              key="dock"
              className="tut-dock"
              style={{ transformOrigin: "bottom right" }}
              onPointerEnter={huyHen}
              onPointerLeave={henAn}
              onFocus={huyHen}
              onBlur={henAn}
              initial={giamChuyenDong ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={giamChuyenDong ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
              transition={{ duration: giamChuyenDong ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <nav className="tut-mini" aria-label="Bản đồ các chức năng">
                <button
                  type="button"
                  className="tut-mini-head"
                  onClick={() => setMoRong(false)}
                  title="Mở lại danh sách"
                >
                  <IconListDetails size={16} />
                  <span>
                    {index + 1}/{tong} · {item.title}
                  </span>
                </button>
                {TUTORIAL_GROUPS.map((g) => (
                  <div key={g.id} className="tut-mini-row">
                    <span className={`tut-mini-ico${g.id === group.id ? " is-active" : ""}`} title={g.title}>
                      <Icon name={g.icon} size={15} />
                    </span>
                    <span className="tut-mini-dots">
                      {g.items.map((it) => {
                        const i = chiSoTheoId(it.id);
                        return (
                          <button
                            key={it.id}
                            type="button"
                            className={`tut-mini-dot${i === index ? " is-active" : ""}`}
                            title={it.title}
                            aria-label={it.title}
                            aria-current={i === index ? "step" : undefined}
                            onClick={() => chon(i)}
                          />
                        );
                      })}
                    </span>
                  </div>
                ))}
              </nav>
            </motion.div>
            )}
            </AnimatePresence>
            </>
          )
        ) : (
          <div className="tut-pill" role="group" aria-label="Chuyển mục">
            <button
              type="button"
              className="tut-pill-btn"
              onClick={() => chon(index - 1)}
              disabled={index === 0}
            >
              <IconArrowLeft size={16} />
              Trước
            </button>
            <div className="tut-progress" aria-label={`Mục ${index + 1} trên ${tong}`}>
              <span className="tut-count">
                {index + 1} / {tong}
              </span>
              <span className="tut-dots" aria-hidden="true">
                {FLAT.map((f, i) => (
                  <span key={f.item.id} className={`tut-pip${i === index ? " is-active" : ""}`} />
                ))}
              </span>
            </div>
            <button
              type="button"
              className="tut-pill-btn is-primary"
              onClick={() => chon(index + 1)}
              disabled={index === tong - 1}
            >
              Sau
              <IconArrowRight size={16} />
            </button>
          </div>
        )}
      </section>

      {moVideo && (
        <div className="tut-vid" role="dialog" aria-modal="true" aria-label="Video hướng dẫn" onClick={() => setMoVideo(false)}>
          <div className="tut-vid-box" onClick={(e) => e.stopPropagation()}>
            <div className="tut-vid-bar">
              <span>Video hướng dẫn sử dụng hệ thống</span>
              <a href={VIDEO_HUONG_DAN} target="_blank" rel="noopener noreferrer">
                Mở ở tab mới
              </a>
              <button type="button" onClick={() => setMoVideo(false)} aria-label="Đóng video" title="Đóng (Esc)">
                <IconX size={20} />
              </button>
            </div>
            <video src={VIDEO_HUONG_DAN} controls autoPlay playsInline preload="metadata" />
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </div>
  );
}

const CSS = `
.tut-root {
  --tut-text: #f2f2f2;
  --tut-dim: #a3a3a3;
  --tut-accent: #00afef;
  --tut-surface: #0f0f0f;
  --tut-surface-2: #181818;
  --tut-line: #2a2a2a;
  --tut-line-strong: #454545;
  --tut-font: "Readex Pro Variable", "Inter Variable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  font-family: var(--tut-font);
  position: relative;
  color: var(--tut-text);
  background: #000;
  color-scheme: dark;
}
html:has(.tut-root), body:has(.tut-root) { background: #000; }
/* Một font duy nhất cho mọi chữ trong trang (kể cả nút, ô tóm tắt và chữ trong sơ đồ) */
.tut-root, .tut-root * { font-family: var(--tut-font); }

/* Khối nội dung: màu phẳng, viền mảnh, không bóng, không mờ */
.tut-card {
  background: var(--tut-surface);
  border: 1px solid var(--tut-line);
  border-radius: 10px;
}

/* Mỗi cụm là một màn hình */
.tut-screen {
  position: relative;
  width: 100%; max-width: 1400px; margin: 0 auto;
  min-height: 100dvh; padding: 28px 56px 28px;
  display: flex; flex-direction: column;
  scroll-snap-align: start;
}
html:has(.tut-root) { scroll-snap-type: y proximity; scroll-behavior: auto; }

.tut-top { display: flex; align-items: center; gap: 28px; }
.tut-video-btn {
  appearance: none; font: inherit; cursor: pointer; margin-top: 22px; min-height: 48px; padding: 0 22px;
  display: inline-flex; align-items: center; gap: 10px; border-radius: 8px;
  font-size: 16px; font-weight: 600; color: #000; background: var(--tut-accent); border: 1px solid var(--tut-accent);
}
.tut-video-btn:hover { background: #33c1f5; border-color: #33c1f5; }
.tut-vid {
  position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 20px;
  background: rgba(0, 0, 0, 0.9);
}
.tut-vid-box {
  width: min(1200px, 100%); border-radius: 10px; overflow: hidden;
  background: var(--tut-surface); border: 1px solid var(--tut-line-strong);
}
.tut-vid-bar { display: flex; align-items: center; gap: 16px; padding: 10px 14px; font-size: 15px; font-weight: 600; }
.tut-vid-bar span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tut-vid-bar a { font-size: 14px; color: var(--tut-accent); text-decoration: none; white-space: nowrap; }
.tut-vid-bar a:hover { text-decoration: underline; }
.tut-vid-bar button {
  appearance: none; cursor: pointer; width: 36px; height: 36px; display: grid; place-items: center;
  color: var(--tut-text); background: transparent; border: 1px solid var(--tut-line-strong); border-radius: 8px;
}
.tut-vid-bar button:hover { background: var(--tut-surface-2); }
.tut-vid video { display: block; width: 100%; max-height: calc(100dvh - 120px); background: #000; }
.tut-team {
  position: absolute; bottom: 24px; right: calc(24px - max(0px, (100vw - 1400px) / 2));
  width: 320px; padding: 14px 18px 16px; border-radius: 10px;
  background: var(--tut-surface); border: 1px solid var(--tut-line);
}
.tut-team-title { margin: 0 0 10px; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--tut-dim); }
.tut-team-group + .tut-team-group { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--tut-line); }
.tut-team-name { margin: 0 0 6px; font-size: 13px; font-weight: 700; color: var(--tut-accent); }
.tut-team ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
.tut-team li { display: flex; justify-content: space-between; gap: 12px; font-size: 14px; line-height: 1.45; }
.tut-team li > span:first-child { font-weight: 600; }
.tut-team-role { color: var(--tut-dim); text-align: right; }
.tut-s0-body { flex: 1; display: flex; align-items: center; justify-content: center; padding: 24px 0; }
.tut-logo { flex: none; width: 192px; height: 192px; border-radius: 50%; background: #fff; padding: 6px; }
.tut-eyebrow { margin: 0; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--tut-dim); }
.tut-title { margin: 6px 0 0; font-size: 44px; font-weight: 700; line-height: 1.15; }

.tut-s1-body, .tut-s2-body { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 24px 0; }
.tut-hero-title { margin: 0; font-size: 42px; font-weight: 700; line-height: 1.15; }
.tut-hero-lead { margin: 16px 0 0; max-width: 68ch; font-size: 19px; line-height: 1.65; color: var(--tut-dim); }

/* Cụm công nghệ */
.tut-tech { max-width: 1700px; padding-top: 14px; }
.tut-tech-body { flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: flex-start; padding: 0; }
.tut-tech .tut-hero-title { font-size: 34px; }
.tut-tech .tut-hero-lead { margin-top: 10px; font-size: 16px; }
.tut-stack-grid { margin-top: 22px; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.tut-stack { padding: 18px 18px 20px; display: flex; flex-direction: column; min-width: 0; }
.tut-stack-name { margin: 0; font-size: 18px; font-weight: 700; line-height: 1.25; }
.tut-stack-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-height: 50px; margin-bottom: 8px; }
.tut-chips { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px; flex: none; }
.tut-chips li { padding: 3px 8px; border: 1px solid var(--tut-line-strong); border-radius: 6px; font-size: 12px; font-weight: 600; color: var(--tut-accent); }
.tut-stack-label { margin: 0 0 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--tut-dim); }
.tut-stack-purpose { margin: 0; font-size: 14px; line-height: 1.55; }
.tut-diagram { flex: 1; min-height: 340px; margin-top: 14px; display: flex; overflow-x: auto; scrollbar-width: thin; scrollbar-color: var(--tut-accent) transparent; }
.tut-diagram svg { display: block; width: 100%; height: 100%; min-width: 900px; margin: 0 auto; }
.tut-node-box rect { fill: #16254a; stroke: #2a437a; stroke-width: 1; }
.tut-node-box text { font-family: inherit; }
.tut-node-box .l1 { fill: #a9d0ff; font-size: 15px; font-weight: 700; }
.tut-node-box .l2 { fill: #8fb4e6; font-size: 13px; }
.tut-edge { fill: none; stroke: #d4d4d4; stroke-width: 1.3; }
.tut-flow-dot { fill: #00afef; }
.tut-flow-dot.is-back { fill: #f5b800; }
.tut-edge-label { fill: #a3a3a3; font-family: inherit; font-size: 12px; }

.tut-goal-grid { list-style: none; margin: 40px 0 0; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.tut-goal-card { padding: 22px 22px 24px; display: flex; flex-direction: column; gap: 14px; font-size: 16px; line-height: 1.55; }
.tut-goal-no { font-size: 28px; font-weight: 700; line-height: 1; color: var(--tut-accent); }

.tut-next {
  appearance: none; font: inherit; cursor: pointer; align-self: center; flex: none; margin-top: 20px;
  min-height: 44px; padding: 0 20px; display: inline-flex; align-items: center; gap: 8px;
  border-radius: 8px; font-size: 14px; font-weight: 600; color: var(--tut-text);
  background: transparent; border: 1px solid var(--tut-line-strong);
}
.tut-next:hover { background: var(--tut-surface-2); border-color: var(--tut-dim); }

.tut-groups { margin-top: 34px; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 16px; align-items: stretch; }
.tut-gcard { padding: 18px 16px 14px; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.tut-gcard-head {
  appearance: none; font: inherit; color: inherit; background: none; border: 0; cursor: pointer;
  text-align: left; padding: 0; display: flex; flex-direction: column; gap: 4px;
}
.tut-group-icon {
  width: 44px; height: 44px; border-radius: 8px; display: grid; place-items: center;
  background: var(--tut-accent); border: 1px solid var(--tut-accent); color: #000; margin-bottom: 8px;
}
.tut-group-name { font-size: 18px; font-weight: 700; }
.tut-group-count { font-size: 12.5px; color: var(--tut-accent); font-weight: 600; }
.tut-group-sum { margin: 2px 0 8px; font-size: 13.5px; line-height: 1.5; color: var(--tut-dim); }
.tut-gcard-list { list-style: none; margin: 0; padding: 8px 0 0; border-top: 1px solid var(--tut-line); display: grid; gap: 2px; }
.tut-gcard-item {
  color: var(--tut-text); width: 100%; min-height: 36px; padding: 4px 6px; display: flex; align-items: center; gap: 10px;
  text-align: left; font-size: 13.5px; line-height: 1.35; border-radius: 6px;
}

/* Màn hình máy tính: nội dung sát mép trên, chữ và thẻ lớn dần cho vừa hết chiều cao màn hình */
@media (min-width: 861px) {
  .tut-s1, .tut-s2, .tut-s3 { max-width: 1700px; padding-top: 14px; }
  .tut-s1-body, .tut-s2-body { justify-content: flex-start; min-height: 0; padding: 0; }
  .tut-s1 .tut-hero-title, .tut-s2 .tut-hero-title { font-size: 44px; }
  .tut-s1 .tut-hero-lead, .tut-s2 .tut-hero-lead { max-width: none; font-size: 22px; }
  .tut-goal-grid {
    flex: 1; min-height: 0; margin: 24px 0 0; grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-rows: minmax(0, 1fr); gap: 20px;
  }
  .tut-goal-card { padding: 28px 36px; justify-content: center; gap: 16px; font-size: 26px; line-height: 1.45; }
  .tut-goal-no { font-size: 56px; }
  .tut-groups { flex: 1; min-height: 0; margin-top: 24px; gap: 18px; }
  .tut-gcard { padding: 24px 22px 18px; gap: 8px; }
  .tut-group-icon { width: 56px; height: 56px; margin-bottom: 12px; }
  .tut-group-name { font-size: 24px; }
  .tut-group-count { font-size: 14px; }
  .tut-group-sum { margin: 4px 0 12px; font-size: 16px; }
  .tut-gcard-list { padding-top: 12px; gap: 4px; }
  .tut-gcard-item { min-height: 48px; font-size: 17px; line-height: 1.35; }
}

/* Cụm 3 */
.tut-s3 { height: 100dvh; padding-top: 24px; padding-bottom: 20px; }
.tut-main { flex: 1; min-height: 0; display: grid; grid-template-columns: 330px minmax(0, 1fr); gap: 20px; }
.tut-rail { position: relative; display: flex; overflow: hidden; min-height: 0; }
.tut-rail-in { flex: 1; min-width: 0; min-height: 0; overflow-y: auto; padding: 14px; }
.tut-rail-toggle { display: none; }
.tut-tree { display: flex; flex-direction: column; gap: 14px; }
.tut-tree-head {
  appearance: none; font: inherit; color: var(--tut-dim); background: none; border: 0; cursor: pointer;
  display: flex; align-items: center; gap: 8px; padding: 4px 6px; font-size: 12px;
  font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; border-radius: 6px;
}
.tut-tree-head:hover { color: var(--tut-text); }
.tut-tree-head.is-active { color: var(--tut-accent); }
.tut-tree-list { list-style: none; margin: 4px 0 0 13px; padding: 0; border-left: 1px solid var(--tut-line-strong); }
.tut-node {
  appearance: none; font: inherit; color: var(--tut-text); background: none; border: 0; cursor: pointer;
  width: 100%; min-height: 40px; display: flex; align-items: center; gap: 12px;
  padding: 6px 10px 6px 0; margin-left: -7px; text-align: left; font-size: 14px; line-height: 1.35;
  border-radius: 6px;
}
.tut-node:hover { background: var(--tut-surface-2); }
.tut-dot {
  flex: none; width: 12px; height: 12px; border-radius: 50%;
  background: #000; border: 2px solid var(--tut-line-strong);
}
.tut-gcard-item .tut-dot { width: 9px; height: 9px; border-width: 2px; }
.tut-node.is-active { background: var(--tut-surface-2); font-weight: 600; }
.tut-node.is-active .tut-dot { background: var(--tut-accent); border-color: var(--tut-accent); }

.tut-panel { position: relative; display: flex; overflow: hidden; min-height: 0; scroll-margin-top: 16px; }
.tut-panel-in { flex: 1; min-width: 0; min-height: 0; overflow-x: hidden; overflow-y: auto; padding: 24px 36px 24px; }
.tut-crumb {
  margin: 0 0 14px; display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--tut-accent);
}
.tut-slide-head { display: flex; align-items: center; gap: 14px; }
.tut-slide-icon {
  flex: none; width: 48px; height: 48px; border-radius: 8px; display: grid; place-items: center;
  background: var(--tut-accent); color: #000;
}
.tut-slide-title { margin: 0; font-size: 28px; font-weight: 700; line-height: 1.2; }
.tut-summary { margin: 14px 0 0; max-width: 70ch; font-size: 16px; line-height: 1.6; color: var(--tut-dim); }
/* Ảnh chụp màn hình + chấm số */
.tut-shot { margin: 18px 0 0; }
.tut-shot-frame {
  position: relative; width: 100%;
  border-radius: 8px; overflow: hidden; border: 1px solid var(--tut-line-strong); background: #fff;
}
.tut-shot-inner { position: relative; }
.tut-shot-frame img { display: block; width: 100%; height: auto; }
.tut-mark {
  position: absolute; width: 32px; height: 32px; margin: -16px 0 0 -16px; border-radius: 50%;
  display: grid; place-items: center; font-size: 22px; font-weight: 800; line-height: 1;
  color: #ff7a00; background: none; border: 2px solid transparent;
  text-shadow: 0 0 3px #fff, 0 0 3px #fff, 0 0 2px #fff;
}
/* Chỉ khi rê chuột vào nhãn bên dưới thì mới hiện vòng cam quanh số */
.tut-mark.is-on { border-color: #ff7a00; }
.tut-legend { list-style: none; margin: 12px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.tut-legend li {
  display: inline-flex; align-items: center; gap: 8px; padding: 5px 12px 5px 6px;
  border-radius: 999px; font-size: 14px; font-weight: 600;
  background: var(--tut-surface-2); border: 1px solid var(--tut-line);
}
.tut-legend li:hover { border-color: #ff7a00; }
.tut-legend-no {
  width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center;
  font-size: 12px; font-weight: 800; background: #ff7a00; color: #000;
}
.tut-more { margin-top: 16px; }
.tut-more > summary {
  display: inline-flex; align-items: center; min-height: 36px; padding: 0 4px; cursor: pointer;
  font-size: 14px; font-weight: 600; color: var(--tut-accent); list-style: none;
}
.tut-more > summary::-webkit-details-marker { display: none; }
.tut-more > summary::before { content: "+"; display: inline-block; width: 18px; font-weight: 700; }
.tut-more[open] > summary::before { content: "−"; }
.tut-more-sum { margin: 10px 0 0; max-width: 70ch; font-size: 15px; line-height: 1.6; color: var(--tut-dim); }
.tut-menu {
  margin: 14px 0 0; display: inline-flex; flex-wrap: wrap; gap: 8px; align-items: center;
  padding: 6px 12px; border-radius: 6px; font-size: 13px; line-height: 1.4;
  background: var(--tut-surface-2); border: 1px solid var(--tut-line);
}
.tut-menu span { color: var(--tut-dim); }
.tut-steps { list-style: none; margin: 22px 0 0; padding: 0; display: grid; gap: 8px; }
.tut-step {
  display: flex; gap: 14px; align-items: flex-start; padding: 14px 16px;
  border-radius: 8px; font-size: 15px; line-height: 1.55;
  background: var(--tut-surface-2); border: 1px solid var(--tut-line);
}
.tut-step-no {
  flex: none; width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center;
  font-size: 13px; font-weight: 700; background: var(--tut-accent); color: #000;
}
.tut-notes {
  margin-top: 18px; padding: 14px 18px; border-radius: 8px;
  background: var(--tut-surface-2); border: 1px solid var(--tut-line); border-left: 3px solid #f5b800;
}
.tut-notes-title { margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #f5b800; }
.tut-notes ul { margin: 0; padding-left: 18px; display: grid; gap: 4px; font-size: 14px; line-height: 1.55; }
.tut-actions { margin-top: 22px; display: flex; flex-wrap: wrap; gap: 12px; }
.tut-open {
  display: inline-flex; align-items: center; gap: 8px; min-height: 42px;
  padding: 0 18px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none;
  color: #000; background: var(--tut-accent); border: 1px solid var(--tut-accent);
}
.tut-expand { margin-left: auto; padding: 0 10px; gap: 0; }
.tut-expand svg + svg { margin-left: -9px; }

/* Bản đồ nhỏ góc trái + chế độ mở rộng (chỉ trên máy tính) */
.tut-mini {
  width: 100%; padding: 8px; flex: none;
  border-radius: 10px; background: var(--tut-surface); border: 1px solid var(--tut-line-strong);
}
.tut-mini-head {
  appearance: none; font: inherit; cursor: pointer; width: 100%; min-height: 32px; padding: 0 4px;
  display: flex; align-items: center; gap: 8px; text-align: left; font-size: 12px; font-weight: 600;
  color: var(--tut-text); background: none; border: 0; border-radius: 6px;
}
.tut-mini-head:hover { background: var(--tut-surface-2); }
.tut-mini-head span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tut-mini-row { display: flex; align-items: center; gap: 10px; margin-top: 5px; padding: 0 4px; }
.tut-mini-ico { flex: none; display: grid; color: var(--tut-dim); }
.tut-mini-ico.is-active { color: var(--tut-accent); }
.tut-mini-dots { display: flex; flex-wrap: wrap; gap: 6px; }
.tut-mini-dot {
  appearance: none; padding: 0; cursor: pointer; width: 15px; height: 15px; border-radius: 50%;
  background: #000; border: 2px solid var(--tut-line-strong);
}
.tut-mini-dot:hover { border-color: var(--tut-dim); }
.tut-mini-dot.is-active { background: var(--tut-accent); border-color: var(--tut-accent); }
/* Cột điều khiển bên phải khi mở rộng */
.tut-dock {
  position: fixed; z-index: 16; right: 68px; bottom: 24px; width: 236px;
  display: flex; flex-direction: column; gap: 12px;
}
/* Cụm chuyển mục + nút biểu tượng: cột dọc ở mép phải, ngay dưới dãy chấm điều hướng */
.tut-vbar {
  position: fixed; z-index: 15; right: 7px; top: calc(50% + 100px); width: 46px;
  display: flex; flex-direction: column; gap: 8px;
}
.tut-dock-nav {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 4px 0; border-radius: 10px; background: var(--tut-surface); border: 1px solid var(--tut-line);
}
.tut-dock-step {
  appearance: none; cursor: pointer; flex: none; width: 36px; height: 34px; padding: 0; border-radius: 8px;
  display: grid; place-items: center; color: #000;
  background: var(--tut-accent); border: 1px solid var(--tut-accent);
}
.tut-dock-step svg { transform: rotate(90deg); }
.tut-dock-step:hover:not(:disabled) { background: #33c1f5; border-color: #33c1f5; }
.tut-dock-step:disabled { opacity: 0.4; cursor: default; }
.tut-dock-count { font-size: 13px; font-weight: 700; white-space: nowrap; }
.tut-vbar .tut-actions { margin: 0; gap: 8px; flex-direction: column; flex-wrap: nowrap; }
.tut-vbar .tut-actions .tut-open { width: 46px; min-height: 46px; padding: 0; justify-content: center; }
.tut-vbar .tut-actions .tut-expand { margin-left: 0; }
/* Trong cột dọc, nút mở trang không tô xanh (màu xanh dành cho nút Trước/Sau) */
.tut-vbar .tut-actions .tut-open:not(.is-ghost) {
  color: var(--tut-text); background: transparent; border-color: var(--tut-line-strong);
}
.tut-vbar .tut-actions .tut-open:not(.is-ghost):hover { background: var(--tut-surface-2); border-color: var(--tut-dim); }
.tut-vbar .tut-open-label { display: none; }
.tut-vbar > .tut-mapbtn { width: 46px; min-height: 46px; padding: 0; justify-content: center; }
@media (min-width: 861px) {
  .tut-s3 { transition: padding-left 0.3s ease; }
  /* Mở rộng: bỏ giới hạn bề ngang, khung nội dung trải tới sát mép phải (chừa chỗ cho chấm điều hướng) */
  .tut-s3.has-dock { max-width: none; padding-left: 56px; padding-right: 64px; }
  .tut-main { transition: grid-template-columns 0.3s ease, column-gap 0.3s ease; }
  .tut-main.is-wide { grid-template-columns: 0px minmax(0, 1fr); column-gap: 0; }
  .tut-rail { transition: opacity 0.2s ease; }
  .tut-main.is-wide .tut-rail { opacity: 0; visibility: hidden; border-color: transparent; }
  /* Mở rộng để trình chiếu: tiêu đề nhỏ gọn, ảnh rộng hết chiều ngang (cắt phần đáy),
     nhãn số xếp một hàng dưới ảnh, nút chỉ còn biểu tượng */
  .tut-slide.is-wide { display: grid; grid-template-columns: minmax(0, 1fr) auto; column-gap: 16px; align-items: center; }
  .tut-slide.is-wide > * { grid-column: 1 / -1; }
  .tut-slide.is-wide .tut-crumb { margin-bottom: 6px; font-size: 11px; }
  .tut-slide.is-wide .tut-slide-head { gap: 10px; }
  .tut-slide.is-wide .tut-slide-icon { width: 34px; height: 34px; }
  .tut-slide.is-wide .tut-slide-icon svg { width: 20px; height: 20px; }
  .tut-slide.is-wide .tut-slide-title { font-size: 22px; }
  .tut-slide.is-wide .tut-summary { margin-top: 6px; font-size: 14px; max-width: none; }
  .tut-slide.is-wide > .tut-shot { display: contents; }
  .tut-slide.is-wide .tut-shot-frame {
    grid-column: 1 / -1; grid-row: 4; margin-top: 14px;
  }
  .tut-slide.is-wide .tut-mark { width: 38px; height: 38px; margin: -19px 0 0 -19px; font-size: 26px; }
  /* Hai hàng dưới ảnh chừa chỗ cho bản đồ nhỏ ở góc trái */
  .tut-slide.is-wide .tut-legend { grid-column: 1 / -1; grid-row: 5; margin: 12px 0 0; gap: 10px; }
  .tut-slide.is-wide .tut-legend li { font-size: 16px; padding: 6px 14px 6px 7px; }
  .tut-slide.is-wide .tut-legend-no { width: 24px; height: 24px; font-size: 13px; }
  .tut-slide.is-wide > .tut-more { grid-column: 1 / -1; grid-row: 6; margin: 6px 0 0; }
}
@media (max-width: 860px) {
  .tut-expand, .tut-dock, .tut-vbar { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .tut-main, .tut-rail, .tut-s3 { transition: none; }
}
.tut-open:hover { background: #33c1f5; border-color: #33c1f5; }
.tut-open.is-ghost { color: var(--tut-text); background: transparent; border-color: var(--tut-line-strong); }
.tut-open.is-ghost:hover { background: var(--tut-surface-2); border-color: var(--tut-dim); }

.tut-pill {
  align-self: center; margin-top: 14px; z-index: 5;
  display: flex; align-items: center; gap: 14px; padding: 8px;
  border-radius: 10px; background: var(--tut-surface); border: 1px solid var(--tut-line);
}
.tut-pill-btn {
  appearance: none; font: inherit; cursor: pointer; min-height: 40px; padding: 0 18px;
  display: inline-flex; align-items: center; gap: 6px; border-radius: 8px;
  font-size: 14px; font-weight: 600; color: var(--tut-text);
  background: var(--tut-surface-2); border: 1px solid var(--tut-line-strong);
}
.tut-pill-btn:hover:not(:disabled) { background: #232323; }
.tut-pill-btn.is-primary { background: var(--tut-accent); border-color: var(--tut-accent); color: #000; }
.tut-pill-btn.is-primary:hover:not(:disabled) { background: #33c1f5; }
.tut-pill-btn:disabled { opacity: 0.4; cursor: default; }
.tut-progress { display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 120px; }
.tut-count { font-size: 12px; font-weight: 600; color: var(--tut-dim); }
.tut-dots { display: flex; gap: 5px; }
.tut-pip { width: 6px; height: 6px; border-radius: 50%; background: var(--tut-line-strong); }
.tut-pip.is-active { width: 18px; border-radius: 3px; background: var(--tut-accent); }

/* Chấm điều hướng 3 cụm, bên phải */
.tut-side { position: fixed; z-index: 10; right: 16px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; gap: 6px; }
.tut-side-btn {
  appearance: none; position: relative; cursor: pointer; width: 28px; height: 28px; padding: 0;
  background: none; border: 0; display: grid; place-items: center;
}
.tut-side-btn::before { content: ""; width: 10px; height: 10px; border-radius: 50%; background: var(--tut-line-strong); }
.tut-side-btn.is-active::before { height: 22px; border-radius: 4px; background: var(--tut-accent); }
.tut-side-tip {
  position: absolute; right: 30px; top: 50%; transform: translateY(-50%); white-space: nowrap;
  padding: 4px 10px; border-radius: 6px; font-size: 12px; background: var(--tut-surface-2);
  border: 1px solid var(--tut-line-strong); opacity: 0; pointer-events: none;
}
.tut-side-btn:hover .tut-side-tip, .tut-side-btn:focus-visible .tut-side-tip { opacity: 1; }

/* Thanh cuộn tự vẽ: vạch xanh mảnh thay cho thanh cuộn mặc định (chỉ trên máy tính) */
@media (min-width: 861px) {
  html:has(.tut-root) { scrollbar-width: none; }
  html:has(.tut-root)::-webkit-scrollbar { display: none; }
  .tut-scroll { scrollbar-width: none; }
  .tut-scroll::-webkit-scrollbar { display: none; }
}
.tut-bar { position: absolute; top: 8px; bottom: 8px; right: 0; width: 14px; z-index: 6; }
.tut-bar.is-page { position: fixed; top: 0; bottom: 0; z-index: 20; }
.tut-bar-thumb { position: absolute; right: 0; width: 14px; cursor: pointer; touch-action: none; }
.tut-bar-thumb::after {
  content: ""; position: absolute; top: 0; bottom: 0; right: 3px; width: 2px;
  border-radius: 2px; background: var(--tut-accent);
}
.tut-bar:hover .tut-bar-thumb::after, .tut-bar-thumb.is-drag::after { width: 4px; right: 2px; }

.tut-root button:focus-visible,
.tut-root a:focus-visible { outline: 2px solid var(--tut-accent); outline-offset: 2px; }

@media (max-width: 1200px) {
  .tut-screen { padding-left: 32px; padding-right: 32px; }
  .tut-groups { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .tut-goal-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .tut-stack-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .tut-hero-title { font-size: 36px; }
}
@media (max-width: 860px) {
  html:has(.tut-root) { scroll-snap-type: none; }
  .tut-side { display: none; }
  .tut-screen { min-height: 0; padding: 20px 16px; scroll-snap-align: none; }
  .tut-s1-body, .tut-s2-body, .tut-tech-body { padding: 28px 0 20px; justify-content: flex-start; }
  .tut-tech .tut-hero-title { font-size: 28px; }
  .tut-diagram { flex: none; min-height: 0; }
  .tut-diagram svg { height: auto; }
  .tut-tech-body { padding: 28px 0 20px; }
  .tut-stack-grid { grid-template-columns: 1fr; }
  .tut-s0 { min-height: 100dvh; }
  .tut-team { position: static; width: 100%; margin-top: 8px; }
  .tut-top { flex-direction: column; text-align: center; gap: 20px; }
  .tut-logo { width: 140px; height: 140px; padding: 4px; }
  .tut-title { font-size: 28px; }
  .tut-hero-title { font-size: 30px; }
  .tut-hero-lead { font-size: 16px; }
  .tut-goal-grid { grid-template-columns: 1fr; margin-top: 24px; gap: 10px; }
  .tut-goal-card { flex-direction: row; align-items: center; gap: 14px; padding: 14px 16px; font-size: 15px; }
  .tut-goal-no { font-size: 24px; min-width: 34px; }
  .tut-groups { grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 24px; gap: 12px; }
  .tut-gcard-list { display: none; }
  .tut-s3 { height: auto; padding-top: 12px; }
  .tut-main { grid-template-columns: 1fr; gap: 14px; }
  .tut-rail { display: block; overflow: visible; }
  .tut-rail-in { overflow: visible; padding: 8px; }
  .tut-rail-toggle {
    appearance: none; font: inherit; color: inherit; background: none; border: 0; cursor: pointer;
    width: 100%; min-height: 44px; padding: 0 10px; display: flex; align-items: center; gap: 10px;
    font-size: 14px; font-weight: 600; text-align: left;
  }
  .tut-rail-toggle span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .tut-rail-chevron { transition: transform 0.2s ease; }
  .tut-rail[data-open="true"] .tut-rail-chevron { transform: rotate(180deg); }
  .tut-tree { display: none; padding: 8px 6px 6px; }
  .tut-rail[data-open="true"] .tut-tree { display: flex; }
  .tut-panel { display: block; overflow: visible; }
  .tut-panel-in { overflow: visible; padding: 20px 18px 24px; }
  .tut-bar { display: none; }
  .tut-shot-frame { width: 100%; }
  .tut-slide-title { font-size: 22px; }
  .tut-slide-icon { width: 42px; height: 42px; }
  .tut-pill { position: sticky; bottom: 16px; }
  .tut-dots { display: none; }
  .tut-progress { min-width: 70px; }
}
@media (prefers-reduced-motion: reduce) {
  .tut-root * { transition: none !important; }
}
`;
