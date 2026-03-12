# TaskMaster API

Backend API for **TaskMaster**.  
This API handles authentication, user management, company submissions, image uploads, and admin dashboards.

---

# Base URL

```
{{base_url}}
```

Example:

```
http://localhost:5000
```

---

# Authentication

Most endpoints require authentication.

Include the session/token returned during login.

Example header:

```
Authorization: Bearer <token>
```

---

# API Modules

The API currently contains two main modules:

- Authentication
- Users

---

# Authentication Endpoints

## Admin Registration

Register a new admin account.  
An OTP verification email will be sent.

**Endpoint**

```
POST /api/auth/register/admin
```

### Request Body

```json
{
  "fullName": "Admin",
  "email": "shopmate400@gmail.com",
  "password": "Shopmate400+",
  "location_data": {
    "city": "Lagos",
    "region": "Lagos State",
    "country": "Nigeria"
  }
}
```

Note: `location_data` is optional.

### Success Response

```json
{
  "message": "Admin registered successfully. Please verify your email with the OTP sent.",
  "adminId": "cmmn9jnm00005n23wdb8f4cbr",
  "email": "shopmate400@gmail.com",
  "expiresIn": "30 minutes"
}
```

---

## User Registration

Register a new user account.

**Endpoint**

```
POST /api/auth/register/user
```

### Request Body

```json
{
  "fullName": "Tunji Akande",
  "email": "akandetunji2@gmail.com",
  "password": "Akande95+",
  "location_data": {
    "city": "Lagos",
    "region": "Lagos State",
    "country": "Nigeria"
  }
}
```

Note: `location_data` is optional.

### Success Response

```json
{
  "message": "User registered successfully. Please verify your email with the OTP sent.",
  "userId": "cmmn9exe40002n23wsfuewi42",
  "email": "akandetunji2@gmail.com",
  "expiresIn": "30 minutes"
}
```

---

## Login

Authenticate a user or admin.

**Endpoint**

```
POST /api/auth/login
```

### Request Body

```json
{
  "email": "akandetunji2@gmail.com",
  "password": "Akande95+"
}
```

### Success Response (User)

```json
{
  "message": "Login successful",
  "user": {
    "id": "cmmn9exe40002n23wsfuewi42",
    "email": "akandetunji2@gmail.com",
    "fullName": "Tunji Akande",
    "role": "USER"
  },
  "sessionId": "cmmn9h0z20004n23wvj3cgi6x",
  "token": "sess_token_here",
  "accountType": "user",
  "hasCompanyData": false
}
```

---

## Logout

Logs out the authenticated user.

**Endpoint**

```
POST /api/auth/logout
```

### Response

```json
{
  "message": "Logged out successfully"
}
```

---

## Verify OTP

Verify email with OTP.

**Endpoint**

```
POST /api/auth/verify-otp
```

### Request

```json
{
  "email": "akandetunji2@gmail.com",
  "otp": "258826"
}
```

### Response

```json
{
  "message": "Email verified successfully",
  "verified": true
}
```

---

## Resend OTP

Resend email verification OTP.

**Endpoint**

```
POST /api/auth/resend-otp
```

---

## Forgot Password

Send password reset instructions.

**Endpoint**

```
POST /api/auth/forgot-password
```

---

## Reset Password

Reset password using email reset link.

**Endpoint**

```
POST /api/auth/reset-password
```

### Request

```json
{
  "oobCode": "reset_code_here",
  "newPassword": "NewPassword123+"
}
```

---

# User Endpoints

All endpoints below require authentication.

---

# Admin Endpoints

Admin-only routes.

---

## Upload Image to User

Upload an image to a specific user.

**Endpoint**

```
POST /api/users/admin/upload-to-user/:userId
```

### Request

`multipart/form-data`

| Key | Type |
|----|----|
| image | File |

### Response

```json
{
  "message": "Image uploaded successfully to user",
  "image": {
    "id": "image_id",
    "url": "cloudinary_url",
    "filename": "file_name",
    "uploadedAt": "timestamp"
  }
}
```

---

## Fetch User Dashboard

Retrieve the user's recent activity.

**Endpoint**

```
GET /api/users/admin/user-dashboard/:userId
```

### Response

Returns:

- user details
- most recent submission
- recent uploaded image

---

## Fetch All Users

Retrieve paginated users.

**Endpoint**

```
GET /api/users/admin/users
```

### Query Parameters

| Parameter | Description |
|--------|-------------|
| search | search by name or email |
| role | USER or ADMIN |
| sortBy | field to sort |
| sortOrder | asc or desc |
| page | page number |
| limit | results per page |

Example:

```
GET /api/users/admin/users?search=tunji&page=1&limit=10
```

---

## Fetch User by ID

Retrieve details of a specific user.

**Endpoint**

```
GET /api/users/admin/users/:userId
```

---

## Fetch Users Stats

Retrieve statistics about users.

**Endpoint**

```
GET /api/users/admin/users/stats
```

Example Response:

```json
{
  "total": {
    "users": 1,
    "admins": 1,
    "all": 2
  }
}
```

---

# User Endpoints

Accessible to authenticated users.

---

## Submit Company Data

Submit company statistics.

**Endpoint**

```
POST /api/users/company-data
```

### Request Body

```json
{
  "companyName": "Tech Solutions Ltd",
  "numberOfUsers": 50,
  "numberOfProducts": 150
}
```

### Percentage Calculation

The percentage is calculated automatically using:

```
(numberOfProducts / numberOfUsers) * 100
```

### Response

```json
{
  "message": "Company data created successfully",
  "data": {
    "companyName": "Tech Solutions Ltd",
    "numberOfUsers": 50,
    "numberOfProducts": 150,
    "percentage": 300
  }
}
```

---

# Tech Stack

Backend technologies used:

- Node.js
- NestJS
- PostgreSQL
- Prisma ORM
- Firebase Auth
- Cloudinary
- JWT / Session Authentication

---

# Running the Project

Install dependencies

```
npm install
```

Run development server

```
npm run start:dev
```

---

# Author

**Tunji Akande**

---