import { JumpTestResult, UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

// Fallback de dados locais em memória caso esteja sem rede ou offline (começa 100% limpo)
let localJumpTests: JumpTestResult[] = [];

let localProfile: UserProfile | null = null;

export const JumpService = {
  async saveJumpTest(test: Omit<JumpTestResult, 'id'>): Promise<JumpTestResult> {
    const newRecord: JumpTestResult = {
      ...test,
      id: `jump-${Date.now()}`,
    };
    localJumpTests.push(newRecord);

    if (isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase.from('jump_tests').insert([{
            user_id: user.id,
            flight_time_seconds: test.flightTimeSeconds,
            jump_height_cm: test.jumpHeightCm,
            attack_reach_cm: test.attackReachCm,
            standing_reach_cm: test.standingReachCm,
            video_url: test.videoUri,
            is_personal_record: test.isRecord,
          }]).select().single();

          if (!error && data) {
            newRecord.id = data.id;
          }
        }
      } catch (err) {
        console.warn('Erro ao salvar salto no Supabase, mantido localmente:', err);
      }
    }

    return newRecord;
  },

  async getJumpHistory(): Promise<JumpTestResult[]> {
    if (isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('jump_tests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

          if (!error && data && data.length > 0) {
            return data.map((row) => ({
              id: row.id,
              flightTimeSeconds: Number(row.flight_time_seconds),
              jumpHeightCm: Number(row.jump_height_cm),
              attackReachCm: Number(row.attack_reach_cm),
              standingReachCm: Number(row.standing_reach_cm),
              date: row.created_at ? row.created_at.split('T')[0] : '2026-11-03',
              isRecord: !!row.is_personal_record,
              videoUri: row.video_url || undefined,
            }));
          }
        }
      } catch (err) {
        console.warn('Erro ao buscar histórico no Supabase:', err);
      }
    }

    return [...localJumpTests];
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    localProfile = profile;
    if (isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            try {
              localStorage.setItem(
                `verticam_meta_${user.id}`,
                JSON.stringify({
                  workoutDays: profile.workoutDays,
                  hasCompletedInitialEvaluation: profile.hasCompletedInitialEvaluation,
                  nextEvaluationDate: profile.nextEvaluationDate,
                  legLengthCm: profile.legLengthCm,
                  availableEquipment: profile.availableEquipment,
                  calibratedOplKg: profile.calibratedOplKg,
                })
              );
            } catch {}
          }
          await supabase.from('profiles').upsert([{
            user_id: user.id,
            email: user.email,
            full_name: profile.fullName || (profile as any).name || user.user_metadata?.full_name || '',
            position: profile.position,
            training_level: profile.level,
            pain_points: profile.goals,
            age: profile.age,
            height_cm: profile.heightCm,
            weight_kg: profile.weightKg,
            standing_reach_cm: profile.standingReachCm,
            initial_jump_cm: profile.initialJumpCm ?? null,
            current_record_cm: profile.currentJumpCm ?? (profile as any).currentRecordCm ?? null,
            is_subscribed: profile.isSubscribed ?? true,
            updated_at: new Date().toISOString(),
          }], { onConflict: 'user_id' });
        }
      } catch (err) {
        console.warn('Erro ao salvar perfil no Supabase:', err);
      }
    }
  },

  async getUserProfile(): Promise<UserProfile | null> {
    if (isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          let meta: any = {};
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            try {
              const raw = localStorage.getItem(`verticam_meta_${user.id}`);
              if (raw) meta = JSON.parse(raw);
            } catch {}
          }

          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (!error && data) {
            const initialJump = data.initial_jump_cm != null ? Number(data.initial_jump_cm) : undefined;
            const currentJump = data.current_record_cm != null ? Number(data.current_record_cm) : undefined;
            return {
              id: data.id,
              email: data.email || user.email,
              fullName: data.full_name || user.user_metadata?.full_name || '',
              position: data.position || 'outside',
              level: data.training_level || 'beginner',
              goals: data.pain_points || [],
              age: data.age || 24,
              heightCm: data.height_cm != null ? Number(data.height_cm) : 0,
              weightKg: data.weight_kg != null ? Number(data.weight_kg) : 0,
              standingReachCm: data.standing_reach_cm != null ? Number(data.standing_reach_cm) : 0,
              initialJumpCm: initialJump,
              currentJumpCm: currentJump,
              isSubscribed: data.is_subscribed ?? true,
              workoutDays: meta.workoutDays,
              hasCompletedInitialEvaluation: Boolean(meta.hasCompletedInitialEvaluation || (initialJump != null && initialJump > 0)),
              nextEvaluationDate: meta.nextEvaluationDate,
              legLengthCm: meta.legLengthCm,
              availableEquipment: meta.availableEquipment,
              calibratedOplKg: meta.calibratedOplKg,
            };
          }

          return {
            email: user.email,
            fullName: user.user_metadata?.full_name || '',
            position: 'outside',
            level: 'beginner',
            goals: [],
            age: 24,
            heightCm: 0,
            weightKg: 0,
            standingReachCm: 0,
            isSubscribed: true,
            workoutDays: meta.workoutDays,
            hasCompletedInitialEvaluation: Boolean(meta.hasCompletedInitialEvaluation),
            nextEvaluationDate: meta.nextEvaluationDate,
            legLengthCm: meta.legLengthCm,
            availableEquipment: meta.availableEquipment,
            calibratedOplKg: meta.calibratedOplKg,
          };
        }
      } catch (err) {
        console.warn('Erro ao buscar perfil no Supabase:', err);
      }
    }

    return localProfile;
  },
};

export const AuthService = {
  async signIn(email: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Tenta autenticação real no Supabase
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (!error && data?.user) {
          return {
            success: true,
            user: {
              id: data.user.id,
              email: data.user.email,
              fullName: data.user.user_metadata?.full_name || 'Felipe Martins',
              isSubscribed: true,
            },
          };
        }
        if (error) {
          console.warn('Supabase signIn error:', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase auth network issue:', err);
      }
    }

    // 2. Conta Master VIP Offline Garantida
    if (cleanEmail === 'felipemartins008@gmail.com' && cleanPassword === 'house123') {
      return {
        success: true,
        user: {
          id: '06107c1a-5c29-496e-8b7b-cee3ae881772',
          email: 'felipemartins008@gmail.com',
          fullName: 'Felipe Martins',
          isSubscribed: true,
        },
      };
    }

    return { success: false, error: 'Credenziali non valide. Riprova con email e password corrette.' };
  },

  async signUp(email: string, password: string, fullName?: string): Promise<{ success: boolean; user?: any; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              full_name: fullName || 'Atleta VertiCam',
              is_subscribed: true,
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data?.user) {
          return {
            success: true,
            user: {
              id: data.user.id,
              email: data.user.email,
              fullName: fullName || 'Atleta VertiCam',
              isSubscribed: true,
            },
          };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Errore di registrazione' };
      }
    }

    return {
      success: true,
      user: {
        id: `offline-${Date.now()}`,
        email: cleanEmail,
        fullName: fullName || 'Atleta VertiCam',
        isSubscribed: true,
      },
    };
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  },

  async getCurrentSessionUser(): Promise<any | null> {
    if (isSupabaseConfigured) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          return {
            id: session.user.id,
            email: session.user.email,
            fullName: session.user.user_metadata?.full_name || 'Atleta VertiCam',
            isSubscribed: true,
          };
        }
      } catch {
        return null;
      }
    }
    return null;
  },
};
