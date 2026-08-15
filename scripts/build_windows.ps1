# Build del AAB desde el host Windows (necesario en WSL2 ARM64).
# Uso en PowerShell:  powershell -ExecutionPolicy Bypass -File scripts/build_windows.ps1
$ErrorActionPreference = "Stop"

$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"

Push-Location "$PSScriptRoot\..\android"
try {
    & .\gradlew.bat bundleRelease --no-daemon
    if ($LASTEXITCODE -ne 0) { throw "bundleRelease falló" }
    Write-Host ""
    Write-Host "OK: android\app\build\outputs\bundle\release\app-release.aab"
} finally {
    Pop-Location
}
