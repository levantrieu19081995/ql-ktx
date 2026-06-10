"use client";
import {
  Card,
  Title,
  Table,
  Group,
  Badge,
  Tooltip,
  ActionIcon,
  Text,
  Button,
  Flex,
  Loader,
} from "@mantine/core";
import {
  IconCheck,
  IconFileInvoice,
  IconPencil,
  IconReportMoney,
  IconTrash,
} from "@tabler/icons-react";
import {
  exportPhieuTamThu,
  getRunningNo,
} from "@/utils/export/exportPhieuTamThu";
import { HoSoPhiDichVuItem } from "@/types/global";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useState } from "react";
import { showNoti } from "@/components/common/showNoti";
import {
  softDeleteHoSoPhiDichVu,
  updateHoSoPhiDichVu,
} from "@/services/ho-so-phu-dich-vu/hoSoPhiDichVuService";
import PaymentEditModal from "./PaymentEditModal";
import {
  openDisplayOnSecondary,
  waitForDisplayReady,
} from "@/utils/QR/openTab";

export default function PaymentListCard({
  result,
  setResult,
  handleExportInvoice,
  onCreateThanhToan,
  handlePreviewInvoice,
  selectedPreview,
  setSelectedPreview,
  refreshListThuPhi,
  loadingDownload,
  setLoadingDownload,
}: {
  result: any;
  setResult: (v: any) => void;
  handleExportInvoice: (date: string, fkey: string) => void;
  onCreateThanhToan: () => void;
  handlePreviewInvoice: () => void;
  selectedPreview: string[];
  // setSelectedPreview: React.Dispatch<React.SetStateAction<number[]>>;
  setSelectedPreview: React.Dispatch<React.SetStateAction<string[]>>;
  refreshListThuPhi: () => Promise<void>;

  loadingDownload: string | null;
  setLoadingDownload: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  // State cho modal xác nhận
  const now = new Date();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDelete, setSelectedDelete] =
    useState<HoSoPhiDichVuItem | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<HoSoPhiDichVuItem | null>(null);
  const [editName, setEditName] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Khi bấm nút thùng rác
  const handleDeleteRow = (item: HoSoPhiDichVuItem) => {
    setSelectedDelete(item);
    setConfirmOpen(true);
  };

  // Khi xác nhận xóa trong modal
  const handleDeleteConfirm = async () => {
    console.log(
      "[RUN_LOG] ===> handleDeleteConfirm selectedDelete  : ",
      selectedDelete,
    );
    if (!selectedDelete) return;

    setLoadingDelete(true);
    try {
      //  Gọi API xóa mềm
      const res = await softDeleteHoSoPhiDichVu(
        selectedDelete.hsId,
        selectedDelete.pdvId,
        Number(selectedDelete.lanThu) || 1,
      );

      if (res?.status === "OK") {
        showNoti(
          "success",
          `Đã xóa mềm phí "${selectedDelete.tenPhi}" khỏi danh sách.`,
        );

        // Cập nhật tạm trong UI
        setResult((prev: any) => ({
          ...prev,
          listHoSoPhiDichVu: prev.listHoSoPhiDichVu.filter(
            (item: HoSoPhiDichVuItem) => item.pdvId !== selectedDelete.pdvId,
          ),
        }));

        await refreshListThuPhi();
      } else {
        showNoti(
          "warning",
          res?.message || "Không thể xóa mềm hồ sơ phí dịch vụ.",
        );
      }
    } catch (error) {
      console.error("Error soft deleting:", error);
      showNoti("error", "Không thể kết nối đến máy chủ. Vui lòng thử lại.");
    } finally {
      setLoadingDelete(false);
      setConfirmOpen(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;

    setSavingEdit(true);

    try {
      const body = {
        tenPhi: editName,
        pdvId: Number(editItem.pdvId),
        phiThucTe: Number(editItem.phiThucTe),
        lanThu: String(editItem.lanThu),
        loaiPhiId: Number(editItem.loaiPhiId),
        hinhThucThanhToan: Number(editItem.hinhThucThanhToan),
        trangThaiThanhToan: Boolean(editItem.trangThaiThanhToan),
        trangThaiNo: Boolean(editItem.trangThaiNo),
      };

      const res = await updateHoSoPhiDichVu(Number(editItem.hsId), body);

      if (res?.status === "OK") {
        showNoti("success", "Cập nhật tên phí thành công!");

        setResult((prev: any) => ({
          ...prev,
          listHoSoPhiDichVu: prev.listHoSoPhiDichVu.map((x: any) =>
            x.pdvId === editItem.pdvId ? { ...x, tenPhi: editName } : x,
          ),
        }));
      }
    } finally {
      setSavingEdit(false);
      setEditOpen(false);
    }
  };
  console.log(
    "[RUN_LOG] ===> result.listHoSoPhiDichVu  : ",
    result.listHoSoPhiDichVu,
  );

  const [selectedPhieu, setSelectedPhieu] = useState<string[]>([]);

  const formatMoneyStr = (val: any) => {
    const num = Number(val ?? 0);
    return isNaN(num) ? "0" : num.toLocaleString("vi-VN");
  };

  const buildTongCongPhieuTamThu = () => {
    const list: HoSoPhiDichVuItem[] = (result?.listHoSoPhiDichVu || []).filter(
      (x: HoSoPhiDichVuItem) =>
        selectedPhieu.includes(`${x.pdvId}-${x.lanThu}`),
    );

    const amounts = list.map((x) => Number(x.phiThucTe ?? 0));
    const sum = amounts.reduce((a, b) => a + b, 0);

    const expr = amounts.map((n) => formatMoneyStr(n)).join(" + ");
    // const tenPhiStr = list
    //   .map((x) => x.tenPhi)
    //   .filter(Boolean)
    //   .join(", ");

    // ví dụ: "50.000 + 100.000 = 150.000 đ (Phí A, Phí B)"
    // const text = `${expr || "0"} = ${formatMoneyStr(sum)} đ${
    //   tenPhiStr ? ` (${tenPhiStr})` : ""
    // }`;
    const text = `${expr || "0"} = ${formatMoneyStr(sum)} đ`;

    return { text, sum, list };
  };

  return (
    <Card withBorder radius="lg" p="lg" mt="md" shadow="sm">
      <Flex justify="space-between" align="center" mb="md">
        <Title order={5}>Danh sách thu phí đăng kiểm</Title>
      </Flex>

      <Table striped highlightOnHover withColumnBorders withRowBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ textAlign: "center", width: "5%" }}>
              STT
            </Table.Th>
            <Table.Th>Tên phí</Table.Th>
            <Table.Th style={{ textAlign: "center", width: "5%" }}>
              Lần thu
            </Table.Th>
            <Table.Th style={{ textAlign: "center", width: "15%" }}>
              Trạng thái
            </Table.Th>
            <Table.Th style={{ textAlign: "center", width: "8%" }}>
              Ghi nợ
            </Table.Th>
            <Table.Th style={{ textAlign: "center", width: "12%" }}>
              Hình thức thanh toán
            </Table.Th>
            <Table.Th style={{ textAlign: "center", width: "8%" }}>
              Số tiền
            </Table.Th>
            <Table.Th style={{ textAlign: "center", width: "8%" }}>
              Phiếu tạm thu
            </Table.Th>

            <Table.Th style={{ textAlign: "center", width: "8%" }}>
              Xuất hóa đơn
            </Table.Th>
            <Table.Th style={{ textAlign: "center", width: "8%" }}>
              Chọn thanh toán
            </Table.Th>
            <Table.Th style={{ textAlign: "center", width: "5%" }}>
              Xóa
            </Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {(result?.listHoSoPhiDichVu || []).length > 0 ? (
            result.listHoSoPhiDichVu.map(
              (item: HoSoPhiDichVuItem, index: number) => (
                <Table.Tr key={item.pdvId || index}>
                  <Table.Td align="center">{index + 1}</Table.Td>
                  <Table.Td>
                    <Flex
                      align="center"
                      justify="space-between"
                      className="fee-name-row"
                    >
                      {item.tenPhi}

                      <Tooltip label="Chỉnh sửa tên phí">
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="blue"
                          onClick={() => {
                            setEditItem(item);
                            setEditName(item.tenPhi);
                            setEditOpen(true);
                          }}
                        >
                          <IconPencil size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Flex>
                  </Table.Td>

                  <Table.Td align="center">{item.lanThu}</Table.Td>
                  <Table.Td align="center">
                    {item.trangThaiThanhToan ? (
                      <Badge color="teal">Đã thanh toán</Badge>
                    ) : (
                      <Badge color="orange">Chưa thanh toán</Badge>
                    )}
                  </Table.Td>

                  {/* === CỘT GHI NỢ   === */}
                  <Table.Td align="center">
                    {item.trangThaiNo ? (
                      <Badge color="red" variant="light">
                        Đang ghi nợ
                      </Badge>
                    ) : (
                      <Text c="dimmed" size="xs" fs="italic">
                        —
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td align="center">
                    {item.hinhThucThanhToanTen}
                  </Table.Td>
                  <Table.Td align="center">
                    {item.phiThucTe ? item.phiThucTe.toLocaleString() : "0"}
                  </Table.Td>

                  {/* Phiếu tạm thu */}
                  {/* <Table.Td align="center">
                    <Tooltip label="Phiếu tạm thu">
                      <ActionIcon
                        color="blue"
                        variant="subtle"
                        onClick={() =>
                          exportPhieuTamThu({
                            soPhieu: "001",
                            bienSo: result.ttptBienkiemsoat,
                            tongTien: `${
                              item.phiThucTe?.toLocaleString() ?? "0"
                            }`,
                            ngay: now.getDate().toString(), // ngày hiện tại
                            thang: (now.getMonth() + 1).toString(), // tháng (0–11 → +1)
                            nam: now.getFullYear().toString(),
                            nguoiLap: result.tenChuXe,
                          })
                        }
                      >
                        <IconReportMoney size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Table.Td> */}

                  <Table.Td align="center">
                    <input
                      type="checkbox"
                      checked={selectedPhieu.includes(
                        `${item.pdvId}-${item.lanThu}`,
                      )}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const key = `${item.pdvId}-${item.lanThu}`;

                        setSelectedPhieu((prev) => {
                          const s = new Set(prev);
                          if (checked) s.add(key);
                          else s.delete(key);
                          return Array.from(s);
                        });
                      }}
                    />
                  </Table.Td>

                  <Table.Td align="center">
                    {item.fkey ? (
                      // Có fkey → hiện đã check luôn
                      <Text c="green" fw={600}>
                        ✓
                      </Text>
                    ) : (!item.fkey && item.trangThaiThanhToan) ||
                      (!item.fkey && item.trangThaiNo) ? (
                      <input
                        type="checkbox"
                        checked={selectedPreview.includes(
                          `${item.pdvId}-${item.lanThu}`,
                        )}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const key = `${item.pdvId}-${item.lanThu}`;

                          setSelectedPreview((prev) => {
                            const newSet = new Set(prev);
                            if (checked) newSet.add(key);
                            else newSet.delete(key);
                            return Array.from(newSet);
                          });
                        }}
                      />
                    ) : (
                      <Text c="dimmed" size="xs" fs="italic">
                        —
                      </Text>
                    )}
                  </Table.Td>

                  {/* Checkbox chọn thanh toán */}
                  <Table.Td align="center">
                    {item.trangThaiThanhToan ? (
                      <Text c="green" fw={600}>
                        ✓
                      </Text>
                    ) : (
                      <input
                        type="checkbox"
                        checked={
                          !!result?.selected?.includes(
                            `${item.pdvId}-${item.lanThu}`,
                          )
                        }
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const key = `${item.pdvId}-${item.lanThu}`;

                          setResult((prev: any) => {
                            const selected = new Set(prev?.selected || []);
                            if (checked) selected.add(key);
                            else selected.delete(key);
                            return { ...prev, selected: Array.from(selected) };
                          });
                        }}
                      />
                    )}
                  </Table.Td>
                  <Table.Td align="center">
                    {item.trangThaiThanhToan ? (
                      <Text c="dimmed" size="xs" fs="italic">
                        —
                      </Text>
                    ) : (
                      <Tooltip label="Xóa dòng này">
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={() => handleDeleteRow(item)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Table.Td>
                </Table.Tr>
              ),
            )
          ) : (
            <Table.Tr>
              <Table.Td colSpan={9} align="center">
                <Text c="dimmed">Chưa có dữ liệu thu phí</Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>

      {/* Nút xử lý hàng loạt */}
      <Group justify="flex-end" mt="md" gap="sm">
        {selectedPhieu.length > 0 && (
          <Button
            color="teal"
            variant="outline"
            onClick={() => {
              const { text } = buildTongCongPhieuTamThu();

              exportPhieuTamThu({
                soPhieu: getRunningNo(result.hsMa),
                bienSo: result.ttptBienkiemsoat,
                tongTien: text, // <-- CHUỖI PHÉP TÍNH NHÉ
                ngay: now.getDate().toString(),
                thang: (now.getMonth() + 1).toString(),
                nam: now.getFullYear().toString(),
                nguoiLap: result.tenChuXe,
              });
            }}
          >
            In phiếu tạm thu ({selectedPhieu.length})
          </Button>
        )}

        {selectedPreview.length > 0 && (
          <Button variant="outline" color="gray" onClick={handlePreviewInvoice}>
            Xem trước thông tin hóa đơn ({selectedPreview.length})
          </Button>
        )}
        {result?.selected?.length > 0 && (
          <Button
            color="blue"
            // onClick={onCreateThanhToan}
            onClick={async () => {
              await openDisplayOnSecondary("6601"); // mở popup trước
              const ok = await waitForDisplayReady("6601"); // đợi tab phụ ready

              if (!ok) {
                // tuỳ bạn: vẫn cho chạy hoặc báo lỗi
                // showNoti("warning", "Màn hình phụ mở chậm, vui lòng thử lại.");
                // return;
              }

              onCreateThanhToan(); // rồi mới mở modal
            }}
          >
            Thanh toán {result.selected.length} dòng
          </Button>
        )}
      </Group>

      {/* Dialog xác nhận xóa */}
      <ConfirmDialog
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa loại phí: "${selectedDelete?.tenPhi}" không?`}
        reloginLabel="Hủy"
        continueLabel="Xóa"
        loading={loadingDelete}
      />

      <PaymentEditModal
        opened={editOpen}
        onClose={() => setEditOpen(false)}
        value={editName}
        onChange={setEditName}
        onSubmit={handleSaveEdit}
        loading={savingEdit}
      />
    </Card>
  );
}
