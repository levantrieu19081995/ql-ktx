 

// src/lib/authOptions.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyCredentials } from "@/lib/auth";
import { fetchUserAPI } from "@/services/auth/authService";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
        name: "Credentials",
        credentials: {
          username: {},
          password: {},
          accessToken: {},
          refreshToken: {},
          expired: {},
          user: {},
      },

      async authorize(creds:any) {

        if (!creds?.username || !creds?.password) {
          return null; 
        }
        // TRƯỜNG HỢP LOGIN THƯỜNG
        if (creds?.username !== "REFRESH_MODE") {
          if (!creds?.username || !creds?.password) return null;
          const result = await verifyCredentials(creds.username, creds.password);
          const user = result.user;
          const org = user.organizations?.[0] || null;

          return {
            loginType: "NORMAL",
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            expired: result.expired,
            user: {
              id: user.id,
              guid: user.guid,
              username: user.username,
              ten: user.caNhan?.ten,
              organizationId: org?.id ?? null,
              organizationGuid: org?.guid ?? null,
            },
          };
        }

        // TRƯỜNG HỢP REFRESH TOKEN
        return {
          loginType: "REFRESH",
          accessToken: creds.accessToken,
          refreshToken: creds.refreshToken,
          expired: creds.expired,
          user: creds.user ? JSON.parse(creds.user) : null,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // REFRESH MODE chỉ sửa token
        if (user.loginType === "REFRESH") {
          token.accessToken = user.accessToken;
          token.refreshToken = user.refreshToken;
          token.expired = user.expired;
          
          const userInfo = await fetchUserAPI(user.accessToken);

          const org = userInfo.organizations?.[0] || null;

          token.user = {
            id: userInfo.id,
            guid: userInfo.guid,
            username: userInfo.username,
            ten: userInfo.caNhan?.ten,
            organizationId: org?.id ?? null,
            organizationGuid: org?.guid ?? null,
          };
          return token;
        }

        // LOGIN MODE
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.expired = user.expired;
        token.user = user.user;
      }
      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.expired = token.expired;
      session.user = token.user;
      return session;
    },
  },
};



