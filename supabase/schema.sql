-- ============================================================
-- SIATKAJUMP AI - SCHEMA BAZY DANYCH SUPABASE (POSTGRESQL)
-- ============================================================

-- 1. TABELA PROFILI ZAWODNIKÓW (PROFILES)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    position TEXT CHECK (position IN ('outside', 'opposite', 'middle', 'setter', 'libero', 'beach')),
    training_level TEXT CHECK (training_level IN ('beginner', 'intermediate', 'advanced')),
    pain_points TEXT[] DEFAULT '{}', -- np. ['jumper_knee', 'higher_jump']
    age INTEGER,
    height_cm NUMERIC(5,1),
    weight_kg NUMERIC(5,1),
    standing_reach_cm NUMERIC(5,1), -- zasięg stojąc
    initial_jump_cm NUMERIC(5,1),   -- pierwszy skok
    current_record_cm NUMERIC(5,1), -- aktualny rekord
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELA TESTÓW WYSKOKU (JUMP_TESTS)
CREATE TABLE IF NOT EXISTS public.jump_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    flight_time_seconds NUMERIC(5,3) NOT NULL, -- t np. 0.710 s
    jump_height_cm NUMERIC(5,1) NOT NULL,      -- h = (9.81 * t^2 / 8) * 100
    attack_reach_cm NUMERIC(5,1) NOT NULL,     -- zasięg w ataku
    standing_reach_cm NUMERIC(5,1) NOT NULL,
    video_url TEXT,
    fps INTEGER DEFAULT 60,
    is_personal_record BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA PROGRAMÓW TRENINGOWYCH (WORKOUT_PROGRAMS)
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

-- 4. TABELA ĆWICZEŃ (EXERCISES)
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES public.workout_programs(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    polish_name TEXT NOT NULL,
    focus_area TEXT NOT NULL, -- 'Reaktywność ścięgien', 'Więzadło rzepki', 'Moc eksplozywna'
    default_sets INTEGER NOT NULL DEFAULT 3,
    default_reps INTEGER NOT NULL DEFAULT 8,
    suggested_weight TEXT DEFAULT 'Masa ciała',
    rest_seconds INTEGER NOT NULL DEFAULT 60,
    video_url TEXT,
    instructions TEXT[],
    order_index INTEGER DEFAULT 1
);

-- 5. HISTORIA UKOŃCZONYCH TRENINGÓW (USER_WORKOUTS)
CREATE TABLE IF NOT EXISTS public.user_workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    program_id UUID REFERENCES public.workout_programs(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    duration_minutes INTEGER DEFAULT 45,
    notes TEXT
);

-- 6. SUBSKRYPCJE I PŁATNOŚCI (SUBSCRIPTIONS)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type TEXT CHECK (plan_type IN ('annual', 'monthly')) NOT NULL,
    amount_pln NUMERIC(6,2) NOT NULL, -- 349.00 lub 49.00
    payment_method TEXT, -- 'BLIK', 'APPLE_PAY', 'GOOGLE_PAY', 'CARD'
    status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')) NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- POLITYKI BEZPIECZEŃSTWA (ROW LEVEL SECURITY - RLS)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jump_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Użytkownik ma dostęp tylko do swojego profilu"
    ON public.profiles FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Użytkownik widzi i dodaje własne testy wyskoku"
    ON public.jump_tests FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Użytkownik widzi swoje ukończone treningi"
    ON public.user_workouts FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Użytkownik widzi swoją subskrypcję"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Programy i ćwiczenia są publicznie czytelne dla zalogowanych
ALTER TABLE public.workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Każdy zalogowany widzi programy treningowe"
    ON public.workout_programs FOR SELECT
    TO authenticated USING (true);

CREATE POLICY "Każdy zalogowany widzi ćwiczenia"
    ON public.exercises FOR SELECT
    TO authenticated USING (true);

-- ============================================================
-- DANE POCZĄTKOWE (SEED DATA: PROGRAMY I ĆWICZENIA)
-- ============================================================
INSERT INTO public.workout_programs (slug, title, description, category, duration_weeks)
VALUES
    ('wyskok-8-tygodni', 'Główny Program: Wyskok 8 Tygodni', 'Ukierunkowany na adaptację ścięgna Achillesa i moc eksplozywną w ataku.', 'plyo_main', 8),
    ('zdrowe-kolana', 'Zdrowe Kolana (Profilaktyka Kolana Skoczka)', 'Izometryczne i ekscentryczne wzmocnienie więzadła rzepki.', 'knee_rehab', 6),
    ('trening-domowy', 'Trening w Domu (Bez sprzętu)', 'Trening plyometrii bez wyposażenia dla siatkarzy.', 'home_no_gear', 4),
    ('rozgrzewka-mecz', 'Rozgrzewka Przed Meczem', 'Potencjacja powysiłkowa (PAP) i aktywacja przed pierwszym gwizdkiem.', 'pre_match', 1)
ON CONFLICT (slug) DO NOTHING;
