import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import {
  Trophy,
  Zap,
  Flame,
  ArrowRight,
  TrendingUp,
  Target,
  Sparkles,
  ShieldCheck,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useApp } from '../context/AppContext';
import { t } from '../services/i18n';
import { getJumpBenchmark } from '../utils/jumpPhysics';

export const JumpResultScreen: React.FC = () => {
  const { latestJumpResult, userProfile, navigate } = useApp();

  const flightTime = latestJumpResult?.flightTimeSeconds || 0.71;
  const jumpHeight = latestJumpResult?.jumpHeightCm || 61.8;
  const attackReach = latestJumpResult?.attackReachCm || 315.8;
  const standingReach = latestJumpResult?.standingReachCm || (userProfile.standingReachCm || 254);

  const benchmark = getJumpBenchmark(jumpHeight);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={t('results.title')}
        showBack
        onBack={() => navigate('JumpCamera')}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Odznaka sukcesu */}
        <View style={styles.successBadge}>
          <Sparkles size={16} color={Colors.primary} />
          <Text style={styles.successBadgeText}>{t('results.subtitle')}</Text>
        </View>

        {/* Główna karta wyniku z gigantyczną typografią */}
        <Card style={styles.mainScoreCard} highlighted>
          <View style={styles.scoreHeader}>
            <Flame size={24} color={Colors.primary} />
            <Text style={styles.scoreCategory}>{t('results.jumpHeight')}</Text>
          </View>

          <View style={styles.heroNumberRow}>
            <Text style={styles.heroNumber}>{jumpHeight.toFixed(1)}</Text>
            <Text style={styles.heroUnit}>{t('common.unitCm')}</Text>
          </View>

          {/* Porównanie z poziomem ligowym */}
          <View style={[styles.benchmarkPill, { borderColor: benchmark.color }]}>
            <Text style={[styles.benchmarkLabel, { color: benchmark.color }]}>
              {benchmark.levelLabel}
            </Text>
          </View>
          <Text style={styles.benchmarkDesc}>{benchmark.percentileText}</Text>
        </Card>

        {/* Siatka parametrów biomechanicznych */}
        <View style={styles.metricsGrid}>
          {/* Czas lotu */}
          <View style={styles.metricCard}>
            <Zap size={20} color={Colors.primary} />
            <Text style={styles.gridLabel}>{t('results.flightTime')}</Text>
            <Text style={styles.gridValue}>{flightTime.toFixed(2)} s</Text>
            <Text style={styles.gridSub}>t w powietrzu</Text>
          </View>

          {/* Zasięg w ataku */}
          <View style={styles.metricCard}>
            <Target size={20} color={Colors.secondary} />
            <Text style={styles.gridLabel}>{t('results.attackReach')}</Text>
            <Text style={[styles.gridValue, { color: Colors.secondary }]}>
              {Math.round(attackReach)} cm
            </Text>
            <Text style={styles.gridSub}>stojąc {standingReach} cm</Text>
          </View>
        </View>

        {/* Baner potencjału adaptacyjnego */}
        <Card style={styles.potentialCard}>
          <View style={styles.potentialHeader}>
            <TrendingUp size={20} color={Colors.primary} />
            <Text style={styles.potentialTitle}>Il Tuo Potenziale con VertiCam</Text>
          </View>
          <Text style={styles.potentialText}>
            Con la tua altezza ({userProfile.heightCm} cm) e il tuo ruolo (
            {userProfile.position.toUpperCase()}), l'applicazione della periodizzazione
            pliometrica di 8 settimane ti consentirà di raggiungere:
          </Text>

          <View style={styles.projectionRow}>
            <View style={styles.projectionCol}>
              <Text style={styles.projSmallLabel}>Previsione salto:</Text>
              <Text style={styles.projHighNumber}>
                {(jumpHeight + 8).toFixed(1)} cm
              </Text>
            </View>
            <View style={styles.projectionDivider} />
            <View style={styles.projectionCol}>
              <Text style={styles.projSmallLabel}>Portata in attacco:</Text>
              <Text style={[styles.projHighNumber, { color: Colors.primary }]}>
                {Math.round(attackReach + 8)} cm
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Dolny przycisk przejścia do paywalla */}
      <View style={styles.footer}>
        <Button
          title={t('results.ctaUnlock')}
          variant="primary"
          size="large"
          onPress={() => navigate('Paywall')}
          icon={<ArrowRight size={20} color="#0F172A" strokeWidth={3} />}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    marginBottom: 16,
  },
  successBadgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  mainScoreCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  scoreCategory: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroNumberRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginVertical: 4,
  },
  heroNumber: {
    fontSize: 76,
    fontWeight: '900',
    color: Colors.primary,
    lineHeight: 84,
  },
  heroUnit: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  benchmarkPill: {
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginTop: 8,
    marginBottom: 6,
  },
  benchmarkLabel: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  benchmarkDesc: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  gridLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  gridValue: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  gridSub: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  potentialCard: {
    padding: 18,
  },
  potentialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  potentialTitle: {
    color: Colors.accentGreen,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  potentialText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  projectionRow: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  projectionCol: {
    flex: 1,
    alignItems: 'center',
  },
  projectionDivider: {
    width: 1,
    backgroundColor: Colors.cardBorder,
  },
  projSmallLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  projHighNumber: {
    color: Colors.accentGreen,
    fontSize: 20,
    fontWeight: '900',
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
});
