"use client";

import "dayjs/locale/vi";
import { DatesProvider } from "@mantine/dates";

type DatesProviderClientProps = {
  children: React.ReactNode;
  locale: string;
};

export function DatesProviderClient({
  children,
  locale,
}: DatesProviderClientProps) {
  return (
    <DatesProvider
      settings={{
        locale: locale === "en" ? "en" : "vi",
        firstDayOfWeek: 1,
        weekendDays: [0, 6],
      }}
    >
      {children}
    </DatesProvider>
  );
}
