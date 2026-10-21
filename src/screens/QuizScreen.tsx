import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Activity,
  ShieldAlert,
  Flame,
  Zap,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useApp } from '../context/AppContext';
import { VolleyballPosition, ExperienceLevel, AthleteGoal } from '../types';
import { t } from '../services/i18n';
import { estimateStandingReach } from '../utils/jumpPhysics';

export const QuizScreen: React.FC = () => {
  const { userProfile, updateProfile, navigate } = useApp();
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [selectedPosition, setSelectedPosition] = useState<VolleyballPosition>(
    userProfile.position || 'outside'
  );
  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel>(
    userProfile.level || 'intermediate'
  );
  const [selectedGoals, setSelectedGoals] = useState<AthleteGoal[]>(
    userProfile.goals.length ? userProfile.goals : ['higher_jump', 'jumper_knee']
  );
  const [age, setAge] = useState<string>(String(userProfile.age || 21));
  const [height, setHeight] = useState<string>(String(userProfile.heightCm || 192));
  const [weight, setWeight] = useState<string>(String(userProfile.weightKg || 84));

  const toggleGoal = (goal: AthleteGoal) => {
    if (selectedGoals.includes(goal)) {
      if (selectedGoals.length > 1) {
        setSelectedGoals(selectedGoals.filter((g) => g !== goal));
      }
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleNext = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Zapisz zebrane dane i przejdź do wprowadzenia testu kamery
      const heightNum = parseFloat(height) || 190;
      const calculatedStandingReach = estimateStandingReach(heightNum);

      await updateProfile({
        position: selectedPosition,
        level: selectedLevel,
        goals: selectedGoals,
        age: parseInt(age, 10) || 20,
        heightCm: heightNum,
        weightKg: parseFloat(weight) || 80,
        standingReachCm: calculatedStandingReach,
      });

      navigate('CameraIntro');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('Welcome');
    }
  };

  const positionsList: { id: VolleyballPosition; label: string; desc: string }[] = [
    { id: 'outside', label: t('quiz.positions.outside'), desc: 'Rincorsa dinamica, elevato volume di attacchi ripetuti' },
    { id: 'opposite', label: t('quiz.positions.opposite'), desc: 'Massima potenza d\'attacco, salto potente anche da seconda linea' },
    { id: 'middle', label: t('quiz.positions.middle'), desc: 'Lettura rapida del gioco, salto reattivo a muro' },
    { id: 'setter', label: t('quiz.positions.setter'), desc: 'Elevazione per il palleggio in salto, rapidi cambi di direzione' },
    { id: 'libero', label: t('quiz.positions.libero'), desc: 'Agilità esplosiva, massima reattività articolare delle caviglie' },
    { id: 'beach', label: t('quiz.positions.beach'), desc: 'Fondo sabbioso impegnativo, massima efficienza e forza tendinea' },
  ];

  const levelsList: { id: ExperienceLevel; title: string; desc: string }[] = [
    { id: 'beginner', title: t('quiz.levels.beginner.title'), desc: t('quiz.levels.beginner.desc') },
    { id: 'intermediate', title: t('quiz.levels.intermediate.title'), desc: t('quiz.levels.intermediate.desc') },
    { id: 'advanced', title: t('quiz.levels.advanced.title'), desc: t('quiz.levels.advanced.desc') },
  ];

  const goalsList: { id: AthleteGoal; title: string; desc: string; icon: any }[] = [
    {
      id: 'jumper_knee',
      title: t('quiz.pains.jumper_knee.title'),
      desc: t('quiz.pains.jumper_knee.desc'),
      icon: <ShieldAlert size={22} color={Colors.secondary} />,
    },
    {
      id: 'higher_jump',
      title: t('quiz.pains.higher_jump.title'),
      desc: t('quiz.pains.higher_jump.desc'),
      icon: <Flame size={22} color={Colors.primary} />,
    },
    {
      id: 'dynamism',
      title: t('quiz.pains.dynamism.title'),
      desc: t('quiz.pains.dynamism.desc'),
      icon: <Zap size={22} color={Colors.accentBlue} />,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header
        showBack
        onBack={handleBack}
        title={t('quiz.step', { current: currentStep, total: 4 })}
      />

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${(currentStep / 4) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* KROK 1: POZYCJA */}
        {currentStep === 1 && (
          <View>
            <Text style={styles.stepTitle}>{t('quiz.step1Title')}</Text>
            <Text style={styles.stepSubtitle}>{t('quiz.step1Subtitle')}</Text>

            <View style={styles.listContainer}>
              {positionsList.map((pos) => {
                const isSelected = selectedPosition === pos.id;
                return (
                  <TouchableOpacity
                    key={pos.id}
                    activeOpacity={0.8}
                    style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                    onPress={() => setSelectedPosition(pos.id)}
                  >
                    <View style={styles.optionHeader}>
                      <Text style={[styles.optionTitle, isSelected && styles.textSelected]}>
                        {pos.label}
                      </Text>
                      {isSelected ? (
                        <CheckCircle2 size={20} color={Colors.primary} />
                      ) : (
                        <Circle size={20} color={Colors.textMuted} />
                      )}
                    </View>
                    <Text style={styles.optionDesc}>{pos.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* KROK 2: POZIOM ZAAWANSOWANIA */}
        {currentStep === 2 && (
          <View>
            <Text style={styles.stepTitle}>{t('quiz.step2Title')}</Text>
            <Text style={styles.stepSubtitle}>{t('quiz.step2Subtitle')}</Text>

            <View style={styles.listContainer}>
              {levelsList.map((lvl) => {
                const isSelected = selectedLevel === lvl.id;
                return (
                  <TouchableOpacity
                    key={lvl.id}
                    activeOpacity={0.8}
                    style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                    onPress={() => setSelectedLevel(lvl.id)}
                  >
                    <View style={styles.optionHeader}>
                      <Text style={[styles.optionTitle, isSelected && styles.textSelected]}>
                        {lvl.title}
                      </Text>
                      {isSelected ? (
                        <CheckCircle2 size={20} color={Colors.primary} />
                      ) : (
                        <Circle size={20} color={Colors.textMuted} />
                      )}
                    </View>
                    <Text style={styles.optionDesc}>{lvl.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* KROK 3: DOLEGLIWOŚCI I CELE */}
        {currentStep === 3 && (
          <View>
            <Text style={styles.stepTitle}>{t('quiz.step3Title')}</Text>
            <Text style={styles.stepSubtitle}>{t('quiz.step3Subtitle')}</Text>

            <View style={styles.listContainer}>
              {goalsList.map((g) => {
                const isSelected = selectedGoals.includes(g.id);
                return (
                  <TouchableOpacity
                    key={g.id}
                    activeOpacity={0.8}
                    style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                    onPress={() => toggleGoal(g.id)}
                  >
                    <View style={styles.optionHeader}>
                      <View style={styles.goalTitleRow}>
                        {g.icon}
                        <Text style={[styles.optionTitle, isSelected && styles.textSelected]}>
                          {g.title}
                        </Text>
                      </View>
                      {isSelected ? (
                        <CheckCircle2 size={20} color={Colors.primary} />
                      ) : (
                        <Circle size={20} color={Colors.textMuted} />
                      )}
                    </View>
                    <Text style={styles.optionDesc}>{g.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* KROK 4: PARAMETRY FIZYCZNE */}
        {currentStep === 4 && (
          <View>
            <Text style={styles.stepTitle}>{t('quiz.step4Title')}</Text>
            <Text style={styles.stepSubtitle}>{t('quiz.step4Subtitle')}</Text>

            <View style={styles.inputsContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('quiz.age')}</Text>
                <TextInput
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  placeholder="22"
                  placeholderTextColor={Colors.textMuted}
                  style={styles.textInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('quiz.height')}</Text>
                <TextInput
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  placeholder="194"
                  placeholderTextColor={Colors.textMuted}
                  style={styles.textInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('quiz.weight')}</Text>
                <TextInput
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  placeholder="85"
                  placeholderTextColor={Colors.textMuted}
                  style={styles.textInput}
                />
              </View>

              {/* Informacja o estymacji zasięgu stojąc */}
              <View style={styles.infoBox}>
                <Activity size={18} color={Colors.accentBlue} />
                <View style={styles.infoTextWrapper}>
                  <Text style={styles.infoTitle}>
                    Szacowany Zasięg Stojąc: {estimateStandingReach(parseFloat(height) || 190)} cm
                  </Text>
                  <Text style={styles.infoDesc}>{t('quiz.standingReachHelp')}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Dolny pasek nawigacyjny */}
      <View style={styles.footer}>
        <Button
          title={currentStep === 4 ? t('common.continue') : t('common.continue')}
          variant="primary"
          size="large"
          onPress={handleNext}
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
  progressBarBg: {
    height: 4,
    backgroundColor: Colors.cardBackground,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  listContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    borderRadius: 14,
    padding: 16,
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  textSelected: {
    color: Colors.primary,
  },
  optionDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  inputsContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    marginTop: 8,
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoTitle: {
    color: Colors.accentBlue,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  infoDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
});
