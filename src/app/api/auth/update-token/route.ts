// src/app/api/auth/update-token/route.ts 
import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

export async function POST(req: NextRequest){
  const oldToken = await getToken({ req, secret });

  if (!oldToken)
    return NextResponse.json({ error: "No JWT found" }, { status: 401 });

  const body = await req.json();

  const newToken = {
    ...oldToken,
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    expired: body.expired,
  };

  const res = NextResponse.json({ ok: true });

  res.cookies.set("next-auth.session-token", JSON.stringify(newToken), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  return res;
}

