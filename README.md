# 🏐 VertiCam (VolleyJump AI) — Elevazione Pallavolo & Test Salto con Telecamera

**SiatkaJump AI** to innowacyjna platforma mobilna dedykowana dla zawodniczek i zawodników siatkówki w Polsce, łącząca laboratoryjny pomiar wysokości wyskoku z kamery telefonu (**Wyskok Test**) z profesjonalnym, 8-tygodniowym programem plyometrycznym oraz protokołem profilaktyki i leczenia tendinopatii więzadła rzepki (**"Kolano skoczka"**).

---

## ⚡ Kluczowe Cechy Aplikacji

1. **Wyskok Test (AI Camera & Flight Time Physics):**
   - Pomiar czasu lotu zawodnika w powietrzu bez użycia drogich mat tensometrycznych czy sensorów.
   - Wzór biomechaniczny:
     $$h = \frac{g \cdot t^2}{8} \times 100$$
     gdzie $g = 9.81\text{ m/s}^2$, a $t$ to czas lotu w sekundach.
   - Nakładka sylwetki (Body Silhouette Guide) ułatwiająca ustawienie telefonu w odległości 2 metrów.
   - Odliczanie 3-2-1 z sygnałem dźwiękowym oraz automatyczna rejestracja próby 5 sekund.
   - **Korektor klatkowy (Frame Scrubber):** Możliwość mikro-korekty punktu oderwania (Takeoff) i lądowania (Landing) z dokładnością do 0.01 sekundy.
   - Wyliczenie teoretycznego zasięgu w ataku (zasięg stojąc + wyskok).

2. **Język i Rynek:**
   - 100% natywny język polski (wszystkie stringi w `src/locales/pl.json`).
   - Terminologia siatkarska: *Przyjmujący, Atakujący, Środkowy, Rozgrywający, Libero, Siatkówka Plażowa*.
   - Benchmarki porównawcze dopasowane do PlusLigi, I/II Ligi PZPS i lig amatorskich.

3. **Monetyzacja & Płatności w Polsce:**
   - Subskrypcje Freemium zoptymalizowane pod polski rynek:
     - **Plan Roczny:** 349,00 PLN / rok (~29 PLN/mies.) — *Oszczędzasz 40%*
     - **Plan Miesięczny:** 49,00 PLN / miesiąc
   - Wsparcie dla popularnych metod płatności: **BLIK**, **Apple Pay**, **Google Pay**, **Karta płatnicza**.
   - Integracja z RevenueCat i Stripe.

4. **Program Treningowy & Player:**
   - **Trening Dnia:** Szybki start sesji dopasowanej do pozycji na boisku.
   - **4 Główne Moduły:**
     1. *Główny Program: Wyskok 8 Tygodni* (Pogo Hops, Bułgarski przysiad z wyskokiem, Depth Jump).
     2. *Zdrowe Kolana (Profilaktyka)* (Izometria Spanish Squat, Deska skośna).
     3. *Trening w Domu (Bez sprzętu)* (Tuck Jumps, wspięcia na palce).
     4. *Rozgrzewka Przed Meczem* (Rotatory barku z gumą, kroki nabiegu do ataku).
   - Odtwarzacz ćwiczeń w pętli HD, serie/powtórzenia/ciężary oraz **automatyczny licznik odpoczynku**.

5. **Pomiary i Profil Zawodnika:**
   - Wykres słupkowy postępów w czasie (*Wzrost wyskoku*).
   - Porównanie: *Salto Inicial (Początkowy)* vs *Salto Atual (Aktualny)* vs *Ganho Total (Zysk)*.
   - Zarządzanie danymi osobowymi zgodnie z **RODO / GDPR** (eksport danych, usunięcie profilu).

---

## 🏗️ Architektura Projektu

```
IMPULSÃO/
├── App.tsx                     # Główny router i provider stanu aplikacji
├── app.json                    # Konfiguracja Expo (uprawnienia kamery, dark mode)
├── package.json                # Zależności projektu
├── src/
│   ├── components/             # Reużywalne komponenty UI
│   │   ├── BottomNavBar.tsx    # 3-zakładkowy pasek dolny (Treningi, Pomiary, Profil)
│   │   ├── Button.tsx          # Przyciski neonowe z efektami glow
│   │   ├── Card.tsx            # Panele w kolorystyce Slate-800
│   │   └── Header.tsx          # Górna belka nawigacyjna z logo i akcjami
│   ├── context/
│   │   └── AppContext.tsx      # Globalny stan (ekran, profil, historia skoków, subskrypcja)
│   ├── data/
│   │   └── mockData.ts         # Programy treningowe, ćwiczenia i profil początkowy
│   ├── locales/
│   │   └── pl.json             # Słownik języka polskiego (i18n)
│   ├── screens/                # Ekrany wszystkich 4 faz lejka
│   │   ├── WelcomeScreen.tsx       # Faza 1: Boas-Vindas
│   │   ├── QuizScreen.tsx          # Faza 1: Quiz profilujący (4 kroki)
│   │   ├── CameraIntroScreen.tsx   # Faza 1: Wprowadzenie do pomiaru z kamery
│   │   ├── JumpInstructionScreen.tsx # Faza 2: Instrukcja testu (3 kroki)
│   │   ├── JumpCameraScreen.tsx    # Faza 2: Kamera, sylwetka, odliczanie i korektor
│   │   ├── JumpResultScreen.tsx    # Faza 2: Wynik w cm, czas lotu, zasięg w ataku
│   │   ├── PaywallScreen.tsx       # Faza 3: Paywall (BLIK, 349 PLN / 49 PLN)
│   │   ├── DashboardScreen.tsx     # Faza 4: Kontener zakładek dolnych
│   │   ├── WorkoutHomeScreen.tsx   # Faza 4 (Aba 1): Treningi i programy
│   │   ├── WorkoutPlayerScreen.tsx # Faza 4: Odtwarzacz ćwiczeń z timerem odpoczynku
│   │   ├── EvaluationScreen.tsx    # Faza 4 (Aba 2): Historia skoków i wykres
│   │   └── ProfileScreen.tsx       # Faza 4 (Aba 3): Profil, RODO, subskrypcje
│   ├── services/
│   │   ├── i18n.ts             # Serwis tłumaczeń z interpolacją zmiennych
│   │   └── supabase.ts         # Klient bazy PostgreSQL Supabase
│   ├── theme/
│   │   └── colors.ts           # Paleta kolorów (Dark Slate / Neon Amber / Red)
│   ├── types/
│   │   └── index.ts            # Definicje typów TypeScript
│   └── utils/
│       └── jumpPhysics.ts      # Silnik biomechaniki i fizyki wyskoku
├── supabase/
│   └── schema.sql              # Kompletny schemat bazy PostgreSQL dla Supabase
└── scripts/
    └── testPhysics.js          # Skrypt weryfikacji formuły fizyki
```

---

## 🚀 Jak Uruchomić Aplikację

### 1. Uruchomienie w Przeglądarce (Web)
```bash
npm run web
```
Lub:
```bash
npx expo start --web
```

### 2. Uruchomienie na Telefonie (Android / iOS)
1. Zainstaluj aplikację **Expo Go** ze sklepu Google Play lub App Store na swoim telefonie.
2. Uruchom projekt:
   ```bash
   npx expo start
   ```
3. Zeskanuj kod QR aparatem telefonu (iOS) lub aplikacją Expo Go (Android).

---

## 🗄️ Konfiguracja Bazy Danych Supabase

Plik [`supabase/schema.sql`](file:///e:/APLICATIVOS/IMPULS%C3%83O/supabase/schema.sql) zawiera pełny schemat bazy danych dla PostgreSQL:
- Tabela `profiles` (parametry antropometryczne, pozycja, poziom, rekordy).
- Tabela `jump_tests` (czas lotu, wysokość skoku, zasięg w ataku, url wideo).
- Tabela `workout_programs` & `exercises` (baza programów siatkarskich).
- Tabela `user_workouts` (rejestr odbytych sesji treningowych).
- Tabela `subscriptions` (BLIK, Apple Pay, Google Pay, status aktywności).
- Włączone **Row Level Security (RLS)** dla ochrony danych zawodników.

Aby połączyć własny projekt Supabase:
Utwórz plik `.env` w głównym katalogu:
```env
EXPO_PUBLIC_SUPABASE_URL=https://twoj-projekt.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=twoj-anon-key
```

---

## 🔬 Weryfikacja Formuły Fizycznej

Możesz w dowolnym momencie przetestować laboratoryjną formułę fizyczną uruchamiając:
```bash
node scripts/testPhysics.js
```
Wynik:
```
Czas lotu t = 0.60s -> Wyskok: 44.1 cm [PASSED]
Czas lotu t = 0.70s -> Wyskok: 60.1 cm [PASSED]
Czas lotu t = 0.71s -> Wyskok: 61.8 cm [PASSED]
Czas lotu t = 0.80s -> Wyskok: 78.5 cm [PASSED]
```
