"use client";

import React from "react";
import { Stack, Title, Button, Group } from "@mantine/core";
import { useRouter } from "@/i18n/navigation";
// import SettingExcelViewer from "../SettingExcelViewer"; // hoặc đổi tên ImportVehiclePage
import SettingExcelConvertPage from "../SettingExcelConvertPage"; // hoặc đổi tên ImportVehiclePage

export default function ImportVehiclePage() {
  const router = useRouter();

  return (
    <Stack gap="xl">
      {/* <SettingExcelViewer /> */}
      <SettingExcelConvertPage />
    </Stack>
  );
}
