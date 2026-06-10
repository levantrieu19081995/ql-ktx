// // ví dụ: src/app/[locale]/(app)/dashboard/page.tsx
// import { serverApi } from "@/lib/serverApi";

// export default async function Dashboard() {
//   const data = await serverApi("/posts").then(r => r.json());
//   return <pre>{JSON.stringify(data, null, 2)}</pre>;
// }


// // ví dụ ở component client
// const res = await fetch("/api/proxy/posts?limit=20");
// const data = await res.json();





///--------------------------------------npm i next-auth@latest-----------------------------------//
// Dùng session ở bất kỳ đâu
// Server: const session = await auth();
// Client (nếu cần): cài next-auth/react để có SessionProvider + useSession

// // src/app/[locale]/layout.tsx (bọc provider client)
// "use client";
// import { SessionProvider } from "next-auth/react";
// export default function LocaleLayout({ children }: { children: React.ReactNode }) {
//   return <SessionProvider>{children}</SessionProvider>;
// }



// "use client";
// import { useSession } from "next-auth/react";
// const { data: session } = useSession();
// // session?.accessToken nếu bạn muốn hiển thị nhẹ nhàng (hạn chế dùng token ở client)
