// src/app/[locale]/(app)/dashboard/ChartHost.client.tsx
"use client";
import dynamic from "next/dynamic";

const ChartHost = dynamic(() => import("./PerformanceChart.client"), {
  ssr: false,
  loading: () => null, // optional
});

export default ChartHost;
