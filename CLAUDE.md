# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Frontend for the Can Tho University dormitory (KTX) management system: dashboards, entry/exit statistics, camera / face-recognition monitoring, history, category management (`danh-muc`), and user/role administration. UI text, comments, and many identifiers are in Vietnamese (e.g. `thong-ke` = statistics, `danh-muc` = categories, `luot-ra-vao` = entries/exits, `vang-mat` = absent, `nguoi-la` = strangers, `bi-cam` = banned). This is only the Next.js frontend; all business data comes from a separate backend gateway.

The project was started from a different CTU app (vehicle inspection, "quanlydangkiem"), so some leftovers remain: `analytics`, `excel`, `doc-viewer`, `manage-*` pages, `services/chu-phuong-tien`, payment/invoice/acceptance code, and the `/quanlydangkiem-service` path. Not everything under `src/` is KTX-specific.

## Commands

```powershell
npm run dev      # next dev --turbopack (http://localhost:3000)
npm run build    # production build (output: 'standalone')
npm run start
npm run lint     # next lint
```

There is no test runner configured. `tsc_output.txt` and `test_api.js` at the root are ad-hoc artifacts, not part of a test suite. ESLint is intentionally permissive (`no-explicit-any`, `no-unused-vars` and similar are off). TypeScript is `strict`, so use `npx tsc --noEmit` to type-check.

`npm run build-zip` builds and packages a release zip into `artifacts/`; `npm run build-deploy` does the same, then asks for confirmation and uploads it with `scp`/`ssh` to `admin_ktx@172.18.141.250` (`scripts/build-deploy-ktx.ps1`, modelled on the NVKH script in the WEB25108 project). It unpacks into `frontend/releases/<timestamp>`, repoints `current`, reloads only the `ktx_frontend` PM2 app and rolls back automatically if the health check fails; ssh asks for the password, nothing is stored. Pass extra flags after `--` (e.g. `npm run build-deploy -- -SkipBuild`, `-Yes`, `-LegacyScp`).

Production packaging for Ubuntu is covered in `DEPLOY_UBUNTU.md`: `npm ci && npm run build`, then `scripts/package-production.ps1`, which zips the standalone output (swapping in Linux `sharp` binaries) into `artifacts/`. PM2 config is in `deploy/ecosystem.config.cjs`, and `deploy/production.env.template` lists the production env vars.

Use `npm` (both `package-lock.json` and `yarn.lock` are present; `package-lock.json` is the one the deploy docs use). The root `README.md` is the untouched create-next-app boilerplate and `readme.ts` is a scratch note of code snippets, so neither describes this project.

### Non-app files at the repo root
Not part of the Next.js build, so don't go looking for app logic in them:
- `prototype-app-myctu-ktx/`: standalone static HTML/JS mock-up of the dormitory module for the MyCTU mobile app (open `index.html` directly; no build, no API calls).
- `danhGia/` (untracked): internship evaluation forms (`.docx`), unrelated to the code. `.agents/AGENTS.md` is a dated changelog of past UI work, not a rules file.
- `artifacts/` holds the production zip built by `scripts/package-production.ps1`; `WEB_2605_07.08_TieuChuanThietKeGiaoDien_v1.0.docx` is the UI design standard the theme follows.

## Architecture

**Stack:** Next.js 15 App Router + React 19, Mantine 8 (UI), Tailwind 4 (utility classes alongside Mantine), next-intl (locales `vi`/`en`, prefix always required, messages in `src/i18n/{vi,en}.json`), next-auth (JWT/credentials), zustand, axios, Recharts, plus exceljs/jspdf/docx for exports.

### Routing and page pattern
- All routes live under `src/app/[locale]/`. `(app)` is the authenticated area, `(auth)` has login, and `customer-display` and `no-permission` are standalone.
- A page is a thin server `page.tsx` that renders a `ClientPage.tsx`. That file `dynamic()`-imports (usually `ssr: false`) the real implementation from `src/components/pages/<feature>/`. Business UI belongs in `components/pages`, not in `app/`. One `ThongKePage` serves several `thong-ke` routes through a `type` prop (`luot-ra-vao`, `vang-mat`, `nguoi-la`, `bi-cam`, `theo-ma-so`, `dang-co-mat`).
- `src/app/[locale]/(app)/layout.tsx` is `force-dynamic`. It redirects to `/splashscreen` without a server session, then wraps children in `SessionProviderClient` → `UserProvider` → `AppFrame` (header/menu) → `ProtectedLayout`.
- Routes are guarded in three layers that must stay in sync when you add a page:
  1. `src/middleware.ts` has a `PROTECTED` prefix list, redirects unauthenticated users to login, and builds redirect origins from `NEXTAUTH_URL` or `X-Forwarded-*` for reverse-proxy deployments.
  2. `src/constants/developmentRoutes.ts` has `KTX_DEVELOPMENT_VISIBLE_ROUTES`, a whitelist of routes shown regardless of backend permissions, and `PUBLIC_APP_ROUTES`.
  3. `ProtectedLayout` + `usePermissions` + `utils/menuPermission.ts` check backend permissions client-side. A route needs a `VIEW` permission whose `dmcnSlug` equals the route path (e.g. `/dashboard`), otherwise the user is redirected to `/{locale}/no-permission`. Permissions are fetched via `GET /api/auth/permissions`, which falls back to a minimal mock (dashboard only) if the backend errors.

### API access (important)
The browser never calls the backend directly. Everything goes through same-origin Next route handlers in `src/app/api/`:
- `/api/proxy/[...path]` is the generic gateway proxy. It forwards to `API_BASE_URL` and injects `Authorization: Bearer <accessToken>` from the next-auth JWT. The first path segment is the backend service name (`/ktx-service`, `/user-service`, `/file-service`, … from `src/constants/servicePaths.ts`). `face-detect-service` goes to `FACE_DETECT_BASE_URL` when set.
- `/api/camera-service/[...path]` proxies the camera / face-recognition service (`CAMERA_BASE_URL`) with an allowlist of root paths. The `CAMERA_ADMIN_TOKEN` stays server-side only. It also bridges the service's WebSocket frames to HTTP and serves long-poll live events (see `hooks/useSuKienTrucTiep.ts`, `hooks/useCameraFrames.ts`).
- `/api/images/[...path]` proxies images (`IMAGE_BASE_URL`, `IMAGE_SERVICE_TOKEN`). `/api/face-detect-service` is a dedicated proxy (`FACE_DETECT_BASE_URL`, `FACE_DETECT_SERVICE_TOKEN`).
- The shared axios instance (`src/utils/axios.ts`) uses `baseURL` `/api/proxy` in the browser and `API_BASE_URL` on the server. A request interceptor rejects payloads containing HTML/script (`utils/payloadSecurity.ts`) and attaches the token from `context/sessionStore.ts`. A 401 interceptor flips `isExpired` to open the session-expired modal (`components/auth/SessionWatcher`).
- API endpoint strings are centralized in `src/constants/apiUrls.js`. Feature API calls live in `src/services/<feature>/*Service.ts`. Prefer adding endpoints and services there over inline fetches.
- Realtime STOMP/SockJS goes through `utils/websocketUrl.ts` and `NEXT_PUBLIC_WEBSOCKET_URL`. It cannot be proxied by a Next route handler, so the production reverse proxy must route it to the gateway (see `DEPLOY_UBUNTU.md`).

### Two backends, two data styles
KTX features read from two different sources, and mixing them up is the most common source of confusion:
- **Gateway** (`/api/proxy` → `/ktx-service/*`, `/face-detect-service/*`, `/user-service/*`): business data. Responses are `{ status: "OK", payload: ... }` and lists are `payload.items` + `totalPages`/`totalElements`. Endpoint constants are in `apiUrls.js` under `danhMucKtx`, `thongKeKtx` and `faceDetect`. Used by Dashboard, Statistics, History and Categories.
- **Camera / face-recognition service** (`/api/camera-service/*`, wrapper `services/camera/cameraService.ts` → `dichVuCamera`): live video, realtime recognition events, unknown faces, and enrolling face samples. Used by Camera and Warnings (stranger alerts). Errors come back with `description`/`error`/`detail` in varying shapes, so use `layThongBaoLoi`.

### Feature map
- **Dashboard** (`components/pages/dashboard/DashboardPage.tsx`, ~1300 lines): does almost all aggregation client-side. On mount it preloads all students (`pageSize 10000`) into `rawStudentCache` (maSinhVien → khu/phòng) and counts per khu. A second effect, keyed on the date range, loads stranger stats, debt/ban stats, and the entry/exit log **one request per day (max 31 days)**, cached in a module-level `Map` (TTL 10 min for past days, 1 min for today). A third effect derives every chart and KPI card from those raw states. "Đang có mặt / Đã ra ngoài" is computed from each student's *last scan* in the loaded range, not from a backend counter. The `Reveal` and `Quick*` components handle the staggered animation (see the `dashboard-staggered-reveal` skill).
- **Statistics** (`/thong-ke/*`, `ThongKePage` switches on `type`): `luot-ra-vao` (`thong-ke/luot-ra-vao`, groupBy DAY/MONTH, MONTH capped at 2 adjacent months, status Hợp lệ/Nghi vấn/Không hợp lệ derived from banned+debt lookups), `vang-mat` (`thong-ke/vang-mat`, params `ngayThamChieu` + `soNgayVangToiThieu`, default ≥5 days; status by days: >15 Cảnh báo, >7 Nghi vấn), `dang-co-mat` (client-computed from the last N days of history, auto-refreshes), `nguoi-la` (three parallel calls: paginated list, per-day counts for the chart, and per-day detail), `bi-cam` (banned/debt stats plus create/edit banned students), `theo-ma-so` (search one student, with debounced autocomplete over `fetchSinhVienPaginate`). Each exports via the shared Excel/PDF helpers.
- **History** (`/history`, `HistoryPage` + `historyService.ts`): paginated `face-web-check-time/paginate`, **one `ngay` per query**, with filters khu/nhóm/keyword. `layDanhSachLichSu` normalizes backend field renames (`timeCheck`→`timecheck`, `peopleId`→`maso`, `direction in/out`→`cameraIdId 1/2`) and maps rows to `HistoryItem`. Images are rewritten to `/api/images/...`. The `taoBanGhi/xoa/capNhat…` methods only mutate an in-memory mock list. The chart data in `HistoryPage.tsx` is hard-coded sample data.
- **Camera** (`/camera`, `CameraPage` + `NhatKyNhanDien` + `Modal*` + `LopKhungNhanDien`): MJPEG single view, or 4/9-tile grid fed either by the `useCameraFrames` binary multi-stream (`/api/camera-service/frames`, WebSocket bridged to HTTP) or by polled snapshots. `useSuKienTrucTiep` long-polls realtime recognition events. `LopKhungNhanDien` draws bbox overlays for ~2s, and `useCanhBaoPopup` raises toasts (spoof/stranger/banned/debt, 30s cooldown per subject). The log drawer has four tabs (LIVE/LOG/UNKNOWN/PEOPLE). The modals enroll face samples from an unknown-face record, enroll a new person (≤20 photos or one video), or delete a person's samples (irreversible, with confirmation).
- **Warnings** (`/warnings`, `StrangerWarningsPage` + `strangerService.ts`): unknown-face records from the camera service (`view=unknown`, ≤500 per call), mapped into `HistoryItem` so `DrawerChiTietLichSu` is reused. Excel/PDF export pages through the whole result.
- **Categories (`/danh-muc/*`)**: `sinh-vien-ktx`, `sinh-vien-no-phi`, `phong-ktx`, `khu-ktx` and `sinh-vien-bi-cam`, each a page component plus a table in `danh-muc/Table/`, rendered through `DanhMucFeaturePage` (layout shell + type switch). Data services are in `services/danh-muc/danhMucKtxService.ts`. The student, room, area and debt pages have a **UIIS sync flow**: fetch the university-system list (`/uiis/dm-*/danh-sach`, paged at 200), diff it against current KTX data into NEW/CHANGED/SAME rows in a preview, and on confirm POST `/uiis/dm-*/sync`. Banned students support create/update (`ktx-sinh-vien-cam`). `/category-management` is a separate tabbed read-only view (Khu/Phòng/Sinh viên/Cấm) over `category-management/categoryService.ts`.
- **Admin** (`/settings`, `/manage-users`, `/manage-roles`, `.../manage-permissions`): account, role and permission CRUD over `user-service`. `settings` is mostly inherited from the old app (fee/payment/Excel-convert tabs).

### Help menu and tutorial page
- The book-icon menu (`components/shell/DocomentMenu.tsx`) sits in the top-right of both the login page (`(auth)/login/layout.tsx`) and `AppHeader`. It opens the PDFs in `public/doc/` and the tutorial page. Its labels are hard-coded Vietnamese, not next-intl.
- `/[locale]/tutorial` (`components/pages/tutorial/TutorialPage.tsx`) is a standalone page outside `(app)`, so it works without logging in. It is laid out as five full-screen sections (cover, goal, technology + connection diagram, feature groups, timeline + slide) with scroll-snap on desktop; the slide section scrolls inside itself. Its content (goal, technology cards, groups, steps, notes) is plain data in `tutorialContent.ts`, and the connection diagram's boxes and arrows are in `tutorialDiagram.ts`: edit that file when a screen, menu name or button label changes. Each slide is image-first: a big screenshot with numbered yellow dots placed at pixel coordinates (`marks: {x,y,label}[]`, in the 1440x900 space of `IMAGE_SIZE`) plus a one-line `tagline`; the long `summary`/`steps`/`notes` sit behind a "Chi tiết cách dùng" toggle, so keep marks and taglines short and re-place the dots whenever a screenshot is retaken. The `<>` button next to "Mở trang này" (desktop only, Esc to undo) widens the slide panel to the right edge and collapses the left timeline; prev/next, open-page, collapse and a map icon then sit in a vertical bar under the right-edge section dots, and the dot map floats for 4 s and auto-hides (hover/click the map icon to bring it back; `moRong`/`hienBanDo` state in `TutorialPage.tsx`). Each item can have an `image` (a screenshot in `public/tutorial/<id>.png`, served without login) that powers the "Xem hình ảnh" button; the 18 screenshots were taken from the running app with real data, so retake them when a screen changes. Items can be linked directly with a hash, e.g. `/vi/tutorial#camera`. Keep the wording plain and do not use the word "AI" except where the user labelled the Python face-recognition part "AI" in the technology section (the feature is otherwise called "nhận diện khuôn mặt").

### Conventions and gotchas
- The date format sent to the backend is `MM/DD/YYYY` (not ISO). Timestamps from the backend are Unix seconds. Code uses `n < 1e11 ? n*1000 : n` to accept either.
- "Vào/Ra" direction is inferred in several places from `direction`, `cameraName` containing "vào", or `cameraIdId === 1`. This logic is duplicated across Dashboard, History and Statistics, so change it in all of them.
- List endpoints expect `page`/`pageSize` (sometimes as strings) and `"-1"` as the "all" sentinel for `maKhu`, `maPhong`, `maNhom` and `maSinhVien`.
- Pages are written in Vietnamese: identifiers like `dangTai` (loading), `boLoc` (filter), `taiDuLieu` (load data), `xuLyXuatExcel` (handle export), `dichVu…` (service). Filters usually keep a draft state (`boLocNhap`) and an applied state (`boLocDaApDung`), and only the applied one triggers a fetch.
- `app/api/auth/update-token/route.ts` is not referenced anywhere. Token refresh actually goes through `SessionWatcher` → `refreshTokenAPI` → `signIn("credentials", { username: "REFRESH_MODE" })`.
- The sidebar (`components/shell/AppSidebar.tsx`) lists menu entries including some without a route in this repo (e.g. `/toll-management`, the manual/document entries). `thong-ke/theo-ma-so` exists as a page but its menu entry is commented out.

### Auth
`src/lib/authOptions.ts` defines a single Credentials provider. Normal login verifies username/password/captcha against the user-service. A special `REFRESH_MODE` username re-issues the JWT from a refreshed token pair (used by the session watcher). The session carries `accessToken`, `refreshToken`, `expired`, and a slim `user` (id, guid, username, organization ids).

### Shared helpers
- Excel/PDF export: `components/common/excel/excelHelper.tsx`, `components/common/pdf/pdfHelper.tsx`. Statistics pages use these.
- Notifications: `showNoti(type, message)` in `components/common/showNoti.tsx` (Mantine notifications).
- Theme/font constants: `src/constants/theme.ts`, `src/styles/mantine-overrides.css`. Per `.agents/AGENTS.md`, the intended look is K2D for headings, Readex Pro for body text, and primary colors `#1f5ca9` / `#00afef`. `theme.ts` and the root layout currently set Inter Variable, so check which is current before restyling. The tutorial page (`/tutorial`) deliberately uses a single font, Readex Pro Variable (`@fontsource-variable/readex-pro`, self-hosted with the Vietnamese subset), for all of its text via `--tut-font` in `TutorialPage.tsx`.

## Environment

`.env.local` (not committed; see `deploy/production.env.template` for the production set) uses: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `AUTH_TRUST_HOST`, `API_BASE_URL`, `NEXT_PUBLIC_API_BASE_URL`, `FACE_DETECT_BASE_URL`, `CAMERA_BASE_URL`, `CAMERA_ADMIN_TOKEN`, `NEXT_PUBLIC_WEBSOCKET_URL`, plus `NEXT_PUBLIC_*` version info. `NEXT_PUBLIC_*` values are inlined at build time, so changing them needs a rebuild. Never put service tokens in `NEXT_PUBLIC_*` variables.

## Git

Branches: `main`, `develop` (active), `feature/*`. Commit messages in this repo are short Vietnamese (no diacritics) lines prefixed with the author name.
