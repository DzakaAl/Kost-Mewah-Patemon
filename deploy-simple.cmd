echo "Deploying Enhanced API to Heroku..."

echo "Adding changes to git..."
git add .

echo "Committing changes..."
git commit -m "Enhanced API v2.1.0: Added delete reservation, delete account, improved status update with room availability management"

echo "Deploying to Heroku..."
git push heroku main

echo "Deployment complete!"
echo "API available at: https://kost-patemon-b2b29d8c205a.herokuapp.com/api"

echo ""
echo "NEW FEATURES DEPLOYED:"
echo "- DELETE /api/reservasi/:id - Delete reservation (Admin)"
echo "- DELETE /api/users/me - Delete user account (User)"
echo "- PUT /api/reservasi/:id/status - Enhanced status update with Keluar support"
echo "- Auto-update room availability when reservation status = Keluar"
echo "- Full review system API (GET/POST/PUT/DELETE /api/ulasan)"
echo "- Safe account deletion with active reservation check"
