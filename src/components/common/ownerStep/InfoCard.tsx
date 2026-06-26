"use client";
import { Card, Title, Grid, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";

export default function InfoCard({ result }: { result: any }) {
  if (!result) return null;

  const ngayTiepNhanValue =
    result.ngayTiepNhan && !isNaN(new Date(result.ngayTiepNhan).getTime())
      ? new Date(result.ngayTiepNhan)
      : null;

  return (
    <Card withBorder radius="lg" p="lg" mt="md">
      <Title order={5}>Thông tin tiếp nhận nội trú</Title>
      <Grid gutter="md" mb="md">
        <Grid.Col span={{ base: 12, md: 2 }}>
          <TextInput
            label="Họ và tên"
            value={result.tenChuXe}
            readOnly
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 2 }}>
          <TextInput
            label="Mã số sinh viên"
            value={result.ttptBienkiemsoat}
            readOnly
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 2 }}>
          <TextInput
            label="Số điện thoại"
            value={result.ttcptSodienthoai}
            readOnly
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 2 }}>
          <DatePickerInput
            label="Ngày tiếp nhận"
            value={ngayTiepNhanValue}
            readOnly
            locale="vi"
            valueFormat="DD/MM/YYYY"
            placeholder="—"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 2 }}>
          <TextInput
            label="Đối tượng"
            value={result.loaiPhuongTien == 1 ? "Sinh viên" : "Cán bộ"}
            readOnly
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 2 }}>
          <TextInput label="Lớp / Khoa" value={result.maSoThue} readOnly />
        </Grid.Col>
      </Grid>
    </Card>
  );
}
