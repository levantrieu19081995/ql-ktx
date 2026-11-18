[CmdletBinding()]
param(
  [string]$OutputDirectory = "artifacts",
  [string]$PackageName = "ktx-frontend-production-linux-x64.zip",
  [switch]$KeepStage
)

$ErrorActionPreference = "Stop"
$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$OutputRoot = [System.IO.Path]::GetFullPath((Join-Path $ProjectRoot $OutputDirectory))
$StageRoot = Join-Path $OutputRoot "ktx-frontend-production"
$RuntimeRoot = Join-Path $OutputRoot ".linux-sharp-runtime"
$ZipPath = Join-Path $OutputRoot $PackageName
$StandaloneRoot = Join-Path $ProjectRoot ".next\standalone"
$StaticRoot = Join-Path $ProjectRoot ".next\static"
$PublicRoot = Join-Path $ProjectRoot "public"

function Assert-PathExists {
  param([string]$Path, [string]$Description)
  if (-not (Test-Path -LiteralPath $Path)) {
    throw "$Description not found: $Path"
  }
}

function Copy-DirectoryContent {
  param([string]$Source, [string]$Destination)
  New-Item -ItemType Directory -Path $Destination -Force | Out-Null
  Get-ChildItem -LiteralPath $Source -Force | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination $Destination -Recurse -Force
  }
}

Assert-PathExists $StandaloneRoot "Next.js standalone output"
Assert-PathExists (Join-Path $StandaloneRoot "server.js") "Standalone server.js"
Assert-PathExists $StaticRoot "Next.js static output"
Assert-PathExists $PublicRoot "Public assets"

New-Item -ItemType Directory -Path $OutputRoot -Force | Out-Null
foreach ($safeTarget in @($StageRoot, $RuntimeRoot)) {
  if (Test-Path -LiteralPath $safeTarget) {
    Remove-Item -LiteralPath $safeTarget -Recurse -Force
  }
}
if (Test-Path -LiteralPath $ZipPath) {
  Remove-Item -LiteralPath $ZipPath -Force
}

New-Item -ItemType Directory -Path $StageRoot -Force | Out-Null
Copy-DirectoryContent $StandaloneRoot $StageRoot
Copy-DirectoryContent $StaticRoot (Join-Path $StageRoot ".next\static")
Copy-DirectoryContent $PublicRoot (Join-Path $StageRoot "public")

Copy-Item -LiteralPath (Join-Path $ProjectRoot "deploy\ecosystem.config.cjs") -Destination $StageRoot
Copy-Item -LiteralPath (Join-Path $ProjectRoot "deploy\production.env.template") -Destination $StageRoot
Copy-Item -LiteralPath (Join-Path $ProjectRoot "DEPLOY_UBUNTU.md") -Destination $StageRoot

# Next/Image uses sharp at runtime. A Windows build contains a Windows native binary,
# so install and overlay the Ubuntu glibc x64 optional packages before zipping.
$SharpPackage = Get-Content -LiteralPath (Join-Path $ProjectRoot "node_modules\sharp\package.json") -Raw | ConvertFrom-Json
$SharpVersion = $SharpPackage.version
New-Item -ItemType Directory -Path $RuntimeRoot -Force | Out-Null

& npm.cmd install `
  --prefix $RuntimeRoot `
  --no-save `
  --package-lock=false `
  --omit=dev `
  --include=optional `
  --os=linux `
  --cpu=x64 `
  --libc=glibc `
  "sharp@$SharpVersion"
if ($LASTEXITCODE -ne 0) {
  throw "Unable to prepare the Linux x64 sharp runtime."
}

$LinuxPackages = @(
  "node_modules\sharp",
  "node_modules\detect-libc",
  "node_modules\semver",
  "node_modules\@img\colour",
  "node_modules\@img\sharp-linux-x64",
  "node_modules\@img\sharp-libvips-linux-x64"
)

foreach ($relativePackage in $LinuxPackages) {
  $sourcePackage = Join-Path $RuntimeRoot $relativePackage
  Assert-PathExists $sourcePackage "Linux runtime package"
  $destinationPackage = Join-Path $StageRoot $relativePackage
  if (Test-Path -LiteralPath $destinationPackage) {
    Remove-Item -LiteralPath $destinationPackage -Recurse -Force
  }
  New-Item -ItemType Directory -Path (Split-Path $destinationPackage -Parent) -Force | Out-Null
  Copy-Item -LiteralPath $sourcePackage -Destination $destinationPackage -Recurse -Force
}

# Do not ship any Windows native package in the Ubuntu package. These packages
# are build-time optional dependencies; the production server uses the compiled
# output plus the Linux sharp runtime overlaid above.
$NodeModulesRoot = Join-Path $StageRoot "node_modules"
if (Test-Path -LiteralPath $NodeModulesRoot) {
  Get-ChildItem -LiteralPath $NodeModulesRoot -Directory -Recurse |
    Where-Object { $_.Name -like "*win32*" } |
    Sort-Object { $_.FullName.Length } -Descending |
    Remove-Item -Recurse -Force
}

$SharpBinary = Join-Path $StageRoot "node_modules\@img\sharp-linux-x64\lib\sharp-linux-x64.node"
Assert-PathExists $SharpBinary "Linux sharp native binary"
$ElfHeader = [System.IO.File]::ReadAllBytes($SharpBinary)[0..19]
if (-not (
  $ElfHeader[0] -eq 0x7F -and
  $ElfHeader[1] -eq 0x45 -and
  $ElfHeader[2] -eq 0x4C -and
  $ElfHeader[3] -eq 0x46 -and
  $ElfHeader[18] -eq 0x3E -and
  $ElfHeader[19] -eq 0x00
)) {
  throw "The packaged sharp binary is not an ELF x86_64 binary."
}

# Fail if forbidden build/source files accidentally enter the runtime package.
$ForbiddenEntries = Get-ChildItem -LiteralPath $StageRoot -Force -Recurse | Where-Object {
  $_.Name -eq ".git" -or
  $_.Name -eq ".env.local" -or
  $_.FullName -like "*\.next\cache\*"
}
if ($ForbiddenEntries) {
  throw "Forbidden files were found in the package: $($ForbiddenEntries.FullName -join ', ')"
}

# Compare sensitive local environment values against every packaged file without
# printing the values. This catches accidental inlining while keeping secrets hidden.
$LocalEnvPath = Join-Path $ProjectRoot ".env.local"
if (Test-Path -LiteralPath $LocalEnvPath) {
  $SensitiveValues = Get-Content -LiteralPath $LocalEnvPath |
    Where-Object { $_ -match "^[A-Za-z_][A-Za-z0-9_]*(SECRET|TOKEN|PASSWORD)[A-Za-z0-9_]*=" } |
    ForEach-Object { ($_ -split "=", 2)[1].Trim() } |
    Where-Object { $_.Length -ge 8 } |
    Select-Object -Unique

  $TextExtensions = @(
    ".js", ".cjs", ".mjs", ".json", ".html", ".css", ".txt", ".md", ".map"
  )
  foreach ($file in Get-ChildItem -LiteralPath $StageRoot -File -Recurse | Where-Object {
    $TextExtensions -contains $_.Extension.ToLowerInvariant()
  }) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    foreach ($sensitiveValue in $SensitiveValues) {
      if ($content.IndexOf($sensitiveValue, [System.StringComparison]::Ordinal) -ge 0) {
        throw "A sensitive local environment value was found in packaged file: $($file.FullName)"
      }
    }
  }
}

$BuildInfo = @(
  "Application: KTX CTU Frontend",
  "Target: Ubuntu Linux x86_64 (glibc)",
  "Node.js: 20.19.5",
  "Next.js: 15.4.6",
  "PackagedAtUtc: $([DateTime]::UtcNow.ToString('o'))"
) -join [Environment]::NewLine
[System.IO.File]::WriteAllText(
  (Join-Path $StageRoot "BUILD_INFO.txt"),
  $BuildInfo,
  [System.Text.UTF8Encoding]::new($false)
)

$TarCommand = Get-Command tar.exe -ErrorAction SilentlyContinue
if ($TarCommand) {
  Push-Location $StageRoot
  try {
    & $TarCommand.Source -a -c -f $ZipPath "."
    if ($LASTEXITCODE -ne 0) {
      throw "tar.exe failed to create the ZIP package."
    }
  }
  finally {
    Pop-Location
  }
}
else {
  Compress-Archive -Path (Join-Path $StageRoot "*") -DestinationPath $ZipPath -CompressionLevel Optimal
}

if (-not $KeepStage) {
  Remove-Item -LiteralPath $StageRoot -Recurse -Force
}
Remove-Item -LiteralPath $RuntimeRoot -Recurse -Force

Write-Output $ZipPath
