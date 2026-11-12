import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import {
  UserProfile,
  JumpTestResult,
  WorkoutModule,
  AthleteBaseline,
  PrescriptionOutput,
} from '../types';
import { INITIAL_USER_PROFILE, WORKOUT_MODULES } from '../data/mockData';
import { JumpService, AuthService } from '../services/supabase';
import { PrescriptionEngine } from '../services/prescriptionEngine';
import { getLanguage, setLanguage as setI18nLanguage, SupportedLanguage, subscribeLanguageChange } from '../services/i18n';

export type ScreenName =
  | 'Welcome'
  | 'Quiz'
  | 'ActivateAccount'
  | 'OnboardingTutorial'
  | 'BaselineEvaluation'
  | 'LoturcoWorkout'
  | 'CameraIntro'
  | 'JumpInstruction'
  | 'JumpCamera'
  | 'JumpResult'
  | 'Paywall'
  | 'Dashboard'
  | 'WorkoutPlayer'
  | 'DailyCheckin'
  | 'PrescriptionWorkout';

const DEFAULT_BASELINE: AthleteBaseline = {
  user_weight: 0,
  user_height: 0,
  user_squat_1rm: 0,
  training_level: 'Iniciante',
  baseline_cmj_height: 0,
  baseline_sj_height: 0,
  baseline_rsi: 0,
  eur_ratio: 0,
};

interface AppContextType {
  currentScreen: ScreenName;
  dashboardTab: 'workouts' | 'evaluations' | 'profile';
  userProfile: UserProfile;
  jumpHistory: JumpTestResult[];
  latestJumpResult: JumpTestResult | null;
  activeWorkoutModule: WorkoutModule | null;
  isSubscribed: boolean;
  athleteBaseline: AthleteBaseline;
  dailyPrescription: PrescriptionOutput | null;
  navigate: (screen: ScreenName) => void;
  setDashboardTab: (tab: 'workouts' | 'evaluations' | 'profile') => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateBaseline: (baseline: Partial<AthleteBaseline>) => void;
  saveNewJump: (flightTimeSec: number, standingReachCm?: number, videoUri?: string) => Promise<JumpTestResult>;
  setSubscribed: (status: boolean) => void;
  startWorkout: (module: WorkoutModule) => void;
  runDailyCheckin: (dailyCMJHeightCm: number) => PrescriptionOutput;
  reloadUserData: () => Promise<{ profile: UserProfile | null; history: JumpTestResult[] }>;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('Quiz');
  const [dashboardTab, setDashboardTab] = useState<'workouts' | 'evaluations' | 'profile'>('workouts');
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [jumpHistory, setJumpHistory] = useState<JumpTestResult[]>([]);
  const [latestJumpResult, setLatestJumpResult] = useState<JumpTestResult | null>(null);
  const [activeWorkoutModule, setActiveWorkoutModule] = useState<WorkoutModule | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [language, setLanguageState] = useState<SupportedLanguage>(getLanguage());

  // Motor de Prescrição
  const [athleteBaseline, setAthleteBaseline] = useState<AthleteBaseline>(DEFAULT_BASELINE);
  const [dailyPrescription, setDailyPrescription] = useState<PrescriptionOutput | null>(null);

  useEffect(() => {
    // Detecta retorno de pagamento da Stripe (?payment=success, ?session_id=... ou ?activate=true)
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const isPaymentSuccess = params.get('payment') === 'success' || !!params.get('session_id') || params.get('activate') === 'true';
        if (isPaymentSuccess) {
          setIsSubscribed(true);
          setCurrentScreen('ActivateAccount');
        } else if (params.get('dashboard') === 'true' || params.get('test') === 'true') {
          setIsSubscribed(true);
          setCurrentScreen('Dashboard');
        }
      } catch (e) {
        // Ignora se não houver suporte a URLSearchParams
      }
    }

    const applyLoadedData = (profile: UserProfile | null, history: JumpTestResult[]) => {
      const baseCmj = profile?.initialJumpCm || (history.length > 0 ? history[0].jumpHeightCm : 0);
      const nextBaseline: AthleteBaseline = {
        ...DEFAULT_BASELINE,
        user_weight: profile?.weightKg || 0,
        user_height: profile?.heightCm || 0,
        user_leg_length_cm: profile?.legLengthCm,
        user_squat_1rm: profile?.squat1rmKg || 0,
        baseline_cmj_height: baseCmj,
        baseline_sj_height: baseCmj > 0 ? Math.round((baseCmj / 1.08) * 10) / 10 : 0,
        eur_ratio: baseCmj > 0 ? 1.08 : 0,
      };
      setAthleteBaseline(nextBaseline);

      if (history.length > 0) {
        const lastJump = history[history.length - 1];
        setLatestJumpResult(lastJump);
        if (nextBaseline.baseline_cmj_height > 0) {
          const pres = PrescriptionEngine.generateDailyPrescription(nextBaseline, lastJump.jumpHeightCm);
          setDailyPrescription(pres);
        } else {
          setDailyPrescription(null);
        }
      } else {
        setLatestJumpResult(null);
        setDailyPrescription(null);
      }
    };

    // Inicialização de dados segura
    const initData = async () => {
      try {
        // 1. Verifica se já existe sessão salva no Supabase
        const sessionUser = await AuthService.getCurrentSessionUser();
        if (sessionUser) {
          setIsSubscribed(true);
          setUserProfile((prev) => ({
            ...prev,
            email: sessionUser.email,
            fullName: sessionUser.fullName,
            isSubscribed: true,
          }));
        }

        // 2. Carrega perfil do banco (se existir)
        const profile = await JumpService.getUserProfile();
        if (profile) {
          setUserProfile(profile);
        }

        // 3. Carrega histórico de saltos do banco
        const history = await JumpService.getJumpHistory();
        setJumpHistory(history);
        applyLoadedData(profile, history);
      } catch (e) {
        console.warn('Aviso: Erro silencioso ao inicializar dados:', e);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    const unsub = subscribeLanguageChange((newLang) => {
      setLanguageState(newLang);
    });
    return unsub;
  }, []);

  const handleSetLanguage = (newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    setI18nLanguage(newLang);
  };

  const reloadUserData = async (): Promise<{ profile: UserProfile | null; history: JumpTestResult[] }> => {
    try {
      const profile = await JumpService.getUserProfile();
      if (profile) {
        setUserProfile(profile);
      }
      const history = await JumpService.getJumpHistory();
      setJumpHistory(history);

      const baseCmj = profile?.initialJumpCm || (history.length > 0 ? history[0].jumpHeightCm : 0);
      const nextBaseline: AthleteBaseline = {
        ...DEFAULT_BASELINE,
        user_weight: profile?.weightKg || 0,
        user_height: profile?.heightCm || 0,
        user_leg_length_cm: profile?.legLengthCm,
        user_squat_1rm: profile?.squat1rmKg || 0,
        baseline_cmj_height: baseCmj,
        baseline_sj_height: baseCmj > 0 ? Math.round((baseCmj / 1.08) * 10) / 10 : 0,
        eur_ratio: baseCmj > 0 ? 1.08 : 0,
      };
      setAthleteBaseline(nextBaseline);

      if (history.length > 0) {
        const lastJump = history[history.length - 1];
        setLatestJumpResult(lastJump);
        if (nextBaseline.baseline_cmj_height > 0) {
          const pres = PrescriptionEngine.generateDailyPrescription(nextBaseline, lastJump.jumpHeightCm);
          setDailyPrescription(pres);
        } else {
          setDailyPrescription(null);
        }
      } else {
        setLatestJumpResult(null);
        setDailyPrescription(null);
      }
      return { profile, history };
    } catch (e) {
      console.warn('Erro ao recarregar dados do usuário:', e);
      return { profile: null, history: [] };
    }
  };

  const navigate = (screen: ScreenName) => {
    setCurrentScreen(screen);
  };

  const updateProfile = async (partial: Partial<UserProfile>) => {
    const updated = { ...userProfile, ...partial };
    setUserProfile(updated);
    await JumpService.saveUserProfile(updated);
  };

  const updateBaseline = (partial: Partial<AthleteBaseline>) => {
    setAthleteBaseline(prev => {
      const next = { ...prev, ...partial };
      if (partial.baseline_cmj_height || partial.baseline_sj_height) {
        next.eur_ratio = PrescriptionEngine.calculateEUR(next.baseline_cmj_height, next.baseline_sj_height);
      }
      return next;
    });
  };

  const runDailyCheckin = (dailyCMJHeightCm: number): PrescriptionOutput => {
    const prescription = PrescriptionEngine.generateDailyPrescription(athleteBaseline, dailyCMJHeightCm);
    setDailyPrescription(prescription);
    return prescription;
  };

  const saveNewJump = async (
    flightTimeSec: number,
    standingReachOverride?: number,
    videoUri?: string
  ): Promise<JumpTestResult> => {
    const standingReach = standingReachOverride || userProfile.standingReachCm || 250;
    const heightMeters = (9.81 * Math.pow(flightTimeSec, 2)) / 8;
    const jumpHeightCm = Math.round(heightMeters * 100 * 10) / 10;
    const attackReachCm = Math.round((standingReach + jumpHeightCm) * 10) / 10;

    const previousBest = jumpHistory.reduce((max, j) => Math.max(max, j.jumpHeightCm), 0);
    const isRecord = jumpHeightCm > previousBest;

    const newResult = await JumpService.saveJumpTest({
      flightTimeSeconds: flightTimeSec,
      jumpHeightCm,
      attackReachCm,
      standingReachCm: standingReach,
      videoUri,
      date: new Date().toISOString().split('T')[0],
      isRecord,
    });

    setJumpHistory(prev => [...prev, newResult]);
    setLatestJumpResult(newResult);

    // Atualiza automaticamente o motor de prescrição diária
    runDailyCheckin(jumpHeightCm);

    if (isRecord || !userProfile.currentJumpCm) {
      updateProfile({
        currentJumpCm: Math.max(userProfile.currentJumpCm || 0, jumpHeightCm),
        initialJumpCm: userProfile.initialJumpCm || jumpHeightCm,
      });
    }

    return newResult;
  };

  const setSubscribedStatus = (status: boolean) => {
    setIsSubscribed(status);
    setUserProfile(prev => ({ ...prev, isSubscribed: status }));
  };

  const startWorkout = (module: WorkoutModule) => {
    setActiveWorkoutModule(module);
    setCurrentScreen('WorkoutPlayer');
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        dashboardTab,
        userProfile,
        jumpHistory,
        latestJumpResult,
        activeWorkoutModule,
        isSubscribed,
        athleteBaseline,
        dailyPrescription,
        navigate,
        setDashboardTab,
        updateProfile,
        updateBaseline,
        saveNewJump,
        setSubscribed: setSubscribedStatus,
        startWorkout,
        runDailyCheckin,
        reloadUserData,
        language,
        setLanguage: handleSetLanguage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
