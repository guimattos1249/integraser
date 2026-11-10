Add-Type -AssemblyName System.Drawing

$sourceDirectory = (Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot '..') -Directory | Where-Object Name -Like 'Identidade Corporativa*' | Select-Object -First 1).FullName
$sourcePath = Join-Path $sourceDirectory '14.png'
$outputPath = Join-Path $PSScriptRoot '..\sites\integraser\dist\assets\logo-horizontal.png'
$bitmap = [System.Drawing.Bitmap]::new($sourcePath)

$minX = $bitmap.Width
$minY = $bitmap.Height
$maxX = 0
$maxY = 0

for ($y = 0; $y -lt $bitmap.Height; $y += 2) {
    for ($x = 0; $x -lt $bitmap.Width; $x += 2) {
        $pixel = $bitmap.GetPixel($x, $y)
        $isVisible = $pixel.A -gt 20 -and ($pixel.R -lt 225 -or $pixel.G -lt 225 -or $pixel.B -lt 225)
        if ($isVisible) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

$padding = 22
$left = [Math]::Max(0, $minX - $padding)
$top = [Math]::Max(0, $minY - $padding)
$right = [Math]::Min($bitmap.Width - 1, $maxX + $padding)
$bottom = [Math]::Min($bitmap.Height - 1, $maxY + $padding)
$rectangle = [System.Drawing.Rectangle]::new($left, $top, $right - $left + 1, $bottom - $top + 1)
$cropped = $bitmap.Clone($rectangle, $bitmap.PixelFormat)
$cropped.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$cropped.Dispose()
$bitmap.Dispose()

Write-Output $outputPath
