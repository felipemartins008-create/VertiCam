export type VolleyballPosition =
  | 'outside'     // Przyjmujący
  | 'opposite'    // Atakujący
  | 'middle'      // Środkowy
  | 'setter'      // Rozgrywający
  | 'libero'      // Libero
  | 'beach';      // Siatkówka Plażowa

export type ExperienceLevel = 'Iniciante' | 'Intermediário' | 'Avançado' | 'beginner' | 'intermediate' | 'advanced';

export type AthleteGoal = 'jumper_knee' | 'higher_jump' | 'dynamism';

export interface UserProfile {
  id?: string;
  email?: string;
  fullName?: string;
  position: VolleyballPosition;
  level: ExperienceLevel;
  goals: AthleteGoal[];
  age: number;
  heightCm: number;
  weightKg: number;
  legLengthCm?: number; // Comprimento dos membros inferiores (trocanter ao solo) em cm
  availableEquipment?: 'dumbbells' | 'barbell' | 'weight_vest' | 'bodyweight';
  workoutDays?: number[]; // Dias de treino na semana (1 = Seg, 3 = Qua, 5 = Sex, etc.)
  hasCompletedInitialEvaluation?: boolean;
  nextEvaluationDate?: string;
  standingReachCm: number;
  gender?: 'female' | 'male';
  squat1rmKg?: number; // Carga de 1RM no agachamento
  initialJumpCm?: number;
  currentJumpCm?: number;
  isSubscribed?: boolean;
}

export interface JumpTestResult {
  id: string;
  userId?: string;
  flightTimeSeconds: number; // t w sekundach
  jumpHeightCm: number;      // h = (g * t^2 / 8) * 100
  attackReachCm: number;     // standingReach + jumpHeight
  standingReachCm: number;
  videoUri?: string;
  date: string;
  isRecord?: boolean;
}

export interface ExerciseItem {
  id: string;
  name: string;
  polishName: string;
  targetFocus: string;
  sets: number;
  reps: number;
  suggestedWeight: string;
  restSeconds: number;
  videoThumb: string;
  instructions: string[];
}

export interface WorkoutModule {
  id: string;
  title: string;
  category: string;
  durationMinutes: number;
  badge: string;
  description: string;
  exercises: ExerciseItem[];
}

export interface SubscriptionOption {
  id: 'annual' | 'monthly';
  name: string;
  pricePln: number;
  periodText: string;
  perMonthText: string;
  discountBadge?: string;
  isPopular?: boolean;
}

// ── MOTOR DE PRESCRIÇÃO E AUTOREGULAÇÃO NEUROMUSCULAR ──

export type NeuromuscularTrainingLevel =
  | 'Iniciante' | 'Intermediário' | 'Avançado'
  | 'Principiante' | 'Intermedio' | 'Avanzato'
  | 'beginner' | 'intermediate' | 'advanced';

export interface AthleteBaseline {
  user_weight: number;         // kg
  user_height: number;         // cm
  user_leg_length_cm?: number; // cm (trocanter ao solo)
  user_squat_1rm: number;      // kg
  training_level: NeuromuscularTrainingLevel;
  baseline_cmj_height: number; // cm
  baseline_sj_height: number;  // cm
  baseline_rsi: number;        // Altura voo cm ÷ Tempo contato ms
  eur_ratio: number;           // baseline_cmj_height / baseline_sj_height
}

export type ReadinessZone = 'GREEN' | 'YELLOW' | 'RED';

export interface PrescribedExercise {
  exercise_name: string;
  sets: number;
  reps: number | string;
  load_kg?: number;
  load_percentage_1rm?: number;
  box_height_cm?: number;
  rest_seconds: number;
  execution_notes: string;
}

export interface WarmupProtocol {
  mobility_protocol: string;
  submaximal_jumps: string;
  barbell_activation: string;
  rest_before_test_seconds: number;
}

export interface PrescriptionOutput {
  readiness: {
    score_percentage: number;
    zone: ReadinessZone;
    status_message: string;
  };
  warmup: WarmupProtocol;
  workout_prescription: PrescribedExercise[];
  velocity_loss_cutoff_percent: number;
}
