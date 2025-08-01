# 🚀 Panduan Hosting Kost Mewah Patemon

## 📋 Daftar Isi
1. [Persiapan](#persiapan)
2. [Hosting Gratis](#hosting-gratis)
3. [Hosting Berbayar](#hosting-berbayar)
4. [Database Hosting](#database-hosting)
5. [Domain Custom](#domain-custom)

## 🔧 Persiapan

### 1. Update Environment Variables
Buat file `.env.production` untuk production:

```env
NODE_ENV=production
PORT=3000
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=kost_patemon
JWT_SECRET=your-super-secret-jwt-key-here
```

### 2. Update Server.js untuk Production
Pastikan server.js sudah siap untuk production dengan port yang dinamis.

## 🆓 Hosting Gratis

### 1. **Heroku (Recommended)**

#### Step 1: Install Heroku CLI
```bash
# Download dari https://devcenter.heroku.com/articles/heroku-cli
```

#### Step 2: Login dan Create App
```bash
heroku login
heroku create kost-mewah-patemon
```

#### Step 3: Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key
heroku config:set DB_HOST=your-db-host
heroku config:set DB_USER=your-db-user
heroku config:set DB_PASSWORD=your-db-password
heroku config:set DB_NAME=kost_patemon
```

#### Step 4: Deploy
```bash
git add .
git commit -m "Prepare for Heroku deployment"
git push heroku main
```

### 2. **Railway**

#### Step 1: Connect GitHub
1. Kunjungi [railway.app](https://railway.app)
2. Login dengan GitHub
3. Pilih repository `Kost-Mewah-Patemon`

#### Step 2: Set Environment Variables
Tambahkan environment variables di Railway dashboard:
- `NODE_ENV=production`
- `JWT_SECRET=your-secret-key`
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

### 3. **Render**

#### Step 1: Connect Repository
1. Kunjungi [render.com](https://render.com)
2. Connect GitHub repository
3. Pilih "Web Service"

#### Step 2: Configuration
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment**: Node.js

### 4. **Vercel (Frontend Only)**

```bash
# Deploy frontend
vercel --prod
```

## 💰 Hosting Berbayar

### 1. **DigitalOcean App Platform**
- Auto-scaling
- $5/month
- Integrated database

### 2. **AWS Elastic Beanstalk**
- Scalable hosting
- Pay-as-you-use
- Professional grade

### 3. **Google Cloud Run**
- Serverless container
- Auto-scaling
- Pay-per-request

## 🗄️ Database Hosting

### 1. **Free Database Options**

#### **PlanetScale (MySQL)**
```bash
# Install PlanetScale CLI
npm install -g @planetscale/cli

# Connect to your database
pscale auth login
pscale database create kost-patemon
```

#### **Supabase (PostgreSQL)**
1. Kunjungi [supabase.com](https://supabase.com)
2. Create new project
3. Import database schema

#### **Railway MySQL**
```bash
# Railway provides free MySQL database
railway add mysql
```

### 2. **Paid Database Options**

#### **AWS RDS**
- Managed MySQL/PostgreSQL
- $20+/month
- High availability

#### **Google Cloud SQL**
- Managed databases
- $7+/month
- Auto-backup

## 🌐 Domain Custom

### 1. **Beli Domain**
- Namecheap (~$10/year)
- GoDaddy (~$15/year)
- Cloudflare (~$8/year)

### 2. **Setup DNS**
```
Type: CNAME
Name: @
Value: your-app.herokuapp.com
```

### 3. **SSL Certificate**
Sebagian besar hosting provider memberikan SSL gratis.

## 📝 Langkah Deploy Cepat (Heroku)

```bash
# 1. Install Heroku CLI
# 2. Login
heroku login

# 3. Create app
heroku create kost-mewah-patemon

# 4. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-key

# 5. Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# 6. Open app
heroku open
```

## 🔍 Testing Production

### 1. Health Check
```bash
curl https://your-app.herokuapp.com/api/health
```

### 2. API Testing
```bash
curl https://your-app.herokuapp.com/api/kamar
```

## 📱 Mobile-Friendly URLs

Setelah deploy, aplikasi Anda akan tersedia di:
- `https://kost-mewah-patemon.herokuapp.com`
- `https://kost-mewah-patemon.railway.app`
- `https://kost-mewah-patemon.onrender.com`

## 🚨 Troubleshooting

### Common Issues:

1. **Port Error**
   - Pastikan menggunakan `process.env.PORT`

2. **Database Connection**
   - Periksa environment variables
   - Pastikan database accessible dari internet

3. **Static Files**
   - Pastikan path relatif untuk CSS/JS/Images

4. **CORS Issues**
   - Update CORS configuration untuk production domain

## 📞 Support

Jika ada masalah deployment, check:
1. Heroku logs: `heroku logs --tail`
2. Railway logs: Dashboard → Logs
3. Render logs: Dashboard → Logs

---

**Selamat! Aplikasi Kost Mewah Patemon Anda sekarang sudah online! 🎉**
