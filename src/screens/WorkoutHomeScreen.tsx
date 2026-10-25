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
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { VertiCamLogo } from '../components/VertiCamLogo';

export const WorkoutHomeScreen: React.FC = () => {
  const { navigate, userProfile, athleteBaseline } = useApp();

  const athleteName = userProfile?.fullName ? userProfile.fullName.split(' ')[0] : 'Atleta';
  const workoutDays = userProfile.workoutDays || [1, 3, 5]; // Padrão: Segunda, Quarta, Sexta

  // Dia atual (0 = Dom, 1 = Seg, 2 = Ter, ...)
  const todayDayIndex = new Date().getDay();
  const isTodayWorkoutDay = workoutDays.includes(todayDayIndex);

  const daysList = [
    { id: 1, label: 'SEG', name: 'Segunda' },
    { id: 2, label: 'TER', name: 'Terça' },
    { id: 3, label: 'QUA', name: 'Quarta' },
    { id: 4, label: 'QUI', name: 'Quinta' },
    { id: 5, label: 'SEX', name: 'Sexta' },
    { id: 6, label: 'SÁB', name: 'Sábado' },
    { id: 0, label: 'DOM', name: 'Domingo' },
  ];

  // Carga OPL estimada
  const athleteWeight = userProfile.weightKg || athleteBaseline.user_weight || 78;
  const initialLoadKg = Math.round(athleteWeight * 0.20);
  const baselineCmj = athleteBaseline.baseline_cmj_height || 52.0;

  const windowWidth = Dimensions.get('window').width;
  const isDesktop = windowWidth >= 768;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, isDesktop && styles.scrollContentDesktop]}
      >
        {/* ── HEADER BRAND ── */}
        <View style={styles.topHeader}>
          <VertiCamLogo size="small" variant="badge" />
          <View style={styles.liveSncBadge}>
            <Activity size={12} color="#10B981" />
            <Text style={styles.liveSncText}>SNC PRONTO</Text>
          </View>
        </View>

        {/* ── SAUDAÇÃO ── */}
        <View style={styles.greetingBox}>
          <Text style={styles.greetingSub}>Bem-vindo de volta,</Text>
          <Text style={styles.greetingTitle}>{athleteName} 👋</Text>
        </View>

        {/* ── ROTINA SEMANAL DE TREINOS ── */}
        <View style={styles.routineCard}>
          <View style={styles.routineHeaderRow}>
            <View>
              <Text style={styles.routineCategory}>SUA SEMANA</Text>
              <Text style={styles.routineTitle}>Rotina de Potência Neural</Text>
            </View>
            <View style={styles.routineDaysPill}>
              <Text style={styles.routineDaysPillText}>{workoutDays.length}x na semana</Text>
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
                    {isWorkout ? 'Treino' : 'Descanso'}
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
                {isTodayWorkoutDay ? '🟢 HOJE: DIA DE TREINO BALÍSTICO' : '🔵 HOJE: RECUPERAÇÃO NEURAL SNC'}
              </Text>
            </View>
          </View>

          <Text style={styles.exerciseMainName}>Salto com Carga (Loaded Jump)</Text>
          <Text style={styles.exerciseSubtitle}>
            Método Científico Prof. Irineu Loturco • Autorregulação simultânea da velocidade
          </Text>

          {/* Especificações da Sessão */}
          <View style={styles.exerciseSpecsGrid}>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>AQUECIMENTO</Text>
              <Text style={styles.specValue}>3x10 Squat</Text>
            </View>

            <View style={styles.specBox}>
              <Text style={styles.specLabel}>CHECK NEURAL</Text>
              <Text style={styles.specValue}>1x CMJ Câmera</Text>
            </View>

            <View style={styles.specBox}>
              <Text style={styles.specLabel}>CARGA OPL</Text>
              <Text style={[styles.specValue, { color: Colors.primary }]}>{initialLoadKg} kg</Text>
            </View>
          </View>

          {/* Banner Método Loturco */}
          <View style={styles.loturcoBanner}>
            <ShieldCheck size={14} color={Colors.primary} />
            <Text style={styles.loturcoBannerText}>
              A câmera monitora cada repetição. Se a impulsão cair mais de 10%, a série é encerrada automaticamente para preservar o sistema nervoso central.
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
              {isTodayWorkoutDay ? 'INICIAR TREINO' : 'INICIAR SESSÃO MESMO ASSIM'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── CARD LINHA DE BASE ATUAL ── */}
        <View style={styles.baselineStatusCard}>
          <View style={styles.baselineHeader}>
            <TrendingUp size={16} color={Colors.primary} />
            <Text style={styles.baselineTitle}>Sua Linha de Base Atual</Text>
          </View>

          <View style={styles.baselineMetricsRow}>
            <View style={styles.baselineMetricItem}>
              <Text style={styles.baselineMetricLabel}>IMPULSÃO CMJ</Text>
              <Text style={styles.baselineMetricValue}>{baselineCmj} cm</Text>
            </View>

            <View style={styles.baselineDivider} />

            <View style={styles.baselineMetricItem}>
              <Text style={styles.baselineMetricLabel}>ÍNDICE EUR</Text>
              <Text style={styles.baselineMetricValue}>{athleteBaseline.eur_ratio?.toFixed(2) || '1.08'}</Text>
            </View>

            <View style={styles.baselineDivider} />

            <View style={styles.baselineMetricItem}>
              <Text style={styles.baselineMetricLabel}>PRÓXIMO TESTE</Text>
              <Text style={styles.baselineMetricValue}>30 dias</Text>
            </View>
          </View>
        </View>
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
});
