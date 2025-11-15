# Zadanie Rekrutacyjne: URL Shortener

## Opis zadania

Stwórz system do skracania długich linków URL. System powinien umożliwiać użytkownikom tworzenie krótkich linków, które przekierowują do oryginalnych adresów URL.

## Wymagania funkcjonalne

- **Automatyczne generowanie sesji użytkownika bez podawania danyh** ✅
- **Wyświetlanie listy utworzonych linków** ✅
- **Możliwość stworzenia linku z ustawieniem widoczności:** ✅
  - **Publiczny**
  - **Prywatny**
- **Opcjonalnie ustawienie czasu wygaśnięcia ( np. 1h / 1d / 1t )** ✅

## Endpointy API

```
POST   /api/session                            - sesja ✅
POST   /api/urls                               - tworzenie linku ✅
GET    /api/urls?visibility=[public/private]   - lista linków z możliwością filtracji ✅
GET    /{shortCode}                            - przekierowanie na oryginalny URL ✅
```

## Wymagania techniczne

**Stack:**
- Backend: Symfony 7 + PHP 8.4 ✅
- Frontend: Next.js 15 / React 19 ✅
- Baza danych: PostgreSQL ✅
- Autoryzacja: JWT token ✅

**Dodatkowe wymagania:**
- Minimum 2 testy jednostkowe dla backendu ✅

---

## Instalacja i Uruchomienie

### Wymagania

- Docker
- Docker Compose

### Uruchomienie aplikacji

1. **Sklonuj repozytorium:**
```bash
git clone <repository-url>
cd zadanie-rekrutacyjne
```

2. **Uruchom aplikację za pomocą Docker Compose:**
```bash
docker-compose up --build
```

3. **Otwórz przeglądarkę:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

### Struktura projektu

```
zadanie-rekrutacyjne/
├── backend/                    # Symfony 7 Backend
│   ├── src/
│   │   ├── Controller/        # Kontrolery API
│   │   ├── Entity/            # Encje Doctrine (Session, Url)
│   │   ├── Repository/        # Repozytoria
│   │   └── Service/           # Serwisy biznesowe
│   ├── tests/                 # Testy jednostkowe
│   ├── config/                # Konfiguracja Symfony
│   ├── migrations/            # Migracje bazy danych
│   └── Dockerfile
├── frontend/                  # Next.js 15 Frontend
│   ├── src/
│   │   └── app/              # App Router (Next.js 15)
│   └── Dockerfile
└── docker-compose.yml
```

## Jak działa aplikacja?

### 1. Automatyczna Sesja Użytkownika

Przy pierwszym uruchomieniu aplikacji, frontend automatycznie tworzy sesję użytkownika poprzez endpoint `/api/session`. Otrzymany JWT token jest zapisywany w `localStorage` i używany do autoryzacji kolejnych żądań.

### 2. Tworzenie Skróconych Linków

Użytkownik może tworzyć skrócone linki wypełniając formularz:
- **URL** - oryginalny, długi adres URL
- **Widoczność** - publiczny lub prywatny
- **Czas wygaśnięcia** (opcjonalnie) - 1h, 1d, 1w lub nigdy

### 3. Lista Linków

Aplikacja wyświetla listę wszystkich utworzonych linków z możliwością filtracji:
- Wszystkie linki
- Tylko publiczne
- Tylko prywatne

Dla każdego linku wyświetlane są:
- Skrócony URL (kliknięcie kopiuje do schowka)
- Oryginalny URL
- Liczba kliknięć
- Data utworzenia
- Data wygaśnięcia (jeśli ustawiono)
- Status (publiczny/prywatny, wygasły)

### 4. Przekierowanie

Wejście na skrócony link (np. `http://localhost:8000/abc123`) automatycznie przekierowuje na oryginalny URL i inkrementuje licznik kliknięć.

## API Documentation

### POST /api/session
Tworzy nową sesję użytkownika.

**Response:**
```json
{
  "sessionToken": "string",
  "jwtToken": "string",
  "createdAt": "ISO 8601 datetime"
}
```

### POST /api/urls
Tworzy nowy skrócony link.

**Headers:**
```
Authorization: Bearer {jwtToken}
```

**Request Body:**
```json
{
  "url": "https://example.com/very/long/url",
  "visibility": "public",
  "expiresIn": "1h"
}
```

**Response:**
```json
{
  "id": 1,
  "originalUrl": "https://example.com/very/long/url",
  "shortCode": "abc123",
  "shortUrl": "http://localhost:8000/abc123",
  "visibility": "public",
  "createdAt": "ISO 8601 datetime",
  "expiresAt": "ISO 8601 datetime",
  "clickCount": 0
}
```

### GET /api/urls?visibility={filter}
Pobiera listę linków użytkownika z opcjonalnym filtrowaniem.

**Headers:**
```
Authorization: Bearer {jwtToken}
```

**Query Parameters:**
- `visibility` (optional): `public` lub `private`

**Response:**
```json
[
  {
    "id": 1,
    "originalUrl": "https://example.com",
    "shortCode": "abc123",
    "shortUrl": "http://localhost:8000/abc123",
    "visibility": "public",
    "createdAt": "ISO 8601 datetime",
    "expiresAt": null,
    "clickCount": 5,
    "isExpired": false
  }
]
```

### GET /{shortCode}
Przekierowuje na oryginalny URL i inkrementuje licznik.

**Response:**
- `302 Found` - przekierowanie do oryginalnego URL
- `404 Not Found` - link nie istnieje
- `410 Gone` - link wygasł

## Uruchomienie testów

Testy jednostkowe znajdują się w katalogu `backend/tests/`.

```bash
# Wejdź do kontenera backend
docker-compose exec backend sh

# Zainstaluj zależności (jeśli jeszcze nie zainstalowano)
composer install

# Uruchom testy
./vendor/bin/phpunit
```

## Technologie

### Backend
- **PHP 8.4** - najnowsza wersja PHP
- **Symfony 7.2** - framework PHP
- **Doctrine ORM** - mapowanie obiektowo-relacyjne
- **PostgreSQL 16** - baza danych
- **LexikJWTAuthenticationBundle** - obsługa JWT
- **PHPUnit** - testy jednostkowe

### Frontend
- **Next.js 15** - framework React z App Router
- **React 19** - najnowsza wersja React
- **TypeScript** - statyczne typowanie

### DevOps
- **Docker** - konteneryzacja
- **Docker Compose** - orkiestracja kontenerów

## Funkcjonalności dodatkowe

- ⏱️ **Automatyczne wygasanie linków** - system sprawdza czy link nie wygasł przed przekierowaniem
- 📊 **Licznik kliknięć** - każde użycie skróconego linku jest zliczane
- 🔒 **Prywatność** - linki prywatne są widoczne tylko dla właściciela
- 📋 **Kopiowanie do schowka** - kliknięcie na skrócony link kopiuje go do schowka
- 🎨 **Responsywny interfejs** - aplikacja działa na urządzeniach mobilnych i desktopowych

🚀 Powodzenia! 🚀
