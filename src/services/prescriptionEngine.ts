import {
  AthleteBaseline,
  PrescriptionOutput,
  PrescribedExercise,
  ReadinessZone,
  NeuromuscularTrainingLevel,
} from '../types';

/**
 * MOTORE DI PRESCRIZIONE E AUTOREGOLAZIONE NEUROMUSCOLARE
 * Specializzato nello sviluppo dell'elevazione verticale tramite monitoraggio della prontezza con il salto.
 */
export class PrescriptionEngine {
  /**
   * Calcola il rapporto EUR (Elastic Utilization Ratio) = CMJ / SJ
   */
  public static calculateEUR(cmjHeightCm: number, sjHeightCm: number): number {
    if (sjHeightCm <= 0) return 1.0;
    return Math.round((cmjHeightCm / sjHeightCm) * 100) / 100;
  }

  /**
   * Diagnostica il profilo neuromuscolare in base all'EUR
   */
  public static getEURDiagnostic(eur: number): {
    deficitType: 'elastic' | 'concentric_strength' | 'balanced';
    recommendation: string;
  } {
    if (eur < 1.10) {
      return {
        deficitType: 'elastic',
        recommendation: 'Deficit elastico/reattivo (EUR < 1.10). Necessita di enfasi sul Ciclo Stiramento-Accorciamento (CEA) e pliometria reattiva.',
      };
    }
    if (eur > 1.20) {
      return {
        deficitType: 'concentric_strength',
        recommendation: 'Deficit di forza dinamica massima (EUR > 1.20). Eccellente capacità elastica, necessita di incremento della forza concentrica pura.',
      };
    }
    return {
      deficitType: 'balanced',
      recommendation: 'Profilo neuromuscolare equilibrato (1.10 <= EUR <= 1.20). Sinergia ottimale tra forza concentrica e restituzione elastica tendinea.',
    };
  }

  /**
   * Determina l'altezza del box nel Drop Jump in base al livello dell'atleta
   */
  private static getBoxHeight(level: NeuromuscularTrainingLevel, isYellowZone: boolean = false): number {
    let baseHeight = 40;
    switch (level) {
      case 'Iniciante':
      case 'Principiante':
      case 'beginner':
        baseHeight = 25; // fascia 20-30cm
        break;
      case 'Intermediário':
      case 'Intermedio':
      case 'intermediate':
        baseHeight = 40; // fascia 35-45cm
        break;
      case 'Avançado':
      case 'Avanzato':
      case 'advanced':
        baseHeight = 55; // fascia 50-60cm
        break;
      default:
        baseHeight = 40;
    }

    if (isYellowZone) {
      return Math.max(20, baseHeight - 15);
    }
    return baseHeight;
  }

  /**
   * Arrotonda i carichi in kg con scatti di 0.5kg
   */
  private static calculateLoad(oneRepMaxKg: number, percentage: number): number {
    const raw = oneRepMaxKg * (percentage / 100);
    return Math.round(raw * 2) / 2;
  }

  /**
   * Genera la prescrizione giornaliera 100% autoregolata dal test CMJ del giorno
   */
  public static generateDailyPrescription(
    baseline: AthleteBaseline,
    dailyCMJHeightCm: number
  ): PrescriptionOutput {
    // 1. Calcola il tasso di prontezza neuromuscolare (Readiness Score)
    const rawScore = (dailyCMJHeightCm / baseline.baseline_cmj_height) * 100;
    const scorePercentage = Math.round(rawScore * 10) / 10;

    // 2. Classifica la Zona di Prontezza
    let zone: ReadinessZone = 'GREEN';
    let statusMessage = '';

    if (scorePercentage >= 95) {
      zone = 'GREEN';
      statusMessage = 'SNC recuperato e massima capacità di reclutamento delle unità motorie.';
    } else if (scorePercentage >= 85) {
      zone = 'YELLOW';
      statusMessage = 'Fatica residua moderata. Volume e intensità calibrati per l\'adattamento tecnico.';
    } else {
      zone = 'RED';
      statusMessage = 'Esaurimento neurale acuto. Rischio elevato di sovraccarico sui tendini rotuleo e d\'Achille. Allenamento balistico sospeso.';
    }

    // 3. Protocollo di Riscaldamento Standardizzato & PAP
    const warmupLoad30 = this.calculateLoad(baseline.user_squat_1rm, 30);
    const warmupLoad40 = this.calculateLoad(baseline.user_squat_1rm, 40);

    const warmup = {
      mobility_protocol: 'Caviglie, ginocchia e anche (2 min)',
      submaximal_jumps: '3-5 salti verticali liberi sub-massimali a sforzo progressivo',
      barbell_activation: `2 serie di squat concentrico-esplosivo: Serie 1: 5 rip @ 30-40% 1RM (${warmupLoad30}kg) | Serie 2: 3 rip esplosive @ 40% 1RM (${warmupLoad40}kg)`,
      rest_before_test_seconds: 150, // 2 minuti e mezzo
    };

    // 4. Prescrizione Esercizi in base alla Matrice di Decisione
    const workoutPrescription: PrescribedExercise[] = [];
    let velocityCutoffPercent = 10;

    // ── ZONA VERDE: Prontezza Alta (>= 95%) ──
    if (zone === 'GREEN') {
      velocityCutoffPercent = 10;
      const loadCMJ = this.calculateLoad(baseline.user_squat_1rm, 35);
      const loadSJ = this.calculateLoad(baseline.user_squat_1rm, 35);
      const boxHeight = this.getBoxHeight(baseline.training_level, false);

      workoutPrescription.push(
        {
          exercise_name: 'Loaded Countermovement Jump (Jump Squat con bilanciere)',
          sets: 4,
          reps: 3,
          load_kg: loadCMJ,
          load_percentage_1rm: 35,
          rest_seconds: 180,
          execution_notes: 'Discesa rapida e transizione esplosiva verso la fase di volo. Decelerazione controllata all\'atterraggio.',
        },
        {
          exercise_name: 'Loaded Squat Jump (Senza contromovimento, pausa 2s)',
          sets: 3,
          reps: 3,
          load_kg: loadSJ,
          load_percentage_1rm: 35,
          rest_seconds: 180,
          execution_notes: 'Pausa statica di 2 secondi a 90° prima dell\'esplosione verso l\'alto. Nessuna oscillazione preliminare.',
        },
        {
          exercise_name: 'Drop Jump dal Box',
          box_height_cm: boxHeight,
          sets: 4,
          reps: 4,
          rest_seconds: 120,
          execution_notes: 'Passo fuori dal box (non saltare in alto). Tocca terra e rimbalza il più velocemente possibile (tempo di contatto al suolo < 250ms).',
        }
      );
    }

    // ── ZONA GIALLA: Prontezza Moderata (85% a 94.9%) ──
    else if (zone === 'YELLOW') {
      velocityCutoffPercent = 8;
      const loadModerate = this.calculateLoad(baseline.user_squat_1rm, 30);
      const boxHeight = this.getBoxHeight(baseline.training_level, true);

      // Regolazione del focus in base all'EUR Ratio
      if (baseline.eur_ratio < 1.10) {
        // Deficit elastico: Focus su Drop Jump e Loaded CMJ
        workoutPrescription.push(
          {
            exercise_name: 'Loaded Countermovement Jump (Jump Squat)',
            sets: 3, // Ridotto di 1 serie
            reps: 3,
            load_kg: loadModerate,
            load_percentage_1rm: 30,
            rest_seconds: 180,
            execution_notes: 'Focus tecnico sulla transizione elastica eccentrica-concentrica senza perdita di velocità.',
          },
          {
            exercise_name: 'Drop Jump dal Box (Tecnica & Reattività)',
            box_height_cm: boxHeight,
            sets: 3, // Ridotto di 1 serie
            reps: 3,
            rest_seconds: 120,
            execution_notes: 'Enfasi sull\'assorbimento attivo e reattività immediata. Priorità alla velocità di stacco, non all\'altezza estrema.',
          },
          {
            exercise_name: 'Loaded Squat Jump (Senza contromovimento)',
            sets: 2, // Volume ridotto
            reps: 2,
            load_kg: loadModerate,
            load_percentage_1rm: 30,
            rest_seconds: 150,
            execution_notes: 'Pausa isometrica rigorosa di 2 secondi prima della spinta concentrica esplosiva.',
          }
        );
      } else {
        // EUR >= 1.10: Focus su Loaded SJ (Forza Concentrica Pura)
        workoutPrescription.push(
          {
            exercise_name: 'Loaded Squat Jump (Senza contromovimento)',
            sets: 3,
            reps: 3,
            load_kg: loadModerate,
            load_percentage_1rm: 30,
            rest_seconds: 180,
            execution_notes: 'Pausa statica di 2 secondi in buca. Massima velocità di sviluppo della forza (RFD).',
          },
          {
            exercise_name: 'Loaded Countermovement Jump (Jump Squat)',
            sets: 3,
            reps: 3,
            load_kg: loadModerate,
            load_percentage_1rm: 30,
            rest_seconds: 180,
            execution_notes: 'Movimento pulito e controllato, interruzione immediata se si percepisce affaticamento meccanico.',
          },
          {
            exercise_name: 'Drop Jump dal Box (Ammortizzamento Tecnico)',
            box_height_cm: boxHeight,
            sets: 2,
            reps: 3,
            rest_seconds: 120,
            execution_notes: 'Focus su atterraggio silenzioso e allineamento perfetto delle ginocchia.',
          }
        );
      }
    }

    // ── ZONA ROSSA: Affaticamento Severo (< 85%) ──
    else {
      velocityCutoffPercent = 0; // Pliometria annullata
      workoutPrescription.push(
        {
          exercise_name: 'Spanish Squat Isometrico (Sollievo Tendine Rotuleo)',
          sets: 4,
          reps: '40 secondi',
          rest_seconds: 90,
          execution_notes: 'Tenuta isometrica a catena chiusa a 70° con elastico dietro le tibie. Reclutamento puro senza impatto.',
        },
        {
          exercise_name: 'Calf Raise Isometrico Monolaterale (Tendine d\'Achille)',
          sets: 4,
          reps: '35 secondi per gamba',
          rest_seconds: 75,
          execution_notes: 'Mantenere la caviglia in posizione neutra su gradino sostenendo il peso corporeo con ginocchio teso.',
        },
        {
          exercise_name: 'Mobilità & Rilascio Miofasciale Attivo',
          sets: 3,
          reps: '60 secondi per distretto',
          rest_seconds: 60,
          execution_notes: 'Rullo miofasciale su quadricipiti, bandelletta ileotibiale e polpacci, seguito da dorsiflessione attiva al muro.',
        }
      );
    }

    return {
      readiness: {
        score_percentage: scorePercentage,
        zone,
        status_message: statusMessage,
      },
      warmup,
      workout_prescription: workoutPrescription,
      velocity_loss_cutoff_percent: velocityCutoffPercent,
    };
  }
}
