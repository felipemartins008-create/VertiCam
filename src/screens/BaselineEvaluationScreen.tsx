import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import {
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Flame,
  Check,
  Activity,
  Calendar,
  Sparkles,
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';
import { PrescriptionEngine } from '../services/prescriptionEngine';
import { BiomechanicalDemonstration } from '../components/BiomechanicalDemonstration';
import { RealJumpCamera } from '../components/RealJumpCamera';
import { JumpTutorialPlayer } from '../components/JumpTutorialPlayer';

const { width } = Dimensions.get('window');
const isDesktop = width >= 768;

type EvalPhase = 'tutorial' | 'warmup' | 'camera_test' | 'results';
type JumpType = 'CMJ' | 'SJ';

export const BaselineEvaluationScreen: React.FC = () => {
  const { navigate, updateProfile, updateBaseline, language } = useApp();
  const isPt = language === 'pt';

  const [phase, setPhase] = useState<EvalPhase>('tutorial');

  // Aquecimento: 3 séries x 10 repetições de agachamento
  const [warmupSet, setWarmupSet] = useState<number>(1);
  const [warmupRestSeconds, setWarmupRestSeconds] = useState<number>(0);
  const [isResting, setIsResting] = useState<boolean>(false);

  // Avaliação: 3 CMJ + 3 SJ
  const [currentJumpType, setCurrentJumpType] = useState<JumpType>('CMJ');
  const [currentAttempt, setCurrentAttempt] = useState<number>(1); // 1, 2, 3

  // Resultados registrados (salvos diretamente da câmera real)
  const [cmjScores, setCmjScores] = useState<number[]>([]);
  const [sjScores, setSjScores] = useState<number[]>([]);

  // Timer descanso aquecimento
  useEffect(() => {
    let timer: any;
    if (isResting && warmupRestSeconds > 0) {
      timer = setInterval(() => {
        setWarmupRestSeconds((prev) => {
          if (prev <= 1) {
            setIsResting(false);
            setWarmupSet((s) => s + 1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isResting, warmupRestSeconds]);

  // Lote de saltos detectados em um único vídeo (ex: 3 CMJ ou 3 SJ)
  const handleBatchJumpsRecorded = (heightsCm: number[]) => {
    if (currentJumpType === 'CMJ') {
      const nextScores = [...cmjScores, ...heightsCm].slice(0, 3);
      setCmjScores(nextScores);
      if (nextScores.length >= 3) {
        setCurrentJumpType('SJ');
        setCurrentAttempt(1);
      } else {
        setCurrentAttempt(nextScores.length + 1);
      }
    } else {
      const nextScores = [...sjScores, ...heightsCm].slice(0, 3);
      setSjScores(nextScores);
      if (nextScores.length >= 3) {
        finishEvaluation(cmjScores, nextScores);
      } else {
        setCurrentAttempt(nextScores.length + 1);
      }
    }
  };

  // Salto Confirmado diretamente pelo Scrubber da Câmera Real
  const handleJumpRecorded = (heightCm: number) => {
    if (currentJumpType === 'CMJ') {
      const nextScores = [...cmjScores, heightCm];
      setCmjScores(nextScores);

      if (currentAttempt < 3) {
        setCurrentAttempt(currentAttempt + 1);
      } else {
        // Passa para SJ (Squat Jump)
        setCurrentJumpType('SJ');
        setCurrentAttempt(1);
      }
    } else {
      // JumpType === 'SJ'
      const nextScores = [...sjScores, heightCm];
      setSjScores(nextScores);

      if (currentAttempt < 3) {
        setCurrentAttempt(currentAttempt + 1);
      } else {
        // Avaliação Concluída!
        finishEvaluation(cmjScores, nextScores);
      }
    }
  };

  const finishEvaluation = async (finalCmj: number[], finalSj: number[]) => {
    const avgCmj = finalCmj.length > 0 ? Math.round((finalCmj.reduce((a, b) => a + b, 0) / finalCmj.length) * 10) / 10 : 0;
    const avgSj = finalSj.length > 0 ? Math.round((finalSj.reduce((a, b) => a + b, 0) / finalSj.length) * 10) / 10 : 0;
    const eur = PrescriptionEngine.calculateEUR(avgCmj, avgSj);

    // Próxima avaliação: hoje + 30 dias
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 30);
    const nextDateString = nextDate.toLocaleDateString(isPt ? 'pt-BR' : 'it-IT', { day: 'numeric', month: 'long', year: 'numeric' });

    await updateProfile({
      hasCompletedInitialEvaluation: true,
      nextEvaluationDate: nextDateString,
      initialJumpCm: avgCmj,
      currentJumpCm: avgCmj,
    });

    updateBaseline({
      baseline_cmj_height: avgCmj,
      baseline_sj_height: avgSj,
      eur_ratio: eur,
    });

    setPhase('results');
  };

  const completeWarmupSet = () => {
    if (warmupSet < 3) {
      setIsResting(true);
      setWarmupRestSeconds(45);
    } else {
      setPhase('camera_test');
    }
  };

  const avgCmj = cmjScores.length > 0 ? Math.round((cmjScores.reduce((a, b) => a + b, 0) / cmjScores.length) * 10) / 10 : 0;
  const avgSj = sjScores.length > 0 ? Math.round((sjScores.reduce((a, b) => a + b, 0) / sjScores.length) * 10) / 10 : 0;
  const eurRatio = avgCmj > 0 && avgSj > 0 ? PrescriptionEngine.calculateEUR(avgCmj, avgSj) : 0;

  const getDiagnosisText = (eur: number) => {
    return PrescriptionEngine.getEURDiagnostic(eur, language).recommendation;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── FASE 1: TUTORIAL E REGRAS DE EXECUÇÃO COM DEMONSTRAÇÕES ── */}
      {phase === 'tutorial' && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.topBadge}>
            <Activity size={12} color={Colors.primary} />
            <Text style={styles.topBadgeText}>
              {isPt ? 'PROTOCOLO CIENTÍFICO LOTURCO' : 'PROTOCOLLO SCIENTIFICO LOTURCO'}
            </Text>
          </View>
          <Text style={styles.screenHeading}>
            {isPt ? 'Regras da Avaliação Inicial' : 'Regole della Valutazione Iniziale'}
          </Text>
          <Text style={styles.screenSubheading}>
            {isPt
              ? 'Para garantir uma medição milimétrica precisa e padronizada, siga estas 2 regras biomecânicas:'
              : 'Per garantire una misurazione millimetrica precisa e standardizzata, segui queste 2 regole biomeccaniche:'}
          </Text>

          {/* Regra 1 */}
          <View style={styles.ruleCard}>
            <View style={styles.ruleNumberCircle}>
              <Text style={styles.ruleNumber}>1</Text>
            </View>
            <View style={styles.ruleTextContent}>
              <Text style={styles.ruleTitle}>
                {isPt ? 'Mãos sempre firmes na cintura' : 'Mani sempre salde sui fianchi'}
              </Text>
              <Text style={styles.ruleDescription}>
                {isPt
                  ? 'Mantenha as mãos apoiadas na cintura durante todo o teste. Isso isola o impulso dos braços, medindo 100% da potência real das pernas.'
                  : 'Mantieni le mani appoggiate sui fianchi per l\'intera durata del test. Questo esclude la spinta delle braccia, isolando al 100% la reale potenza delle gambe.'}
              </Text>
            </View>
          </View>

          {/* Regra 2 */}
          <View style={styles.ruleCard}>
            <View style={styles.ruleNumberCircle}>
              <Text style={styles.ruleNumber}>2</Text>
            </View>
            <View style={styles.ruleTextContent}>
              <Text style={styles.ruleTitle}>
                {isPt ? 'Joelhos e pernas estendidos no voo' : 'Ginocchia e gambe distese in volo'}
              </Text>
              <Text style={styles.ruleDescription}>
                {isPt
                  ? 'Empurre com os tornozelos e mantenha as pernas estendidas no ar até a aterrissagem. Dobrar os joelhos no ar altera o tempo de voo real.'
                  : 'Spingi con le caviglie e mantieni le gambe perfettamente distese in volo fino all\'atterraggio. Flettere le ginocchia in aria altera il tempo di volo reale.'}
              </Text>
            </View>
          </View>

          {/* Demonstração em Vídeo Tutorial Animado (3 Abas) */}
          <JumpTutorialPlayer />

          {/* Sequência do Teste */}
          <View style={styles.sequenceCard}>
            <Text style={styles.sequenceTitle}>
              {isPt ? 'SEQUÊNCIA DO TESTE:' : 'SEQUENZA DEL TEST:'}
            </Text>
            <View style={styles.sequenceRow}>
              <View style={styles.sequenceBadge}>
                <Text style={styles.sequenceBadgeLabel}>{isPt ? 'FASE 1' : 'FASE 1'}</Text>
                <Text style={styles.sequenceBadgeName}>{isPt ? '3x Saltos CMJ' : '3x Salti CMJ'}</Text>
                <Text style={styles.sequenceBadgeSub}>
                  {isPt ? 'Com contramovimento rápido' : 'Con contromovimento rapido'}
                </Text>
              </View>
              <ArrowRight size={18} color="#64748B" />
              <View style={styles.sequenceBadge}>
                <Text style={styles.sequenceBadgeLabel}>{isPt ? 'FASE 2' : 'FASE 2'}</Text>
                <Text style={styles.sequenceBadgeName}>{isPt ? '3x Saltos SJ' : '3x Salti SJ'}</Text>
                <Text style={styles.sequenceBadgeSub}>
                  {isPt ? 'Parado a 90° por 2s antes de saltar' : 'Fermo a 90° per 2s prima di saltare'}
                </Text>
              </View>
            </View>
          </View>

          {/* Botão para o Aquecimento */}
          <TouchableOpacity
            style={styles.mainActionBtn}
            onPress={() => setPhase('warmup')}
            activeOpacity={0.88}
          >
            <Text style={styles.mainActionBtnText}>
              {isPt ? 'INICIAR AQUECIMENTO (3x10 AGACHAMENTO)' : 'INIZIA RISCALDAMENTO (3x10 SQUAT)'}
            </Text>
            <ArrowRight size={18} color="#000000" strokeWidth={3} />
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ── FASE 2: AQUECIMENTO GUIADO (3 SÉRIES DE 10 AGACHAMENTOS) ── */}
      {phase === 'warmup' && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.topBadge}>
            <Flame size={12} color="#F97316" />
            <Text style={[styles.topBadgeText, { color: '#F97316' }]}>
              {isPt ? 'ATIVAÇÃO NEUROMUSCULAR' : 'ATTIVAZIONE NEUROMUSCOLARE'}
            </Text>
          </View>

          <Text style={styles.screenHeading}>
            {isPt ? 'Aquecimento Específico' : 'Riscaldamento Specifico'}
          </Text>
          <Text style={styles.screenSubheading}>
            {isPt
              ? '3 séries de 10 repetições de agachamento com peso corporal para ativar os fusos neuromusculares e preparar o tendão patelar.'
              : '3 serie da 10 ripetizioni di squat a corpo libero per attivare i fusi neuromuscolari e preparare il tendine rotuleo.'}
          </Text>

          {/* Demonstração Biomecânica do Agachamento */}
          <BiomechanicalDemonstration type="warmup" />

          {/* Card Série */}
          <View style={styles.warmupProgressCard}>
            <Text style={styles.warmupCardTitle}>
              {isPt ? `SÉRIE ${warmupSet} DE 3` : `SERIE ${warmupSet} DI 3`}
            </Text>
            <Text style={styles.warmupCardReps}>
              {isPt ? '10 Repetições de Agachamento' : '10 Ripetizioni di Squat'}
            </Text>
            <Text style={styles.warmupCardSub}>
              {isPt ? 'Descida controlada (2s), subida rápida e explosiva (1s)' : 'Discesa controllata (2s), risalita rapida ed esplosiva (1s)'}
            </Text>

            {isResting ? (
              <View style={styles.restTimerBox}>
                <RotateCcw size={18} color={Colors.primary} />
                <Text style={styles.restTimerText}>
                  {isPt ? `Recuperação Neural: ${warmupRestSeconds}s` : `Recupero Neurale: ${warmupRestSeconds}s`}
                </Text>
                <Text style={styles.restTimerSub}>
                  {isPt ? 'Descanse completamente antes da próxima série' : 'Riposati completamente prima della prossima serie'}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.warmupCompleteBtn}
                onPress={completeWarmupSet}
                activeOpacity={0.88}
              >
                <Check size={18} color="#000000" strokeWidth={3} />
                <Text style={styles.warmupCompleteBtnText}>
                  {warmupSet === 3
                    ? (isPt ? 'CONCLUIR AQUECIMENTO & ABRIR CÂMERA' : 'COMPLETA RISCALDAMENTO & APRI FOTOCAMERA')
                    : (isPt ? `SÉRIE ${warmupSet} CONCLUÍDA` : `SERIE ${warmupSet} COMPLETATA`)}
                </Text>
              </TouchableOpacity>
            )}

            {/* Pontos de Progresso */}
            <View style={styles.warmupDotsRow}>
              {[1, 2, 3].map((s) => (
                <View
                  key={s}
                  style={[
                    styles.warmupDot,
                    warmupSet >= s && styles.warmupDotDone,
                    warmupSet === s && styles.warmupDotActive,
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.warmupTipBox}>
            <ShieldCheck size={14} color="#10B981" />
            <Text style={styles.warmupTipText}>
              {isPt
                ? 'O aquecimento reduz a rigidez passiva e prepara o SNC para expressar a máxima taxa de desenvolvimento de força durante os saltos.'
                : 'Il riscaldamento riduce la rigidità passiva e prepara il SNC a esprimere il massimo tasso di sviluppo della forza durante i salti di test.'}
            </Text>
          </View>
        </ScrollView>
      )}

      {/* ── FASE 3: TESTE COM CÂMERA REAL EM 240FPS & SCRUBBER REAL ── */}
      {phase === 'camera_test' && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <RealJumpCamera
            key={`${currentJumpType}-${currentAttempt}`}
            jumpType={currentJumpType}
            attemptNumber={currentAttempt}
            totalAttempts={3}
            onJumpConfirmed={handleJumpRecorded}
            onBatchJumpsConfirmed={handleBatchJumpsRecorded}
          />
        </ScrollView>
      )}

      {/* ── FASE 4: RESULTADOS & LINHA DE BASE LOTURCO ── */}
      {phase === 'results' && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.topBadge}>
            <Sparkles size={12} color="#10B981" />
            <Text style={[styles.topBadgeText, { color: '#10B981' }]}>
              {isPt ? 'AVALIAÇÃO CONCLUÍDA' : 'VALUTAZIONE COMPLETATA'}
            </Text>
          </View>

          <Text style={styles.screenHeading}>
            {isPt ? 'Sua Baseline Neuromuscular' : 'La Tua Baseline Neuromuscolare'}
          </Text>
          <Text style={styles.screenSubheading}>
            {isPt
              ? 'Perfil validado pelo teste de dupla curva (CMJ vs SJ) do Prof. Dr. Irineu Loturco.'
              : 'Profilo validato tramite il test a doppia curva (CMJ vs SJ) del Prof. Dott. Irineu Loturco.'}
          </Text>

          {/* Grid Resultados CMJ e SJ */}
          <View style={styles.resultsGrid}>
            <View style={styles.resultMetricBox}>
              <Text style={styles.resultMetricLabel}>{isPt ? 'MÉDIA CMJ (Elástico)' : 'MEDIA CMJ (Elastico)'}</Text>
              <Text style={styles.resultMetricValue}>{avgCmj} <Text style={{ fontSize: 16 }}>cm</Text></Text>
              <Text style={styles.resultMetricSub}>{isPt ? '3 tentativas registradas' : '3 tentativi registrati'}</Text>
            </View>

            <View style={styles.resultMetricBox}>
              <Text style={styles.resultMetricLabel}>{isPt ? 'MÉDIA SJ (Concêntrico)' : 'MEDIA SJ (Concentrico)'}</Text>
              <Text style={styles.resultMetricValue}>{avgSj} <Text style={{ fontSize: 16 }}>cm</Text></Text>
              <Text style={styles.resultMetricSub}>{isPt ? '3 tentativas registradas' : '3 tentativi registrati'}</Text>
            </View>
          </View>

          {/* Índice EUR */}
          <View style={styles.eurCard}>
            <View style={styles.eurHeaderRow}>
              <Text style={styles.eurCardTitle}>
                {isPt ? 'Índice EUR (Utilização Elástica)' : 'Indice EUR (Utilizzo Elastico)'}
              </Text>
              <View style={styles.eurBadge}>
                <Text style={styles.eurBadgeValue}>{eurRatio.toFixed(2)}</Text>
              </View>
            </View>
            <Text style={styles.eurDiagnosis}>{getDiagnosisText(eurRatio)}</Text>
          </View>

          {/* Card Próxima Avaliação */}
          <View style={styles.nextEvalCard}>
            <View style={styles.nextEvalHeader}>
              <Calendar size={18} color={Colors.primary} />
              <Text style={styles.nextEvalTitle}>
                {isPt ? 'Próxima Avaliação: em 30 dias' : 'Prossima Valutazione: tra 30 giorni'}
              </Text>
            </View>
            <Text style={styles.nextEvalText}>
              {isPt
                ? 'O sistema nervoso central precisa de 4 semanas de treinos balísticos e recuperação para consolidar os ganhos de impulsão antes do próximo teste oficial.'
                : 'Il sistema nervoso centrale necessita di 4 settimane di allenamenti balistici e recupero per consolidare i guadagni di elevazione prima del prossimo test ufficiale.'}
            </Text>
          </View>

          {/* Botão Único Final */}
          <TouchableOpacity
            style={styles.mainActionBtn}
            onPress={() => navigate('Dashboard')}
            activeOpacity={0.88}
          >
            <Text style={styles.mainActionBtnText}>
              {isPt ? 'VER MEU PLANO DE TREINOS' : 'VEDI IL MIO PIANO DI ALLENAMENTO'}
            </Text>
            <ArrowRight size={20} color="#000000" strokeWidth={3} />
          </TouchableOpacity>
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
  scrollContent: {
    padding: 16,
    paddingVertical: 24,
    maxWidth: 620,
    alignSelf: 'center',
    width: '100%',
    gap: 16,
  },
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
  },
  topBadgeText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  screenHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  screenSubheading: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  ruleCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: '#0D111F',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  ruleNumberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleNumber: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '900',
  },
  ruleTextContent: {
    flex: 1,
  },
  ruleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  ruleDescription: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
  },
  sequenceCard: {
    backgroundColor: '#12172A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    gap: 10,
  },
  sequenceTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.8,
  },
  sequenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sequenceBadge: {
    flex: 1,
    backgroundColor: '#090D1A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  sequenceBadgeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  sequenceBadgeName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  sequenceBadgeSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  mainActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  mainActionBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  // Aquecimento
  warmupProgressCard: {
    backgroundColor: '#0D111F',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
  },
  warmupCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1,
  },
  warmupCardReps: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  warmupCardSub: {
    fontSize: 12,
    color: '#94A3B8',
  },
  restTimerBox: {
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    padding: 16,
    borderRadius: 14,
    width: '100%',
    marginVertical: 8,
  },
  restTimerText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  restTimerSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  warmupCompleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    width: '100%',
    height: 50,
    borderRadius: 14,
    marginTop: 10,
  },
  warmupCompleteBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
  },
  warmupDotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  warmupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1E293B',
  },
  warmupDotDone: {
    backgroundColor: Colors.primary,
  },
  warmupDotActive: {
    width: 24,
    borderRadius: 5,
  },
  warmupTipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#12172A',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  warmupTipText: {
    flex: 1,
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 16,
  },

  // Câmera
  cameraWrapper: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(5, 7, 15, 0.9)',
  },
  cameraTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cameraTypeLabel: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  cameraAttemptLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  fpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  fpsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  fpsText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
  },
  cameraViewfinder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    position: 'relative',
  },
  cameraCenterInstruction: {
    alignItems: 'center',
    maxWidth: 420,
    textAlign: 'center',
  },
  viewfinderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  viewfinderSub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 10,
  },
  viewfinderRule: {
    fontSize: 12,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  startRecordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  startRecordBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
  },
  countdownNumber: {
    fontSize: 84,
    fontWeight: '900',
    color: Colors.primary,
  },
  countdownLabel: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  recordingDotPulse: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    marginBottom: 14,
  },
  recordingTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  recordingSub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
  },
  analyzingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
  },
  analyzingSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  scrubberCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#0D111F',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    gap: 16,
  },
  scrubberHeader: {
    alignItems: 'center',
  },
  scrubberResultValue: {
    fontSize: 42,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -1,
  },
  scrubberResultSub: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  timeMarkersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#12172A',
    padding: 12,
    borderRadius: 12,
  },
  timeMarkerBox: {
    alignItems: 'center',
  },
  timeMarkerLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  timeMarkerValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  confirmJumpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 14,
  },
  confirmJumpBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
  },

  // Resultados
  resultsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  resultMetricBox: {
    flex: 1,
    backgroundColor: '#0D111F',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  resultMetricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  resultMetricValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  resultMetricSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  eurCard: {
    backgroundColor: '#12172A',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    gap: 8,
  },
  eurHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eurCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  eurBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  eurBadgeValue: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  eurDiagnosis: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 17,
  },
  nextEvalCard: {
    backgroundColor: '#0D111F',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  nextEvalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextEvalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  nextEvalText: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
  },
});
