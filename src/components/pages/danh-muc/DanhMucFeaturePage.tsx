"use client";

import { Card, Stack } from "@mantine/core";
import { ReactNode } from "react";
import PageSectionHeader from "@/components/common/PageSectionHeader";
import KhuKtxTable from "./Table/KhuKtxTable";
import SinhVienBiCamTable from "./Table/SinhVienBiCamTable";
import SinhVienKtxTable from "./Table/SinhVienKtxTable";
import PhongKtxTable from "./Table/PhongKtxTable";
import SinhVienNoPhiTable from "./Table/SinhVienNoPhiTable";
import type { PhongKtx } from "@/types/type-danh-muc-ktx";

type DanhMucType =
  | "khu"
  | "phong"
  | "sinhVienBiCam"
  | "phongKtx"
  | "sinhVienKtx"
  | "sinhVienNoPhi";

type DanhMucFeaturePageProps = {
  type: DanhMucType;
  title: string;
  description: string;
  items: Record<string, any>[];
  page?: number;
  pageSize?: number;
  searchControls?: ReactNode;
  pagination?: ReactNode;
  onEdit?: (item: any) => void;
  onSelectRoom?: (item: PhongKtx) => void;
  icon?: ReactNode;
};

export default function DanhMucFeaturePage({
  type,
  title,
  description,
  items,
  page = 1,
  pageSize = 10,
  searchControls,
  pagination,
  onEdit,
  onSelectRoom,
  icon,
}: DanhMucFeaturePageProps) {
  const renderTable = () => {
    switch (type) {
      case "khu":
        return <KhuKtxTable items={items} page={page} pageSize={pageSize} />;
      case "sinhVienBiCam":
        return (
          <SinhVienBiCamTable
            items={items}
            onEdit={onEdit}
            page={page}
            pageSize={pageSize}
          />
        );
      case "sinhVienKtx":
        return <SinhVienKtxTable items={items} page={page} pageSize={pageSize} />;
      case "sinhVienNoPhi":
        return <SinhVienNoPhiTable items={items} page={page} pageSize={pageSize} />;
      case "phongKtx":
        return (
          <PhongKtxTable
            items={items as PhongKtx[]}
            onSelectRoom={onSelectRoom}
            page={page}
            pageSize={pageSize}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Stack gap="lg">
      <PageSectionHeader
        title={title}
        description={description}
        icon={icon}
      />

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
