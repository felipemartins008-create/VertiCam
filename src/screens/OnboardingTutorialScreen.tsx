import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TextInput,
} from 'react-native';
import {
  Activity,
  Calendar,
  Camera,
  ArrowRight,
  ArrowLeft,
  Check,
  Zap,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';
import { VertiCamLogo } from '../components/VertiCamLogo';

const DAY_CYCLE = [1, 2, 3, 4, 5, 6, 0]; // Seg, Ter, Qua, Qui, Sex, Sáb, Dom
const getCycleIndex = (dayId: number) => DAY_CYCLE.indexOf(dayId);

const areDaysConsecutive = (dayA: number, dayB: number): boolean => {
  const idxA = getCycleIndex(dayA);
  const idxB = getCycleIndex(dayB);
  if (idxA === -1 || idxB === -1) return false;
  const diff = Math.abs(idxA - idxB);
  return diff === 1 || diff === 6; // diff === 6 é Dom (idx 6) e Seg (idx 0)
};

export const OnboardingTutorialScreen: React.FC = () => {
  const { navigate, userProfile, updateProfile, updateBaseline, language, setLanguage } = useApp();
  const isPt = language === 'pt';

  // Wizard passo a passo: 1 = Dados/Boas-vindas, 2 = Dias de Treino, 3 = Protocolo de Avaliação
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Dados físicos caso o atleta tenha entrado sem preenchê-los
  const [weightInput, setWeightInput] = useState<string>(
    userProfile.weightKg > 0 ? String(userProfile.weightKg) : ''
  );
  const [heightInput, setHeightInput] = useState<string>(
    userProfile.heightCm > 0 ? String(userProfile.heightCm) : ''
  );
  const [bioError, setBioError] = useState<string | null>(null);

  // Dias de treino selecionados: NENHUM pré-selecionado para deixar o aluno escolher
  const [selectedDays, setSelectedDays] = useState<number[]>(
    userProfile.workoutDays && userProfile.workoutDays.length > 0 ? userProfile.workoutDays : []
  );
  const [consecutiveWarning, setConsecutiveWarning] = useState<string | null>(null);

  const daysOfWeek = isPt ? [
    { id: 1, label: 'SEG', full: 'Segunda-feira' },
    { id: 2, label: 'TER', full: 'Terça-feira' },
    { id: 3, label: 'QUA', full: 'Quarta-feira' },
    { id: 4, label: 'QUI', full: 'Quinta-feira' },
    { id: 5, label: 'SEX', full: 'Sexta-feira' },
    { id: 6, label: 'SÁB', full: 'Sábado' },
    { id: 0, label: 'DOM', full: 'Domingo' },
  ] : [
    { id: 1, label: 'LUN', full: 'Lunedì' },
    { id: 2, label: 'MAR', full: 'Martedì' },
    { id: 3, label: 'MER', full: 'Mercoledì' },
    { id: 4, label: 'GIO', full: 'Giovedì' },
    { id: 5, label: 'VEN', full: 'Venerdì' },
    { id: 6, label: 'SAB', full: 'Sabato' },
    { id: 0, label: 'DOM', full: 'Domenica' },
  ];

  const toggleDay = (dayId: number) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayId));
      setConsecutiveWarning(null);
    } else {
      // Verifica se o dia clicado é consecutivo a algum dia já selecionado
      const hasConsecutive = selectedDays.some((existingDay) =>
        areDaysConsecutive(dayId, existingDay)
      );

      if (hasConsecutive) {
        setConsecutiveWarning(
          isPt
            ? '⚠️ Dias consecutivos bloqueados! O Sistema Nervoso Central (SNC) precisa de pelo menos 1 dia inteiro de recuperação entre sessões balísticas (Método Loturco). Escolha dias alternados para proteger seus tendões.'
            : '⚠️ Giorni consecutivi bloccati! Il Sistema Nervoso Centrale (SNC) necessita di almeno 1 giorno intero di recupero tra sessioni balistiche (Metodo Loturco). Scegli giorni alternati per proteggere i tuoi tendini.'
        );
        return;
      }

      setConsecutiveWarning(null);
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const applyPreset = (presetDays: number[]) => {
    setSelectedDays(presetDays);
    setConsecutiveWarning(null);
  };

  const handleStep1Continue = async () => {
    setBioError(null);
    const w = parseFloat(weightInput);
    const h = parseFloat(heightInput);
    if (isNaN(w) || w < 40 || w > 180) {
      setBioError(isPt ? 'Informe um peso válido entre 40 e 180 kg.' : 'Inserisci un peso valido tra 40 e 180 kg.');
      return;
    }
    if (isNaN(h) || h < 130 || h > 235) {
      setBioError(isPt ? 'Informe uma altura válida entre 130 e 235 cm.' : 'Inserisci un\'altezza valida tra 130 e 235 cm.');
      return;
    }
    await updateProfile({ weightKg: w, heightCm: h });
    updateBaseline({ user_weight: w, user_height: h });
    setStep(2);
  };

  const handleStep2Continue = async () => {
    if (selectedDays.length === 0) {
      setConsecutiveWarning(
        isPt
          ? 'Por favor, selecione pelo menos 1 dia da semana para treinar.'
          : 'Per favore, seleziona almeno 1 giorno di allenamento.'
      );
      return;
    }
    await updateProfile({ workoutDays: selectedDays });
    setStep(3);
  };

  const handleStartInitialEvaluation = async () => {
    await updateProfile({
      workoutDays: selectedDays,
    });
    navigate('BaselineEvaluation');
  };

  const windowWidth = Dimensions.get('window').width;
  const isDesktop = windowWidth >= 768;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, isDesktop && styles.scrollContentDesktop]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Logo, Voltar & Idioma */}
        <View style={styles.topHeader}>
          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            {step > 1 ? (
              <TouchableOpacity
                onPress={() => setStep((step - 1) as 1 | 2)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 8 }}
                activeOpacity={0.8}
              >
                <ArrowLeft size={16} color="#94A3B8" />
                <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '700' }}>
                  {isPt ? 'Voltar' : 'Indietro'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 64 }} />
            )}
            <VertiCamLogo size="medium" />
            <TouchableOpacity
              onPress={() => setLanguage(isPt ? 'it' : 'pt')}
              style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>{isPt ? '🇧🇷 PT' : '🇮🇹 IT'}</Text>
            </TouchableOpacity>
          </View>

          {/* Barra de Progresso Didática */}
          <View style={{ width: '100%', marginTop: 14, gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: Colors.primary, letterSpacing: 0.6 }}>
                {isPt ? `PASSO ${step} DE 4` : `PASSO ${step} DI 4`}
              </Text>
              <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '600' }}>
                {step === 1 && (isPt ? 'Seus Dados' : 'I Tuoi Dati')}
                {step === 2 && (isPt ? 'Dias de Treino' : 'Giorni di Allenamento')}
                {step === 3 && (isPt ? 'Preparar Avaliação' : 'Prepara Valutazione')}
              </Text>
            </View>
            <View style={{ height: 6, width: '100%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${(step / 4) * 100}%`, backgroundColor: Colors.primary, borderRadius: 3 }} />
            </View>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════════
            PASSO 1: DADOS BÁSICOS + BOAS-VINDAS DIDÁTICAS
        ══════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <View style={{ width: '100%', gap: 16 }}>
            <View style={{ alignItems: 'center', marginBottom: 4 }}>
              <Text style={styles.mainTitle}>
                {isPt ? 'Bem-vindo ao seu Treino Personalizado' : 'Benvenuto nel Tuo Allenamento'}
              </Text>
              <Text style={styles.mainSubtitle}>
                {isPt
                  ? 'Antes de montar sua rotina de treinos, vamos fazer 3 passos rápidos para calibrar o app exatamente para o seu corpo.'
                  : 'Prima di creare la tua routine, faremo 3 rapidi passaggi per calibrare l\'app sul tuo corpo.'}
              </Text>
            </View>

            <View style={styles.tutorialCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>1</Text>
                </View>
                <View style={styles.cardHeaderTexts}>
                  <Text style={styles.cardCategory}>{isPt ? 'SEUS PARÂMETROS' : 'I TUOI PARAMETRI'}</Text>
                  <Text style={styles.cardTitle}>{isPt ? 'Confirme seu Peso e Altura' : 'Conferma Peso e Altezza'}</Text>
                </View>
              </View>

              <Text style={styles.cardDescription}>
                {isPt
                  ? 'Esses dois dados são usados para calcular sua carga ideal de salto (OPL) com segurança.'
                  : 'Questi due dati servono per calcolare con precisione il tuo carico ottimale (OPL).'}
              </Text>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#94A3B8' }}>
                    {isPt ? 'Peso (kg)' : 'Peso (kg)'}
                  </Text>
                  <TextInput
                    value={weightInput}
                    onChangeText={setWeightInput}
                    keyboardType="numeric"
                    placeholder="78"
                    placeholderTextColor="#475569"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.14)',
                      borderRadius: 12,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      color: '#FFFFFF',
                      fontSize: 16,
                      fontWeight: '700',
                    }}
                  />
                </View>

                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#94A3B8' }}>
                    {isPt ? 'Altura (cm)' : 'Altezza (cm)'}
                  </Text>
                  <TextInput
                    value={heightInput}
                    onChangeText={setHeightInput}
                    keyboardType="numeric"
                    placeholder="185"
                    placeholderTextColor="#475569"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.14)',
                      borderRadius: 12,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      color: '#FFFFFF',
                      fontSize: 16,
                      fontWeight: '700',
                    }}
                  />
                </View>
              </View>

              {bioError && (
                <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '700' }}>{bioError}</Text>
              )}
            </View>

            <View style={styles.ctaBottomContainer}>
              <TouchableOpacity
                style={styles.singleActionButton}
                onPress={handleStep1Continue}
                activeOpacity={0.88}
              >
                <Text style={styles.singleActionButtonText}>
                  {isPt ? 'CONTINUAR' : 'CONTINUA'}
                </Text>
                <ArrowRight size={20} color="#000000" strokeWidth={3} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PASSO 2: ESCOLHA DOS DIAS DE TREINO
        ══════════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <View style={{ width: '100%', gap: 16 }}>
            <View style={{ alignItems: 'center', marginBottom: 4 }}>
              <Text style={styles.mainTitle}>
                {isPt ? 'Quando Você Quer Treinar?' : 'Quando Vuoi Allenarti?'}
              </Text>
              <Text style={styles.mainSubtitle}>
                {isPt
                  ? 'Escolha os dias da sua semana. Recomendamos 2 ou 3 dias alternados para o sistema nervoso recuperar 100%.'
                  : 'Scegli i tuoi giorni settimanali. Consigliamo 2 o 3 giorni alternati per il recupero completo del SNC.'}
              </Text>
            </View>

            <View style={styles.tutorialCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>2</Text>
                </View>
                <View style={styles.cardHeaderTexts}>
                  <Text style={styles.cardCategory}>{isPt ? 'PLANEJAMENTO SEMANAL' : 'PIANIFICAZIONE SETTIMANALE'}</Text>
                  <Text style={styles.cardTitle}>{isPt ? 'Seus Dias de Treino' : 'I Tuoi Giorni di Allenamento'}</Text>
                </View>
                <View style={styles.iconCircle}>
                  <Calendar size={20} color={Colors.primary} strokeWidth={2.5} />
                </View>
              </View>

              {/* Seletor Dias da Semana */}
              <View style={styles.daysSelectorRow}>
                {daysOfWeek.map((day) => {
                  const isSelected = selectedDays.includes(day.id);
                  return (
                    <TouchableOpacity
                      key={day.id}
                      style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
                      onPress={() => toggleDay(day.id)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.dayButtonText, isSelected && styles.dayButtonTextSelected]}>
                        {day.label}
                      </Text>
                      {isSelected && (
                        <View style={styles.daySelectedDot}>
                          <Check size={8} color="#000000" strokeWidth={3.5} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Alerta de Dias Consecutivos Bloqueados */}
              {consecutiveWarning && (
                <View style={styles.consecutiveWarningBox}>
                  <AlertTriangle size={18} color="#F59E0B" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.consecutiveWarningTitle}>
                      {isPt ? 'Descanso Obrigatório de 1 Dia' : 'Riposo Obbligatorio di 1 Giorno'}
                    </Text>
                    <Text style={styles.consecutiveWarningText}>{consecutiveWarning}</Text>
                  </View>
                </View>
              )}

              {/* Sugestões Rápidas Seguras */}
              <View style={styles.presetsContainer}>
                <Text style={styles.presetsLabel}>
                  {isPt ? 'SUGESTÕES RÁPIDAS:' : 'SUGGERIMENTI RAPIDI:'}
                </Text>
                <View style={styles.presetButtonsRow}>
                  <TouchableOpacity
                    style={[
                      styles.presetBtn,
                      selectedDays.length === 3 && selectedDays.includes(1) && selectedDays.includes(3) && selectedDays.includes(5) && styles.presetBtnActive,
                    ]}
                    onPress={() => applyPreset([1, 3, 5])}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.presetBtnText}>
                      {isPt ? 'Seg / Qua / Sex (Recomendado)' : 'Lun / Mer / Ven (Consigliato)'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.presetBtn,
                      selectedDays.length === 3 && selectedDays.includes(2) && selectedDays.includes(4) && selectedDays.includes(6) && styles.presetBtnActive,
                    ]}
                    onPress={() => applyPreset([2, 4, 6])}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.presetBtnText}>
                      {isPt ? 'Ter / Qui / Sáb' : 'Mar / Gio / Sab'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.daysSummaryRow}>
                <Zap size={13} color={selectedDays.length > 0 ? "#10B981" : "#94A3B8"} />
                <Text style={styles.daysSummaryText}>
                  {selectedDays.length > 0 ? (
                    isPt ? (
                      <>Selecionado: <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{selectedDays.length} {selectedDays.length === 1 ? 'dia' : 'dias'} por semana</Text></>
                    ) : (
                      <>Selezionato: <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{selectedDays.length} {selectedDays.length === 1 ? 'giorno' : 'giorni'} a settimana</Text></>
                    )
                  ) : (
                    isPt
                      ? 'Nenhum dia selecionado. Toque nos dias acima para montar sua semana.'
                      : 'Nessun giorno selezionato. Tocca i giorni sopra per comporre la tua settimana.'
                  )}
                </Text>
              </View>
            </View>

            <View style={styles.ctaBottomContainer}>
              <TouchableOpacity
                style={[styles.singleActionButton, selectedDays.length === 0 && { opacity: 0.5 }]}
                onPress={handleStep2Continue}
                activeOpacity={0.88}
              >
                <Text style={styles.singleActionButtonText}>
                  {isPt ? 'CONFIRMAR DIAS E CONTINUAR' : 'CONFERMA GIORNI E CONTINUA'}
                </Text>
                <ArrowRight size={20} color="#000000" strokeWidth={3} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PASSO 3: EXPLICAÇÃO DIDÁTICA DA AVALIAÇÃO INICIAL
        ══════════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <View style={{ width: '100%', gap: 16 }}>
            <View style={{ alignItems: 'center', marginBottom: 4 }}>
              <Text style={styles.mainTitle}>
                {isPt ? 'Agora: Sua Avaliação Inicial' : 'Ora: La Tua Valutazione Iniziale'}
              </Text>
              <Text style={styles.mainSubtitle}>
                {isPt
                  ? 'Para liberar sua rotina de treinos personalizada, vamos medir sua altura de salto real pela câmera.'
                  : 'Per sbloccare la tua routine personalizzata, misureremo il tuo salto reale con la fotocamera.'}
              </Text>
            </View>

            <View style={styles.tutorialCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>3</Text>
                </View>
                <View style={styles.cardHeaderTexts}>
                  <Text style={styles.cardCategory}>{isPt ? 'O QUE VAI ACONTECER' : 'COSA FAREMO ORA'}</Text>
                  <Text style={styles.cardTitle}>{isPt ? 'Protocolo Rápido em 2 Fases' : 'Protocollo Rapido in 2 Fasi'}</Text>
                </View>
                <View style={styles.iconCircle}>
                  <Camera size={20} color={Colors.primary} strokeWidth={2.5} />
                </View>
              </View>

              <View style={styles.subItemsBox}>
                <View style={styles.subItem}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.subItemText}>
                    <Text style={styles.boldText}>{isPt ? '1. Aquecimento Guiado:' : '1. Riscaldamento Guidato:'}</Text>{' '}
                    {isPt ? '3 séries rápidas de 10 agachamentos para preparar os tendões.' : '3 rapide serie da 10 squat per preparare i tendini.'}
                  </Text>
                </View>

                <View style={styles.subItem}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.subItemText}>
                    <Text style={styles.boldText}>{isPt ? '2. 3x Saltos CMJ + 3x Saltos SJ:' : '2. 3x Salti CMJ + 3x Salti SJ:'}</Text>{' '}
                    {isPt ? 'mãos na cintura, com a câmera medindo seu tempo de voo real.' : 'mani sui fianchi, con la fotocamera che misura il tempo di volo reale.'}
                  </Text>
                </View>

                <View style={styles.subItem}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.subItemText}>
                    <Text style={styles.boldText}>{isPt ? '3. Liberação da Rotina:' : '3. Sblocco della Routine:'}</Text>{' '}
                    {isPt ? 'calculamos seu Índice EUR e carga OPL exata e liberamos seus treinos!' : 'calcoliamo il tuo Indice EUR e carico OPL esatto e sblocchiamo i tuoi allenamenti!'}
                  </Text>
                </View>
              </View>

              <View style={styles.loturcoHighlightBox}>
                <View style={styles.loturcoHeader}>
                  <ShieldCheck size={14} color={Colors.primary} />
                  <Text style={styles.loturcoTitle}>
                    {isPt ? 'Dica Importante:' : 'Consiglio Importante:'}
                  </Text>
                </View>
                <Text style={styles.loturcoBody}>
                  {isPt
                    ? 'Apoie o celular a cerca de 2 metros de distância de forma que seu corpo inteiro apareça na tela.'
                    : 'Appoggia il telefono a circa 2 metri di distanza in modo che tutto il tuo corpo sia visibile.'}
                </Text>
              </View>
            </View>

            <View style={styles.ctaBottomContainer}>
              <TouchableOpacity
                style={styles.singleActionButton}
                onPress={handleStartInitialEvaluation}
                activeOpacity={0.88}
              >
                <Text style={styles.singleActionButtonText}>
                  {isPt ? 'IR PARA AVALIAÇÃO NA CÂMERA' : 'VAI ALLA VALUTAZIONE CON FOTOCAMERA'}
                </Text>
                <ArrowRight size={20} color="#000000" strokeWidth={3} />
              </TouchableOpacity>
              <Text style={styles.ctaSubtext}>
                {isPt
                  ? 'Duração estimada: ~4 minutos • Depois disso sua rotina será liberada'
                  : 'Durata stimata: ~4 minuti • Dopodiché la tua routine sarà sbloccata'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
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
    paddingVertical: 28,
    alignItems: 'center',
    gap: 16,
  },
  scrollContentDesktop: {
    maxWidth: 680,
    alignSelf: 'center',
    width: '100%',
  },
  topHeader: {
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    marginTop: 14,
    marginBottom: 10,
  },
  welcomePillText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  mainSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 480,
  },
  tutorialCard: {
    width: '100%',
    backgroundColor: '#0D111F',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
  },
  cardHeaderTexts: {
    flex: 1,
  },
  cardCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDescription: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 19,
    marginBottom: 12,
  },
  subItemsBox: {
    gap: 8,
    backgroundColor: '#12172A',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 10,
  },
  subItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 6,
  },
  subItemText: {
    flex: 1,
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
  },
  boldText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  formulaPill: {
    backgroundColor: 'rgba(0, 229, 255, 0.06)',
    padding: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  formulaPillText: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
  },

  // Dias da Semana
  daysSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginVertical: 12,
  },
  dayButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#13182C',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
  },
  dayButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  dayButtonTextSelected: {
    color: '#000000',
    fontWeight: '900',
  },
  daySelectedDot: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  daysSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  daysSummaryText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  consecutiveWarningBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    marginVertical: 4,
  },
  consecutiveWarningTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F59E0B',
    marginBottom: 2,
  },
  consecutiveWarningText: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  presetsContainer: {
    gap: 6,
    marginVertical: 4,
  },
  presetsLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  presetButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetBtn: {
    backgroundColor: '#12172A',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  presetBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
  },
  presetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Loturco Box
  loturcoHighlightBox: {
    backgroundColor: '#12172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    gap: 6,
  },
  loturcoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  loturcoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  loturcoBody: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 17,
  },

  // CTA Bottom
  ctaBottomContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    gap: 8,
  },
  singleActionButton: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  singleActionButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  ctaSubtext: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
});
