import React, { useState } from 'react';
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
  Activity,
  Calendar,
  Camera,
  ArrowRight,
  Check,
  Zap,
  ShieldCheck,
  Sparkles,
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';
import { VertiCamLogo } from '../components/VertiCamLogo';

export const OnboardingTutorialScreen: React.FC = () => {
  const { navigate, updateProfile } = useApp();

  // Dias de treino selecionados (Padrão: Segunda 1, Quarta 3, Sexta 5)
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 3, 5]);

  const daysOfWeek = [
    { id: 1, label: 'SEG', full: 'Segunda-feira' },
    { id: 2, label: 'TER', full: 'Terça-feira' },
    { id: 3, label: 'QUA', full: 'Quarta-feira' },
    { id: 4, label: 'QUI', full: 'Quinta-feira' },
    { id: 5, label: 'SEX', full: 'Sexta-feira' },
    { id: 6, label: 'SÁB', full: 'Sábado' },
    { id: 0, label: 'DOM', full: 'Domingo' },
  ];

  const toggleDay = (dayId: number) => {
    if (selectedDays.includes(dayId)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== dayId));
      }
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
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
            <Text style={styles.welcomePillText}>COMO FUNCIONA O VERTICAM</Text>
          </View>
          <Text style={styles.mainTitle}>3 Passos para Maximizar sua Impulsão</Text>
          <Text style={styles.mainSubtitle}>
            Um método científico baseado no pesquisador Prof. Dr. Irineu Loturco. Sem exercícios aleatórios, apenas potência neuromuscular pura.
          </Text>
        </View>

        {/* ── CARD 1: AVALIAÇÃO INICIAL ── */}
        <View style={styles.tutorialCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>1</Text>
            </View>
            <View style={styles.cardHeaderTexts}>
              <Text style={styles.cardCategory}>PRIMEIRO PASSO</Text>
              <Text style={styles.cardTitle}>Avaliação Inicial (Linha de Base)</Text>
            </View>
            <View style={styles.iconCircle}>
              <Activity size={20} color={Colors.primary} strokeWidth={2.5} />
            </View>
          </View>

          <Text style={styles.cardDescription}>
            Antes de prescrever qualquer carga, a câmera de alta precisão calcula seu tempo de voo com dois testes fundamentais:
          </Text>

          <View style={styles.subItemsBox}>
            <View style={styles.subItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.subItemText}>
                <Text style={styles.boldText}>CMJ (Salto com contramovimento):</Text> mede a força elástica e a reatividade dos seus tendões.
              </Text>
            </View>

            <View style={styles.subItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.subItemText}>
                <Text style={styles.boldText}>SJ (Salto sem contramovimento):</Text> mede a força concêntrica pura partindo estático a 90°.
              </Text>
            </View>
          </View>

          <View style={styles.formulaPill}>
            <Text style={styles.formulaPillText}>
              💡 O índice EUR (CMJ ÷ SJ) revelará exatamente o seu déficit neuromuscular de impulsão.
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
              <Text style={styles.cardCategory}>PLANEJAMENTO SEMANAL</Text>
              <Text style={styles.cardTitle}>Seus Dias de Treino</Text>
            </View>
            <View style={styles.iconCircle}>
              <Calendar size={20} color={Colors.primary} strokeWidth={2.5} />
            </View>
          </View>

          <Text style={styles.cardDescription}>
            Escolha os dias da semana em que você vai treinar. Para o sistema nervoso central, <Text style={styles.boldText}>2 ou 3 sessões balísticas</Text> com recuperação total são a fórmula ideal para ganhar centímetros reais:
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

          <View style={styles.daysSummaryRow}>
            <Zap size={13} color="#10B981" />
            <Text style={styles.daysSummaryText}>
              Frequência: <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{selectedDays.length} dias na semana</Text> (ideal para recuperação neural)
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
              <Text style={styles.cardCategory}>TECNOLOGIA DA CÂMERA</Text>
              <Text style={styles.cardTitle}>Monitoramento Simultâneo de Carga e Volume</Text>
            </View>
            <View style={styles.iconCircle}>
              <Camera size={20} color={Colors.primary} strokeWidth={2.5} />
            </View>
          </View>

          <Text style={styles.cardDescription}>
            Durante todo o treino, a câmera acompanha cada repetição do seu <Text style={styles.boldText}>Salto com Carga (Loaded Jump)</Text>:
          </Text>

          <View style={styles.loturcoHighlightBox}>
            <View style={styles.loturcoHeader}>
              <ShieldCheck size={14} color={Colors.primary} />
              <Text style={styles.loturcoTitle}>Princípio de Irineu Loturco (Loss of Velocity):</Text>
            </View>
            <Text style={styles.loturcoBody}>
              Se a altura ou velocidade do seu salto cair mais de <Text style={{ color: '#FBBF24', fontWeight: '800' }}>10%</Text>, o app diminui a carga ou encerra a série na hora. Isso garante que você só treine as fibras rápidas com máxima explosão, sem fadiga crônica.
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
            <Text style={styles.singleActionButtonText}>FAZER AVALIAÇÃO INICIAL</Text>
            <ArrowRight size={20} color="#000000" strokeWidth={3} />
          </TouchableOpacity>
          <Text style={styles.ctaSubtext}>
            Duração estimada: ~4 minutos • Tenha espaço livre para saltar
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
