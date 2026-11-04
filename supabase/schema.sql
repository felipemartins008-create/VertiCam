-- ============================================================
-- VERTICAM PRO - SCHEMA DATABASE SUPABASE (POSTGRESQL)
-- ============================================================

-- 1. TABELLA PROFILI ATLETI (PROFILES)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    position TEXT CHECK (position IN ('outside', 'opposite', 'middle', 'setter', 'libero', 'beach')),
    training_level TEXT CHECK (training_level IN ('beginner', 'intermediate', 'advanced')),
    pain_points TEXT[] DEFAULT '{}',
    age INTEGER,
    height_cm NUMERIC(5,1),
    weight_kg NUMERIC(5,1),
    standing_reach_cm NUMERIC(5,1), -- portata/altezza raggiungibile da fermo
    initial_jump_cm NUMERIC(5,1),   -- elevazione iniziale
    current_record_cm NUMERIC(5,1), -- record personale attuale
    is_subscribed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELLA TEST DI SALTO (JUMP_TESTS)
CREATE TABLE IF NOT EXISTS public.jump_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    flight_time_seconds NUMERIC(5,3) NOT NULL, -- tempo di volo (es. 0.710 s)
    jump_height_cm NUMERIC(5,1) NOT NULL,      -- h = (9.81 * t^2 / 8) * 100
    attack_reach_cm NUMERIC(5,1) NOT NULL,     -- quota massima di attacco
    standing_reach_cm NUMERIC(5,1) NOT NULL,
    video_url TEXT,
    fps INTEGER DEFAULT 60,
    is_personal_record BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELLA PROGRAMMI DI ALLENAMENTO (WORKOUT_PROGRAMS)
CREATE TABLE IF NOT EXISTS public.workout_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'plyo_main', 'knee_rehab', 'home_no_gear', 'pre_match'
    duration_weeks INTEGER DEFAULT 8,
    level TEXT DEFAULT 'all',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELLA ESERCIZI (EXERCISES)
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES public.workout_programs(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    focus_area TEXT NOT NULL, -- 'Reattività tendinea', 'Tendine rotuleo', 'Potenza esplosiva'
    default_sets INTEGER NOT NULL DEFAULT 3,
    default_reps INTEGER NOT NULL DEFAULT 8,
    suggested_weight TEXT DEFAULT 'Corpo libero',
    rest_seconds INTEGER NOT NULL DEFAULT 60,
    video_url TEXT,
    instructions TEXT[],
    order_index INTEGER DEFAULT 1
);

-- 5. STORICO ALLENAMENTI COMPLETATI (USER_WORKOUTS)
CREATE TABLE IF NOT EXISTS public.user_workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    program_id UUID REFERENCES public.workout_programs(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    duration_minutes INTEGER DEFAULT 45,
    notes TEXT
);

-- 6. ABBONAMENTI STRIPE (SUBSCRIPTIONS)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan_type TEXT CHECK (plan_type IN ('1_month', '3_months', '6_months', 'annual', 'monthly')) NOT NULL,
    amount_eur NUMERIC(6,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')) NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jump_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Politiche di accesso utente
DROP POLICY IF EXISTS "Profili utente" ON public.profiles;
CREATE POLICY "Profili utente" ON public.profiles FOR ALL USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Jump tests utente" ON public.jump_tests;
CREATE POLICY "Jump tests utente" ON public.jump_tests FOR ALL USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Workouts utente" ON public.user_workouts;
CREATE POLICY "Workouts utente" ON public.user_workouts FOR ALL USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Sottoscrizioni utente" ON public.subscriptions;
CREATE POLICY "Sottoscrizioni utente" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Programmi ed esercizi visibili a tutti
DROP POLICY IF EXISTS "Programmi visibili" ON public.workout_programs;
CREATE POLICY "Programmi visibili" ON public.workout_programs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Esercizi visibili" ON public.exercises;
CREATE POLICY "Esercizi visibili" ON public.exercises FOR SELECT USING (true);

-- ============================================================
-- SEED DATA: PROGRAMMI VERTICAM ITALIA
-- ============================================================
INSERT INTO public.workout_programs (slug, title, description, category, duration_weeks)
VALUES
    ('salto-8-settimane', 'Protocollo Base: +10-15cm in 8 Settimane', 'Adattamento tendine d''Achille, stiffness caviglia e potenza esplosiva per schiacciatori e centrali.', 'plyo_main', 8),
    ('ginocchia-protette', 'Protezione Tendine Rotuleo (Jumper''s Knee)', 'Rinforzo isometrico ed eccentrico per eliminare il dolore rotuleo nel volley.', 'knee_rehab', 6),
    ('home-plyo', 'Pliometria Indoor a Corpo Libero', 'Allenamento esplosivo ad alta intensità senza sovraccarichi né attrezzi.', 'home_no_gear', 4),
    ('warmup-pre-partita', 'Attivazione Neurale Pre-Gara (PAP)', 'Potenziazione post-attivazione per saltare al massimo fin dal primo set.', 'pre_match', 1)
ON CONFLICT (slug) DO NOTHING;

-- Collega il profilo dell'utente test
INSERT INTO public.profiles (user_id, email, full_name, position, training_level, height_cm, weight_kg, standing_reach_cm, initial_jump_cm, current_record_cm, is_subscribed)
SELECT 
    id, 
    'felipemartins008@gmail.com', 
    'Felipe Martins', 
    'outside', 
    'advanced', 
    188, 
    80, 
    242, 
    55, 
    62, 
    true
FROM auth.users
WHERE email = 'felipemartins008@gmail.com'
ON CONFLICT DO NOTHING;
