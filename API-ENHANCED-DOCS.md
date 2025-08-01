# API Kost Patemon v2.1.0 - Enhanced Features Documentation

## 🆕 NEW API ENDPOINTS

### 1. DELETE Reservation (Admin Only)
**Endpoint:** `DELETE /api/reservasi/:id`
**Auth:** Admin token required
**Description:** Delete reservation and automatically make room available

**Example:**
```bash
curl -X DELETE "https://kost-patemon-b2b29d8c205a.herokuapp.com/api/reservasi/123" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Reservation deleted successfully and room made available"
}
```

### 2. DELETE User Account (User)
**Endpoint:** `DELETE /api/users/me`
**Auth:** User token required
**Description:** Delete user's own account (blocks if active reservations exist)

**Example:**
```bash
curl -X DELETE "https://kost-patemon-b2b29d8c205a.herokuapp.com/api/users/me" \
  -H "Authorization: Bearer USER_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

**Error (if active reservations):**
```json
{
  "success": false,
  "message": "Cannot delete account. You have active reservations. Please contact admin to resolve your reservations first."
}
```

### 3. Enhanced Update Reservation Status
**Endpoint:** `PUT /api/reservasi/:id/status`
**Auth:** Admin token required
**Description:** Update reservation status with automatic room availability management

**New Status Options:**
- `"Menunggu"` - Waiting for approval
- `"Diterima"` - Accepted
- `"Ditolak"` - Rejected  
- `"Keluar"` - **NEW** - Check out (automatically makes room available)

**Example:**
```bash
curl -X PUT "https://kost-patemon-b2b29d8c205a.herokuapp.com/api/reservasi/123/status" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "Keluar"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Reservation status updated successfully",
  "data": {
    "success": true,
    "message": "Reservation status updated"
  }
}
```

### 4. Review System API

#### 4.1 GET All Reviews (Public)
**Endpoint:** `GET /api/ulasan`
**Auth:** None required

**Response:**
```json
{
  "success": true,
  "message": "Ulasan berhasil diambil",
  "data": [
    {
      "email": "user@example.com",
      "userName": "John Doe",
      "userPhoto": "profile.jpg",
      "rating": 5,
      "reviewText": "Kost sangat bagus!",
      "noKamar": 1,
      "date": "2025-08-01",
      "formattedDate": "1 Agustus 2025"
    }
  ]
}
```

#### 4.2 GET User's Own Reviews (User)
**Endpoint:** `GET /api/ulasan/my-reviews`
**Auth:** User token required

#### 4.3 POST Create Review (User)
**Endpoint:** `POST /api/ulasan`
**Auth:** User token required
**Body:**
```json
{
  "rating": 5,
  "ulasan": "Kost sangat nyaman dan pelayanan memuaskan!"
}
```

#### 4.4 PUT Update Review (User)
**Endpoint:** `PUT /api/ulasan`
**Auth:** User token required

#### 4.5 DELETE Review (User)
**Endpoint:** `DELETE /api/ulasan`
**Auth:** User token required

#### 4.6 GET Review Statistics (Public)
**Endpoint:** `GET /api/ulasan/stats`
**Response:**
```json
{
  "success": true,
  "message": "Statistik ulasan berhasil diambil",
  "data": {
    "totalReviews": 15,
    "averageRating": 4.2,
    "ratingDistribution": {
      "1": 0,
      "2": 1,
      "3": 2,
      "4": 7,
      "5": 5
    }
  }
}
```

## 🔧 KEY FEATURES

### Auto Room Availability Management
- When reservation status is updated to `"Keluar"`, room automatically becomes available
- When reservation is deleted, room automatically becomes available
- Prevents manual room status management errors

### Safe Account Deletion
- Users can delete their own accounts via `/api/users/me`
- System checks for active reservations before allowing deletion
- Prevents data inconsistency issues

### Complete Review System
- Users can submit reviews with 1-5 star ratings
- Rich review display with user information
- Review statistics for analytics
- One review per user policy (prevents spam)

## 🌐 Production URLs

**Base API:** `https://kost-patemon-b2b29d8c205a.herokuapp.com/api`

**Frontend Pages:**
- Home: `https://kost-patemon-b2b29d8c205a.herokuapp.com/home`
- Login: `https://kost-patemon-b2b29d8c205a.herokuapp.com/login`
- Account: `https://kost-patemon-b2b29d8c205a.herokuapp.com/akun`
- Admin: `https://kost-patemon-b2b29d8c205a.herokuapp.com/admin`

## 🔐 Authentication

All protected endpoints require Bearer token:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

Admin endpoints require admin role in token payload.

## 📊 Database Changes

### New Table: `ulasan`
```sql
CREATE TABLE ulasan (
  No_Kamar int(10) NOT NULL,
  Email varchar(100) NOT NULL,
  Tanggal date NOT NULL DEFAULT (curdate()),
  Rating int(1) NOT NULL CHECK (Rating between 1 and 5),
  Ulasan varchar(1000) NOT NULL,
  PRIMARY KEY (Email)
);
```

## 🚀 Deployment Version

**Current Version:** v15 (Heroku)
**API Version:** 2.1.0
**Last Updated:** August 1, 2025

## ✅ Testing

All endpoints have been tested and are production-ready:
- ✅ DELETE reservation functionality
- ✅ DELETE user account with validation
- ✅ Enhanced status update with room management
- ✅ Complete review system (CRUD operations)
- ✅ Frontend integration for reviews
- ✅ Production database table creation
