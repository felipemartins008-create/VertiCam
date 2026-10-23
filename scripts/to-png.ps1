param([string]$Src, [string]$Dst)
Add-Type -AssemblyName System.Drawing
$dir = Split-Path $Dst
if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
$img = [System.Drawing.Image]::FromFile($Src)
$img.Save($Dst, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Converted $Src -> $Dst ($($img.Width)x$($img.Height))"
$img.Dispose()
