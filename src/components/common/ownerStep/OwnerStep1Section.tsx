/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  Stack,
  TextInput,
  Button,
  Group,
  Box,
  ThemeIcon,
  Text,
  Grid,
  Drawer,
  ScrollArea,
  Flex,
  Paper,
  Modal,
  Select,
  Title,
  Badge,
  Card,
  Table,
  Checkbox,
} from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { showNoti } from "@/components/common/showNoti";
import {
  createChuPhuongTien,
  fetchChuPhuongTienList,
  getDetailChuPhuongTienById,
  updateChuPhuongTien,
} from "@/services/chu-phuong-tien/chuPhuongTienService";
import { ChuPhuongTien, ChuPhuongTienPut } from "@/types/type-chu-phuong-tien";
import {
  IconInfoCircle,
  IconPencil,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import { createHoSoDangKiem } from "@/services/ho-so-dang-kiem/hoSoDangKiemService";
import { useUser } from "@/context/UserContext";
import OwnerDrawerAddForm from "@/components/common/drawer/OwnerDrawerAddForm";
import OwnerListTable from "@/components/common/tables/OwnerListTable";
import CustomPagination from "@/components/common/CustomPagination";
import FormNoticeBox from "../FormNoticeBox";
import BienSoComponent from "@/components/pages/dashboard/BienSoComponent";
import { fetchLoaiPhuongTienList } from "@/services/danh-muc/dmLoaiPhuongTienService";
import { validateAndGoStep } from "@/utils/acceptanceFlow";

type Props = {
  ttId: number; //  chỉ thêm cái này
  result: any;
  setResult: (cb: any) => void;
  onNext: () => void;
  isStepDisabled?: boolean;
  updateResult: (data: any) => void;
};

export default function OwnerStep1Section({
  ttId,
  result,
  setResult,
  onNext,
  isStepDisabled,
  updateResult,
}: Props) {
  const [searchInfo, setSearchInfo] = useState({
    filterWithHoTenOrBienKiemSoat: "",
    filterWithCccdOrMst: "",
  });
  const { user } = useUser();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedOwner, setSelectedOwner] = useState<ChuPhuongTien | null>(
    null
  );
  const [detailOwner, setDetailOwner] = useState<ChuPhuongTien | null>(null);

  const [chuPhuongTienList, setChuPhuongTien] = useState<
    ChuPhuongTien[] | null
  >([]);
  const isEditMode = isStepDisabled || result?.bxlId >= 3;
  const [loadingFind, setSelectLoadingFind] = useState(false);
  const [searched, setSearched] = useState(false);
  const [drawerAddChuSoHuuOpened, setDrawerAddChuSoHuuOpened] = useState(false);
  const [isEditingChuSoHuu, setIsEditingChuSoHuu] = useState(false);
  const [selectedChuSoHuu, setSelectedChuSoHuu] =
    useState<ChuPhuongTien | null>(null);
  const [drawerDetailChuSoHuuOpened, setDrawerDetailChuSoHuuOpened] =
    useState(false);

  const [valueChuPhuongTien, setValueChuPhuongTien] =
    useState<ChuPhuongTienPut>({
      ttcptTen: "",
      ttcptDiachi: "",
      ttcptMasothue: "",
      ttcptCccd: "",
      ttcptIsDoanhNghiep: 0,
      ttcptSodienthoai: "",
      validMasothueWhenDoanhNghiep: true,
      ttId,
      bienKiemSoat: "",
    });

  const [editChuSoHuuValue, setEditChuSoHuuValue] = useState<ChuPhuongTienPut>({
    ttcptTen: "",
    ttcptDiachi: "",
    ttcptMasothue: "",
    ttcptCccd: "",
    ttcptIsDoanhNghiep: 0,
    ttcptSodienthoai: "",
    ttId,
    bienKiemSoat: "",
  });

  const handleSaveAndNext = async () => {
    console.log("[RUN_LOG] ===>  handleSaveAndNext : ", result);

    // if (result?.bxlId >= 3) {
    //   onNext();
    //   return;
    // }
    // if (!result.tenChuXe || !result.ttcptSodienthoai) {
    //   showNoti(
    //     "warning",
    //     "Vui lòng nhập đầy đủ Tên chủ phương tiện, Biển số và Ngày tiếp nhận trước khi lưu!"
    //   );
    //   return;
    // }

    const ok = validateAndGoStep({
      fromStep: 0,
      toStep: 1,
      result,
      isThuPhiDaThanhToan: () => true,
      showNoti,
    });

    if (!ok) return;

    updateResult({
      tenChuXe: result.tenChuXe,
      ttcptSodienthoai: result.ttcptSodienthoai,
      cccd: result.cccd,
      email: result.email,
      ttcptId: result.ttcptId,
      ttptBienkiemsoat: result.ttptBienkiemsoat,
    });

    const paramHSDK = {
      hsTenDangKiem: "Đăng kiểm phương tiện khác - " + String(result.tenChuXe),
      hsNgaytiepnhan: new Date().toISOString(),
      hsMa: "",
      organizationGuid: user?.organizationGuid,
      bxlId: 3,
      ttHsId: 3,
      // ttptId: Number(result?.ttptId),
      ttptId: result?.ttptId ? Number(result.ttptId) : 0,
      ttId,
      userIdTiepNhan: user?.guid,
      ttcptId: Number(result?.ttcptId),
    };

    const response = await createHoSoDangKiem(paramHSDK);
    showNoti("success", "Thêm hồ sơ tiếp nhận đăng kiểm thành công!");

    updateResult({
      hsId: response?.payload.hsId,
      bxlId: 3,
    });
    onNext();
  };

  async function detailChuPhuongTien(item: ChuPhuongTien) {
    const detail = await getDetailChuPhuongTienById(Number(item.ttcptId));
    const data = detail.payload;
    if (!data) return;

    setSelectedChuSoHuu(data as ChuPhuongTien);
    setDrawerDetailChuSoHuuOpened(true);

    setEditChuSoHuuValue({
      ttcptTen: data.ttcptTen || "",
      ttcptDiachi: data.ttcptDiachi || "",
      ttcptMasothue: data.ttcptMasothue || "",
      ttcptCccd: data.ttcptCccd || "",
      ttcptIsDoanhNghiep: data.ttcptIsDoanhNghiep || 0,
      ttcptSodienthoai: data.ttcptSodienthoai || "",
      ttId: Number(data.ttId) || ttId,
    });
  }

  const handleAddChuPhuongTien = async () => {
    try {
      if (!valueChuPhuongTien.ttcptTen?.trim()) {
        showNoti("warning", "Vui lòng nhập tên chủ sở hữu!");
        return;
      }

      if (valueChuPhuongTien.ttcptIsDoanhNghiep === 1) {
        if (!valueChuPhuongTien.ttcptMasothue?.trim()) {
          showNoti("warning", "Doanh nghiệp phải nhập mã số thuế!");
          return;
        }
      }

      await createChuPhuongTien(valueChuPhuongTien);
      onFind();
      showNoti("success", "Đã thêm mới chủ phương tiện!");

      setValueChuPhuongTien({
        ttcptTen: "",
        ttcptDiachi: "",
        ttcptMasothue: "",
        ttcptCccd: "",
        ttcptIsDoanhNghiep: 0,
        ttcptSodienthoai: "",
        validMasothueWhenDoanhNghiep: true,
        ttId,
      });

      setDrawerAddChuSoHuuOpened(false);
    } catch {
      showNoti("error", "Không thể tạo mới chủ phương tiện. Vui lòng thử lại!");
    }
  };

  const requestIdRef = useRef(0);
  const _getInforChuPhuongTien = async (
    nextPage = page,
    nextPageSize = pageSize,
    nextSearch = searchInfo
  ) => {
    const requestId = ++requestIdRef.current;

    try {
      setSelectLoadingFind(true);

      // Optional: clear list để khỏi thấy “dính” (tuỳ bạn muốn)
      setChuPhuongTien([]);

      const res = await fetchChuPhuongTienList({
        page: nextPage,
        pageSize: nextPageSize,
        filterWithHoTenOrBienKiemSoat: nextSearch.filterWithHoTenOrBienKiemSoat,
        filterWithCccdOrMst: nextSearch.filterWithCccdOrMst,
        // ttId: 3,
        ttId: ttId,
      });

      // Nếu có request mới hơn thì bỏ qua response cũ
      if (requestId !== requestIdRef.current) return;

      setChuPhuongTien(res.payload?.items || []);
      setTotalItems(res.payload?.totalElements ?? 0);
      setTotalPages(res.payload?.totalPages ?? 1);
    } finally {
      if (requestId === requestIdRef.current) {
        setSelectLoadingFind(false);
      }
    }
  };

  const _getListChuPhuongTien = async () => {
    const res = await fetchChuPhuongTienList({
      page,
      pageSize,
      filterWithHoTenOrBienKiemSoat: searchInfo.filterWithHoTenOrBienKiemSoat,
      filterWithCccdOrMst: searchInfo.filterWithCccdOrMst,
      ttId,
    });

    const items = res.payload?.items || [];
    setChuPhuongTien(items);
    setTotalItems(res.payload?.totalElements ?? 0);
    setTotalPages(res.payload?.totalPages ?? 1);
  };

  const onFind = async () => {
    setSearched(true);
    setPage(1);
    await _getInforChuPhuongTien(1, pageSize, searchInfo);
  };

  useEffect(() => {
    if (!searched) return;
    setSelectLoadingFind(true);
    _getListChuPhuongTien().finally(() => {
      setSelectLoadingFind(false);
    });
  }, [page, pageSize, searchInfo, searched]);

  const [loaiPhuongTien, setLoaiPhuongTien] = useState([]);
  const _fetchLoaiPhuongTienList = async () => {
    try {
      const res = await fetchLoaiPhuongTienList(1, 100, "*");
      const apiData = res.payload?.items || [];
      const loaiPhuongTien: any = [
        { value: "-1", label: "Tất cả" },
        ...apiData.map((item) => ({
          value: item.dmLptId.toString(),
          label: item.dmLptTen,
        })),
      ];
      setLoaiPhuongTien(loaiPhuongTien);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
    }
  };
  useEffect(() => {
    _fetchLoaiPhuongTienList();
  }, []);

  return (
    <Stack gap="md" mt="lg">
      <Grid gutter="md" align="end">
        <Grid.Col span={{ base: 12, md: 5 }}>
          <TextInput
            label="Tên/Số điện thoại"
            placeholder="Nhập Tên cá nhân - Doanh nghiệp hoặc Số điện thoại"
            value={searchInfo.filterWithHoTenOrBienKiemSoat}
            onChange={(e) =>
              setSearchInfo({
                ...searchInfo,
                filterWithHoTenOrBienKiemSoat: e.currentTarget.value,
              })
            }
            disabled={isEditMode}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <TextInput
            label="CCCD/Mã số thuế"
            placeholder="Nhập CCCD hoặc Mã số thuế"
            value={searchInfo.filterWithCccdOrMst}
            onChange={(e) =>
              setSearchInfo({
                ...searchInfo,
                filterWithCccdOrMst: e.currentTarget.value,
              })
            }
            disabled={isEditMode}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 2 }}>
          <Button
            fullWidth
            mt={25}
            loading={loadingFind}
            onClick={onFind}
            leftSection={!loadingFind ? <IconSearch size={16} /> : null}
            style={{ whiteSpace: "nowrap" }}
            disabled={isEditMode}
          >
            {loadingFind ? "Đang tìm..." : "Tìm"}
          </Button>
        </Grid.Col>
      </Grid>

      {searched && (
        <Box mt="md">
          {chuPhuongTienList === null ? null : chuPhuongTienList.length > 0 ? (
            <>
              <OwnerListTable
                ttId={ttId}
                chuPhuongTienList={chuPhuongTienList}
                // selected={selectedChuSoHuu}
                selected={selectedOwner}
                searched={searched}
                onSelect={(item) => {
                  setSelectedOwner(item);
                  if (!item) {
                    // setSelectedChuSoHuu(null);
                    setResult((prev: any) => ({
                      ...prev,
                      tenChuXe: "",
                      ttcptSodienthoai: "",
                      cccd: "",
                      ttcptMasothue: "",
                      ttcptId: null,
                    }));
                  } else {
                    // setSelectedChuSoHuu(item);
                    setResult((prev: any) => ({
                      ...prev,
                      tenChuXe: item.ttcptTen,
                      ttcptSodienthoai: item.ttcptSodienthoai,
                      cccd: item.ttcptCccd,
                      ttcptMasothue: item.ttcptMasothue,
                      ttcptId: item.ttcptId,
                    }));
                  }
                }}
                onViewDetail={(item) => {
                  setDetailOwner(item);
                  detailChuPhuongTien(item);
                }}
                page={page}
                pageSize={pageSize}
                updateResult={updateResult}
                result={result}
                setResult={setResult}
                onFind={onFind}
                loaiPhuongTien={loaiPhuongTien}
              />

              <CustomPagination
                totalItems={totalItems}
                totalPages={totalPages}
                page={page}
                pageSize={pageSize}
                setPage={setPage}
                setPageSize={setPageSize}
              />
            </>
          ) : (
            <Group align="flex-start" gap="sm">
              <ThemeIcon color="blue" variant="light" radius="xl">
                <IconInfoCircle size={18} />
              </ThemeIcon>
              <div>
                <Text fw={600} size="sm">
                  Thông báo
                </Text>
                <Text size="sm" c="dimmed">
                  Chúng tôi chưa tìm được thông tin đã đăng ký theo dữ liệu bạn
                  cung cấp.!
                </Text>
              </div>
            </Group>
          )}
        </Box>
      )}

      <Group mt="md" justify="flex-start">
        <Button
          variant="light"
          color="blue"
          leftSection={<IconPlus size={16} />}
          onClick={() => setDrawerAddChuSoHuuOpened(true)}
        >
          Thêm thông tin đăng kiểm
        </Button>
      </Group>

      <Group justify="flex-end" mt="md">
        <Button onClick={handleSaveAndNext}>Lưu và Tiếp tục</Button>
      </Group>

      <OwnerDrawerAddForm
        opened={drawerAddChuSoHuuOpened}
        onClose={() => setDrawerAddChuSoHuuOpened(false)}
        value={valueChuPhuongTien}
        onChange={setValueChuPhuongTien}
        onSubmit={handleAddChuPhuongTien}
      />
    </Stack>
  );
}
