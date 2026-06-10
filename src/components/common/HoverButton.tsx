// import { Button } from "@mantine/core";
// import React, { useState } from "react";

// interface HoverButtonProps {
//   color: string;
//   icon: React.ReactNode;
//   label: string;
//   onClick?: () => void;
//   width?: number; // tuỳ chỉnh nếu muốn
//   height?: number; // tuỳ chỉnh nếu muốn
// }

// export function HoverButton({
//   color,
//   icon,
//   label,
//   onClick,
//   width = 110,
//   height = 32,
// }: HoverButtonProps) {
//   const [hovered, setHovered] = useState(false);

//   return (
//     <Button
//       size="xs"
//       color={color}
//       variant="light"
//       radius="xl"
//       onClick={onClick}
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       // KHÔNG đổi width khi hover -> không reflow
//       styles={{ root: { width, height, paddingInline: 10 } }}
//     >
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: 6,
//           width: "100%",
//           // Chưa hover: icon ở giữa; Hover: icon + text căn trái
//           justifyContent: hovered ? "flex-start" : "center",
//           transition: "justify-content 0.2s ease",
//         }}
//       >
//         {/* Icon luôn chính giữa theo trục dọc */}
//         <span
//           style={{
//             display: "inline-flex",
//             alignItems: "center",
//             justifyContent: "center",
//             width: 16,
//             height: 16,
//           }}
//         >
//           {icon}
//         </span>

//         {/* Label mở/đóng mà KHÔNG thay đổi width của button */}
//         <span
//           style={{
//             overflow: "hidden",
//             whiteSpace: "nowrap",
//             maxWidth: hovered ? 80 : 0, // mở ra nhưng button vẫn rộng cố định
//             opacity: hovered ? 1 : 0,
//             transition: "max-width 0.2s ease, opacity 0.2s ease",
//           }}
//         >
//           {label}
//         </span>
//       </div>
//     </Button>
//   );
// }

// import { Button, Tooltip } from "@mantine/core";
// import React, { useState } from "react";

// interface HoverButtonProps {
//   color: string;
//   icon: React.ReactNode;
//   label: string;
//   onClick?: () => void;
//   width?: number;
//   height?: number;
// }

// export function HoverButton({
//   color,
//   icon,
//   label,
//   onClick,
//   width = 40, // giữ nhỏ để nhìn như icon button
//   height = 32,
// }: HoverButtonProps) {
//   const [hovered, setHovered] = useState(false);

//   return (
//     <Tooltip
//       label={label} // hiện tooltip khi hover
//       position="top" // vị trí trên
//       transitionProps={{ duration: 150 }}
//       withArrow
//       openDelay={200}
//     >
//       <Button
//         size="xs"
//         color={color}
//         variant="light"
//         radius="xl"
//         onClick={onClick}
//         onMouseEnter={() => setHovered(true)}
//         onMouseLeave={() => setHovered(false)}
//         styles={{
//           root: {
//             width,
//             height,
//             padding: 0,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//           },
//         }}
//       >
//         <span
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             width: 16,
//             height: 16,
//           }}
//         >
//           {icon}
//         </span>
//       </Button>
//     </Tooltip>
//   );
// }
import { Button, Tooltip } from "@mantine/core";
import React from "react";

interface HoverButtonProps {
  color: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  width?: number;
  height?: number;
}

export function HoverButton({
  color,
  icon,
  label,
  onClick,
  width = 40,
  height = 32,
}: HoverButtonProps) {
  return (
    <Tooltip
      label={label}
      position="top"
      withArrow
      openDelay={150}
      transitionProps={{ duration: 150 }}
      color={color} //   Tooltip nền cùng màu với nút
      styles={{
        tooltip: {
          backgroundColor: `var(--mantine-color-${color}-6)`, // đồng màu
          color: "white",
          fontSize: 12,
          fontWeight: 500,
          padding: "6px 10px",
          borderRadius: 8,
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        },
        arrow: {
          backgroundColor: `var(--mantine-color-${color}-6)`,
        },
      }}
    >
      <Button
        size="xs"
        color={color}
        variant="light"
        radius="xl"
        onClick={onClick}
        styles={{
          root: {
            width,
            height,
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
          },
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 0 8px rgba(0,0,0,0.12)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 16,
            height: 16,
          }}
        >
          {icon}
        </span>
      </Button>
    </Tooltip>
  );
}
