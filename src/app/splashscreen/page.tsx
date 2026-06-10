"use client";
// src\app\splashscreen\page.tsx
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // Import for logo image
import logo from "@/assets/images/logo.png"; // Path to the logo image

const SplashScreen = () => {
  const router = useRouter();

  // useEffect(() => {
  //   document.body.style.margin = "0";
  //   document.body.style.padding = "0";
  //   document.documentElement.style.margin = "0";
  //   document.documentElement.style.padding = "0";
  // }, []);

  useEffect(() => {
    // Redirect to /vi/login after 3 seconds
    const timer = setTimeout(() => {
      // router.push("/vi/login");
      router.push("/vi/login");
    }, 1000); // Adjusted to 1 seconds
    return () => clearTimeout(timer); // Cleanup when the component is unmounted
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100dvh" /* chuẩn mới */,
        minHeight: "100vh" /* fallback */,
        width: "100vw", // thêm dòng này
        margin: 0, // thêm dòng này
        padding: 0, // thêm dòng này
        backgroundColor: "#00529b",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          marginBottom: "20px",
          padding: "20px",
          height: 150,
          width: 150,
          borderRadius: "50%",
          backgroundColor: "white",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* Logo */}
        <Image
          src={logo}
          alt="Đăng Kiểm Việt Nam Logo"
          width={150}
          height={150}
          priority
        />
      </div>

      <p style={{ fontSize: "16px", textAlign: "center" }}>
        Chào mừng đến với Đăng kiểm Việt Nam!
      </p>
      <p
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          textAlign: "center",
          marginTop: 20,
        }}
      >
        QUẢN LÝ ĐĂNG KIỂM LÁI XE
      </p>
    </div>
  );
};

export default SplashScreen;
