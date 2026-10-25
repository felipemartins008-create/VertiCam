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
  Calendar,
  Sparkles,
  Flame,
  Activity,
  ShieldCheck,
  Check,
  ArrowRight,
  ChevronRight,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { VertiCamLogo } from '../components/VertiCamLogo';
import { PrescriptionEngine } from '../services/prescriptionEngine';

export const EvaluationScreen: React.FC = () => {
  const { jumpHistory, latestJumpResult, userProfile, athleteBaseline, navigate } = useApp();

  const currentJump = latestJumpResult?.jumpHeightCm || athleteBaseline.baseline_cmj_height || 52.4;
  const initialJump = userProfile.initialJumpCm || 52.4;
  const totalGain = Math.max(0, Math.round((currentJump - initialJump) * 10) / 10);
  const nextDate = userProfile.nextEvaluationDate || '24 Novembre 2026';

  const cmjVal = athleteBaseline.baseline_cmj_height || 52.4;
  const sjVal = athleteBaseline.baseline_sj_height || 47.8;
  const eurVal = athleteBaseline.eur_ratio || PrescriptionEngine.calculateEUR(cmjVal, sjVal);
  const eurDiagnostic = PrescriptionEngine.getEURDiagnostic(eurVal);

  const evaluationHistory = [
    {
      id: '1',
      date: 'Oggi',
      title: 'Valutazione Iniziale Baseline',
      cmj: cmjVal,
      sj: sjVal,
      eur: eurVal,
      badge: 'UFFICIALE',
    },
  ];

  const windowWidth = Dimensions.get('window').width;
  const isDesktop = windowWidth >= 768;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, isDesktop && styles.scrollContentDesktop]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.topHeader}>
          <VertiCamLogo size="small" variant="badge" />
          <View style={styles.headerTag}>
            <Activity size={12} color={Colors.primary} />
            <Text style={styles.headerTagText}>PROFILO NEUROMUSCOLARE</Text>
          </View>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>Valutazioni del Salto</Text>
          <Text style={styles.subtitle}>
            Monitoraggio scientifico del tempo di volo e della restituzione elastica (EUR).
          </Text>
        </View>

        {/* ── CARD PROSSIMA VALUTAZIONE UFFICIALE (CICLO 1 MESE LOTURCO) ── */}
        <View style={styles.nextEvalCard}>
          <View style={styles.nextEvalHeaderRow}>
            <View style={styles.calendarIconCircle}>
              <Calendar size={20} color={Colors.primary} strokeWidth={2.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nextEvalCategory}>PROGRAMMAZIONE MENSILE</Text>
              <Text style={styles.nextEvalTitle}>Prossima Valutazione Ufficiale</Text>
            </View>
          </View>

          <View style={styles.nextDateBox}>
            <Text style={styles.nextDateValue}>{nextDate}</Text>
            <View style={styles.cycleBadge}>
              <Text style={styles.cycleBadgeText}>Ciclo di 30 giorni</Text>
            </View>
          </View>

          <Text style={styles.nextEvalExplanation}>
            Secondo le evidenze del Prof. Irineu Loturco, il sistema nervoso centrale (SNC) necessita di 4 settimane di stimolo balistico e scarico per consolidare nuovi incrementi di frequenza di scarica dei motoneuroni.
          </Text>

          <TouchableOpacity
            style={styles.retestCtaBtn}
            onPress={() => navigate('BaselineEvaluation')}
            activeOpacity={0.88}
          >
            <Camera size={16} color="#000000" strokeWidth={2.5} />
            <Text style={styles.retestCtaBtnText}>EFFETTUA UN TEST STRAORDINARIO</Text>
          </TouchableOpacity>
        </View>

        {/* ── METRICHE CHIAVE ATTUALI ── */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>CMJ ATTUALE</Text>
            <Text style={styles.metricValue}>{cmjVal.toFixed(1)} <Text style={{ fontSize: 16 }}>cm</Text></Text>
            <View style={styles.gainPill}>
              <TrendingUp size={11} color="#10B981" />
              <Text style={styles.gainPillText}>+{totalGain} cm</Text>
            </View>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>SJ CONCENTRICO</Text>
            <Text style={styles.metricValue}>{sjVal.toFixed(1)} <Text style={{ fontSize: 16 }}>cm</Text></Text>
            <Text style={styles.metricSub}>Partenza ferma a 90°</Text>
          </View>
        </View>

        {/* ── CARD INDICE EUR (DIAGNOSI LOTURCO) ── */}
        <View style={styles.eurCard}>
          <View style={styles.eurHeaderRow}>
            <View>
              <Text style={styles.eurCategory}>ANALISI CICLO STRETCH-SHORTENING</Text>
              <Text style={styles.eurTitle}>Rapporto EUR (CMJ ÷ SJ)</Text>
            </View>
            <View style={styles.eurBadge}>
              <Text style={styles.eurBadgeValue}>{eurVal.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.eurDiagnosticBox}>
            <Text style={styles.eurDiagnosticText}>{eurDiagnostic.recommendation}</Text>
          </View>
        </View>

        {/* ── STORICO VALUTAZIONI EFFETTUATE ── */}
        <View style={styles.historySection}>
          <Text style={styles.historySectionTitle}>STORICO DELLE VALUTAZIONI</Text>

          {evaluationHistory.map((evalItem) => (
            <View key={evalItem.id} style={styles.historyCardItem}>
              <View style={styles.historyCardLeft}>
                <View style={styles.historyCheckDot}>
                  <Check size={12} color="#000000" strokeWidth={3} />
                </View>
                <View>
                  <Text style={styles.historyItemTitle}>{evalItem.title}</Text>
                  <Text style={styles.historyItemDate}>{evalItem.date}</Text>
                </View>
              </View>

              <View style={styles.historyCardRight}>
                <Text style={styles.historyItemJump}>{evalItem.cmj.toFixed(1)} cm</Text>
                <Text style={styles.historyItemEur}>EUR {evalItem.eur.toFixed(2)}</Text>
              </View>
            </View>
          ))}
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
  },
  headerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
  },
  headerTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  titleSection: {
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },

  // Next Eval
  nextEvalCard: {
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
  nextEvalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  calendarIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextEvalCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  nextEvalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  nextDateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#12172A',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  nextDateValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cycleBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cycleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  nextEvalExplanation: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
  },
  retestCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 14,
  },
  retestCtaBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  // Grid
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#0D111F',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 4,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  gainPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  gainPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
  },
  metricSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },

  // EUR
  eurCard: {
    backgroundColor: '#0D111F',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  eurHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eurCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  eurTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  eurBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  eurBadgeValue: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '900',
  },
  eurDiagnosticBox: {
    backgroundColor: '#12172A',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  eurDiagnosticText: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 17,
  },

  // History
  historySection: {
    gap: 10,
  },
  historySectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  historyCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0D111F',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  historyCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyCheckDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  historyItemDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  historyCardRight: {
    alignItems: 'flex-end',
  },
  historyItemJump: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  historyItemEur: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '700',
  },
});
