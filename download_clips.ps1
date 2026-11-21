# Downloads the best available quality (4K if the source has it) for each URL
# into a "bills_clips" folder, ready to import into CapCut.
#
# Usage:
#   .\download_clips.ps1 "https://youtube.com/watch?v=..." "https://youtube.com/watch?v=..."
#
# Or list URLs in urls.txt (one per line) and run with no args:
#   .\download_clips.ps1

param(
    [string[]]$Urls
)

$outDir = Join-Path $PSScriptRoot "bills_clips"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

if (-not $Urls -or $Urls.Count -eq 0) {
    $listFile = Join-Path $PSScriptRoot "urls.txt"
    if (Test-Path $listFile) {
        $Urls = Get-Content $listFile | Where-Object { $_.Trim() -ne "" }
    } else {
        Write-Host "No URLs given and no urls.txt found. Create urls.txt (one URL per line) or pass URLs as arguments."
        exit 1
    }
}

foreach ($url in $Urls) {
    Write-Host "Downloading: $url"
    yt-dlp `
        -f "bestvideo[height<=2160][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=2160]+bestaudio/best" `
        --merge-output-format mp4 `
        -o "$outDir/%(title)s.%(ext)s" `
        --embed-metadata `
        $url
}

Write-Host "`nDone. Clips saved to: $outDir"
