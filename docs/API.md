# DocShare Pro - API Documentation

## Overview

This document provides a comprehensive specification for the DocShare Pro backend API. It is derived from a full analysis of the frontend codebase, detailing all endpoints, request/response structures, and data models required to support the application.

## Base URL

```
https://api.docshare.pro/v1
```

## Authentication

The API uses JWT (JSON Web Token) authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are returned on login/register and must be included in all subsequent requests.

---

## Table of Contents

1. [Health Check](#health-check)
2. [Authentication](#authentication)
3. [Files](#files)
4. [Dashboard](#dashboard)
5. [Users](#users)
6. [Subscriptions](#subscriptions)
7. [Data Models](#data-models)
8. [Error Handling](#error-handling)

---

## 1. Health Check

### `GET /health`

Check API health status.

**Response:** `200 OK`

```json
{
  "status": "healthy",
  "timestamp": "2024-06-30T12:00:00Z",
  "version": "2.1.0"
}
```

---

## 2. Authentication

### 2.1 Register

`POST /auth/register`

Register a new user account.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| fullName | string | Yes | User's full name (2-50 chars, letters/spaces/hyphens/apostrophes only) |
| email | string | Yes | Valid email address |
| password | string | Yes | Min 8 chars, must include uppercase, lowercase, number, and special character |
| confirmPassword | string | Yes | Must match password |
| terms | boolean | Yes | Must be true (acceptance of Terms of Service) |

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "1",
    "fullName": "John Doe",
    "email": "john@example.com",
    "avatar": "https://ui-avatars.com/api/?name=John+Doe&background=random&size=128",
    "plan": "free",
    "subscriptionStatus": "active",
    "createdAt": "2024-01-15",
    "token": "mock_jwt_abc123..."
  },
  "message": "Registration successful. Please check your email to confirm your account."
}
```

### 2.2 Login

`POST /auth/login`

Authenticate an existing user.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Valid email address |
| password | string | Yes | Min 8 characters |
| rememberMe | boolean | No | Keep user logged in longer |

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "1",
    "fullName": "John Doe",
    "email": "john@example.com",
    "avatar": "https://ui-avatars.com/api/?name=John+Doe&background=2563eb&color=fff",
    "bio": "Product designer...",
    "plan": "pro",
    "subscriptionStatus": "active",
    "createdAt": "2024-01-15",
    "notifications": {
      "emailNotifications": true,
      "uploadSuccess": true,
      "shareNotifications": true,
      "monthlyReports": false
    },
    "apiKey": "sk_live_...",
    "token": "mock_jwt_abc123..."
  },
  "message": "Login successful"
}
```

### 2.3 Forgot Password

`POST /auth/forgot-password`

Request a password reset email.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Valid email address |

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

### 2.4 Reset Password

`POST /auth/reset-password/:token`

Reset password using a valid reset token.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| password | string | Yes | Min 8 characters |

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Password has been reset successfully."
}
```

### 2.5 Confirm Email

`GET /auth/confirm-email/:token`

Confirm user email address using the token sent via email.

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Email confirmed successfully."
}
```

---

## 3. Files

### 3.1 Upload File

`POST /files/upload`

Upload a new file document.

**Headers:**

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer <token> | Yes |
| Content-Type | multipart/form-data | Yes |

**Form Data Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | The file to upload (max 50MB for free, 1GB for pro) |
| fileName | string | No | Custom display name for the file |
| fileSize | integer | No | File size in bytes |
| requirePassword | boolean | No | Whether to password protect the file |
| password | string | No | Password (min 6 chars) if requirePassword is true |
| generateQR | boolean | No | Generate QR code for the shareable link |
| setExpiry | boolean | No | Set an expiration date |
| expiresAt | string (ISO 8601) | No | Expiration date/time if setExpiry is true |
| notifyOnView | boolean | No | Notify uploader when file is viewed |

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "file_abc123xyz",
    "name": "Annual_Report_2024.pdf",
    "size": 2389200,
    "type": "application/pdf",
    "uploadDate": "2024-06-30T12:00:00Z",
    "views": 0,
    "status": "active",
    "shareableLink": "https://docshare.pro/view/file_abc123xyz",
    "expiresAt": null,
    "uploader": "John Doe",
    "requirePassword": false,
    "pages": 3,
    "qrCodeGenerated": true
  },
  "message": "File uploaded successfully"
}
```

**Accepted File Types:**
- PDF (.pdf)
- Images (.png, .jpg, .jpeg, .gif, .svg, .webp)
- Word (.doc, .docx)
- Excel (.xls, .xlsx)
- Text (.txt)
- JSON (.json)
- Video (.mp4, .avi, .mov, .wmv, .flv)
- Audio (.mp3, .wav, .aac, .flac)

### 3.2 List Files

`GET /files`

Retrieve a paginated list of files for the authenticated user.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 10 | Items per page |
| search | string | "" | Search by file name |
| filter | string | "all" | Filter by status (`all`, `active`, `expired`) |
| sort | string | "date-desc" | Sort field (`date-asc`, `date-desc`, `name-asc`, `name-desc`, `size-asc`, `size-desc`, `views-desc`, `views-asc`) |

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "file_abc123xyz",
        "name": "Annual_Report_2024.pdf",
        "size": 2389200,
        "type": "application/pdf",
        "uploadDate": "2024-06-30T12:00:00Z",
        "views": 42,
        "status": "active",
        "shareableLink": "https://docshare.pro/view/file_abc123xyz",
        "expiresAt": null,
        "uploader": "John Doe",
        "requirePassword": false,
        "pages": 3
      }
    ],
    "total": 25,
    "page": 1,
    "totalPages": 3,
    "totalItems": 25,
    "totalSize": 52428800,
    "totalViews": 1250,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "message": "Files retrieved successfully"
}
```

### 3.3 Get File Details

`GET /files/:id`

Retrieve details for a single file.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The file ID |

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "file_abc123xyz",
    "name": "GES-2026-KOFI.pdf",
    "size": 238920,
    "type": "application/pdf",
    "pages": 3,
    "uploadDate": "2024-06-30T12:00:00Z",
    "views": 42,
    "status": "active",
    "shareableLink": "https://docshare.pro/view/file_abc123xyz",
    "expiresAt": null,
    "uploader": "John Doe",
    "requirePassword": false,
    "fileData": "JVBERi0xLjQK...",
    "content": "JVBERi0xLjQK..."
  },
  "message": "File retrieved successfully"
}
```

**Notes:**
- `fileData` contains base64-encoded file content for protected files
- `requirePassword` indicates if the file is password-protected
- If `requirePassword` is true, the client should prompt for a password before displaying content

### 3.4 Verify Password

`POST /files/:id/verify-password`

Verify the password for a protected file and return its content.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The file ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| password | string | Yes | The password to verify |

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "fileData": "JVBERi0xLjQK..."
  },
  "message": "Password verified successfully"
}
```

**Error Response:** `401 Unauthorized`

```json
{
  "success": false,
  "message": "Incorrect password"
}
```

### 3.5 Delete File

`DELETE /files/:id`

Permanently delete a file.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The file ID |

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

## 4. Dashboard

### 4.1 Get Statistics

`GET /dashboard/stats`

Retrieve dashboard statistics for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "totalUploads": 25,
    "totalViews": 1250,
    "storageUsed": 0.5,
    "storageLimit": 10,
    "activeLinks": 23
  },
  "message": "Stats retrieved successfully"
}
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| totalUploads | integer | Total number of uploaded files |
| totalViews | integer | Total views across all files |
| storageUsed | float (GB) | Current storage usage in GB |
| storageLimit | integer | Storage limit in GB (varies by plan) |
| activeLinks | integer | Number of active (non-expired) files |

### 4.2 Get Recent Activity

`GET /dashboard/activity`

Retrieve recent file activity for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "file_abc123",
      "name": "Annual_Report_2024.pdf",
      "uploadDate": "2024-06-30T12:00:00Z",
      "uploadedDate": "2024-06-30T12:00:00Z",
      "description": "Uploaded a new file",
      "user": "John Doe",
      "type": "upload",
      "status": "success",
      "size": 2389200,
      "views": 42
    }
  ],
  "message": "Recent activity retrieved"
}
```

---

## 5. Users

### 5.1 Update Profile

`PUT /users/profile`

Update the authenticated user's profile information.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| fullName | string | No | Updated full name (2-50 chars) |
| email | string | No | Updated email address |
| bio | string | No | Short biography (max 500 chars) |
| avatar | File | No | Profile image file |

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "1",
    "fullName": "John Doe Updated",
    "email": "john@example.com",
    "avatar": "https://new-avatar-url.com/image.jpg",
    "bio": "Updated bio...",
    "plan": "pro",
    "subscriptionStatus": "active",
    "createdAt": "2024-01-15",
    "notifications": {
      "emailNotifications": true,
      "uploadSuccess": true,
      "shareNotifications": true,
      "monthlyReports": false
    },
    "apiKey": "sk_live_..."
  },
  "message": "Profile updated successfully"
}
```

### 5.2 Change Password

`POST /users/change-password`

Change the authenticated user's password.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| currentPassword | string | Yes | Current password |
| newPassword | string | Yes | Min 8 chars, uppercase, lowercase, number, special char |
| confirmPassword | string | Yes | Must match newPassword |

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### 5.3 Update Preferences

`PUT /users/preferences`

Update user notification and preference settings.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| emailNotifications | boolean | No | Receive email updates |
| uploadSuccess | boolean | No | Get notified on upload completion |
| shareNotifications | boolean | No | Get notified when documents are shared |
| monthlyReports | boolean | No | Receive monthly usage reports |
| viewNotifications | boolean | No | Get notified when documents are viewed |
| securityAlerts | boolean | No | Important security notifications |

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "1",
    "fullName": "John Doe",
    "email": "john@example.com",
    "plan": "pro",
    "subscriptionStatus": "active",
    "notifications": {
      "emailNotifications": true,
      "uploadSuccess": true,
      "shareNotifications": false,
      "monthlyReports": true,
      "viewNotifications": true,
      "securityAlerts": true
    }
  },
  "message": "Preferences updated successfully"
}
```

### 5.4 Get Notifications

`GET /users/notifications`

Retrieve the current user's notification settings.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "emailNotifications": true,
    "uploadSuccess": true,
    "shareNotifications": true,
    "monthlyReports": false,
    "viewNotifications": true,
    "securityAlerts": true
  },
  "message": "Notifications retrieved"
}
```

---

## 6. Subscriptions

### 6.1 Get Subscription Details

`GET /subscription`

Retrieve the current user's subscription details.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "plan": "pro",
    "status": "active",
    "startDate": "2024-01-15",
    "nextBillingDate": "2024-07-15T00:00:00Z",
    "cancelAtPeriodEnd": false,
    "usage": {
      "uploads": 25,
      "storage": 0.5,
      "teamMembers": 1
    }
  },
  "message": "Subscription details retrieved"
}
```

**Plan Definitions:**

| Plan | Price | Max Uploads | Storage | Max File Size | Team Members | Retention | Formats |
|------|-------|-------------|---------|---------------|--------------|-----------|---------|
| free | $0/mo | 2 | 100 MB | 10 MB | 1 | 7 days | PDF only |
| pro | $19/mo | Unlimited | 50 GB | 1 GB | 5 | 90 days | PDF, Images, DOC/DOCX, Excel, TXT, JSON |
| express | $49/mo | Unlimited | Unlimited | Unlimited | Unlimited | Forever | All formats |

### 6.2 Create / Update Subscription

`POST /subscription/create`

Create or upgrade/downgrade a subscription.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| planId | string | Yes | Target plan ID (`free`, `pro`, `express`) |
| cardDetails | object | Conditional | Required for paid plans |

**Card Details Object:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| number | string | Yes | Card number |
| expiry | string | Yes | Expiry date (MM/YY) |
| cvv | string | Yes | 3-4 digit CVV |
| name | string | Yes | Name on card |

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "1",
    "fullName": "John Doe",
    "email": "john@example.com",
    "plan": "pro",
    "subscriptionStatus": "active",
    "subscriptionStartDate": "2024-06-30T12:00:00Z"
  },
  "message": "Subscription created successfully"
}
```

### 6.3 Get Invoices

`GET /subscription/invoices`

Retrieve invoice history for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "INV-2024-001",
      "date": "2024-06-01",
      "amount": 19.00,
      "status": "paid",
      "plan": "Pro",
      "description": "Subscription - June 2024"
    }
  ],
  "message": "Invoices retrieved"
}
```

### 6.4 Cancel Subscription

`POST /subscription/cancel`

Cancel the current subscription (will remain active until end of billing period).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| cancelAtPeriodEnd | boolean | Yes | Set to true to cancel at period end |

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "plan": "pro",
    "status": "active",
    "cancelAtPeriodEnd": true,
    "nextBillingDate": "2024-07-15T00:00:00Z"
  },
  "message": "Subscription will cancel at the end of the billing period"
}
```

---

## 7. Data Models

### User Object

```typescript
interface User {
  id: string;
  fullName: string;
  email: string;
  avatar: string;
  bio?: string;
  plan: 'free' | 'pro' | 'express';
  subscriptionStatus: 'active' | 'trialing' | 'canceled' | 'past_due';
  createdAt: string; // ISO 8601
  subscriptionStartDate?: string; // ISO 8601
  apiKey?: string;
  notifications: {
    emailNotifications: boolean;
    uploadSuccess: boolean;
    shareNotifications: boolean;
    monthlyReports: boolean;
    viewNotifications?: boolean;
    securityAlerts?: boolean;
  };
}
```

### File Object

```typescript
interface File {
  id: string;
  name: string;
  size: number; // bytes
  type: string; // MIME type
  uploadDate: string; // ISO 8601
  views: number;
  status: 'active' | 'expired';
  shareableLink: string;
  expiresAt?: string | null; // ISO 8601
  uploader: string;
  requirePassword: boolean;
  password?: string | null;
  fileData?: string; // Base64 encoded content
  content?: string; // Base64 encoded content (text files)
  pages?: number | null; // For PDFs
  qrCodeGenerated?: boolean;
}
```

### Subscription Object

```typescript
interface Subscription {
  plan: 'free' | 'pro' | 'express';
  status: 'active' | 'trialing' | 'canceled' | 'past_due';
  startDate: string; // ISO 8601
  nextBillingDate?: string; // ISO 8601
  cancelAtPeriodEnd?: boolean;
  usage: {
    uploads: number;
    storage: number; // in GB
    teamMembers: number;
  };
}
```

### Invoice Object

```typescript
interface Invoice {
  id: string; // e.g., "INV-2024-001"
  date: string; // ISO 8601
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  plan: string;
  description?: string;
}
```

### Paginated Response

```typescript
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

### Standard API Response

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
}
```

---

## 8. Error Handling

All errors follow a consistent structure:

```json
{
  "success": false,
  "message": "Error description here",
  "errors": {
    "fieldName": ["Specific field error message"]
  }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation errors) |
| 401 | Unauthorized (missing or invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (e.g., email already exists) |
| 422 | Unprocessable Entity (validation failed) |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

---

## 9. Additional Notes

### File Upload Constraints

| Plan | Max File Size | Max Storage | Allowed Formats | Retention |
|------|--------------|-------------|-----------------|-----------|
| Free | 10 MB | 100 MB | PDF only | 7 days |
| Pro | 1 GB | 50 GB | PDF, Images, DOC/DOCX, Excel, TXT, JSON | 90 days |
| Express | Unlimited | Unlimited | All formats | Forever |

### Rate Limits

- Free: 50 requests/minute
- Pro: 100 requests/minute
- Express: 500 requests/minute

### Password Protection

Files can be optionally password-protected. When `requirePassword` is true:
1. Client must prompt user for password
2. Call `POST /files/:id/verify-password` with the password
3. If valid, server returns base64-encoded file content
4. Client can then render/download the file

### Webhooks (Recommended)

For real-time notifications, implement webhooks for the following events:

- `file.uploaded` - New file uploaded
- `file.viewed` - File was viewed/downloaded
- `file.deleted` - File was deleted
- `subscription.created` - New subscription
- `subscription.canceled` - Subscription canceled
- `payment.succeeded` - Payment processed
- `payment.failed` - Payment failed

---

## 10. Implementation Notes for Backend

Based on frontend analysis, the backend should implement:

1. **JWT Authentication** with refresh token support
2. **File Storage** with base64 encoding support or direct blob storage
3. **Database Schema** supporting:
   - Users (with subscription tier, notification preferences, API key)
   - Files (with password hashing, expiry dates, view tracking)
   - Subscriptions (plan management, billing dates, webhooks)
   - Invoices (billing history)
4. **Email Service** for:
   - Registration confirmation
   - Password reset links
   - Monthly reports
5. **Rate Limiting** per user tier
6. **CORS** configuration for frontend domain
7. **Input Validation** matching the frontend Zod schemas exactly
8. **Password Hashing** using bcrypt or equivalent
9. **Soft Deletes** recommended for files to support potential recovery
10. **Analytics Tracking** for file views, uploads, and user activity

---

*Last Updated: June 30, 2026*
