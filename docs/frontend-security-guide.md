---
description: Frontend Security Guide
---

# Hướng dẫn Triển khai Security & Lỗi (Exception) cho Frontend

Tài liệu này mô tả chi tiết cách tổ chức code ở Frontend để giao tiếp an toàn với Backend của hệ thống Account Management, đặc biệt tập trung vào việc quản lý **JWT Token** và xử lý **Exception/Error Code**.

---

## 1. Quản lý Mật khẩu & Token (Storage)

Sau khi gọi API `/api/auth/login` thành công, Backend sẽ trả về thông tin `AuthenticationResponse` chứa Token. Ở Frontend, chúng ta cần lưu trữ các thông tin này an toàn.

- **Access Token:** Lưu vào `localStorage` (dễ dùng nhất cho SPA) hoặc `sessionStorage` / `Cookies`.
- **Thông tin User (nếu có):** Có thể parse `JWT` (dùng thư viện như `jwt-decode`) hoặc gọi API lấy profile để lưu vào Global State (Redux, Vuex, Pinia, NgRx, Context API).

**Khuyến nghị: Tạo một service/util `TokenService`**
```typescript
// src/services/token.service.ts
const TOKEN_KEY = 'access_token';

export const TokenService = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  saveToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  
  // Kiểm tra cơ bản bằng cách parse phần thân jwt, tránh gọi API tốn tài nguyên
  isTokenValid: (): boolean => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return false;
      // parse và kiểm tra exp...
      return true; 
  }
};
```

---

## 2. Cấu hình HTTP Client (Axios Interceptors)

Đây là **TRÁI TIM** của phần nhận diện lỗi và bảo mật. Thay vì tự gọi `fetch` hay `axios` rời rạc ở mỗi component, hãy tạo một instance Axios chung.

### 2.1. Request Interceptor (Gắn Token tự động)
Trước khi request bay lên Backend, Frontend tự động lấy Token ở LocalStorage nhét vào Header.

### 2.2. Response Interceptor (Bắt Exception toàn cục)
Dựa theo backend đang trả về cấu trúc chung là `ApiResponse`:
```json
{
  "code": 1008,
  "message": "Incorrect password",
  "data": null
}
```
Và HTTP Status Code (`400`, `401`, `403`, `500`...)

```typescript
// src/config/axiosClient.ts
import axios from 'axios';
import { TokenService } from '../services/token.service';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// INTERCEPTOR CHO REQUEST
axiosClient.interceptors.request.use(
  (config) => {
    const token = TokenService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Thêm "Bearer " giống Backend yêu cầu
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// INTERCEPTOR CHO RESPONSE (XỬ LÝ LỖI TOÀN CỤC)
axiosClient.interceptors.response.use(
  (response) => {
    // Backend SpringBoot của bạn trả về HTTP 200/201 cho thành công
    return response.data; // Trả thẳng data, lược bỏ wrapper nếu cần
  },
  (error) => {
    // error.response chứa HTTP Status (401, 403, 400...)
    // error.response.data chứa ApiResponse { code, message }
    
    if (error.response) {
      const { status, data } = error.response;
      const apiCode = data?.code; // Mã ErrorCode Backend trả về (1001 -> 1008)
      const apiMessage = data?.message;

      // Xử lý chung các HTTP Status
      switch (status) {
        case 401: // UNAUTHENTICATED
          // 401 nghĩa là: Chưa đăng nhập, token hết hạn, token bị sai, hoặc không truyền token
          TokenService.removeToken(); 
          // Hiển thị thông báo (Toast/SweetAlert): "Phiên đăng nhập hết hạn"
          // Redirect về trang /login:
          window.location.href = '/login';
          break;

        case 403: // FORBIDDEN
          // 403 nghĩa là: Đã đăng nhập nhưng không có quyền thực hiện hành động này
          // Chuyển hướng về trang 403 Forbidden hoặc thông báo lỗi
          break;

        case 400: // BAD REQUEST (Dữ liệu sai, sai password, tài khoản trùng...)
          // Dựa theo apiCode để hiển thị chi tiết:
          if (apiCode === 1008) {
             // WRONG_PASSWORD
             // alert('Sai mật khẩu!');
          } else if (apiCode === 1002) {
             // USER_EXISTED
          }
          break;

        case 500: // INTERNAL SERVER ERROR
          // Lỗi từ server (UNCATEGORIZED_EXCEPTION)
          // alert('Lỗi hệ thống, vui lòng thử lại sau');
          break;
      }

      // Trả lỗi về lại cho Component (nếu Component muốn tự xử lý tiếp)
      return Promise.reject(data || error);
    }

    // Lỗi Network (Server tắt, rớt mạng...)
    return Promise.reject(error);
  }
);

export default axiosClient;
```

---

## 3. Bảng Error Code (Từ Backend Map xuống)

Frontend cần định nghĩa một file hằng số (constants) để tra cứu mã lỗi `code` từ backend. Dựa theo `ErrorCode.java` hiện tại:

| Enum Backend | Code | Ý nghĩa / Ngữ cảnh | Hành động Frontend nên làm |
| :--- | :--- | :--- | :--- |
| `UNCATEGORIZED_EXCEPTION` | 9999 | Lỗi server chưa phân loại | Hiện thông báo chung "Lỗi hệ thống" (Toast/Alert) |
| `INVALID_KEY` | 1001 | Tham số/Key truyền không hợp lệ | Đánh đỏ Form, báo lỗi tham số |
| `USER_EXISTED` | 1002 | Đăng ký trùng email/username | Hiện text đỏ "Tài khoản đã tồn tại" ở ô Email |
| `USERNAME_INVALID` | 1003 | Username nhập vào sai chuẩn | Hiện validation text (< 3 ký tự) |
| `INVALID_PASSWORD` | 1004 | Password nhập vào sai chuẩn | Hiện validation text (< 8 ký tự) |
| `USER_NOT_EXISTED` | 1005 | Đăng nhập tài khoản chưa đăng ký| Hiện "Tài khoản không tồn tại" ở form Login |
| `AUTHENTICATED` | 1006 | Thành công bảo mật (Status 200) | |
| `UNAUTHENTICATED` | 1007 | Lỗi xác thực (Status 401) | Xóa token, đẩy ra màn hình `/login` ngay lập tức |
| `WRONG_PASSWORD` | 1008 | Sai mật khẩu lúc HTTP 400 | Báo "Sai mật khẩu" (có thể thêm logic đếm sai 5 lần khóa luôn) |

---

## 4. Bảo vệ Pages/Routes (Route Guards)

Dù API đã chặn nhưng Frontend cũng không được cho người dùng thấy các UI Private nếu chưa có Token.

### Trong Angular (Ví dụ: `auth.guard.ts`):
```typescript
canActivate(): boolean {
  if (this.tokenService.isTokenValid()) {
    return true; // Cho qua
  }
  // Chưa login, đá ra trang login
  this.router.navigate(['/login']);
  return false;
}
```

### Trong Vue/Vue Router (Ví dụ: `router/index.ts`):
```typescript
router.beforeEach((to, from, next) => {
  const isAuthRequired = to.meta.requiresAuth;
  const loggedIn = !!TokenService.getToken();

  if (isAuthRequired && !loggedIn) {
    next('/login');
  } else {
    next();
  }
});
```

### Trong React (Ví dụ: Component wrapper `ProtectedRoute.jsx`):
```jsx
const ProtectedRoute = ({ children }) => {
  const token = TokenService.getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};
```

---

## 5. Tổng kết luồng chuẩn (Login Flow)

1. **User gõ User/Pass** -> submit đến `/api/auth/login`.
2. **Backend trả về OK (Token)** -> Lưu Token, redirect vô `/dashboard`.
3. **Backend trả về Error 400 `code: 1008`** -> Ở giao diện login hiện dòng chữ đỏ: "Incorrect password" (Lấy từ Error Message Backend).
4. **Vào Dashboard, Frontend gọi`/api/profile/me`**:
   - Gắn Token trước khi bay đi.
   - Trả về 200: Hiện thông tin lên góc phải Header.
   - Trảm về 401 (Do để máy tính qua đêm, Token hết ngày): Tự động bị `Response Interceptor` túm được, xoá token chết, đá thẳng ra `/login?session_expired=true`.
