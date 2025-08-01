# Deploy Enhanced API to Heroku
Write-Host "🚀 Deploying Kost Patemon Enhanced API to Heroku..." -ForegroundColor Cyan

# Check if we're in a git repository
if (!(Test-Path ".git")) {
    Write-Host "❌ Not in a git repository. Please run from project root." -ForegroundColor Red
    exit 1
}

# Add all changes
Write-Host "📦 Adding changes to git..." -ForegroundColor Yellow
git add .

# Commit changes
$commitMessage = "Enhanced API v2.1.0: Added delete reservation, delete account, improved status update with room availability management"
Write-Host "💾 Committing changes: $commitMessage" -ForegroundColor Yellow
git commit -m $commitMessage

# Push to Heroku
Write-Host "🚀 Deploying to Heroku..." -ForegroundColor Green
git push heroku main

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 API available at: https://kost-patemon-b2b29d8c205a.herokuapp.com/api" -ForegroundColor Cyan

# Display new features
Write-Host "`n🆕 NEW FEATURES DEPLOYED:" -ForegroundColor Magenta
Write-Host "• DELETE /api/reservasi/:id - Delete reservation (Admin)" -ForegroundColor White
Write-Host "• DELETE /api/users/me - Delete user account (User)" -ForegroundColor White  
Write-Host "• PUT /api/reservasi/:id/status - Enhanced status update with Keluar support" -ForegroundColor White
Write-Host "• Auto-update room availability when reservation status = Keluar" -ForegroundColor White
Write-Host "• Full review system API (GET/POST/PUT/DELETE /api/ulasan)" -ForegroundColor White
Write-Host "• Safe account deletion with active reservation check" -ForegroundColor White
