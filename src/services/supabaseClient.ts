import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const FALLBACK_URL = 'https://beqonvotausteldwvhyz.supabase.co';
const FALLBACK_KEY = 'sb_publishable_VHxOSFJSFokTK83Dc3nJxg__9GuWu44';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || FALLBACK_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;

export const isSupabaseConfigured = !!(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  SUPABASE_URL.startsWith('https://')
);

// Fallback dummy seguro para garantir que a aplicação NUNCA dê tela branca mesmo se o Supabase falhar
const dummyClient: any = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async () => ({ data: null, error: new Error('Offline') }),
    signUp: async () => ({ data: null, error: new Error('Offline') }),
    signOut: async () => {},
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        order: () => Promise.resolve({ data: [], error: null }),
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
        single: () => Promise.resolve({ data: null, error: null }),
      }),
      order: () => Promise.resolve({ data: [], error: null }),
      limit: () => Promise.resolve({ data: [], error: null }),
    }),
    insert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
    upsert: () => Promise.resolve({ data: null, error: null }),
  }),
};

let clientInstance: any = null;

try {
  if (isSupabaseConfigured) {
    clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: Platform.OS === 'web',
      },
    });
  }
} catch (e) {
  console.warn('Aviso: Falha ao inicializar cliente Supabase, usando fallback seguro:', e);
}

export const supabase = clientInstance || dummyClient;
