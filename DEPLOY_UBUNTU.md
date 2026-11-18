# Triển khai Frontend KTX CTU trên Ubuntu

Gói phát hành được tạo cho Ubuntu Linux x86_64, Node.js 20.19.5 và chạy bằng
Next.js standalone. Không upload source, `.git`, `.env.local` hoặc cache build.

## 1. Điều kiện phía CTU cần xác nhận

- Domain `https://ktx.ctu.edu.vn` đã có TLS hợp lệ và reverse proxy đến
  `127.0.0.1:3000`.
- Reverse proxy giữ đúng `Host`, `X-Forwarded-Host`, `X-Forwarded-Proto` và
  `X-Forwarded-For` để NextAuth tạo callback/cookie HTTPS chính xác.
- Browser chỉ gọi API cùng origin qua `/api/proxy/*`; Next.js server mới gọi
  API Gateway nội bộ bằng `API_BASE_URL`.
- `/api/auth/*` thuộc NextAuth và không được chuyển sang API Gateway.
- SockJS/STOMP không thể đi qua Next.js Route Handler như một WebSocket proxy.
  Quản trị CTU cần xác nhận reverse proxy cho
  `/quanlydangkiem-service/stomp` (bao gồm HTTP SockJS và WebSocket Upgrade)
  đến Gateway. Khi website dùng HTTPS, kết nối phía trình duyệt phải là HTTPS/WSS.
- Nếu WebSocket dùng domain/path khác, đặt `NEXT_PUBLIC_WEBSOCKET_URL` trước lúc
  build rồi build lại. Đây là biến build-time, không phải runtime.

## 2. Tạo ZIP trên Windows

Tại thư mục source:

```powershell
npm ci
npm run build
powershell -ExecutionPolicy Bypass -File .\scripts\package-production.ps1
```

Kết quả mặc định:

```text
artifacts/ktx-frontend-production-linux-x64.zip
```

Script bổ sung binary `sharp` ELF x86_64/glibc dành cho Ubuntu và loại binary
Windows khỏi gói. Việc này xử lý native runtime của `next/image`; không có nghĩa
là đã chạy thử toàn bộ ứng dụng trên Ubuntu production.

## 3. Upload và giải nén bản đầu tiên

Upload ZIP bằng WinSCP vào:

```text
/home/admin_ktx/domains/ktx.ctu.edu.vn/frontend
```

Sau đó chạy trên Ubuntu:

```bash
cd /home/admin_ktx/domains/ktx.ctu.edu.vn/frontend
mkdir -p releases shared
RELEASE="$(date +%Y%m%d-%H%M%S)"
mkdir -p "releases/$RELEASE"
unzip ktx-frontend-production-linux-x64.zip -d "releases/$RELEASE"
cp "releases/$RELEASE/production.env.template" shared/production.env
chmod 600 shared/production.env
```

Mở `shared/production.env` và cấu hình giá trị thật trên server. Không đưa file
này vào ZIP hoặc source control.

## 4. Kiểm tra release trước khi chuyển PM2

```bash
cd /home/admin_ktx/domains/ktx.ctu.edu.vn/frontend
set -a
. shared/production.env
set +a
test -f "releases/$RELEASE/server.js"
test -d "releases/$RELEASE/.next/static"
test -d "releases/$RELEASE/public"
HOSTNAME=127.0.0.1 PORT=3100 node "releases/$RELEASE/server.js" >/tmp/ktx-frontend-smoke.log 2>&1 &
SMOKE_PID=$!
sleep 3
curl --fail --show-error --head http://127.0.0.1:3100/
kill "$SMOKE_PID"
```

Nếu port 3100 đã được dùng, chọn một port tạm khác còn trống. Bước này không
đụng đến các process Java hoặc PM2 hiện có.

## 5. Chạy lần đầu bằng PM2

```bash
cd /home/admin_ktx/domains/ktx.ctu.edu.vn/frontend
ln -sfn "releases/$RELEASE" current
set -a
. shared/production.env
set +a
pm2 start current/ecosystem.config.cjs --only ktx_frontend --update-env
pm2 status ktx_frontend
curl --fail --show-error --head http://127.0.0.1:3000/
pm2 logs ktx_frontend --lines 100
```

Chỉ sau khi kiểm tra ổn định mới cân nhắc `pm2 save`. Không restart, delete hoặc
thay đổi `ktx_eureka`, `ktx_gateway`, `ktx_kytucxa`, `ktx_user`.

## 6. Cập nhật release mới

```bash
cd /home/admin_ktx/domains/ktx.ctu.edu.vn/frontend
PREVIOUS_RELEASE="$(readlink -f current)"
RELEASE="$(date +%Y%m%d-%H%M%S)"
mkdir -p "releases/$RELEASE"
unzip ktx-frontend-production-linux-x64.zip -d "releases/$RELEASE"
set -a
. shared/production.env
set +a
ln -sfn "releases/$RELEASE" current
pm2 startOrReload current/ecosystem.config.cjs --only ktx_frontend --update-env
curl --fail --show-error --head http://127.0.0.1:3000/
pm2 logs ktx_frontend --lines 100
```

Giữ lại giá trị `PREVIOUS_RELEASE` cho đến khi nghiệm thu bản mới.

## 7. Rollback

```bash
cd /home/admin_ktx/domains/ktx.ctu.edu.vn/frontend
ln -sfn "$PREVIOUS_RELEASE" current
set -a
. shared/production.env
set +a
pm2 startOrReload current/ecosystem.config.cjs --only ktx_frontend --update-env
curl --fail --show-error --head http://127.0.0.1:3000/
pm2 logs ktx_frontend --lines 100
```

Không xóa release lỗi cho đến khi đã thu thập log cần thiết.

## 8. Biến môi trường

Runtime bắt buộc:

- `NODE_ENV`
- `HOSTNAME`
- `PORT`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `API_BASE_URL`

Runtime tùy cấu hình face-detect:

- `FACE_DETECT_BASE_URL`
- `FACE_DETECT_SERVICE_TOKEN`

Runtime tùy cấu hình máy chủ ảnh lịch sử:

- `IMAGE_BASE_URL`
- `IMAGE_SERVICE_TOKEN`

Build-time tùy cấu hình WebSocket:

- `NEXT_PUBLIC_WEBSOCKET_URL`

Không dùng `NEXT_PUBLIC_API_BASE_URL` cho production. IP Gateway nội bộ chỉ nằm
trong `API_BASE_URL` phía server.
