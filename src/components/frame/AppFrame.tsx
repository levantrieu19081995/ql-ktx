"use client";

import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import AppHeader from "@/components/shell/AppHeader";
import AppSidebar from "@/components/shell/AppSidebar";

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure(true);

  return (
    <AppShell
      header={{ height: "auto" }} // header cao bao nhiêu tùy bạn
      navbar={{
        width: opened ? 260 : 70,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
      styles={(theme) => ({
        header: {
          position: "sticky",
          top: 0,
          background: "white",
          borderBottom: "1px solid #e9ecef",
        },
        navbar: {
          background: "white",
          borderRight: "1px solid #e9ecef",
        },
        main: {
          paddingTop: 10,
        },
      })}
    >
      <AppShell.Header>
        <AppHeader opened={opened} onBurgerClick={toggle} />
      </AppShell.Header>
      <AppShell.Navbar>
        <AppSidebar collapsed={!opened} onNavigate={close} toggle={toggle} />
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
