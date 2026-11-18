// /* eslint-disable @typescript-eslint/no-explicit-any */
// // src\app\api\proxy\[...path]\route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { getToken } from 'next-auth/jwt';

// const BASE = process.env.API_BASE_URL!;

// export async function GET(req: NextRequest, { params }: { params: { path: string[] }}) { return forward(req, params); }
// export async function POST(req: NextRequest, ctx: any)  { return forward(req, ctx.params); }
// export async function PUT(req: NextRequest, ctx: any)   { return forward(req, ctx.params); }
// export async function PATCH(req: NextRequest, ctx: any) { return forward(req, ctx.params); }
// export async function DELETE(req: NextRequest, ctx: any){ return forward(req, ctx.params); }

// async function forward(req: NextRequest, { path }: { path: string[] }) {
//   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

//   const url = new URL(req.url);
//   const target = `${BASE}/${path.join('/')}${url.search}`;

//   const headers = new Headers(req.headers);
//   headers.set('host', new URL(BASE).host);
//   if ((token as any)?.accessToken) {
//     headers.set('Authorization', `Bearer ${(token as any).accessToken}`);
//   }

//   const init: RequestInit = {
//     method: req.method,
//     headers,
//     body: ['GET','HEAD'].includes(req.method) ? undefined : await req.arrayBuffer(),
//     cache: 'no-store'
//   };

//   const res = await fetch(target, init);
//   return new NextResponse(await res.arrayBuffer(), {
//     status: res.status,
//     statusText: res.statusText,
//     headers: new Headers(res.headers),
//   });
// }

 
// src/app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const BASE = process.env.API_BASE_URL;
// Host riêng cho face-detect-service (nếu không khai báo thì đi qua BASE như các service khác)
const FACE_DETECT_BASE = process.env.FACE_DETECT_BASE_URL || BASE;

//   Route handlers (Next.js 15+ expects params as Promise)
export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return forward(req, { path });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return forward(req, { path });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return forward(req, { path });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return forward(req, { path });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return forward(req, { path });
}

//   Common forwarding logic
async function forward(req: NextRequest, { path }: { path: string[] }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const url = new URL(req.url);
  const base = path[0] === 'face-detect-service' ? FACE_DETECT_BASE : BASE;
  if (!base) {
    return NextResponse.json(
      { message: 'API base URL is not configured' },
      { status: 500 },
    );
  }

  const cleanBase = base.replace(/\/+$/, "");
  const cleanPath = path.join('/').replace(/^\/+/, "");
  const target = `${cleanBase}/${cleanPath}${url.search}`;

  const headers = new Headers(req.headers);
  headers.set('host', new URL(base).host);
  headers.delete('accept-encoding'); // Prevent double compression/decoding issues

  if ((token as any)?.accessToken) {
    headers.set('Authorization', `Bearer ${(token as any).accessToken}`);
  }

  const init: RequestInit = {
    method: req.method,
    headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : await req.arrayBuffer(),
    cache: 'no-store',
  };

  const res = await fetch(target, init);
  const resHeaders = new Headers(res.headers);
  resHeaders.delete('content-encoding');
  resHeaders.delete('content-length');
  resHeaders.delete('transfer-encoding');

  return new NextResponse(await res.arrayBuffer(), {
    status: res.status,
    statusText: res.statusText,
    headers: resHeaders,
  });
}
