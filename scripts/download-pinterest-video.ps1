param(
  [string]$Url = "https://ru.pinterest.com/pin/1029283689856215552/",
  [string]$OutputDir = ".\downloads\pinterest"
)

$ErrorActionPreference = "Stop"

$python = "C:\Users\naym4\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if (-not (Test-Path -LiteralPath $python)) {
  $pythonCmd = Get-Command python -ErrorAction SilentlyContinue
  if (-not $pythonCmd) {
    throw "Python не найден. Установи Python или поправь путь `$python в этом скрипте."
  }
  $python = $pythonCmd.Source
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

Write-Host "Checking yt-dlp..."
$hasYtDlp = $false
try {
  & $python -c "import yt_dlp" 2>$null
  $hasYtDlp = ($LASTEXITCODE -eq 0)
} catch {
  $hasYtDlp = $false
}

if (-not $hasYtDlp) {
  Write-Host "Installing yt-dlp..."
  & $python -m pip install --upgrade yt-dlp
  if ($LASTEXITCODE -ne 0) {
    throw "Не удалось установить yt-dlp. Проверь интернет/доступ к pip."
  }
}

$template = Join-Path $OutputDir "%(title).120B-%(id)s.%(ext)s"

Write-Host "Downloading:"
Write-Host $Url
& $python -m yt_dlp `
  --no-playlist `
  --restrict-filenames `
  --windows-filenames `
  --merge-output-format mp4 `
  -f "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/best" `
  -o $template `
  $Url

if ($LASTEXITCODE -ne 0) {
  throw "yt-dlp не смог скачать видео. Если Pinterest просит логин, экспортируй cookies браузера и добавь к команде --cookies-from-browser chrome."
}

Write-Host ""
Write-Host "Downloaded files:"
Get-ChildItem -LiteralPath $OutputDir -File | Sort-Object LastWriteTime -Descending | Select-Object -First 5 FullName, Length
