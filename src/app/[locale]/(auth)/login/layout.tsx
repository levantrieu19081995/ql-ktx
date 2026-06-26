// src/app/(routes)/[locale]/login/layout.tsx

import DocomentMenu from "@/components/shell/DocomentMenu";
import LocaleSwitcher from "@/components/shell/LocaleSwitcher";
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(60rem 60rem at 80% -10%, rgba(90,164,231,.20), transparent),\
            radial-gradient(50rem 50rem at -10% 110%, rgba(226,67,62,.15), transparent),\
            #0b0f1a",
      }}
    >
      {/* Nút nổi góc phải */}
      {/* <LocaleSwitcher variant="floating" size={40} /> */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 1000,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 20, // khoảng cách 20px giữa 2 nút
          }}
        >
          <DocomentMenu />
          <LocaleSwitcher variant="inline" size={40} />
        </div>
      </div>

      {children}
    </div>
  );
}

// (tuỳ chọn)
export const metadata = {
  title: "Đăng nhập • Quản lý Ký túc xá",
  robots: { index: false },
};
