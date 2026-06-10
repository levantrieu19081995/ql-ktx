// src/app/[locale]/page.tsx
import { redirect } from "next/navigation";

// export default function Home({ params }: { params: { locale: string } }) {
//   redirect(`/${params.locale}/dashboard`);
// }
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/dashboard`);
}
