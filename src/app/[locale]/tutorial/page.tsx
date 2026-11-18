// src/app/[locale]/tutorial/page.tsx
// Đặt ngoài nhóm (app) để mở được cả khi chưa đăng nhập (menu hướng dẫn ở trang đăng nhập).
import TutorialPage from "@/components/pages/tutorial/TutorialPage";

export const metadata = {
  title: "Hướng dẫn sử dụng • Quản lý Ký túc xá",
  robots: { index: false },
};

export default function Page() {
  return <TutorialPage />;
}
