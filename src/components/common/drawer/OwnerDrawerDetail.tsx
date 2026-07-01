"use client";

import {
  Badge,
  Button,
  Card,
  Checkbox,
  Drawer,
  Flex,
  Group,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  ChuPhuongTien,
  ChuPhuongTienPut,
  ThongTinPhuongTien,
} from "@/types/type-chu-phuong-tien";
import { IconInfoCircle, IconPencil, IconPlus } from "@tabler/icons-react";
import BienSoComponent from "@/components/pages/dashboard/BienSoComponent";

type Props = {
  ttId: number;
  opened: boolean;
  onClose: () => void;

  selected: ChuPhuongTien | null;

  editValue: ChuPhuongTienPut;
  setEditValue: (v: ChuPhuongTienPut) => void;

  isEditing: boolean;
  setIsEditing: (v: boolean) => void;

  onSubmitEdit: () => void;

  // phần xe (nếu muốn giữ y như bạn đang làm)
  selectedXeList: ThongTinPhuongTien[];
  setSelectedXeList: React.Dispatch<React.SetStateAction<ThongTinPhuongTien[]>>;

  onToggleSelectXe: (xe: ThongTinPhuongTien) => void;
  onPreAddXe?: () => void;

  onSaveThongTinDangKiem?: () => void;
};

export default function OwnerDrawerDetail({
  ttId,
  opened,
  onClose,
  selected,
  editValue,
  setEditValue,
  isEditing,
  setIsEditing,
  onSubmitEdit,
  selectedXeList,
  onToggleSelectXe,
  onPreAddXe,
  onSaveThongTinDangKiem,
}: Props) {
  const LABEL_W = 110;

  return (
    <Drawer
      size="70%"
      position="right"
      opened={opened}
      onClose={onClose}
      title={
        <Group justify="space-between">
          <Title order={4}>Thông tin chi tiết chủ sở hữu</Title>

          {!isEditing && (
            <Button
              size="xs"
              variant="subtle"
              color="blue"
              leftSection={<IconPencil size={14} />}
              onClick={() => setIsEditing(true)}
            >
              Sửa
            </Button>
          )}
        </Group>
      }
    >
      <Flex direction="column" style={{ height: "100%" }}>
        <ScrollArea style={{ flex: 1, paddingRight: 8 }}>
          {selected && (
            <Stack gap="md">
              {/* Thông tin chủ sở hữu */}
              <Paper withBorder p="md" radius="md">
                {!isEditing ? (
                  <Group
                    align="flex-start"
                    justify="space-between"
                    wrap="nowrap"
                  >
                    <Stack gap={8}>
                      <Flex align="flex-start" gap="sm">
                        <Text style={{ width: LABEL_W, flexShrink: 0 }}>
                          Tên:
                        </Text>
                        <Text c="blue" fw={500} style={{ flex: 1 }}>
                          {selected.ttcptTen}
                        </Text>
                      </Flex>

                      <Flex align="flex-start" gap="sm">
                        <Text style={{ width: LABEL_W, flexShrink: 0 }}>
                          Địa chỉ:
                        </Text>
                        <Text fw={500} style={{ flex: 1 }}>
                          {selected.ttcptDiachi}
                        </Text>
                      </Flex>

                      <Flex align="flex-start" gap="sm">
                        <Text style={{ width: LABEL_W, flexShrink: 0 }}>
                          SĐT:
                        </Text>
                        <Text fw={500} style={{ flex: 1 }}>
                          {selected.ttcptSodienthoai}
                        </Text>
                      </Flex>

                      <Flex align="flex-start" gap="sm">
                        <Text style={{ width: LABEL_W, flexShrink: 0 }}>
                          CCCD:
                        </Text>
                        <Text fw={500} style={{ flex: 1 }}>
                          {selected.ttcptCccd}
                        </Text>
                      </Flex>

                      <Flex align="flex-start" gap="sm">
                        <Text style={{ width: LABEL_W, flexShrink: 0 }}>
                          Mã số thuế:
                        </Text>
                        <Text fw={500} style={{ flex: 1 }}>
                          {selected.ttcptMasothue || "—"}
                        </Text>
                      </Flex>

                      <Flex align="center" gap="sm">
                        <Text style={{ width: LABEL_W, flexShrink: 0 }}>
                          Loại:
                        </Text>
                        {selected.ttcptIsDoanhNghiep === 1 ? (
                          <Badge color="blue" variant="light">
                            Doanh nghiệp
                          </Badge>
                        ) : (
                          <Badge color="green" variant="light">
                            Cá nhân
                          </Badge>
                        )}
                      </Flex>
                    </Stack>
                    <Paper
                      style={{
                        width: 420,
                        flexShrink: 0,
                        position: "relative",
                        minHeight: 160, //  tạo chiều cao để bottom hoạt động
                        overflow: "visible", //  cho phép div absolute vươn ra ngoài Paper
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          right: 8,
                          background: "rgba(255,255,255,0.96)",
                          borderRadius: "12px",
                          boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                          border: "1px solid rgba(0,0,0,0.1)",
                          padding: "14px 18px",
                          width: "350px",
                          fontSize: "13px",
                          color: "#333",
                          lineHeight: "1.4",
                          zIndex: 9999, //  tăng lên để tránh bị lớp khác đè
                        }}
                      >
                        <Text fw={600} size="sm" c="blue">
                          Ghi chú
                        </Text>
                        <Text size="sm">
                          <Text span c="red">
                            *
                          </Text>{" "}
                          Bạn có thể <b>không chọn xe</b>. Nút “Lưu thông tin”
                          vẫn lưu thông tin chủ sở hữu.
                        </Text>
                        <Text size="sm">
                          <Text span c="red">
                            *
                          </Text>{" "}
                          Đã chọn: <b>{selectedXeList.length}</b> xe
                        </Text>
                      </div>
                    </Paper>
                  </Group>
                ) : (
                  <Stack gap="sm" mt="sm">
                    <TextInput
                      label="Tên chủ sở hữu"
                      value={editValue.ttcptTen}
                      onChange={(e) =>
                        setEditValue({
                          ...editValue,
                          ttcptTen: e.currentTarget.value,
                        })
                      }
                    />

                    <TextInput
                      label="Địa chỉ"
                      value={editValue.ttcptDiachi}
                      onChange={(e) =>
                        setEditValue({
                          ...editValue,
                          ttcptDiachi: e.currentTarget.value,
                        })
                      }
                    />
                    <TextInput
                      label="Số điện thoại"
                      value={editValue.ttcptSodienthoai}
                      onChange={(e) =>
                        setEditValue({
                          ...editValue,
                          ttcptSodienthoai: e.currentTarget.value,
                        })
                      }
                    />
                    <TextInput
                      label="CCCD"
                      value={editValue.ttcptCccd}
                      onChange={(e) =>
                        setEditValue({
                          ...editValue,
                          ttcptCccd: e.currentTarget.value,
                        })
                      }
                    />
                    <TextInput
                      label="Mã số thuế"
                      value={editValue.ttcptMasothue}
                      onChange={(e) =>
                        setEditValue({
                          ...editValue,
                          ttcptMasothue: e.currentTarget.value,
                        })
                      }
                    />
                    <Select
                      label="Loại chủ sở hữu"
                      data={[
                        { value: "0", label: "Cá nhân" },
                        { value: "1", label: "Doanh nghiệp" },
                      ]}
                      value={String(editValue.ttcptIsDoanhNghiep)}
                      onChange={(val) =>
                        setEditValue({
                          ...editValue,
                          ttcptIsDoanhNghiep: Number(val),
                        })
                      }
                      comboboxProps={{
                        withinPortal: false,
                        position: "bottom",
                      }}
                      maxDropdownHeight={260}
                    />

                    <Group justify="flex-end" mt="md">
                      <Button
                        variant="default"
                        onClick={() => {
                          setIsEditing(false);
                          // reset lại form theo selected
                          setEditValue({
                            ...editValue,
                            ttcptTen: selected.ttcptTen || "",
                            ttcptDiachi: selected.ttcptDiachi || "",
                            ttcptMasothue: selected.ttcptMasothue || "",
                            ttcptCccd: selected.ttcptCccd || "",
                            ttcptIsDoanhNghiep:
                              selected.ttcptIsDoanhNghiep ?? 0,
                            ttcptSodienthoai: selected.ttcptSodienthoai || "",
                            ttId: Number(selected.ttId) || ttId,
                          });
                        }}
                      >
                        Hủy
                      </Button>

                      <Button color="blue" onClick={onSubmitEdit}>
                        Lưu thay đổi
                      </Button>
                    </Group>
                  </Stack>
                )}
              </Paper>

              {/* Danh sách phương tiện */}
              <Card withBorder radius="lg" p="lg">
                <Group justify="space-between" mb="xs">
                  <Title order={4} mb="md">
                    Danh sách phương tiện
                  </Title>
                </Group>

                <Table striped={"even"} highlightOnHover withColumnBorders>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ textAlign: "center" }}>
                        Mã số sinh viên
                      </Table.Th>
                      <Table.Th style={{ width: "25%", textAlign: "center" }}>
                        Họ và tên
                      </Table.Th>
                      <Table.Th style={{ textAlign: "center" }}>
                        Đối tượng
                      </Table.Th>
                      {/* đổi tiêu đề cột */}
                      <Table.Th style={{ width: "20%", textAlign: "center" }}>
                        Đăng ký nội trú{" "}
                        <Text span c="dimmed">
                          (tuỳ chọn)
                        </Text>
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>
                    {selected.dsThongtinPhuongtien?.map((xe: any, idx: any) => (
                      <Table.Tr key={xe.ttptId}>
                        <Table.Td>
                          <BienSoComponent
                            value={xe.ttptBienkiemsoat.toLocaleUpperCase()}
                          />
                        </Table.Td>
                        <Table.Td>{xe.dmLptTen}</Table.Td>
                        <Table.Td>{xe.dmPtTen}</Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          <Flex justify="center">
                            <Checkbox
                              checked={selectedXeList.some(
                                (x) => x.ttptId === xe.ttptId,
                              )}
                              onChange={() => onToggleSelectXe(xe)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </Flex>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>

                {onPreAddXe && (
                  <Group mt="md" justify="flex-start">
                    <Button
                      variant="light"
                      color="blue"
                      leftSection={<IconPlus size={16} />}
                      onClick={onPreAddXe}
                    >
                      Thêm phương tiện
                    </Button>
                  </Group>
                )}
              </Card>

              {/* Footer */}
              <Group justify="flex-end" mt="md">
                <Button variant="default" onClick={onClose}>
                  Đóng
                </Button>
                {onSaveThongTinDangKiem && (
                  <Button color="blue" onClick={onSaveThongTinDangKiem}>
                    Lưu thông tin
                  </Button>
                )}
              </Group>
            </Stack>
          )}
        </ScrollArea>
      </Flex>
    </Drawer>
  );
}
