# Laravel 12 Backend Setup Guide

## Project Structure

```
backend/
├── app/
│   ├── Console/
│   │   └── Kernel.php
│   ├── Events/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AgentDashboardController.php
│   │   │   ├── InquiryController.php
│   │   │   ├── PropertyController.php
│   │   │   └── Auth/
│   │   │       ├── LoginController.php
│   │   │       ├── PasswordResetController.php
│   │   │       ├── RegisteredUserController.php
│   │   │       └── SocialiteController.php
│   │   ├── Kernel.php
│   │   ├── Middleware/
│   │   │   ├── CheckRole.php
│   │   │   ├── EncryptCookies.php
│   │   │   ├── HandleCors.php
│   │   │   ├── PreventRequestsDuringMaintenance.php
│   │   │   ├── RedirectIfAuthenticated.php
│   │   │   ├── TrustProxies.php
│   │   │   └── VerifyCsrfToken.php
│   ├── Listeners/
│   │   ├── SendPasswordResetNotification.php
│   │   └── UpdateLastLogin.php
│   ├── Models/
│   │   ├── Inquiry.php
│   │   ├── Property.php
│   │   ├── PropertyImage.php
│   │   ├── Role.php
│   │   └── User.php
│   ├── Providers/
│   │   ├── AppServiceProvider.php
│   │   ├── BroadcastServiceProvider.php
│   │   ├── EventServiceProvider.php
│   │   └── RouteServiceProvider.php
├── bootstrap/
│   └── app.php
├── config/
│   ├── app.php
│   ├── auth.php
│   ├── cache.php
│   ├── database.php
│   ├── logging.php
│   ├── queue.php
│   ├── sanctum.php
│   ├── services.php
│   └── session.php
├── database/
│   ├── factories/
│   │   └── PropertyFactory.php
│   ├── migrations/
│   │   └── 20260907000001_create_tables_and_postgis.php
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── PropertySeeder.php
│       ├── RoleSeeder.php
│       └── UserSeeder.php
├── routes/
│   ├── api.php
│   ├── channels.php
│   ├── console.php
│   └── web.php
├── .env
└── composer.json
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
composer install
```

### 2. Generate Application Key
```bash
php artisan key:generate
```

### 3. Set Up PostgreSQL Database
Create a PostgreSQL database with PostGIS extension:
```sql
CREATE DATABASE amdern_properties;
CREATE USER amdern WITH PASSWORD 'amdern_password';
GRANT ALL PRIVILEGES ON DATABASE amdern_properties TO amdern;
```

### 4. Run Migrations
```bash
php artisan migrate
```

### 5. Seed Database
```bash
php artisan db:seed
```

### 6. Start Development Server
```bash
php artisan serve
```

## API Endpoints

### Authentication
- `POST /api/v1/register` - Register new user
- `POST /api/v1/login` - Login user
- `POST /api/v1/logout` - Logout user
- `GET /api/v1/auth/google/redirect` - Google OAuth redirect
- `GET /api/v1/auth/google/callback` - Google OAuth callback
- `POST /api/v1/forgot-password` - Send password reset link
- `POST /api/v1/reset-password` - Reset password

### Properties
- `GET /api/v1/properties` - List properties (with filters)
- `POST /api/v1/properties` - Create property (auth required)
- `GET /api/v1/properties/{id}` - Get property details
- `PUT /api/v1/properties/{id}` - Update property (auth required)
- `DELETE /api/v1/properties/{id}` - Delete property (auth required)

### Inquiries
- `POST /api/v1/inquiries` - Submit inquiry
- `GET /api/v1/inquiries` - List inquiries (auth required)
- `PATCH /api/v1/inquiries/{id}` - Update inquiry status (auth required)

### Agent Dashboard (Protected)
- `GET /api/v1/agent/dashboard` - Dashboard stats
- `GET /api/v1/agent/properties` - Agent's properties
- `GET /api/v1/agent/inquiries` - Agent's inquiries

## Key Features

1. **PostGIS Spatial Queries**: Properties can be searched by radius using `ST_DWithin`
2. **Multi-Role Authentication**: Property Seeker, Property Owner, Estate Agent, Property Developer, Admin
3. **Google OAuth**: Seamless login with Google
4. **Password Reset**: 15-minute tokenized reset links
5. **Sanctum API Tokens**: Stateful authentication for SPA
6. **Role-Based Access Control**: Middleware protects agent dashboard
7. **JSONB Amenities**: Flexible amenities storage
8. **GIST Spatial Index**: Fast distance queries

## Database Schema

### Users Table
- id, name, email, password, phone, user_type, google_id, avatar, role_id, is_active

### Roles Table
- Property Seeker, Property Owner, Estate Agent, Property Developer, Admin

### Properties Table
- id, user_id, title, slug, description, price, currency, listing_type, property_type, bedrooms, bathrooms, is_verified, status, address, city, district, amenities, location (PostGIS geography), timestamps

### Property Images Table
- id, property_id, image_url, is_primary, sort_order

### Inquiries Table
- id, property_id, seeker_id, sender_name, sender_email, sender_phone, message, status

## Usage Example

### Search Properties Within 10km of Kampala
```bash
curl -X GET "http://localhost:8000/api/v1/properties?lat=0.3136&lng=32.5835&radius=10"
```

### Create Property (Authenticated)
```bash
curl -X POST "http://localhost:8000/api/v1/properties" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Property",
    "price": 500000000,
    "currency": "UGX",
    "listing_type": "for_sale",
    "property_type": "house",
    "latitude": 0.3136,
    "longitude": 32.5835
  }'
```