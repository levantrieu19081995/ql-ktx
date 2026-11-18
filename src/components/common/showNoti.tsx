// showNoti("success", "Đã thêm mới chủ phương tiện!");
// showNoti("error", "Có lỗi xảy ra khi lưu dữ liệu!");
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconInfoCircle,
} from "@tabler/icons-react";
import { GLOBAL_ERROR_NOTIFICATION_ID } from "@/constants/notification";

type NotiType = "success" | "error" | "warning" | "info";

export const showNoti = (type: NotiType, message: string) => {
  const config = {
    success: {
      color: "green",
      icon: <IconCheck size={20} />,
      title: "Thành công",
    },
    error: { color: "red", icon: <IconX size={20} />, title: "Lỗi" },
    warning: {
      color: "yellow",
      icon: <IconAlertTriangle size={20} />,
      title: "Cảnh báo",
    },
    info: {
      color: "blue",
      icon: <IconInfoCircle size={20} />,
      title: "Thông báo",
    },
  };

  const { title, color, icon } = config[type];

  notifications.show({
    id: type === "error" ? GLOBAL_ERROR_NOTIFICATION_ID : undefined,
    title,
    message,
    color,
    icon,
    autoClose: 2500,
    styles: {
      root: {
        borderLeft: `4px solid var(--mantine-color-${color}-filled)`,
        paddingLeft: 12,
      },
    },
  });
};
