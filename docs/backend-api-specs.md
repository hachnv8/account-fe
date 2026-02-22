# Backend API Specification

> Tài liệu mô tả chi tiết các API backend cần thiết cho hệ thống "Account Management".
> Base URL: `http://localhost:8080/api`

---

## 1. Authentication (Xác thực)
Dựa trên `auth.service.ts`.

### 1.1 Đăng nhập
**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success - 200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "type": "Bearer",
  "id": 1,
  "username": "user",
  "email": "user@example.com",
  "roles": ["ROLE_USER"]
}
```

**Response (Error - 401 Unauthorized)**:
```json
{
  "error": "Unauthorized",
  "message": "Bad credentials"
}
```

### 1.2 Đăng ký
**Endpoint**: `POST /api/auth/register`

**Request Body**:
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123"
}
```

**Response (Success - 200 OK / 201 Created)**:
```json
{
  "message": "User registered successfully!"
}
```

### 1.3 Quên mật khẩu
**Endpoint**: `POST /api/auth/reset-password`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response (Success - 200 OK)**:
```json
{
  "message": "Reset password link sent to email."
}
```

---

## 2. User Management (Quản lý User)
Dựa trên `user.service.ts`.

### 2.1 Lấy danh sách Users
**Endpoint**: `GET /api/users`

**Headers**:
- `Authorization`: `Bearer <token>`

**Response (Success - 200 OK)**:
```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "System",
    "roles": ["ROLE_ADMIN"]
  }
]
```

---

## 3. Account List (Quản lý Tài khoản QC/Social)
Dựa trên `account.service.ts` và `backend-api-account-list.md`.

### 3.1 Lấy danh sách tài khoản
**Endpoint**: `GET /api/account/list`

**Response (Success - 200 OK)**:
```json
[
  {
    "id": 1,
    "platformIcon": "bx bxl-facebook-square",
    "name": "Facebook Ads Manager",
    "url": "business.facebook.com",
    "tags": ["Social", "Marketing"],
    "lastUpdated": "2024-10-15",
    "loginDetails": {
      "username": "admin@facebook.com",
      "password": "ExamplePassword123!",
      "notes": "Main ads account"
    }
  }
]
```
> **Lưu ý**: Field `loginDetails` chứa thông tin nhạy cảm (password, token...), nên được mã hóa từ phía Backend trước khi trả về.

### 3.2 Thêm tài khoản mới
**Endpoint**: `POST /api/account/list`

**Request Body**:
```json
{
  "name": "Facebook Ads Manager",
  "url": "business.facebook.com",
  "platformIcon": "bx bxl-facebook-square",
  "tags": ["Social", "Marketing"],
  "loginDetails": {
    "username": "admin@facebook.com",
    "password": "ExamplePassword123!",
    "notes": "Main ads account"
  }
}
```

**Validation**:
- `name`: Bắt buộc
- `url`: Bắt buộc
- `platformIcon`: Bắt buộc

**Response (Success - 200 OK)**: Trả về object đã tạo kèm ID.

### 3.3 Cập nhật tài khoản
**Endpoint**: `PUT /api/account/list/{id}`

**Request Body**: Tương tự POST.

**Response (Success - 200 OK)**: Trả về object đã cập nhật.

### 3.4 Xóa tài khoản
**Endpoint**: `DELETE /api/account/list/{id}`

**Response (Success - 200 OK)**:
```json
{
  "message": "Account deleted successfully"
}
```

---

## 4. Database Schema Recommendation

### Table: `users`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AI | |
| username | VARCHAR(50) | Unique | |
| email | VARCHAR(100) | Unique | |
| password | VARCHAR(255) | | BCrypt hash |
| roles | JSON/VARCHAR | | |

### Table: `accounts`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AI | |
| name | VARCHAR(255) | Not Null | |
| url | VARCHAR(500) | Not Null | |
| platform_icon | VARCHAR(100) | Not Null | |
| tags | JSON | | List of tags |
| login_details | JSON/TEXT | | **Encrypted** login info |
| created_at | DATETIME | | |
| last_updated | DATETIME | | |

