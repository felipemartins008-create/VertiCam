# 🚀 VertiCam — Vertical Jump Analysis & Autoregolazione Neuromuscolare

**VertiCam** è un'applicazione mobile innovativa ad alte prestazioni dedicata allo sviluppo scientifico dell'elevazione verticale e al monitoraggio biomeccanico tramite fotocamera dello smartphone (tempo di volo e RSI), con prescrizione giornaliera di allenamenti 100% autoregolati basati sul recupero del Sistema Nervoso Centrale (SNC).

---

## ⚡ Caratteristiche Principali

1. **Analisi Biomeccanica del Salto (AI Vision & Flight Time Physics):**
   - Misurazione scientifica del tempo di volo senza sensori costosi o pedane di forza.
   - Formula biomeccanica:
     $$h = \frac{g \cdot t^2}{8} \times 100$$
     dove $g = 9.81\text{ m/s}^2$, e $t$ è il tempo di volo in secondi.
   - Calcolo dell'Indice di Forza Reattiva (RSI = Altezza di volo / Tempo di contatto).
   - Calcolo del rapporto EUR (Elastic Utilization Ratio = CMJ / SJ) per identificare deficit elastici o deficit di forza pura.
   - Guida sagoma atleta in tempo reale (Silhouette Guide a 2 metri di distanza).
   - Scrubber fotogramma per correzione micrometrica del punto di stacco (Takeoff) e atterraggio (Landing).

2. **Motore di Autoregolazione Neuromuscolare Giornaliera:**
   - **Check-in di Prontezza (Readiness Score):**
     $$\text{Readiness Score} = \left(\frac{\text{daily\_cmj\_height}}{\text{baseline\_cmj\_height}}\right) \times 100$$
   - **Zona Verde (>= 95%):** SNC recuperato al 100% -> Carichi balistici pesanti (30-45% 1RM), Loaded CMJ/SJ, Drop Jump ad alta intensità (contatto al suolo < 250ms).
   - **Zona Gialla (85% - 94%):** Affaticamento residuo moderato -> Volume ridotto, carichi 25-35% 1RM, correzione specifica del deficit EUR.
   - **Zona Rossa (< 85%):** Esgotamento neurale acuto -> Stop carichi ad alto impatto pliometrico. Sessione di recupero attivo, isometrie tendinee (Spanish Squat / Calf raises) e mobilità.

3. **Identità Visiva VertiCam:**
   - Palette Tech Neon: Sfondo ardesia profondo (`#080C14`), accenti in Ciano Elettrico (`#00E5FF`) e Menta Smeraldo (`#10B981`).
   - Logo ufficiale con sagoma dell'atleta in elevazione con bilanciere e badge `VERTICAL JUMP ANALYSIS`.
   - Layout responsive: Mobile viewport ottimizzato con Web Sidebar su schermi desktop.

4. **Monetizzazione & Conformità:**
   - Piani in abbonamento **VertiCam PRO** (Annuale con -40% o Mensile).
   - Conformità al GDPR europeo per i dati biometrici.

---

## 🏗️ Architettura del Progetto

```
IMPULSÃO/
├── App.tsx                     # Router principale e Context Provider
├── app.json                    # Configurazione Expo & permessi nativi
├── package.json                # Dipendenze (Expo 57, React 19, Lucide)
├── assets/                     # Asset grafici, logo ufficiale e icone
│   ├── logo.png                # Logo ufficiale VertiCam
│   └── icon.png                # App icon
├── src/
│   ├── components/             # Componenti UI riutilizzabili
│   │   ├── VertiCamLogo.tsx    # Componente Logo ufficiale VertiCam
│   │   ├── Header.tsx          # Barra di navigazione con branding
│   │   ├── WebSidebar.tsx      # Sidebar desktop per visualizzazione web
│   │   ├── BottomNavBar.tsx    # Tab bar mobile
│   │   ├── Button.tsx          # Pulsanti con accenti neon Ciano/Menta
│   │   └── Card.tsx            # Card ad alto contrasto
│   ├── context/
│   │   └── AppContext.tsx      # Stato globale dell'applicazione
│   ├── locales/
│   │   └── it.json             # Traduzioni e testi in lingua italiana
│   ├── screens/                # Schermate dell'applicazione
│   │   ├── WelcomeScreen.tsx   # Landing / onboarding con logo VertiCam
│   │   ├── QuizScreen.tsx      # Valutazione iniziale profilo atleta
│   │   ├── CameraIntroScreen.tsx
│   │   ├── JumpInstructionScreen.tsx
│   │   ├── JumpCameraScreen.tsx # Misurazione live con fotocamera
│   │   ├── JumpResultScreen.tsx # Analisi tempo di volo e potenziale
│   │   ├── DailyCheckinScreen.tsx # Motore di autoregolazione SNC
│   │   ├── WorkoutHomeScreen.tsx
│   │   ├── WorkoutPlayerScreen.tsx
│   │   ├── EvaluationScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── PaywallScreen.tsx
│   ├── services/
│   │   ├── i18n.ts             # Servizio internazionalizzazione
│   │   └── prescriptionEngine.ts # Algoritmo di prescrizione autoregolata
│   ├── theme/
│   │   └── colors.ts           # Tavolozza colori VertiCam
│   └── utils/
│       └── jumpPhysics.ts      # Equazioni balistiche e biomeccaniche
```

---

## 🚀 Comandi di Sviluppo

```bash
# Avvio ambiente di sviluppo
npm start

# Compilazione Web per Vercel
npm run build

# Verifica statica TypeScript
node --stack-size=65536 ./node_modules/typescript/bin/tsc --noEmit
```
