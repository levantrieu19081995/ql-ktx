/* eslint-disable prefer-const */
"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box,
  Grid,
  Card,
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
  Modal,
} from "@mantine/core";
import { useTranslations } from "next-intl";
import {
  IconSearch,
  IconRefresh,
  IconVideo,
  IconVideoOff,
  IconEye,
  IconEyeOff,
  IconChevronUp,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconDeviceCctv,
  IconAlertTriangle,
  IconCamera,
  IconLayoutGrid,
  IconGridDots,
  IconSquare,
  IconPower,
  IconRotateDot,
  IconZoomIn,
  IconZoomOut,
  IconMaximize,
  IconHome,
  IconSettings,
  IconScan,
  IconFocus2,
  IconFocus,
} from "@tabler/icons-react";
import { showNoti } from "@/components/common/showNoti";

// Định nghĩa giao diện camera
interface CameraItem {
  id: string;
  name: string;
  area: string;
  type: string;
  ip: string;
  status: "ONLINE" | "OFFLINE";
  ptzCapable: boolean;
}

// Đối tượng mô phỏng di chuyển trong khung hình
interface MovingObject {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: "person" | "vehicle";
  label: string;
  isStranger: boolean;
  color: string;
}

// Log sự kiện AI phát hiện
interface AIEvent {
  id: string;
  time: string;
  cameraName: string;
  type: "INFO" | "WARNING";
  message: string;
}

const DANH_SACH_CAM_MOCK: CameraItem[] = [
  {
    id: "cam-01",
    name: "Camera Cổng chính Khu A (Vào)",
    area: "KHU_A",
    type: "Cổng chính",
    ip: "192.168.10.11",
    status: "ONLINE",
    ptzCapable: true,
  },
  {
    id: "cam-02",
    name: "Camera Cổng chính Khu A (Ra)",
    area: "KHU_A",
    type: "Cổng chính",
    ip: "192.168.10.12",
    status: "ONLINE",
    ptzCapable: true,
  },
  {
    id: "cam-03",
    name: "Surveillance Nhà xe Khu A",
    area: "KHU_A",
    type: "Nhà xe",
    ip: "192.168.10.25",
    status: "ONLINE",
    ptzCapable: false,
  },
  {
    id: "cam-04",
    name: "Dome Hành lang Tầng 1 - Block A1",
    area: "KHU_A",
    type: "Hành lang",
    ip: "192.168.11.41",
    status: "ONLINE",
    ptzCapable: false,
  },
  {
    id: "cam-05",
    name: "Dome Hành lang Tầng 2 - Block A1",
    area: "KHU_A",
    type: "Hành lang",
    ip: "192.168.11.42",
    status: "ONLINE",
    ptzCapable: false,
  },
  {
    id: "cam-06",
    name: "Camera Cổng chính Khu B (Vào)",
    area: "KHU_B",
    type: "Cổng chính",
    ip: "192.168.20.11",
    status: "ONLINE",
    ptzCapable: true,
  },
  {
    id: "cam-07",
    name: "Camera Cổng chính Khu B (Ra)",
    area: "KHU_B",
    type: "Cổng chính",
    ip: "192.168.20.12",
    status: "ONLINE",
    ptzCapable: true,
  },
  {
    id: "cam-08",
    name: "Surveillance Nhà xe Khu B",
    area: "KHU_B",
    type: "Nhà xe",
    ip: "192.168.20.25",
    status: "ONLINE",
    ptzCapable: false,
  },
  {
    id: "cam-09",
    name: "Camera Cổng phụ Khu C (Offline)",
    area: "KHU_C",
    type: "Cổng phụ",
    ip: "192.168.30.15",
    status: "OFFLINE",
    ptzCapable: true,
  },
];

const TEN_SINH_VIEN = [
  "Nguyễn Văn An",
  "Trần Thị Bình",
  "Lê Văn Cường",
  "Phạm Minh Duy",
  "Đặng Hoàng Em",
  "Vũ Thị Hương",
  "Hoàng Văn Nam",
  "Bùi Thị Tuyết",
];
const MSSV_MOCK = [
  "B2103847",
  "B2005829",
  "B2109287",
  "B1902845",
  "B2208945",
  "B2103840",
  "B2002345",
  "B2107483",
];
const BIEN_SO_XE = [
  "65-A1 123.45",
  "65-B2 567.89",
  "65-C1 246.80",
  "59-D3 135.79",
  "43-G1 999.99",
];

export default function CameraPage() {
  const t = useTranslations("Camera");
  const tGlobal = useTranslations("Menu");

  // State điều khiển bộ lọc
  const [tuKhoa, setTuKhoa] = useState("");
  const [khuVuc, setKhuVuc] = useState<string | null>("ALL");

  // State quản lý xem cam
  const [cameraHienTai, setCameraHienTai] = useState<CameraItem>(
    DANH_SACH_CAM_MOCK[0],
  );
  const [cheDoGrid, setCheDoGrid] = useState<"SINGLE" | "GRID_4" | "GRID_9">(
    "SINGLE",
  );
  const [aiOverlay, setAiOverlay] = useState(true);

  // Custom camera selection lists for grid modes
  const [grid4Cams, setGrid4Cams] = useState<string[]>(() => [
    DANH_SACH_CAM_MOCK[0]?.id || "",
    DANH_SACH_CAM_MOCK[1]?.id || "",
    DANH_SACH_CAM_MOCK[2]?.id || "",
    DANH_SACH_CAM_MOCK[3]?.id || "",
  ]);

  const [grid9Cams, setGrid9Cams] = useState<string[]>(() => [
    DANH_SACH_CAM_MOCK[0]?.id || "",
    DANH_SACH_CAM_MOCK[1]?.id || "",
    DANH_SACH_CAM_MOCK[2]?.id || "",
    DANH_SACH_CAM_MOCK[3]?.id || "",
    DANH_SACH_CAM_MOCK[4]?.id || "",
    DANH_SACH_CAM_MOCK[5]?.id || "",
    DANH_SACH_CAM_MOCK[6]?.id || "",
    DANH_SACH_CAM_MOCK[7]?.id || "",
    DANH_SACH_CAM_MOCK[8]?.id || "",
  ]);

  // State PTZ cho từng camera (để giữ góc khi chuyển đổi)
  const [ptzState, setPtzState] = useState<
    Record<string, { pan: number; tilt: number; zoom: number }>
  >(() => {
    const states: Record<string, { pan: number; tilt: number; zoom: number }> =
      {};
    DANH_SACH_CAM_MOCK.forEach((cam) => {
      states[cam.id] = { pan: 0, tilt: 0, zoom: 1 };
    });
    return states;
  });

  // State log sự kiện
  const [eventLogs, setEventLogs] = useState<AIEvent[]>([]);

  // Lọc danh sách camera
  const danhSachCamLoc = useMemo(() => {
    return DANH_SACH_CAM_MOCK.filter((cam) => {
      const matchTuKhoa =
        cam.name.toLowerCase().includes(tuKhoa.toLowerCase()) ||
        cam.ip.includes(tuKhoa);
      const matchKhu = khuVuc === "ALL" || !khuVuc ? true : cam.area === khuVuc;
      return matchTuKhoa && matchKhu;
    });
  }, [tuKhoa, khuVuc]);

  // Tạo log sự kiện ban đầu
  useEffect(() => {
    const initialLogs: AIEvent[] = [];
    const now = new Date();
    for (let i = 0; i < 5; i++) {
      const logTime = new Date(now.getTime() - (5 - i) * 60000);
      const randomCam = DANH_SACH_CAM_MOCK[Math.floor(Math.random() * 8)]; // Bỏ qua cam offline
      const timeStr = logTime.toTimeString().split(" ")[0];

      if (Math.random() > 0.3) {
        const randomIdx = Math.floor(Math.random() * TEN_SINH_VIEN.length);
        initialLogs.push({
          id: `log-init-${i}`,
          time: timeStr,
          cameraName: randomCam.name,
          type: "INFO",
          message: `Phát hiện: ${TEN_SINH_VIEN[randomIdx]} (${MSSV_MOCK[randomIdx]})`,
        });
      } else {
        initialLogs.push({
          id: `log-init-${i}`,
          time: timeStr,
          cameraName: randomCam.name,
          type: "WARNING",
          message: `CẢNH BÁO: Phát hiện người lạ (Đối tượng nghi vấn)`,
        });
      }
    }
    setEventLogs(initialLogs);
  }, []);

  // Timer giả lập đẩy sự kiện thời gian thực
  useEffect(() => {
    const interval = setInterval(() => {
      // Chỉ push sự kiện nếu có camera đang online
      const camActive = DANH_SACH_CAM_MOCK.filter((c) => c.status === "ONLINE");
      if (camActive.length === 0) return;

      const randomCam = camActive[Math.floor(Math.random() * camActive.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];
      const isWarning = Math.random() < 0.25;

      let message = "";
      if (isWarning) {
        message = `CẢNH BÁO: Phát hiện đối tượng lạ chưa đăng ký thẻ KTX!`;
        // Hiển thị notification
        showNoti(
          "warning",
          `[Cảnh báo người lạ] Phát hiện đối tượng lạ tại vị trí: ${randomCam.name}`,
        );
      } else {
        if (randomCam.type === "Nhà xe") {
          const randPlate =
            BIEN_SO_XE[Math.floor(Math.random() * BIEN_SO_XE.length)];
          message = `Phát hiện phương tiện: Biển số ${randPlate} ra vào`;
        } else {
          const randomIdx = Math.floor(Math.random() * TEN_SINH_VIEN.length);
          message = `Phát hiện sinh viên: ${TEN_SINH_VIEN[randomIdx]} (${MSSV_MOCK[randomIdx]})`;
        }
      }

      const newLog: AIEvent = {
        id: `log-${Date.now()}`,
        time: timeStr,
        cameraName: randomCam.name,
        type: isWarning ? "WARNING" : "INFO",
        message,
      };

      setEventLogs((prev) => [newLog, ...prev.slice(0, 19)]); // Giới hạn 20 logs
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const [isScanning, setIsScanning] = useState(false);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Stop scanning when camera changes or unmounts
  useEffect(() => {
    setIsScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  }, [cameraHienTai.id]);

  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, []);

  // Điều khiển PTZ cho camera hiện tại
  const handlePtz = (
    direction:
      | "UP"
      | "DOWN"
      | "LEFT"
      | "RIGHT"
      | "RESET"
      | "ZOOM_IN"
      | "ZOOM_OUT",
  ) => {
    if (!cameraHienTai.ptzCapable || cameraHienTai.status === "OFFLINE") return;

    setPtzState((prev) => {
      const state = prev[cameraHienTai.id] || { pan: 0, tilt: 0, zoom: 1 };
      let { pan, tilt, zoom } = state;

      const STEP_PAN = 15;
      const STEP_TILT = 10;
      const MAX_PAN = 120;
      const MAX_TILT = 80;

      switch (direction) {
        case "UP":
          tilt = Math.max(tilt - STEP_TILT, -MAX_TILT);
          break;
        case "DOWN":
          tilt = Math.min(tilt + STEP_TILT, MAX_TILT);
          break;
        case "LEFT":
          pan = Math.max(pan - STEP_PAN, -MAX_PAN);
          break;
        case "RIGHT":
          pan = Math.min(pan + STEP_PAN, MAX_PAN);
          break;
        case "ZOOM_IN":
          zoom = Math.min(zoom + 0.25, 3.0);
          break;
        case "ZOOM_OUT":
          zoom = Math.max(zoom - 0.25, 1.0);
          break;
        case "RESET":
          pan = 0;
          tilt = 0;
          zoom = 1;
          break;
      }

      return {
        ...prev,
        [cameraHienTai.id]: { pan, tilt, zoom },
      };
    });
  };

  const handlePreset = (num: number) => {
    if (!cameraHienTai.ptzCapable || cameraHienTai.status === "OFFLINE") return;

    // Preset coordinates mock
    const presets: Record<number, { pan: number; tilt: number; zoom: number }> =
      {
        1: { pan: -30, tilt: 10, zoom: 1.5 },
        2: { pan: 30, tilt: -10, zoom: 2.0 },
        3: { pan: 0, tilt: 20, zoom: 1.2 },
        4: { pan: -60, tilt: -20, zoom: 2.5 },
      };

    const target = presets[num] || { pan: 0, tilt: 0, zoom: 1 };

    setPtzState((prev) => ({
      ...prev,
      [cameraHienTai.id]: target,
    }));

    showNoti(
      "info",
      `Đã chuyển camera sang Preset ${num} (Pan: ${target.pan}°, Tilt: ${target.tilt}°, Zoom: ${target.zoom}x)`,
    );
  };

  const handleOtherAction = (
    actionType:
      | "AUTO_SCAN"
      | "WIDE_VIEW"
      | "FOCUS_NEAR"
      | "FOCUS_FAR"
      | "PTZ_SETTINGS",
  ) => {
    if (!cameraHienTai.ptzCapable || cameraHienTai.status === "OFFLINE") return;

    switch (actionType) {
      case "AUTO_SCAN":
        if (isScanning) {
          setIsScanning(false);
          if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
          }
          showNoti("info", "Đã dừng chế độ tự động quét.");
        } else {
          setIsScanning(true);
          showNoti("info", "Bắt đầu chế độ tự động quét camera.");

          let direction = 1; // 1: right, -1: left
          scanIntervalRef.current = setInterval(() => {
            setPtzState((prev) => {
              const state = prev[cameraHienTai.id] || {
                pan: 0,
                tilt: 0,
                zoom: 1,
              };
              let { pan, tilt, zoom } = state;
              pan += direction * 15;
              if (pan >= 90) {
                pan = 90;
                direction = -1;
              } else if (pan <= -90) {
                pan = -90;
                direction = 1;
              }
              return {
                ...prev,
                [cameraHienTai.id]: { pan, tilt, zoom },
              };
            });
          }, 1000);
        }
        break;
      case "WIDE_VIEW":
        setPtzState((prev) => ({
          ...prev,
          [cameraHienTai.id]: { pan: 0, tilt: 0, zoom: 1.0 },
        }));
        showNoti("info", "Đã thiết lập góc nhìn rộng (Zoom 1.0x).");
        break;
      case "FOCUS_NEAR":
        showNoti("success", "Đã lấy nét đối tượng ở gần thành công.");
        break;
      case "FOCUS_FAR":
        showNoti("success", "Đã lấy nét đối tượng ở xa thành công.");
        break;
      case "PTZ_SETTINGS":
        showNoti("info", "Đang mở bảng cấu hình cài đặt PTZ...");
        break;
    }
  };

  // Chụp ảnh màn hình camera hiện tại
  const runSnapshot = (
    camId: string,
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `CCTV_Snapshot_${camId}_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.png`;
    link.href = dataUrl;
    link.click();
    showNoti("success", t("snapshotSuccess"));
  };

  return (
    <Box className="camera-page-container">
      {/* Tiêu đề trang */}
      <div className="camera-header-row">
        <Title className="camera-page-title" order={2}>
          {t("title")}
        </Title>
        <Group gap="xs">
          <Badge
            color="green"
            variant="light"
            size="lg"
            radius="md"
            leftSection={<span className="pulse-indicator" />}
          >
            {DANH_SACH_CAM_MOCK.filter((c) => c.status === "ONLINE").length}/
            {DANH_SACH_CAM_MOCK.length} {t("online")}
          </Badge>
          <div className="layout-btn-group">
            <Tooltip label={t("grid1")}>
              <ActionIcon
                variant={cheDoGrid === "SINGLE" ? "filled" : "light"}
                color={cheDoGrid === "SINGLE" ? "blue" : "gray"}
                onClick={() => setCheDoGrid("SINGLE")}
                size="lg"
              >
                <IconSquare size={20} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={t("grid4")}>
              <ActionIcon
                variant={cheDoGrid === "GRID_4" ? "filled" : "light"}
                color={cheDoGrid === "GRID_4" ? "blue" : "gray"}
                onClick={() => setCheDoGrid("GRID_4")}
                size="lg"
              >
                <IconLayoutGrid size={20} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={t("grid9")}>
              <ActionIcon
                variant={cheDoGrid === "GRID_9" ? "filled" : "light"}
                color={cheDoGrid === "GRID_9" ? "blue" : "gray"}
                onClick={() => setCheDoGrid("GRID_9")}
                size="lg"
              >
                <IconGridDots size={20} />
              </ActionIcon>
            </Tooltip>
          </div>
        </Group>
      </div>

      <Grid gutter="md">
        {/* Cột trái: Bộ lọc và danh sách camera */}
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Card
            withBorder
            radius="lg"
            p="md"
            className="camera-sidebar-card shadow-sm"
          >
            <div className="camera-sidebar-inner">
              <Text
                fw={700}
                fz="md"
                c="#1f5ca9"
                className="sidebar-section-title"
                mb="md"
              >
                {t("cameraList")}
              </Text>

              <Stack gap="xs">
                <TextInput
                  placeholder={t("searchCam")}
                  leftSection={<IconSearch size={16} />}
                  value={tuKhoa}
                  onChange={(e) => setTuKhoa(e.target.value)}
                  radius="md"
                />

                <Select
                  data={[
                    { value: "ALL", label: t("allAreas") },
                    { value: "KHU_A", label: "Ký túc xá Khu A" },
                    { value: "KHU_B", label: "Ký túc xá Khu B" },
                    { value: "KHU_C", label: "Ký túc xá Khu C" },
                  ]}
                  value={khuVuc}
                  onChange={(val) => setKhuVuc(val)}
                  radius="md"
                />

                <ScrollArea
                  h={{ base: 300, md: 620 }}
                  scrollbarSize={6}
                  offsetScrollbars
                >
                  <Stack gap={6} pr={5}>
                    {danhSachCamLoc.map((cam) => {
                      const isSelected =
                        cheDoGrid === "SINGLE" && cameraHienTai.id === cam.id;
                      const isOffline = cam.status === "OFFLINE";
                      return (
                        <div
                          key={cam.id}
                          onClick={() => {
                            if (cheDoGrid !== "SINGLE") {
                              setCheDoGrid("SINGLE");
                            }
                            setCameraHienTai(cam);
                          }}
                          className={`camera-list-item ${isSelected ? "active" : ""} ${isOffline ? "offline" : ""}`}
                        >
                          <div className="cam-thumbnail-mock">
                            {isOffline ? (
                              <IconVideoOff size={18} color="#94a3b8" />
                            ) : (
                              <IconVideo size={18} color="#1f5ca9" />
                            )}
                            <div className="cam-scanline" />
                          </div>
                          <div className="cam-info">
                            <Text
                              fw={650}
                              fz={12}
                              className="cam-name text-truncate"
                            >
                              {cam.name}
                            </Text>
                            <Group gap="xs" mt={1}>
                              <Text fz={10} c="dimmed">
                                IP: {cam.ip}
                              </Text>
                              <Badge
                                color={isOffline ? "red" : "green"}
                                variant="dot"
                                size="xs"
                                p={0}
                                styles={{
                                  root: {
                                    background: "transparent",
                                    border: 0,
                                  },
                                }}
                              >
                                {isOffline ? t("offline") : t("online")}
                              </Badge>
                            </Group>
                          </div>
                        </div>
                      );
                    })}
                    {danhSachCamLoc.length === 0 && (
                      <Text c="dimmed" fz="sm" ta="center" py="xl">
                        Không tìm thấy camera phù hợp
                      </Text>
                    )}
                  </Stack>
                </ScrollArea>
              </Stack>
            </div>
          </Card>
        </Grid.Col>

        {/* Cột phải: Khung xem camera và bảng điều khiển */}
        <Grid.Col span={{ base: 12, md: 9 }}>
          {cheDoGrid === "SINGLE" ? (
            // CHẾ ĐỘ 1 CAMERA
            <Stack gap="md">
              <Card
                className="player-wrapper-card"
                withBorder
                p={0}
                radius="xl"
              >
                <Box className="player-container">
                  <SurveillanceFeed
                    camera={cameraHienTai}
                    aiOverlay={aiOverlay}
                    pan={ptzState[cameraHienTai.id]?.pan || 0}
                    tilt={ptzState[cameraHienTai.id]?.tilt || 0}
                    zoom={ptzState[cameraHienTai.id]?.zoom || 1}
                    onSnapshot={(ref) => runSnapshot(cameraHienTai.id, ref)}
                  />
                </Box>
              </Card>

              {/* Điều khiển Camera */}
              <Card
                withBorder
                radius="lg"
                p="md"
                className="ptz-control-panel-card"
              >
                <Text
                  fw={700}
                  fz={14}
                  c="#1f5ca9"
                  style={{
                    fontFamily: "var(--font-k2d)",
                    textTransform: "uppercase",
                    borderBottom: "1px solid #e2e8f0",
                    paddingBottom: "8px",
                    marginBottom: "12px",
                  }}
                >
                  {t("ptzControl") || "Bảng điều khiển"}{" "}
                  {cameraHienTai.ptzCapable ? "" : " (Không hỗ trợ PTZ)"}
                </Text>
                <Group
                  gap={0}
                  wrap="nowrap"
                  justify="space-between"
                  className="ptz-horizontal-layout"
                >
                  {/* Left Column: Joystick */}
                  <div className="ptz-section joystick-section">
                    <Box
                      className={`joystick-pad ${!cameraHienTai.ptzCapable || cameraHienTai.status === "OFFLINE" ? "disabled" : ""}`}
                    >
                      <ActionIcon
                        className="ptz-btn up"
                        variant="transparent"
                        onClick={() => handlePtz("UP")}
                        disabled={
                          !cameraHienTai.ptzCapable ||
                          cameraHienTai.status === "OFFLINE"
                        }
                      >
                        <IconChevronUp size={16} />
                      </ActionIcon>
                      <ActionIcon
                        className="ptz-btn left"
                        variant="transparent"
                        onClick={() => handlePtz("LEFT")}
                        disabled={
                          !cameraHienTai.ptzCapable ||
                          cameraHienTai.status === "OFFLINE"
                        }
                      >
                        <IconChevronLeft size={16} />
                      </ActionIcon>
                      <ActionIcon
                        className="ptz-btn reset"
                        variant="transparent"
                        onClick={() => handlePtz("RESET")}
                        disabled={
                          !cameraHienTai.ptzCapable ||
                          cameraHienTai.status === "OFFLINE"
                        }
                      >
                        <IconHome size={16} />
                      </ActionIcon>
                      <ActionIcon
                        className="ptz-btn right"
                        variant="transparent"
                        onClick={() => handlePtz("RIGHT")}
                        disabled={
                          !cameraHienTai.ptzCapable ||
                          cameraHienTai.status === "OFFLINE"
                        }
                      >
                        <IconChevronRight size={16} />
                      </ActionIcon>
                      <ActionIcon
                        className="ptz-btn down"
                        variant="transparent"
                        onClick={() => handlePtz("DOWN")}
                        disabled={
                          !cameraHienTai.ptzCapable ||
                          cameraHienTai.status === "OFFLINE"
                        }
                      >
                        <IconChevronDown size={16} />
                      </ActionIcon>
                    </Box>
                  </div>

                  {/* Middle Column: Zoom and Presets */}
                  <div className="ptz-section zoom-preset-section">
                    {/* Zoom Buttons Row */}
                    <Group gap="sm" mb="xs" grow>
                      <Button
                        variant="outline"
                        size="xs"
                        radius="xl"
                        className="zoom-action-btn"
                        leftSection={<IconZoomOut size={16} />}
                        onClick={() => handlePtz("ZOOM_OUT")}
                        disabled={
                          !cameraHienTai.ptzCapable ||
                          cameraHienTai.status === "OFFLINE"
                        }
                      >
                        {t("zoomOut") || "Thu nhỏ"}
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        radius="xl"
                        className="zoom-action-btn"
                        leftSection={<IconZoomIn size={16} />}
                        onClick={() => handlePtz("ZOOM_IN")}
                        disabled={
                          !cameraHienTai.ptzCapable ||
                          cameraHienTai.status === "OFFLINE"
                        }
                      >
                        {t("zoomIn") || "Phóng to"}
                      </Button>
                    </Group>

                    {/* Presets Row */}
                    <Group gap="xs" justify="center">
                      {[1, 2, 3, 4].map((num) => (
                        <div key={num} className="preset-item-wrapper">
                          <Button
                            variant="subtle"
                            className="preset-btn"
                            disabled={
                              !cameraHienTai.ptzCapable ||
                              cameraHienTai.status === "OFFLINE"
                            }
                            onClick={() => handlePreset(num)}
                          >
                            P{num}
                          </Button>
                          <Text
                            fz={10}
                            c="dimmed"
                            ta="center"
                            className="preset-label"
                          >
                            Preset {num}
                          </Text>
                        </div>
                      ))}
                    </Group>
                  </div>

                  {/* Divider */}
                  <div className="ptz-divider" />

                  {/* Right Column: Other Controls */}
                  <div className="ptz-section other-controls-section">
                    <Text
                      fw={700}
                      fz={13}
                      c="#1f5ca9"
                      className="other-controls-title"
                      mb="xs"
                    >
                      {t("otherControl") || "ĐIỀU KHIỂN KHÁC"}
                    </Text>
                    <Group gap="md" justify="start">
                      <div className="other-btn-wrapper">
                        <ActionIcon
                          variant="subtle"
                          className="other-control-btn"
                          disabled={
                            !cameraHienTai.ptzCapable ||
                            cameraHienTai.status === "OFFLINE"
                          }
                          onClick={() => handleOtherAction("AUTO_SCAN")}
                        >
                          <IconRotateDot size={20} />
                        </ActionIcon>
                        <Text
                          fz={9.5}
                          c="dimmed"
                          ta="center"
                          className="other-btn-label"
                        >
                          Tự động quét
                        </Text>
                      </div>

                      <div className="other-btn-wrapper">
                        <ActionIcon
                          variant="subtle"
                          className="other-control-btn"
                          disabled={
                            !cameraHienTai.ptzCapable ||
                            cameraHienTai.status === "OFFLINE"
                          }
                          onClick={() => handleOtherAction("WIDE_VIEW")}
                        >
                          <IconScan size={20} />
                        </ActionIcon>
                        <Text
                          fz={9.5}
                          c="dimmed"
                          ta="center"
                          className="other-btn-label"
                        >
                          Góc nhìn rộng
                        </Text>
                      </div>

                      <div className="other-btn-wrapper">
                        <ActionIcon
                          variant="subtle"
                          className="other-control-btn"
                          disabled={
                            !cameraHienTai.ptzCapable ||
                            cameraHienTai.status === "OFFLINE"
                          }
                          onClick={() => handleOtherAction("FOCUS_NEAR")}
                        >
                          <IconFocus2 size={20} />
                        </ActionIcon>
                        <Text
                          fz={9.5}
                          c="dimmed"
                          ta="center"
                          className="other-btn-label"
                        >
                          Lấy nét gần
                        </Text>
                      </div>

                      <div className="other-btn-wrapper">
                        <ActionIcon
                          variant="subtle"
                          className="other-control-btn"
                          disabled={
                            !cameraHienTai.ptzCapable ||
                            cameraHienTai.status === "OFFLINE"
                          }
                          onClick={() => handleOtherAction("FOCUS_FAR")}
                        >
                          <IconFocus size={20} />
                        </ActionIcon>
                        <Text
                          fz={9.5}
                          c="dimmed"
                          ta="center"
                          className="other-btn-label"
                        >
                          Lấy nét xa
                        </Text>
                      </div>
                    </Group>
                  </div>
                </Group>
              </Card>
            </Stack>
          ) : (
            // CHẾ ĐỘ NHIỀU CAMERA (GRID VIEW)
            <Grid gutter="sm">
              {(cheDoGrid === "GRID_4" ? grid4Cams : grid9Cams).map(
                (camId, index) => {
                  const cam =
                    DANH_SACH_CAM_MOCK.find((c) => c.id === camId) ||
                    DANH_SACH_CAM_MOCK[0];
                  return (
                    <Grid.Col
                      span={cheDoGrid === "GRID_4" ? 6 : 4}
                      key={`${camId}-${index}`}
                    >
                      <Card
                        withBorder
                        p={0}
                        radius="md"
                        className="grid-player-card"
                        onClick={() => {
                          setCameraHienTai(cam);
                          setCheDoGrid("SINGLE");
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <Box
                          style={{
                            height: cheDoGrid === "GRID_4" ? "200px" : "140px",
                            position: "relative",
                          }}
                        >
                          <SurveillanceFeed
                            camera={cam}
                            aiOverlay={aiOverlay}
                            pan={0}
                            tilt={0}
                            zoom={1}
                            miniGrid={true}
                          />
                          {/* Nút mở rộng camera (Expand overlay) */}
                          <div
                            className="grid-expand-btn-wrapper"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Tooltip label={t("expand")}>
                              <ActionIcon
                                variant="filled"
                                color="blue"
                                onClick={() => {
                                  setCameraHienTai(cam);
                                  setCheDoGrid("SINGLE");
                                }}
                              >
                                <IconMaximize size={12} />
                              </ActionIcon>
                            </Tooltip>
                          </div>
                        </Box>
                        <div
                          className="grid-player-footer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Select
                            size="xs"
                            data={DANH_SACH_CAM_MOCK.map((c) => ({
                              value: c.id,
                              label: c.name,
                            }))}
                            value={cam.id}
                            onChange={(newVal) => {
                              if (newVal) {
                                if (cheDoGrid === "GRID_4") {
                                  setGrid4Cams((prev) => {
                                    const next = [...prev];
                                    next[index] = newVal;
                                    return next;
                                  });
                                } else {
                                  setGrid9Cams((prev) => {
                                    const next = [...prev];
                                    next[index] = newVal;
                                    return next;
                                  });
                                }
                              }
                            }}
                            className="grid-camera-select"
                            comboboxProps={{ withinPortal: false }}
                            styles={{
                              input: {
                                fontWeight: 650,
                                fontSize: "11px",
                                backgroundColor: "transparent",
                                color: "#e2e8f0",
                                border: "none",
                                paddingLeft: 0,
                                height: "22px",
                                minHeight: "22px",
                                cursor: "pointer",
                              },
                            }}
                          />
                        </div>
                      </Card>
                    </Grid.Col>
                  );
                },
              )}
            </Grid>
          )}
        </Grid.Col>
      </Grid>

      {/* Embedded CSS for Styling */}
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
    </Box>
  );
}

// Canvas-based Surveillance Feed Player Component
interface FeedProps {
  camera: CameraItem;
  aiOverlay: boolean;
  pan: number;
  tilt: number;
  zoom: number;
  miniGrid?: boolean;
  onSnapshot?: (canvasRef: React.RefObject<HTMLCanvasElement | null>) => void;
  onExpand?: () => void;
}

function SurveillanceFeed({
  camera,
  aiOverlay,
  pan,
  tilt,
  zoom,
  miniGrid = false,
  onSnapshot,
  onExpand,
}: FeedProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const objectsRef = useRef<MovingObject[]>([]);
  const requestRef = useRef<number | null>(null);
  const timeSecRef = useRef<string>("");

  const isOffline = camera.status === "OFFLINE";

  // Khởi tạo các vật thể di chuyển (người, xe) khi thay đổi camera
  useEffect(() => {
    if (isOffline) {
      objectsRef.current = [];
      return;
    }

    const objects: MovingObject[] = [];
    const count = camera.type === "Nhà xe" ? 2 : 3;

    for (let i = 0; i < count; i++) {
      const type =
        camera.type === "Nhà xe" && Math.random() > 0.4 ? "vehicle" : "person";
      const isStr = Math.random() < 0.25;

      let label = "";
      let color = "#22c55e"; // xanh lá: Sinh viên hợp lệ

      if (type === "vehicle") {
        label = BIEN_SO_XE[Math.floor(Math.random() * BIEN_SO_XE.length)];
        color = "#eab308"; // vàng: Phương tiện
      } else if (isStr) {
        label = "NGƯỜI LẠ (Nghi vấn)";
        color = "#ef4444"; // đỏ: Người lạ
      } else {
        const randIdx = Math.floor(Math.random() * TEN_SINH_VIEN.length);
        label = `${TEN_SINH_VIEN[randIdx]} (${MSSV_MOCK[randIdx]})`;
      }

      objects.push({
        x: Math.random() * 400 + 100,
        y: Math.random() * 200 + 100,
        vx: (Math.random() * 0.8 + 0.4) * (Math.random() > 0.5 ? 1 : -1),
        vy: (Math.random() * 0.4 + 0.2) * (Math.random() > 0.5 ? 1 : -1),
        type,
        label,
        isStranger: isStr,
        color,
      });
    }

    objectsRef.current = objects;
  }, [camera.id, isOffline, camera.type]);

  // Vòng lặp vẽ Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width;
    let height = canvas.height;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      // Đặt kích thước phân giải thực tế bằng 2 lần kích thước hiển thị để vẽ nét hơn
      canvas.width = rect.width * 1.5 || 600;
      canvas.height = rect.height * 1.5 || 340;
      width = canvas.width;
      height = canvas.height;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let recDotBlink = true;
    let blinkCounter = 0;

    const render = () => {
      // 1. Xử lý màn hình OFFLINE
      if (isOffline) {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, width, height);

        // Hiệu ứng nhiễu tuyết tivi mất tín hiệu
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        for (let i = 0; i < 500; i++) {
          const rx = Math.random() * width;
          const ry = Math.random() * height;
          const rs = Math.random() * 2 + 1;
          ctx.fillRect(rx, ry, rs, rs);
        }

        ctx.fillStyle = "#ef4444";
        ctx.font = `bold ${miniGrid ? "14px" : "20px"} var(--font-k2d), sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("NO SIGNAL / OFFLINE", width / 2, height / 2 - 10);

        ctx.fillStyle = "#94a3b8";
        ctx.font = `${miniGrid ? "10px" : "12px"} var(--font-readex-pro), sans-serif`;
        ctx.fillText(`CAMERA IP: ${camera.ip}`, width / 2, height / 2 + 15);

        requestRef.current = requestAnimationFrame(render);
        return;
      }

      // 2. Xử lý hoạt hình vẽ camera cảnh nền
      ctx.fillStyle = "#0b1329"; // xanh đen đậm
      ctx.fillRect(0, 0, width, height);

      // Cập nhật vị trí các vật thể di chuyển
      objectsRef.current.forEach((obj) => {
        obj.x += obj.vx;
        obj.y += obj.vy;

        // Va chạm biên, đảo hướng
        if (obj.x < 50 || obj.x > width - 50) obj.vx *= -1;
        if (obj.y < 50 || obj.y > height - 50) obj.vy *= -1;
      });

      // BẮT ĐẦU TRANSLATION PTZ
      ctx.save();
      // Điểm tâm thu phóng
      ctx.translate(width / 2, height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-width / 2 + pan * 1.5, -height / 2 + tilt * 1.5);

      // Vẽ các khối nhà ký túc xá tĩnh (phông nền giả lập)
      ctx.strokeStyle = "rgba(30, 41, 59, 0.8)";
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, width - 80, height - 80);

      // Vẽ vạch kẻ đường/hành lang
      ctx.strokeStyle = "rgba(71, 85, 105, 0.3)";
      ctx.lineWidth = 1;
      if (camera.type === "Hành lang") {
        // Vẽ phối cảnh hành lang
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(width * 0.35, height * 0.45);
        ctx.lineTo(width * 0.65, height * 0.45);
        ctx.lineTo(width, height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(width * 0.35, height * 0.3);
        ctx.lineTo(width * 0.65, height * 0.3);
        ctx.lineTo(width, 0);
        ctx.stroke();
      } else if (camera.type === "Nhà xe") {
        // Vạch kẻ ô đỗ xe
        for (let i = 80; i < width - 80; i += 120) {
          ctx.strokeRect(i, height - 120, 100, 110);
        }
      } else {
        // Cổng chính
        ctx.fillStyle = "rgba(15, 23, 42, 0.4)";
        ctx.fillRect(width * 0.15, height * 0.3, width * 0.7, height * 0.6);
        ctx.strokeStyle = "rgba(51, 65, 85, 0.8)";
        ctx.lineWidth = 3;
        ctx.strokeRect(width * 0.15, height * 0.3, width * 0.7, height * 0.6);
      }

      // Vẽ các vật thể di chuyển & AI bounding box
      objectsRef.current.forEach((obj) => {
        // Vẽ chấm/khối biểu diễn
        ctx.fillStyle = obj.color;
        ctx.beginPath();
        if (obj.type === "vehicle") {
          ctx.fillRect(obj.x - 20, obj.y - 12, 40, 24);
        } else {
          ctx.arc(obj.x, obj.y, 8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Vẽ AI Bounding Box nếu bật overlay
        if (aiOverlay) {
          ctx.strokeStyle = obj.color;
          ctx.lineWidth = 2;
          const boxW = obj.type === "vehicle" ? 60 : 34;
          const boxH = obj.type === "vehicle" ? 44 : 54;
          const bx = obj.type === "vehicle" ? obj.x - 30 : obj.x - 17;
          const by = obj.type === "vehicle" ? obj.y - 22 : obj.y - 45;

          ctx.strokeRect(bx, by, boxW, boxH);

          // Nhãn AI bên trên box
          ctx.fillStyle = obj.color;
          ctx.font = `bold ${miniGrid ? "8px" : "11px"} var(--font-readex-pro), sans-serif`;
          ctx.textAlign = "left";
          ctx.fillText(obj.label, bx, by - 6);

          // Confidence score giả lập
          const confidence = obj.isStranger ? "94.6%" : "98.2%";
          ctx.font = `${miniGrid ? "6px" : "9px"} var(--font-mono), monospace`;
          ctx.fillText(`CONF: ${confidence}`, bx, by + boxH + 11);
        }
      });

      ctx.restore();
      // KẾT THÚC TRANSLATION PTZ

      // 3. Vẽ HUD tĩnh (các thông số đè phía trên, không pan/zoom)
      blinkCounter++;
      if (blinkCounter % 30 === 0) {
        recDotBlink = !recDotBlink;
      }

      // Blinking Live indicator
      if (recDotBlink) {
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(
          miniGrid ? 16 : 28,
          miniGrid ? 16 : 28,
          miniGrid ? 3 : 6,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${miniGrid ? "9px" : "13px"} var(--font-k2d), sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText("LIVE", miniGrid ? 26 : 42, miniGrid ? 20 : 32);

      // Tên Camera và IP
      ctx.font = `${miniGrid ? "8px" : "11px"} var(--font-mono), monospace`;
      ctx.fillText(
        `CAM: ${camera.id.toUpperCase()}`,
        miniGrid ? 12 : 24,
        height - (miniGrid ? 26 : 38),
      );
      ctx.fillText(
        `IP: ${camera.ip}`,
        miniGrid ? 12 : 24,
        height - (miniGrid ? 14 : 20),
      );

      // Thời gian thực
      const now = new Date();
      const formatTime =
        now.toISOString().replace("T", " ").slice(0, 19) +
        "." +
        String(now.getMilliseconds()).padStart(3, "0");
      timeSecRef.current = formatTime;
      ctx.textAlign = "right";
      ctx.fillText(
        formatTime,
        width - (miniGrid ? 12 : 24),
        miniGrid ? 20 : 32,
      );

      // Bitrate & FPS & PTZ
      const simulatedBitrate = (
        3500 +
        Math.sin(Date.now() / 1000) * 450
      ).toFixed(0);
      ctx.fillText(
        `30.0 FPS | ${simulatedBitrate} kbps`,
        width - (miniGrid ? 12 : 24),
        height - (miniGrid ? 26 : 38),
      );
      if (camera.ptzCapable) {
        ctx.fillText(
          `PTZ: H:${pan}° V:${tilt}° Z:${zoom}x`,
          width - (miniGrid ? 12 : 24),
          height - (miniGrid ? 14 : 20),
        );
      } else {
        ctx.fillText(
          `PTZ: FIXED`,
          width - (miniGrid ? 12 : 24),
          height - (miniGrid ? 14 : 20),
        );
      }

      // Vẽ crosshair (tâm ngắm camera) ở chính giữa
      if (!miniGrid) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Ngang
        ctx.moveTo(width / 2 - 20, height / 2);
        ctx.lineTo(width / 2 + 20, height / 2);
        // Dọc
        ctx.moveTo(width / 2, height / 2 - 20);
        ctx.lineTo(width / 2, height / 2 + 20);
        ctx.stroke();
      }

      requestRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [camera.id, isOffline, aiOverlay, pan, tilt, zoom, miniGrid]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />

      {/* Snapshot/Expand overlay buttons inside player */}
      {!miniGrid && (
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            right: "24px",
            zIndex: 10,
          }}
        >
          <Group gap="xs">
            {!isOffline && onSnapshot && (
              <Tooltip label="Chụp ảnh màn hình camera">
                <ActionIcon
                  variant="filled"
                  color="blue"
                  size="md"
                  onClick={() => onSnapshot && onSnapshot(canvasRef)}
                >
                  <IconCamera size={16} />
                </ActionIcon>
              </Tooltip>
            )}
            {onExpand && (
              <Tooltip label="Mở rộng toàn màn hình">
                <ActionIcon
                  variant="filled"
                  color="blue"
                  size="md"
                  onClick={() => onExpand()}
                >
                  <IconMaximize size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </div>
      )}
    </div>
  );
}

// Custom CSS for stunning dashboard look
const pageStyles = `
.camera-page-container {
    padding: 1.5rem;
    min-height: 85vh;
    font-family: var(--font-readex-pro), sans-serif;
}

.camera-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 12px;
}

.camera-page-title {
    font-family: var(--font-k2d), sans-serif;
    color: #1f5ca9;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: -0.01em;
    margin: 0;
}

.layout-btn-group {
    display: flex;
    background-color: #f1f5f9;
    padding: 3px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}

.camera-sidebar-card {
    background: #ffffff !important;
}

.camera-sidebar-inner {
    zoom: 0.9;
}

.sidebar-section-title {
    font-family: var(--font-k2d), sans-serif;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    border-bottom: 2px solid #e0f2fe;
    padding-bottom: 8px;
}

.pulse-indicator {
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: #22c55e;
    border-radius: 50%;
    margin-right: 4px;
    animation: pulseGlow 1.5s infinite;
}

@keyframes pulseGlow {
    0% {
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
    }
    70% {
        box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
    }
}

/* Camera items in sidebar */
.camera-list-item {
    display: flex;
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid #f1f5f9;
    background-color: #fcfdff;
    cursor: pointer;
    transition: all 0.2s ease;
    align-items: center;
    gap: 8px;
}

.camera-list-item:hover {
    background-color: #f0f7ff;
    border-color: #bfdbfe;
    transform: translateY(-1px);
}

.camera-list-item.active {
    background-color: rgba(31, 92, 169, 0.08);
    border-color: #1f5ca9;
}

.camera-list-item.offline {
    opacity: 0.65;
}

.cam-thumbnail-mock {
    width: 38px;
    height: 30px;
    background-color: #f1f5f9;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
    border: 1px solid #e2e8f0;
}

.cam-scanline {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: rgba(31, 92, 169, 0.15);
    animation: scanAnimation 2s infinite linear;
}

@keyframes scanAnimation {
    0% { top: 0; }
    100% { top: 100%; }
}

.cam-info {
    flex-grow: 1;
    min-width: 0;
}

.cam-name {
    color: #334155;
    margin: 0;
}

/* Player layout styling */
.player-wrapper-card {
    background: #090d16 !important;
    border-color: #1e293b !important;
    overflow: hidden;
}

.player-container {
    width: 100%;
    aspect-ratio: 16/9;
    background-color: #000000;
}

/* PTZ Controller Card */
.ptz-control-panel-card {
    background-color: #ffffff !important;
    border-color: #e2e8f0 !important;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05) !important;
}

.ptz-horizontal-layout {
    width: 100%;
}

.ptz-section {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.joystick-section {
    padding-right: 0.75rem;
}

/* D-Pad Styling */
.joystick-pad {
    position: relative;
    width: 96px;
    height: 96px;
    background-color: #f8fafc;
    border-radius: 50%;
    border: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.02);
}

.joystick-pad.disabled {
    opacity: 0.5;
    pointer-events: none;
}

.ptz-btn {
    position: absolute;
    width: 24px !important;
    height: 24px !important;
    padding: 0 !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    color: #1e3a8a !important;
    transition: all 0.15s ease !important;
    min-width: 0 !important;
    min-height: 0 !important;
}

.ptz-btn:not(.reset) {
    background-color: #eff6ff !important;
    border: 1px solid #dbeafe !important;
}

.ptz-btn:not(.reset):hover:not(:disabled) {
    background-color: #dbeafe !important;
    color: #1d4ed8 !important;
    transform: scale(1.05);
}

.ptz-btn.up { top: 4px; left: 36px; }
.ptz-btn.left { top: 36px; left: 4px; }
.ptz-btn.right { top: 36px; right: 4px; }
.ptz-btn.down { bottom: 4px; left: 36px; }

.ptz-btn.reset {
    top: 36px;
    left: 36px;
    width: 24px !important;
    height: 24px !important;
    background-color: #ffffff !important;
    border: 1px solid #cbd5e1 !important;
    border-radius: 6px !important;
    box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05) !important;
}

.ptz-btn.reset:hover:not(:disabled) {
    background-color: #f1f5f9 !important;
    color: #1e3a8a !important;
}

/* Zoom and Preset Section */
.zoom-preset-section {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    min-width: 190px;
}

.zoom-action-btn {
    border-color: #cbd5e1 !important;
    color: #334155 !important;
    font-weight: 500 !important;
    background-color: #ffffff !important;
    height: 28px !important;
    font-size: 10px !important;
    padding: 0 8px !important;
    min-width: 0 !important;
    transition: all 0.2s ease !important;
}

.zoom-action-btn:hover:not(:disabled) {
    background-color: #f8fafc !important;
    border-color: #94a3b8 !important;
}

.preset-item-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
}

.preset-btn {
    width: 34px !important;
    height: 32px !important;
    min-width: 34px !important;
    background-color: #f8fafc !important;
    border: 1px solid #e2e8f0 !important;
    color: #1f5ca9 !important;
    font-weight: 700 !important;
    font-size: 12px !important;
    border-radius: 6px !important;
    padding: 0 !important;
    transition: all 0.2s ease !important;
}

.preset-btn:hover:not(:disabled) {
    background-color: #eff6ff !important;
    border-color: #bfdbfe !important;
    color: #1d4ed8 !important;
}

.preset-label {
    font-size: 8px !important;
    font-weight: 500;
    color: #64748b;
}

/* Divider styling */
.ptz-divider {
    width: 1px;
    align-self: stretch;
    background-color: #e2e8f0;
    margin: 0 0.5rem;
}

/* Other Controls Section */
.other-controls-section {
    flex-grow: 1;
    padding-left: 0.25rem;
}

.other-controls-title {
    font-family: var(--font-k2d), sans-serif;
    letter-spacing: 0.05em;
    color: #1f5ca9 !important;
    margin-bottom: 6px !important;
    font-size: 12px !important;
}

.other-btn-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    width: 60px;
}

.other-control-btn {
    width: 36px !important;
    height: 32px !important;
    min-width: 36px !important;
    background-color: #f8fafc !important;
    border: 1px solid #e2e8f0 !important;
    color: #1f5ca9 !important;
    border-radius: 6px !important;
    padding: 0 !important;
    transition: all 0.2s ease !important;
}

.other-control-btn:hover:not(:disabled) {
    background-color: #eff6ff !important;
    border-color: #bfdbfe !important;
    color: #1d4ed8 !important;
}

.other-btn-label {
    font-size: 8.5px !important;
    font-weight: 500;
    color: #64748b;
    white-space: nowrap;
    text-align: center;
    width: 100%;
}

@media (max-width: 768px) {
    .ptz-horizontal-layout {
        flex-direction: column;
        gap: 1.5rem;
    }
    .ptz-divider {
        display: none;
    }
    .joystick-section {
        padding-right: 0;
        align-self: center;
    }
    .zoom-preset-section {
        padding-left: 0;
        padding-right: 0;
    }
    .other-controls-section {
        padding-left: 0;
    }
    .other-controls-title {
        text-align: center;
    }
    .other-controls-section > .mantine-Group-root {
        justify-content: center;
    }
}

/* Grid view items */
.grid-player-card {
    background-color: #090d16 !important;
    border-color: #1e293b !important;
    overflow: hidden;
    transition: all 0.2s ease;
}

.grid-player-card:hover {
    border-color: #1f5ca9 !important;
    transform: scale(1.015);
}

.grid-player-footer {
    padding: 6px 12px;
    background-color: #1e293b;
    border-top: 1px solid #334155;
}

.grid-player-footer .mantine-Text-root {
    color: #e2e8f0;
}

.grid-expand-btn-wrapper {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 10;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.grid-player-card:hover .grid-expand-btn-wrapper {
    opacity: 1;
}

.grid-camera-select {
    width: 100%;
}
`;
