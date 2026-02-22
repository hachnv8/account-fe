# Backend API Specification — Account List

> Tài liệu mô tả API backend cần thiết cho module **Account List** trên frontend.
> Base URL: `http://localhost:8080/api`

---

## 1. Database Entity: `Account`

| Column          | Type           | Constraints                | Mô tả                                       |
|-----------------|----------------|----------------------------|----------------------------------------------|
| `id`            | `BIGINT`       | PK, Auto Increment         | ID duy nhất                                  |
| `name`          | `VARCHAR(255)` | NOT NULL                   | Tên tài khoản (VD: Facebook Ads Manager)     |
| `url`           | `VARCHAR(500)` | NOT NULL                   | URL hoặc IP (VD: `business.facebook.com`)    |
| `platform_icon` | `VARCHAR(100)` | NOT NULL                   | CSS class icon (VD: `bx bxl-facebook-square`)|
| `tags`          | `JSON / TEXT`  |                            | Mảng tags, lưu dạng JSON `["Social","Marketing"]` |
| `login_details` | `JSON / TEXT`  |                            | Thông tin đăng nhập, lưu dạng JSON (xem mục 2) |
| `last_updated`  | `DATETIME`     | Default: `CURRENT_TIMESTAMP` | Thời gian cập nhật gần nhất                |
| `created_at`    | `DATETIME`     | Default: `CURRENT_TIMESTAMP` | Thời gian tạo                              |

> **Lưu ý bảo mật:** Trường `login_details` chứa thông tin nhạy cảm (password, token,...). Nên **mã hóa** (encrypt) trước khi lưu vào DB và giải mã khi trả về cho frontend.

---

## 2. Cấu trúc `loginDetails` (JSON)

```json
{
  "username": "admin@facebook.com",
  "password": "ExamplePassword123!",
  "notes": "Main ads account"
}
```

Các key có thể thay đổi tùy loại tài khoản (thêm `sshKey`, `token`, `port`, `accountId`,...). Backend nên lưu nguyên dạng JSON linh hoạt, không cần cố định schema.

---

## 3. Danh sách Platform Icon hỗ trợ

Frontend sử dụng BoxIcons. Danh sách giá trị hợp lệ cho `platformIcon`:

| Platform     | Giá trị `platformIcon`       |
|-------------|------------------------------|
| Facebook    | `bx bxl-facebook-square`     |
| Google      | `bx bxl-google`              |
| SSH/Terminal| `bx bxs-terminal`            |
| Database    | `bx bxs-data`                |
| YouTube     | `bx bxl-youtube`             |
| GitHub      | `bx bxl-github`              |
| AWS         | `bx bxl-aws`                 |
| WordPress   | `bx bxl-wordpress`           |
| DigitalOcean| `bx bxl-digitalocean`        |
| Slack       | `bx bxl-slack`               |
| Other       | `bx bx-globe`                |

---

## 4. API Endpoints

### 4.1 Lấy danh sách tài khoản

```
GET /api/account/list
```

**Response** `200 OK`:
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

> **Ghi chú:** Frontend hiện nhận mảng trực tiếp (không wrap trong object). Nếu muốn thêm pagination phía server, có thể đổi response thành `{ data: [...], total: 10 }` và update frontend tương ứng.

---

### 4.2 Thêm tài khoản mới

```
POST /api/account/list
```

**Request Body**:
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

**Validation rules:**
| Field          | Rule                    |
|----------------|-------------------------|
| `name`         | Bắt buộc, không rỗng   |
| `url`          | Bắt buộc, không rỗng   |
| `platformIcon` | Bắt buộc, không rỗng   |
| `tags`         | Tùy chọn, mảng string  |
| `loginDetails` | Tùy chọn, object JSON  |

**Response** `200 OK` — Trả về object đã tạo (kèm `id` do server generate):
```json
{
  "id": 11,
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

**Response** `400 Bad Request` — Khi thiếu field bắt buộc:
```json
{
  "error": "Validation failed",
  "message": "Name is required"
}
```

---

### 4.3 Cập nhật tài khoản (chưa implement trên FE, chuẩn bị sẵn)

```
PUT /api/account/list/{id}
```

**Request Body**: Giống POST, kèm `id` trên URL.

**Response** `200 OK`: Trả về object đã cập nhật.

---

### 4.4 Xóa tài khoản (chưa implement trên FE, chuẩn bị sẵn)

```
DELETE /api/account/list/{id}
```

**Response** `200 OK`:
```json
{
  "message": "Account deleted successfully"
}
```

---

## 5. Mapping Frontend ↔ Backend

| Frontend field   | JSON key       | DB column        | Ghi chú                          |
|-----------------|----------------|------------------|-----------------------------------|
| `data.id`       | `id`           | `id`             | Server generate                   |
| `data.name`     | `name`         | `name`           |                                   |
| `data.url`      | `url`          | `url`            |                                   |
| `data.platformIcon` | `platformIcon` | `platform_icon` | camelCase ↔ snake_case            |
| `data.tags`     | `tags`         | `tags`           | JSON array of strings             |
| `data.lastUpdated` | `lastUpdated` | `last_updated`  | Format: `YYYY-MM-DD`             |
| `data.loginDetails` | `loginDetails` | `login_details` | JSON object, flexible schema     |

> **Quan trọng:** Backend nên config **Jackson** (Spring Boot) để tự động map `snake_case` ↔ `camelCase`, hoặc dùng `@JsonProperty` annotation.

---

## 6. Gợi ý triển khai Spring Boot

### Entity

```java
@Entity
@Table(name = "accounts")
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(name = "platform_icon", nullable = false, length = 100)
    private String platformIcon;

    @Column(columnDefinition = "JSON")
    private String tags; // Serialize/Deserialize as List<String>

    @Column(name = "login_details", columnDefinition = "JSON")
    private String loginDetails; // Serialize/Deserialize as Map<String, Object>

    @Column(name = "last_updated")
    private LocalDate lastUpdated;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

### Controller

```java
@RestController
@RequestMapping("/api/account")
public class AccountController {

    @GetMapping("/list")
    public ResponseEntity<List<AccountDTO>> getAccounts() { ... }

    @PostMapping("/list")
    public ResponseEntity<AccountDTO> createAccount(@RequestBody AccountDTO dto) { ... }

    @PutMapping("/list/{id}")
    public ResponseEntity<AccountDTO> updateAccount(@PathVariable Long id, @RequestBody AccountDTO dto) { ... }

    @DeleteMapping("/list/{id}")
    public ResponseEntity<?> deleteAccount(@PathVariable Long id) { ... }
}
```
