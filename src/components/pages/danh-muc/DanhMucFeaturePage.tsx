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
          <div className="filter-row-custom">{searchControls}</div>
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

.filter-row-custom {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap !important;
  align-items: flex-end;
  justify-content: space-between !important;
  gap: 20px;
  width: 100%;
}

.filter-inputs-custom {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap !important;
  align-items: flex-end;
  gap: 16px;
  flex: 1;
  min-width: 150px;
}

.filter-inputs-custom > * {
  flex: 1;
  min-width: 150px;
}

.filter-actions-custom {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap !important;
  align-items: flex-end;
  gap: 16px;
}

/* Mobile size limits to fit everything on one row */
@media (max-width: 767px) {
  .filter-inputs-custom {
    max-width: 45% !important;
  }
  .filter-inputs-custom > * {
    max-width: 100% !important;
  }
}

/* Tablets and medium screens */
@media (min-width: 768px) {
  .filter-inputs-custom {
    max-width: 600px !important;
  }
  .filter-inputs-custom > * {
    max-width: 500px !important;
  }
}

/* Large screens (>= 1200px) */
@media (min-width: 1200px) {
  .filter-inputs-custom {
    max-width: 800px !important;
  }
  .filter-inputs-custom > * {
    max-width: 550px !important;
  }
}
`,
        }}
      />
    </Stack>
  );
}
