"use client";

import {
  Drawer,
  Group,
  Text,
  Button,
  Card,
  Table,
  Title,
  Box,
  ThemeIcon,
  FileInput,
} from "@mantine/core";
import {
  IconDownload,
  IconFileSpreadsheet,
  IconInfoCircle,
  IconTable,
  IconUpload,
} from "@tabler/icons-react";

interface Props {
  opened: boolean;
  onClose: () => void;
}

export default function ImportHelpDrawer({ opened, onClose }: Props) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="80%"
      title={
        <Box>
          <Title order={3}>Hướng dẫn - Mẫu tập tin & Danh sách dữ liệu</Title>
        </Box>
      }
      overlayProps={{ opacity: 0.2, blur: 2 }}
    >
      <Group align="flex-start" gap="sm" w="100%" justify="flex-end">
        <ThemeIcon color="blue" variant="light" radius="xl">
          <IconInfoCircle size={18} />
        </ThemeIcon>
        <div>
          <Text fw={600} size="sm">
            Hướng dẫn
          </Text>
          <Text size="sm" c="dimmed">
            <Text span c="red">
              *
            </Text>{" "}
            Bạn có thể tải xuống để tham khảo hoặc chỉnh sửa ở mục{" "}
            <Text span fw={700}>
              Mẫu danh sách phương tiện cơ bản
            </Text>
            .
          </Text>
          <Text size="sm" c="dimmed">
            <Text span c="red">
              *
            </Text>{" "}
            Bạn chọn vào mục{" "}
            <Text span fw={700}>
              Thêm dữ liệu từ file (.xlsx)
            </Text>{" "}
            hệ thống sẽ tự động lấy danh sách từ file excel bạn đã chọn.
          </Text>
          <Text size="sm" c="dimmed">
            <Text span c="red">
              *
            </Text>{" "}
            Mục{" "}
            <Text span fw={700}>
              Ví dụ định dạng dữ liệu hợp lệ
            </Text>
            , sẽ hiển thị danh sách dữ liệu bạn chọn, sao đó bạn cần cập nhật
            lại Loại chủ PT, Loại PT và Phương tiện cho từng dòng dữ liệu
          </Text>
          <Text fw={600} size="sm" mt={25}>
            Lưu ý đối với Biển kiểm soát{" "}
            <Text span fw={700}>
              (65G1-445.67, 65G-445.67, 65GG-445.67)
            </Text>
          </Text>
          <Text size="sm" c="dimmed">
            <Text span c="red">
              (1)
            </Text>{" "}
            Mã tỉnh – 2 chữ số đầu{" "}
            <Text span fw={700}>
              (01–99)
            </Text>{" "}
            cho phép nhập tối đa 2 ký tự số
          </Text>
          <Text size="sm" c="dimmed">
            <Text span c="red">
              (2)
            </Text>{" "}
            Nhóm ký hiệu – gồm 1 chữ cái hoặc 1 chữ cái + 1 chữ số (cho phép
            nhập tối đa 2 ký tự{" "}
            <Text span fw={700}>
              A1,A,AA
            </Text>
            , chỉ cho nhập 2 chữ hoặc 1 chữ 1 số)
          </Text>
          <Text size="sm" c="dimmed">
            <Text span c="red">
              (3)
            </Text>{" "}
            Số sê-ri – 5 chữ số cuối{" "}
            <Text span fw={700}>
              {" "}
              (00001, 99999)
            </Text>
          </Text>
          <Text size="sm" c="dimmed">
            <Text span c="red">
              (4)
            </Text>{" "}
            Loại biển kiểm soát{" "}
            <Text span fw={700}>
              (X: Xanh, T: Trắng, V: Vàng)
            </Text>
          </Text>
        </div>
      </Group>

      {/* --- Mẫu tải --- */}
      <Group align="center" gap="xs" mb={10} mt={40}>
        <ThemeIcon variant="light" color="teal" radius="md">
          <IconFileSpreadsheet color="teal" size={22} />
        </ThemeIcon>
        <Text fw={600}>Mẫu danh sách phương tiện cơ bản</Text>
      </Group>
      <Card withBorder radius="md" p="md" mb="lg">
        <Group justify="space-between">
          <Group>
            <Text size="sm" c="dimmed" mt={4}>
              Gồm 6 cột: Biển số – Chủ phương tiện – Địa chỉ – Điện thoại - Thủ
              tục - Loại hình (loại chủ PT).
            </Text>
          </Group>

          <Button
            variant="light"
            color="teal"
            leftSection={<IconDownload size={16} />}
            component="a"
            href="/doc/template_import.xlsx"
            download
          >
            Tải xuống
          </Button>
        </Group>
      </Card>

      <Group align="center" gap="xs" mb={10} mt={40}>
        <ThemeIcon variant="light" color="teal" radius="md">
          <IconUpload color="teal" size={22} />
        </ThemeIcon>
        <Text fw={600}>Thêm dữ liệu từ file (.xlsx)</Text>
      </Group>
      <Card withBorder radius="md" p="md" mb="lg">
        <FileInput
          accept=".xlsx, .xls"
          placeholder="Chọn file Excel (template_import.xlsx)"
          onChange={() => {}}
          style={{ flex: 1 }}
          readOnly
        />
      </Card>

      <Group align="center" gap="xs" mb={10} mt={40}>
        <ThemeIcon variant="light" color="teal" radius="md">
          <IconTable color="teal" size={22} />
        </ThemeIcon>
        <Text fw={600}>Ví dụ định dạng dữ liệu hợp lệ</Text>
      </Group>
      {/* --- Danh sách giả --- */}
      <Card withBorder radius="md" p="md">
        {/** Mảng dữ liệu mẫu **/}
        {(() => {
          const sampleData = [
            {
              stt: 1,
              bienSo: "66C-066.16T",
              chuPT: "Nguyễn Thị Kim Vân",
              diaChi: "ấp 4, Tân Kiều, H. Tháp Mười, Đồng Tháp",
              dienThoai: "0377697766",
              thuTuc: "1",
              loaiChu: "1: cá nhận",
              loaiPT: "Ô tô",
              PT: "Xe tải",
            },
            {
              stt: 2,
              bienSo: "66A-066.56T",
              chuPT: "Võ Văn Đưa",
              diaChi: "235 Ấp 3, Mỹ Trà, TPCL, Đồng Tháp",
              dienThoai: "02773501225",
              thuTuc: "2",
              loaiChu: "2: Doanh nghiệp",
              loaiPT: "Container",
              PT: "Xe con",
            },
          ];

          return (
            <Table highlightOnHover striped="even" withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th
                    style={{
                      width: "5%",
                      fontWeight: 700,
                      textAlign: "center",
                    }}
                  >
                    STT
                  </Table.Th>
                  <Table.Th
                    style={{
                      width: "10%",
                      fontWeight: 700,
                      textAlign: "center",
                    }}
                  >
                    Biển kiểm soát đăng kiểm
                  </Table.Th>
                  <Table.Th
                    style={{
                      width: "10%",
                      fontWeight: 700,
                      textAlign: "center",
                    }}
                  >
                    Chủ phương tiện
                  </Table.Th>
                  <Table.Th
                    style={{
                      width: "25%",
                      fontWeight: 700,
                      textAlign: "center",
                    }}
                  >
                    Địa chỉ
                  </Table.Th>
                  <Table.Th
                    style={{
                      fontWeight: 700,
                      textAlign: "center",
                    }}
                  >
                    Điện Thoại
                  </Table.Th>

                  <Table.Th
                    style={{
                      width: "15%",
                      fontWeight: 700,
                      textAlign: "center",
                    }}
                  >
                    Thủ tục
                  </Table.Th>
                  <Table.Th
                    style={{
                      width: "15%",
                      fontWeight: 700,
                      textAlign: "center",
                    }}
                  >
                    Loại chủ PT
                  </Table.Th>
                  <Table.Th
                    style={{
                      width: "15%",
                      fontWeight: 700,
                      textAlign: "center",
                    }}
                  >
                    Loại phương tiện
                  </Table.Th>
                  <Table.Th
                    style={{
                      width: "15%",
                      fontWeight: 700,
                      textAlign: "center",
                    }}
                  >
                    Phương tiện
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {sampleData.map((row) => (
                  <Table.Tr key={row.stt}>
                    <Table.Td style={{ textAlign: "center" }}>
                      {row.stt}
                    </Table.Td>
                    <Table.Td>{row.bienSo}</Table.Td>
                    <Table.Td>{row.chuPT}</Table.Td>
                    <Table.Td>{row.diaChi}</Table.Td>
                    <Table.Td>{row.dienThoai}</Table.Td>
                    <Table.Td>{row.thuTuc}</Table.Td>
                    <Table.Td>{row.loaiChu}</Table.Td>
                    <Table.Td>{row.loaiPT}</Table.Td>
                    <Table.Td>{row.PT}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          );
        })()}
      </Card>
    </Drawer>
  );
}
