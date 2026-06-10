/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { DateInput } from "@mantine/dates";
import "@mantine/dates/styles.css";
import { useState, useEffect } from "react";

function formatDateToMMDDYYYY(date: string | Date | null): string | null {
  if (!date) return null;
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}

interface DateFilterInputProps {
  label?: string;
  placeholder?: string;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  clearable?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  /** 🆕 Cho phép custom định dạng hiển thị, ví dụ "MM/DD/YYYY" hoặc "YYYY-MM-DD" */
  valueFormat?: string;
}

export default function DateFilterInput({
  label = "Chọn ngày",
  placeholder = "Chọn ngày",
  defaultValue = null,
  onChange,
  clearable = true,
  size = "sm",
  valueFormat = "DD/MM/YYYY", // 🧩 mặc định nếu không truyền
}: DateFilterInputProps) {
  const [value, setValue] = useState<string | null>(defaultValue);

  useEffect(() => {
    if (onChange) {
      onChange(formatDateToMMDDYYYY(value));
    }
  }, [value]);

  return (
    <DateInput
      label={label}
      placeholder={placeholder}
      clearable={clearable}
      size={size}
      value={value}
      onChange={setValue}
      valueFormat={valueFormat} // 🆕 cho phép override format từ ngoài
      popoverProps={{
        withinPortal: true,
        zIndex: 9999,
        position: "bottom-start",
        offset: 8,
      }}
      locale="vi"
    />
  );
}
