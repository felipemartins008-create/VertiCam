import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Platform,
} from 'react-native';
import {
  Zap, ArrowLeft, Clock, Flame, ShieldAlert,
  CheckCircle2, Play, Pause, RotateCcw, AlertTriangle,
  ChevronRight, Dumbbell, Activity,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { PrescriptionOutput } from '../types';

export const DailyCheckinScreen: React.FC = () => {
  const { athleteBaseline, runDailyCheckin, navigate } = useApp();

  // Etapas: 'warmup' | 'test' | 'result'
  const [step, setStep] = useState<'warmup' | 'test' | 'result'>('warmup');

  // Cronômetro do descanso pós-PAP (150 segundos)
  const [timerSeconds, setTimerSeconds] = useState(150);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // CMJ medido no dia (padrão baseado na baseline para teste rápido)
  const [dailyCMJ, setDailyCMJ] = useState<string>(
    (athleteBaseline.baseline_cmj_height * 0.96).toFixed(1)
  );
  const [prescriptionResult, setPrescriptionResult] = useState<PrescriptionOutput | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCalculateReadiness = (jumpCm?: number) => {
    const height = jumpCm || parseFloat(dailyCMJ) || athleteBaseline.baseline_cmj_height;
    const result = runDailyCheckin(height);
    setPrescriptionResult(result);
    setStep('result');
  };

  const warmupLoad35 = Math.round((athleteBaseline.user_squat_1rm * 0.35) * 2) / 2;
  const warmupLoad40 = Math.round((athleteBaseline.user_squat_1rm * 0.40) * 2) / 2;

  return (
    <View style={styles.container}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (step === 'result') setStep('test');
            else if (step === 'test') setStep('warmup');
            else navigate('Dashboard');
          }}
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check-in di Prontezza</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Barra de Progresso das Etapas */}
        <View style={styles.stepperContainer}>
          <View style={[styles.stepDot, step === 'warmup' && styles.stepDotActive, (step === 'test' || step === 'result') && styles.stepDotDone]}>
            <Text style={styles.stepNum}>1</Text>
          </View>
          <View style={[styles.stepLine, (step === 'test' || step === 'result') && styles.stepLineActive]} />
          <View style={[styles.stepDot, step === 'test' && styles.stepDotActive, step === 'result' && styles.stepDotDone]}>
            <Text style={styles.stepNum}>2</Text>
          </View>
          <View style={[styles.stepLine, step === 'result' && styles.stepLineActive]} />
          <View style={[styles.stepDot, step === 'result' && styles.stepDotActive]}>
            <Text style={styles.stepNum}>3</Text>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════
            FASE 1: RISCALDAMENTO & POTENZIAMENTO (PAP)
           ═══════════════════════════════════════════════ */}
        {step === 'warmup' && (
          <View style={styles.cardSection}>
            <View style={styles.badgeRow}>
              <View style={styles.phaseBadge}>
                <Flame size={12} color={Colors.primary} />
                <Text style={styles.phaseBadgeText}>FASE 1: PREPARAZIONE BIOMECCANICA</Text>
              </View>
            </View>

            <Text style={styles.mainTitle}>Riscaldamento & Potenziamento (PAP)</Text>
            <Text style={styles.description}>
              Ottimizza il reclutamento neuromuscolare del Sistema Nervoso Centrale prima di testare la prontezza.
            </Text>

            {/* Item 1: Mobilidade */}
            <View style={styles.protocolItem}>
              <View style={styles.protocolIconBox}>
                <Activity size={20} color="#38BDF8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.protocolName}>1. Mobilità Articolare Attiva</Text>
                <Text style={styles.protocolDetail}>
                  2 min di caviglie (dorsiflessione), ginocchia e anche.
                </Text>
              </View>
            </View>

            {/* Item 2: Saltos Livres */}
            <View style={styles.protocolItem}>
              <View style={styles.protocolIconBox}>
                <Zap size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.protocolName}>2. Salti Liberi Progressivi</Text>
                <Text style={styles.protocolDetail}>
                  3 a 5 salti verticali sub-massimali aumentando l'intenzione elastica.
                </Text>
              </View>
            </View>

            {/* Item 3: Sobrecarga PAP */}
            <View style={styles.protocolItem}>
              <View style={styles.protocolIconBox}>
                <Dumbbell size={20} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.protocolName}>3. Attivazione PAP con Bilanciere</Text>
                <Text style={styles.protocolDetail}>
                  • Serie 1: 5 rip a 35% 1RM ({warmupLoad35} kg){'\n'}
                  • Serie 2: 3 rip esplosive a 40% 1RM ({warmupLoad40} kg)
                </Text>
              </View>
            </View>

            {/* Cronômetro de Repouso Obrigatório */}
            <View style={styles.timerCard}>
              <Text style={styles.timerTitle}>Recupero Obbligatorio Pre-Test (PAP)</Text>
              <Text style={styles.timerCountdown}>{formatTimer(timerSeconds)}</Text>
              <Text style={styles.timerAdvice}>
                Attendi la dissipazione della fatica per la piena espressione del potenziamento.
              </Text>

              <View style={styles.timerControlsRow}>
                <TouchableOpacity
                  style={[styles.timerBtn, isTimerRunning ? styles.timerBtnPause : styles.timerBtnPlay]}
                  onPress={() => setIsTimerRunning(!isTimerRunning)}
                >
                  {isTimerRunning ? <Pause size={18} color="#FFFFFF" /> : <Play size={18} color="#0F172A" fill="#0F172A" />}
                  <Text style={[styles.timerBtnText, isTimerRunning && { color: '#FFFFFF' }]}>
                    {isTimerRunning ? 'Pausa' : 'Avvia Timer (2:30)'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.timerResetBtn}
                  onPress={() => { setIsTimerRunning(false); setTimerSeconds(150); }}
                >
                  <RotateCcw size={16} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Botão de Avançar */}
            <TouchableOpacity
              style={styles.primaryCta}
              onPress={() => setStep('test')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryCtaText}>Pronto per il Test CMJ →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ═══════════════════════════════════════════════
            FASE 2: TEST DI PRONTEZZA NEUROMUSCOLARE (CMJ)
           ═══════════════════════════════════════════════ */}
        {step === 'test' && (
          <View style={styles.cardSection}>
            <View style={styles.badgeRow}>
              <View style={[styles.phaseBadge, { borderColor: 'rgba(56, 189, 248, 0.4)' }]}>
                <Zap size={12} color="#38BDF8" />
                <Text style={[styles.phaseBadgeText, { color: '#38BDF8' }]}>FASE 2: VALUTAZIONE DEL SALTO</Text>
              </View>
            </View>

            <Text style={styles.mainTitle}>Test CMJ Massimale</Text>
            <Text style={styles.description}>
              Esegui 2 o 3 tentativi di salto verticale massimale con contromovimento (CMJ).
            </Text>

            {/* Baseline do Atleta */}
            <View style={styles.baselineInfoBox}>
              <View style={styles.baselineItem}>
                <Text style={styles.baselineLabel}>Baseline CMJ</Text>
                <Text style={styles.baselineValue}>{athleteBaseline.baseline_cmj_height} cm</Text>
              </View>
              <View style={styles.baselineDivider} />
              <View style={styles.baselineItem}>
                <Text style={styles.baselineLabel}>Rapporto EUR</Text>
                <Text style={styles.baselineValue}>{athleteBaseline.eur_ratio}</Text>
              </View>
              <View style={styles.baselineDivider} />
              <View style={styles.baselineItem}>
                <Text style={styles.baselineLabel}>1RM Squat</Text>
                <Text style={styles.baselineValue}>{athleteBaseline.user_squat_1rm} kg</Text>
              </View>
            </View>

            {/* Entrada da Altura do Salto */}
            <View style={styles.jumpInputCard}>
              <Text style={styles.jumpInputLabel}>Miglior Salto CMJ Eseguito Oggi (cm):</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.jumpTextInput}
                  value={dailyCMJ}
                  onChangeText={setDailyCMJ}
                  keyboardType="numeric"
                  placeholder="50.0"
                  placeholderTextColor="#64748B"
                />
                <Text style={styles.inputUnit}>cm</Text>
              </View>

              {/* Botões Rápidos de Simulação de Prontidão */}
              <Text style={styles.quickSimTitle}>Oppure prova scenari rapidi di prontezza:</Text>
              <View style={styles.quickButtonsRow}>
                <TouchableOpacity
                  style={[styles.quickBtn, { borderColor: '#10B981' }]}
                  onPress={() => {
                    const val = (athleteBaseline.baseline_cmj_height * 0.98).toFixed(1);
                    setDailyCMJ(val);
                    handleCalculateReadiness(parseFloat(val));
                  }}
                >
                  <Text style={[styles.quickBtnText, { color: '#10B981' }]}>🟢 98% (Verde)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickBtn, { borderColor: '#F59E0B' }]}
                  onPress={() => {
                    const val = (athleteBaseline.baseline_cmj_height * 0.90).toFixed(1);
                    setDailyCMJ(val);
                    handleCalculateReadiness(parseFloat(val));
                  }}
                >
                  <Text style={[styles.quickBtnText, { color: '#F59E0B' }]}>🟡 90% (Gialla)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickBtn, { borderColor: '#EF4444' }]}
                  onPress={() => {
                    const val = (athleteBaseline.baseline_cmj_height * 0.78).toFixed(1);
                    setDailyCMJ(val);
                    handleCalculateReadiness(parseFloat(val));
                  }}
                >
                  <Text style={[styles.quickBtnText, { color: '#EF4444' }]}>🔴 78% (Rossa)</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Botão de Calcular */}
            <TouchableOpacity
              style={styles.primaryCta}
              onPress={() => handleCalculateReadiness()}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryCtaText}>Calcola Prontezza & Prescrivi Allenamento →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ═══════════════════════════════════════════════
            FASE 3: RISULTATO DELL'AUTOREGOLAZIONE & SCHEDA
           ═══════════════════════════════════════════════ */}
        {step === 'result' && prescriptionResult && (
          <View style={styles.cardSection}>
            {/* Banner da Zona de Prontidão */}
            <View
              style={[
                styles.readinessBanner,
                prescriptionResult.readiness.zone === 'GREEN' && styles.zoneGreenBg,
                prescriptionResult.readiness.zone === 'YELLOW' && styles.zoneYellowBg,
                prescriptionResult.readiness.zone === 'RED' && styles.zoneRedBg,
              ]}
            >
              <View style={styles.zoneHeaderRow}>
                <View style={styles.zoneTag}>
                  <Text
                    style={[
                      styles.zoneTagText,
                      prescriptionResult.readiness.zone === 'GREEN' && { color: '#10B981' },
                      prescriptionResult.readiness.zone === 'YELLOW' && { color: '#F59E0B' },
                      prescriptionResult.readiness.zone === 'RED' && { color: '#EF4444' },
                    ]}
                  >
                    ZONA {prescriptionResult.readiness.zone}
                  </Text>
                </View>
                <Text style={styles.scoreText}>
                  {prescriptionResult.readiness.score_percentage}% Prontezza
                </Text>
              </View>

              <Text style={styles.zoneStatusMessage}>
                {prescriptionResult.readiness.status_message}
              </Text>

              <View style={styles.cutoffBox}>
                <AlertTriangle size={14} color="#94A3B8" />
                <Text style={styles.cutoffText}>
                  Cutoff di perdita di velocità/altezza: {prescriptionResult.velocity_loss_cutoff_percent}%
                </Text>
              </View>
            </View>

            {/* Prescrição de Exercícios do Dia */}
            <View style={styles.prescribedListHeading}>
              <Text style={styles.prescribedTitle}>PRESCRIZIONE DEL GIORNO AUTOREGOLATA</Text>
              <Text style={styles.prescribedSubtitle}>
                {prescriptionResult.workout_prescription.length} esercizi ottimizzati per il tuo stato neurale
              </Text>
            </View>

            {prescriptionResult.workout_prescription.map((ex, idx) => (
              <View key={idx} style={styles.exerciseCard}>
                <View style={styles.exCardHeader}>
                  <View style={styles.exNumber}>
                    <Text style={styles.exNumberText}>{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exName}>{ex.exercise_name}</Text>
                    <Text style={styles.exDose}>
                      {ex.sets} serie × {ex.reps} rip
                      {ex.load_kg ? ` | ${ex.load_kg} kg (${ex.load_percentage_1rm}% 1RM)` : ''}
                      {ex.box_height_cm ? ` | Box: ${ex.box_height_cm} cm` : ''}
                      {' • '}Recupero: {ex.rest_seconds}s
                    </Text>
                  </View>
                </View>
                <Text style={styles.exNotes}>{ex.execution_notes}</Text>
              </View>
            ))}

            {/* Botão de Conclusão / Ir para o Treino */}
            <TouchableOpacity
              style={styles.primaryCta}
              onPress={() => navigate('Dashboard')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryCtaText}>Salva Sessione e Vai alla Dashboard →</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0D14',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#161F30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Stepper
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: '#F59E0B',
  },
  stepDotDone: {
    backgroundColor: '#10B981',
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#1E293B',
    marginHorizontal: 6,
  },
  stepLineActive: {
    backgroundColor: '#10B981',
  },

  cardSection: {
    backgroundColor: '#111722',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  badgeRow: {
    marginBottom: 8,
  },
  phaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    alignSelf: 'flex-start' as any,
  },
  phaseBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 19,
    marginBottom: 20,
  },

  // Protocol Item
  protocolItem: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#161F30',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  protocolIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  protocolName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  protocolDetail: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
  },

  // Timer Card
  timerCard: {
    backgroundColor: '#0F1522',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  timerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: 4,
  },
  timerCountdown: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'] as any,
    marginVertical: 2,
  },
  timerAdvice: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 12,
  },
  timerControlsRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  timerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  timerBtnPlay: {
    backgroundColor: '#F59E0B',
  },
  timerBtnPause: {
    backgroundColor: '#EF4444',
  },
  timerBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  timerResetBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Baseline box
  baselineInfoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#161F30',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  baselineItem: {
    alignItems: 'center',
    flex: 1,
  },
  baselineLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  baselineValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  baselineDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  // Jump Input Card
  jumpInputCard: {
    backgroundColor: '#161F30',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  jumpInputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  jumpTextInput: {
    flex: 1,
    backgroundColor: '#0F1522',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 24,
    fontWeight: '900',
    color: '#F59E0B',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  inputUnit: {
    fontSize: 18,
    fontWeight: '800',
    color: '#94A3B8',
  },
  quickSimTitle: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '600',
  },
  quickButtonsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  quickBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
    alignItems: 'center',
  },
  quickBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Result Banner
  readinessBanner: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  zoneGreenBg: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  zoneYellowBg: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  zoneRedBg: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  zoneHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  zoneTag: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  zoneTagText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  zoneStatusMessage: {
    fontSize: 13,
    color: '#E2E8F0',
    lineHeight: 18,
    marginBottom: 10,
  },
  cutoffBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  cutoffText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },

  // Prescribed list
  prescribedListHeading: {
    marginBottom: 12,
  },
  prescribedTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#F59E0B',
    letterSpacing: 1,
  },
  prescribedSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  exerciseCard: {
    backgroundColor: '#161F30',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  exCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 6,
  },
  exNumber: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F59E0B',
  },
  exName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  exDose: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
  },
  exNotes: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
    paddingLeft: 34,
  },

  // Primary CTA
  primaryCta: {
    backgroundColor: '#F97316',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  primaryCtaText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
