# Zadanie Rekrutacyjne: URL Shortener

## Opis zadania

Stwórz system do skracania linków URL ze statystykami kliknięć.

## Wymagania funkcjonalne

- **Automatyczne generowanie sesji użytkownika bez podawania danych**
- **Tworzenie skróconych linków**
- **Widoczność linku: publiczny / prywatny**
- **Opcjonalny czas wygaśnięcia (1h / 1d / 1t)**
- **Opcjonalny własny alias** (jeśli wolny)
- **Lista własnych linków**
- **Lista wszystkich publicznych linków** (bez autoryzacji)
- **Usuwanie linków** (soft delete)
- **Statystyki kliknięć** (zliczane asynchronicznie przez RabbitMQ)
- **Rate limit:** max 10 linków / minutę / sesja

## Endpointy API

```
POST   /api/session                            - utworzenie sesji
GET    /api/session                            - pobranie sesji
POST   /api/urls                               - tworzenie linku
GET    /api/urls                               - lista własnych linków
GET    /api/urls/{id}/stats                    - statystyki kliknięć
DELETE /api/urls/{id}                          - usunięcie linku
GET    /api/public                             - wszystkie publiczne linki
GET    /{shortCode}                            - przekierowanie
```

## Wymagania techniczne

- **Backend:** Symfony 8 + PHP 8.4 ( opcjonalnie API Platform 4 )
- **Frontend:** Next.js 16 / React 19
- **Baza danych:** PostgreSQL / MariaDB / MongoDB - wybierz
- **Message Broker:** RabbitMQ
- **Autoryzacja:** JWT token
- **Docker:** docker-compose (starter w repo)
- **Testy:** minimum 2 testy jednostkowe

LUB

- **Backend/Frontend/Mobile** Kotlin Multiplatform

## Dostarcz

- Fork repozytorium
- Działający `docker-compose up`
- README z instrukcją uruchomienia
- Zadanie zrealizuj do 30.01.2026
