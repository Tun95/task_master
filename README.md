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
LOCAL: http://localhost:5000
DEMO: http://203.161.49.37
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

| Key   | Type |
| ----- | ---- |
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

| Parameter | Description             |
| --------- | ----------------------- |
| search    | search by name or email |
| role      | USER or ADMIN           |
| sortBy    | field to sort           |
| sortOrder | asc or desc             |
| page      | page number             |
| limit     | results per page        |

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

## User Profile

Retrieve the **authenticated user's profile information**, including:

- account details
- submitted company data
- images uploaded by admins
- total image count

> 🔒 **Authentication Required**

**Endpoint**

```
GET /api/users/profile
```

### Success Response (200)

```json
{
  "id": "cmmncaqi30001xj3w7i6kkwox",
  "email": "akandetunji2@gmail.com",
  "firebaseUid": "YO2TrOAIIuWwyvCmtYjSuwgQeUn1",
  "fullName": "Tunji Akande",
  "role": "USER",
  "isEmailVerified": true,
  "createdAt": "2026-03-12T10:43:19.851Z",
  "updatedAt": "2026-03-12T10:43:55.290Z",
  "companyData": [
    {
      "id": "cmmo527pa000ayl3wt793t9du",
      "companyName": "Starlab",
      "numberOfUsers": 23,
      "numberOfProducts": 45,
      "percentage": 195.65,
      "userId": "cmmncaqi30001xj3w7i6kkwox",
      "createdAt": "2026-03-13T00:08:31.102Z",
      "updatedAt": "2026-03-13T00:08:31.102Z"
    }
  ],
  "receivedImages": [
    {
      "id": "cmmo358iz0004yl3w3pfyne86",
      "filename": "taskmaster/user-images/cmmncaqi30001xj3w7i6kkwox-1773357289581",
      "originalName": "VPC-eu-north-1-03-06-2026_04_03_PM.png",
      "path": "https://res.cloudinary.com/dstj5eqcd/image/upload/v1773357292/taskmaster/user-images/cmmncaqi30001xj3w7i6kkwox-1773357289581.png",
      "mimetype": "image/png",
      "size": 181982,
      "uploadedById": "cmmn9jnm00005n23wdb8f4cbr",
      "userId": "cmmncaqi30001xj3w7i6kkwox",
      "createdAt": "2026-03-12T23:14:52.906Z",
      "uploadedBy": {
        "id": "cmmn9jnm00005n23wdb8f4cbr",
        "fullName": "Admin",
        "email": "shopmate400@gmail.com"
      }
    },
    {
      "id": "cmmo32cms0003yl3w0gm282g8",
      "filename": "taskmaster/user-images/cmmncaqi30001xj3w7i6kkwox-1773357153064",
      "originalName": "Route-53-dashboard-Route-53-Global-03-06-2026_04_00_PM.png",
      "path": "https://res.cloudinary.com/dstj5eqcd/image/upload/v1773357157/taskmaster/user-images/cmmncaqi30001xj3w7i6kkwox-1773357153064.png",
      "mimetype": "image/png",
      "size": 263012,
      "uploadedById": "cmmn9jnm00005n23wdb8f4cbr",
      "userId": "cmmncaqi30001xj3w7i6kkwox",
      "createdAt": "2026-03-12T23:12:38.260Z",
      "uploadedBy": {
        "id": "cmmn9jnm00005n23wdb8f4cbr",
        "fullName": "Admin",
        "email": "shopmate400@gmail.com"
      }
    }
  ],
  "imageCount": 4
}
```

### Response Fields

| Field          | Description                                 |
| -------------- | ------------------------------------------- |
| id             | Unique user identifier                      |
| email          | User email address                          |
| fullName       | User full name                              |
| role           | Account role (`USER` or `ADMIN`)            |
| companyData    | List of company submissions by the user     |
| receivedImages | Images uploaded by admins for the user      |
| imageCount     | Total number of images uploaded to the user |

---

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

Follow the steps below to run the project locally.

---

## 1. Clone the Repository

```bash
git clone https://github.com/Tun95/task_master.git
```

---

## 2. Navigate into the Project

```bash
cd task_master
```

---

## 3. Install Dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

Open a new terminal or go back to the root folder:

```bash
cd frontend
npm install
```

---

## 4. Start the Development Servers

### Run Backend

Inside the **backend** folder:

```bash
npm run dev:start
```

or

```bash
npm run dev
```

---

### Run Frontend

Inside the **frontend** folder:

```bash
npm run dev
```

---

## Development URLs

Backend API:

```
LOCAL: http://localhost:5000
OR
DEMO: http://203.161.49.37:5005
```

Frontend App:

```
LOCAL: http://localhost:3000
OR
DEMO: http://203.161.49.37
```

```
USER A:
EMAIL: akandetunji2@gmail.com
PASS: Akande95+
```
```
USER B:
EMAIL: shopmate400@gmail.com
PASS: Shopmate400+
```

---

## Notes

- Ensure Node.js **v18+** is installed.
- Environment variables must be configured before running the server.
- The backend must be running before the frontend can communicate with the API.

---

# Author

**Tunji Akande**

---
