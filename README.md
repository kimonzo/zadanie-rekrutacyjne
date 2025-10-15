# Zadanie Rekrutacyjne: URL Shortener

## Opis zadania

Stwórz system do skracania długich linków URL. System powinien umożliwiać użytkownikom tworzenie krótkich linków, które przekierowują do oryginalnych adresów URL.

## Wymagania funkcjonalne

- **Automatyczne generowanie sesji użytkownika bez podawania danyh**
- **Wyświetlanie listy utworzonych linków**
- **Możliwość stworzenia linku z ustawieniem widoczności:**
  - **Publiczny** 
  - **Prywatny**
- **Opcjonalnie ustawienie czasu wygaśnięcia ( np. 1h / 1d / 1t )**

## Endpointy API

```
POST   /api/session                            - sesja
POST   /api/urls                               - tworzenie linku
GET    /api/urls?visibility=[public/private]   - lista linków z możliwością filtracji
GET    /{shortCode}                            - przekierowanie na oryginalny URL
```

## Wymagania techniczne

**Stack:**
- Backend: Symfony 7 + PHP 8.4 ( opcjonalnie API Platform 4 )
- Frontend: Next.js 15 / React 19
- Dowolna baza danych np. MongoDB/PostgreSQL/MariaDB
- Autoryzacja: JWT token

**Dodatkowe wymagania:**
- Minimum 2 testy jednostkowe dla backendu

## Dostarcz

- Fork repozytorium

🚀 Powodzenia! 🚀
