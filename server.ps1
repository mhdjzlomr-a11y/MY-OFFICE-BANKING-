# =====================================================================
# Office Finance Local Web Server (TcpListener - Zero Errors)
# =====================================================================

$port = 5050
$root = $PSScriptRoot

try {
    $endpoint = New-Object System.Net.IPEndPoint ([System.Net.IPAddress]::Loopback, $port)
    $server = New-Object System.Net.Sockets.TcpListener $endpoint
    $server.Start()
} catch {
    $port = 8080
    $endpoint = New-Object System.Net.IPEndPoint ([System.Net.IPAddress]::Loopback, $port)
    $server = New-Object System.Net.Sockets.TcpListener $endpoint
    $server.Start()
}

Clear-Host
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "         OFFICE FINANCE LOCAL SERVER IS LIVE & RUNNING!          " -ForegroundColor Cyan
Write-Host "         ഓഫീസ് ഫിനാൻസ് ലോക്കൽ സെർവർ പ്രവർത്തിക്കുന്നു!            " -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Chrome Browser URL: http://localhost:$port" -ForegroundColor White
Write-Host ""
Write-Host "  [!] ഈ വിൻഡോ ക്ലോസ് ചെയ്യാതെ മിനിമൈസ് ചെയ്തു വെയ്ക്കുക." -ForegroundColor Gray
Write-Host "  [!] സെർവർ നിർത്താൻ: ഈ വിൻഡോ ക്ലോസ് ചെയ്യുക (Close window)." -ForegroundColor Gray
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""

# Launch Google Chrome
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (Test-Path $chrome) {
    Start-Process $chrome "http://localhost:$port"
} else {
    Start-Process "http://localhost:$port"
}

$mimeTypes = @{
    ".html"        = "text/html; charset=utf-8"
    ".css"         = "text/css; charset=utf-8"
    ".js"          = "application/javascript; charset=utf-8"
    ".json"        = "application/json; charset=utf-8"
    ".webmanifest" = "application/manifest+json; charset=utf-8"
    ".png"         = "image/png"
    ".svg"         = "image/svg+xml"
    ".ico"         = "image/x-icon"
}

while ($true) {
    try {
        $client = $server.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader $stream
        $line = $reader.ReadLine()

        if ($line) {
            $tokens = $line.Split(' ')
            if ($tokens.Length -ge 2 -and $tokens[0] -eq 'GET') {
                $path = $tokens[1].Split('?')[0]
                if ($path -eq '/' -or $path -eq '') { $path = '/index.html' }
                $filePath = Join-Path $root ($path.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar))

                if (Test-Path $filePath -PathType Leaf) {
                    $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                    $mime = $mimeTypes[$ext]
                    if (-not $mime) { $mime = "application/octet-stream" }
                    $bytes = [System.IO.File]::ReadAllBytes($filePath)

                    $header = "HTTP/1.1 200 OK`r`nContent-Type: $mime`r`nContent-Length: $($bytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
                    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
                    $stream.Write($headerBytes, 0, $headerBytes.Length)
                    $stream.Write($bytes, 0, $bytes.Length)
                } else {
                    $body = "404 Not Found"
                    $bodyBytes = [System.Text.Encoding]::ASCII.GetBytes($body)
                    $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain`r`nContent-Length: $($bodyBytes.Length)`r`nConnection: close`r`n`r`n"
                    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
                    $stream.Write($headerBytes, 0, $headerBytes.Length)
                    $stream.Write($bodyBytes, 0, $bodyBytes.Length)
                }
            }
        }
        $stream.Flush()
        $client.Close()
    } catch {
        # ignore client disconnects
    }
}
