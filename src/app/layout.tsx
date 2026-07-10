import { ReactNode } from "react";
import "../styles/globals.css";

export const metadata = {
  title: "Quản lý Ký túc xá Đại học Cần Thơ",
  description: "Hệ thống quản lý Ký túc xá Đại học Cần Thơ",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
