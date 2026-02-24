# Hướng dẫn Backend (Spring Boot) - Quản lý Project và Link tới Account

Tài liệu này hướng dẫn cách cấu trúc backend Spring Boot để hỗ trợ tính năng quản lý **Project** độc lập và liên kết thêm **Account** vào một Project cụ thể thông qua trường `projectId`.

## 1. Database & Định nghĩa Entity (JPA/Hibernate)

Chúng ta có quan hệ **One-to-Many (1-N)**: Một `Project` có thể có nhiều `Account`.

### 1.1. Project Entity
Tạo Entity đại diện cho bảng Project.

```java
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "count")
    private Integer count = 0; // Số lượng account thuộc project này

    @Column(name = "last_updated")
    private LocalDate lastUpdated;

    // Quan hệ 1-Nhiều với Account
    // orphanRemoval = true có nghĩa là nếu xóa project thì toàn bộ account bên trong cũng bị xóa
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Account> accounts = new ArrayList<>();

    // ... Tạo Getters and Setters ...
}
```

### 1.2. Account Entity
Cập nhật Account Entity bằng cách thêm liên kết @ManyToOne tới Project Entity để tạo Foreign Key.

```java
import jakarta.persistence.*;

@Entity
@Table(name = "accounts")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String url;
    
    @Column(name = "platform_icon")
    private String platformIcon;

    // Có thể dùng chuỗi JSON hoặc một bảng khác cho tags và loginDetails
    @Column(columnDefinition = "json")
    private String tags; 

    @Column(name = "login_details", columnDefinition = "json")
    private String loginDetails;

    // Liên kết Foreign Key tới Project
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    // ... Tạo Getters and Setters ...
}
```

## 2. DTOs (Data Transfer Objects)

Định nghĩa các Payload dựa trên Request từ frontend gửi lên (Frontend đang gửi các field như: `name`, `projectId`, `url`, `platformIcon`...).

### 2.1. Project DTO
```java
public class ProjectRequestDTO {
    private String name;
    // Getters and Setters
}

public class ProjectResponseDTO {
    private Long id;
    private String name;
    private Integer count;
    private LocalDate lastUpdated;
    // Getters and Setters
}
```

### 2.2. Account DTO
**Quan trọng:** Yêu cầu bắt buộc phải có `projectId` từ frontend gửi lên.

```java
import java.util.List;

public class AccountRequestDTO {
    private Long projectId; // <--- Cần thiết để link với Project
    private String name;
    private String url;
    private String platformIcon;
    private List<String> tags;
    private Object loginDetails; 
    // Getters and Setters
}
```

## 3. Repositories

Khai báo lớp kết nối thẳng xuống DB. Spring Data JPA cung cấp sẵn phần lớn các Query này.

```java
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
}

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    // Để có thể tìm tất cả account thuộc một Project cụ thể
    List<Account> findByProjectId(Long projectId);
}
```

## 4. Service Layer Logic

Khi tạo một `Account` mới, backend cần tìm `Project` từ database dựa vào `projectId` và gán vào entity con trước khi lưu.

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;

@Service
public class AccountService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Transactional
    public Account createAccount(AccountRequestDTO request) {
        // 1. Kiểm tra Project có tồn tại không dưới DB dựa vào ID front-end gửi lên
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + request.getProjectId()));

        // 2. Tạo đối tượng Entity Account
        Account account = new Account();
        account.setProject(project); // <--- Liên kết Account tới Project ở bước này
        account.setName(request.getName());
        account.setUrl(request.getUrl());
        account.setPlatformIcon(request.getPlatformIcon());
        // account.setTags(...);
        // account.setLoginDetails(...);

        // 3. (Optional) Cập nhật số lượng account (count) trong project nếu bạn lưu cố định count
        // *Hoặc có thể bỏ qua bước này nếu gọi SQL đếm động count() khi query Danh sách Project
        project.setCount(project.getCount() + 1);
        project.setLastUpdated(LocalDate.now());
        projectRepository.save(project);

        // 4. Lưu lại account vào DB
        return accountRepository.save(account);
    }
}
```

## 5. Controller (REST Endpoints)

Các API Endpoints khớp với Front-end `Resource` (`/projects` và `/account/list`).

### 5.1. Project Controller
```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<ProjectResponseDTO>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @PostMapping
    public ResponseEntity<ProjectResponseDTO> createProject(@RequestBody ProjectRequestDTO request) {
        return ResponseEntity.ok(projectService.createProject(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponseDTO> updateProject(@PathVariable Long id, @RequestBody ProjectRequestDTO request) {
        return ResponseEntity.ok(projectService.updateProject(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }
}
```

### 5.2. Account Controller
```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/account/list") 
public class AccountController {

    @Autowired
    private AccountService accountService;

    @GetMapping
    public ResponseEntity<List<AccountResponseDTO>> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    @PostMapping
    public ResponseEntity<AccountResponseDTO> createAccount(@RequestBody AccountRequestDTO request) {
        return ResponseEntity.ok(accountService.createAccount(request));
    }
    
    // update, delete endpoints...
}
```
