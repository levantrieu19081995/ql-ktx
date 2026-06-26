/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Stack,
  TextInput,
  Button,
  Group,
  Flex,
  Select,
  Grid,
  Checkbox,
  Text,
} from "@mantine/core";
import { showNoti } from "@/components/common/showNoti";
import { useUser } from "@/context/UserContext";
import { fetchPhiDichVu } from "@/services/danh-muc/dmPhiDichVu";
// import {
//   createHoSoPhiDichVu,
//   fetchListHoSoPhiDichVu,
// } from "@/services/ho-so-phu-dich-vu/hoSoPhiDichVuService";
import { fetchConfigFee } from "@/services/setting/settinFeeInfoService";
// import {
//   HoSoPhiDichVuCreate,
//   HoSoPhiDichVuQuery,
//   PhiDichVuItem,
// } from "@/types/global";
// import { updateHoSoDangKiem } from "@/services/ho-so-dang-kiem/hoSoDangKiemService";
import { validateAndGoStep } from "@/utils/acceptanceFlow";
import { buildTenPhi } from "@/utils/buildName";

type Props = {
  ttId: number;
  tenPhi: string;
  onNext: () => void;
  result: any;
  setResult: (data: any) => void;
  disabled?: boolean;
};

export default function FeeStep2Section({
  ttId,
  tenPhi,
  onNext,
  result,
  setResult,
  disabled,
}: Props) {
  const { user } = useUser();

  // const [phiDichVuList, setPhiDichVuList] = useState<PhiDichVuItem[]>([]);
  const [phiDichVuList, setPhiDichVuList] = useState<any[]>([]);
  const [selectedPhiDichVu, setSelectedPhiDichVu] = useState<string | null>(
    null,
  );
  const [loadingCreate, setLoadingCreate] = useState(false);

  const [hinhThucThanhToan, setHinhThucThanhToan] = useState<string>("2");
  const [isGhiNo, setIsGhiNo] = useState<boolean>(false);

  // giữ lanThu theo result như cũ
  const [lanThu_PDK, setLanThu] = useState<string>(result?.lanThu || "1");

  // CONFIG: thuế suất mặc định (nếu cần dùng fallback)
  const [thueSuatConfig, setThueSuatConfig] = useState<number>(0);

  //   chỉ giữ state cho input "giá trước thuế" khi cho phép chỉnh
  const [giaDangKiemInput, setGiaDangKiemInput] = useState<number>(0);

  // ================== Helpers ==================
  // const parseCurrency = (val?: string | number): number => {
  //   if (!val) return 0;
  //   if (typeof val === "number") return val;
  //   return parseInt(val.toString().replace(/[.,\s]/g, ""), 10) || 0;
  // };

  const parseCurrency = (val?: string | number): number => {
    if (val == null) return 0;
    if (typeof val === "number") return Math.trunc(val);

    const digits = String(val).replace(/[^\d]/g, "");
    return digits ? Number(digits) : 0;
  };

  // ==================== API CALLS ====================
  const _getConfigFeeInfoSimple = async () => {
    try {
      const params = {
        group: "*",
        keyword: "qldk.ti-le-thue-suat",
        organizationId: 1,
      };

      const { payload } = await fetchConfigFee(params);
      if (Array.isArray(payload) && payload.length > 0) {
        const item = payload.find((p) => p.key === "qldk.ti-le-thue-suat");
        if (item) {
          const parsedValue = Number(item.value);
          setThueSuatConfig(isNaN(parsedValue) ? 0 : parsedValue);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy config thuế suất:", error);
    }
  };

  const _fetchListHoSoPhiDichVu = async () => {
    try {
      // const params: HoSoPhiDichVuQuery = {
      //   page: 1,
      //   pageSize: 500,
      //   userIdTiepNhan: String(user?.guid),
      //   hsId: result.hsId,
      // };
      const params: any = {
        page: 1,
        pageSize: 500,
        userIdTiepNhan: String(user?.guid),
        hsId: result.hsId,
      };

      // const response = await fetchListHoSoPhiDichVu(params);
      const response = null;
      setResult(null);
      // if (response?.status === "OK") {
      //   const list = response.payload?.items;
      //   setResult((prev: any) => ({
      //     ...prev,
      //     listHoSoPhiDichVu: list,
      //   }));
      // }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách hồ sơ phí dịch vụ:", error);
    }
  };

  const _fetchPhiDichVu = async () => {
    try {
      const res = await fetchPhiDichVu(1, 300, "*", 0, Number(ttId), 1);
      const items =
        // res?.payload?.items?.map((item: PhiDichVuItem) => ({
        res?.payload?.items?.map((item: any) => ({
          pdvId: item?.pdvId,
          pdvNoidung: item?.pdvNoidung,
          pdvKhoanphi: item?.pdvKhoanphi,
          pdvKhoanphiTruocthue: item?.pdvKhoanphiTruocthue,
          pdvThue: item?.pdvThue,
          pdvTuychinh: item?.pdvTuychinh,
        })) ?? [];
      setPhiDichVuList(items);
    } catch (error) {
      console.error("Lỗi khi lấy VAT:", error);
    }
  };

  // ==================== HANDLE UPDATE HS ====================
  const handleUpdateHoSo = async (isHuyHS: boolean) => {
    try {
      const rawVersion = Number(result.version);
      const safeVersion =
        Number.isFinite(rawVersion) && rawVersion > 0 ? rawVersion : 0;

      const updatedData = {
        bxlId: isHuyHS ? 1002 : 6,
        ttHsId: isHuyHS ? 1002 : 6,
        userIdThuPhi: user?.guid || "",
        hsLyDoHuy: "",
        hsLyDoBoSung: "",
        version: safeVersion + 1,
      };

      // const response = await updateHoSoDangKiem(result.hsId, updatedData);
      const response = null;

      // if (response?.status === "OK" || response?.payload) {
      //   showNoti("success", "Cập nhật hồ sơ thành công!");
      //   return true;
      // } else {
      //   showNoti("error", "Cập nhật hồ sơ không thành công!");
      // }
    } catch (error) {
      showNoti("error", "Có lỗi khi cập nhật hồ sơ");
      return false;
    }
  };

  // ==================== MEMO: selectedPhi + fee calc ====================
  const selectedPhi = useMemo(() => {
    return phiDichVuList.find(
      (item) => String(item.pdvId) === String(selectedPhiDichVu),
    );
  }, [phiDichVuList, selectedPhiDichVu]);

  const phiCanEdit = !!selectedPhi?.pdvTuychinh;
  const roundAccounting = (value: number) => {
    if (!Number.isFinite(value)) return 0;
    return Math.round(value + 1e-9);
  };

  //   TÍNH TOÁN BẰNG useMemo (nguồn: selectedPhi + giaDangKiemInput)
  // const feeCalc = useMemo(() => {
  //   if (!selectedPhi) {
  //     return {
  //       giaTruocThue: 0,
  //       thueSuat: 0,
  //       tienThue: 0,
  //       giaVAT: 0,
  //     };
  //   }

  //   const taxRate = Number(selectedPhi.pdvThue ?? thueSuatConfig ?? 0) || 0;

  //   const beforeTaxFromConfig = parseCurrency(
  //     String(selectedPhi.pdvKhoanphiTruocthue ?? 0),
  //   );

  //   const beforeTax = phiCanEdit ? giaDangKiemInput : beforeTaxFromConfig;

  //   const tienThue = Math.round(beforeTax * (taxRate / 100));
  //   const giaVAT = beforeTax + tienThue;

  //   return {
  //     giaTruocThue: beforeTax,
  //     thueSuat: taxRate,
  //     tienThue,
  //     giaVAT,
  //   };
  // }, [selectedPhi, phiCanEdit, giaDangKiemInput, thueSuatConfig]);

  const feeCalc = useMemo(() => {
    if (!selectedPhi) {
      return { giaTruocThue: 0, thueSuat: 0, tienThue: 0, giaVAT: 0 };
    }

    const taxRate = Number(selectedPhi.pdvThue ?? thueSuatConfig ?? 0) || 0;

    const beforeTaxFromConfig = parseCurrency(
      String(selectedPhi.pdvKhoanphiTruocthue ?? 0),
    );

    // 1) Chốt giá trước thuế (luôn nguyên)
    const beforeTaxRaw = phiCanEdit ? giaDangKiemInput : beforeTaxFromConfig;
    const beforeTax = roundAccounting(beforeTaxRaw);

    // 2) Tính thuế theo thuế suất rồi làm tròn kế toán
    const tienThueRaw = beforeTax * (taxRate / 100);
    const tienThue = roundAccounting(tienThueRaw);

    // 3) VAT = trước thuế + thuế (khớp tuyệt đối)
    const giaVAT = beforeTax + tienThue;

    return { giaTruocThue: beforeTax, thueSuat: taxRate, tienThue, giaVAT };
  }, [selectedPhi, phiCanEdit, giaDangKiemInput, thueSuatConfig]);

  // Khi đổi loại phí: set selected + set default input (nếu editable)
  const handlePhiDichVuChange = (value: string | null) => {
    setSelectedPhiDichVu(value);
    if (!value) return;

    const selected = phiDichVuList.find(
      (item) => String(item.pdvId) === String(value),
    );
    if (!selected) return;

    // set default cho input theo cấu hình trước thuế
    const beforeTax = parseCurrency(String(selected.pdvKhoanphiTruocthue ?? 0));
    setGiaDangKiemInput(beforeTax);
  };

  // ==================== CREATE ====================
  const onCreateToll = async () => {
    try {
      setLoadingCreate(true);

      const now = new Date();
      const formattedDateTime = `${now.toLocaleDateString(
        "vi-VN",
      )} ${now.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;

      const tenPhiRaw = selectedPhi?.pdvNoidung ?? "Phí dịch vụ";
      const tenPhiFinal = buildTenPhi(tenPhiRaw, formattedDateTime, 45);

      // const params: HoSoPhiDichVuCreate = {
      const params: any = {
        pdvId: Number(selectedPhiDichVu),
        //   dùng từ memo
        phiThucTe: feeCalc.giaVAT,
        tenPhi: tenPhiFinal,
        lanThu: lanThu_PDK,
        accountGuidThanhToan: String(user?.guid),
        loaiPhiId: Number(3),
        trangThaiThanhToan: Number(hinhThucThanhToan) === 2,
        hinhThucThanhToan: Number(hinhThucThanhToan),
        trangThaiNo: Boolean(isGhiNo),
      };

      const hsId = result.hsId;
      // const response = await createHoSoPhiDichVu(params, hsId);
      const response = null;

      // if (response?.status === "OK" || response?.payload) {
      //   await _fetchListHoSoPhiDichVu();
      //   showNoti("success", "Tạo thu phí thành công !");
      // } else {
      //   showNoti("error", "Không thể tạo hồ sơ thu phí");
      // }
    } catch (error) {
      showNoti("error", "Có lỗi xảy ra khi tạo hồ sơ");
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleUpdateAndNext = async () => {
    const isThuPhiDaThanhToan = () => {
      const list = result?.listHoSoPhiDichVu || [];
      if (!list.length) return false;

      const allNo = list.every((i: any) => i.trangThaiNo === true);
      if (allNo) return true;

      return list.every((i: any) => i.trangThaiThanhToan === true);
    };

    const ok = validateAndGoStep({
      fromStep: 1,
      toStep: 2,
      result,
      isThuPhiDaThanhToan,
      showNoti,
    });

    if (!ok) return;

    await handleUpdateHoSo(false);
    onNext();

    setResult((prev: any) => ({
      ...prev,
      lanThu_PDK,
      //   đẩy calc từ memo
      giaVAT_PDK: feeCalc.giaVAT,
      giaDangKiem_PDK: feeCalc.giaTruocThue,
      thueSuat_PDK: feeCalc.thueSuat,
      tienThue_PDK: feeCalc.tienThue,
      hinhThucThanhToan,
    }));
  };

  // ==================== EFFECT ====================
  useEffect(() => {
    _getConfigFeeInfoSimple();
    _fetchListHoSoPhiDichVu();
    _fetchPhiDichVu();
  }, []);

  const phiDichVuOptions = useMemo(
    () =>
      phiDichVuList.map((item) => ({
        value: String(item.pdvId ?? ""),
        label: item.pdvNoidung ?? "",
      })),
    [phiDichVuList],
  );

  // ================= UI =================
  return (
    <Stack gap="md" mt="lg">
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Select
            label="Loại phí"
            placeholder="Chọn loại phí"
            data={phiDichVuOptions}
            value={selectedPhiDichVu}
            onChange={handlePhiDichVuChange}
            searchable
            disabled={disabled}
            comboboxProps={{
              withinPortal: false,
              position: "bottom",
            }}
            maxDropdownHeight={260}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <TextInput
            rightSection={
              phiCanEdit ? <Text style={{ fontSize: 14 }}>✏️</Text> : null
            }
            label={
              <div style={{ display: "flex", flexDirection: "row" }}>
                <span>Giá đăng kiểm (trước thuế) </span>
                {phiCanEdit && (
                  <span
                    style={{
                      fontSize: 12,
                      color: "#228be6",
                      marginTop: 2,
                      marginLeft: 10,
                    }}
                  >
                    (*) Mục này có thể chỉnh sửa
                  </span>
                )}
              </div>
            }
            value={feeCalc.giaTruocThue.toLocaleString("vi-VN")}
            onChange={(e) => {
              const raw = parseCurrency(e.currentTarget.value);
              setGiaDangKiemInput(raw);
            }}
            disabled={!phiCanEdit}
            styles={{
              input: {
                borderColor: phiCanEdit ? "#228be6" : "#ced4da",
                backgroundColor: phiCanEdit ? "#eef7ff" : "#f8f9fa",
                transition: "0.2s border-color",
              },
            }}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 2 }}>
          <TextInput
            label="Giá có VAT"
            value={feeCalc.giaVAT.toLocaleString("vi-VN")}
            readOnly
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 2 }}>
          <TextInput
            label="Thuế suất (%)"
            value={`${feeCalc.thueSuat}%`}
            readOnly
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <TextInput
            label="Tiền thuế"
            value={feeCalc.tienThue.toLocaleString("vi-VN")}
            readOnly
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Select
            label="Hình thức thanh toán"
            placeholder="Chọn hình thức"
            data={[
              { value: "1", label: "Trực tuyến" },
              { value: "2", label: "Trực tiếp" },
            ]}
            value={hinhThucThanhToan}
            onChange={(value) => setHinhThucThanhToan(value!)}
            disabled={disabled || isGhiNo}
            comboboxProps={{
              withinPortal: false,
              position: "bottom",
            }}
            maxDropdownHeight={260}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 2 }}>
          <Flex align="center" h="100%" pt={25}>
            <Checkbox
              label="Ghi nợ (khách chưa thanh toán)"
              checked={isGhiNo}
              onChange={(e) => {
                const checked = e.currentTarget.checked;
                setIsGhiNo(checked);

                if (checked) {
                  setHinhThucThanhToan("1");
                  showNoti(
                    "warning",
                    "Đã chọn ghi nợ: Hình thức thanh toán được cố định là Trực tuyến.",
                  );
                }
              }}
              disabled={disabled}
            />
          </Flex>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 2 }}>
          <Flex justify="right" align="center" h="100%" pt={25}>
            <Group justify="right">
              <Button
                color="blue"
                onClick={onCreateToll}
                loading={loadingCreate}
                disabled={
                  selectedPhiDichVu == null ||
                  selectedPhiDichVu == "0" ||
                  selectedPhiDichVu == "-1" ||
                  disabled
                }
              >
                Thêm phí
              </Button>
              <Button onClick={handleUpdateAndNext}>Bước tiếp theo</Button>
            </Group>
          </Flex>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
