// src/app/layout.tsx
import { ReactNode } from "react";
import { Inter } from "next/font/google";
// import "./globals.css";
import "../styles/globals.css";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Quản lý ký túc xá",
  description: "A platform for Dang Kiem Viet Nam",
};

// export default function RootLayout({ children }: { children: ReactNode }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>{children}</body>
//     </html>
//   );
// }

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
