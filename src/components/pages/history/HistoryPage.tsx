/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Portal,
  Notification,
  Modal,
  Drawer,
  Stack,
  Text,
  Group,
  Button,
  Box,
  Select,
  Table,
  Loader,
  Avatar,
} from "@mantine/core";
import { useTranslations } from "next-intl";
import { IconCheck, IconHistory, IconX } from "@tabler/icons-react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  LabelList,
} from "recharts";

import BoLocLichSu from "./BoLocLichSu";
import BangLichSu, { LoaiTabHienThi } from "./BangLichSu";
import DrawerChiTietLichSu from "./DrawerChiTietLichSu";
import DrawerBieuMauLichSu from "./DrawerBieuMauLichSu";
import { dichVuLichSuRaVao } from "./historyService";
import ExcelExportForm, {
  xuatRaFileExcel,
} from "../../common/excel/excelHelper";
import PdfExportForm from "../../common/pdf/pdfHelper";
import { HistoryItem } from "../../../types/type-history";
import PageSectionHeader from "@/components/common/PageSectionHeader";
import CustomPagination from "@/components/common/CustomPagination";
import dayjs from "dayjs";
import { useSessionStore } from "@/context/sessionStore";

type LoaiTabChinh = "LICH_SU" | "THONG_KE" | "CAN_BO" | "SINH_VIEN";
type BoLocLichSuState = {
  ngay: string;
  keyword: string;
  tuNgay: string;
  denNgay: string;
  mssv: string;
  hoVaTen: string;
  maKtx: string;
  maPhong: string;
  loai: "IN" | "OUT" | "ALL";
  trangThai: string;
  loaiDoiTuong: string;
  maNhom: string;
};

const duLieuBieuDoThoiGian = [
  { ngay: "01/06", luotVao: 110, luotRa: 60 },
  { ngay: "02/06", luotVao: 270, luotRa: 370 },
  { ngay: "03/06", luotVao: 260, luotRa: 150 },
  { ngay: "04/06", luotVao: 200, luotRa: 150 },
  { ngay: "05/06", luotVao: 330, luotRa: 300 },
  { ngay: "06/06", luotVao: 250, luotRa: 260 },
  { ngay: "07/06", luotVao: 240, luotRa: 300 },
  { ngay: "08/06", luotVao: 445, luotRa: 345 },
  { ngay: "09/06", luotVao: 210, luotRa: 165 },
  { ngay: "10/06", luotVao: 40, luotRa: 20 },
];

const duLieuTopSinhVien = [
  { mssv: "MC122202", hoVaTen: "Nguyễn Văn Minh", luotRaVao: 45 },
  { mssv: "TC1255686", hoVaTen: "Trần Thị Mai Anh", luotRaVao: 43 },
  { mssv: "KKT012255", hoVaTen: "Đào Anh Thư", luotRaVao: 40 },
  { mssv: "TT2585524", hoVaTen: "Lâm Thị Tố Như", luotRaVao: 39 },
  { mssv: "TM565488", hoVaTen: "Trịnh Thị Mỹ Ái", luotRaVao: 33 },
];

type HistoryPageProps = {
  tab?: LoaiTabChinh;
};

type DuLieuXuatExcel = {
  title: string;
  fileName: string;
  sheetName: string;
  columnLabels: string[];
  data: Record<string, string | number | boolean | null | undefined>[];
};

type DuLieuXuatPdf = {
  title: string;
  fileName: string;
  columnLabels: string[];
  data: Record<string, string | number | boolean | null | undefined>[];
};

export default function HistoryPage({ tab = "LICH_SU" }: HistoryPageProps) {
  const t = useTranslations("History");
  const ngayHienTai = dayjs().format("YYYY-MM-DD");
  const taoBoLocMacDinh = (tabValue: LoaiTabChinh): BoLocLichSuState => ({
    ngay: ngayHienTai,
    keyword: "",
    tuNgay: "",
    denNgay: "",
    mssv: "",
    hoVaTen: "",
    maKtx: "-1",
    maPhong: "",
    loai: "ALL",
    trangThai: "ALL",
    loaiDoiTuong: "ALL",
    maNhom: tabValue === "CAN_BO" ? "2" : tabValue === "SINH_VIEN" ? "1" : "-1",
  });

  const [tabActive, datTabActive] = useState<LoaiTabChinh>(tab);
  const [thongBao, setThongBao] = useState<{
    kieu: "success" | "error";
    tinNhan: string;
  } | null>(null);
  const [xacNhanPhanHoi, setXacNhanPhanHoi] = useState<HistoryItem | null>(
    null,
  );
  const [loaiThoiGian, datLoaiThoiGian] = useState<"NGAY" | "THANG" | "NAM">(
    "NGAY",
  );
  const [loaiBieuDo, datLoaiBieuDo] = useState<"THOI_GIAN" | "KTX">("KTX");

  const [danhSachLichSu, setDanhSachLichSu] = useState<HistoryItem[]>([]);
  const [dangTai, setDangTai] = useState<boolean>(false);
  const [dangTao, setDangTao] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [boLocNhap, setBoLocNhap] = useState<BoLocLichSuState>(
    taoBoLocMacDinh(tab),
  );
  const [boLocDaApDung, setBoLocDaApDung] = useState<BoLocLichSuState>(
    taoBoLocMacDinh(tab),
  );

  const [lichSuDuocChon, datLichSuDuocChon] = useState<HistoryItem | null>(
    null,
  );
  const [moDrawerBieuMau, datMoDrawerBieuMau] = useState<boolean>(false);
  const [duLieuXuatExcel, setDuLieuXuatExcel] =
    useState<DuLieuXuatExcel | null>(null);
  const [duLieuXuatPdf, setDuLieuXuatPdf] = useState<DuLieuXuatPdf | null>(
    null,
  );

  useEffect(() => {
    datTabActive(tab);
    datLichSuDuocChon(null);
    const boLocMacDinh = taoBoLocMacDinh(tab);
    setBoLocNhap(boLocMacDinh);
    setBoLocDaApDung(boLocMacDinh);
    setPage(1);
  }, [tab]);

  const hienThongBao = (
    tinNhan: string,
    kieu: "success" | "error" = "success",
  ) => {
    setThongBao({ tinNhan, kieu });
  };

  useEffect(() => {
    if (thongBao) {
      const timer = setTimeout(() => setThongBao(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [thongBao]);

  const datBoLoc = (boLocMoi: Partial<BoLocLichSuState>) => {
    setBoLocNhap((prev) => ({ ...prev, ...boLocMoi }));
  };

  const datLaiBoLoc = () => {
    const boLocMacDinh = taoBoLocMacDinh(tabActive);
    setPage(1);
    setBoLocNhap(boLocMacDinh);
    setBoLocDaApDung(boLocMacDinh);
  };

  const taiDuLieu = async (pageValue = page, pageSizeValue = pageSize) => {
    setDanhSachLichSu([]);
    setDangTai(true);
    try {
      const duLieu = await dichVuLichSuRaVao.layDanhSachLichSu({
        ...boLocDaApDung,
        page: pageValue,
        pageSize: pageSizeValue,
      });
      setDanhSachLichSu(duLieu.items || []);
      setTotalPages(duLieu.totalPages || 0);
      setTotalItems(duLieu.totalElements || 0);
    } catch {
      hienThongBao(t("messages.loadError"), "error");
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiDuLieu();
  }, [boLocDaApDung, page, pageSize]);

  const duLieuTheoTab = useMemo((): HistoryItem[] => {
    if (tabActive === "CAN_BO") {
      return danhSachLichSu.filter(
        (h) =>
          h.loaiDoiTuong?.toLowerCase().includes("cán bộ") ||
          h.loaiDoiTuong?.toLowerCase().includes("can bo"),
      );
    }
    if (tabActive === "SINH_VIEN") {
      return danhSachLichSu.filter(
        (h) =>
          !h.loaiDoiTuong?.toLowerCase().includes("cán bộ") &&
          !h.loaiDoiTuong?.toLowerCase().includes("can bo"),
      );
    }
    return danhSachLichSu;
  }, [danhSachLichSu, tabActive]);

  const loaiTabHienThi = useMemo<LoaiTabHienThi>(() => {
    return "LICH_SU";
  }, []);

  const xuLyTimKiem = () => {
    setPage(1);
    setBoLocDaApDung({ ...boLocNhap });
    hienThongBao(t("messages.updated"), "success");
  };

  const xuLyXuatExcel = async () => {
    try {
      const tatCaDuLieu = await dichVuLichSuRaVao.layDanhSachLichSu({
        ...boLocDaApDung,
        page: 1,
        pageSize: totalItems > 0 ? totalItems : 10000,
      });

      const duLieuXuatTatCa = tatCaDuLieu.items.map((h, i) => ({
        [t("table.no")]: i + 1,
        [t("table.time")]: h.thoiGian,
        [t("filter.studentId")]: h.mssv,
        [t("table.name")]: h.hoVaTen,
        [t("table.type")]: h.loai === "IN" ? t("filter.in") : t("filter.out"),
        [t("filter.objectType")]:
          h.loaiDoiTuong === "Người lạ"
            ? t("filter.stranger")
            : t("filter.student"),
        [t("filter.objectType")]: h.tennhom || h.loaiDoiTuong,
        [t("table.dormitory")]: h.tenKtx,
        [t("table.room")]: h.tenPhong,
      }));

      setDuLieuXuatExcel({
        title: "Danh sách lịch sử ra vào",
        fileName: `Lich_Su_Ra_Vao_${new Date().toISOString().split("T")[0]}`,
        sheetName: t("tabs.log"),
        columnLabels: [
          t("table.no"),
          t("table.time"),
          t("filter.studentId"),
          t("table.name"),
          t("table.type"),
          t("filter.objectType"),
          t("table.dormitory"),
          t("table.room"),
        ],
        data: duLieuXuatTatCa,
      });
      return;
    } catch {
      hienThongBao(t("messages.loadError"), "error");
      return;
    }

    const duLieuXuat = danhSachLichSu.map((h, i) => ({
      [t("table.no")]: i + 1,
      [t("table.time")]: h.thoiGian,
      [t("filter.studentId")]: h.mssv,
      [t("table.name")]: h.hoVaTen,
      [t("table.type")]: h.loai === "IN" ? t("filter.in") : t("filter.out"),
      [t("filter.objectType")]:
        h.loaiDoiTuong === "Người lạ"
          ? t("filter.stranger")
          : t("filter.student"),
      [t("filter.objectType")]: h.tennhom || h.loaiDoiTuong,
      [t("table.dormitory")]: h.tenKtx,
      [t("table.room")]: h.tenPhong,
    }));
    xuatRaFileExcel(
      duLieuXuat,
      `Lich_Su_Ra_Vao_${new Date().toISOString().split("T")[0]}`,
      t("tabs.log"),
    );
    hienThongBao(t("messages.exportExcelSuccess"), "success");
  };

  const xuLyXuatPdf = async () => {
    try {
      const tatCaDuLieu = await dichVuLichSuRaVao.layDanhSachLichSu({
        ...boLocDaApDung,
        page: 1,
        pageSize: totalItems > 0 ? totalItems : 10000,
      });

      const duLieuPdf = tatCaDuLieu.items.map((h, i) => ({
        [t("table.no")]: i + 1,
        [t("table.time")]: h.thoiGian,
        [t("filter.studentId")]: h.mssv,
        [t("table.name")]: h.hoVaTen,
        [t("table.type")]: h.loai === "IN" ? t("filter.in") : t("filter.out"),
        [t("filter.objectType")]:
          h.loaiDoiTuong === "Người lạ"
            ? t("filter.stranger")
            : t("filter.student"),
        [t("filter.objectType")]: h.tennhom || h.loaiDoiTuong,
        [t("table.dormitory")]: h.tenKtx,
        [t("table.room")]: h.tenPhong,
      }));

      setDuLieuXuatPdf({
        title: "Danh sách lịch sử ra vào",
        fileName: `Lich_Su_Ra_Vao_${new Date().toISOString().split("T")[0]}`,
        columnLabels: [
          t("table.no"),
          t("table.time"),
          t("filter.studentId"),
          t("table.name"),
          t("table.type"),
          t("filter.objectType"),
          t("table.dormitory"),
          t("table.room"),
        ],
        data: duLieuPdf,
      });
    } catch {
      hienThongBao(t("messages.loadError"), "error");
    }
  };

  const xuLyDongChiTiet = () => {
    datLichSuDuocChon(null);
  };

  const xuLyTaoBanGhi = async (
    duLieu: Omit<HistoryItem, "id" | "thoiGian">,
  ) => {
    setDangTao(true);
    try {
      await dichVuLichSuRaVao.taoBanGhiLichSu(duLieu);
      await taiDuLieu();
    } finally {
      setDangTao(false);
    }
  };

  const xuLyPhanHoiSaiThongTin = (lichSu: HistoryItem) => {
    setXacNhanPhanHoi(lichSu);
  };

  const xuLyThemDuLieu = () => {
    datMoDrawerBieuMau(true);
  };

  // // Đoạn code test session đăng nhập
  // const setIsExpired = useSessionStore((s) => s.setIsExpired);
  // useEffect(() => {
  //   // @ts-ignore
  //   window.showSessionExpired = () => setIsExpired(true);
  // }, [setIsExpired]);
  // // // Sau đó vào đúng trang history, mở Console và gọi:
  // // window.showSessionExpired()

  return (
    <Box className="history-page-container">
      {/* TIÊU ĐỀ TRANG */}
      <PageSectionHeader
        title={t("title")}
        description="Theo dõi lịch sử ra vào ký túc xá và tra cứu thống kê theo từng nhóm đối tượng."
        icon={<IconHistory size={20} />}
      />

      {/* BỘ LỌC */}
      {tabActive !== "THONG_KE" && (
        <BoLocLichSu
          boLoc={boLocNhap}
          datBoLoc={datBoLoc}
          datLaiBoLoc={datLaiBoLoc}
          khiTimKiem={xuLyTimKiem}
          khiXuatExcel={xuLyXuatExcel}
          khiXuatPdf={xuLyXuatPdf}
        />
      )}

      {/* TAB: LỊCH SỬ | CÓ MẶT | VẮNG MẶT */}
      {(tabActive === "LICH_SU" ||
        tabActive === "CAN_BO" ||
        tabActive === "SINH_VIEN") && (
        <div key={tabActive} className="page-layout">
          {/* Bảng dữ liệu */}
          <div className="main-content-col">
            <BangLichSu
              duLieu={danhSachLichSu}
              dangTai={dangTai}
              loaiTab={loaiTabHienThi}
              tabActive={tabActive}
              lichSuDuocChon={lichSuDuocChon}
              datLichSuDuocChon={datLichSuDuocChon}
              page={page}
              pageSize={pageSize}
            />
            <CustomPagination
              totalItems={totalItems}
              totalPages={totalPages}
              page={page}
              pageSize={pageSize}
              setPage={setPage}
              setPageSize={setPageSize}
            />
          </div>
        </div>
      )}

      {/* TAB: THỐNG KÊ */}
      {tabActive === "THONG_KE" && (
        <div key={tabActive} className="page-layout">
          {/* BIỂU ĐỒ CỘT */}
          <div className="chart-card-wrapper">
            <div className="chart-header-tabs">
              <button
                onClick={() => datLoaiBieuDo("THOI_GIAN")}
                className={`chart-tab-btn ${loaiBieuDo === "THOI_GIAN" ? "chart-tab-btn-active" : ""}`}
              >
                {t("statistics.chartHourly")}
              </button>
              <button
                onClick={() => datLoaiBieuDo("KTX")}
                className={`chart-tab-btn ${loaiBieuDo === "KTX" ? "chart-tab-btn-active" : ""}`}
              >
                {t("statistics.chartDorm")}
              </button>
            </div>

            {loaiBieuDo === "THOI_GIAN" && (
              <div className="chart-sub-header">
                {(["NGAY", "THANG", "NAM"] as const).map((loai) => (
                  <button
                    key={loai}
                    onClick={() => datLoaiThoiGian(loai)}
                    className={`chart-filter-btn ${loaiThoiGian === loai ? "chart-filter-btn-active" : ""}`}
                  >
                    {loai === "NGAY"
                      ? t("statistics.day")
                      : loai === "THANG"
                        ? t("statistics.month")
                        : t("statistics.year")}
                  </button>
                ))}

                <div className="chart-legend">
                  <span className="legend-item">
                    <span className="legend-color-emerald" />
                    {t("statistics.inbound")}
                  </span>
                  <span className="legend-item">
                    <span className="legend-color-blue" />
                    {t("statistics.outbound")}
                  </span>
                </div>
              </div>
            )}

            <div className="chart-container">
              {loaiBieuDo === "THOI_GIAN" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={duLieuBieuDoThoiGian}
                    margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="ngay"
                      tick={{ fontSize: 11 }}
                      stroke="#9ca3af"
                    />
                    <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                    <Tooltip
                      formatter={(value) => [value, t("statistics.turn")]}
                    />
                    <Bar
                      dataKey="luotVao"
                      fill="#10b981"
                      radius={[3, 3, 0, 0]}
                      name={t("statistics.inbound")}
                    />
                    <Bar
                      dataKey="luotRa"
                      fill="#3b82f6"
                      radius={[3, 3, 0, 0]}
                      name={t("statistics.outbound")}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={[
                      { name: t("filter.dormA"), value: 1321 },
                      { name: t("filter.dormB"), value: 1002 },
                      { name: t("filter.dormC"), value: 1261 },
                      { name: t("filter.dormD"), value: 780 },
                    ]}
                    margin={{ top: 10, right: 50, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#f5f5f5"
                    />
                    <XAxis
                      type="number"
                      domain={[0, 1400]}
                      stroke="#9ca3af"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#9ca3af"
                      tick={{ fontSize: 11, fontWeight: 600 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      formatter={(value) => [
                        Number(value).toLocaleString("vi-VN"),
                        t("statistics.turnsCount"),
                      ]}
                    />
                    <Bar
                      dataKey="value"
                      fill="#00afef"
                      barSize={18}
                      radius={[0, 4, 4, 0]}
                    >
                      <LabelList
                        dataKey="value"
                        position="right"
                        formatter={(val: any) =>
                          val !== null && val !== undefined
                            ? Number(val).toLocaleString("vi-VN")
                            : ""
                        }
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          fill: "#374151",
                        }}
                        offset={8}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* BẢNG TOP SINH VIÊN */}
          <div className="top-students-card">
            <div className="top-students-header">
              <h4 className="top-students-title">{t("statistics.topTitle")}</h4>
              <button className="btn-text-link">
                {t("statistics.viewAll")}
              </button>
            </div>

            <table className="top-students-table">
              <thead>
                <tr className="table-header-row">
                  <th className="th-stt">{t("filter.studentId")}</th>
                  <th className="th-name">{t("table.name")}</th>
                  <th className="th-count">{t("statistics.turnsCount")}</th>
                </tr>
              </thead>
              <tbody className="tbody-divided">
                {duLieuTopSinhVien.map((sv, idx) => (
                  <tr key={idx} className="top-sv-row">
                    <td className="td-mssv">{sv.mssv}</td>
                    <td className="td-name">{sv.hoVaTen}</td>
                    <td className="td-count">{sv.luotRaVao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DRAWER THÊM DỮ LIỆU */}
      <DrawerBieuMauLichSu
        open={moDrawerBieuMau}
        onClose={() => datMoDrawerBieuMau(false)}
        onSave={xuLyTaoBanGhi}
        dangTao={dangTao}
      />

      {/* DRAWER CHI TIẾT LỊCH SỬ */}
      <DrawerChiTietLichSu
        open={lichSuDuocChon !== null}
        onClose={xuLyDongChiTiet}
        lichSuDuocChon={lichSuDuocChon}
        khiPhanHoi={xuLyPhanHoiSaiThongTin}
      />

      {/* MODAL XÁC NHẬN PHẢN HỒI */}
      <Modal
        opened={xacNhanPhanHoi !== null}
        onClose={() => setXacNhanPhanHoi(null)}
        title={t("feedbackModal.title")}
        centered
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <Stack gap="md">
          <Text size="sm">
            {t("feedbackModal.body")}{" "}
            <span className="font-semibold">{xacNhanPhanHoi?.hoVaTen}</span> (
            {xacNhanPhanHoi?.mssv})?
          </Text>
          <Group justify="flex-end" gap="xs">
            <Button variant="default" onClick={() => setXacNhanPhanHoi(null)}>
              {t("drawer.cancelBtn")}
            </Button>
            <Button
              color="#1f5ca9"
              onClick={() => {
                hienThongBao(t("messages.reportSuccess"), "success");
                setXacNhanPhanHoi(null);
              }}
            >
              {t("feedbackModal.submitBtn")}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* THÔNG BÁO DẠNG TOAST */}
      {thongBao && (
        <Portal>
          <div className="fixed top-5 right-5 z-[9999] w-80 animate-fade-in shadow-lg">
            <Notification
              icon={
                thongBao.kieu === "success" ? (
                  <IconCheck size={18} />
                ) : (
                  <IconX size={18} />
                )
              }
              color={thongBao.kieu === "success" ? "teal" : "red"}
              title={
                thongBao.kieu === "success"
                  ? t("messages.success")
                  : t("messages.error")
              }
              onClose={() => setThongBao(null)}
            >
              {thongBao.tinNhan}
            </Notification>
          </div>
        </Portal>
      )}

      {duLieuXuatExcel && (
        <ExcelExportForm
          hidden
          autoExport
          title={duLieuXuatExcel.title}
          columnLabels={duLieuXuatExcel.columnLabels}
          columnCount={duLieuXuatExcel.columnLabels.length}
          data={duLieuXuatExcel.data}
          fileName={duLieuXuatExcel.fileName}
          sheetName={duLieuXuatExcel.sheetName}
          onExported={() => {
            hienThongBao(t("messages.exportExcelSuccess"), "success");
            setDuLieuXuatExcel(null);
          }}
        />
      )}

      {duLieuXuatPdf && (
        <PdfExportForm
          hidden
          autoExport
          title={duLieuXuatPdf.title}
          columnLabels={duLieuXuatPdf.columnLabels}
          columnCount={duLieuXuatPdf.columnLabels.length}
          data={duLieuXuatPdf.data}
          fileName={duLieuXuatPdf.fileName}
          onExported={() => {
            hienThongBao(t("messages.exportPdfSuccess"), "success");
            setDuLieuXuatPdf(null);
          }}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
    </Box>
  );
}

const pageStyles = `
.history-page-container {
    padding: 1rem;
    min-height: 100vh;
    font-family: var(--font-k2d), sans-serif;
}

.tabs-bar {
    background-color: #f0f4fa;
    padding: 0.25rem;
    border-radius: 0.5rem;
    display: flex;
    gap: 0.25rem;
    width: max-content;
    margin-bottom: 1.25rem;
    border: 1px solid #d0e1f4;
}

.tab-btn {
    padding: 0.375rem 1.25rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 600;
    border: none;
    background-color: transparent;
    color: #4b5563;
    transition: all 0.2s;
    cursor: pointer;
    font-family: var(--font-readex-pro);
}

.tab-btn:hover {
    color: #1f5ca9;
    background-color: rgba(31, 92, 169, 0.08);
}

.tab-btn-active {
    background-color: #1f5ca9 !important;
    color: #ffffff !important;
    box-shadow: 0 4px 10px rgba(31, 92, 169, 0.25) !important;
}

.page-layout {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
}

@media (min-width: 1024px) {
    .page-layout {
        flex-direction: row;
        align-items: flex-start;
    }
}

.main-content-col {
    flex: 1;
    min-width: 0;
}

/* Statistics tab layouts */
.chart-card-wrapper {
    flex: 1;
    background-color: #ffffff;
    border-radius: 0.75rem;
    border: 1px solid #e4e4e7;
    padding: 1.25rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    min-width: 0;
}

.chart-header-tabs {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid #f4f4f5;
    padding-bottom: 0.75rem;
}

.chart-tab-btn {
    padding: 0.375rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    background-color: #ffffff;
    color: #4b5563;
    border: 1px solid #e4e4e7;
    font-family: var(--font-readex-pro);
}

.chart-tab-btn:hover {
    color: #1f5ca9;
    border-color: #1f5ca9;
}

.chart-tab-btn-active {
    background-color: #1f5ca9 !important;
    color: #ffffff !important;
    border-color: #1f5ca9 !important;
}

.chart-sub-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.chart-filter-btn {
    padding: 0.25rem 0.75rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    transition: all 0.2s;
    cursor: pointer;
    border: none;
    background-color: #f4f4f5;
    color: #4b5563;
    font-family: var(--font-readex-pro);
}

.chart-filter-btn:hover {
    background-color: rgba(31, 92, 169, 0.08);
    color: #1f5ca9;
}

.chart-filter-btn-active {
    background-color: #1f5ca9 !important;
    color: #ffffff !important;
}

.chart-legend {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: #71717a;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.legend-color-emerald {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 0.125rem;
    background-color: #10b981;
    display: inline-block;
}

.legend-color-blue {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 0.125rem;
    background-color: #3b82f6;
    display: inline-block;
}

.chart-container {
    height: 18rem;
    width: 100%;
    margin-top: 0.5rem;
}

.top-students-card {
    width: 100%;
    background-color: #ffffff;
    border-radius: 0.75rem;
    border: 1px solid #e4e4e7;
    padding: 1.25rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    flex-shrink: 0;
}

@media (min-width: 1024px) {
    .top-students-card {
        width: 20rem;
    }
}

@media (min-width: 1280px) {
    .top-students-card {
        width: 24rem;
    }
}

.top-students-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
}

.top-students-title {
    margin: 0;
    font-size: 0.875rem;
    font-weight: bold;
    color: #00afef;
}

.btn-text-link {
    font-size: 0.75rem;
    color: #00afef;
    font-weight: 600;
    background: transparent;
    border: none;
    cursor: pointer;
}

.btn-text-link:hover {
    text-decoration: underline;
}

.top-students-table {
    width: 100%;
    font-size: 0.875rem;
    border-collapse: collapse;
}

.table-header-row {
    border-bottom: 1px solid #e4e4e7;
}

.th-stt {
    padding-bottom: 0.5rem;
    text-align: left;
    font-weight: 600;
    color: #4b5563;
    font-size: 0.75rem;
}

.th-name {
    padding-bottom: 0.5rem;
    text-align: left;
    font-weight: 600;
    color: #4b5563;
    font-size: 0.75rem;
    padding-left: 0.75rem;
}

.th-count {
    padding-bottom: 0.5rem;
    text-align: right;
    font-weight: 600;
    color: #4b5563;
    font-size: 0.75rem;
}

.tbody-divided > tr {
    border-bottom: 1px solid #fafafa;
}

.top-sv-row:hover {
    background-color: #fafafa;
}

.td-mssv {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    color: #4b5563;
    font-family: monospace;
    font-size: 0.75rem;
}

.td-name {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    color: #1f2937;
    font-weight: 500;
    font-size: 0.75rem;
    padding-left: 0.75rem;
}

.td-count {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    text-align: right;
    color: #374151;
    font-weight: 600;
    font-size: 0.75rem;
}
`;
