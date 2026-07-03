import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "@/styles/mantine-overrides.css";
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from "@mantine/core";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { NotificationsProviderClient } from "@/providers/NotificationsProviderClient";
import { Suspense } from "react";

type Props = { children: React.ReactNode; params: { locale: string } };

export const metadata = {
  title: "Quản lý Ký túc xá Đại học Cần Thơ",
  description: "Hệ thống quản lý Ký túc xá Đại học Cần Thơ",
};

export default async function RootLayout({ children, params }: Props) {
  // const { locale } = params;
  const resolvedParams = await params;
  const { locale } = resolvedParams;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body suppressHydrationWarning>
        <div id="app-portal" />
        <MantineProvider
          defaultColorScheme="light"
          theme={{
            fontFamily: "var(--font-readex-pro), sans-serif",
            headings: {
              fontFamily: "var(--font-readex-pro), sans-serif",
            },
            components: {
              Drawer: {
                defaultProps: {
                  withinPortal: true,
                  portalProps: {
                    target: "#app-portal",
                    zIndex: 99999,
                  },
                },
              },
              Modal: {
                defaultProps: {
                  withinPortal: true,
                  portalProps: {
                    target: "#app-portal",
                    zIndex: 99990,
                  },
                },
              },
            },
          }}
        >
          <NotificationsProviderClient />
          <NextIntlClientProvider messages={messages} locale={locale}>
            <Suspense fallback={<div>Đang tải trang...</div>}>
              {children}
            </Suspense>
          </NextIntlClientProvider>
        </MantineProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
