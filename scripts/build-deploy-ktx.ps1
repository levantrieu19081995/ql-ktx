param(
    [ValidateSet('build', 'deploy')]
    [string]$Action = 'build',
    # Bỏ qua bước `npm run build`, dùng lại .next đã build sẵn.
    [switch]$SkipBuild,
    # Server cũ không nhận SFTP mặc định của OpenSSH mới: thêm cờ này để dùng SCP legacy (scp -O).
    [switch]$LegacyScp,
    # Không hỏi xác nhận trước khi upload.
    [switch]$Yes,
    # Gói zip đã upload sẵn lên server (ví dụ ktx-frontend-20261120-132837.zip): chỉ chạy lại bước giải nén + PM2.
    [string]$RemoteOnlyZip = ''
)

# Cách dùng (từ thư mục gốc dự án):
#   npm run build-zip      # build + đóng gói zip, chưa đưa lên server
#   npm run build-deploy   # build + đóng gói + upload + giải nén + chạy PM2 trên server
#
# Mỗi lần deploy tạo release mới trong frontend/releases/<ngày-giờ>, đổi liên kết `current`,
# rồi gỡ hẳn tiến trình ktx_frontend cũ (`pm2 delete`) và chạy lại từ bản mới (`pm2 start`) để không bị
# đụng cổng hay bộ nhớ của bản cũ. Nếu cổng vẫn bị tiến trình lạ giữ thì dừng, không tự kill. Nếu kiểm
# tra sau khi chạy bị lỗi thì tự quay `current` về bản trước. Không đụng tới ktx_eureka, ktx_gateway, ktx_kytucxa, ktx_user.
# Mật khẩu SSH được hỏi trực tiếp bởi ssh.exe/scp.exe, script không lưu mật khẩu.

$ErrorActionPreference = 'Stop'

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$PackageScript = Join-Path $PSScriptRoot 'package-production.ps1'
$ArtifactsDir = Join-Path $ProjectRoot 'artifacts'

# Cấu hình server KTX (172.18.141.250).
$ServerUser = 'admin_ktx'
$ServerHost = '172.18.141.250'
# Đường dẫn tương đối so với thư mục home của $ServerUser (scp và ssh đều bắt đầu ở home).
$RemoteFrontendDir = 'domains/ktx.ctu.edu.vn/frontend'
$Pm2ServiceName = 'ktx_frontend'
$LocalPort = 3000

$Stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$ZipName = "ktx-frontend-$Stamp.zip"
if ($RemoteOnlyZip) {
    $ZipName = $RemoteOnlyZip
    $Stamp = ($ZipName -replace '^ktx-frontend-', '') -replace '\.zip$', ''
}
$LocalZip = Join-Path $ArtifactsDir $ZipName

function Invoke-Checked([string]$FilePath, [string[]]$Arguments) {
    & $FilePath @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$FilePath thất bại với mã lỗi $LASTEXITCODE"
    }
}

# --- Bước 1: build -----------------------------------------------------------
if (-not $RemoteOnlyZip) {
if ($SkipBuild) {
    Write-Host '[1/4] Bỏ qua build, dùng .next hiện có.' -ForegroundColor Yellow
    if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot '.next\standalone\server.js'))) {
        throw 'Không có .next\standalone\server.js. Hãy chạy lại không kèm -SkipBuild.'
    }
}
else {
    Write-Host '[1/4] Build production (npm run build)...' -ForegroundColor Cyan
    Push-Location $ProjectRoot
    try {
        Invoke-Checked 'npm.cmd' @('run', 'build')
    }
    finally {
        Pop-Location
    }
}

# --- Bước 2: đóng gói zip cho Ubuntu ------------------------------------------
Write-Host "[2/4] Đóng gói $ZipName (đã thay binary sharp cho Linux)..." -ForegroundColor Cyan
Invoke-Checked 'powershell.exe' @(
    '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $PackageScript,
    '-PackageName', $ZipName
)
if (-not (Test-Path -LiteralPath $LocalZip)) {
    throw "Đóng gói xong nhưng không thấy file: $LocalZip"
}
$ZipSizeMb = [math]::Round((Get-Item -LiteralPath $LocalZip).Length / 1MB, 1)
Write-Host "Đã tạo: $LocalZip ($ZipSizeMb MB)" -ForegroundColor Green

if ($Action -eq 'build') {
    Write-Host 'Build hoàn tất, chưa deploy.' -ForegroundColor Green
    exit 0
}
}

# --- Cảnh báo trước khi đưa lên server ------------------------------------------
Push-Location $ProjectRoot
try {
    $dirty = @(git status --porcelain --untracked-files=no 2>$null).Count
    $unpushed = @(git rev-list '@{u}..HEAD' 2>$null).Count
}
finally {
    Pop-Location
}
if ($dirty -gt 0) {
    Write-Host "Lưu ý: còn $dirty file đã sửa chưa commit; gói này build từ mã đang có trên máy." -ForegroundColor Yellow
}
if ($unpushed -gt 0) {
    Write-Host "Lưu ý: còn $unpushed commit chưa đẩy lên GitHub." -ForegroundColor Yellow
}

$Remote = "$ServerUser@$ServerHost"
Write-Host ''
Write-Host "Sắp đưa lên: $Remote`:$RemoteFrontendDir (release $Stamp, PM2 $Pm2ServiceName)" -ForegroundColor Cyan
if (-not $Yes) {
    $answer = Read-Host 'Tiếp tục deploy? (y/N)'
    if ($answer -notmatch '^(y|yes)$') {
        Write-Host "Đã dừng. Gói vẫn còn ở: $LocalZip" -ForegroundColor Yellow
        exit 0
    }
}

# --- Bước 3: upload -----------------------------------------------------------
if ($RemoteOnlyZip) {
    Write-Host "[3/4] Bỏ qua upload, dùng $ZipName đã có trên server." -ForegroundColor Yellow
}
else {
    Write-Host "[3/4] Upload $ZipName lên $Remote..." -ForegroundColor Cyan
    $scpArgs = @()
    if ($LegacyScp) { $scpArgs += '-O' }
    $scpArgs += @($LocalZip, "$Remote`:$RemoteFrontendDir/$ZipName")
    Invoke-Checked 'scp.exe' $scpArgs
}

# --- Bước 4: giải nén, đổi `current`, PM2, kiểm tra, tự quay lại nếu lỗi --------
Write-Host "[4/4] Giải nén trên server, gỡ $Pm2ServiceName cũ rồi chạy lại từ bản mới..." -ForegroundColor Cyan
$remoteScript = @'
cd '@@DIR@@' || exit 1
PREVIOUS_RELEASE="$(readlink -f current 2>/dev/null)"
RELEASE='@@RELEASE@@'
ZIP='@@ZIP@@'
test -f "$ZIP" || { echo "Khong thay $ZIP tren server"; exit 1; }
test -f shared/production.env || { echo "Thieu shared/production.env"; exit 1; }
mkdir -p "releases/$RELEASE" && unzip -oq "$ZIP" -d "releases/$RELEASE" || { echo "Giai nen loi"; exit 1; }
test -f "releases/$RELEASE/server.js" || { echo "Goi khong co server.js"; exit 1; }
test -d "releases/$RELEASE/.next/static" || { echo "Goi thieu .next/static"; exit 1; }
source ~/.nvm/nvm.sh >/dev/null 2>&1
set -a; . shared/production.env; set +a
start_app() { pm2 start current/ecosystem.config.cjs --only @@PM2@@ --update-env; }
# Go han tien trinh cu (chi @@PM2@@) roi chay moi, tranh dung cong va dung bo nho cua ban cu.
pm2 delete @@PM2@@ >/dev/null 2>&1 || true
sleep 2
if ss -ltn sport = :@@PORT@@ | grep -q LISTEN; then
  echo "Cong @@PORT@@ van dang bi mot tien trinh khac giu sau khi go @@PM2@@. Khong tu kill, hay kiem tra:"
  ss -ltnp sport = :@@PORT@@
  echo "Chua chay ban moi; ban truoc van la: $PREVIOUS_RELEASE"
  exit 1
fi
ln -sfn "releases/$RELEASE" current
start_app
sleep 4
if curl --fail --silent --show-error --head http://127.0.0.1:@@PORT@@/ >/dev/null; then
  echo "DEPLOY OK: release $RELEASE (ban truoc: $PREVIOUS_RELEASE)"
  pm2 status @@PM2@@
else
  echo "KIEM TRA LOI, quay ve ban truoc: $PREVIOUS_RELEASE"
  pm2 logs @@PM2@@ --lines 40 --nostream
  pm2 delete @@PM2@@ >/dev/null 2>&1 || true
  if [ -n "$PREVIOUS_RELEASE" ]; then
    ln -sfn "$PREVIOUS_RELEASE" current
    sleep 2
    start_app
  fi
  exit 1
fi
'@
$remoteScript = $remoteScript.Replace('@@DIR@@', $RemoteFrontendDir).
    Replace('@@RELEASE@@', $Stamp).
    Replace('@@ZIP@@', $ZipName).
    Replace('@@PM2@@', $Pm2ServiceName).
    Replace('@@PORT@@', [string]$LocalPort)
$remoteScript = $remoteScript -replace "`r`n", "`n"
# Mã hóa base64 để tránh lỗi dấu nháy khi truyền qua ssh.
$encoded = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($remoteScript))
Invoke-Checked 'ssh.exe' @($Remote, "echo $encoded | base64 -d | bash")

Write-Host "Build và deploy KTX hoàn tất (release $Stamp)." -ForegroundColor Green
