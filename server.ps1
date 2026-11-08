# =====================================================================
# Office Finance Local Web Server (Windows PowerShell)
# =====================================================================

$Port = 5050
$Root = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Prefixes.Add("http://127.0.0.1:$Port/")

# Try to add local Wi-Fi IP for Android mobile access
$localIP = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "*Wi-Fi*", "*Ethernet*" -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } | Select-Object -ExpandProperty IPAddress -First 1)

if ($localIP) {
    try {
        $listener.Prefixes.Add("http://${localIP}:${Port}/")
    } catch {
        # continue with localhost
    }
}

try {
    $listener.Start()
} catch {
    $Port = 8080
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$Port/")
    $listener.Prefixes.Add("http://127.0.0.1:$Port/")
    $listener.Start()
}

Clear-Host
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "         OFFICE FINANCE LOCAL SERVER IS LIVE & RUNNING!          " -ForegroundColor Cyan
Write-Host "         ഓഫീസ് ഫിനാൻസ് ലോക്കൽ വെബ് സെർവർ തയ്യാറാണ്!              " -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  💻 PC Browser URL:      " -NoNewline -ForegroundColor White
Write-Host "http://localhost:$Port" -ForegroundColor Cyan
if ($localIP) {
    Write-Host "  📱 Mobile (Same Wi-Fi): " -NoNewline -ForegroundColor White
    Write-Host "http://${localIP}:${Port}" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "  [!] Keep this window OPEN while using the application." -ForegroundColor Gray
Write-Host "  [!] To stop the server: Press Ctrl + C or close this window." -ForegroundColor Gray
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""

# Launch Browser
Start-Process "http://localhost:$Port"

$mimeTypes = @{
    ".html"        = "text/html; charset=utf-8"
    ".css"         = "text/css; charset=utf-8"
    ".js"          = "application/javascript; charset=utf-8"
    ".json"        = "application/json; charset=utf-8"
    ".webmanifest" = "application/manifest+json; charset=utf-8"
    ".png"         = "image/png"
    ".svg"         = "image/svg+xml"
    ".ico"         = "image/x-icon"
    ".woff2"       = "font/woff2"
    ".ttf"         = "font/ttf"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath
        if ($path -eq "/" -or $path -eq "") {
            $path = "/index.html"
        }

        $filePath = Join-Path $Root ($path.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar))

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = $mimeTypes[$ext]
            if (-not $mime) { $mime = "application/octet-stream" }

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.AddHeader("Cache-Control", "no-cache")
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.Close()
    } catch {
        # ignore client disconnects
    }
}
