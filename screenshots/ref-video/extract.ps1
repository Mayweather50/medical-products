Add-Type -AssemblyName PresentationCore,WindowsBase
$video = 'C:\Users\user\Downloads\Сайт для зуботехнической лаборатории.mp4'
$outDir = 'D:\medical-products\screenshots\ref-video'
$player = New-Object System.Windows.Media.MediaPlayer
$opened = $false
$failed = $false
$player.add_MediaOpened({ $script:opened = $true })
$player.add_MediaFailed({ $script:failed = $true; Write-Host ('MediaFailed: ' + $_.ErrorException.Message) })
$player.Open([Uri]::new($video))
$deadline = [DateTime]::Now.AddSeconds(6)
while(-not $opened -and -not $failed -and [DateTime]::Now -lt $deadline){ [System.Windows.Threading.Dispatcher]::CurrentDispatcher.Invoke([Action]{}, [System.Windows.Threading.DispatcherPriority]::Background); Start-Sleep -Milliseconds 50 }
if(-not $opened){ throw 'Media did not open' }
$w = [Math]::Max(1, $player.NaturalVideoWidth)
$h = [Math]::Max(1, $player.NaturalVideoHeight)
Write-Host "opened ${w}x${h} duration=$($player.NaturalDuration)"
$times = @(0.2, 1.2, 2.4, 3.6, 5.0, 7.0, 9.5)
foreach($t in $times){
  $player.Position = [TimeSpan]::FromSeconds($t)
  $player.Play(); Start-Sleep -Milliseconds 180; $player.Pause(); Start-Sleep -Milliseconds 250
  [System.Windows.Threading.Dispatcher]::CurrentDispatcher.Invoke([Action]{}, [System.Windows.Threading.DispatcherPriority]::Background)
  $dv = New-Object System.Windows.Media.DrawingVisual
  $dc = $dv.RenderOpen()
  $dc.DrawVideo($player, [System.Windows.Rect]::new(0,0,$w,$h))
  $dc.Close()
  $bmp = New-Object System.Windows.Media.Imaging.RenderTargetBitmap($w,$h,96,96,[System.Windows.Media.PixelFormats]::Pbgra32)
  $bmp.Render($dv)
  $enc = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
  $enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($bmp))
  $path = Join-Path $outDir ('frame_{0:00}.png' -f ([int]($t*10)))
  $fs = [System.IO.File]::Open($path, [System.IO.FileMode]::Create)
  $enc.Save($fs); $fs.Close()
  Write-Host $path
}
$player.Close()
