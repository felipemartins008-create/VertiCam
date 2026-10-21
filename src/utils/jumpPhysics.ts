/**
 * VertiCam - Motore di calcolo biomeccanico del salto verticale & autoregolazione
 */

export const GRAVITY_G = 9.81; // Accelerazione di gravità in m/s²

/**
 * Calcola l'altezza dell'elevazione (in centimetri) dal tempo di volo in secondi.
 * Formula: h = (g * t^2) / 8 [in metri] -> * 100 [in centimetri]
 *
 * @param flightTimeSec Tempo di volo in secondi (dallo stacco dei piedi al primo contatto con il suolo)
 * @returns Altezza del salto in centimetri (arrotondata a 1 decimale)
 */
export function calculateJumpHeight(flightTimeSec: number): number {
  if (flightTimeSec <= 0) return 0;
  const heightMeters = (GRAVITY_G * Math.pow(flightTimeSec, 2)) / 8;
  const heightCm = heightMeters * 100;
  return Math.round(heightCm * 10) / 10;
}

/**
 * Calcola il tempo di volo (in secondi) per una determinata altezza di salto in cm.
 * Formula inversa: t = sqrt((8 * h_meters) / g)
 */
export function calculateFlightTimeFromHeight(heightCm: number): number {
  if (heightCm <= 0) return 0;
  const heightMeters = heightCm / 100;
  const t = Math.sqrt((8 * heightMeters) / GRAVITY_G);
  return Math.round(t * 1000) / 1000;
}

/**
 * Stima la portata da fermo (standing reach in cm) in base all'altezza dell'atleta.
 * Nella pallavolo, la portata con un braccio esteso in alto è in media 1.33 - 1.34 dell'altezza.
 */
export function estimateStandingReach(heightCm: number): number {
  if (heightCm <= 0) return 0;
  return Math.round(heightCm * 1.33);
}

/**
 * Calcola la portata teorica in attacco (altezza di tocco a muro / schiacciata).
 * Portata in attacco = Portata da fermo + Altezza del salto.
 */
export function calculateAttackReach(standingReachCm: number, jumpHeightCm: number): number {
  return Math.round(standingReachCm + jumpHeightCm);
}

/**
 * Livelli benchmark per i pallavolisti in Italia (SuperLega, Serie A2/B, FIPAV regionale e amatori).
 */
export function getJumpBenchmark(jumpHeightCm: number): {
  levelLabel: string;
  category: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  color: string;
  percentileText: string;
} {
  if (jumpHeightCm >= 75) {
    return {
      levelLabel: 'Livello SuperLega / Nazionale Italiana 🇮🇹',
      category: 'elite',
      color: '#10B981', // Verde
      percentileText: 'Top 5% dei pallavolisti. Potenza pliometrica d\'élite!',
    };
  } else if (jumpHeightCm >= 62) {
    return {
      levelLabel: 'Livello Campionato Nazionale (Serie A2 / Serie B FIPAV)',
      category: 'advanced',
      color: '#F59E0B', // Ambra
      percentileText: 'Livello eccellente! Ottimo potenziale per schiacciare sopra il muro.',
    };
  } else if (jumpHeightCm >= 50) {
    return {
      levelLabel: 'Livello Intermedio (Serie C / D / Giovanili)',
      category: 'intermediate',
      color: '#38BDF8', // Celeste
      percentileText: 'Buona base di partenza. Con il programma di 8 settimane puoi superare i 60+ cm.',
    };
  } else {
    return {
      levelLabel: 'Livello Base / Principiante',
      category: 'beginner',
      color: '#94A3B8', // Grigio
      percentileText: 'Grande potenziale di adattamento! Rapido incremento dei primi centimetri.',
    };
  }
}
