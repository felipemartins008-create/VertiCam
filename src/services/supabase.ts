import { JumpTestResult, UserProfile } from '../types';

// Modo offline por padrão — só tenta Supabase se as variáveis de ambiente estiverem configuradas
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const IS_CONFIGURED = !!(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  SUPABASE_URL.startsWith('https://')
);

// Dados locais em memória — funcionam sem internet ou Supabase
let localJumpTests: JumpTestResult[] = [
  {
    id: 'test-1',
    flightTimeSeconds: 0.64,
    jumpHeightCm: 50.2,
    attackReachCm: 302.2,
    standingReachCm: 252,
    date: '2026-08-15',
    isRecord: false,
  },
  {
    id: 'test-2',
    flightTimeSeconds: 0.68,
    jumpHeightCm: 56.7,
    attackReachCm: 308.7,
    standingReachCm: 252,
    date: '2026-09-01',
    isRecord: false,
  },
  {
    id: 'test-3',
    flightTimeSeconds: 0.71,
    jumpHeightCm: 61.8,
    attackReachCm: 313.8,
    standingReachCm: 252,
    date: '2026-09-20',
    isRecord: true,
  },
];

let localProfile: UserProfile | null = null;

export const JumpService = {
  async saveJumpTest(test: Omit<JumpTestResult, 'id'>): Promise<JumpTestResult> {
    const newRecord: JumpTestResult = {
      ...test,
      id: `jump-${Date.now()}`,
    };
    localJumpTests.push(newRecord);

    if (IS_CONFIGURED) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        await supabase.from('jump_tests').insert([{
          flight_time_seconds: test.flightTimeSeconds,
          jump_height_cm: test.jumpHeightCm,
          attack_reach_cm: test.attackReachCm,
          standing_reach_cm: test.standingReachCm,
          video_url: test.videoUri,
          is_personal_record: test.isRecord,
        }]);
      } catch {
        // silently fallback to local
      }
    }

    return newRecord;
  },

  async getJumpHistory(): Promise<JumpTestResult[]> {
    // Retorna dados locais imediatamente — sem chamadas de rede
    return [...localJumpTests];
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    localProfile = profile;
    // Salva no Supabase em background se configurado
    if (IS_CONFIGURED) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        await supabase.from('profiles').upsert([{
          position: profile.position,
          training_level: profile.level,
          pain_points: profile.goals,
          age: profile.age,
          height_cm: profile.heightCm,
          weight_kg: profile.weightKg,
          standing_reach_cm: profile.standingReachCm,
        }]);
      } catch {
        // silently fallback
      }
    }
  },

  async getUserProfile(): Promise<UserProfile | null> {
    return localProfile;
  },
};
