$ErrorActionPreference = "Stop"

Write-Host "Installing dependencies for VODSCRIBE webhook server..." -ForegroundColor Green

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "Using npm version: $npmVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error: npm is not installed. Please install Node.js and npm first." -ForegroundColor Red
    exit 1
}

# Install required dependencies
Write-Host "Installing server dependencies..." -ForegroundColor Cyan
npm install express cors body-parser crypto dotenv concurrently node-fetch

# Installing development dependencies
Write-Host "Installing development dependencies..." -ForegroundColor Cyan
npm install --save-dev nodemon

# Check if .env file exists, create from example if not
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "Created .env file from .env.example" -ForegroundColor Yellow
        Write-Host "Please edit .env file with your actual configuration values" -ForegroundColor Yellow
    } else {
        Write-Host "Warning: .env.example file not found. Please create a .env file manually." -ForegroundColor Yellow
    }
}

Write-Host "`nSetup complete!" -ForegroundColor Green
Write-Host "You can start the webhook server with: npm run dev:server" -ForegroundColor Cyan
Write-Host "To test webhooks, run: npm run test:webhooks" -ForegroundColor Cyan
