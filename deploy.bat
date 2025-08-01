@echo off
echo 🚀 Deploying Kost Mewah Patemon...

REM Check if git is initialized
if not exist ".git" (
    echo ❌ Git repository not found. Initializing...
    git init
    git remote add origin https://github.com/DzakaAl/Kost-Mewah-Patemon.git
)

REM Add all files
echo 📁 Adding files to git...
git add .

REM Commit changes
echo 💾 Committing changes...
git commit -m "Deploy: %date% %time%"

REM Push to GitHub
echo 📤 Pushing to GitHub...
git push origin main

echo ✅ Deployment preparation complete!
echo.
echo 🔗 Next steps:
echo 1. Go to https://dashboard.heroku.com/new-app
echo 2. Create app named 'kost-mewah-patemon'
echo 3. Connect GitHub repository
echo 4. Deploy from main branch
echo.
echo 🌐 Your app will be available at:
echo https://kost-mewah-patemon.herokuapp.com

pause
