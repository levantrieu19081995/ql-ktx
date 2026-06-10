"use client";

import { useState } from "react";
import { Popover, Box, Text, Divider, Paper } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import dayjs from "dayjs";

export default function DateCalendarCard({
  label,
  value,
  onChange,
  title,
  valueFormat = "DD/MM/YYYY",
}: any) {
  const [opened, setOpened] = useState(false);
  const [hover, setHover] = useState(false);

  dayjs.locale("vi");
  const formatted = value ? dayjs(value).format("DD/MM/YYYY") : "__/__/____";

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      width={"auto"}
      position="bottom-start"
      shadow="md"
      trapFocus={false}
      closeOnClickOutside
      withinPortal
    >
      <Popover.Target>
        <Box
          component="div"
          onClick={() => setOpened(true)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            width: 150,
            cursor: "pointer",
            userSelect: "none",
            position: "relative",
            transition: "transform 0.15s ease",
            transform: hover ? "translateY(-3px)" : "translateY(0px)",
          }}
        >
          {/* 2 móc */}
          <Box
            style={{
              position: "absolute",
              top: -8,
              left: 40,
              width: 4,
              height: 18,
              background: "#d12525",
              borderRadius: 2,
              zIndex: 2,
            }}
          />
          <Box
            style={{
              position: "absolute",
              top: -8,
              right: 40,
              width: 4,
              height: 18,
              background: "#d12525",
              borderRadius: 2,
              zIndex: 2,
            }}
          />

          {/* Card */}
          <Paper
            radius="lg"
            p="sm"
            style={{
              background: "#f2f3f7",
              boxShadow: hover
                ? "6px 6px 14px #d1d5e0, -6px -6px 14px #ffffff"
                : "4px 4px 10px #d1d5e0, -4px -4px 10px #ffffff",
              border: "1px solid #ececec",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: 600,
                opacity: 0.75,
                textAlign: "center",
              }}
            >
              {title ?? "Từ ngày"}
            </Text>

            <Divider my={6} />

            <Text
              fw={700}
              size="lg"
              style={{ letterSpacing: 1, textAlign: "center" }}
            >
              {formatted}
            </Text>
          </Paper>
        </Box>
      </Popover.Target>

      <Popover.Dropdown>
        <DatePicker
          type="default"
          value={value}
          locale="vi"
          numberOfColumns={1}
          onChange={(d) => {
            if (!d) {
              onChange(null);
              return;
            }

            onChange(d);
            setOpened(false);
          }}
        />
      </Popover.Dropdown>
    </Popover>
  );
}
