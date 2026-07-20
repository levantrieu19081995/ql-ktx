"use client";

import { AppShell, Box } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import AppHeader from "@/components/shell/AppHeader";
import AppSidebar from "@/components/shell/AppSidebar";

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure(true);

  return (
    <AppShell
      header={{ height: 108 }}
      navbar={{
        width: opened ? 280 : 76,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding={0}
      styles={(theme) => ({
        root: {
          height: "100dvh",
          overflow: "hidden",
        },
        header: {
          background: "white",
          borderBottom: "1px solid #edf1f7",
          boxShadow: "0 1px 0 rgba(15, 23, 42, 0.02)",
        },
        navbar: {
          background: "white",
          borderRight: "1px solid #edf1f7",
        },
        main: {
          height: "100dvh",
          overflowY: "auto",
          overflowX: "hidden",
          background:
            "linear-gradient(rgba(37, 99, 235, 0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.018) 1px, transparent 1px), #fbfcff",
          backgroundSize: "32px 32px",
        },
      })}
    >
      <AppShell.Header>
        <AppHeader opened={opened} onBurgerClick={toggle} />
      </AppShell.Header>
      <AppShell.Navbar>
        <AppSidebar collapsed={!opened} onNavigate={close} toggle={toggle} />
      </AppShell.Navbar>
      <AppShell.Main>
        <Box pt={15} pb={32} pl={32} pr={32}>
          {children}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
