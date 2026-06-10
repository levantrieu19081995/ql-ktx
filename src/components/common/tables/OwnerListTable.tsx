/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
// src/components/common/tables/OwnerListTable.tsx
"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  Center,
  Checkbox,
  Flex,
  Group,
  Modal,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { STATUS_CHU_SO_HUU } from "@/constants/dataMagic";
import {
  ChuPhuongTien,
  ChuPhuongTienPut,
  ThongTinPhuongTien,
} from "@/types/type-chu-phuong-tien";
import { IconInfoCircle } from "@tabler/icons-react";
import CustomPagination from "../CustomPagination";
import {
  getDetailChuPhuongTienById,
  updateChuPhuongTien,
} from "@/services/chu-phuong-tien/chuPhuongTienService";
import { useEffect, useState } from "react";
import OwnerDrawerDetail from "../drawer/OwnerDrawerDetail";
import { showNoti } from "../showNoti";
import { ThongTinPhiDangKiem } from "@/types/global";
import FormNoticeBox from "../FormNoticeBox";
import { fetchPhuongTienList } from "@/services/danh-muc/dmPhuongTienService";
import { createThongTinPhuongTien } from "@/services/thong-tin-phuong-tien/thongTinPhuongTienService";
import { fetchLoaiPhuongTienList } from "@/services/danh-muc/dmLoaiPhuongTienService";

type Props = {
  ttId: number;
  chuPhuongTienList: ChuPhuongTien[] | null;
  selected: ChuPhuongTien | null;
  searched: boolean;
  onSelect: (item: ChuPhuongTien | null) => void;
  onViewDetail: (item: ChuPhuongTien) => void;
  page?: number;
  pageSize?: number;
  updateResult: (data: any) => void;
  result: any;

  setResult: (cb: any) => void;
  onFind: () => void;
  loaiPhuongTien: any;
};

export default function OwnerListTable({
  ttId,
  chuPhuongTienList,
  selected,
  searched,
  onSelect,
  onViewDetail,
  page = 1,
  pageSize = 5,
  updateResult,
  result,
  setResult,
  onFind,
  loaiPhuongTien,
}: Props) {
  // paginate danh sách chủ sở hửu
  const [modalAddXeOpened, setModalAddXeOpened] = useState(false);
  const [drawerDetailChuSoHuuOpened, setDrawerDetailChuSoHuuOpened] =
    useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedChuSoHuu, setSelectedChuSoHuu] =
    useState<ChuPhuongTien | null>(null);
  const [selectedXeList, setSelectedXeList] = useState<ThongTinPhuongTien[]>(
    [],
  );

  const [editChuSoHuuValue, setEditChuSoHuuValue] = useState<ChuPhuongTienPut>({
    ttcptTen: "",
    ttcptDiachi: "",
    ttcptMasothue: "",
    ttcptCccd: "",
    ttcptIsDoanhNghiep: 0,
    ttcptSodienthoai: "",
    ttId: 1,
  });

  const [resultThongTinPhiDangKiem, setResultThongTinPhiDangKiem] =
    useState<ThongTinPhiDangKiem>({
      tenChuXe: "",
      ttptBienkiemsoat: "",
      ngayTiepNhan: "",
    });
  const [isEditingChuSoHuu, setIsEditingChuSoHuu] = useState(false);

  const [plate, setPlate] = useState({
    maTinh: "", // 2 số
    nhomHieu: "", // 1 chữ hoặc 1 chữ + 1 số, hoặc 2 chữ
    soSeri: "", // 5 số
    loaiBien: "T", // X / T / V
  });

  const [phuongTienList, setPhuongTienList] = useState<
    { value: string; label: string }[]
  >([]);

  async function detailChuPhuongTien(item: ChuPhuongTien): Promise<void> {
    const detail = await getDetailChuPhuongTienById(Number(item.ttcptId));
    const data = detail.payload;
    console.log("[RUN_LOG] ===>  detailChuPhuongTien : ", item);

    if (!data) return;

    setSelectedChuSoHuu(data as ChuPhuongTien);
    setDrawerDetailChuSoHuuOpened(true);

    // NEW: set sẵn payload chủ sở hữu (khi chưa tick xe nào)
    setResultThongTinPhiDangKiem(buildOwnerOnlyResult(data as ChuPhuongTien));

    setEditChuSoHuuValue({
      ttcptTen: data.ttcptTen || "",
      ttcptDiachi: data.ttcptDiachi || "",
      ttcptMasothue: data.ttcptMasothue || "",
      ttcptCccd: data.ttcptCccd || "",
      ttcptIsDoanhNghiep: data.ttcptIsDoanhNghiep || 0,
      ttcptSodienthoai: data.ttcptSodienthoai || "",
      ttId: Number(data.ttId) || 1,
    });
  }

  const handleSaveEditChuSoHuu = async () => {
    if (!selectedChuSoHuu?.ttcptId) return;

    try {
      const res = await updateChuPhuongTien(
        selectedChuSoHuu.ttcptId,
        editChuSoHuuValue,
      );

      if (res?.status === "OK" && res?.payload) {
        const updated = res.payload;
        showNoti(
          "success",
          `Đã cập nhật thông tin cho "${updated.ttcptTen}" thành công!`,
        );

        if (result?.ttcptId === updated.ttcptId) {
          setResult((prev: any) => ({
            ...prev,
            tenChuXe: updated.ttcptTen,
            ttcptMasothue: updated.ttcptMasothue,
            ttcptSodienthoai: updated.ttcptSodienthoai,
            ttcptId: updated.ttcptId,
          }));
        }

        onFind?.();
      } else {
        showNoti("warning", "Không thể cập nhật thông tin.");
      }

      setIsEditingChuSoHuu(false);
      detailChuPhuongTien(selectedChuSoHuu);
    } catch {
      showNoti("error", "Không thể cập nhật. Vui lòng thử lại!");
    }
  };

  const toggleSelect = (xe: ThongTinPhuongTien) => {
    setSelectedXeList((prev) => {
      const currentId = prev?.[0]?.ttptId;
      if (currentId === xe.ttptId) return prev; //

      const today = new Date().toISOString();
      const xeWithExtra = {
        ...xe,
        ngayTiepNhan: today,
        tenChuXe: selectedChuSoHuu?.ttcptTen,
        maSoThue: selectedChuSoHuu?.ttcptMasothue,
        ttcptSodienthoai: selectedChuSoHuu?.ttcptSodienthoai,
        loaiPhuongTien: selectedChuSoHuu?.ttcptIsDoanhNghiep,
      };

      return [xeWithExtra] as any; //
    });
  };

  // const handleSaveThongTinDangKiem = async () => {
  //   console.log(
  //     "[RUN_LOG] ===>   handleSaveThongTinDangKiem: ",
  //     resultThongTinPhiDangKiem
  //   );

  //   setLoading(true);
  //   setDrawerDetailChuSoHuuOpened(false);
  //   await new Promise((res) => setTimeout(res, 300));

  //   // NEW: nếu chưa chọn xe nào → dùng payload chủ sở hữu
  //   const payloadToSave =
  //     selectedXeList.length === 0
  //       ? buildOwnerOnlyResult(selectedChuSoHuu)
  //       : resultThongTinPhiDangKiem;

  //   updateResult(payloadToSave);
  //   // updateResult(resultThongTinPhiDangKiem);
  //   setLoading(false);
  // };

  const handleSaveThongTinDangKiem = async () => {
    setLoading(true);
    setDrawerDetailChuSoHuuOpened(false);
    await new Promise((res) => setTimeout(res, 300));

    const payloadToSave =
      selectedXeList.length === 0
        ? buildOwnerOnlyResult(selectedChuSoHuu)
        : (selectedXeList[0] as any);

    //   commit ra ngoài (result)
    updateResult(payloadToSave);

    //   nếu bạn muốn result global cũng reflect (khỏi lệch)
    setResult((prev: any) => ({
      ...prev,
      ...payloadToSave,
    }));

    setLoading(false);
  };

  const [newXe, setNewXe] = useState({
    ttcptId: String(0),
    ttptBienkiemsoat: "",
    dmPtId: 0,
    dmLptId: 0,
  });

  const preAddXe = () => {
    if (selectedChuSoHuu) {
      setNewXe({
        ttcptId: String(selectedChuSoHuu.ttcptId),
        ttptBienkiemsoat: "",
        dmPtId: 0,
        dmLptId: 0,
      });
    }

    setDrawerDetailChuSoHuuOpened(false);
    setModalAddXeOpened(true);
  };

  const handleLoaiPhuongTienChange = async (val: string | null) => {
    const id = val ? parseInt(val) : 0;

    setNewXe({ ...newXe, dmLptId: id, dmPtId: 0 });

    if (id > 0) {
      try {
        const res = await fetchPhuongTienList({
          page: 1,
          pageSize: 500,
          keyWord: "*",
          dmLptId: id,
        });

        const list =
          res.payload?.items?.map((item: any) => ({
            value: String(item.dmPtId),
            label: item.dmPtTen,
          })) || [];
        setPhuongTienList(list);
      } catch (error) {
        console.error("Lỗi lấy phương tiện:", error);
        setPhuongTienList([]);
      }
    } else {
      setPhuongTienList([]);
    }
  };

  // Hàm xử lý thêm xe
  const handleAddXe = async () => {
    // Validate
    if (plate.maTinh.length !== 2) {
      showNoti("warning", "Mã tỉnh phải là 2 số!");
      return;
    }
    if (
      !/^[A-Z]{1,2}$/.test(plate.nhomHieu) &&
      !/^[A-Z][0-9]$/.test(plate.nhomHieu)
    ) {
      showNoti("warning", "Nhóm ký hiệu chỉ được nhập dạng A, AB hoặc A1!");
      return;
    }

    const len = plate.soSeri.length;
    if (len !== 4 && len !== 5) {
      showNoti("warning", "Số sê-ri phải có 4 hoặc 5 số!");
      return;
    }

    // Build final plate
    const soLeft = plate.soSeri.substring(0, 3);
    const soRight = plate.soSeri.substring(3, 5);

    const finalPlate = `${plate.maTinh}${plate.nhomHieu}-${soLeft}.${soRight}`;

    const formattedXe = {
      ...newXe,
      ttptBienkiemsoat: finalPlate.toUpperCase(),
    };

    const response = await createThongTinPhuongTien(formattedXe);

    // Reload danh sách chủ sở hữu (giống sửa chủ sở hữu)
    await Promise.resolve(onFind?.());
    showNoti("success", `Đã thêm thông tin xe thành công!`);
    setModalAddXeOpened(false);

    if (selectedChuSoHuu) {
      detailChuPhuongTien(selectedChuSoHuu);
    }
  };

  const buildOwnerOnlyResult = (owner: ChuPhuongTien | null) => {
    const today = new Date().toISOString();

    return {
      // fields cũ đang dùng
      tenChuXe: owner?.ttcptTen || "",
      ttptBienkiemsoat: "", // không chọn xe thì để rỗng
      ngayTiepNhan: today,

      // bổ sung đầy đủ thông tin chủ sở hữu (đúng yêu cầu bạn)
      ttcptId: owner?.ttcptId,
      maSoThue: owner?.ttcptMasothue,
      ttcptSodienthoai: owner?.ttcptSodienthoai,
      loaiPhuongTien: owner?.ttcptIsDoanhNghiep,
    };
  };

  useEffect(() => {
    if (!drawerDetailChuSoHuuOpened || !selectedChuSoHuu) return;

    // ✅ 1) mặc định: owner-only
    const ownerOnly = buildOwnerOnlyResult(selectedChuSoHuu);

    // ✅ 2) nếu result có xe đã lưu thì tick theo result
    const savedXeId = result?.ttptId; // ưu tiên id (ổn định nhất)
    // hoặc nếu hệ bạn không có ttptId thì dùng bienSo:
    // const savedPlate = result?.ttptBienkiemsoat;

    if (!savedXeId) {
      setSelectedXeList([]);
      setResultThongTinPhiDangKiem(ownerOnly);
      return;
    }

    const xeFound =
      selectedChuSoHuu.dsThongtinPhuongtien?.find(
        (x) => x.ttptId === savedXeId,
      ) ?? null;

    if (!xeFound) {
      setSelectedXeList([]);
      setResultThongTinPhiDangKiem(ownerOnly);
      return;
    }

    // build extra giống lúc chọn
    const today = new Date().toISOString();
    const xeWithExtra = {
      ...xeFound,
      ngayTiepNhan: today,
      tenChuXe: selectedChuSoHuu?.ttcptTen,
      maSoThue: selectedChuSoHuu?.ttcptMasothue,
      ttcptSodienthoai: selectedChuSoHuu?.ttcptSodienthoai,
      loaiPhuongTien: selectedChuSoHuu?.ttcptIsDoanhNghiep,
    };

    setSelectedXeList([xeWithExtra] as any);
    setResultThongTinPhiDangKiem(xeWithExtra as any);
  }, [drawerDetailChuSoHuuOpened, selectedChuSoHuu?.ttcptId, result?.ttptId]);

  useEffect(() => {
    if (selectedXeList.length === 0) {
      setResultThongTinPhiDangKiem(buildOwnerOnlyResult(selectedChuSoHuu));
      return;
    }

    setResultThongTinPhiDangKiem(selectedXeList[0] as any);
  }, [selectedXeList, selectedChuSoHuu?.ttcptId]);

  if (!searched) return null;

  return (
    <div style={{ marginTop: 16 }}>
      {chuPhuongTienList === null ? null : chuPhuongTienList.length > 0 ? (
        <Stack mt="md">
          {chuPhuongTienList && chuPhuongTienList.length > 0 ? (
            <>
              <Card withBorder radius="lg" p="lg">
                <Table striped={"even"} highlightOnHover withColumnBorders>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: "5%", textAlign: "center" }}>
                        STT
                      </Table.Th>
                      <Table.Th>Tên</Table.Th>
                      <Table.Th style={{ width: "20%", textAlign: "left" }}>
                        Loại chủ sở hữu
                      </Table.Th>

                      <Table.Th style={{ width: "15%", textAlign: "center" }}>
                        Số lượng phương tiện hiện có
                      </Table.Th>
                      <Table.Th style={{ width: "30%", textAlign: "center" }}>
                        Biển kiểm soát
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {chuPhuongTienList.map((item, index) => (
                      <Table.Tr
                        key={item.ttcptId}
                        onClick={() => detailChuPhuongTien(item)}
                        style={{ cursor: "pointer" }}
                      >
                        <Table.Td style={{ textAlign: "center" }}>
                          {(page - 1) * pageSize + index + 1}
                        </Table.Td>

                        <Table.Td>{item.ttcptTen}</Table.Td>

                        <Table.Td>
                          {(() => {
                            const status = STATUS_CHU_SO_HUU.find(
                              (s) => s.key === item.ttcptIsDoanhNghiep,
                            );
                            return status ? (
                              <Badge color={status.color} variant="light">
                                {status.label}
                              </Badge>
                            ) : (
                              <Center c="dimmed">–</Center>
                            );
                          })()}
                        </Table.Td>

                        <Table.Td style={{ textAlign: "center" }}>
                          {item.soLuongPhuongTien}
                        </Table.Td>

                        <Table.Td>
                          {item.dsThongtinPhuongtien &&
                          item.dsThongtinPhuongtien.length > 0 ? (
                            <Group gap={6} wrap="wrap">
                              {item.dsThongtinPhuongtien
                                .slice(0, 2)
                                .map((xe) => (
                                  <Badge
                                    key={xe.ttptId}
                                    variant="outline"
                                    color="blue"
                                    size="sm"
                                  >
                                    {xe.ttptBienkiemsoat}
                                  </Badge>
                                ))}

                              {item.dsThongtinPhuongtien.length > 2 && (
                                <Badge variant="light" color="gray" size="sm">
                                  +{item.dsThongtinPhuongtien.length - 2}
                                </Badge>
                              )}
                            </Group>
                          ) : (
                            <Center c="dimmed">–</Center>
                          )}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
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
                  Không có dữ liệu phù hợp!
                </Text>
              </div>
            </Group>
          )}
        </Stack>
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
              Chúng tôi chưa tìm được thông tin đã đăng ký theo dữ liệu bạn cung
              cấp.!
            </Text>
          </div>
        </Group>
      )}

      <OwnerDrawerDetail
        ttId={ttId}
        opened={drawerDetailChuSoHuuOpened}
        onClose={() => setDrawerDetailChuSoHuuOpened(false)}
        selected={selectedChuSoHuu}
        editValue={editChuSoHuuValue}
        setEditValue={setEditChuSoHuuValue}
        isEditing={isEditingChuSoHuu}
        setIsEditing={setIsEditingChuSoHuu}
        onSubmitEdit={handleSaveEditChuSoHuu}
        selectedXeList={selectedXeList}
        setSelectedXeList={setSelectedXeList}
        onToggleSelectXe={toggleSelect}
        onPreAddXe={preAddXe}
        onSaveThongTinDangKiem={handleSaveThongTinDangKiem}
      />

      {/* Modal thêm phương tiện */}
      <Modal
        size="xl" // TĂNG KÍCH THƯỚC MODAL
        opened={modalAddXeOpened}
        onClose={() => {
          setModalAddXeOpened(false);
          setDrawerDetailChuSoHuuOpened(true);
        }}
        title={
          <Box>
            <Title order={4} component="div">
              Thêm thông tin phương tiện mới
            </Title>
          </Box>
        }
        centered
      >
        <Stack gap="md">
          {/* === HÀNG BIỂN SỐ 4 TRƯỜNG === */}
          <Text fw={500} size="sm">
            Biển kiểm soát
          </Text>
          <Flex gap="md" wrap="wrap">
            <TextInput
              label="Mã tỉnh (2 số)"
              placeholder="VD: 65"
              value={plate.maTinh}
              maxLength={2}
              style={{ flex: 1 }}
              onChange={(e) => {
                const v = e.currentTarget.value.replace(/\D/g, "");
                setPlate({ ...plate, maTinh: v });
              }}
            />

            <TextInput
              label="Nhóm ký hiệu (A, G1, AB)"
              placeholder="VD: G1"
              value={plate.nhomHieu}
              maxLength={2}
              style={{ flex: 1 }}
              onChange={(e) => {
                const v = e.currentTarget.value.toUpperCase();
                if (
                  /^[A-Z]{1,2}$/.test(v) ||
                  /^[A-Z][0-9]$/.test(v) ||
                  v === ""
                )
                  setPlate({ ...plate, nhomHieu: v });
              }}
            />

            <TextInput
              label="Số sê-ri (5 số)"
              placeholder="VD: 44567"
              value={plate.soSeri}
              maxLength={5}
              style={{ flex: 1 }}
              onChange={(e) => {
                const v = e.currentTarget.value.replace(/\D/g, "");
                setPlate({ ...plate, soSeri: v });
              }}
            />
          </Flex>

          {/* === CHỌN LOẠI PHƯƠNG TIỆN === */}
          <Select
            label="Chọn loại phương tiện"
            placeholder="Loại phương tiện"
            data={loaiPhuongTien}
            value={String(newXe.dmLptId)}
            onChange={handleLoaiPhuongTienChange}
            required
          />

          {/* === CHỌN PHƯƠNG TIỆN CON === */}
          <Select
            label="Chọn phương tiện"
            placeholder="Chọn phương tiện"
            data={phuongTienList}
            value={String(newXe.dmPtId)}
            onChange={(val: any) =>
              setNewXe({ ...newXe, dmPtId: val ? parseInt(val) : 0 })
            }
            disabled={phuongTienList.length === 0}
            required
          />

          {/* Footer BUTTON */}
          <Group justify="flex-end" mt="md">
            <Button
              variant="default"
              onClick={() => {
                setModalAddXeOpened(false);
                setDrawerDetailChuSoHuuOpened(true);
              }}
            >
              Hủy
            </Button>
            <Button color="blue" onClick={handleAddXe}>
              Lưu phương tiện
            </Button>
          </Group>

          <FormNoticeBox />
        </Stack>
      </Modal>
    </div>
  );
}
