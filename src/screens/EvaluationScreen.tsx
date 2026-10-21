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
  Camera,
  TrendingUp,
  Flame,
  Zap,
  Target,
  Trophy,
  Calendar,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useApp } from '../context/AppContext';
import { t } from '../services/i18n';
import { getJumpBenchmark } from '../utils/jumpPhysics';

const { width } = Dimensions.get('window');

export const EvaluationScreen: React.FC = () => {
  const { jumpHistory, latestJumpResult, userProfile, navigate } = useApp();

  const currentJump = latestJumpResult?.jumpHeightCm || userProfile.currentJumpCm || 61.8;
  const initialJump = userProfile.initialJumpCm || 52.0;
  const totalGain = Math.max(0, Math.round((currentJump - initialJump) * 10) / 10);
  const benchmark = getJumpBenchmark(currentJump);

  // Zabezpieczenie danych historii do wykresu
  const testsToDisplay = jumpHistory.length > 0 ? jumpHistory : [
    { id: '1', date: '15.08', jumpHeightCm: 52.0, flightTimeSeconds: 0.65 },
    { id: '2', date: '01.09', jumpHeightCm: 56.4, flightTimeSeconds: 0.68 },
    { id: '3', date: '12.09', jumpHeightCm: 59.2, flightTimeSeconds: 0.70 },
    { id: '4', date: 'Oggi', jumpHeightCm: currentJump, flightTimeSeconds: 0.71 },
  ];

  const maxVal = Math.max(...testsToDisplay.map((t: any) => t.jumpHeightCm), 70);

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Tytuł sekcji */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>{t('evaluations.title')}</Text>
          <Text style={styles.pageSub}>Monitora il tuo sviluppo biomeccanico e la potenza di salto</Text>
        </View>

        {/* Duży Przycisk CTA: Wykonaj Nowy Test z Kamery */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.bigCameraTrigger}
          onPress={() => navigate('JumpInstruction')}
        >
          <View style={styles.cameraIconCircle}>
            <Camera size={28} color="#0F172A" />
          </View>
          <View style={styles.cameraTriggerTextWrap}>
            <Text style={styles.cameraTriggerTitle}>{t('evaluations.newTestCta')}</Text>
            <Text style={styles.cameraTriggerSub}>Misurazione del tempo di volo 60 FPS con telecamera</Text>
          </View>
          <ArrowUpRight size={22} color="#0F172A" strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Karta Ostatniego Wyniku */}
        <Card style={styles.latestCard} highlighted>
          <View style={styles.latestHeader}>
            <View style={styles.badgeWrapper}>
              <Flame size={14} color="#0F172A" />
              <Text style={styles.badgeText}>{t('evaluations.latestTest')}</Text>
            </View>
            <Text style={styles.latestDate}>
              {latestJumpResult?.date || 'Ultima sessione'}
            </Text>
          </View>

          <View style={styles.scoreRow}>
            <View style={styles.scoreCol}>
              <Text style={styles.scoreBigNum}>{currentJump.toFixed(1)}</Text>
              <Text style={styles.scoreUnit}>cm</Text>
            </View>

            <View style={styles.statsSummaryPill}>
              <TrendingUp size={16} color={Colors.accentGreen} />
              <Text style={styles.gainText}>+{totalGain} cm dall'inizio</Text>
            </View>
          </View>

          <View style={styles.benchmarkLine}>
            <Text style={[styles.benchmarkTitle, { color: benchmark.color }]}>
              {benchmark.levelLabel}
            </Text>
          </View>
        </Card>

        {/* Wykres Progresu (Wzrost Wyskoku w czasie) */}
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <TrendingUp size={20} color={Colors.primary} />
            <Text style={styles.chartTitle}>{t('evaluations.historyTitle')}</Text>
          </View>

          {/* Słupkowy wykres progresu */}
          <View style={styles.chartBarsContainer}>
            {testsToDisplay.map((item: any, idx: number) => {
              const heightPercent = Math.min(100, Math.round((item.jumpHeightCm / maxVal) * 100));
              const isLast = idx === testsToDisplay.length - 1;

              return (
                <View key={item.id || idx} style={styles.barColumn}>
                  <Text style={[styles.barValue, isLast && styles.barValueActive]}>
                    {item.jumpHeightCm.toFixed(1)}
                  </Text>

                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { height: `${heightPercent}%` },
                        isLast && styles.barFillActive,
                      ]}
                    />
                  </View>

                  <Text style={[styles.barLabel, isLast && styles.barLabelActive]}>
                    {item.date?.slice(5) || `P${idx + 1}`}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.chartFooter}>
            <View style={styles.legendDot} />
            <Text style={styles.legendText}>Wysokość wyskoku z czasu lotu (cm)</Text>
          </View>
        </Card>

        {/* 3 Kluczowe Wskaźniki */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statBoxLabel}>SALTO INICIAL</Text>
            <Text style={styles.statBoxNum}>{initialJump.toFixed(1)} cm</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statBoxLabel}>REKORD</Text>
            <Text style={[styles.statBoxNum, { color: Colors.primary }]}>
              {currentJump.toFixed(1)} cm
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statBoxLabel}>ZYSK ŁĄCZNY</Text>
            <Text style={[styles.statBoxNum, { color: Colors.accentGreen }]}>
              +{totalGain} cm
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 30,
  },
  pageHeader: {
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  pageSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bigCameraTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 16,
    gap: 14,
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  cameraIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraTriggerTextWrap: {
    flex: 1,
  },
  cameraTriggerTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  cameraTriggerSub: {
    color: '#1E293B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  latestCard: {
    padding: 18,
    marginBottom: 16,
  },
  latestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  badgeText: {
    color: '#0F172A',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  latestDate: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  scoreCol: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  scoreBigNum: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.textPrimary,
    lineHeight: 52,
  },
  scoreUnit: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  statsSummaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: 8,
  },
  gainText: {
    color: Colors.accentGreen,
    fontWeight: '800',
    fontSize: 13,
  },
  benchmarkLine: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  benchmarkTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  chartCard: {
    padding: 18,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  chartTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  chartBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    paddingHorizontal: 10,
    marginBottom: 14,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barValue: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  barValueActive: {
    color: Colors.primary,
    fontWeight: '900',
  },
  barTrack: {
    width: 24,
    height: 100,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  barFill: {
    width: '100%',
    backgroundColor: Colors.cardBorder,
    borderRadius: 12,
  },
  barFillActive: {
    backgroundColor: Colors.primary,
  },
  barLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
  },
  barLabelActive: {
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  chartFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  legendText: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  statBoxLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statBoxNum: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '900',
  },
});
