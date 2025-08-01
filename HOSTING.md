# 🏠 Kost Mewah Patemon - Hosting Guide

Aplikasi manajemen kost dengan Node.js, Express, dan MySQL.

## 🚀 Cara Deploy ke Heroku

### Prerequisites
1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Account Heroku (gratis)
3. Git repository sudah di GitHub

### Quick Deploy (Otomatis)
```bash
# Jalankan script auto-deploy
heroku-deploy.bat
```

### Manual Deploy Steps

#### 1. Login ke Heroku
```bash
heroku login
```

#### 2. Buat App Heroku
```bash
# Ganti "your-app-name" dengan nama unik
heroku create kost-mewah-patemon-your-name
```

#### 3. Tambah Database MySQL (Gratis)
```bash
heroku addons:create jawsdb:kitefin
```

#### 4. Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-key
```

#### 5. Deploy
```bash
git push heroku main
```

#### 6. Setup Database
```bash
heroku run npm run setup-heroku
```

## 🔗 Akses Aplikasi

Setelah deploy berhasil:
- **Frontend**: https://your-app-name.herokuapp.com
- **API**: https://your-app-name.herokuapp.com/api

## 🗄️ Database Connection

### Cek Info Database
```bash
heroku config:get JAWSDB_URL
```

### Connect Manual ke Database
```bash
# Install MySQL client
mysql -h [hostname] -u [username] -p[password] [database_name]
```

## 📊 Monitoring

### View Logs
```bash
heroku logs --tail
```

### Restart App
```bash
heroku restart
```

### Open Dashboard
```bash
heroku dashboard
```

## 🛠️ Environment Variables

Di Heroku Dashboard → Settings → Config Vars, set:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `JWT_SECRET` | `your-secret-key` | JWT signing key |
| `JAWSDB_URL` | `auto-set` | Database connection (auto) |

## 📱 Admin Login

Default admin account:
- **Username**: `admin`
- **Email**: `admin@kostpatemon.com`
- **Password**: `password` (ubah setelah login)

## 🔧 Troubleshooting

### App Crashed (H10 Error)
```bash
# Check logs
heroku logs --tail

# Restart app
heroku restart
```

### Database Connection Error
```bash
# Verify database addon
heroku addons

# Check database URL
heroku config:get JAWSDB_URL

# Reinstall database
heroku addons:destroy jawsdb
heroku addons:create jawsdb:kitefin
```

### Port Issues
App otomatis menggunakan `process.env.PORT` yang disediakan Heroku.

## 💰 Pricing

- **Heroku**: Free tier (550 hours/month)
- **JawsDB**: Free tier (5MB storage)
- **Upgrade**: Hobby tier $7/month untuk 24/7 uptime

## 🔄 Auto Deploy dari GitHub

1. Go to Heroku Dashboard
2. Select your app
3. Go to Deploy tab
4. Connect to GitHub
5. Enable "Automatic deploys"

Setiap push ke GitHub akan otomatis deploy!

## 📞 Support

Jika ada masalah:
1. Check logs: `heroku logs --tail`
2. Restart app: `heroku restart`
3. Review config: `heroku config`

---

**Happy hosting! 🎉**
