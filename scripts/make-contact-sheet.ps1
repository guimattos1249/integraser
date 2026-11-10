Add-Type -AssemblyName System.Drawing

$source = (Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot '..') -Directory | Where-Object Name -Like 'Identidade Corporativa*' | Select-Object -First 1).FullName
$output = Join-Path $PSScriptRoot '..\tmp\contact-sheet.jpg'
$files = 1..23 | ForEach-Object { Join-Path $source ("$($_).jpg") } | Where-Object { Test-Path -LiteralPath $_ }

$cellWidth = 260
$cellHeight = 300
$columns = 5
$rows = [int][Math]::Ceiling($files.Count / $columns)
$canvas = [System.Drawing.Bitmap]::new([int]($cellWidth * $columns), [int]($cellHeight * $rows))
$graphics = [System.Drawing.Graphics]::FromImage($canvas)
$graphics.Clear([System.Drawing.Color]::White)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$font = New-Object System.Drawing.Font 'Arial', 18, ([System.Drawing.FontStyle]::Bold)
$brush = [System.Drawing.Brushes]::Black

for ($i = 0; $i -lt $files.Count; $i++) {
    $image = [System.Drawing.Image]::FromFile($files[$i])
    $column = $i % $columns
    $row = [Math]::Floor($i / $columns)
    $x = $column * $cellWidth
    $y = $row * $cellHeight
    $scale = [Math]::Min(($cellWidth - 20) / $image.Width, ($cellHeight - 46) / $image.Height)
    $width = [int]($image.Width * $scale)
    $height = [int]($image.Height * $scale)
    $left = $x + [int](($cellWidth - $width) / 2)
    $top = $y + 34 + [int](($cellHeight - 40 - $height) / 2)
    $graphics.DrawString(([IO.Path]::GetFileNameWithoutExtension($files[$i])), $font, $brush, $x + 8, $y + 5)
    $graphics.DrawImage($image, $left, $top, $width, $height)
    $image.Dispose()
}

$canvas.Save($output, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$graphics.Dispose()
$canvas.Dispose()
$font.Dispose()
Write-Output $output
