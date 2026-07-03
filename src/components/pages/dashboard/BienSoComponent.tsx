// /* eslint-disable prefer-const */
// "use client";

// import { Box } from "@mantine/core";

// type BienSoProps = {
//   value: string;
// };

// const getPlateBackground = (plate: string) => {
//   if (!plate) return "#ffffff";

//   const last = plate.trim().slice(-1).toLowerCase();

//   if (last === "x") return "#1556ceff"; // Xanh (biển xanh)
//   if (last === "v") return "#F2C94C"; // Vàng (biển vàng)
//   return "#ffffff"; // Trắng (biển trắng + T)
// };

// const getPlateTextColor = (plate: string) => {
//   if (!plate) return "#000";

//   const last = plate.trim().slice(-1).toLowerCase();
//   if (last === "x") return "#fff"; // biển xanh → chữ trắng
//   return "#000"; // còn lại → chữ đen
// };

// const formatBienSo = (plate: string) => {
//   if (!plate) return "";

//   // xoá tất cả ký tự không phải số hoặc chữ
//   let cleaned = plate.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

//   // ký tự cuối = T/V/X ?
//   const lastChar = cleaned.slice(-1);
//   const isSpecial = /[TVX]/i.test(lastChar);

//   // nếu special → bỏ ra để xử lý số cho đúng
//   let pure = isSpecial ? cleaned.slice(0, -1) : cleaned;

//   // ===== Xác định PREFIX =====
//   // 65G1xxx → prefix = 4 ký tự
//   // 65Gxxxx → prefix = 3 ký tự
//   let prefix = "";
//   let body = "";

//   if (/\d/.test(pure[2])) {
//     prefix = pure.slice(0, 4);
//     body = pure.slice(4);
//   } else {
//     prefix = pure.slice(0, 3);
//     body = pure.slice(3);
//   }

//   // ===== Format phần số =====
//   if (body.length === 3) {
//     // 999
//     return `${prefix}-${body}${isSpecial ? lastChar : ""}`;
//   }

//   if (body.length === 4) {
//     // 1234 → 12.34
//     return `${prefix}-${body.slice(0, 2)}.${body.slice(2)}${
//       isSpecial ? lastChar : ""
//     }`;
//   }

//   if (body.length === 5) {
//     // 44567 → 445.67
//     return `${prefix}-${body.slice(0, 3)}.${body.slice(3)}${
//       isSpecial ? lastChar : ""
//     }`;
//   }

//   // fallback
//   return cleaned;
// };

// export default function BienSoComponent({ value }: BienSoProps) {
//   const formatted = formatBienSo(value);

//   const bg = getPlateBackground(formatted);
//   const color = getPlateTextColor(formatted);

//   return (
//     <Box
//       className="plate-box"
//       style={{
//         width: 150,
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         padding: "8px 0",
//         background: bg,
//         color: color,
//         borderRadius: 8,
//         border: "2px solid #000",
//         fontWeight: 700,
//         fontSize: 16,
//         letterSpacing: "1px",
//         textTransform: "uppercase",
//         fontFamily: "Arial, sans-serif",
//         boxShadow: "0 2px 6px rgba(0,0,0,0.15), inset 0 0 2px rgba(0,0,0,0.25)",
//         userSelect: "none",
//       }}
//     >
//       {formatted}
//     </Box>
//   );
// }
/* eslint-disable prefer-const */
"use client";

import { Box } from "@mantine/core";

type BienSoProps = { value: string };

// =================== MÀU NỀN =====================
const getPlateBackground = (plate: string) => {
  if (!plate) return "#ffffff";
  const last = plate.trim().slice(-1).toLowerCase();
  if (last === "x") return "#1556ceff";
  if (last === "v") return "#F2C94C";
  return "#ffffff";
};

const getPlateTextColor = (plate: string) => {
  if (!plate) return "#000";
  const last = plate.trim().slice(-1).toLowerCase();
  if (last === "x") return "#fff";
  return "#000";
};

// =================== FORMAT BIỂN SỐ =====================
const formatBienSo = (plate: string) => {
  if (!plate) return "";
  let cleaned = plate.toUpperCase();
  return `${cleaned}`;
};

export default function BienSoComponent({ value }: BienSoProps) {
  const formatted = formatBienSo(value);
  const bg = getPlateBackground(formatted);
  const color = getPlateTextColor(formatted);

  return (
    <Box
      className="plate-box"
      style={{
        width: 160,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "8px 0",
        background: bg,
        color: color,
        borderRadius: 8,
        border: "2px solid #000",
        fontWeight: 700,
        fontSize: 16,
        letterSpacing: "1px",
        textTransform: "uppercase",
        fontFamily: "Arial, sans-serif",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15), inset 0 0 2px rgba(0,0,0,0.25)",
        userSelect: "none",
      }}
    >
      {formatted}
    </Box>
  );
}
