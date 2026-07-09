"use client";

import { Card, Group, Stack, Text, Title } from "@mantine/core";
import { IconCategory } from "@tabler/icons-react";
import { ReactNode } from "react";
import KhuKtxTable from "./Table/KhuKtxTable";
import SinhVienBiCamTable from "./Table/SinhVienBiCamTable";
import SinhVienKtxTable from "./Table/SinhVienKtxTable";
import PhongKtxTable from "./Table/PhongKtxTable";

type DanhMucType =
  | "khu"
  | "phong"
  | "sinhVienBiCam"
  | "phongKtx"
  | "sinhVienKtx";

type DanhMucFeaturePageProps = {
  type: DanhMucType;
  title: string;
  description: string;
  items: Record<string, any>[];
  searchControls?: ReactNode;
  pagination?: ReactNode;
  onEdit?: (item: any) => void;
  icon?: ReactNode;
};

export default function DanhMucFeaturePage({
  type,
  title,
  description,
  items,
  searchControls,
  pagination,
  onEdit,
  icon,
}: DanhMucFeaturePageProps) {
  const renderTable = () => {
    switch (type) {
      case "khu":
        return <KhuKtxTable items={items} />;
      case "sinhVienBiCam":
        return <SinhVienBiCamTable items={items} onEdit={onEdit} />;
      case "sinhVienKtx":
        return <SinhVienKtxTable items={items} />;
      case "phongKtx":
        return <PhongKtxTable items={items} />;
      default:
        return null;
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <Group>
          <div className="page-icon">{icon || <IconCategory size={20} />}</div>

          <div>
            <Title order={3}>{title}</Title>
            <Text c="dimmed" size="sm">
              {description}
            </Text>
          </div>
        </Group>
      </Group>

      {searchControls && (
        <Card withBorder radius="md" p="md">
          <Group align="end">{searchControls}</Group>
        </Card>
      )}

      {renderTable()}
      {pagination}
      <style
        dangerouslySetInnerHTML={{
          __html: `
.page-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #1f5ca9;
  background: #eff6ff;
}
`,
        }}
      />
    </Stack>
  );
}
