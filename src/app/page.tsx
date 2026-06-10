"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Chuyển hướng đến trang splashscreen khi người dùng vào trang '/'
    router.push("/splashscreen");
  }, [router]);

  return null; // Bạn có thể hiển thị trạng thái loading ở đây
}
