"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Card,
  Group,
  Text,
  Badge,
  Button,
  TextInput,
  Select,
  Checkbox,
  SegmentedControl,
  Stack,
  ScrollArea,
  ActionIcon,
  Tooltip,
  Loader,
} from "@mantine/core";
import {
  IconSearch,
  IconRefresh,
  IconAlertTriangle,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import {
  AttendanceSummary,
  BanInfo,
  LogRecord,
  PeopleItem,
  UnknownRecord,
  SuKienTrucTiep,
  dichVuCamera,
} from "@/services/camera/cameraService";
import type { TrangThaiTrucTiep } from "@/hooks/useSuKienTrucTiep";
import ModalLayMau from "./ModalLayMau";
import ModalLayMauNguoi from "./ModalLayMauNguoi";
import ModalXoaMau from "./ModalXoaMau";

type Tab = "LIVE" | "LOG" | "UNKNOWN" | "PEOPLE";

const CHU_KY_LAM_MOI_MS = 10000;
const BUOC = 20; // số bản ghi mỗi lần tải (LOG/UNKNOWN)
const BUOC_NGUOI = 30; // số người hiển thị mỗi lần (PEOPLE, API không phân trang)

const KHOANG_THOI_GIAN = [
  { value: "24", label: "24 giờ" },
  { value: "168", label: "7 ngày" },
  { value: "720", label: "30 ngày" },
];

const phanTram = (v?: number) =>
  typeof v === "number" ? `${Math.round(v * 100)}%` : "—";

function BanBadge({ ban }: { ban?: BanInfo | null }) {
  if (!ban || !ban.checked) {
    return (
      <Badge size="xs" variant="light" color="gray">
        Chưa kiểm tra
      </Badge>
    );
  }
  if (ban.allowed === false) {
    return (
      <Tooltip label={ban.reasons?.join("; ") || "Không được phép"} withArrow>
        <Badge size="xs" variant="filled" color="red">
          Bị hạn chế
        </Badge>
      </Tooltip>
    );
  }
  if (ban.debt && ban.debt > 0) {
    return (
      <Badge size="xs" variant="light" color="orange">
        Nợ {ban.debt.toLocaleString("vi-VN")}
      </Badge>
    );
  }
  return (
    <Badge size="xs" variant="light" color="green">
      Hợp lệ
    </Badge>
  );
}

function Thumb({ image }: { image?: string | null }) {
  return image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dichVuCamera.urlAnh(image)}
      alt=""
      className="event-thumb"
      loading="lazy"
    />
  ) : (
    <div className="event-thumb empty">
      <IconAlertTriangle size={16} />
    </div>
  );
}

const NHAN_SU_KIEN: Record<string, { label: string; color: string }> = {
  recognized: { label: "Nhận diện", color: "green" },
  unknown: { label: "Người lạ", color: "orange" },
  unknown_body: { label: "Người lạ (thấy thân)", color: "orange" },
  spoof: { label: "Nghi giả mạo", color: "red" },
};

/** Ảnh của sự kiện: ưu tiên ảnh mặt base64, sau đó ảnh thân, cuối cùng ảnh đã lưu theo image_path. */
const anhSuKien = (e: SuKienTrucTiep) => {
  if (e.face_image) return `data:image/jpeg;base64,${e.face_image}`;
  if (e.body_image) return `data:image/jpeg;base64,${e.body_image}`;
  return dichVuCamera.urlAnhTheoDuongDan(e.image_path);
};

function DongTrucTiep({ e }: { e: SuKienTrucTiep }) {
  const loai = NHAN_SU_KIEN[e.type] ?? {
    label: e.person ? "Nhận diện" : "Người lạ",
    color: e.person ? "green" : "orange",
  };
  const anh = anhSuKien(e);
  return (
    <div className="event-row">
      {anh ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={anh} alt="" className="event-thumb" />
      ) : (
        <div className="event-thumb empty">
          <IconAlertTriangle size={16} />
        </div>
      )}
      <div style={{ minWidth: 0, flex: 1 }}>
        <Group gap={6} wrap="nowrap">
          <Text fz="xs" fw={700} truncate>
            {e.person
              ? `${e.ban?.full_name?.trim() || e.person.name} (${e.person.id})`
              : "Người lạ"}
          </Text>
          <Badge size="xs" variant="light" color={loai.color}>
            {loai.label}
          </Badge>
          {e.type === "recognized" && e.ban && <BanBadge ban={e.ban} />}
        </Group>
        <Text fz="xs" c="dimmed">
          {dayjs(e.time).format("DD/MM/YYYY HH:mm:ss")} · {e.camera?.name}
          {e.ban?.class_name ? ` · ${e.ban.class_name}` : ""}
          {e.ban?.person_type ? ` · ${e.ban.person_type}` : ""}
        </Text>
        {e.type === "unknown_body" && e.reason && (
          <Text fz={10} c="dimmed">
            Không thấy mặt ({e.reason})
          </Text>
        )}
        {e.match && (
          <Text fz={10} c="dimmed">
            Độ tin cậy {phanTram(e.match.confidence)} · Tương đồng{" "}
            {phanTram(e.match.similarity)}
            {e.match.method ? ` · ${e.match.method}` : ""}
          </Text>
        )}
      </div>
    </div>
  );
}

export default function NhatKyNhanDien({
  camera,
  nhung = false,
  suKien,
  trangThaiLive,
  kemThan,
  onKemThan,
}: {
  camera?: number;
  /** true: đặt trong Drawer (không khung Card/tiêu đề, cao theo màn hình). */
  nhung?: boolean;
  /** Luồng realtime do trang cha giữ (dùng chung với khung vẽ trên video). */
  suKien: SuKienTrucTiep[];
  trangThaiLive: TrangThaiTrucTiep;
  kemThan: boolean;
  onKemThan: (v: boolean) => void;
}) {
  const [tab, setTab] = useState<Tab>("LIVE");
  const [banGhiLayMau, setBanGhiLayMau] = useState<UnknownRecord | null>(null);
  const [moFormLayMau, setMoFormLayMau] = useState(false);
  const [moFormXoaMau, setMoFormXoaMau] = useState(false);
  // sự kiện realtime của mọi camera, lọc theo camera đang chọn ở trang
  const suKienHien = useMemo(
    () =>
      camera === undefined
        ? suKien
        : suKien.filter((e) => e.camera?.index === camera),
    [suKien, camera],
  );
  const [gio, setGio] = useState("24");
  const [qNhap, setQNhap] = useState("");
  const [q, setQ] = useState("");
  const [anDaThem, setAnDaThem] = useState(false);
  const [kemMatLa, setKemMatLa] = useState(false);
  const [lamMoiKey, setLamMoiKey] = useState(0);

  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [unknowns, setUnknowns] = useState<UnknownRecord[]>([]);
  const [nguoi, setNguoi] = useState<PeopleItem[]>([]);
  const [soNguoiHien, setSoNguoiHien] = useState(BUOC_NGUOI);
  const [tong, setTong] = useState(0);
  const [tomTat, setTomTat] = useState<AttendanceSummary | null>(null);
  const [dangTai, setDangTai] = useState(false);
  const [dangTaiThem, setDangTaiThem] = useState(false);
  const [loi, setLoi] = useState(false);
  // đã bấm "Tải thêm" thì tạm dừng tự làm mới để danh sách không bị reset
  const daTaiThemRef = useRef(false);

  const thamSo = useCallback(() => {
    const now = new Date();
    return {
      camera,
      from: dayjs(now).subtract(Number(gio), "hour").toDate(),
      to: now,
      q,
    };
  }, [camera, gio, q]);

  // ── tải trang đầu + tự làm mới
  useEffect(() => {
    if (tab === "LIVE") {
      setDangTai(false);
      setLoi(false);
      return; // tab Trực tiếp dùng luồng realtime do trang cha giữ
    }
    const ctrl = new AbortController();
    daTaiThemRef.current = false;
    setSoNguoiHien(BUOC_NGUOI);
    let lanDau = true;

    const tai = async () => {
      if (daTaiThemRef.current) return;
      if (lanDau) setDangTai(true);
      try {
        const p = thamSo();
        if (tab === "LOG") {
          const r = await dichVuCamera.layNhatKy(
            { ...p, kemMatLa, limit: BUOC, offset: 0 },
            ctrl.signal,
          );
          if (daTaiThemRef.current) return;
          setLogs(r.records ?? []);
          setTong(r.total ?? 0);
          setTomTat(r.summary ?? null);
        } else if (tab === "UNKNOWN") {
          const r = await dichVuCamera.layNguoiLa(
            { ...p, hideAdded: anDaThem, limit: BUOC, offset: 0 },
            ctrl.signal,
          );
          if (daTaiThemRef.current) return;
          setUnknowns(r.records ?? []);
          setTong(r.total ?? 0);
          setTomTat(r.summary ?? null);
        } else {
          const r = await dichVuCamera.layTheoNguoi(p, ctrl.signal);
          const ds = [...(r.people ?? [])].sort((a, b) => b.count - a.count);
          setNguoi(ds);
          setTong(ds.length);
          setTomTat(r.summary ?? null);
        }
        setLoi(false);
      } catch {
        if (!ctrl.signal.aborted) {
          setLoi(true);
          setLogs([]);
          setUnknowns([]);
          setNguoi([]);
          setTong(0);
        }
      } finally {
        if (lanDau && !ctrl.signal.aborted) setDangTai(false);
        lanDau = false;
      }
    };

    tai();
    const timer = setInterval(tai, CHU_KY_LAM_MOI_MS);
    return () => {
      ctrl.abort();
      clearInterval(timer);
    };
  }, [tab, thamSo, kemMatLa, anDaThem, lamMoiKey]);

  const taiThem = async () => {
    setDangTaiThem(true);
    daTaiThemRef.current = true;
    try {
      const p = thamSo();
      if (tab === "LOG") {
        const r = await dichVuCamera.layNhatKy({
          ...p,
          kemMatLa,
          limit: BUOC,
          offset: logs.length,
        });
        setLogs((prev) => {
          const daCo = new Set(prev.map((x) => x.id));
          return [...prev, ...(r.records ?? []).filter((x) => !daCo.has(x.id))];
        });
        setTong(r.total ?? 0);
      } else if (tab === "UNKNOWN") {
        const r = await dichVuCamera.layNguoiLa({
          ...p,
          hideAdded: anDaThem,
          limit: BUOC,
          offset: unknowns.length,
        });
        setUnknowns((prev) => {
          const daCo = new Set(prev.map((x) => x.id));
          return [...prev, ...(r.records ?? []).filter((x) => !daCo.has(x.id))];
        });
        setTong(r.total ?? 0);
      }
    } finally {
      setDangTaiThem(false);
    }
  };

  const daHien =
    tab === "LOG"
      ? logs.length
      : tab === "UNKNOWN"
        ? unknowns.length
        : Math.min(soNguoiHien, nguoi.length);
  const conLai = tong - daHien;
  const nguoiHien = useMemo(
    () => nguoi.slice(0, soNguoiHien),
    [nguoi, soNguoiHien],
  );

  const soBiHanChe = tomTat?.ban_check?.banned ?? 0;

  const noiDung = (
    <>
      <Group justify="space-between" mb="xs" wrap="wrap">
        {!nhung && (
          <Text fw={700} fz="sm" c="#1f5ca9" tt="uppercase">
            Nhật ký nhận diện
          </Text>
        )}
        <Group gap="xs" style={nhung ? { width: "100%" } : undefined} wrap="nowrap">
          <Button
            size="compact-xs"
            variant="light"
            onClick={() => setMoFormLayMau(true)}
          >
            Lấy mẫu
          </Button>
          <Button
            size="compact-xs"
            variant="light"
            color="red"
            onClick={() => setMoFormXoaMau(true)}
          >
            Xóa dữ liệu
          </Button>
          <SegmentedControl
            size="xs"
            fullWidth={nhung}
            value={tab}
            onChange={(v) => setTab(v as Tab)}
            data={[
              { value: "LIVE", label: "Trực tiếp" },
              { value: "LOG", label: "Nhận diện" },
              { value: "UNKNOWN", label: "Người lạ" },
              { value: "PEOPLE", label: "Theo người" },
            ]}
          />
        </Group>
      </Group>

      {/* Tổng quan (summary của API) */}
      {tab !== "LIVE" && tomTat && (
        <Group gap="xs" mb="xs">
          <Badge variant="light" color="blue">
            {tomTat.records} lượt nhận diện
          </Badge>
          <Badge variant="light" color="teal">
            {tomTat.people} người
          </Badge>
          <Badge variant="light" color="red">
            {tomTat.unknown} lượt người lạ
          </Badge>
          {tomTat.ban_check?.enabled && (
            <Tooltip
              label={`Đã kiểm tra ${tomTat.ban_check.checked} người`}
              withArrow
            >
              <Badge
                variant={soBiHanChe > 0 ? "filled" : "light"}
                color={soBiHanChe > 0 ? "red" : "gray"}
              >
                {soBiHanChe} người bị hạn chế
              </Badge>
            </Tooltip>
          )}
        </Group>
      )}

      {tab === "LIVE" && (
        <Group gap="xs" mb="xs">
          <Badge
            variant="dot"
            color={
              trangThaiLive === "open"
                ? "green"
                : trangThaiLive === "error"
                  ? "red"
                  : "yellow"
            }
          >
            {trangThaiLive === "open"
              ? "Đang nhận realtime"
              : trangThaiLive === "error"
                ? "Mất kết nối, đang thử lại..."
                : "Đang kết nối..."}
          </Badge>
          <Checkbox
            size="xs"
            label="Gồm người lạ chỉ thấy thân"
            checked={kemThan}
            onChange={(e) => onKemThan(e.currentTarget.checked)}
          />
        </Group>
      )}

      {/* Bộ lọc */}
      {tab !== "LIVE" && (
        <Group gap="xs" mb="xs" align="center" wrap="wrap">
          <TextInput
            placeholder="Tìm theo ID / tên..."
            leftSection={<IconSearch size={14} />}
            size="xs"
            radius="md"
            value={qNhap}
            onChange={(e) => setQNhap(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setQ(qNhap);
            }}
            style={{ flex: 1, minWidth: 160 }}
          />
          <Button size="xs" variant="light" onClick={() => setQ(qNhap)}>
            Tìm
          </Button>
          <Select
            size="xs"
            w={100}
            data={KHOANG_THOI_GIAN}
            value={gio}
            onChange={(v) => v && setGio(v)}
            allowDeselect={false}
            aria-label="Khoảng thời gian"
          />
          {tab === "UNKNOWN" && (
            <Checkbox
              size="xs"
              label="Ẩn khuôn mặt đã đăng ký"
              checked={anDaThem}
              onChange={(e) => setAnDaThem(e.currentTarget.checked)}
            />
          )}
          {tab === "LOG" && (
            <Checkbox
              size="xs"
              label="Gồm cả mặt lạ"
              checked={kemMatLa}
              onChange={(e) => setKemMatLa(e.currentTarget.checked)}
            />
          )}
          <Tooltip label="Làm mới">
            <ActionIcon
              variant="light"
              size="md"
              onClick={() => setLamMoiKey((n) => n + 1)}
              aria-label="refresh-events"
            >
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      )}

      <ScrollArea h={nhung ? "calc(100vh - 290px)" : 280} scrollbarSize={6}>
        <Stack gap={6}>
          {/* TAB: TRỰC TIẾP (long-poll) */}
          {tab === "LIVE" &&
            suKienHien.map((e) => <DongTrucTiep key={e.seq} e={e} />)}
          {tab === "LIVE" && suKienHien.length === 0 && (
            <Text c="dimmed" fz="sm" ta="center" py="lg">
              Đang chờ sự kiện nhận diện mới...
            </Text>
          )}

          {dangTai && (
            <Group justify="center" py="lg">
              <Loader size="sm" />
            </Group>
          )}
          {loi && !dangTai && (
            <Text c="red" fz="sm" ta="center" py="md">
              Không tải được dữ liệu
            </Text>
          )}

          {/* TAB: NHẬN DIỆN (view=log) */}
          {!dangTai &&
            tab === "LOG" &&
            logs.map((r) => (
              <div key={r.id} className="event-row">
                <Thumb image={r.image} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Group gap={6} wrap="nowrap">
                    <Text fz="xs" fw={700} truncate>
                      {r.person
                        ? `${r.ban?.full_name?.trim() || r.person.name} (${r.person.id})`
                        : "Người lạ"}
                    </Text>
                    {r.person && <BanBadge ban={r.ban} />}
                  </Group>
                  <Text fz="xs" c="dimmed">
                    {dayjs(r.time).format("DD/MM/YYYY HH:mm:ss")} ·{" "}
                    {r.camera?.name}
                    {r.ban?.class_name ? ` · ${r.ban.class_name}` : ""}
                    {r.ban?.person_type ? ` · ${r.ban.person_type}` : ""}
                  </Text>
                  {r.scores && (
                    <Text fz={10} c="dimmed">
                      Độ tin cậy {phanTram(r.scores.confidence)} · Tương đồng{" "}
                      {phanTram(r.scores.similarity)}
                      {r.scores.method ? ` · ${r.scores.method}` : ""}
                    </Text>
                  )}
                </div>
              </div>
            ))}

          {/* TAB: NGƯỜI LẠ (view=unknown) */}
          {!dangTai &&
            tab === "UNKNOWN" &&
            unknowns.map((s) => (
              <div key={s.id} className="event-row">
                <Thumb image={s.image} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Text fz="xs" fw={600}>
                    {dayjs(s.time).format("DD/MM/YYYY HH:mm:ss")} ·{" "}
                    {s.camera?.name}
                  </Text>
                  <Text fz="xs" c="dimmed">
                    Phát hiện người lạ
                    {s.guess?.person
                      ? ` · có thể là ${s.guess.person.name} (${s.guess.person.id})`
                      : ""}
                  </Text>
                  {s.guess && (
                    <Text fz={10} c="dimmed">
                      Độ tin cậy {phanTram(s.guess.confidence)} · Tương đồng{" "}
                      {phanTram(s.guess.similarity)}
                      {s.guess.closest
                        ? ` · gần nhất: ${s.guess.closest.name} (${s.guess.closest.id}, ${phanTram(s.guess.closest.score)})`
                        : ""}
                    </Text>
                  )}
                </div>
                {s.enrolled ? (
                  <Badge size="xs" variant="light" color="teal">
                    Đã thêm mẫu
                  </Badge>
                ) : (
                  <Button
                    size="compact-xs"
                    variant="light"
                    onClick={() => setBanGhiLayMau(s)}
                  >
                    Cập nhật mẫu
                  </Button>
                )}
              </div>
            ))}

          {/* TAB: THEO NGƯỜI (view=people) */}
          {!dangTai &&
            tab === "PEOPLE" &&
            nguoiHien.map((n) => (
              <div key={n.person.id} className="event-row">
                <Thumb image={n.last?.image ?? n.first?.image} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Group gap={6} wrap="nowrap">
                    <Text fz="xs" fw={700} truncate>
                      {n.ban?.full_name?.trim() || n.person.name} ({n.person.id}
                      )
                    </Text>
                    <BanBadge ban={n.ban} />
                  </Group>
                  <Text fz="xs" c="dimmed">
                    {n.count} lượt
                    {n.ban?.class_name ? ` · ${n.ban.class_name}` : ""}
                    {n.ban?.person_type ? ` · ${n.ban.person_type}` : ""}
                  </Text>
                  <Text fz={10} c="dimmed">
                    {n.first?.time
                      ? `Đầu: ${dayjs(n.first.time).format("DD/MM HH:mm")}`
                      : ""}
                    {n.last?.time
                      ? ` · Cuối: ${dayjs(n.last.time).format("DD/MM HH:mm")} (${n.last.camera?.name ?? ""})`
                      : ""}
                  </Text>
                </div>
              </div>
            ))}

          {tab !== "LIVE" && !dangTai && !loi && daHien === 0 && (
            <Text c="dimmed" fz="sm" ta="center" py="lg">
              Chưa có dữ liệu
            </Text>
          )}

          {tab !== "LIVE" && !dangTai && conLai > 0 && (
            <Button
              size="xs"
              variant="subtle"
              loading={dangTaiThem}
              onClick={() =>
                tab === "PEOPLE"
                  ? setSoNguoiHien((n) => n + BUOC_NGUOI)
                  : taiThem()
              }
            >
              Tải thêm ({conLai} còn lại)
            </Button>
          )}
        </Stack>
      </ScrollArea>

      <ModalLayMauNguoi
        opened={moFormLayMau}
        onClose={() => setMoFormLayMau(false)}
        onDone={() => setLamMoiKey((n) => n + 1)}
      />
      <ModalXoaMau
        opened={moFormXoaMau}
        onClose={() => setMoFormXoaMau(false)}
        onDone={() => setLamMoiKey((n) => n + 1)}
      />
      <ModalLayMau
        record={banGhiLayMau}
        onClose={() => setBanGhiLayMau(null)}
        onDone={() => setLamMoiKey((n) => n + 1)}
      />
    </>
  );

  return nhung ? (
    <div>{noiDung}</div>
  ) : (
    <Card withBorder radius="lg" p="md">
      {noiDung}
    </Card>
  );
}
