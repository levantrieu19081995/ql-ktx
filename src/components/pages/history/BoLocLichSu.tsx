"use client";

import React, { useEffect, useState } from "react";
import { TextInput, Select, Button } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useTranslations } from "next-intl";
import {
  IconSearch,
  IconRefresh,
  IconFileSpreadsheet,
  IconFileTypePdf,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import {
  dichVuDanhMucKhu,
  dichVuDanhMucNhom,
  KhuItem,
  NhomItem,
} from "./historyService";

interface ThuocTinhBoLocLichSu {
  boLoc: {
    ngay?: string;
    keyword?: string;
    tuNgay?: string;
    denNgay?: string;
    mssv?: string;
    hoVaTen?: string;
    maKtx?: string;
    maPhong?: string;
    loai?: "IN" | "OUT" | "ALL";
    trangThai?: string;
    loaiDoiTuong?: string;
    maNhom?: string;
  };
  datBoLoc: (boLocMoi: {
    ngay?: string;
    keyword?: string;
    tuNgay?: string;
    denNgay?: string;
    mssv?: string;
    hoVaTen?: string;
    maKtx?: string;
    maPhong?: string;
    loai?: "IN" | "OUT" | "ALL";
    trangThai?: string;
    loaiDoiTuong?: string;
    maNhom?: string;
  }) => void;
  datLaiBoLoc: () => void;
  khiTimKiem: () => void;
  khiXuatExcel?: () => void;
  khiXuatPdf?: () => void;
  loaiBoLoc?: "LICH_SU" | "NGUOI_LA";
}

export const BoLocLichSu: React.FC<ThuocTinhBoLocLichSu> = ({
  boLoc,
  datBoLoc,
  datLaiBoLoc,
  khiTimKiem,
  khiXuatExcel,
  khiXuatPdf,
  loaiBoLoc = "LICH_SU",
}) => {
  const t = useTranslations("History");
  const [danhSachKhu, setDanhSachKhu] = useState<KhuItem[]>([]);
  const [danhSachNhom, setDanhSachNhom] = useState<NhomItem[]>([]);

  useEffect(() => {
    dichVuDanhMucKhu.layDanhSach().then(setDanhSachKhu);
    dichVuDanhMucNhom.layDanhSach().then(setDanhSachNhom);
  }, []);

  const optionsKhu = [
    { value: "-1", label: t("filter.all") },
    ...danhSachKhu.map((k) => ({ value: k.maKhu, label: k.tenKhu })),
  ];

  const optionsNhom = [
    { value: "-1", label: t("filter.all") },
    ...danhSachNhom.map((n) => ({ value: n.maNhom, label: n.tenNhom })),
  ];

  const laTrangLichSu = loaiBoLoc === "LICH_SU";

  return (
    <div className="modern-filter-container">
      <div className="filter-content-wrapper">
        {laTrangLichSu ? (
          <div className="lich-su-filter-wrapper">
            <div className="filter-row-1-custom">
              <div className="filter-field date-field">
                <label className="filter-label">NGÀY</label>
                <DateInput
                  placeholder="Chọn ngày hiển thị lịch sử"
                  valueFormat="DD/MM/YYYY"
                  value={boLoc.ngay ? dayjs(boLoc.ngay).toDate() : null}
                  onChange={(ngay) =>
                    datBoLoc({
                      ngay: ngay ? dayjs(ngay).format("YYYY-MM-DD") : "",
                    })
                  }
                  size="sm"
                  radius="md"
                  styles={{ input: { height: "38px", borderColor: "#e4e4e7" } }}
                />
              </div>

              <div className="filter-field ktx-field">
                <label className="filter-label">
                  {t("filter.dormitory").toUpperCase()}
                </label>
                <Select
                  value={boLoc.maKtx || "-1"}
                  onChange={(giaTri) => datBoLoc({ maKtx: giaTri || "-1" })}
                  size="sm"
                  radius="md"
                  styles={{ input: { height: "38px", borderColor: "#e4e4e7" } }}
                  data={optionsKhu}
                  placeholder={t("filter.all")}
                />
              </div>

              <div className="filter-field object-field">
                <label className="filter-label">
                  {t("filter.objectType").toUpperCase()}
                </label>
                <Select
                  value={boLoc.maNhom || "-1"}
                  onChange={(giaTri) => datBoLoc({ maNhom: giaTri || "-1" })}
                  size="sm"
                  radius="md"
                  styles={{ input: { height: "38px", borderColor: "#e4e4e7" } }}
                  data={optionsNhom}
                  placeholder={t("filter.all")}
                />
              </div>

              <div className="filter-field keyword-field">
                <label className="filter-label">HỌ TÊN / MSSV</label>
                <TextInput
                  placeholder="Nhập họ tên hoặc MSSV..."
                  value={boLoc.keyword || ""}
                  onChange={(e) =>
                    datBoLoc({
                      keyword: e.currentTarget.value,
                      hoVaTen: "",
                      mssv: "",
                    })
                  }
                  size="sm"
                  radius="md"
                  styles={{
                    input: {
                      height: "38px",
                      borderColor: "#e4e4e7",
                    },
                  }}
                />
              </div>

              <div className="filter-actions-group-custom">
                <Button
                  onClick={khiTimKiem}
                  leftSection={<IconSearch size={15} />}
                  className="btn-action btn-search"
                >
                  {t("filter.search")}
                </Button>

                <Button
                  onClick={datLaiBoLoc}
                  leftSection={<IconRefresh size={15} />}
                  variant="outline"
                  className="btn-action btn-reset"
                >
                  {t("filter.reset")}
                </Button>

                {khiXuatExcel && (
                  <Button
                    onClick={khiXuatExcel}
                    leftSection={<IconFileSpreadsheet size={15} />}
                    variant="outline"
                    className="btn-action btn-excel"
                  >
                    {t("filter.exportExcel")}
                  </Button>
                )}

                {khiXuatPdf && (
                  <Button
                    onClick={khiXuatPdf}
                    leftSection={<IconFileTypePdf size={15} />}
                    variant="outline"
                    className="btn-action btn-pdf"
                  >
                    {t("filter.exportPdf")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="nguoi-la-filter-wrapper">
            <div className="filter-row-1">
              <div className="filter-inputs-group-row-1 stranger-fields">
                <div className="filter-field">
                  <label className="filter-label">
                    {t("filter.fromDate").toUpperCase()}
                  </label>
                  <DateInput
                    placeholder="MM/DD/YYYY"
                    valueFormat="MM/DD/YYYY"
                    value={boLoc.tuNgay ? dayjs(boLoc.tuNgay).toDate() : null}
                    onChange={(ngay) =>
                      datBoLoc({
                        tuNgay: ngay ? dayjs(ngay).format("YYYY-MM-DD") : "",
                      })
                    }
                    size="sm"
                    radius="md"
                    styles={{
                      input: { height: "38px", borderColor: "#e4e4e7" },
                    }}
                  />
                </div>

                <div className="filter-field">
                  <label className="filter-label">
                    {t("filter.toDate").toUpperCase()}
                  </label>
                  <DateInput
                    placeholder="MM/DD/YYYY"
                    valueFormat="MM/DD/YYYY"
                    value={boLoc.denNgay ? dayjs(boLoc.denNgay).toDate() : null}
                    onChange={(ngay) =>
                      datBoLoc({
                        denNgay: ngay ? dayjs(ngay).format("YYYY-MM-DD") : "",
                      })
                    }
                    size="sm"
                    radius="md"
                    styles={{
                      input: { height: "38px", borderColor: "#e4e4e7" },
                    }}
                  />
                </div>

                <div className="filter-field">
                  <label className="filter-label">KHU KTX PHÁT HIỆN</label>
                  <Select
                    value={boLoc.maKtx || "-1"}
                    onChange={(giaTri) => datBoLoc({ maKtx: giaTri || "-1" })}
                    size="sm"
                    radius="md"
                    styles={{
                      input: { height: "38px", borderColor: "#e4e4e7" },
                    }}
                    data={optionsKhu}
                    placeholder={t("filter.all")}
                  />
                </div>
              </div>

              <div className="filter-actions-group">
                <Button
                  onClick={khiTimKiem}
                  leftSection={<IconSearch size={15} />}
                  className="btn-action btn-search"
                >
                  {t("filter.search")}
                </Button>

                <Button
                  onClick={datLaiBoLoc}
                  leftSection={<IconRefresh size={15} />}
                  variant="outline"
                  className="btn-action btn-reset"
                >
                  {t("filter.reset")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: filterStyles }} />
    </div>
  );
};

const filterStyles = `
.modern-filter-container {
    background-color: #f8fafc;
    border-radius: 0.75rem;
    border: 1px solid #e2e8f0;
    padding: 1.25rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
    margin-top: 2rem;
    margin-bottom: 1.25rem;
    font-family: var(--font-readex-pro), sans-serif;
}

.filter-content-wrapper {
    display: flex;
    flex-direction: column;
}

.filter-row-1 {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1.25rem;
    width: 100%;
}

.filter-field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.filter-label {
    font-size: 11px;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.filter-actions-group {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    flex-grow: 1;
    justify-content: flex-end;
}

.filter-inputs-group-row-1 {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 1rem;
    flex: 1;
    min-width: 280px;
}

@media (min-width: 640px) {
    .filter-inputs-group-row-1 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (min-width: 992px) {
    .filter-inputs-group-row-1 {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
}

.btn-action {
    height: 38px !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    border-radius: 0.5rem !important;
    transition: all 0.2s ease !important;
    cursor: pointer !important;
}

.btn-search {
    background-color: #1f5ca9 !important;
    color: #ffffff !important;
    border: none !important;
    padding-left: 1.25rem !important;
    padding-right: 1.25rem !important;
}

.btn-search:hover {
    background-color: #16437d !important;
    box-shadow: 0 4px 8px rgba(31, 92, 169, 0.2) !important;
}

.btn-reset {
    background-color: #ffffff !important;
    border: 1px solid #d4d4d8 !important;
    color: #4b5563 !important;
    padding-left: 1rem !important;
    padding-right: 1rem !important;
}

.btn-reset:hover {
    background-color: #f4f4f5 !important;
    color: #111827 !important;
}

.btn-excel {
    background-color: #ffffff !important;
    border: 1px solid #1f5ca9 !important;
    color: #1f5ca9 !important;
    padding-left: 1rem !important;
    padding-right: 1rem !important;
}

.btn-excel:hover {
    background-color: rgba(31, 92, 169, 0.04) !important;
    box-shadow: 0 4px 8px rgba(31, 92, 169, 0.1) !important;
}

.btn-pdf {
    background-color: #ffffff !important;
    border: 1px solid #00afef !important;
    color: #00afef !important;
    padding-left: 1rem !important;
    padding-right: 1rem !important;
}

.btn-pdf:hover {
    background-color: rgba(0, 175, 240, 0.04) !important;
    box-shadow: 0 4px 8px rgba(0, 175, 240, 0.1) !important;
}

.filter-row-1-custom {
    display: grid;
    grid-template-columns: minmax(180px, 1.1fr) minmax(160px, 1fr) minmax(160px, 1fr) minmax(240px, 1.6fr) auto;
    gap: 0.75rem;
    align-items: end;
    width: 100%;
}

.date-field,
.ktx-field,
.object-field,
.keyword-field {
    min-width: 0;
}

.filter-actions-group-custom {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    justify-content: flex-end;
}

@media (max-width: 1680px) {
    .filter-row-1-custom {
        grid-template-columns:
            minmax(170px, 1.05fr)
            minmax(150px, 1fr)
            minmax(150px, 1fr)
            minmax(220px, 1.45fr);
    }

    .filter-actions-group-custom {
        grid-column: 1 / -1;
        justify-content: flex-end;
        padding-top: 0.25rem;
    }
}

@media (max-width: 1440px) {
    .filter-row-1-custom {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .filter-actions-group-custom {
        justify-content: flex-start;
    }
}

@media (max-width: 1200px) {
    .filter-row-1-custom {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .filter-actions-group-custom {
        grid-column: 1 / -1;
        justify-content: flex-end;
    }
}

@media (max-width: 768px) {
    .filter-row-1-custom {
        grid-template-columns: 1fr;
    }

    .filter-actions-group-custom {
        justify-content: stretch;
    }

    .filter-actions-group-custom > * {
        flex: 1;
    }
}
`;

export default BoLocLichSu;
