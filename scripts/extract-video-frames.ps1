param(
  [Parameter(Mandatory = $true)]
  [string]$InputPath,

  [string]$OutputDir = "",
  [string[]]$Times = @("00:00:01", "00:00:02", "00:00:03", "00:00:04")
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $InputPath)) {
  throw "Файл не найден: $InputPath"
}

if ($Times.Count -eq 1 -and $Times[0].Contains(",")) {
  $Times = $Times[0].Split(",") | ForEach-Object { $_.Trim() } | Where-Object { $_ }
}

function Get-FfmpegPath {
  $ffmpegCmd = Get-Command ffmpeg -ErrorAction SilentlyContinue
  if ($ffmpegCmd) { return $ffmpegCmd.Source }

  $python = "C:\Users\naym4\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
  if (-not (Test-Path -LiteralPath $python)) {
    $pythonCmd = Get-Command python -ErrorAction SilentlyContinue
    if (-not $pythonCmd) {
      throw "ffmpeg не найден, и Python тоже не найден для автоустановки imageio-ffmpeg."
    }
    $python = $pythonCmd.Source
  }

  $hasImageioFfmpeg = $false
  try {
    & $python -c "import imageio_ffmpeg" 2>$null
    $hasImageioFfmpeg = ($LASTEXITCODE -eq 0)
  } catch {
    $hasImageioFfmpeg = $false
  }

  if (-not $hasImageioFfmpeg) {
    Write-Host "Installing imageio-ffmpeg..."
    $installOutput = & $python -m pip install --upgrade imageio-ffmpeg 2>&1
    if ($LASTEXITCODE -ne 0) {
      $installOutput | ForEach-Object { Write-Host $_ }
      throw "Не удалось установить imageio-ffmpeg."
    }
  }

  $ffmpegPath = (& $python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())").Trim()
  if (-not (Test-Path -LiteralPath $ffmpegPath)) {
    throw "imageio-ffmpeg установлен, но ffmpeg не найден: $ffmpegPath"
  }
  return $ffmpegPath
}

if (-not $OutputDir) {
  $dir = Split-Path -Parent $InputPath
  $name = [IO.Path]::GetFileNameWithoutExtension($InputPath)
  $OutputDir = Join-Path $dir "$name-frames"
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

for ($i = 0; $i -lt $Times.Count; $i++) {
  $out = Join-Path $OutputDir ("frame_{0:D2}.png" -f ($i + 1))
  $ffmpegPath = Get-FfmpegPath
  & $ffmpegPath -y -ss $Times[$i] -i $InputPath -frames:v 1 -update 1 -q:v 2 $out
  if ($LASTEXITCODE -ne 0) {
    throw "Не удалось извлечь кадр на $($Times[$i])."
  }
}

Write-Host "Frames:"
Get-ChildItem -LiteralPath $OutputDir -File
