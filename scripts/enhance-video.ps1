param(
  [Parameter(Mandatory = $true)]
  [string]$InputPath,

  [string]$OutputPath = "",
  [int]$Width = 1920,
  [int]$Crf = 17,
  [string]$Preset = "slow"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $InputPath)) {
  throw "Файл не найден: $InputPath"
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

if (-not $OutputPath) {
  $dir = Split-Path -Parent $InputPath
  $name = [IO.Path]::GetFileNameWithoutExtension($InputPath)
  $OutputPath = Join-Path $dir "$name-enhanced.mp4"
}

$filter = "scale=${Width}:-2:flags=lanczos,hqdn3d=1.2:1.0:6:4,unsharp=5:5:0.65:3:3:0.25,eq=contrast=1.04:saturation=1.05"

Write-Host "Enhancing:"
Write-Host $InputPath
Write-Host "Output:"
Write-Host $OutputPath

$ffmpegPath = Get-FfmpegPath

& $ffmpegPath `
  -y `
  -i $InputPath `
  -vf $filter `
  -c:v libx264 `
  -crf $Crf `
  -preset $Preset `
  -pix_fmt yuv420p `
  -movflags +faststart `
  -c:a aac `
  -b:a 160k `
  $OutputPath

if ($LASTEXITCODE -ne 0) {
  throw "ffmpeg завершился с ошибкой."
}

Write-Host "Done: $OutputPath"
