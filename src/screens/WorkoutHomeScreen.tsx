import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Platform, Image,
} from 'react-native';
import {
  Zap, Menu, Play, Clock, Flame, ShieldCheck,
  Home, Dumbbell, BarChart2, ChevronRight, Activity,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { WORKOUT_MODULES } from '../data/mockData';
import { WorkoutModule } from '../types';
import { VertiCamLogo } from '../components/VertiCamLogo';

const WEEK_DAYS = [
  { label: 'LUN', day: 28, isSelected: true },
  { label: 'MAR', day: 29, isSelected: false },
  { label: 'MER', day: 30, isSelected: false },
  { label: 'GIO', day: 1, isSelected: false },
  { label: 'VEN', day: 2, isSelected: false },
  { label: 'SAB', day: 3, isSelected: false },
  { label: 'DOM', day: 4, isSelected: false },
];

export const WorkoutHomeScreen: React.FC = () => {
  const { startWorkout, navigate, userProfile, jumpHistory, dailyPrescription } = useApp();
  const todayWorkout = WORKOUT_MODULES[0];
  const streakDays = jumpHistory.length;

  const athleteName = userProfile?.fullName ? userProfile.fullName.split(' ')[0] : 'Filippo';

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── TOP BAR (VERTICAM BRANDED) ── */}
        <View style={styles.topBarCard}>
          <VertiCamLogo size="small" variant="image" />

          {/* Quick Check-in CTA button */}
          <TouchableOpacity
            style={styles.checkinQuickBtn}
            activeOpacity={0.75}
            onPress={() => navigate('DailyCheckin')}
          >
            <Activity size={15} color={Colors.primary} />
            <Text style={styles.checkinQuickText}>Check-in SNC</Text>
          </TouchableOpacity>
        </View>

        {/* ── SAUDAÇÃO ── */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingSub}>Ciao, pronto ad allenarti?</Text>
          <Text style={styles.greetingName}>{athleteName} 👋</Text>
        </View>

        {/* ── CARD DE DIAS / ROTINA (ESTILO BTPRIME) ── */}
        <View style={styles.daysCard}>
          <View style={styles.daysHeader}>
            <View style={styles.daysCounterRow}>
              <Text style={styles.daysCountBig}>{streakDays}</Text>
              <Text style={styles.daysUnit}> {streakDays === 1 ? 'giorno' : 'giorni'}</Text>
            </View>
            <Text style={styles.daysSubtext}>Allenati e guadagna una palla</Text>
          </View>

          {/* Calendário Semanal */}
          <View style={styles.weekCalendarRow}>
            {WEEK_DAYS.map((item, idx) => (
              <View key={idx} style={styles.weekDayCol}>
                <Text style={styles.weekDayLabel}>{item.label}</Text>
                <View
                  style={[
                    styles.weekDayCircle,
                    item.isSelected && styles.weekDayCircleSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.weekDayNumber,
                      item.isSelected && styles.weekDayNumberSelected,
                    ]}
                  >
                    {item.day}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── CARD CTA: MONTE SUA ROTINA PERSONALIZADA ── */}
        <View style={styles.ctaCard}>
          {/* Brilho de fundo sutil */}
          <View style={styles.ctaGlow} />

          {/* Dois ícones circulares no topo */}
          <View style={styles.ctaIconsRow}>
            <View style={styles.iconCircleGreen}>
              <Zap size={22} color="#A3E635" />
            </View>
            <View style={styles.iconCircleOrange}>
              <Activity size={22} color="#F97316" />
            </View>
          </View>

          {/* Título e descrição centralizados */}
          <Text style={styles.ctaTitle}>Crea la tua routine personalizzata</Text>
          <Text style={styles.ctaDescription}>
            Rispondi a poche domande rapide e genereremo un programma di allenamento su misura per te.
          </Text>

          {/* Botão de ação Laranja vibrante */}
          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.85}
            onPress={() => navigate('DailyCheckin')}
          >
            <Text style={styles.ctaButtonText}>
              {dailyPrescription ? `Vedi Check-in (Zona ${dailyPrescription.readiness.zone}) →` : 'Crea la Mia Routine →'}
            </Text>
          </TouchableOpacity>

          {/* Avatar flutuante no canto inferior direito com aro brilhante */}
          <View style={styles.floatingAvatarWrap}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' }}
              style={styles.floatingAvatarImg}
            />
          </View>
        </View>

        {/* ── SEÇÃO DE PROGRAMAS / TREINOS ── */}
        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionHeadingText}>PROGRAMMI DI ALLENAMENTO</Text>
        </View>

        {/* Card do treino de hoje */}
        <TouchableOpacity
          style={styles.workoutItemCard}
          activeOpacity={0.85}
          onPress={() => startWorkout(todayWorkout)}
        >
          <View style={styles.workoutItemLeft}>
            <View style={styles.workoutItemBadge}>
              <Flame size={12} color="#0B1121" />
              <Text style={styles.workoutItemBadgeText}>OGGI</Text>
            </View>
            <Text style={styles.workoutItemTitle}>{todayWorkout.title}</Text>
            <View style={styles.workoutItemMeta}>
              <Clock size={12} color="#94A3B8" />
              <Text style={styles.workoutItemMetaText}>{todayWorkout.durationMinutes} min</Text>
              <Text style={styles.workoutItemMetaDivider}>•</Text>
              <Dumbbell size={12} color="#94A3B8" />
              <Text style={styles.workoutItemMetaText}>{todayWorkout.exercises.length} esercizi</Text>
            </View>
          </View>
          <View style={styles.workoutPlayIcon}>
            <Play size={18} color="#0B1121" fill="#0B1121" />
          </View>
        </TouchableOpacity>

        {/* Outros módulos */}
        {WORKOUT_MODULES.slice(1).map((module: WorkoutModule) => (
          <TouchableOpacity
            key={module.id}
            activeOpacity={0.85}
            style={styles.secondaryModuleCard}
            onPress={() => startWorkout(module)}
          >
            <View style={styles.secondaryModuleLeft}>
              <View style={styles.secondaryModuleIconBox}>
                <Flame size={18} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.secondaryModuleTitle}>{module.title}</Text>
                <Text style={styles.secondaryModuleDesc} numberOfLines={1}>
                  {module.durationMinutes} min • {module.exercises.length} esercizi
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color="#64748B" />
          </TouchableOpacity>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0D14',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : 12,
    paddingBottom: 20,
  },

  // Top Bar Card
  topBarCard: {
    backgroundColor: '#121824',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
  },
  checkinQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  checkinQuickText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Saudação
  greetingContainer: {
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  greetingSub: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 2,
  },
  greetingName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },

  // Card de Dias / Rotina
  daysCard: {
    backgroundColor: '#111722',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 16,
  },
  daysHeader: {
    marginBottom: 16,
  },
  daysCounterRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  daysCountBig: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 48,
  },
  daysUnit: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
  },
  daysSubtext: {
    fontSize: 13,
    fontWeight: '700',
    color: '#38BDF8',
    marginTop: 2,
  },
  weekCalendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekDayCol: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  weekDayLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
  },
  weekDayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayCircleSelected: {
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  weekDayNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  weekDayNumberSelected: {
    color: '#FFFFFF',
    fontWeight: '900',
  },

  // Card CTA: Monte sua rotina personalizada
  ctaCard: {
    backgroundColor: '#121926',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 20,
  },
  ctaGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(249, 115, 22, 0.08)',
  },
  ctaIconsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  iconCircleGreen: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#A3E635',
    backgroundColor: 'rgba(163, 230, 53, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleOrange: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#F97316',
    backgroundColor: 'rgba(249, 115, 22, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaDescription: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  ctaButton: {
    backgroundColor: '#F97316',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  floatingAvatarWrap: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    padding: 2,
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  floatingAvatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },

  // Seção de Programas
  sectionHeadingRow: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionHeadingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1.2,
  },

  // Card Treino de Hoje
  workoutItemCard: {
    backgroundColor: '#0F1726',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  workoutItemLeft: {
    flex: 1,
    gap: 4,
  },
  workoutItemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    alignSelf: 'flex-start' as any,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  workoutItemBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.primary,
  },
  workoutItemTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  workoutItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workoutItemMetaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  workoutItemMetaDivider: {
    color: '#475569',
  },
  workoutPlayIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },

  // Módulos Secundários
  secondaryModuleCard: {
    backgroundColor: '#0F1726',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  secondaryModuleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  secondaryModuleIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryModuleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  secondaryModuleDesc: {
    fontSize: 12,
    color: '#64748B',
  },
});
