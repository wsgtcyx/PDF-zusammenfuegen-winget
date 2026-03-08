param(
  [Parameter(Mandatory = $true)]
  [string]$InstallerPath
)

$ErrorActionPreference = "Stop"

Write-Host "Starte Silent-Install fuer $InstallerPath"
Start-Process -FilePath $InstallerPath -ArgumentList "/S" -Wait

$candidate = Get-ChildItem "$env:LOCALAPPDATA\\Programs" -Filter "PDFZusammenfuegen.exe" -Recurse | Select-Object -First 1

if (-not $candidate) {
  throw "PDFZusammenfuegen.exe wurde nach der Installation nicht gefunden."
}

Write-Host "Starte Smoke-Test mit $($candidate.FullName)"
$process = Start-Process -FilePath $candidate.FullName -ArgumentList "--smoke-test" -PassThru -Wait

if ($process.ExitCode -ne 0) {
  throw "Smoke-Test fehlgeschlagen. ExitCode: $($process.ExitCode)"
}

Write-Host "Smoke-Test erfolgreich."

