"use client";

import { useState } from "react";
import { ActionIcon, Menu, Divider } from "@mantine/core";
import { useLocale } from "next-intl";
import {
  IconBook2,
  IconFileText,
  IconFileInvoice,
  IconHelpCircle,
  IconListDetails,
} from "@tabler/icons-react";

export default function DocumentMenu() {
  const [opened, setOpened] = useState(false);
  const locale = useLocale();

  return (
    <Menu
      opened={opened}
      onChange={setOpened}
      width={300}
      position="bottom-end"
      shadow="md"
      offset={8}
      withinPortal={false}
      zIndex={9999}
      transitionProps={{ transition: "pop", duration: 120 }}
    >
      <Menu.Target>
        <ActionIcon
          mt={2}
          variant="light"
          color="blue"
          size={43}
          radius="xl"
          title="Tài liệu hướng dẫn"
        >
          <IconBook2 size={22} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Tài liệu hướng dẫn</Menu.Label>

        <Menu.Item
          leftSection={<IconListDetails size={16} />}
          onClick={() => window.open(`/${locale}/tutorial`, "_blank")}
          c={"#0f2b52ff"}
        >
          Hướng dẫn sử dụng hệ thống
        </Menu.Item>
        <Divider />
        <Menu.Item
          leftSection={<IconFileText size={16} />}
          onClick={() => window.open("/doc/huong_dan1.pdf", "_blank")}
          c={"#0f2b52ff"}
        >
          Hướng dẫn tiếp nhận nội trú
        </Menu.Item>
        <Divider />
        <Menu.Item
          leftSection={<IconFileInvoice size={16} />}
          onClick={() => window.open("/doc/huong_dan2.pdf", "_blank")}
          c={"#0f2b52ff"}
        >
          Hướng dẫn 2
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
