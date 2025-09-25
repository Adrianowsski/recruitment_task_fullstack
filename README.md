Kantor — mini-aplikacja (Symfony + React)

Aplikacja dla pracownika kantoru wymiany walut.

✨ Funkcje

Dashboard – kursy EUR, USD, CZK, IDR, BRL dla wybranego dnia
(z fallbackiem do 7 dni wstecz, jeśli w danym dniu NBP nie publikował tabeli).

Reguły marż:

EUR/USD: kupno = mid − 0.15, sprzedaż = mid + 0.11

CZK/IDR/BRL: tylko sprzedaż = mid + 0.20

Historia 7/14/30 sesji NBP z interaktywnym wykresem (metryka: Sprzedaż / Średni / Kupno), oś Data i Kurs, subtelna siatka, tooltip na hover.

Kalkulator wymiany z podsumowaniem:

kierunek, kwota, waluta,

wynik, kurs użyty, marża jednostkowa, marża całkowita transakcji.

Zero nowych zależności – tylko paczki z repo.
PHP 8.2, Symfony 4.4 (jak w bazie), Webpack Encore (React), Bootstrap 5.

🔧 Uruchomienie w Docker

Wymagania: Docker Desktop

# 1) start (budowa obrazu + uruchomienie)
docker compose up -d --build

# 2) odśwież autoload composera (bez problemów z CA na Windows)
docker run --rm -v ${PWD}:/app -w /app composer:2 dump-autoload

# 3) build frontu (Windows PowerShell)
$env:WATCHPACK_POLLING="true"
./node_modules/.bin/encore dev


Aplikacja będzie pod: http://localhost/

Tryb watch (dev):

./node_modules/.bin/encore dev --watch

🖥️ Uruchomienie lokalne (bez Dockera)

Wymagania: PHP 8.2, Node 16+

# backend
composer install
# jeśli masz błąd CA: uruchom z kontenera (jak wyżej): docker run ... composer:2 dump-autoload

# frontend
npm install
./node_modules/.bin/encore dev   # lub --watch


Skonfiguruj vHost na katalog public/ i wejdź na http://localhost/
.

🧪 Testy

Testy nie wymagają Internetu – używany jest FakeNbpClient (stub) w testowej konfiguracji.

# w kontenerze
docker compose exec webserver ./vendor/bin/simple-phpunit

# lub lokalnie
./vendor/bin/simple-phpunit


Zakres testów:

Service: RateCalculator, DateService, SupportedCurrencies

Controller:
/api/setup-check, /api/meta/supported, /api/rates, /api/rates/{code}/history
(w tym walidacja dla nieobsługiwanej waluty)

Stub: FakeNbpClient – wstrzykiwany przez config/packages/test/services.yaml

🔌 Endpointy (przykłady)
GET /api/rates?date=2025-09-25
GET /api/rates/EUR/history?date=2025-09-25&days=14
GET /api/meta/supported
GET /api/setup-check?testParam=1

🧱 Architektura (skrót)

NbpClient – pobiera tabelę A i historię dla waluty; cache (10/60 min), fallback do 7 dni wstecz

RateCalculator – liczy kursy kupna/sprzedaży wg reguł zadania

SupportedCurrencies – lista walut + mapowanie nazw

DateService – parsowanie dat i wyznaczanie okna (liczba sesji)

Frontend (React + Bootstrap) – ręcznie rysowany SVG wykres (subtelna siatka, tooltip, osie)

📦 Stos technologiczny

Backend: PHP 8.2, Symfony 4.4, Symfony Cache, Twig

Frontend: React (Webpack Encore), Bootstrap 5

Infra: Docker, Apache

Testy: PHPUnit + Symfony PHPUnit Bridge

🗂️ Struktura (najważniejsze)
src/
  Controller/
    DefaultController.php
    MetaController.php
    RatesController.php
  Service/
    DateService.php
    NbpClient.php
    RateCalculator.php
    SupportedCurrencies.php

assets/js/
  app.js
  api/client.js
  components/
    Dashboard.jsx
    CurrencyDetails.jsx
    Calculator.jsx
    Sparkline.jsx
    ui/...

tests/
  Controller/RatesControllerTest.php
  Service/RateCalculatorTest.php
  Service/DateServiceTest.php
  Stub/FakeNbpClient.php

🧯 Troubleshooting

Windows / Composer CA – użyj:

docker run --rm -v ${PWD}:/app -w /app composer:2 dump-autoload


Encore watch na Windows – wymuś polling:

$env:WATCHPACK_POLLING="true"
./node_modules/.bin/encore dev --watch


Puste dane NBP dla wybranej daty – działa fallback do 7 dni wstecz (logika w NbpClient).
