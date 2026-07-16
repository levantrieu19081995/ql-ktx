// src\app\[locale]\(app)\layout.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import AppFrame from "@/components/frame/AppFrame";
import SessionProviderClient from "@/components/providers/SessionProviderClient";
import SessionWatcherClientWrapper from "@/components/auth/SessionWatcherClientWrapper";
import { UserProvider } from "@/context/UserContext";
import ProtectedLayout from "@/components/common/ProtectedLayout";
import SessionWatcher from "@/components/auth/SessionWatcher";
import AppEntryTransition from "@/components/common/AppEntryTransition";
type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function Layout({ children, params }: Props) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect(`/splashscreen`);
  return (
    <SessionProviderClient>
      <UserProvider>
        <AppEntryTransition>
          <AppFrame>
          <SessionWatcherClientWrapper />
          <SessionWatcher
            title="Phiên đăng nhập hết hạn"
            message="Vui lòng đăng nhập lại hoặc tiếp tục phiên."
            reloginLabel="Đăng nhập"
            continueLabel="Tiếp tục"
          />

          <ProtectedLayout>{children}</ProtectedLayout>
          </AppFrame>
        </AppEntryTransition>
      </UserProvider>
    </SessionProviderClient>
  );
}
