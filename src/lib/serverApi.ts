// // src/lib/serverApi.ts
// import { auth } from "@/auth";

// const BASE = process.env.API_BASE_URL!;

// export async function serverApi(
//   input: string,
//   init: RequestInit = {}
// ) {
//   const session = await auth();
//   const headers = new Headers(init.headers);

//   if (session?.accessToken) {
//     headers.set("Authorization", `Bearer ${session.accessToken as string}`);
//   }
//   headers.set("Content-Type", "application/json");

//   const res = await fetch(`${BASE}${input}`, {
//     ...init,
//     headers,
//     // Tùy nhu cầu:
//     cache: "no-store",
//     // next: { revalidate: 0 },
//   });

//   if (!res.ok) {
//     const text = await res.text().catch(() => "");
//     throw new Error(`API ${res.status}: ${text || res.statusText}`);
//   }
//   return res;
// }
