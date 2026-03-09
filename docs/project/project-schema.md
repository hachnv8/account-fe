# Project Entity Schema

This document outlines the fields that the `Project` entity contains. 
The backend must ensure these fields are mapped correctly in the Entity layer (e.g., `Project.java`), as well as in `ProjectRequestDTO` and `ProjectResponseDTO` so that the frontend can correctly display and update all project details.

## Fields

| Field Name    | Data Type    | Description                                                                 |
|---------------|--------------|-----------------------------------------------------------------------------|
| `id`          | `Long`       | Primary key, auto-generated.                                                |
| `name`        | `String`     | The name of the project. (Required)                                         |
| `description` | `String`     | A detailed text description of what the project is about.                   |
| `techStack`   | `List<String>`| A list of technologies and frameworks used in the project.                 |
| `status`      | `String`     | Project status. Allowed values typically: active, completed, paused, archived.|
| `category`    | `String`     | Category/Type of the project (e.g., Frontend, Backend, Fullstack, Mobile App, etc.). |
| `repoUrl`     | `String`     | Link to the source code repository (e.g., GitHub, GitLab).                  |
| `prodUrl`     | `String`     | Link to the production or staging environment where the app is deployed.    |
| `count`       | `Integer`    | An integer track count, defaulting to 0.                                    |
| `lastUpdated` | `LocalDate`  | A date tracking the last time this project was updated.                     |

## Example JSON Representation

```json
{
  "id": 1,
  "name": "Account Management System",
  "description": "A centralized system for managing user accounts and related projects.",
  "techStack": ["Angular", "Spring Boot", "MySQL", "TailwindCSS"],
  "status": "active",
  "category": "Fullstack",
  "repoUrl": "https://github.com/hacheery/account-management",
  "prodUrl": "https://account-management.example.com",
  "count": 5,
  "lastUpdated": "2026-03-05"
}
```
