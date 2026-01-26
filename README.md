# URL Shortener (High-Performance & Async)

A full-stack URL shortener built with **Symfony 8** and **Next.js 16**, featuring asynchronous click tracking via **RabbitMQ** for high-performance redirects.

## Key Features

* **Async Analytics:** Clicks are counted via a background worker (RabbitMQ), ensuring zero latency for the user during redirection.
* **Fully Dockerized:** One command setup for Database, Queue, API, Frontend, and Workers.
* **Anonymous Auth:** JWT-based stateless authentication for managing sessions without registration.
* **Rate Limiting:** Prevents abuse (Max 10 links/minute per session).
* **Advanced Control:** Custom aliases, expiration times (1h/1d/1w), and privacy toggles (Public/Private).
* **Soft Delete:** Links can be deactivated without losing historical data.

## Tech Stack

* **Frontend:** Next.js 16 (App Router), React 19, TailwindCSS, TypeScript.
* **Backend:** Symfony 8.0, PHP 8.4, Doctrine ORM, API Platform.
* **Infrastructure:** Docker Compose, PostgreSQL 16, RabbitMQ (Messenger).

---

##  Quick Start (Docker)

You do not need PHP, Node.js, or Composer installed on your host machine. Docker handles everything.

### 1. Launch the Application

Run the following command in the project root:

```bash
docker-compose up --build

```

*Wait about 10-15 seconds for the database to initialize and the migrations to run automatically.*

### 2. Access the App

| Service | URL | Description |
| --- | --- | --- |
| **Frontend** | [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) | Main User Interface |
| **Backend API** | [http://localhost:8000/api](https://www.google.com/search?q=http://localhost:8000/api) | Symfony REST API |
| **RabbitMQ** | [http://localhost:15672](https://www.google.com/search?q=http://localhost:15672) | Queue Dashboard (User: `guest`, Pass: `guest`) |

---

##  Running Tests

To run the Unit Tests (PHPUnit), execute the command **inside** the running backend container:

```bash
docker exec -it url_shortener_backend php bin/phpunit

```

---

##  Architecture Overview

The system is designed to handle high traffic by decoupling the "Write" operations (click counting) from the "Read" operations (redirection).

1. **User Clicks Link:** Request hits Next.js -> Forwarded to Symfony.
2. **Immediate Redirect:** Symfony validates the link and returns a `302 Redirect` immediately.
3. **Background Process:** At the same moment, a message is dispatched to **RabbitMQ**.
4. **Async Worker:** The `messenger:consume` worker (running in a separate container) picks up the message and updates the PostgreSQL database.

##  Project Structure

* **`/backend`**: Symfony 8 API.
* `Dockerfile`: PHP 8.4 setup with AMQP & PDO_PGSQL extensions.
* `src/Message`: Defines the async payload.
* `src/MessageHandler`: Logic for processing queue messages.


* **`/frontend`**: Next.js 16 Client.
* `src/app/[code]`: Middleware/Bridge for handling redirections.


* **`docker-compose.yml`**: Orchestrates the 5 services (Frontend, Backend, Worker, DB, Queue).

##  Troubleshooting

**Database Connection Error on First Run:**
If the containers start but the backend complains about the database, it might be that Postgres wasn't ready yet.

* **Fix:** Simply stop and restart the containers:
```bash
docker-compose restart backend worker

```



**Port Conflicts:**
Ensure ports `3000`, `8000`, `5432`, and `5672` are not occupied by other services on your machine.
