
// src/types/next-auth.d.ts
// Mở rộng kiểu Session của NextAuth để thêm accessToken

// import NextAuth, { DefaultSession } from "next-auth";

// declare module "next-auth" {
//   interface Session {
//     accessToken?: string;
//     refreshToken?: string;
//     expired?: number;
//     user: {
//       id?: number;
//       username?: string;
//       email?: string;
//       guid?: string;
//       [key: string]: any;
//     } & DefaultSession["user"];
//   }

//   interface JWT {
//     accessToken?: string;
//     refreshToken?: string;
//     expired?: number;
//     user?: any;
//   }
// }

import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

// 👉 Mở rộng module "next-auth"
declare module "next-auth" {
  // Mở rộng Session (client-side)
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    expired?: number;
    user: {
      id?: number;
      username?: string;
      email?: string;
      guid?: string;
      organizations?: any;
      caNhan?: any;
      [key: string]: any;
    } & DefaultSession["user"];
  }

  // Mở rộng User (server-side authorize() / jwt())
  interface User extends DefaultUser {
    id?: number;
    username?: string;
    email?: string;
    guid?: string;
    organizations?: any;
    caNhan?: any;
    accessToken?: string;
    refreshToken?: string;
    expired?: number;
    [key: string]: any;
  }
}

// 👉 Mở rộng JWT trong module riêng
declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expired?: number;
    user?: any;
  }
}



// declare module "next-auth" {
//   interface Session  {
//     accessToken: string;
//     refreshToken: string;
//     expired: number;
//   }

//   interface User {
//     accessToken: string;
//     accessToken: string;
//     refreshToken: string;
//     expired: number;
//   }

//     interface JWT {
//     accessToken: string;
//     refreshToken: string;
//     expired: number;
//   }
// }

// src/types/next-auth.d.ts
// src/types/next-auth.d.ts

// // src/types/next-auth.d.ts
// import NextAuth, { DefaultSession, JWT } from "next-auth";

// declare module "next-auth" {
//   interface Session extends DefaultSession {
//     accessToken: string;
//     refreshToken: string;
//     expired: number;
//   }

//   interface JWT {
//     accessToken: string;
//     refreshToken: string;
//     expired: number;
//   }

//   interface User {
//     accessToken: string;
//     refreshToken: string;
//     expired: number;
//   }
// }


