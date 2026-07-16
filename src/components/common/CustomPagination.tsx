import React, { useEffect, useState } from "react";
import { Pagination, Select, Group, Text } from "@mantine/core";

interface PaginationProps {
  totalItems: number; // tổng số phần tử
  totalPages?: number; // tổng số trang (từ backend)
  page: number; // trang hiện tại
  pageSize: number; // số item/trang
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  fetchData?: (page: number, pageSize: number) => void;
}

const CustomPagination: React.FC<PaginationProps> = ({
  totalItems,
  totalPages: propTotalPages,
  page,
  pageSize,
  setPage,
  setPageSize,
  fetchData,
}) => {
  const [totalPages, setTotalPages] = useState(
    propTotalPages || Math.ceil(totalItems / pageSize)
  );

  // Cập nhật tổng số trang khi props thay đổi
  useEffect(() => {
    setTotalPages(propTotalPages || Math.ceil(totalItems / pageSize));
  }, [propTotalPages, totalItems, pageSize]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (value: string | null) => {
    if (!value) return;
    const newSize = parseInt(value, 10);
    setPageSize(newSize);
    setPage(1);
  };

  if (totalPages <= 0) return null;

  return (
    <Group justify="right" gap="sm" mt="md">
      <Text size="sm" c="dimmed">
        Tổng số: {totalItems}
      </Text>

      <Select
        value={pageSize.toString()}
        onChange={handlePageSizeChange}
        data={[
          { value: "5", label: "5/trang" },
          { value: "10", label: "10/trang" },
          { value: "20", label: "20/trang" },
          { value: "50", label: "50/trang" },
          { value: "100", label: "100/trang" },
        ]}
        size="sm"
        w={120}
        comboboxProps={{
          withinPortal: false,
          position: "bottom",
        }}
        maxDropdownHeight={260}
      />

      <Pagination
        total={totalPages}
        value={page}
        onChange={handlePageChange}
        siblings={1}
        size="sm"
      />
    </Group>
  );
};

export default CustomPagination;
