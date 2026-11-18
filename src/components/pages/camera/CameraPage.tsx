"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box,
  Card,
  Collapse,
  Drawer,
  SimpleGrid,
  Group,
  Text,
  Title,
  Button,
  TextInput,
  Select,
  Badge,
  ActionIcon,
  Tooltip,
  Stack,
  ScrollArea,
  Loader,
  Switch,
} from "@mantine/core";
import { useTranslations } from "next-intl";
import {
  IconSearch,
  IconRefresh,
  IconVideo,
  IconVideoOff,
  IconCamera,
  IconLayoutGrid,
  IconGridDots,
  IconSquare,
  IconHistory,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { showNoti } from "@/components/common/showNoti";
import { useCameraFrames } from "@/hooks/useCameraFrames";
import { useSuKienTrucTiep } from "@/hooks/useSuKienTrucTiep";
import { useCanhBaoPopup } from "@/hooks/useCanhBaoPopup";
import NhatKyNhanDien from "./NhatKyNhanDien";
import LopKhungNhanDien from "./LopKhungNhanDien";
import {
  CameraInfo,
  SuKienTrucTiep,
  dichVuCamera,
  laCameraDangChay,
} from "@/services/camera/cameraService";

type CheDoLuoi = "SINGLE" | "GRID_4" | "GRID_9";

const CHU_KY_LAM_MOI_DANH_SACH_MS = 15000; // trạng thái camera
const CHU_KY_LAM_MOI_SU_KIEN_MS = 10000; // nhật ký người lạ
const CHU_KY_SNAPSHOT_LUOI_MS = 1500; // làm mới ảnh trong chế độ lưới
// Chất lượng hình (tham số width / quality của /live và /api/frames). Thấp = nhẹ, mượt hơn khi mạng yếu.
type ChatLuong = "LOW" | "MID" | "HIGH";
const CHAT_LUONG: Record<ChatLuong, { nhan: string; width: number; quality: number }> = {
  LOW: { nhan: "Thấp (640)", width: 640, quality: 55 },
  MID: { nhan: "Vừa (960)", width: 960, quality: 70 },
  HIGH: { nhan: "Cao (1280)", width: 1280, quality: 80 },
};
const SO_O_LUOI: Record<Exclude<CheDoLuoi, "SINGLE">, number> = {
  GRID_4: 4,
  GRID_9: 9,
};

// ───────────────────────── Khung hình một camera (MJPEG) ─────────────────────────
function LiveFeed({
  camera,
  fps,
  width,
  quality,
  suKien,
  hienKhung,
}: {
  camera: CameraInfo;
  fps: number;
  width: number;
  quality: number;
  suKien: SuKienTrucTiep[];
  hienKhung: boolean;
}) {
  const anhRef = useRef<HTMLImageElement>(null);
  const [loiLanThu, setLoiLanThu] = useState(0);
  const [loi, setLoi] = useState(false);
  const dangChay = laCameraDangChay(camera);

  // cố định src theo camera/lần thử lại để không bị đổi tham số t mỗi lần render
  const src = useMemo(
    () => (dangChay ? dichVuCamera.urlLive(camera.index, fps, width, quality) : ""),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [camera.index, dangChay, loiLanThu, fps, width, quality],
  );

  useEffect(() => setLoi(false), [camera.index, loiLanThu]);

  if (!dangChay || loi) {
    return (
      <div className="feed-placeholder">
        <IconVideoOff size={40} />
        <Text fz="sm" mt={8}>
          {!dangChay
            ? `Camera không chạy (${camera.enabled ? camera.status : "đã tắt"})`
            : "Không tải được luồng hình"}
        </Text>
        {dangChay && (
          <Button
            mt="sm"
            size="xs"
            variant="light"
            leftSection={<IconRefresh size={14} />}
            onClick={() => setLoiLanThu((n) => n + 1)}
          >
            Thử lại
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={anhRef}
        src={src}
        alt={camera.name}
        className="feed-media"
        onError={() => setLoi(true)}
      />
      {hienKhung && (
        <LopKhungNhanDien
          key={src}
          anhRef={anhRef}
          cameraIndex={camera.index}
          suKien={suKien}
        />
      )}
    </>
  );
}

// ───────────────────────── Ô trong lưới (làm mới bằng snapshot) ─────────────────────────
function SnapshotTile({
  camera,
  onOpen,
  dungWs,
  khungWs,
  suKien,
  hienKhung,
}: {
  camera: CameraInfo;
  onOpen: () => void;
  dungWs: boolean; // true: nhận khung từ WebSocket; false: tự làm mới bằng snapshot
  khungWs?: string;
  suKien: SuKienTrucTiep[];
  hienKhung: boolean;
}) {
  const anhRef = useRef<HTMLImageElement>(null);
  const [srcPoll, setSrc] = useState("");
  const [loi, setLoi] = useState(false);
  const dangChay = laCameraDangChay(camera);
  const src = dungWs ? (khungWs ?? "") : srcPoll;

  useEffect(() => {
    if (!dangChay || dungWs) return;
    let stop = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = () => {
      const url = dichVuCamera.urlSnapshot(camera.index);
      const img = new Image();
      img.onload = () => {
        if (stop) return;
        setSrc(url);
        setLoi(false);
        timer = setTimeout(tick, CHU_KY_SNAPSHOT_LUOI_MS);
      };
      img.onerror = () => {
        if (stop) return;
        setLoi(true);
        timer = setTimeout(tick, CHU_KY_SNAPSHOT_LUOI_MS * 4);
      };
      img.src = url;
    };
    tick();

    return () => {
      stop = true;
      if (timer) clearTimeout(timer);
    };
  }, [camera.index, dangChay, dungWs]);

  return (
    <div className="grid-tile" onClick={onOpen}>
      {dangChay && src && !loi ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={anhRef} src={src} alt={camera.name} className="feed-media" />
          {hienKhung && (
            <LopKhungNhanDien
              anhRef={anhRef}
              cameraIndex={camera.index}
              suKien={suKien}
            />
          )}
        </>
      ) : (
        <div className="feed-placeholder small">
          {dangChay && !loi ? <Loader size="sm" /> : <IconVideoOff size={28} />}
          <Text fz="xs" mt={6}>
            {dangChay ? (loi ? "Mất tín hiệu" : "Đang tải...") : "Không chạy"}
          </Text>
        </div>
      )}
      <div className="grid-tile-label">{camera.name}</div>
    </div>
  );
}

// ───────────────────────── Trang chính ─────────────────────────
export default function CameraPage() {
  const t = useTranslations("Camera");

  const [danhSachCam, setDanhSachCam] = useState<CameraInfo[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [loiTai, setLoiTai] = useState<string | null>(null);

  const [tuKhoa, setTuKhoa] = useState(""); // từ khoá đã áp dụng (bấm Tìm / Enter)
  const [tuKhoaNhap, setTuKhoaNhap] = useState(""); // nội dung đang gõ
  const [moDanhSach, setMoDanhSach] = useState(false);
  const [moNhatKy, setMoNhatKy] = useState(false);
  // Luồng nhận diện realtime: giữ ở trang để vừa vẽ khung lên video, vừa cấp cho Drawer
  const [hienKhung, setHienKhung] = useState(true);
  const [kemThan, setKemThan] = useState(false);
  const { suKien, trangThai: trangThaiLive } = useSuKienTrucTiep(true, kemThan);
  // Popup cảnh báo (giả mạo, người lạ, bị cấm, nợ phí); nhớ lựa chọn của người dùng
  const [popupCanhBao, setPopupCanhBao] = useState(true);
  useEffect(() => {
    try {
      if (localStorage.getItem("ktx.camera.popupCanhBao") === "0") setPopupCanhBao(false);
    } catch {}
  }, []);
  const doiPopupCanhBao = (v: boolean) => {
    setPopupCanhBao(v);
    try {
      localStorage.setItem("ktx.camera.popupCanhBao", v ? "1" : "0");
    } catch {}
  };
  useCanhBaoPopup(suKien, popupCanhBao, () => setMoNhatKy(true));
  const [khuVuc, setKhuVuc] = useState<string | null>("ALL");
  const [cheDoLuoi, setCheDoLuoi] = useState<CheDoLuoi>("SINGLE");
  const [camChonIndex, setCamChonIndex] = useState<number | null>(null);
  // Camera chỉ thu khoảng 15 khung/giây nên đặt cao hơn không nhanh thêm (BE: tối đa là fps của camera)
  const [fps, setFps] = useState("15");
  const [chatLuong, setChatLuong] = useState<ChatLuong>("MID");

  // ── danh sách camera (poll để cập nhật trạng thái)
  const taiDanhSach = useCallback(async (signal?: AbortSignal) => {
    try {
      const ds = await dichVuCamera.layDanhSach(signal);
      setDanhSachCam(Array.isArray(ds) ? ds : []);
      setLoiTai(null);
    } catch (err) {
      if (signal?.aborted) return;
      setLoiTai(err instanceof Error ? err.message : "Lỗi tải camera");
    } finally {
      setDangTai(false);
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    taiDanhSach(ctrl.signal);
    const timer = setInterval(
      () => taiDanhSach(ctrl.signal),
      CHU_KY_LAM_MOI_DANH_SACH_MS,
    );
    return () => {
      ctrl.abort();
      clearInterval(timer);
    };
  }, [taiDanhSach]);

  // chọn mặc định camera đầu tiên đang chạy (hoặc camera đầu tiên)
  useEffect(() => {
    if (danhSachCam.length === 0) return;
    setCamChonIndex((cur) => {
      if (cur !== null && danhSachCam.some((c) => c.index === cur)) return cur;
      return (danhSachCam.find(laCameraDangChay) ?? danhSachCam[0]).index;
    });
  }, [danhSachCam]);

  const camHienTai = useMemo(
    () => danhSachCam.find((c) => c.index === camChonIndex) ?? null,
    [danhSachCam, camChonIndex],
  );

  const danhSachKhu = useMemo(() => {
    const set = new Set<string>();
    danhSachCam.forEach((c) => c.area && set.add(c.area));
    return [
      { value: "ALL", label: t("allAreas") },
      ...Array.from(set).map((a) => ({ value: a, label: a })),
    ];
  }, [danhSachCam, t]);

  const danhSachCamLoc = useMemo(() => {
    const kw = tuKhoa.trim().toLowerCase();
    return danhSachCam.filter((c) => {
      const khop =
        !kw ||
        c.name.toLowerCase().includes(kw) ||
        (c.location ?? "").toLowerCase().includes(kw);
      const khopKhu = !khuVuc || khuVuc === "ALL" || c.area === khuVuc;
      return khop && khopKhu;
    });
  }, [danhSachCam, tuKhoa, khuVuc]);

  const soDangChay = danhSachCam.filter(laCameraDangChay).length;

  // ── nhật ký người lạ (24h gần nhất; chế độ 1 camera thì lọc theo camera đó)
  const camLocSuKien = cheDoLuoi === "SINGLE" ? camHienTai?.index : undefined;

  // ── chụp ảnh: lấy 1 khung từ snapshot rồi tải về
  const chupAnh = async (cam: CameraInfo) => {
    try {
      const res = await fetch(dichVuCamera.urlSnapshot(cam.index), {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CCTV_Snapshot_${cam.index}_${dayjs().format("YYYY-MM-DD_HH-mm-ss")}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
      showNoti("success", t("snapshotSuccess"));
    } catch {
      showNoti("error", "Không chụp được ảnh từ camera này");
    }
  };

  // ── các camera hiển thị trong lưới: ưu tiên camera đang chạy
  const camTrongLuoi = useMemo(() => {
    if (cheDoLuoi === "SINGLE") return [];
    const sapXep = [...danhSachCamLoc].sort(
      (a, b) => Number(laCameraDangChay(b)) - Number(laCameraDangChay(a)),
    );
    return sapXep.slice(0, SO_O_LUOI[cheDoLuoi]);
  }, [cheDoLuoi, danhSachCamLoc]);

  // Lưới: ưu tiên WebSocket (qua nginx cùng origin); không kết nối được thì dùng snapshot
  const indexLuoi = useMemo(
    () => camTrongLuoi.filter(laCameraDangChay).map((c) => c.index),
    [camTrongLuoi],
  );
  const { frames: khungWs, trangThai: trangThaiWs } = useCameraFrames(
    indexLuoi,
    cheDoLuoi !== "SINGLE",
    Number(fps),
    {
      // ô lưới nhỏ nên không cần độ phân giải cao như khung xem lớn
      width: Math.min(
        CHAT_LUONG[chatLuong].width,
        cheDoLuoi === "GRID_9" ? 480 : 640,
      ),
      quality: CHAT_LUONG[chatLuong].quality,
    },
  );
  const dungWs = trangThaiWs === "open" || trangThaiWs === "connecting";

  const moCameraDon = (cam: CameraInfo) => {
    setCamChonIndex(cam.index);
    setCheDoLuoi("SINGLE");
    setMoDanhSach(false);
  };

  const timKiem = () => {
    setTuKhoa(tuKhoaNhap.trim());
    setMoDanhSach(true); // hiện luôn danh sách để thấy kết quả
  };

  const nutCheDo = (che: CheDoLuoi, nhan: string, icon: React.ReactNode) => (
    <Tooltip label={nhan}>
      <ActionIcon
        variant={cheDoLuoi === che ? "filled" : "light"}
        color={cheDoLuoi === che ? "blue" : "gray"}
        onClick={() => setCheDoLuoi(che)}
        size="lg"
      >
        {icon}
      </ActionIcon>
    </Tooltip>
  );

  return (
    <Box className="camera-page-container">
      <div className="camera-header-row">
        <Title className="camera-page-title" order={2}>
          {t("title")}
        </Title>
        <Group gap="xs">
          <Badge color="green" variant="light" size="lg" radius="md">
            {soDangChay}/{danhSachCam.length} {t("online")}
          </Badge>
          <Select
            size="xs"
            w={90}
            value={fps}
            onChange={(v) => v && setFps(v)}
            allowDeselect={false}
            aria-label="fps"
            data={[
              { value: "5", label: "5 fps" },
              { value: "10", label: "10 fps" },
              { value: "15", label: "15 fps" },
            ]}
          />
          <Button
            variant="light"
            leftSection={<IconHistory size={16} />}
            onClick={() => setMoNhatKy(true)}
          >
            Nhật ký nhận diện
          </Button>
          <Select
            size="xs"
            w={120}
            value={chatLuong}
            onChange={(v) => v && setChatLuong(v as ChatLuong)}
            allowDeselect={false}
            aria-label="Chất lượng hình"
            data={(Object.keys(CHAT_LUONG) as ChatLuong[]).map((k) => ({
              value: k,
              label: CHAT_LUONG[k].nhan,
            }))}
          />
          <Switch
            size="sm"
            label="Khung nhận diện"
            checked={hienKhung}
            onChange={(e) => setHienKhung(e.currentTarget.checked)}
          />
          <Switch
            size="sm"
            label="Popup cảnh báo"
            checked={popupCanhBao}
            onChange={(e) => doiPopupCanhBao(e.currentTarget.checked)}
          />
          <Tooltip label="Làm mới danh sách">
            <ActionIcon
              variant="light"
              size="lg"
              onClick={() => taiDanhSach()}
              aria-label="refresh"
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>
          <Group gap={4}>
            {nutCheDo("SINGLE", t("grid1"), <IconSquare size={20} />)}
            {nutCheDo("GRID_4", t("grid4"), <IconLayoutGrid size={20} />)}
            {nutCheDo("GRID_9", t("grid9"), <IconGridDots size={20} />)}
          </Group>
        </Group>
      </div>

      {/* Thanh tìm kiếm + nút mở danh sách camera */}
      <Group gap="xs" mb="sm" wrap="wrap">
        <TextInput
          placeholder={t("searchCam")}
          leftSection={<IconSearch size={16} />}
          value={tuKhoaNhap}
          onChange={(e) => {
            setTuKhoaNhap(e.target.value);
            if (e.target.value === "") setTuKhoa(""); // xoá hết ô tìm thì bỏ lọc
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") timKiem();
          }}
          radius="md"
          style={{ flex: 1, minWidth: 220 }}
        />
        <Button leftSection={<IconSearch size={16} />} onClick={timKiem}>
          Tìm
        </Button>
        <Button
          variant={moDanhSach ? "filled" : "light"}
          leftSection={<IconVideo size={16} />}
          rightSection={
            moDanhSach ? (
              <IconChevronUp size={16} />
            ) : (
              <IconChevronDown size={16} />
            )
          }
          onClick={() => setMoDanhSach((v) => !v)}
        >
          {t("cameraList")} ({danhSachCamLoc.length})
        </Button>
      </Group>

      {/* Danh sách camera: hiện khi bấm nút */}
      <Collapse in={moDanhSach}>
        <Card withBorder radius="lg" p="md" mb="md" className="shadow-sm">
          <Group mb="sm" gap="xs">
            <Select
              data={danhSachKhu}
              value={khuVuc}
              onChange={setKhuVuc}
              radius="md"
              w={220}
              allowDeselect={false}
              aria-label="Khu vực"
            />
            {tuKhoa && (
              <Badge variant="light" size="lg" radius="md">
                Từ khoá: {tuKhoa}
              </Badge>
            )}
          </Group>
          <ScrollArea.Autosize mah={340} scrollbarSize={6} offsetScrollbars>
            {dangTai && (
              <Group justify="center" py="xl">
                <Loader size="sm" />
              </Group>
            )}
            {loiTai && !dangTai && (
              <Text c="red" fz="sm" ta="center" py="md">
                Không tải được danh sách camera ({loiTai})
              </Text>
            )}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="xs">
              {danhSachCamLoc.map((cam) => {
                const chay = laCameraDangChay(cam);
                const chon =
                  cheDoLuoi === "SINGLE" && camChonIndex === cam.index;
                return (
                  <div
                    key={cam.index}
                    onClick={() => moCameraDon(cam)}
                    className={`camera-list-item ${chon ? "active" : ""} ${chay ? "" : "offline"}`}
                  >
                    <div className="cam-thumb">
                      {chay ? (
                        <IconVideo size={18} color="#1f5ca9" />
                      ) : (
                        <IconVideoOff size={18} color="#94a3b8" />
                      )}
                    </div>
                    <div className="cam-info">
                      <Text fw={650} fz={12} truncate>
                        {cam.name}
                      </Text>
                      <Group gap="xs" mt={1}>
                        <Text fz={10} c="dimmed">
                          {cam.area ?? cam.location ?? "—"}
                          {chay
                            ? ` · ${cam.codec ?? ""} ${cam.capture_fps?.toFixed(1) ?? "—"}fps`
                            : ""}
                        </Text>
                        <Badge
                          color={chay ? "green" : "red"}
                          variant="dot"
                          size="xs"
                          p={0}
                          styles={{
                            root: { background: "transparent", border: 0 },
                          }}
                        >
                          {chay
                            ? t("online")
                            : cam.enabled
                              ? cam.status
                              : t("offline")}
                        </Badge>
                      </Group>
                    </div>
                  </div>
                );
              })}
            </SimpleGrid>
            {!dangTai && !loiTai && danhSachCamLoc.length === 0 && (
              <Text c="dimmed" fz="sm" ta="center" py="xl">
                Không tìm thấy camera phù hợp
              </Text>
            )}
          </ScrollArea.Autosize>
        </Card>
      </Collapse>

      {/* Cụm camera: toàn chiều ngang */}
      {cheDoLuoi === "SINGLE" ? (
        <Card className="player-wrapper-card" withBorder p={0} radius="xl">
          <Box className="player-container">
            {camHienTai ? (
              <>
                <LiveFeed
                  camera={camHienTai}
                  fps={Number(fps)}
                  width={CHAT_LUONG[chatLuong].width}
                  quality={CHAT_LUONG[chatLuong].quality}
                  suKien={suKien}
                  hienKhung={hienKhung}
                />
                <div className="player-topbar">
                  <Badge color="red" variant="filled" size="sm">
                    {t("live")}
                  </Badge>
                  <Text c="white" fw={600} fz="sm">
                    {camHienTai.name}
                  </Text>
                  {camHienTai.location && (
                    <Text c="gray.4" fz="xs">
                      {camHienTai.location}
                    </Text>
                  )}
                </div>
                <div className="player-bottombar">
                  <Text c="gray.4" fz="xs">
                    {camHienTai.codec ?? "—"} ·{" "}
                    {camHienTai.capture_fps?.toFixed(1) ?? "—"} fps ·{" "}
                    {camHienTai.faces_detected ?? 0} khuôn mặt
                  </Text>
                  <Button
                    size="xs"
                    variant="white"
                    leftSection={<IconCamera size={14} />}
                    disabled={!laCameraDangChay(camHienTai)}
                    onClick={() => chupAnh(camHienTai)}
                  >
                    {t("snapshot")}
                  </Button>
                </div>
              </>
            ) : (
              <div className="feed-placeholder">
                <IconVideoOff size={40} />
                <Text fz="sm" mt={8}>
                  {dangTai ? "Đang tải..." : "Chưa có camera"}
                </Text>
              </div>
            )}
          </Box>
        </Card>
      ) : (
        <div className={`camera-grid ${cheDoLuoi === "GRID_4" ? "g4" : "g9"}`}>
          {camTrongLuoi.map((cam) => (
            <SnapshotTile
              key={cam.index}
              camera={cam}
              onOpen={() => moCameraDon(cam)}
              dungWs={dungWs}
              khungWs={khungWs[cam.index]}
              suKien={suKien}
              hienKhung={hienKhung}
            />
          ))}
          {camTrongLuoi.length === 0 && (
            <Text
              c="dimmed"
              ta="center"
              py="xl"
              style={{ gridColumn: "1 / -1" }}
            >
              Không có camera để hiển thị
            </Text>
          )}
        </div>
      )}

      {/* Nhật ký nhận diện: Drawer bên phải, chỉ nạp dữ liệu khi mở */}
      <Drawer
        opened={moNhatKy}
        onClose={() => setMoNhatKy(false)}
        position="right"
        size="lg"
        title={
          <Text fw={700} c="#1f5ca9" tt="uppercase" fz="sm">
            Nhật ký nhận diện
          </Text>
        }
      >
        <NhatKyNhanDien
          camera={camLocSuKien}
          nhung
          suKien={suKien}
          trangThaiLive={trangThaiLive}
          kemThan={kemThan}
          onKemThan={setKemThan}
        />
      </Drawer>

      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
    </Box>
  );
}

const pageStyles = `
.camera-page-container { padding: 1rem; font-family: var(--font-k2d), sans-serif; }
.camera-header-row { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:.75rem; margin-bottom:1rem; }
.camera-page-title { color:#1f5ca9; font-family: var(--font-k2d), sans-serif; }

.camera-list-item { display:flex; gap:.6rem; align-items:center; padding:.5rem .6rem; border:1px solid #e2e8f0; border-radius:.6rem; cursor:pointer; background:#fff; transition:all .15s; }
.camera-list-item:hover { border-color:#1f5ca9; background:#f5f9ff; }
.camera-list-item.active { border-color:#1f5ca9; background:#eaf2fd; }
.camera-list-item.offline { opacity:.65; }
.cam-thumb { width:34px; height:34px; border-radius:.45rem; background:#eef3fa; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.cam-info { min-width:0; flex:1; }

.player-wrapper-card { overflow:hidden; background:#0b1220; }
.player-container { position:relative; width:100%; aspect-ratio:16/9; max-height:calc(100vh - 260px); background:#0b1220; display:flex; align-items:center; justify-content:center; }
.feed-media { width:100%; height:100%; object-fit:contain; display:block; background:#0b1220; }
.player-container > .feed-media { position:absolute; inset:0; }
.feed-placeholder { display:flex; flex-direction:column; align-items:center; justify-content:center; color:#94a3b8; width:100%; height:100%; }
.feed-placeholder.small { font-size:.75rem; }
.player-topbar { position:absolute; top:0; left:0; right:0; display:flex; align-items:center; gap:.6rem; padding:.6rem .9rem; background:linear-gradient(to bottom, rgba(0,0,0,.65), transparent); }
.player-bottombar { position:absolute; bottom:0; left:0; right:0; display:flex; align-items:center; justify-content:space-between; gap:.6rem; padding:.6rem .9rem; background:linear-gradient(to top, rgba(0,0,0,.65), transparent); }

.camera-grid { display:grid; gap:.75rem; }
.camera-grid.g4 { grid-template-columns:repeat(2, minmax(0,1fr)); }
.camera-grid.g9 { grid-template-columns:repeat(3, minmax(0,1fr)); }
.grid-tile { position:relative; aspect-ratio:16/9; background:#0b1220; border-radius:.75rem; overflow:hidden; cursor:pointer; border:1px solid #1e293b; }
.grid-tile:hover { border-color:#1f5ca9; }
.grid-tile-label { position:absolute; left:0; right:0; bottom:0; padding:.3rem .6rem; font-size:.75rem; color:#fff; background:linear-gradient(to top, rgba(0,0,0,.7), transparent); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

.event-row { display:flex; gap:.6rem; align-items:center; padding:.35rem .4rem; border-radius:.5rem; }
.event-row:hover { background:#f8fafc; }
.event-thumb { width:44px; height:44px; border-radius:.4rem; object-fit:cover; background:#eef3fa; flex-shrink:0; }
.event-thumb.empty { display:flex; align-items:center; justify-content:center; color:#e11d48; }
`;
