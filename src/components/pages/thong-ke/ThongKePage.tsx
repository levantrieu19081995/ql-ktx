"use client";

import React from "react";
import LuotRaVaoSubPage from "./LuotRaVaoSubPage";
import VangMatSubPage from "./VangMatSubPage";
import NguoiLaSubPage from "./NguoiLaSubPage";
import BiCamSubPage from "./BiCamSubPage";
import TheoMaSoSubPage from "./TheoMaSoSubPage";

interface ThongKePageProps {
  type?: "luot-ra-vao" | "vang-mat" | "nguoi-la" | "bi-cam" | "theo-ma-so";
}

export default function ThongKePage({ type = "luot-ra-vao" }: ThongKePageProps) {
  switch (type) {
    case "luot-ra-vao":
      return <LuotRaVaoSubPage />;
    case "vang-mat":
      return <VangMatSubPage />;
    case "nguoi-la":
      return <NguoiLaSubPage />;
    case "bi-cam":
      return <BiCamSubPage />;
    case "theo-ma-so":
      return <TheoMaSoSubPage />;
    default:
      return <LuotRaVaoSubPage />;
  }
}
