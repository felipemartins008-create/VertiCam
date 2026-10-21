import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Clock,
  Dumbbell,
  Target,
  ArrowRight,
  Flame,
  Award,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useApp } from '../context/AppContext';
import { WORKOUT_MODULES } from '../data/mockData';
import { t } from '../services/i18n';

export const WorkoutPlayerScreen: React.FC = () => {
  const { activeWorkoutModule, navigate } = useApp();

  const module = activeWorkoutModule || WORKOUT_MODULES[0];
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [currentSet, setCurrentSet] = useState<number>(1);
  const [isResting, setIsResting] = useState<boolean>(false);
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number>(45);
  const [isWorkoutCompleted, setIsWorkoutCompleted] = useState<boolean>(false);

  const currentExercise = module.exercises[currentExerciseIndex];

  // Obsługa automatycznego licznika odpoczynku
  useEffect(() => {
    let timer: any = null;
    if (isResting && restSecondsRemaining > 0) {
      timer = setInterval(() => {
        setRestSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isResting, restSecondsRemaining]);

  const handleCompleteSet = () => {
    if (currentSet < currentExercise.sets) {
      setCurrentSet(currentSet + 1);
      // Uruchomienie automatycznego odpoczynku
      setRestSecondsRemaining(currentExercise.restSeconds || 45);
      setIsResting(true);
    } else {
      // Ostatnia seria danego ćwiczenia
      handleNextExercise();
    }
  };

  const handleNextExercise = () => {
    setIsResting(false);
    if (currentExerciseIndex < module.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(1);
    } else {
      setIsWorkoutCompleted(true);
    }
  };

  const handleExitWorkout = () => {
    navigate('Dashboard');
  };

  if (isWorkoutCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.celebrationContainer}>
          <View style={styles.trophyCircle}>
            <Award size={64} color="#0F172A" />
          </View>
          <Text style={styles.celebrateTitle}>{t('workoutPlayer.workoutComplete')}</Text>
          <Text style={styles.celebrateSub}>{t('workoutPlayer.workoutCompleteSub')}</Text>

          <View style={styles.statsSummaryCard}>
            <Text style={styles.statsSummaryTitle}>Riepilogo Sessione:</Text>
            <Text style={styles.statsSummaryRow}>• Programma: {module.title}</Text>
            <Text style={styles.statsSummaryRow}>• Numero esercizi: {module.exercises.length}</Text>
            <Text style={styles.statsSummaryRow}>• Durata: ~{module.durationMinutes} min</Text>
            <Text style={styles.statsSummaryRow}>• Salvato con successo nel tuo profilo</Text>
          </View>

          <Button
            title={t('workoutPlayer.saveAndExit')}
            variant="primary"
            size="large"
            onPress={handleExitWorkout}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        showBack
        onBack={handleExitWorkout}
        title={module.title}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Pętla wideo/animacji ćwiczenia na górze ekranu */}
        <View style={styles.videoPlayerContainer}>
          <Image
            source={{ uri: currentExercise.videoThumb }}
            style={styles.videoPlaceholder}
            resizeMode="cover"
          />
          <View style={styles.videoBadgeOverlay}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>VIDEO HD • LOOP</Text>
            </View>
          </View>
        </View>

        {/* Informacje o ćwiczeniu */}
        <View style={styles.exerciseHeader}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>
              Esercizio {currentExerciseIndex + 1} di {module.exercises.length}
            </Text>
          </View>

          <Text style={styles.polishName}>{currentExercise.polishName}</Text>
          <Text style={styles.englishName}>{currentExercise.name}</Text>
        </View>

        {/* Parametry treningowe: Serie, Powtórzenia, Ciężar */}
        <View style={styles.paramsGrid}>
          <View style={styles.paramBox}>
            <Text style={styles.paramLabel}>SERIE</Text>
            <Text style={styles.paramValue}>
              {currentSet} / {currentExercise.sets}
            </Text>
          </View>

          <View style={styles.paramBox}>
            <Text style={styles.paramLabel}>RIPETIZIONI</Text>
            <Text style={styles.paramValue}>{currentExercise.reps}</Text>
          </View>

          <View style={styles.paramBox}>
            <Text style={styles.paramLabel}>CARICO</Text>
            <Text style={styles.paramValueSmall}>{currentExercise.suggestedWeight}</Text>
          </View>
        </View>

        {/* Akcent i cel ćwiczenia */}
        <View style={styles.focusBox}>
          <Target size={16} color={Colors.primary} />
          <Text style={styles.focusText}>
            Focus: <Text style={styles.focusHighlight}>{currentExercise.targetFocus}</Text>
          </Text>
        </View>

        {/* Instrukcje wykonania */}
        <Card style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Istruzioni del coach:</Text>
          {currentExercise.instructions.map((inst, i) => (
            <View key={i} style={styles.instructionRow}>
              <Text style={styles.instructionBullet}>•</Text>
              <Text style={styles.instructionText}>{inst}</Text>
            </View>
          ))}
        </Card>

        {/* Modal / Nakładka licznika odpoczynku */}
        {isResting && (
          <Card style={styles.restCard} highlighted>
            <View style={styles.restHeader}>
              <Clock size={20} color={Colors.primary} />
              <Text style={styles.restTitle}>{t('workoutPlayer.restTimer')}</Text>
            </View>

            <Text style={styles.restBigSeconds}>{restSecondsRemaining}s</Text>

            <View style={styles.restActions}>
              <TouchableOpacity
                onPress={() => setRestSecondsRemaining(prev => prev + 15)}
                style={styles.addTimeBtn}
              >
                <Text style={styles.addTimeText}>+15s</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsResting(false)}
                style={styles.skipRestBtn}
              >
                <Text style={styles.skipRestText}>{t('workoutPlayer.skipRest')}</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Dolny przycisk zaliczenia serii / ćwiczenia */}
      <View style={styles.footer}>
        <Button
          title={
            currentSet < currentExercise.sets
              ? `${t('workoutPlayer.completeSet')} (${currentSet}/${currentExercise.sets})`
              : t('workoutPlayer.completeExercise')
          }
          variant="primary"
          size="large"
          onPress={handleCompleteSet}
          icon={<CheckCircle size={20} color="#0F172A" strokeWidth={2.5} />}
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
    paddingBottom: 40,
  },
  videoPlayerContainer: {
    width: '100%',
    height: 220,
    backgroundColor: '#000000',
    position: 'relative',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  videoBadgeOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
  },
  liveText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  exerciseHeader: {
    padding: 20,
    paddingBottom: 10,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  stepBadgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  polishName: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  englishName: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 2,
  },
  paramsGrid: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  paramBox: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  paramLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  paramValue: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  paramValueSmall: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 4,
  },
  focusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    marginBottom: 16,
  },
  focusText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  focusHighlight: {
    color: Colors.primary,
    fontWeight: '800',
  },
  instructionsCard: {
    marginHorizontal: 20,
    padding: 16,
    marginBottom: 16,
  },
  instructionsTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  instructionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  instructionBullet: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '900',
  },
  instructionText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  restCard: {
    marginHorizontal: 20,
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#0F172A',
  },
  restHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  restTitle: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  restBigSeconds: {
    fontSize: 54,
    fontWeight: '900',
    color: Colors.white,
    marginVertical: 4,
  },
  restActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  addTimeBtn: {
    backgroundColor: Colors.cardBackground,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  addTimeText: {
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  skipRestBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  skipRestText: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 13,
  },
  celebrationContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trophyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  celebrateTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  celebrateSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  statsSummaryCard: {
    width: '100%',
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 24,
    gap: 8,
  },
  statsSummaryTitle: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 15,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statsSummaryRow: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
});
