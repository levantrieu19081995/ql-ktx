import { NextRequest, NextResponse } from "next/server";

const IMAGE_BASE_URL = process.env.IMAGE_BASE_URL;
const IMAGE_SERVICE_TOKEN = process.env.IMAGE_SERVICE_TOKEN;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  if (!IMAGE_BASE_URL) {
    return NextResponse.json(
      { message: "IMAGE_BASE_URL is not configured" },
      { status: 500 },
    );
  }

  const { path } = await params;
  const incomingUrl = new URL(req.url);
  const targetUrl = new URL(
    `${IMAGE_BASE_URL.replace(/\/+$/, "")}/${path.join("/")}`,
  );

  incomingUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });
  if (IMAGE_SERVICE_TOKEN) {
    targetUrl.searchParams.set("token", IMAGE_SERVICE_TOKEN);
  }

  const response = await fetch(targetUrl, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: req.headers.get("accept") || "image/*",
    },
  });

  const responseHeaders = new Headers();
  for (const headerName of ["content-type", "cache-control", "etag", "last-modified"]) {
    const headerValue = response.headers.get(headerName);
    if (headerValue) {
      responseHeaders.set(headerName, headerValue);
    }
  }

  return new NextResponse(await response.arrayBuffer(), {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}
