# Recruitment Task: URL Shortener

## Task Description
Create a URL shortening system with click statistics.

## Functional Requirements
- **Automatic user session generation without providing credentials**
- **Creating shortened links**
- **Link visibility: public / private**
- **Optional expiration time (1h / 1d / 1w)**
- **Optional custom alias** (if available)
- **List of own links**
- **List of all public links** (no authorization required)
- **Deleting links** (soft delete)
- **Click statistics** (counted asynchronously via RabbitMQ)
- **Rate limit:** max 10 links / minute / session

## API Endpoints
```
POST   /api/session                            - create session
GET    /api/session                            - get session
POST   /api/urls                               - create link
GET    /api/urls                               - list of own links
GET    /api/urls/{id}/stats                    - click statistics
DELETE /api/urls/{id}                          - delete link
GET    /api/public                             - all public links
GET    /{shortCode}                            - redirect
```

## Technical Requirements
- **Backend:** Symfony 8 + PHP 8.4 (optionally API Platform 4)
- **Frontend:** Next.js 16 / React 19
- **Database:** PostgreSQL / MariaDB / MongoDB - your choice
- **Message Broker:** RabbitMQ
- **Authorization:** JWT token
- **Docker:** docker-compose (starter in repo)
- **Tests:** minimum 2 unit tests

OR

- **Backend/Frontend/Mobile:** Kotlin Multiplatform

## Deliverables
- Fork of the repository
- Working `docker-compose up`
- README with setup instructions
- Complete the task by January 30, 2026
