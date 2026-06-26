import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'http://172.16.20.177:53004';
const AUTH_HEADER = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInR5cGUiOjEsImd1aWQiOiI5YTFiZTIzNS05OGJhLTQxOTYtOTMyYi0xMmY0NTc3NjNmYjQiLCJpZCI6MSwiaXNzIjoiaHR0cDovL2N1c2Nzb2Z0LmNvbS8iLCJpYXQiOjE3ODE3NDQ2NTQsImV4cCI6MjA5NzEwNDY1NH0.h70KwFf0rL5cSyyVlBHbadx5bl_7QXYN2VEIaC987lE';

async function forward(req: NextRequest, path: string[]) {
  try {
    const url = new URL(req.url);
    const target = `${BASE_URL}/ktx-service/${path.join('/')}${url.search}`;
    
    const init: RequestInit = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': AUTH_HEADER
      },
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : await req.arrayBuffer(),
    };
    
    const res = await fetch(target, init);
    return new NextResponse(await res.arrayBuffer(), {
      status: res.status,
      statusText: res.statusText,
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'application/json'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'ERROR', message: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return forward(req, path);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return forward(req, path);
}
