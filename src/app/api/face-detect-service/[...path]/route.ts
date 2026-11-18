import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.FACE_DETECT_BASE_URL;
const SERVICE_TOKEN = process.env.FACE_DETECT_SERVICE_TOKEN;

async function forward(req: NextRequest, path: string[]) {
  try {
    if (!BASE_URL) {
      return NextResponse.json(
        { status: 'ERROR', message: 'FACE_DETECT_BASE_URL is not configured' },
        { status: 500 },
      );
    }

    const url = new URL(req.url);
    const target = `${BASE_URL.replace(/\/+$/, '')}/face-detect-service/${path.join('/')}${url.search}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json; charset=utf-8',
    };

    if (SERVICE_TOKEN) {
      headers.Authorization = `Bearer ${SERVICE_TOKEN}`;
    }
    
    const init: RequestInit = {
      method: req.method,
      headers,
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
