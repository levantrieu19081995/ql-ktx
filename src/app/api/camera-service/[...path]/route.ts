// src/app/api/camera-service/[...path]/route.ts
//
// Proxy phía server tới service camera / nhận diện khuôn mặt.
//   /api/camera-service/cameras                -> {CAMERA_BASE_URL}/api/cameras
//   /api/camera-service/cameras/{i}/live       -> {CAMERA_BASE_URL}/api/cameras/{i}/live   (MJPEG, stream)
//   /api/camera-service/cameras/{i}/snapshot   -> {CAMERA_BASE_URL}/api/cameras/{i}/snapshot
//   /api/camera-service/attendance?...         -> {CAMERA_BASE_URL}/api/attendance?...
//   /api/camera-service/images/...             -> {CAMERA_BASE_URL}/api/images/...
//   /api/camera-service/dashboard/recognitions -> {CAMERA_BASE_URL}/api/dashboard/recognitions (long-poll realtime)
//   /api/camera-service/frames?streams=..      -> WebSocket /api/frames phía server, đẩy khung ảnh qua HTTP (lưới)
//   /api/camera-service/people-groups | areas  -> danh mục nhóm / khu vực (chỉ đọc)
//   POST attendance/records/{id}/enroll        -> cập nhật mẫu từ ảnh camera (xem hàm POST bên dưới)
//   POST people (multipart)                    -> lấy mẫu người mới: ảnh hoặc video
//   POST people/{id}/photos (multipart)        -> bổ sung ảnh cho người đã có
//   GET people/{id}                            -> thông tin và số ảnh mẫu của một người
//   DELETE people/{id}                         -> xóa người và toàn bộ ảnh mẫu
//   DELETE people/{id}/photos/{photo_id}       -> xóa một ảnh mẫu
//
// Admin token chỉ nằm ở env phía server (CAMERA_ADMIN_TOKEN), không bao giờ gửi xuống trình duyệt.
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import WebSocket from "ws";

const CAMERA_BASE_URL = process.env.CAMERA_BASE_URL;
const CAMERA_ADMIN_TOKEN = process.env.CAMERA_ADMIN_TOKEN;

// Chỉ cho phép các nhánh cần dùng, tránh proxy thành cổng vào toàn bộ service.
const ALLOWED_ROOTS = new Set([
  "cameras",
  "attendance",
  "images",
  "dashboard",
  "recognition", // kết quả nhận diện mới nhất của một luồng: recognition/{stream_idx}
  "recognized_faces", // khuôn mặt đã nhận diện kèm ảnh crop: recognized_faces/{stream_idx}
  "people-groups", // danh mục nhóm (Sinh viên, Cán bộ, Phụ huynh) cho form lấy mẫu
  "areas", // danh mục khu vực (KTX A...) cho form lấy mẫu
  "people", // GET people/{id}: thông tin và ảnh mẫu của một người; DELETE xem hàm DELETE
]);

// Giới hạn dung lượng một lần lấy mẫu (tối đa 20 ảnh hoặc 1 video).
const TOI_DA_BYTE_LAY_MAU = 200 * 1024 * 1024;

// Mã người (mã sinh viên / cán bộ): chữ, số, gạch dưới, chấm, gạch ngang
const MA_NGUOI = /^[A-Za-z0-9_.-]{1,64}$/;
const MA_ANH = /^[A-Za-z0-9_.-]{1,128}$/;

const laDuongDanGetHopLe = (path: string[]) => {
  if (!path?.length || !ALLOWED_ROOTS.has(path[0]) || path.includes("..")) return false;
  // Danh mục chỉ đọc, không có đường dẫn con
  if (path[0] === "people-groups" || path[0] === "areas") return path.length === 1;
  // people: chỉ đọc đúng một người, people/{id}
  if (path[0] === "people") return path.length === 2 && MA_NGUOI.test(path[1]);
  // Chỉ dashboard/recognitions (luồng sự kiện realtime) được mở, các nhánh khác của dashboard thì không.
  if (path[0] === "dashboard") return path.length === 2 && path[1] === "recognitions";
  // recognition / recognized_faces: bắt buộc đúng một tham số là số nguyên (index luồng)
  if (path[0] === "recognition" || path[0] === "recognized_faces") {
    return path.length === 2 && /^\d+$/.test(path[1]);
  }
  return true;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // dùng thư viện ws

const laSoTrong = (v: string | null, min: number, max: number) => {
  if (v === null || !/^\d+$/.test(v)) return null;
  const n = Number(v);
  return n >= min && n <= max ? n : null;
};

/**
 * GET /api/camera-service/frames?streams=36,37&fps=15&width=480&quality=60
 * Trả về luồng nhị phân liên tục: các khung nối tiếp nhau, mỗi khung gồm
 *   uint32 BE index camera | uint32 BE độ dài JPEG | float64 BE thời điểm | JPEG
 * Nếu trình duyệt đọc chậm thì bỏ bớt khung để luôn giữ hình mới nhất.
 */
async function chuyenTiepKhungAnh(req: NextRequest): Promise<Response> {
  const sp = new URL(req.url).searchParams;
  const streams = (sp.get("streams") || "").split(",").filter(Boolean);
  if (
    streams.length === 0 ||
    streams.length > 16 ||
    !streams.every((s) => /^\d{1,6}$/.test(s))
  ) {
    return NextResponse.json({ message: "streams không hợp lệ" }, { status: 400 });
  }
  const fps = laSoTrong(sp.get("fps"), 1, 30) ?? 10;
  const width = laSoTrong(sp.get("width"), 120, 1920);
  const quality = laSoTrong(sp.get("quality"), 10, 95);

  const wsUrl = new URL(`${CAMERA_BASE_URL!.replace(/\/+$/, "")}/api/frames`);
  wsUrl.protocol = wsUrl.protocol === "https:" ? "wss:" : "ws:";
  wsUrl.searchParams.set("streams", streams.join(","));
  wsUrl.searchParams.set("fps", String(fps));
  if (width) wsUrl.searchParams.set("width", String(width));
  if (quality) wsUrl.searchParams.set("quality", String(quality));
  if (sp.get("bodies") === "1") wsUrl.searchParams.set("bodies", "1");

  const ws = new WebSocket(wsUrl.toString(), {
    headers: { "X-Admin-Token": CAMERA_ADMIN_TOKEN! },
    handshakeTimeout: 8000,
  });

  // Chờ kết nối thành công rồi mới trả response, để lỗi kết nối trả 502 thay vì treo
  try {
    await new Promise<void>((resolve, reject) => {
      ws.once("open", () => resolve());
      ws.once("error", (e) => reject(e));
      ws.once("unexpected-response", (_r, res) =>
        reject(new Error(`Upstream ${res.statusCode}`)),
      );
    });
  } catch (err: unknown) {
    ws.terminate();
    const message = err instanceof Error ? err.message : "Upstream error";
    return NextResponse.json({ message }, { status: 502 });
  }

  const dong = () => {
    try {
      ws.terminate();
    } catch {
      /* đã đóng */
    }
  };
  req.signal.addEventListener("abort", dong);

  const stream = new ReadableStream<Uint8Array>(
    {
      start(controller) {
        ws.on("message", (data, isBinary) => {
          if (!isBinary) return;
          const buf = Array.isArray(data)
            ? Buffer.concat(data)
            : Buffer.isBuffer(data)
              ? data
              : Buffer.from(data as ArrayBuffer);
          if (buf.length <= 1) return; // ping
          // trình duyệt đọc không kịp → bỏ khung này, giữ độ trễ thấp
          if (controller.desiredSize !== null && controller.desiredSize <= 0) return;
          controller.enqueue(new Uint8Array(buf));
        });
        ws.on("close", () => {
          try {
            controller.close();
          } catch {
            /* đã đóng */
          }
        });
        ws.on("error", (e) => {
          try {
            controller.error(e);
          } catch {
            /* đã đóng */
          }
        });
      },
      cancel() {
        dong();
      },
    },
    new CountQueuingStrategy({ highWaterMark: 6 }),
  );

  return new Response(stream, {
    headers: {
      "content-type": "application/octet-stream",
      "cache-control": "no-store",
      "x-accel-buffering": "no",
    },
  });
}

// Lấy mẫu: thêm ảnh khuôn mặt của một bản ghi vào mẫu của một người.
//   POST /api/camera-service/attendance/records/{id}/enroll  body {"person_id": "..."}
// Đây là thao tác ghi dữ liệu nên chỉ mở đúng một đường dẫn này, không mở POST chung.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (!CAMERA_BASE_URL || !CAMERA_ADMIN_TOKEN) {
    return NextResponse.json(
      { message: "CAMERA_BASE_URL / CAMERA_ADMIN_TOKEN is not configured" },
      { status: 500 },
    );
  }

  const { path } = await params;

  // Lấy mẫu (multipart/form-data), chuyển tiếp nguyên body dạng stream, không đọc hết vào bộ nhớ:
  //   POST people              -> người mới: id, name, group_id, area_ids ("1,2"), photos (tối đa 20) hoặc video
  //   POST people/{id}/photos  -> bổ sung ảnh cho người đã có
  const laNguoiMoi = path?.length === 1 && path[0] === "people";
  const laThemAnh =
    path?.length === 3 &&
    path[0] === "people" &&
    path[2] === "photos" &&
    /^[A-Za-z0-9_.-]{1,64}$/.test(path[1]);
  if (laNguoiMoi || laThemAnh) {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("multipart/form-data") || !req.body) {
      return NextResponse.json({ message: "Cần gửi multipart/form-data" }, { status: 400 });
    }
    const doDai = Number(req.headers.get("content-length") || 0);
    if (!doDai) {
      return NextResponse.json({ message: "Thiếu Content-Length" }, { status: 411 });
    }
    if (doDai > TOI_DA_BYTE_LAY_MAU) {
      return NextResponse.json(
        { message: "Dữ liệu lấy mẫu quá lớn (tối đa 200MB)" },
        { status: 413 },
      );
    }
    const duongDan = laNguoiMoi
      ? "/api/people"
      : `/api/people/${encodeURIComponent(path[1])}/photos`;
    try {
      const upstream = await fetch(`${CAMERA_BASE_URL.replace(/\/+$/, "")}${duongDan}`, {
        method: "POST",
        cache: "no-store",
        headers: {
          "X-Admin-Token": CAMERA_ADMIN_TOKEN,
          "Content-Type": contentType,
          "Content-Length": String(doDai),
        },
        body: req.body,
        duplex: "half",
      } as RequestInit & { duplex: "half" });
      return new NextResponse(upstream.body, {
        status: upstream.status,
        headers: {
          "content-type": upstream.headers.get("content-type") || "application/json",
          "cache-control": "no-store",
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upstream error";
      return NextResponse.json({ message }, { status: 502 });
    }
  }

  const hopLe =
    path?.length === 4 &&
    path[0] === "attendance" &&
    path[1] === "records" &&
    /^\d+$/.test(path[2]) &&
    path[3] === "enroll";
  if (!hopLe) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  let body: { person_id?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  // person_id là tuỳ chọn (bản ghi đã nhận diện thì tự thuộc về người đó) nhưng nếu có phải là chuỗi.
  const payload: { person_id?: string } = {};
  if (body.person_id !== undefined && body.person_id !== null) {
    if (typeof body.person_id !== "string" || body.person_id.length > 100) {
      return NextResponse.json({ message: "person_id không hợp lệ" }, { status: 400 });
    }
    payload.person_id = body.person_id;
  }

  try {
    const upstream = await fetch(
      `${CAMERA_BASE_URL.replace(/\/+$/, "")}/api/attendance/records/${path[2]}/enroll`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "X-Admin-Token": CAMERA_ADMIN_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/json",
        "cache-control": "no-store",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upstream error";
    return NextResponse.json({ message }, { status: 502 });
  }
}

// Xóa dữ liệu khuôn mặt (thao tác ghi, không hoàn tác). Chỉ mở đúng hai đường dẫn:
//   DELETE people/{id}                -> xóa thông tin và toàn bộ ảnh lấy mẫu của người đó
//   DELETE people/{id}/photos/{photo} -> xóa một ảnh mẫu
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (!CAMERA_BASE_URL || !CAMERA_ADMIN_TOKEN) {
    return NextResponse.json(
      { message: "CAMERA_BASE_URL / CAMERA_ADMIN_TOKEN is not configured" },
      { status: 500 },
    );
  }

  const { path } = await params;
  const xoaNguoi = path?.length === 2 && path[0] === "people" && MA_NGUOI.test(path[1]);
  const xoaAnh =
    path?.length === 4 &&
    path[0] === "people" &&
    MA_NGUOI.test(path[1]) &&
    path[2] === "photos" &&
    MA_ANH.test(path[3]);
  if (!xoaNguoi && !xoaAnh) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  try {
    const upstream = await fetch(
      `${CAMERA_BASE_URL.replace(/\/+$/, "")}/api/${path.map(encodeURIComponent).join("/")}`,
      {
        method: "DELETE",
        cache: "no-store",
        headers: { "X-Admin-Token": CAMERA_ADMIN_TOKEN },
      },
    );
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/json",
        "cache-control": "no-store",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upstream error";
    return NextResponse.json({ message }, { status: 502 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  // middleware không bảo vệ /api nên tự kiểm tra đăng nhập tại đây
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!CAMERA_BASE_URL || !CAMERA_ADMIN_TOKEN) {
    return NextResponse.json(
      { message: "CAMERA_BASE_URL / CAMERA_ADMIN_TOKEN is not configured" },
      { status: 500 },
    );
  }

  const { path } = await params;

  // Lưới nhiều camera: server nối WebSocket /api/frames (có token), đẩy khung ảnh xuống trình duyệt qua
  // một kết nối HTTP. Nhờ vậy không cần nginx chuyển tiếp WebSocket và không lộ token cho trình duyệt.
  if (path?.length === 1 && path[0] === "frames") {
    return chuyenTiepKhungAnh(req);
  }

  if (!laDuongDanGetHopLe(path)) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const target = new URL(
    `${CAMERA_BASE_URL.replace(/\/+$/, "")}/api/${path.map(encodeURIComponent).join("/")}`,
  );
  new URL(req.url).searchParams.forEach((value, key) => {
    if (key !== "token") target.searchParams.append(key, value);
  });

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: "GET",
      cache: "no-store",
      headers: {
        "X-Admin-Token": CAMERA_ADMIN_TOKEN,
        Accept: req.headers.get("accept") || "*/*",
      },
      // client ngắt (đóng tab, đổi camera) thì ngắt luôn luồng MJPEG phía upstream
      signal: req.signal,
    });
  } catch (err: unknown) {
    if (req.signal.aborted) return new NextResponse(null, { status: 499 });
    const message = err instanceof Error ? err.message : "Upstream error";
    return NextResponse.json({ message }, { status: 502 });
  }

  const headers = new Headers();
  for (const name of ["content-type", "cache-control", "etag", "last-modified"]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  // luồng live/snapshot không được cache
  if (path[0] === "cameras") headers.set("cache-control", "no-store");
  // tắt buffer của nginx để MJPEG chảy liên tục
  headers.set("x-accel-buffering", "no");

  // Truyền thẳng body (stream), không đọc hết vào bộ nhớ
  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}
