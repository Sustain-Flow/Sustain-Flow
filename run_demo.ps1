$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

if (-not (Test-Path ".\venv\Scripts\python.exe")) {
    Write-Error "Virtual environment not found."
    exit 1
}

Write-Host "`n=== SustainFlow Investigation Demo ===" -ForegroundColor Cyan
& ".\venv\Scripts\python.exe" -m app.demo

if ($LASTEXITCODE -ne 0) {
    Write-Error "The demo failed. Check the error output above."
    exit $LASTEXITCODE
}

Write-Host "`n=== Generated Reports ===" -ForegroundColor Green
Get-ChildItem ".\outputs" -File |
    Select-Object Name, Length

Write-Host "`nDemo completed successfully." -ForegroundColor Green
