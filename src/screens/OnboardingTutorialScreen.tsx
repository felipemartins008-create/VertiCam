import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Activity,
  Calendar,
  Camera,
  ArrowRight,
  Check,
  Zap,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Info,
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
  const { navigate, updateProfile } = useApp();

  // Dias de treino selecionados (Padrão: Segunda 1, Quarta 3, Sexta 5)
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 3, 5]);
  const [consecutiveWarning, setConsecutiveWarning] = useState<string | null>(null);

  const daysOfWeek = [
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
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== dayId));
        setConsecutiveWarning(null);
      } else {
        setConsecutiveWarning('Seleziona almeno 1 giorno di allenamento.');
      }
    } else {
      // Verifica se o dia clicado é consecutivo a algum dia já selecionado
      const hasConsecutive = selectedDays.some((existingDay) =>
        areDaysConsecutive(dayId, existingDay)
      );

      if (hasConsecutive) {
        setConsecutiveWarning(
          `⚠️ Giorni consecutivi bloccati! Il Sistema Nervoso Centrale (SNC) necessita di almeno 1 giorno intero di recupero tra sessioni balistiche (Metodo Loturco). Scegli giorni alternati per proteggere i tuoi tendini.`
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
        {/* Header Logo & Titulo */}
        <View style={styles.topHeader}>
          <VertiCamLogo size="medium" />
          <View style={styles.welcomePill}>
            <Sparkles size={12} color={Colors.primary} />
            <Text style={styles.welcomePillText}>COME FUNZIONA VERTICAM</Text>
          </View>
          <Text style={styles.mainTitle}>3 Passaggi per Massimizzare la Tua Elevazione</Text>
          <Text style={styles.mainSubtitle}>
            Un metodo scientifico basato sulle ricerche del Prof. Dott. Irineu Loturco. Nessun esercizio casuale, solo pura potenza neuromuscolare.
          </Text>
        </View>

        {/* ── CARD 1: AVALIAÇÃO INICIAL ── */}
        <View style={styles.tutorialCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>1</Text>
            </View>
            <View style={styles.cardHeaderTexts}>
              <Text style={styles.cardCategory}>PRIMO PASSO</Text>
              <Text style={styles.cardTitle}>Valutazione Iniziale (Baseline)</Text>
            </View>
            <View style={styles.iconCircle}>
              <Activity size={20} color={Colors.primary} strokeWidth={2.5} />
            </View>
          </View>

          <Text style={styles.cardDescription}>
            Prima di calcolare qualsiasi carico, la fotocamera ad alta precisione misura il tuo tempo di volo con due test fondamentali:
          </Text>

          <View style={styles.subItemsBox}>
            <View style={styles.subItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.subItemText}>
                <Text style={styles.boldText}>CMJ (Salto con contromovimento):</Text> misura la forza elastica e la reattività dei tuoi tendini.
              </Text>
            </View>

            <View style={styles.subItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.subItemText}>
                <Text style={styles.boldText}>SJ (Salto senza contromovimento / Squat Jump):</Text> misura la forza concentrica pura partendo da fermo a 90°.
              </Text>
            </View>
          </View>

          <View style={styles.formulaPill}>
            <Text style={styles.formulaPillText}>
              💡 L'indice EUR (CMJ ÷ SJ) evidenzierà con precisione il tuo deficit neuromuscolare di salto.
            </Text>
          </View>
        </View>

        {/* ── CARD 2: DIAS DE TREINO ── */}
        <View style={styles.tutorialCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>2</Text>
            </View>
            <View style={styles.cardHeaderTexts}>
              <Text style={styles.cardCategory}>PIANIFICAZIONE SETTIMANALE</Text>
              <Text style={styles.cardTitle}>I Tuoi Giorni di Allenamento</Text>
            </View>
            <View style={styles.iconCircle}>
              <Calendar size={20} color={Colors.primary} strokeWidth={2.5} />
            </View>
          </View>

          <Text style={styles.cardDescription}>
            Seleziona i giorni della settimana in cui allenarti. Per il sistema nervoso centrale, <Text style={styles.boldText}>2 o 3 sessioni balistiche</Text> con recupero completo rappresentano la formula ideale per guadagnare centimetri reali:
          </Text>

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
                <Text style={styles.consecutiveWarningTitle}>Riposo Obbligatorio di 1 Giorno</Text>
                <Text style={styles.consecutiveWarningText}>{consecutiveWarning}</Text>
              </View>
            </View>
          )}

          {/* Sugestões Rápidas Seguras */}
          <View style={styles.presetsContainer}>
            <Text style={styles.presetsLabel}>PERIODIZZAZIONI SUGGERITE LOTURCO:</Text>
            <View style={styles.presetButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.presetBtn,
                  selectedDays.length === 3 && selectedDays.includes(1) && selectedDays.includes(3) && selectedDays.includes(5) && styles.presetBtnActive,
                ]}
                onPress={() => applyPreset([1, 3, 5])}
                activeOpacity={0.8}
              >
                <Text style={styles.presetBtnText}>Lun / Mer / Ven (Consigliato)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.presetBtn,
                  selectedDays.length === 3 && selectedDays.includes(2) && selectedDays.includes(4) && selectedDays.includes(6) && styles.presetBtnActive,
                ]}
                onPress={() => applyPreset([2, 4, 6])}
                activeOpacity={0.8}
              >
                <Text style={styles.presetBtnText}>Mar / Gio / Sab</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.daysSummaryRow}>
            <Zap size={13} color="#10B981" />
            <Text style={styles.daysSummaryText}>
              Frequenza: <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{selectedDays.length} giorni a settimana</Text> (con recupero completo del SNC tra le sessioni)
            </Text>
          </View>
        </View>

        {/* ── CARD 3: MONITORAMENTO SIMULTÂNEO COM CÂMERA ── */}
        <View style={styles.tutorialCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>3</Text>
            </View>
            <View style={styles.cardHeaderTexts}>
              <Text style={styles.cardCategory}>TECNOLOGIA VIDEO IA</Text>
              <Text style={styles.cardTitle}>Monitoraggio Simultaneo di Carico e Volume</Text>
            </View>
            <View style={styles.iconCircle}>
              <Camera size={20} color={Colors.primary} strokeWidth={2.5} />
            </View>
          </View>

          <Text style={styles.cardDescription}>
            Durante l'intero allenamento, la fotocamera analizza ogni singola ripetizione del tuo <Text style={styles.boldText}>Salto con Sovraccarico (Loaded Jump)</Text>:
          </Text>

          <View style={styles.loturcoHighlightBox}>
            <View style={styles.loturcoHeader}>
              <ShieldCheck size={14} color={Colors.primary} />
              <Text style={styles.loturcoTitle}>Principio di Irineu Loturco (Loss of Velocity):</Text>
            </View>
            <Text style={styles.loturcoBody}>
              Se l'altezza o la velocità del tuo salto cala di oltre il <Text style={{ color: '#FBBF24', fontWeight: '800' }}>10%</Text>, l'app riduce il carico o interrompe immediatamente la serie. Questo garantisce di stimolare solo le fibre rapide con massima esplosività, senza accumulare fatica cronica.
            </Text>
          </View>
        </View>

        {/* ── BOTÃO ÚNICO DE AÇÃO ── */}
        <View style={styles.ctaBottomContainer}>
          <TouchableOpacity
            style={styles.singleActionButton}
            onPress={handleStartInitialEvaluation}
            activeOpacity={0.88}
          >
            <Text style={styles.singleActionButtonText}>ESEGUI VALUTAZIONE INIZIALE</Text>
            <ArrowRight size={20} color="#000000" strokeWidth={3} />
          </TouchableOpacity>
          <Text style={styles.ctaSubtext}>
            Durata stimata: ~4 minuti • Assicurati di avere spazio libero per saltare
          </Text>
        </View>
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
