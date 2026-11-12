import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Zap,
  Play,
  ShieldCheck,
  Calendar,
  Sparkles,
  Flame,
  Activity,
  Dumbbell,
  Check,
  ArrowRight,
  TrendingUp,
  Camera,
  Globe,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { VertiCamLogo } from '../components/VertiCamLogo';
import { t } from '../services/i18n';

export const WorkoutHomeScreen: React.FC = () => {
  const { navigate, userProfile, athleteBaseline, jumpHistory, language, setLanguage } = useApp();

  const athleteName = userProfile?.fullName ? userProfile.fullName.split(' ')[0] : (language === 'pt' ? 'Atleta' : 'Atleta');
  const isCalibrated = Boolean(userProfile.hasCompletedInitialEvaluation || jumpHistory.length > 0);
  const hasWorkoutDays = Boolean(userProfile.workoutDays && userProfile.workoutDays.length > 0);
  const workoutDays = userProfile.workoutDays || [];

  // Dia atual (0 = Dom, 1 = Seg, 2 = Ter, ...)
  const todayDayIndex = new Date().getDay();
  const isTodayWorkoutDay = workoutDays.includes(todayDayIndex);

  const daysList = language === 'pt' ? [
    { id: 1, label: 'SEG', name: 'Segunda-feira' },
    { id: 2, label: 'TER', name: 'Terça-feira' },
    { id: 3, label: 'QUA', name: 'Quarta-feira' },
    { id: 4, label: 'QUI', name: 'Quinta-feira' },
    { id: 5, label: 'SEX', name: 'Sexta-feira' },
    { id: 6, label: 'SÁB', name: 'Sábado' },
    { id: 0, label: 'DOM', name: 'Domingo' },
  ] : [
    { id: 1, label: 'LUN', name: 'Lunedì' },
    { id: 2, label: 'MAR', name: 'Martedì' },
    { id: 3, label: 'MER', name: 'Mercoledì' },
    { id: 4, label: 'GIO', name: 'Giovedì' },
    { id: 5, label: 'VEN', name: 'Venerdì' },
    { id: 6, label: 'SAB', name: 'Sabato' },
    { id: 0, label: 'DOM', name: 'Domenica' },
  ];

  // Carga OPL estimada (apenas quando calibrado com peso real)
  const athleteWeight = userProfile.weightKg || athleteBaseline.user_weight || 0;
  const initialLoadKg = athleteWeight > 0 ? Math.round(athleteWeight * 0.20) : 0;
  const baselineCmj = athleteBaseline.baseline_cmj_height || userProfile.initialJumpCm || 0;

  const windowWidth = Dimensions.get('window').width;
  const isDesktop = windowWidth >= 768;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, isDesktop && styles.scrollContentDesktop]}
      >
        {/* ── HEADER BRAND & LANGUAGE SWITCH ── */}
        <View style={styles.topHeader}>
          <VertiCamLogo size="small" variant="badge" />
          <View style={styles.headerRightActions}>
            <TouchableOpacity
              onPress={() => setLanguage(language === 'pt' ? 'it' : 'pt')}
              style={styles.langHeaderToggle}
              activeOpacity={0.8}
            >
              <Text style={styles.langHeaderToggleText}>{language === 'pt' ? '🇧🇷 PT' : '🇮🇹 IT'}</Text>
            </TouchableOpacity>

            <View style={[styles.liveSncBadge, !isCalibrated && { backgroundColor: 'rgba(245, 158, 11, 0.12)', borderColor: 'rgba(245, 158, 11, 0.25)' }]}>
              <Activity size={12} color={isCalibrated ? '#10B981' : '#F59E0B'} />
              <Text style={[styles.liveSncText, !isCalibrated && { color: '#F59E0B' }]}>
                {isCalibrated
                  ? t('workoutHome.liveSnc')
                  : (language === 'pt' ? 'CALIBRAÇÃO PENDENTE' : 'CALIBRAZIONE IN CORSO')}
              </Text>
            </View>
          </View>
        </View>

        {/* ── SAUDAÇÃO ── */}
        <View style={styles.greetingBox}>
          <Text style={styles.greetingSub}>{t('workoutHome.greeting')}</Text>
          <Text style={styles.greetingTitle}>{athleteName} 👋</Text>
        </View>

        {/* ── NOVO ATLETA: ONBOARDING E AVALIAÇÃO INICIAL OBRIGATÓRIA ── */}
        {!isCalibrated ? (
          <View style={styles.newAthleteCard}>
            <View style={styles.newAthleteHeader}>
              <View style={styles.cameraIconCircle}>
                <Camera size={22} color="#000000" strokeWidth={2.5} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.newAthleteCategory}>
                  {language === 'pt' ? 'PRIMEIRO PASSO OBRIGATÓRIO' : 'PRIMO PASSO OBBLIGATORIO'}
                </Text>
                <Text style={styles.newAthleteTitle}>
                  {!hasWorkoutDays
                    ? (language === 'pt' ? 'Configure sua rotina e faça sua avaliação inicial' : 'Configura la tua routine e fai la valutazione iniziale')
                    : t('workoutHome.newAthleteTitle')}
                </Text>
              </View>
            </View>

            <Text style={styles.newAthleteDesc}>
              {language === 'pt'
                ? 'Seu perfil está limpo e pronto. Escolha seus dias de treino e realize seu primeiro teste de salto na câmera para desbloquear sua carga OPL e prescrição científica.'
                : 'Il tuo profilo è pronto. Scegli i tuoi giorni di allenamento ed esegui il primo test di salto con la fotocamera per sbloccare il carico OPL e la prescrizione scientifica.'}
            </Text>

            <TouchableOpacity
              style={styles.firstTestButton}
              onPress={() => navigate(!hasWorkoutDays ? 'OnboardingTutorial' : 'BaselineEvaluation')}
              activeOpacity={0.88}
            >
              <Camera size={18} color="#000000" strokeWidth={2.5} />
              <Text style={styles.firstTestButtonText}>
                {!hasWorkoutDays
                  ? (language === 'pt' ? 'CONFIGURAR DIAS E AVALIAR' : 'CONFIGURA GIORNI E VALUTA')
                  : (language === 'pt' ? 'FAZER AVALIAÇÃO INICIAL' : 'ESEGUI VALUTAZIONE INIZIALE')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* ── ROTINA SEMANAL DE TREINOS ── */}
            <View style={styles.routineCard}>
              <View style={styles.routineHeaderRow}>
                <View>
                  <Text style={styles.routineCategory}>{t('workoutHome.routineCategory')}</Text>
                  <Text style={styles.routineTitle}>{t('workoutHome.routineTitle')}</Text>
                </View>
                <View style={styles.routineDaysPill}>
                  <Text style={styles.routineDaysPillText}>
                    {t('workoutHome.timesPerWeek', { count: workoutDays.length })}
                  </Text>
                </View>
              </View>

              {/* Grade Dias da Semana */}
              <View style={styles.weekGrid}>
                {daysList.map((day) => {
                  const isWorkout = workoutDays.includes(day.id);
                  const isToday = day.id === todayDayIndex;

                  return (
                    <View
                      key={day.id}
                      style={[
                        styles.dayColItem,
                        isWorkout && styles.dayColItemWorkout,
                        isToday && styles.dayColItemToday,
                      ]}
                    >
                      <Text style={[styles.dayColLabel, isToday && styles.dayColLabelToday]}>
                        {day.label}
                      </Text>
                      <View
                        style={[
                          styles.dayColCircle,
                          isWorkout && styles.dayColCircleWorkout,
                          isToday && styles.dayColCircleToday,
                        ]}
                      >
                        {isWorkout ? (
                          <Dumbbell size={13} color={isToday ? '#000000' : Colors.primary} strokeWidth={2.5} />
                        ) : (
                          <View style={styles.restDash} />
                        )}
                      </View>
                      <Text style={[styles.dayColSub, isToday && styles.dayColSubToday]}>
                        {isWorkout ? (language === 'pt' ? 'Treino' : 'Allenamento') : (language === 'pt' ? 'Descanso' : 'Riposo')}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* ── CARD PRINCIPAL: TREINO DO DIA ── */}
            <View style={styles.todayCard}>
              <View style={styles.todayCardHeader}>
                <View style={[styles.statusBadge, isTodayWorkoutDay ? styles.statusBadgeGreen : styles.statusBadgeBlue]}>
                  <Text style={styles.statusBadgeText}>
                    {language === 'pt'
                      ? (isTodayWorkoutDay ? '🟢 HOJE: SESSÃO DE POTÊNCIA BALÍSTICA' : '🔵 HOJE: RECUPERAÇÃO NEURAL SNC')
                      : (isTodayWorkoutDay ? '🟢 OGGI: SESSIONE DI POTENZA BALISTICA' : '🔵 OGGI: RECUPERO NEURALE SNC')}
                  </Text>
                </View>
              </View>

              <Text style={styles.exerciseMainName}>
                {language === 'pt' ? 'Salto com Sobrecarga (Loaded Jump)' : 'Salto con Sovraccarico (Loaded Jump)'}
              </Text>
              <Text style={styles.exerciseSubtitle}>
                {language === 'pt'
                  ? 'Método Científico Prof. Irineu Loturco • Autoregulação da velocidade'
                  : 'Metodo Scientifico Prof. Irineu Loturco • Autoregolazione della velocità'}
              </Text>

              {/* Especificações da Sessão */}
              <View style={styles.exerciseSpecsGrid}>
                <View style={styles.specBox}>
                  <Text style={styles.specLabel}>{language === 'pt' ? 'AQUECIMENTO' : 'RISCALDAMENTO'}</Text>
                  <Text style={styles.specValue}>{language === 'pt' ? '3x10 Agachamento' : '3x10 Squat'}</Text>
                </View>

                <View style={styles.specBox}>
                  <Text style={styles.specLabel}>{language === 'pt' ? 'CHECK NEURAL' : 'CHECK NEURALE'}</Text>
                  <Text style={styles.specValue}>{language === 'pt' ? '1x CMJ Câmera' : '1x CMJ Videocamera'}</Text>
                </View>

                <View style={styles.specBox}>
                  <Text style={styles.specLabel}>{language === 'pt' ? 'CARGA OPL' : 'CARICO OPL'}</Text>
                  <Text style={[styles.specValue, { color: Colors.primary }]}>
                    {initialLoadKg > 0 ? `${initialLoadKg} kg` : '--'}
                  </Text>
                </View>
              </View>

              {/* Banner Método Loturco */}
              <View style={styles.loturcoBanner}>
                <ShieldCheck size={14} color={Colors.primary} />
                <Text style={styles.loturcoBannerText}>
                  {language === 'pt'
                    ? 'A câmera monitora cada repetição. Se a altura cair mais de 10%, a série encerra automaticamente para preservar o sistema nervoso central.'
                    : 'La telecamera monitora ogni singola ripetizione. Se l\'elevazione cala oltre il 10%, la serie termina in automatico per preservare il sistema nervoso centrale.'}
                </Text>
              </View>

              {/* Botão de Iniciar Treino */}
              <TouchableOpacity
                style={styles.startWorkoutButton}
                onPress={() => navigate('LoturcoWorkout')}
                activeOpacity={0.88}
              >
                <Play size={18} color="#000000" fill="#000000" />
                <Text style={styles.startWorkoutButtonText}>
                  {language === 'pt'
                    ? (isTodayWorkoutDay ? 'INICIAR TREINO' : 'INICIAR SESSÃO MESMO ASSIM')
                    : (isTodayWorkoutDay ? 'INIZIA ALLENAMENTO' : 'INIZIA COMUNQUE LA SESSIONE')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── CARD LINHA DE BASE ATUAL ── */}
            <View style={styles.baselineStatusCard}>
              <View style={styles.baselineHeader}>
                <TrendingUp size={16} color={Colors.primary} />
                <Text style={styles.baselineTitle}>
                  {language === 'pt' ? 'Sua Baseline Atual' : 'La Tua Baseline Attuale'}
                </Text>
              </View>

              <View style={styles.baselineMetricsRow}>
                <View style={styles.baselineMetricItem}>
                  <Text style={styles.baselineMetricLabel}>{language === 'pt' ? 'ALTURA CMJ' : 'ELEVAZIONE CMJ'}</Text>
                  <Text style={styles.baselineMetricValue}>{baselineCmj > 0 ? `${baselineCmj} cm` : '-- cm'}</Text>
                </View>

                <View style={styles.baselineDivider} />

                <View style={styles.baselineMetricItem}>
                  <Text style={styles.baselineMetricLabel}>{language === 'pt' ? 'ÍNDICE EUR' : 'INDICE EUR'}</Text>
                  <Text style={styles.baselineMetricValue}>
                    {athleteBaseline.eur_ratio > 0 ? athleteBaseline.eur_ratio.toFixed(2) : '--'}
                  </Text>
                </View>

                <View style={styles.baselineDivider} />

                <View style={styles.baselineMetricItem}>
                  <Text style={styles.baselineMetricLabel}>{language === 'pt' ? 'PRÓXIMO TESTE' : 'PROSSIMO TEST'}</Text>
                  <Text style={styles.baselineMetricValue}>{language === 'pt' ? '30 dias' : '30 giorni'}</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070F',
  },
  scrollContent: {
    padding: 16,
    paddingVertical: 20,
    gap: 16,
  },
  scrollContentDesktop: {
    maxWidth: 680,
    alignSelf: 'center',
    width: '100%',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  liveSncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  liveSncText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  greetingBox: {
    marginTop: 4,
  },
  greetingSub: {
    fontSize: 13,
    color: '#94A3B8',
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },

  // Routine
  routineCard: {
    backgroundColor: '#0D111F',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 14,
  },
  routineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  routineCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  routineTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  routineDaysPill: {
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  routineDaysPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  weekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  dayColItem: {
    flex: 1,
    backgroundColor: '#12172A',
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  dayColItemWorkout: {
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  dayColItemToday: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
  },
  dayColLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  dayColLabelToday: {
    color: Colors.primary,
  },
  dayColCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayColCircleWorkout: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
  },
  dayColCircleToday: {
    backgroundColor: Colors.primary,
  },
  restDash: {
    width: 8,
    height: 2,
    backgroundColor: '#475569',
    borderRadius: 1,
  },
  dayColSub: {
    fontSize: 8,
    fontWeight: '600',
    color: '#64748B',
  },
  dayColSubToday: {
    color: '#E2E8F0',
  },

  // Today Card
  todayCard: {
    backgroundColor: '#0D111F',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    gap: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  todayCardHeader: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusBadgeGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusBadgeBlue: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  exerciseMainName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  exerciseSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
  },
  exerciseSpecsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  specBox: {
    flex: 1,
    backgroundColor: '#12172A',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  specLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 4,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  loturcoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(0, 229, 255, 0.06)',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  loturcoBannerText: {
    flex: 1,
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  startWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  startWorkoutButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  // Baseline
  baselineStatusCard: {
    backgroundColor: '#0D111F',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  baselineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  baselineTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  baselineMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  baselineMetricItem: {
    alignItems: 'center',
  },
  baselineMetricLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 3,
  },
  baselineMetricValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  baselineDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langHeaderToggle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  langHeaderToggleText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  },
  newAthleteCard: {
    backgroundColor: 'rgba(0, 229, 255, 0.06)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    padding: 18,
    gap: 12,
  },
  newAthleteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cameraIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newAthleteCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  newAthleteTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  newAthleteDesc: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  firstTestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 12,
    marginTop: 4,
  },
  firstTestButtonText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
});
