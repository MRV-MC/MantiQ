$ErrorActionPreference = "SilentlyContinue"

$here = Split-Path -Parent $MyInvocation.MyCommand.Path

# Stop existing node processes related to this project
Get-Process node -ErrorAction SilentlyContinue | ForEach-Object {
  if ($_.Path -and ($_.Path -like "*node*")) {
    $_ | Stop-Process -Force
  }
}

# Start server in a new console window
Start-Process powershell -WorkingDirectory $here -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "cd `"$here`"; npm start"
