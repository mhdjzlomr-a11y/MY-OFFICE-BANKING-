# =====================================================================
# Office Finance Local Web Server (Zero-Timeout, Multi-Connection Safe)
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
Write-Host "       OFFICE FINANCE SERVER IS RUNNING (NO TIMEOUT)             " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  URL: http://localhost:$port" -ForegroundColor Yellow
Write-Host ""
Write-Host "  [!] Keep this window open while using the application." -ForegroundColor Gray
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""

# Launch Chrome
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
        $client.ReceiveTimeout = 2500
        $client.SendTimeout = 2500
        $stream = $client.GetStream()

        $buffer = New-Object byte[] 4096
        $bytesRead = $stream.Read($buffer, 0, $buffer.Length)

        if ($bytesRead -gt 0) {
            $requestText = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $bytesRead)
            $firstLine = $requestText.Split("`n")[0].Trim()
            $parts = $firstLine.Split(" ")

            if ($parts.Length -ge 2 -and $parts[0] -eq "OPTIONS") {
                $corsHeaders = "HTTP/1.1 200 OK`r`nAccess-Control-Allow-Origin: *`r`nAccess-Control-Allow-Methods: GET, POST, OPTIONS`r`nAccess-Control-Allow-Headers: Content-Type, Authorization`r`nContent-Length: 0`r`nConnection: close`r`n`r`n"
                $corsBytes = [System.Text.Encoding]::ASCII.GetBytes($corsHeaders)
                $stream.Write($corsBytes, 0, $corsBytes.Length)
            } elseif ($parts.Length -ge 2 -and $parts[0] -eq "POST" -and $parts[1].StartsWith("/api/send-whatsapp")) {
                $headerEnd = $requestText.IndexOf("`r`n`r`n")
                $body = ""
                if ($headerEnd -ge 0) {
                    $body = $requestText.Substring($headerEnd + 4)
                }
                
                $resultObj = @{ success = $false; message = "No valid gateway configured" }
                try {
                    $data = $body | ConvertFrom-Json
                    $phone = $data.phone
                    $msg = $data.message
                    $mode = $data.mode
                    $apiKey = $data.apiKey
                    $phoneId = $data.phoneId
                    $webhookUrl = $data.webhookUrl

                    if ($mode -eq "callmebot" -and $apiKey) {
                        $encMsg = [System.Net.WebUtility]::UrlEncode($msg)
                        $callUrl = "https://api.callmebot.com/whatsapp.php?phone=$phone&text=$encMsg&apikey=$apiKey"
                        $null = Invoke-RestMethod -Uri $callUrl -Method Get -TimeoutSec 10 -ErrorAction SilentlyContinue
                        $resultObj = @{ success = $true; message = "CallMeBot message dispatched automatically" }
                    } elseif ($mode -eq "ultramsg" -and $apiKey -and $phoneId) {
                        $ultraUrl = "https://api.ultramsg.com/$phoneId/messages/chat"
                        $ultraBody = @{ token = $apiKey; to = $phone; body = $msg }
                        $null = Invoke-RestMethod -Uri $ultraUrl -Method Post -Body $ultraBody -TimeoutSec 10 -ErrorAction SilentlyContinue
                        $resultObj = @{ success = $true; message = "UltraMsg message dispatched automatically" }
                    } elseif ($mode -eq "webhook" -and $webhookUrl) {
                        $hdr = @{ "Content-Type" = "application/json" }
                        if ($apiKey) { $hdr["Authorization"] = "Bearer $apiKey" }
                        $null = Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $body -Headers $hdr -TimeoutSec 10 -ErrorAction SilentlyContinue
                        $resultObj = @{ success = $true; message = "Webhook dispatched automatically" }
                    }
                } catch {
                    $resultObj = @{ success = $false; error = $_.Exception.Message }
                }

                $jsonText = $resultObj | ConvertTo-Json -Compress
                $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes($jsonText)
                $respHeaders = "HTTP/1.1 200 OK`r`nContent-Type: application/json; charset=utf-8`r`nContent-Length: $($jsonBytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nAccess-Control-Allow-Methods: GET, POST, OPTIONS`r`nAccess-Control-Allow-Headers: Content-Type, Authorization`r`nConnection: close`r`n`r`n"
                $rhBytes = [System.Text.Encoding]::ASCII.GetBytes($respHeaders)
                $stream.Write($rhBytes, 0, $rhBytes.Length)
                $stream.Write($jsonBytes, 0, $jsonBytes.Length)
            } elseif ($parts.Length -ge 2 -and $parts[0] -eq "GET") {
                $rawPath = $parts[1].Split("?")[0]
                if ($rawPath -eq "/" -or $rawPath -eq "") { $rawPath = "/index.html" }
                
                $safePath = $rawPath.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
                $targetFile = Join-Path $root $safePath

                if (Test-Path $targetFile -PathType Leaf) {
                    $ext = [System.IO.Path]::GetExtension($targetFile).ToLower()
                    $mime = $mimeTypes[$ext]
                    if (-not $mime) { $mime = "application/octet-stream" }
                    $content = [System.IO.File]::ReadAllBytes($targetFile)

                    $headers = "HTTP/1.1 200 OK`r`nContent-Type: $mime`r`nContent-Length: $($content.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
                    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
                    $stream.Write($headerBytes, 0, $headerBytes.Length)
                    $stream.Write($content, 0, $content.Length)
                } else {
                    $notFound = "404 Not Found"
                    $nfBytes = [System.Text.Encoding]::ASCII.GetBytes($notFound)
                    $nfHeaders = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain`r`nContent-Length: $($nfBytes.Length)`r`nConnection: close`r`n`r`n"
                    $hBytes = [System.Text.Encoding]::ASCII.GetBytes($nfHeaders)
                    $stream.Write($hBytes, 0, $hBytes.Length)
                    $stream.Write($nfBytes, 0, $nfBytes.Length)
                }
            }
        }
        $stream.Flush()
        $client.Close()
    } catch {
        # ignore timeouts and client disconnects
    }
}
