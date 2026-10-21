import { WorkoutModule, UserProfile } from '../types';

export const INITIAL_USER_PROFILE: UserProfile = {
  fullName: 'Filippo Volley',
  position: 'outside', // Schiacciatore
  level: 'intermediate',
  goals: ['higher_jump', 'jumper_knee'],
  age: 22,
  heightCm: 194,
  weightKg: 86,
  standingReachCm: 254,
  squat1rmKg: 120,
  initialJumpCm: 52.0,
  currentJumpCm: 62.0,
  isSubscribed: true,
};

export const WORKOUT_MODULES: WorkoutModule[] = [
  {
    id: 'main-8-weeks',
    title: 'Programma Principale: Elevazione 8 Settimane',
    category: 'Programma Principale',
    badge: 'Potenza & Elevazione',
    durationMinutes: 45,
    description: 'Blocco avanzato pliometrico e di forza per massimizzare l\'elevazione sia con rincorsa sia da fermo a muro.',
    exercises: [
      {
        id: 'ex-pogo',
        name: 'Pogo Hops',
        polishName: 'Pogo Hops (Salti a caviglia rigida)',
        targetFocus: 'Rigidità del tendine d\'Achille e reattività',
        sets: 3,
        reps: 20,
        suggestedWeight: 'Peso corporeo',
        restSeconds: 45,
        videoThumb: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
        instructions: [
          'Rimbalza elasticamente sull\'avampiede senza piegare eccessivamente le ginocchia.',
          'Mantieni il core contratto, contatto con il parquet il più breve possibile (< 0.2s).',
          'Tieni le braccia morbide ai fianchi o sincronizzale con un leggero slancio.'
        ]
      },
      {
        id: 'ex-bulgarian-jump',
        name: 'Bulgarian Split Squat Jump',
        polishName: 'Squat bulgaro con salto esplosivo',
        targetFocus: 'Forza esplosiva monolaterale',
        sets: 3,
        reps: 6,
        suggestedWeight: 'Peso corporeo o manubri 2x5kg',
        restSeconds: 60,
        videoThumb: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80',
        instructions: [
          'Un piede poggiato sulla panca dietro, gamba anteriore stabile a terra.',
          'Scendi in modo controllato, poi spingi ed esplodi verso l\'alto.',
          'Atterra dolcemente su tutto il piede ammortizzando con l\'anca.'
        ]
      },
      {
        id: 'ex-depth-jump',
        name: 'Depth Jump',
        polishName: 'Salto dalla panca con rimbalzo verticale immediato',
        targetFocus: 'Ciclo Allungamento-Accorciamento (SSC)',
        sets: 4,
        reps: 5,
        suggestedWeight: 'Box 30-40 cm',
        restSeconds: 90,
        videoThumb: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=80',
        instructions: [
          'Fai un passo dal box cadendo naturalmente a terra con entrambi i piedi.',
          'In una frazione di secondo dal contatto con il suolo, esplodi verso l\'alto al massimo.',
          'Slancia entrambe le braccia in alto simulando lo stacco d\'attacco o a muro.'
        ]
      }
    ]
  },
  {
    id: 'healthy-knees',
    title: 'Ginocchia Sane (Prevenzione)',
    category: 'Prevenzione & Salute',
    badge: 'Ginocchio del Saltatore',
    durationMinutes: 30,
    description: 'Protocollo di protezione del tendine rotuleo. Aumenta la densità del collagene ed elimina il dolore all\'atterraggio.',
    exercises: [
      {
        id: 'ex-spanish-squat',
        name: 'Spanish Squat Isometric Hold',
        polishName: 'Tenuta isometrica rotulea (Spanish Squat)',
        targetFocus: 'Tendine rotuleo e desensibilizzazione del dolore',
        sets: 5,
        reps: 45, // 45 secondi
        suggestedWeight: 'Elastico pesante dietro le ginocchia',
        restSeconds: 60,
        videoThumb: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600&auto=format&fit=crop&q=80',
        instructions: [
          'Fissa una fascia elastica robusta dietro le ginocchia e fai qualche passo indietro in tensione.',
          'Scendi a 70-80 gradi di flessione del ginocchio mantenendo la tibia verticale.',
          'Mantieni la posizione immobile per 45 secondi respirando regolarmente.'
        ]
      },
      {
        id: 'ex-tibialis',
        name: 'Tibialis Raises',
        polishName: 'Sollevamento delle punte (Tibiale anteriore)',
        targetFocus: 'Decelerazione e assorbimento dell\'impatto all\'atterraggio',
        sets: 3,
        reps: 20,
        suggestedWeight: 'Peso corporeo contro la parete',
        restSeconds: 45,
        videoThumb: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
        instructions: [
          'Schiena poggiata al muro, talloni a circa 30-40 cm dalla parete.',
          'Solleva le punte dei piedi verso l\'alto il più possibile contraendo i tibiali.',
          'Mantieni la contrazione per 1 secondo in alto e scendi lentamente.'
        ]
      }
    ]
  },
  {
    id: 'home-workout',
    title: 'Allenamento a Casa (Senza attrezzi)',
    category: 'Allenamento a Casa',
    badge: 'Senza Attrezzi',
    durationMinutes: 25,
    description: 'Seduta pliometrica e di core per migliorare l\'elevazione anche in spazi ristretti e senza bilancieri.',
    exercises: [
      {
        id: 'ex-tuck-jump',
        name: 'Tuck Jumps Continui',
        polishName: 'Salti con ginocchia al petto in successione',
        targetFocus: 'Reattività rapida e flessori dell\'anca',
        sets: 3,
        reps: 8,
        suggestedWeight: 'Peso corporeo',
        restSeconds: 60,
        videoThumb: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=80',
        instructions: [
          'Salta verso l\'alto portando energicamente le ginocchia verso il petto.',
          'Atterra sull\'avampiede e riparti istantaneamente per il salto successivo.',
          'Mantieni il tronco compatto e la massima altezza di picco.'
        ]
      }
    ]
  },
  {
    id: 'match-warmup',
    title: 'Riscaldamento Pre-Partita',
    category: 'Giorno Partita',
    badge: '15 min',
    durationMinutes: 15,
    description: 'Attivazione neuromuscolare e del sistema nervoso centrale (SNC) pochi minuti prima di entrare in campo.',
    exercises: [
      {
        id: 'ex-pap-jumps',
        name: 'Salti con Potenziamento Post-Attivazione (PAP)',
        polishName: 'Salti di attivazione neurale progressiva',
        targetFocus: 'Massimo reclutamento delle unità motorie',
        sets: 3,
        reps: 3,
        suggestedWeight: 'Peso corporeo con intenzione 100%',
        restSeconds: 90,
        videoThumb: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80',
        instructions: [
          'Esegui 3 salti d\'attacco con rincorsa completa alla massima intenzione.',
          'Recupera 90 secondi completi per consentire la dissipazione della fatica.',
          'Preparati a entrare in campo con la massima freschezza neuromuscolare.'
        ]
      }
    ]
  }
];
