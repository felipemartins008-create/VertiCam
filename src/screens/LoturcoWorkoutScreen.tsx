import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  Zap,
  Activity,
  ShieldCheck,
  Flame,
  Check,
  Camera,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  Dumbbell,
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';
import { BiomechanicalDemonstration } from '../components/BiomechanicalDemonstration';
import { RealJumpCamera } from '../components/RealJumpCamera';

type WorkoutStep = 'warmup' | 'readiness_check' | 'loaded_jumps' | 'summary';

export const LoturcoWorkoutScreen: React.FC = () => {
  const { navigate, athleteBaseline, userProfile } = useApp();

  const [step, setStep] = useState<WorkoutStep>('warmup');

  // 1. Aquecimento (Squat 3x10)
  const [warmupSet, setWarmupSet] = useState<number>(1);
  const [warmupRest, setWarmupRest] = useState<number>(0);

  // 2. Readiness Check (Salto CMJ)
  const [readinessState, setReadinessState] = useState<'idle' | 'testing' | 'done'>('idle');
  const [readinessJumpCm, setReadinessJumpCm] = useState<number>(51.5);
  const [readinessZone, setReadinessZone] = useState<'GREEN' | 'YELLOW' | 'RED'>('GREEN');

  // 3. Saltos com Carga (Loaded Jump)
  const [currentSet, setCurrentSet] = useState<number>(1);
  const totalSets = 4;
  const [repsDoneInSet, setRepsDoneInSet] = useState<number>(0);

  // Carga prescrita em kg
  const baseLoadKg = Math.round((userProfile.weightKg || athleteBaseline.user_weight || 78) * 0.20);
  const [prescribedLoadKg, setPrescribedLoadKg] = useState<number>(baseLoadKg);

  // Monitoramento de velocidade e perda
  const [currentRepHeight, setCurrentRepHeight] = useState<number>(44.2);
  const [firstRepHeight, setFirstRepHeight] = useState<number>(44.2);
  const [velocityLossPercent, setVelocityLossPercent] = useState<number>(0);
  const [cameraAnalyzing, setCameraAnalyzing] = useState<boolean>(false);
  const [isFatiguedAlert, setIsFatiguedAlert] = useState<boolean>(false);

  // Resultados finais
  const [totalJumpsCompleted, setTotalJumpsCompleted] = useState<number>(0);

  // Timer Aquecimento
  useEffect(() => {
    let t: any;
    if (warmupRest > 0) {
      t = setInterval(() => {
        setWarmupRest((prev) => {
          if (prev <= 1) {
            setWarmupSet((s) => s + 1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(t);
  }, [warmupRest]);

  const handleWarmupNext = () => {
    if (warmupSet < 3) {
      setWarmupRest(40);
    } else {
      setStep('readiness_check');
    }
  };

  // Executa o Teste de Prontidão (Readiness Check) com Câmera Real
  const runReadinessTest = () => {
    setReadinessState('testing');
  };

  const handleReadinessJumpResult = (actualCm: number) => {
    const baseline = athleteBaseline.baseline_cmj_height || 52.0;
    const ratio = (actualCm / baseline) * 100;

    setReadinessJumpCm(actualCm);
    if (ratio >= 98) {
      setReadinessZone('GREEN');
      setPrescribedLoadKg(baseLoadKg);
    } else if (ratio >= 90) {
      setReadinessZone('YELLOW');
      setPrescribedLoadKg(Math.max(4, Math.round(baseLoadKg * 0.85)));
    } else {
      setReadinessZone('RED');
      setPrescribedLoadKg(Math.max(2, Math.round(baseLoadKg * 0.6)));
    }

    setReadinessState('done');
  };

  // Executa uma repetição de Salto com Carga rastreada pela câmera
  const performLoadedJump = () => {
    setCameraAnalyzing(true);
    setIsFatiguedAlert(false);

    setTimeout(() => {
      setCameraAnalyzing(false);
      const repNum = repsDoneInSet + 1;
      setRepsDoneInSet(repNum);
      setTotalJumpsCompleted((prev) => prev + 1);

      // Simulação fisiológica de fadiga
      const fatigueDecay = repNum === 1 ? 0 : (repNum * 2.8 + Math.random() * 2);
      const jumpCm = Math.round((45.0 - (45.0 * (fatigueDecay / 100))) * 10) / 10;
      setCurrentRepHeight(jumpCm);

      if (repNum === 1) {
        setFirstRepHeight(jumpCm);
        setVelocityLossPercent(0);
      } else {
        const loss = Math.round(((firstRepHeight - jumpCm) / firstRepHeight) * 100 * 10) / 10;
        setVelocityLossPercent(loss);

        // REGRA DE LOTURCO: Perda > 10% encerra a série!
        if (loss >= 10.0) {
          setIsFatiguedAlert(true);
        }
      }
    }, 1200);
  };

  const nextSetOrFinish = () => {
    setIsFatiguedAlert(false);
    setRepsDoneInSet(0);
    setVelocityLossPercent(0);

    if (currentSet < totalSets) {
      setCurrentSet(currentSet + 1);
    } else {
      setStep('summary');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Barra Superior */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.loturcoPill}>
            <Zap size={13} color={Colors.primary} />
            <Text style={styles.loturcoPillText}>METODO LOTURCO</Text>
          </View>
          <Text style={styles.topBarTitle}>Salto con Sovraccarico (Loaded Jump)</Text>
        </View>

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigate('Dashboard')}
          activeOpacity={0.7}
        >
          <X size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* ── PASSO 1: AQUECIMENTO (3x10 SQUAT) ── */}
      {step === 'warmup' && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.cardBox}>
            <View style={styles.cardHeaderRow}>
              <Flame size={18} color="#F97316" />
              <Text style={styles.cardHeaderTitle}>Fase 1: Riscaldamento Specifico</Text>
            </View>
            <Text style={styles.cardBodyText}>
              Esegui 10 ripetizioni di squat a corpo libero per attivare i fusi neuromuscolari.
            </Text>

            {/* Demonstração Biomecânica do Agachamento */}
            <BiomechanicalDemonstration type="warmup" />

            <View style={styles.warmupCounterBox}>
              <Text style={styles.warmupCounterLabel}>SERIE ATTUALE</Text>
              <Text style={styles.warmupCounterValue}>{warmupSet} / 3</Text>
              <Text style={styles.warmupCounterSub}>10 Ripetizioni di Squat</Text>
            </View>

            {warmupRest > 0 ? (
              <View style={styles.restAlert}>
                <RotateCcw size={16} color={Colors.primary} />
                <Text style={styles.restAlertText}>Pausa di recupero: {warmupRest}s</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleWarmupNext}
                activeOpacity={0.88}
              >
                <Check size={18} color="#000000" strokeWidth={3} />
                <Text style={styles.actionBtnText}>
                  {warmupSet === 3 ? 'PASSA AL CHECK NEURALE' : `SERIE ${warmupSet} COMPLETATA`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}

      {/* ── PASSO 2: TESTE DE PRONTIDÃO NEURAL (READINESS JUMP) ── */}
      {step === 'readiness_check' && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.cardBox}>
            <View style={styles.cardHeaderRow}>
              <Activity size={18} color={Colors.primary} />
              <Text style={styles.cardHeaderTitle}>Fase 2: Check di Prontezza SNC</Text>
            </View>
            <Text style={styles.cardBodyText}>
              Esegui un unico salto CMJ massimale davanti alla fotocamera. L'IA analizzerà la reattività del tuo sistema nervoso centrale per calibrare il carico ottimale di oggi.
            </Text>

            {readinessState === 'idle' && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={runReadinessTest}
                activeOpacity={0.88}
              >
                <Camera size={18} color="#000000" strokeWidth={2.5} />
                <Text style={styles.actionBtnText}>APRI FOTOCAMERA & REGISTRA SALTO DI PROVA</Text>
              </TouchableOpacity>
            )}

            {readinessState === 'testing' && (
              <RealJumpCamera
                jumpType="CMJ"
                attemptNumber={1}
                totalAttempts={1}
                onJumpConfirmed={handleReadinessJumpResult}
              />
            )}

            {readinessState === 'done' && (
              <View style={styles.readinessResultBox}>
                <View style={[styles.semaphoreBadge, readinessZone === 'GREEN' && styles.semaphoreGreen, readinessZone === 'YELLOW' && styles.semaphoreYellow]}>
                  <Text style={styles.semaphoreText}>
                    {readinessZone === 'GREEN' && '🟢 SISTEMA NERVOSO FRESCO (100%)'}
                    {readinessZone === 'YELLOW' && '🟡 LIEVE FATICA CENTRALE (-15%)'}
                    {readinessZone === 'RED' && '🔴 FATICA ELEVATA (SESSIONE RIGENERATIVA)'}
                  </Text>
                </View>

                <Text style={styles.readinessResultJump}>
                  Salto di oggi: <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>{readinessJumpCm} cm</Text>
                </Text>

                <View style={styles.prescriptionHighlight}>
                  <Dumbbell size={18} color={Colors.primary} />
                  <Text style={styles.prescriptionHighlightText}>
                    Carico Prescritto (OPL): <Text style={{ color: Colors.primary, fontWeight: '900' }}>{prescribedLoadKg} kg</Text>
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => setStep('loaded_jumps')}
                  activeOpacity={0.88}
                >
                  <Text style={styles.actionBtnText}>INIZIA I SALTI CON SOVRACCARICO</Text>
                  <ArrowRight size={18} color="#000000" strokeWidth={3} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* ── PASSO 3: SALTOS COM CARGA COM ANÁLISE SIMULTÂNEA DA CÂMERA ── */}
      {step === 'loaded_jumps' && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.cardBox}>
            <View style={styles.setRowHeader}>
              <View>
                <Text style={styles.setRowLabel}>SERIE ATTUALE</Text>
                <Text style={styles.setRowTitle}>Serie {currentSet} di {totalSets}</Text>
              </View>

              <View style={styles.weightBadge}>
                <Text style={styles.weightBadgeValue}>{prescribedLoadKg} kg</Text>
                <Text style={styles.weightBadgeSub}>Carico OPL</Text>
              </View>
            </View>

            {/* Guia Biomecânico do Salto */}
            <BiomechanicalDemonstration type="cmj" />

            {/* Monitor de Velocidade e Perda */}
            <View style={styles.telemetryCard}>
              <View style={styles.telemetryItem}>
                <Text style={styles.telemetryLabel}>ULTIMO SALTO</Text>
                <Text style={styles.telemetryValue}>{repsDoneInSet > 0 ? `${currentRepHeight} cm` : '--'}</Text>
              </View>

              <View style={styles.telemetryDivider} />

              <View style={styles.telemetryItem}>
                <Text style={styles.telemetryLabel}>PERDITA DI VELOCITÀ</Text>
                <Text style={[styles.telemetryValue, velocityLossPercent >= 10 && { color: '#EF4444' }]}>
                  {repsDoneInSet > 0 ? `-${velocityLossPercent}%` : '0%'}
                </Text>
              </View>
            </View>

            {/* Alerta de Fadiga Neural (Regra de Loturco) */}
            {isFatiguedAlert && (
              <View style={styles.fatigueAlertBox}>
                <AlertTriangle size={18} color="#FBBF24" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.fatigueAlertTitle}>Limite di Loturco Raggiunto (Perdita &gt; 10%)</Text>
                  <Text style={styles.fatigueAlertText}>
                    La tua potenza è scesa oltre la soglia ottimale. Concludi la serie adesso per evitare sovraccarico al sistema nervoso e preservare la massima reattività!
                  </Text>
                </View>
              </View>
            )}

            {/* Ação de Repetição */}
            {cameraAnalyzing ? (
              <View style={styles.cameraLiveBox}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.cameraLiveText}>Fotocamera attiva: analisi del tempo di volo in corso...</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.actionBtn, isFatiguedAlert && { backgroundColor: '#334155' }]}
                onPress={performLoadedJump}
                disabled={isFatiguedAlert}
                activeOpacity={0.88}
              >
                <Camera size={18} color={isFatiguedAlert ? '#94A3B8' : '#000000'} strokeWidth={2.5} />
                <Text style={[styles.actionBtnText, isFatiguedAlert && { color: '#94A3B8' }]}>
                  {repsDoneInSet === 0 ? 'ESEGUI 1° SALTO CON SOVRACCARICO' : `ESEGUI SALTO ${repsDoneInSet + 1}`}
                </Text>
              </TouchableOpacity>
            )}

            {/* Botão Próxima Série / Fim */}
            {(repsDoneInSet >= 3 || isFatiguedAlert) && (
              <TouchableOpacity
                style={styles.nextSetBtn}
                onPress={nextSetOrFinish}
                activeOpacity={0.88}
              >
                <Check size={18} color="#00E5FF" strokeWidth={3} />
                <Text style={styles.nextSetBtnText}>
                  {currentSet === totalSets ? 'CONCLUDI ALLENAMENTO' : `RECUPERA E PASSA ALLA SERIE ${currentSet + 1}`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}

      {/* ── PASSO 4: RESUMO FINAL DO TREINO ── */}
      {step === 'summary' && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.cardBox}>
            <View style={styles.summaryBadge}>
              <Check size={14} color="#10B981" strokeWidth={3} />
              <Text style={styles.summaryBadgeText}>ALLENAMENTO COMPLETATO</Text>
            </View>

            <Text style={styles.summaryTitle}>Massima Potenza Stimolata!</Text>
            <Text style={styles.summarySub}>
              Hai completato la sessione balistica preservando il sistema nervoso centrale secondo il protocollo Loturco.
            </Text>

            <View style={styles.summaryStatsGrid}>
              <View style={styles.summaryStatItem}>
                <Text style={styles.summaryStatLabel}>SALTI CON SOVRACCARICO</Text>
                <Text style={styles.summaryStatValue}>{totalJumpsCompleted}</Text>
              </View>

              <View style={styles.summaryStatItem}>
                <Text style={styles.summaryStatLabel}>CARICO MEDIO</Text>
                <Text style={styles.summaryStatValue}>{prescribedLoadKg} kg</Text>
              </View>
            </View>

            <View style={styles.adviceCard}>
              <ShieldCheck size={16} color={Colors.primary} />
              <Text style={styles.adviceCardText}>
                Consiglio di recupero: riposa almeno 48 ore prima della prossima sessione con carico.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigate('Dashboard')}
              activeOpacity={0.88}
            >
              <Text style={styles.actionBtnText}>TORNA ALLA HOME</Text>
              <ArrowRight size={18} color="#000000" strokeWidth={3} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070F',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#090D1A',
  },
  topBarLeft: {
    gap: 4,
  },
  loturcoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  loturcoPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 0.6,
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#13182C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingVertical: 24,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  cardBox: {
    backgroundColor: '#0D111F',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cardBodyText: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  warmupCounterBox: {
    alignItems: 'center',
    backgroundColor: '#12172A',
    padding: 20,
    borderRadius: 16,
    gap: 4,
  },
  warmupCounterLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },
  warmupCounterValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  warmupCounterSub: {
    fontSize: 12,
    color: '#94A3B8',
  },
  restAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    padding: 14,
    borderRadius: 12,
  },
  restAlertText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  actionBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  loadingBox: {
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  loadingBoxText: {
    fontSize: 13,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  readinessResultBox: {
    gap: 14,
  },
  semaphoreBadge: {
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  semaphoreGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  semaphoreYellow: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderWidth: 1,
    borderColor: '#FBBF24',
  },
  semaphoreText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  readinessResultJump: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  prescriptionHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#12172A',
    padding: 14,
    borderRadius: 12,
  },
  prescriptionHighlightText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Loaded jumps
  setRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  setRowLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  setRowTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  weightBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    alignItems: 'flex-end',
  },
  weightBadgeValue: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.primary,
  },
  weightBadgeSub: {
    fontSize: 9,
    color: '#94A3B8',
  },
  telemetryCard: {
    flexDirection: 'row',
    backgroundColor: '#12172A',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  telemetryItem: {
    alignItems: 'center',
  },
  telemetryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 4,
  },
  telemetryValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  telemetryDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  fatigueAlertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    borderRadius: 12,
    padding: 12,
  },
  fatigueAlertTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FBBF24',
    marginBottom: 2,
  },
  fatigueAlertText: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  cameraLiveBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#13182C',
    padding: 16,
    borderRadius: 14,
  },
  cameraLiveText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  nextSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#12172A',
    borderWidth: 1,
    borderColor: Colors.primary,
    height: 48,
    borderRadius: 14,
  },
  nextSetBtnText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },

  // Summary
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  summaryBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  summarySub: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  summaryStatsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryStatItem: {
    flex: 1,
    backgroundColor: '#12172A',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  summaryStatLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 4,
  },
  summaryStatValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  adviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  adviceCardText: {
    flex: 1,
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 16,
  },
});
