# Hướng dẫn Implement AccountService — Backend (Spring Boot)

> Tài liệu dành cho AI hoặc lập trình viên để triển khai **đầy đủ CRUD** cho module **Account Manager**.
> Module này quản lý danh sách tài khoản dịch vụ (Facebook Ads, Google Analytics, SSH, DB,...).
> **KHÔNG liên quan đến bảo mật, JWT, hay mã hóa.** Data gửi/nhận plain text bình thường.

---

## 1. Thông tin chung

| Key | Value |
|-----|-------|
| Base URL | `http://localhost:8080/api` |
| Package gốc | `com.hacheery.accountbe` |
| Frontend port | `http://localhost:4200` |
| Database | MySQL |
| Framework | Spring Boot + JPA + Lombok |

---

## 2. Entity đã có sẵn (KHÔNG cần tạo mới)

### `BaseEntity` — `com.hacheery.accountbe.entity.BaseEntity`

```java
@Getter @Setter
@MappedSuperclass
public abstract class BaseEntity {
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by", updatable = false, length = 100)
    private String createdBy;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
```

### `Account` — `com.hacheery.accountbe.entity.Account`

```java
@Entity
@Table(name = "accounts")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@SuperBuilder
public class Account extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(name = "platform_icon", nullable = false, length = 100)
    private String platformIcon;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = JsonListConverter.class)
    private List<String> tags;

    @Column(name = "login_details", columnDefinition = "TEXT")
    @Convert(converter = JsonMapConverter.class)
    private Map<String, Object> loginDetails;

    @Column(name = "last_updated")
    private LocalDate lastUpdated;
}
```

> **Lưu ý:** `JsonListConverter` và `JsonMapConverter` đã tồn tại trong package `com.hacheery.accountbe.converter`.

---

## 3. Interface đã có sẵn (KHÔNG cần tạo mới)

### `AccountService` — `com.hacheery.accountbe.service.AccountService`

```java
public interface AccountService {
    List<Account> getAllAccounts();
    Optional<Account> getAccountById(Long id);
    Account createAccount(Account account);
    Account updateAccount(Long id, Account account);
    void deleteAccount(Long id);
}
```

---

## 4. Cần implement — Danh sách file

| # | File | Package | Hành động |
|---|------|---------|-----------|
| 1 | `AccountRepository.java` | `com.hacheery.accountbe.repository` | **TẠO MỚI** |
| 2 | `AccountServiceImpl.java` | `com.hacheery.accountbe.service.impl` | **TẠO MỚI** |
| 3 | `AccountController.java` | `com.hacheery.accountbe.controller` | **TẠO MỚI** |

---

## 5. Chi tiết Implement

### 5.1 `AccountRepository.java` — [TẠO MỚI]

```java
package com.hacheery.accountbe.repository;

import com.hacheery.accountbe.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    // JpaRepository cung cấp sẵn: findAll(), findById(), save(), deleteById(), existsById()
    // Không cần thêm method nào khác
}
```

---

### 5.2 `AccountServiceImpl.java` — [TẠO MỚI]

```java
package com.hacheery.accountbe.service.impl;

import com.hacheery.accountbe.entity.Account;
import com.hacheery.accountbe.repository.AccountRepository;
import com.hacheery.accountbe.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;

    @Override
    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    @Override
    public Optional<Account> getAccountById(Long id) {
        return accountRepository.findById(id);
    }

    @Override
    public Account createAccount(Account account) {
        account.setLastUpdated(LocalDate.now());
        return accountRepository.save(account);
    }

    @Override
    public Account updateAccount(Long id, Account account) {
        Account existing = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + id));

        existing.setName(account.getName());
        existing.setUrl(account.getUrl());
        existing.setPlatformIcon(account.getPlatformIcon());
        existing.setTags(account.getTags());
        existing.setLoginDetails(account.getLoginDetails());
        existing.setLastUpdated(LocalDate.now());

        return accountRepository.save(existing);
    }

    @Override
    public void deleteAccount(Long id) {
        if (!accountRepository.existsById(id)) {
            throw new RuntimeException("Account not found with id: " + id);
        }
        accountRepository.deleteById(id);
    }
}
```

---

### 5.3 `AccountController.java` — [TẠO MỚI]

> **Quan trọng:** Các endpoint phải khớp chính xác với frontend đang gọi.

```java
package com.hacheery.accountbe.controller;

import com.hacheery.accountbe.entity.Account;
import com.hacheery.accountbe.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/account")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    /**
     * GET /api/account/list
     * Trả về mảng trực tiếp (không wrap trong object).
     */
    @GetMapping("/list")
    public ResponseEntity<List<Account>> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    /**
     * GET /api/account/list/{id}
     */
    @GetMapping("/list/{id}")
    public ResponseEntity<Account> getAccountById(@PathVariable Long id) {
        return accountService.getAccountById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/account/list
     * Frontend gửi object, backend trả về object kèm id đã generate.
     */
    @PostMapping("/list")
    public ResponseEntity<Account> createAccount(@RequestBody Account account) {
        return ResponseEntity.ok(accountService.createAccount(account));
    }

    /**
     * PUT /api/account/list/{id}
     * Frontend gửi object cập nhật, backend trả về object đã update.
     */
    @PutMapping("/list/{id}")
    public ResponseEntity<Account> updateAccount(@PathVariable Long id, @RequestBody Account account) {
        return ResponseEntity.ok(accountService.updateAccount(id, account));
    }

    /**
     * DELETE /api/account/list/{id}
     * Trả về JSON message.
     */
    @DeleteMapping("/list/{id}")
    public ResponseEntity<Map<String, String>> deleteAccount(@PathVariable Long id) {
        accountService.deleteAccount(id);
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }
}
```

---

## 6. JSON Format — Frontend gửi/nhận

### 6.1 GET `/api/account/list` — Response

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

> **Response là mảng trực tiếp `[]`**, KHÔNG wrap trong object `{ data: [...] }`.

### 6.2 POST `/api/account/list` — Request Body

```json
{
  "name": "Facebook Ads Manager",
  "url": "business.facebook.com",
  "platformIcon": "bx bxl-facebook-square",
  "tags": ["Social", "Marketing"],
  "lastUpdated": "2024-11-20",
  "loginDetails": {
    "username": "admin@facebook.com",
    "password": "ExamplePassword123!",
    "notes": "Main ads account"
  }
}
```

> Response: Trả về object đã tạo **kèm `id`** do server generate.

### 6.3 PUT `/api/account/list/{id}` — Request Body

Tương tự POST. Response trả về object đã cập nhật.

### 6.4 DELETE `/api/account/list/{id}` — Response

```json
{
  "message": "Account deleted successfully"
}
```

---

## 7. Lưu ý quan trọng

### 7.1 JSON Naming Convention
- Frontend dùng **camelCase**: `platformIcon`, `lastUpdated`, `loginDetails`
- Database dùng **snake_case**: `platform_icon`, `last_updated`, `login_details`
- Backend Entity đã dùng `@Column(name = "...")` để map → **Jackson mặc định sẽ serialize camelCase**
- **KHÔNG dùng** `spring.jackson.property-naming-strategy=SNAKE_CASE`

### 7.2 `loginDetails` — Flexible JSON
- `loginDetails` có schema **không cố định**, tuỳ loại account sẽ có key khác nhau
- Ví dụ: SSH có thêm `sshKey`, DB có `port`, GitHub có `token`, AWS có `accountId`
- Backend lưu nguyên dạng JSON text, dùng `Map<String, Object>` + `JsonMapConverter`
- **KHÔNG cần encrypt, KHÔNG cần mã hóa** — lưu và trả về plain text

### 7.3 `tags` — JSON Array
- `tags` lưu dạng JSON array of strings: `["Social", "Marketing"]`
- Backend dùng `List<String>` + `JsonListConverter`
- Frontend gửi tags dưới dạng mảng string

### 7.4 CORS
- Frontend chạy ở `localhost:4200`
- Backend cần cho phép CORS, dùng `@CrossOrigin(origins = "*")` trên Controller
- Hoặc config global CORS trong `WebMvcConfigurer`

### 7.5 `lastUpdated` Format
- Frontend hiển thị format `YYYY-MM-DD` (VD: `2024-10-15`)
- Backend dùng `LocalDate` — Jackson sẽ tự serialize thành `YYYY-MM-DD` mặc định

### 7.6 `BaseEntity` fields
- `createdAt`, `updatedAt` được tự động set bởi `@PrePersist` / `@PreUpdate`
- `createdBy`, `updatedBy` hiện có thể để null (chưa có auth context)
- Frontend **KHÔNG gửi** và **KHÔNG cần nhận** các field `createdAt`, `updatedAt`, `createdBy`, `updatedBy`

---

## 8. Cấu trúc thư mục Backend

```
src/main/java/com/hacheery/accountbe/
├── AccountbeApplication.java
├── controller/
│   └── AccountController.java           ← TẠO MỚI
├── converter/
│   ├── JsonListConverter.java           ← ĐÃ CÓ
│   └── JsonMapConverter.java            ← ĐÃ CÓ
├── entity/
│   ├── BaseEntity.java                  ← ĐÃ CÓ
│   └── Account.java                     ← ĐÃ CÓ
├── repository/
│   └── AccountRepository.java           ← TẠO MỚI
└── service/
    ├── AccountService.java              ← ĐÃ CÓ (interface)
    └── impl/
        └── AccountServiceImpl.java      ← TẠO MỚI
```

---

## 9. Checklist triển khai

- [ ] Tạo `AccountRepository.java` — extends `JpaRepository<Account, Long>`
- [ ] Tạo `AccountServiceImpl.java` — implement `AccountService` interface
- [ ] Tạo `AccountController.java` — REST endpoints CRUD
- [ ] Đảm bảo CORS cho phép `localhost:4200`
- [ ] Kiểm tra Jackson serialize camelCase (mặc định, KHÔNG config SNAKE_CASE)
- [ ] Test: GET `/api/account/list` trả về mảng `[]`
- [ ] Test: POST `/api/account/list` trả về object kèm `id`
- [ ] Test: PUT `/api/account/list/{id}` trả về object đã update
- [ ] Test: DELETE `/api/account/list/{id}` trả về `{ "message": "..." }`

---

## 10. Sample Data để test (INSERT SQL)

```sql
INSERT INTO accounts (name, url, platform_icon, tags, login_details, last_updated, created_at, updated_at)
VALUES
('Facebook Ads Manager', 'business.facebook.com', 'bx bxl-facebook-square',
 '["Social","Marketing"]',
 '{"username":"admin@facebook.com","password":"ExamplePassword123!","notes":"Main ads account"}',
 '2024-10-15', NOW(), NOW()),

('Google Analytics', 'analytics.google.com', 'bx bxl-google',
 '["Analytics","Report"]',
 '{"username":"analyst@gmail.com","password":"SecureKeyForGoogle!","notes":"Read-only access"}',
 '2024-10-18', NOW(), NOW()),

('Putty SSH (Dev)', '10.101.20.2', 'bx bxs-terminal',
 '["Server","Dev"]',
 '{"username":"ubuntu","password":"DevServerPassword#2024","sshKey":"ssh-rsa AAAAB3NzaC1yc2E..."}',
 '2024-10-20', NOW(), NOW()),

('Oracle DB (Prod)', '192.168.1.100', 'bx bxs-data',
 '["Database","Prod"]',
 '{"username":"db_admin","password":"ProdDatabasePassword$$$","port":"1521"}',
 '2024-11-01', NOW(), NOW()),

('YouTube Channel', 'studio.youtube.com', 'bx bxl-youtube',
 '["Social","Media"]',
 '{"username":"creator@youtube.com","password":"YouTubeStrongPassword*","notes":"Channel ID: UC_12345"}',
 '2024-11-05', NOW(), NOW());
```
