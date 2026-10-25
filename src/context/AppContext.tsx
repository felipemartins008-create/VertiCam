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
import { JumpService } from '../services/supabase';
import { PrescriptionEngine } from '../services/prescriptionEngine';

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
  user_weight: 78,
  user_height: 188,
  user_squat_1rm: 120, // 120kg de 1RM agachamento
  training_level: 'Intermediário',
  baseline_cmj_height: 52.0,
  baseline_sj_height: 48.5,
  baseline_rsi: 2.15,
  eur_ratio: 1.07, // 52 / 48.5 = 1.07 (< 1.10 deficit elástico)
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
        }
      } catch (e) {
        // Ignora se não houver suporte a URLSearchParams
      }
    }

    // Inicialização de dados
    const initData = async () => {
      const history = await JumpService.getJumpHistory();
      setJumpHistory(history);
      if (history.length > 0) {
        const lastJump = history[history.length - 1];
        setLatestJumpResult(lastJump);
        // Gera prescrição padrão baseada no último salto
        const pres = PrescriptionEngine.generateDailyPrescription(DEFAULT_BASELINE, lastJump.jumpHeightCm);
        setDailyPrescription(pres);
      } else {
        const pres = PrescriptionEngine.generateDailyPrescription(DEFAULT_BASELINE, 50.0);
        setDailyPrescription(pres);
      }
    };
    initData();
  }, []);

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
