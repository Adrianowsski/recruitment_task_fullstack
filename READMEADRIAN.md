# Kantor — mini-aplikacja (Symfony + React)

Aplikacja dla pracownika kantoru:

- Dashboard: kursy EUR, USD, CZK, IDR, BRL z dnia (lub fallback do 7 dni wstecz).
- Reguły marż:
    - **EUR/USD**: kupno = mid − 0.15, sprzedaż = mid + 0.11
    - **CZK/IDR/BRL**: tylko sprzedaż = mid + 0.20
- Historia 7/14/30 sesji NBP z **interaktywnym** wykresem (metryka: Sprzedaż / Średni / Kupno).
- Kalkulator wymiany z podsumowaniem:
    - kierunek, kwota, waluta,
    - **wynik**, **kurs użyty**, **marża jednostkowa**, **marża całkowita transakcji**.

> Bez nowych bibliotek – wyłącznie paczki z repo. PHP 8.2, Encore (React), Bootstrap 5.

---

## 🔧 Uruchomienie na Docker

Wymagania: Docker Desktop.

```bash
# 1) start (budowa obrazu + uruchomienie)
docker compose up -d --build

# 2) autoload composera bez problemów z CA (Windows często ma błąd CA)
docker run --rm -v ${PWD}:/app -w /app composer:2 dump-autoload

# 3) build frontu (Windows PowerShell)
$env:WATCHPACK_POLLING="true"
./node_modules/.bin/encore dev
Aplikacja: http://localhost/

Tryb watch (dev):
./node_modules/.bin/encore dev --watch

🖥️ Uruchomienie lokalne (bez Dockera)
PHP 8.2, Node 16+

composer install (jeśli błąd CA – użyj komendy z kontenerem jak wyżej: composer:2 dump-autoload)

npm install

./node_modules/.bin/encore dev lub ... --watch

vHost na public/ i wejście na http://localhost/

🧪 Testy
Wszystkie testy pracują na fałszywym kliencie NBP (brak zależności od Internetu).

bash
Copy code
# w kontenerze
docker compose exec webserver ./vendor/bin/simple-phpunit

# lokalnie
./vendor/bin/simple-phpunit
Zakres testów:

Service: RateCalculator, DateService, SupportedCurrencies

Controller: /api/setup-check, /api/meta/supported, /api/rates, /api/rates/{code}/history, walidacja dla unsupported code

Stub: FakeNbpClient podmieniany przez config/packages/test/services.yaml

🔌 Endpointy (przykłady)
bash
Copy code
GET /api/rates?date=2025-09-25
GET /api/rates/EUR/history?date=2025-09-25&days=14
GET /api/meta/supported
GET /api/setup-check?testParam=1
🧱 Architektura (skrót)
NbpClient: pobiera Table A i historię dla walut; cachuje (10/60 min), fallback do 7 dni wstecz gdy NBP nie ma publikacji na dzień.

RateCalculator: wstrzykuje marże wg reguł zadania.

SupportedCurrencies: lista walut + mapowanie nazw.

DateService: parsowanie dat i wyznaczanie okna sesji.

Frontend: React + Bootstrap; ręcznie rysowany wykres (SVG), subtelna siatka, tooltip, osie (Data / Kurs).

